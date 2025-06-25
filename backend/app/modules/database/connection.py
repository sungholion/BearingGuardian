"""
Database Connection Module

This module provides database connection management using SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import logging
from typing import Generator
from sqlalchemy import text

from ...config.database import db_config

logger = logging.getLogger(__name__)

# SQLAlchemy Base 클래스
Base = declarative_base()


class DatabaseManager:
    """데이터베이스 연결 관리자"""
    
    def __init__(self):
        """데이터베이스 매니저 초기화"""
        self.engine = None
        self.SessionLocal = None
        self._initialize_engine()
    
    def _initialize_engine(self):
        """SQLAlchemy 엔진 초기화"""
        try:
            # 연결 문자열 생성
            connection_string = db_config.connection_string
            
            # 엔진 생성 (연결 풀 설정 포함)
            self.engine = create_engine(
                connection_string,
                poolclass=QueuePool,
                pool_size=db_config.pool_size,
                max_overflow=db_config.max_overflow,
                pool_timeout=db_config.pool_timeout,
                pool_recycle=db_config.pool_recycle,
                echo=False,  # SQL 로그 출력 여부
                pool_pre_ping=True  # 연결 유효성 검사
            )
            
            # 세션 팩토리 생성
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )
            
            logger.info("데이터베이스 엔진 초기화 완료")
            
        except Exception as e:
            logger.error(f"데이터베이스 엔진 초기화 실패: {e}")
            raise
    
    def get_session(self) -> Session:
        """
        데이터베이스 세션 반환
        
        Returns:
            Session: SQLAlchemy 세션
        """
        if self.SessionLocal is None:
            self._initialize_engine()
        
        return self.SessionLocal()
    
    def create_tables(self):
        """모든 테이블 생성"""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("데이터베이스 테이블 생성 완료")
        except Exception as e:
            logger.error(f"테이블 생성 실패: {e}")
            raise
    
    def drop_tables(self):
        """모든 테이블 삭제"""
        try:
            Base.metadata.drop_all(bind=self.engine)
            logger.info("데이터베이스 테이블 삭제 완료")
        except Exception as e:
            logger.error(f"테이블 삭제 실패: {e}")
            raise
    
    def test_connection(self) -> bool:
        """
        데이터베이스 연결 테스트
        
        Returns:
            bool: 연결 성공 여부
        """
        try:
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            logger.info("데이터베이스 연결 테스트 성공")
            return True
        except Exception as e:
            logger.error(f"데이터베이스 연결 테스트 실패: {e}")
            return False


# 전역 데이터베이스 매니저 인스턴스
db_manager = DatabaseManager()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI 의존성 주입용 데이터베이스 세션 생성기
    
    Yields:
        Session: 데이터베이스 세션
    """
    db = db_manager.get_session()
    try:
        yield db
    except Exception as e:
        logger.error(f"데이터베이스 세션 오류: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def get_db_manager() -> DatabaseManager:
    """
    데이터베이스 매니저 인스턴스 반환
    
    Returns:
        DatabaseManager: 데이터베이스 매니저
    """
    return db_manager 