"""
Health API Endpoints

헬스체크 관련 API 엔드포인트
"""

from fastapi import APIRouter
from ...schemas.health import HealthResponse
from ...config.settings import settings

router = APIRouter()

@router.get("/", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    헬스체크 엔드포인트
    """
    return HealthResponse(
        status="healthy",
        app_name=settings.app_name,
        version=settings.app_version
    ) 