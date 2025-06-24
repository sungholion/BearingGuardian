# schemas.py

from pydantic import BaseModel
from typing import List

from datetime import datetime
from pydantic import BaseModel

class PredictionHistory(BaseModel):
    id: int
    predicted_fault: str
    predicted_time: datetime
    features: dict

class Probability(BaseModel):
    fault_type: str  # ← 여기가 핵심. 문자열이어야 함!
    probability: float


class PredictionResponse(BaseModel):
    predicted_label: str
    sampling_rate: int
    extracted_feature_shape: List[int]
    probabilities: List[Probability]
    preprocessed_csv_data: str  # CSV raw 텍스트 포함

