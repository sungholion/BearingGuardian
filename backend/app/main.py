from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ml  # 또는 from app.api import ml
import logging
import uvicorn

# ✅ FastAPI 인스턴스 선언 (한 번만!)
app = FastAPI(
    title="기계 고장 진단 API",
    description="CWRU 데이터셋 기반 Random Forest 분류 모델을 사용하여 WAV 파일의 고장 유형을 예측합니다.",
    version="1.0.0"
)

# ✅ CORS 설정 (React 개발 환경 포함)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # 프로덕션 배포 시 여기에 실제 도메인 추가
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ✅ ML 라우터 등록
app.include_router(ml.router, prefix="/api/v1/ml", tags=["Machine Learning Prediction"])

# ✅ 기본 엔드포인트
@app.get("/")
async def root():
    return {"message": "FastAPI 고장 진단 API가 실행 중입니다. /docs 에서 API 문서를 확인하세요."}

# ✅ 서버 실행 (main으로 실행될 때)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
