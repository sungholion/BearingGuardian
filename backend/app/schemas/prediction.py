"""
Prediction Schemas

예측 요청 및 응답을 위한 Pydantic 모델
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PredictionRequest(BaseModel):
    """베어링 고장 예측 요청 모델
    
    진동 데이터에서 추출된 13개 특성값을 입력받아 베어링의 고장 유형을 예측합니다.
    """
    mean: float
    stddev: float
    rms: float
    max: float
    min: float
    ptp: float
    skewness: float
    kurtosis: float
    crest_factor: float
    freq_mean: float
    freq_stddev: float
    freq_centroid: float
    freq_bandwidth: float

class PredictionResponse(BaseModel):
    prediction_id: Optional[int] = None
    predicted_label: str
    confidence: float
    probabilities: List[Dict[str, Any]]
    features: Dict[str, float]
    prediction_time: Optional[str] = None

class PredictionHistory(BaseModel):
    total_count: int
    predictions: List[Dict[str, Any]] 