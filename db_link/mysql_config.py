import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

class MySQLConfig:
    """MySQL 데이터베이스 연결 설정"""
    
    def __init__(self):
        # MySQL 연결 정보
        self.host = "localhost"
        self.port = "3306"
        self.username = "bearing"
        self.password = "bear1234!"
        self.database = "bearing_db"
    
    @property
    def database_url(self) -> str:
        """MySQL 연결 URL 생성 (charset은 URL에 포함)"""
        return f"mysql+pymysql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}?charset=utf8mb4"
    
    def create_engine(self):
        """SQLAlchemy MySQL 엔진 생성 (charset 인자 제거)"""
        return create_engine(
            self.database_url,
            echo=True,  # SQL 쿼리 로그 출력
            pool_pre_ping=True,  # 연결 상태 확인
            pool_recycle=3600  # 1시간마다 연결 재생성
        )

# MySQL 설정 인스턴스
mysql_config = MySQLConfig()

# SQLAlchemy 설정
engine = mysql_config.create_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """데이터베이스 세션 생성 함수"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_mysql_connection():
    """MySQL 연결 테스트"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ MySQL 연결 성공!")
            return True
    except Exception as e:
        print(f"❌ MySQL 연결 실패: {e}")
        return False

if __name__ == "__main__":
    # MySQL 연결 테스트 실행
    test_mysql_connection() 