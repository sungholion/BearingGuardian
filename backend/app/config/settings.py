"""
Application Settings Module

This module provides general application configuration settings.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """애플리케이션 전체 설정"""
    
    # 애플리케이션 정보
    app_name: str = "BearingGuardian"
    app_version: str = "1.0.0" # 첫 번째 버전
    debug: bool = True # 개발 중 : True, 배포 중 : False
    
    # API 설정
    api_prefix: str = "/api/v1"
    cors_origins: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # 로깅 설정
    log_level: str = "INFO"
    # log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    log_format: str = "%(asctime)s [%(levelname)s] %(filename)s:%(lineno)d (%(funcName)s) - %(message)s"
    # 파일 업로드 설정
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    allowed_file_types: list = [".wav", ".csv"]
    
    # 모델 설정
    model_dir: str = "app/models"
    
    # 환경변수에서 설정 로드
    class Config:
        env_prefix = "APP_"
        env_file = ".env"
    
    def get_model_path(self, filename: str) -> str:
        """
        모델 파일 경로 반환
        
        Args:
            filename: 모델 파일명
            
        Returns:
            str: 모델 파일 전체 경로
        """
        return os.path.join(self.model_dir, filename)


# 기본 설정 인스턴스
settings = Settings() 