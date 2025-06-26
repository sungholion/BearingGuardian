"""
Statistics API Endpoints

예측 통계 조회 관련 API 엔드포인트
"""

from fastapi import APIRouter, Depends, HTTPException, status
from ...modules.database.repository import VibrationRepository
from ...modules.database.connection import get_db_manager
from ...schemas.statistics import StatisticsResponse

router = APIRouter()

def get_repository() -> VibrationRepository:
    db = get_db_manager().get_session()
    return VibrationRepository(db)

@router.get("/", response_model=StatisticsResponse)
async def get_statistics(repository: VibrationRepository = Depends(get_repository)) -> StatisticsResponse:
    """
    예측 통계 정보 조회
    """
    try:
        stats = repository.get_prediction_stats()
        return StatisticsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"통계 조회 실패: {str(e)}") 