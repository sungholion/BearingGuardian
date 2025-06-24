from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from app.api import ml

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="기계 고장 진단 API",
    description="CWRU 데이터셋 기반 Random Forest 분류 모델을 사용하여 WAV 파일의 고장 유형을 예측합니다.",
    version="1.0.0"
)

# CORS 설정 (React 프론트엔드와 통신을 위해 필수)
origins = [
    "http://localhost:3000", # React 개발 서버 주소
    "http://127.0.0.1:3000",
    # 프로덕션 환경에서는 React 앱의 실제 도메인을 추가
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 포함
app.include_router(ml.router, prefix="/api/v1/ml", tags=["Machine Learning Prediction"])

@app.get("/")
async def root():
    return {"message": "FastAPI 고장 진단 API가 실행 중입니다. /docs 에서 API 문서를 확인하세요."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)