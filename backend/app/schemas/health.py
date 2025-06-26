"""
Health Schemas

헬스체크 응답을 위한 Pydantic 모델
"""

from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str 