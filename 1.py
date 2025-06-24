# dump_and_load_db.py

import subprocess
import os
from dotenv import load_dotenv

# --- 1. 환경 변수 로드 및 설정 ---
load_dotenv()

# .env 파일에서 DB 정보 가져오기
# MySQL root 또는 DB 생성/삭제 권한이 있는 관리자 계정 정보
DATABASE_URL_ADMIN = os.getenv("DATABASE_URL_ADMIN", "mysql+pymysql://root:0000@localhost")

# MySQL 연결 정보 파싱
# (이 스크립트에서는 root 사용자 정보만 필요합니다)
# 예: "mysql+pymysql://root:password@localhost" -> user='root', password='password', host='localhost'
try:
    from urllib.parse import urlparse
    parsed_url = urlparse(DATABASE_URL_ADMIN)
    MYSQL_USER = parsed_url.username
    MYSQL_PASSWORD = parsed_url.password
    MYSQL_HOST = parsed_url.hostname
except ImportError:
    # Python 2.x 호환성을 위해 (필요한 경우만)
    import urlparse
    parsed_url = urlparse.urlparse(DATABASE_URL_ADMIN)
    MYSQL_USER = parsed_url.username
    MYSQL_PASSWORD = parsed_url.password
    MYSQL_HOST = parsed_url.hostname

TARGET_DB_NAME = "bearing_db"
TARGET_DB_USER = "bear" # MakeTableForSemi.sql에서 생성될 사용자
TARGET_DB_PASSWORD = "bear1234!" # MakeTableForSemi.sql에서 생성될 비밀번호

# SQL 덤프 파일 경로 (스크립트 실행 위치 기준 상대 경로)
# 이 스크립트 파일과 같은 레벨에 'sql_dumps' 폴더가 있고 그 안에 SQL 파일들이 있다고 가정합니다.
# 예: your_project_root/sql_dumps/bearing_db_vibration_raw.sql
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SQL_DUMPS_DIR = os.path.join(SCRIPT_DIR, 'sql_dumps') # 'sql_dumps' 폴더 생성 가정

SQL_FILES = [
    os.path.join(SQL_DUMPS_DIR, 'bearing_db_vibration_raw.sql'),
    os.path.join(SQL_DUMPS_DIR, 'bearing_db_vibration_preprocessed.sql'),
    os.path.join(SQL_DUMPS_DIR, 'bearing_db_vibration_stats.sql'),
    os.path.join(SQL_DUMPS_DIR, 'bearing_db_vibration_input.sql')
]
# MakeTableForSemi.sql 내용 중 CREATE DATABASE, CREATE USER, GRANT 부분만
# 별도로 실행할 필요가 있으므로, 그 내용을 여기에 직접 작성합니다.
# 이는 CSV 로드 시의 SQL 쿼리를 파이썬으로 실행하는 것과 유사합니다.

# 이 부분은 MakeTableForSemi.sql에서 발췌하여 직접 파이썬에서 실행할 SQL 명령입니다.
# MySQL dump 파일에는 이미 USE `bearing_db`; 가 포함되어 있으므로,
# DB 삭제 및 생성, 사용자 권한 부여만 별도로 처리합니다.
INITIAL_SETUP_SQL = f"""
DROP DATABASE IF EXISTS `{TARGET_DB_NAME}`;
CREATE DATABASE `{TARGET_DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DROP USER IF EXISTS '{TARGET_DB_USER}'@'localhost';
CREATE USER IF NOT EXISTS '{TARGET_DB_USER}'@'localhost' IDENTIFIED BY '{TARGET_DB_PASSWORD}';
GRANT ALL PRIVILEGES ON `{TARGET_DB_NAME}`.* TO '{TARGET_DB_USER}'@'localhost';
FLUSH PRIVILEGES;
"""

def execute_sql_command(sql_command: str, user: str, password: str, host: str, db_name: str = None):
    """
    주어진 SQL 명령을 MySQL 서버에 실행합니다.
    """
    cmd = ["mysql", f"-u{user}", f"-p{password}", f"-h{host}"]
    if db_name:
        cmd.append(db_name)
    
    print(f"Executing MySQL command: {' '.join(cmd[:-1])} {'-D ' + db_name if db_name else ''} ...")
    try:
        process = subprocess.run(cmd, input=sql_command.encode('utf-8'), check=True, capture_output=True)
        print("STDOUT:", process.stdout.decode('utf-8'))
        if process.stderr:
            print("STDERR:", process.stderr.decode('utf-8'))
        print("Command executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error executing SQL command: {e}")
        print("STDOUT:", e.stdout.decode('utf-8'))
        print("STDERR:", e.stderr.decode('utf-8'))
        raise
    except FileNotFoundError:
        print("Error: 'mysql' command not found. Please ensure MySQL client is installed and in your PATH.")
        print("Alternatively, set the MYSQL_PATH environment variable to the directory containing mysql.exe.")
        raise

def dump_sql_file(file_path: str, user: str, password: str, host: str, db_name: str):
    """
    SQL 덤프 파일을 MySQL 서버에 덤프합니다.
    """
    if not os.path.exists(file_path):
        print(f"Error: SQL dump file not found at {file_path}")
        return False
        
    cmd = ["mysql", f"-u{user}", f"-p{password}", f"-h{host}", db_name]
    
    print(f"Dumping SQL file: {file_path} to database {db_name}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            process = subprocess.run(cmd, stdin=f, check=True, capture_output=True)
            print(f"Successfully dumped {file_path}.")
            if process.stderr:
                 print("STDERR (possibly warnings):", process.stderr.decode('utf-8'))
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error dumping SQL file {file_path}: {e}")
        print("STDOUT:", e.stdout.decode('utf-8'))
        print("STDERR:", e.stderr.decode('utf-8'))
        return False
    except FileNotFoundError:
        print("Error: 'mysql' command not found. Please ensure MySQL client is installed and in your PATH.")
        print("Alternatively, set the MYSQL_PATH environment variable to the directory containing mysql.exe.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred while dumping {file_path}: {e}")
        return False

if __name__ == "__main__":
    print("Starting database dump and load script...")
    try:
        # 1. 데이터베이스 삭제, 생성 및 사용자 권한 설정
        print("\n--- Phase 1: Database Initialization and User Setup ---")
        execute_sql_command(INITIAL_SETUP_SQL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST)
        print(f"Database '{TARGET_DB_NAME}' created and user '{TARGET_DB_USER}' configured.")

        # 2. SQL 덤프 파일들을 순서대로 실행하여 데이터 로드
        print("\n--- Phase 2: Loading Data from SQL Dump Files ---")
        for sql_file in SQL_FILES:
            success = dump_sql_file(sql_file, TARGET_DB_USER, TARGET_DB_PASSWORD, MYSQL_HOST, TARGET_DB_NAME)
            if not success:
                print(f"Aborting due to error in {sql_file}")
                exit(1) # 오류 발생 시 스크립트 종료

        print("\nDatabase initialization and data loading completed successfully!")

    except Exception as main_e:
        print(f"\nScript execution failed: {main_e}")
        print("Please check the error messages above for details.")
        print("Ensure MySQL server is running and the 'root' (admin) user credentials in .env are correct.")
        print("Also, ensure 'mysql' command is accessible in your system's PATH, or configure MYSQL_PATH environment variable.")

