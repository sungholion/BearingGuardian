"""
Prediction Schemas

예측 요청 및 응답을 위한 Pydantic 모델
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PredictionRequest(BaseModel):
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