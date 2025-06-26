"""
API Routes Module

모든 API 엔드포인트를 통합하는 메인 라우터
"""

from fastapi import APIRouter

from .endpoints import prediction, upload, statistics, health

# 메인 API 라우터
api_router = APIRouter()

# 하위 라우터들 등록
api_router.include_router(prediction.router, prefix="/prediction", tags=["prediction"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["statistics"])
api_router.include_router(health.router, prefix="/health", tags=["health"])