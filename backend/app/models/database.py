# init_db_and_load_data.py

import pandas as pd
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, ForeignKey, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

# --- 1. 환경 변수 로드 및 설정 ---
load_dotenv()

# .env 파일에서 DB 정보 가져오기
# 일반 사용자 계정 (bearing_db에 연결)
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://bear:bear1234!@localhost/bearing_db")
# 관리자 계정 (데이터베이스 삭제/생성 권한 필요) - 반드시 실제 MySQL root 비밀번호로 변경하세요!
DATABASE_URL_ADMIN = os.getenv("DATABASE_URL_ADMIN", "mysql+pymysql://root:0000@localhost")

TARGET_DB_NAME = "bearing_db"
TARGET_DB_USER = "bear"
TARGET_DB_PASSWORD = "bear1234!" # !가 문제될 수 있으므로, 가능하다면 특수문자 없이 bear1234 로 변경 추천

# CSV 파일 경로 (스크립트 실행 위치 기준 상대 경로)
# 이 스크립트 파일과 같은 레벨에 'data' 폴더가 있고 그 안에 CSV 파일들이 있다고 가정합니다.
# 예: your_project_root/data/feature_time_48k_2048_load_1.csv
# 예: your_project_root/data/realistic_noisy_features_with_labels.csv
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, 'data') # 'data' 폴더가 스크립트와 같은 레벨에 있다면

RAW_DATA_PATH = os.path.join(DATA_DIR, 'feature_time_48k_2048_load_1.csv')
PREPROCESSED_DATA_PATH = os.path.join(DATA_DIR, 'realistic_noisy_features_with_labels.csv')

# --- 2. SQLAlchemy ORM 기본 설정 ---
Base = declarative_base() # ORM 모델의 베이스 클래스

# --- 3. SQLAlchemy ORM 모델 정의 ---
# MakeTableForSemi.sql 내용을 기반으로 ORM 모델을 정의합니다.
class VibrationRaw(Base):
    __tablename__ = "vibration_raw"
    id = Column(Integer, primary_key=True, index=True)
    max = Column(Float)
    min = Column(Float)
    mean = Column(Float)
    sd = Column(Float)
    rms = Column(Float)
    skewness = Column(Float)
    kurtosis = Column(Float)
    crest = Column(Float)
    form = Column(Float)
    fault = Column(String(50))

class VibrationPreprocessed(Base):
    __tablename__ = "vibration_preprocessed"
    id = Column(Integer, primary_key=True, index=True)
    mean = Column(Float)
    stddev = Column(Float)
    rms = Column(Float)
    max = Column(Float)
    min = Column(Float)
    ptp = Column(Float)
    skewness = Column(Float)
    kurtosis = Column(Float)
    crest_factor = Column(Float)
    freq_mean = Column(Float)
    freq_stddev = Column(Float)
    freq_centroid = Column(Float)
    freq_bandwidth = Column(Float)
    label = Column(String(50))

class VibrationInput(Base):
    __tablename__ = "vibration_input"
    id = Column(Integer, primary_key=True, index=True)
    mean = Column(Float)
    stddev = Column(Float)
    rms = Column(Float)
    max = Column(Float)
    min = Column(Float)
    ptp = Column(Float)
    skewness = Column(Float)
    kurtosis = Column(Float)
    crest_factor = Column(Float)
    freq_mean = Column(Float)
    freq_stddev = Column(Float)
    freq_centroid = Column(Float)
    freq_bandwidth = Column(Float)
    result = relationship("VibrationResult", back_populates="input_data", uselist=False)

class VibrationResult(Base):
    __tablename__ = "vibration_result"
    id = Column(Integer, primary_key=True, index=True)
    input_id = Column(Integer, ForeignKey("vibration_input.id"), unique=True)
    predicted_fault = Column(String(50))
    predicted_time = Column(DateTime, server_default=func.now())
    input_data = relationship("VibrationInput", back_populates="result")

class VibrationStats(Base):
    __tablename__ = "vibration_stats"
    stat_time = Column(DateTime, primary_key=True, server_default=func.now())
    total_count = Column(Integer)
    normal_count = Column(Integer)
    fault_count = Column(Integer)
    ball_fault_count = Column(Integer)
    ir_fault_count = Column(Integer)
    or_fault_count = Column(Integer)

# --- 4. DB 연결 엔진 및 세션 팩토리 생성 ---
# 이 엔진은 bearing_db에 직접 연결됩니다.
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- 5. 핵심 함수 정의 ---

def initialize_db_and_user():
    """데이터베이스를 삭제하고 새로 생성하며, 사용자 권한을 설정합니다."""
    print(f"Connecting to MySQL as admin to initialize database...")
    # 관리자 권한으로 DB 연결 (DB 생성/삭제 위함)
    admin_engine = create_engine(DATABASE_URL_ADMIN)
    admin_conn = None
    try:
        admin_conn = admin_engine.connect()
        admin_conn.execution_options(isolation_level="AUTOCOMMIT") # DDL 문 실행을 위해 AUTOCOMMIT 설정

        # 1. 기존 DB 삭제
        print(f"Dropping database '{TARGET_DB_NAME}' if it exists...")
        admin_conn.execute(text(f"DROP DATABASE IF EXISTS {TARGET_DB_NAME};"))

        # 2. DB 새로 생성
        print(f"Creating database '{TARGET_DB_NAME}'...")
        admin_conn.execute(text(f"CREATE DATABASE {TARGET_DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"))

        # 3. 사용자 생성 및 권한 부여
        print(f"Creating user '{TARGET_DB_USER}' and granting privileges...")
        # 기존 사용자 삭제 (만약을 위해)
        admin_conn.execute(text(f"DROP USER IF EXISTS '{TARGET_DB_USER}'@'localhost';"))
        admin_conn.execute(text(f"CREATE USER IF NOT EXISTS '{TARGET_DB_USER}'@'localhost' IDENTIFIED BY '{TARGET_DB_PASSWORD}';"))
        admin_conn.execute(text(f"GRANT ALL PRIVILEGES ON {TARGET_DB_NAME}.* TO '{TARGET_DB_USER}'@'localhost';"))
        admin_conn.execute(text("FLUSH PRIVILEGES;"))
        print("Database initialization and user setup complete.")

    except Exception as e:
        print(f"Error during database initialization: {e}")
        print("Please ensure MySQL server is running and the ADMIN user (root) credentials are correct and have necessary permissions.")
        raise
    finally:
        if admin_conn:
            admin_conn.close()
    
    # DB 초기화 후, 일반 사용자 권한으로 engine을 다시 연결
    global engine, SessionLocal
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables_from_models():
    """정의된 ORM 모델에 따라 테이블을 생성합니다."""
    print("Creating tables based on ORM models...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

def load_csv_to_db(db: Session, file_path: str, model_class, chunksize: int = 1000):
    """CSV 파일을 읽어 DB에 데이터를 로드합니다."""
    print(f"Loading data from {file_path} to {model_class.__tablename__}...")
    try:
        if not os.path.exists(file_path):
            print(f"Error: File not found at {file_path}")
            return

        for i, chunk in enumerate(pd.read_csv(file_path, chunksize=chunksize)):
            chunk = chunk.where(pd.notna(chunk), None) # NaN 값을 None으로 변환

            # 컬럼명 매핑 로직 (CSV 헤더와 ORM 모델 필드명 일치시키기)
            if model_class == VibrationRaw:
                # 'feature_time_48k_2048_load_1.csv'의 예상 헤더와 ORM 모델 필드 매핑
                chunk.rename(columns={
                    'Max': 'max', 'Min': 'min', 'Mean': 'mean', 'SD': 'sd', 'RMS': 'rms',
                    'Skewness': 'skewness', 'Kurtosis': 'kurtosis', 'Crest': 'crest', 'Form': 'form',
                    'Fault': 'fault'
                }, inplace=True)
                # 실제 CSV에 없는 컬럼이나 순서가 다를 경우를 대비해 필요한 컬럼만 선택
                chunk = chunk[['max', 'min', 'mean', 'sd', 'rms', 'skewness', 'kurtosis', 'crest', 'form', 'fault']]

            elif model_class == VibrationPreprocessed:
                # 'realistic_noisy_features_with_labels.csv'의 예상 헤더와 ORM 모델 필드 매핑
                chunk.rename(columns={
                    'Mean': 'mean', 'StdDev': 'stddev', 'RMS': 'rms', 'Max': 'max', 'Min': 'min', 'PTP': 'ptp',
                    'Skewness': 'skewness', 'Kurtosis': 'kurtosis', 'CrestFactor': 'crest_factor',
                    'FreqMean': 'freq_mean', 'FreqStdDev': 'freq_stddev',
                    'SpectralCentroid': 'freq_centroid', 'SpectralBandwidth': 'freq_bandwidth',
                    'Label': 'label'
                }, inplace=True)
                # 필요한 컬럼만 선택
                chunk = chunk[['mean', 'stddev', 'rms', 'max', 'min', 'ptp', 'skewness', 'kurtosis', 'crest_factor', 'freq_mean', 'freq_stddev', 'freq_centroid', 'freq_bandwidth', 'label']]

            records = chunk.to_dict(orient='records')
            db.bulk_insert_mappings(model_class, records)
            db.commit()
            print(f"  Processed chunk {i+1} ({len(records)} rows)")

        print(f"Successfully loaded data into {model_class.__tablename__}.")

    except Exception as e:
        db.rollback()
        print(f"Error loading data to {model_class.__tablename__}: {e}")
        # 오류 발생 시 CSV 컬럼과 DB 모델 컬럼 매핑 문제일 가능성이 높습니다.
        # print(chunk.columns) 등을 추가하여 디버깅할 수 있습니다.
        raise # 예외를 다시 발생시켜 스크립트가 중단되도록 함

# --- 6. 메인 실행 로직 ---
if __name__ == "__main__":
    print("Starting database initialization and data loading script...")
    try:
        # 1. 데이터베이스 초기화 (삭제 및 재생성, 사용자 권한 설정)
        initialize_db_and_user()

        # 2. DB 테이블 생성 (새로 생성된 bearing_db에)
        create_tables_from_models()

        # 3. CSV 데이터 로드
        db_session = SessionLocal() # 새로 생성된 DB에 연결할 세션
        try:
            print(f"Looking for raw data at: {RAW_DATA_PATH}")
            load_csv_to_db(db_session, RAW_DATA_PATH, VibrationRaw)

            print(f"Looking for preprocessed data at: {PREPROCESSED_DATA_PATH}")
            load_csv_to_db(db_session, PREPROCESSED_DATA_PATH, VibrationPreprocessed)

        finally:
            db_session.close()
        print("\nDatabase initialization and data loading completed successfully!")

    except Exception as main_e:
        print(f"\nScript execution failed: {main_e}")
        print("Please check the error messages above for details.")

