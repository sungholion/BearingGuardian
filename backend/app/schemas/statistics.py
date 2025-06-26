"""
Statistics Schemas

통계 요청 및 응답을 위한 Pydantic 모델
"""

from pydantic import BaseModel
from typing import Dict, Any

class StatisticsResponse(BaseModel):
    total_predictions: int
    fault_type_counts: Dict[str, int] 