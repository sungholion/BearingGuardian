"""
Database Configuration Module

This module provides database connection configuration.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class DatabaseConfig(BaseSettings):
    """데이터베이스 연결 설정"""
    
    # MySQL 연결 정보
    host: str = "localhost"
    port: int = 3306
    database: str = "bearing_db"
    username: str = "bearing"
    password: str = "bear1234!"
    
    # 연결 풀 설정
    pool_size: int = 10
    max_overflow: int = 20
    pool_timeout: int = 30
    pool_recycle: int = 3600
    
    # 환경변수에서 설정 로드 (선택사항)
    class Config:
        env_prefix = "DB_"
        env_file = ".env"
    
    @property
    def connection_string(self) -> str:
        """SQLAlchemy 연결 문자열 생성"""
        # MySQL 8.0+ 인증 문제 해결을 위한 파라미터 추가
        return f"mysql+pymysql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}?charset=utf8mb4"
    
    @property
    def async_connection_string(self) -> str:
        """비동기 SQLAlchemy 연결 문자열 생성"""
        # MySQL 8.0+ 인증 문제 해결을 위한 파라미터 추가
        return f"mysql+aiomysql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}?charset=utf8mb4"
    
    def get_connection_string(self, async_mode: bool = False) -> str:
        """
        연결 문자열 반환
        
        Args:
            async_mode: 비동기 모드 여부
            
        Returns:
            str: 연결 문자열
        """
        if async_mode:
            return self.async_connection_string
        return self.connection_string


# 기본 설정 인스턴스
db_config = DatabaseConfig() 