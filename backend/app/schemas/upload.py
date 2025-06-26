"""
Upload Schemas

파일 업로드 및 WAV 전처리 관련 Pydantic 모델
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class UploadResponse(BaseModel):
    filename: str
    sampling_rate: int
    features: Dict[str, float]
    message: Optional[str] = None 