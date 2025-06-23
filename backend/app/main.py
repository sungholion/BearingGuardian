from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware  # CORS 미들웨어 임포트
import pandas as pd
import numpy as np
import joblib
import os
from contextlib import asynccontextmanager

# 현재 파일의 경로를 기준으로 모델 파일의 절대 경로를 계산합니다.
# 이렇게 하면 어떤 위치에서 서버를 실행하더라도 모델 파일을 찾을 수 있습니다.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "best_xgb_model_and_encoder.pkl")
WAV_PROCESSOR_PATH = os.path.join(BASE_DIR, "core", "wav_processor.py")

# wav_processor를 동적으로 로드하기 위한 준비
# (프로젝트 구조상 wav_processor.py는 core 폴더에 위치해야 합니다)
import sys
sys.path.append(os.path.join(BASE_DIR, "..")) # app 폴더의 상위 폴더를 경로에 추가
from app.core.wav_processor import WavFeatureExtractor


# --- 모델 및 기타 자산을 로드하기 위한 전역 변수 ---
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 앱 시작 시 모델 로드
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {MODEL_PATH}")
    
    model, label_encoder = joblib.load(MODEL_PATH)
    ml_models["model"] = model
    ml_models["label_encoder"] = label_encoder
    ml_models["wav_extractor"] = WavFeatureExtractor()
    print("✅ 모델 및 WAV 처리기 로드 완료")
    yield
    # 앱 종료 시 자원 해제
    ml_models.clear()
    print("☑️ 모델 및 자원 해제 완료")

app = FastAPI(lifespan=lifespan)

# --- CORS 미들웨어 설정 ---
# 모든 출처에서의 요청을 허용합니다. (개발 환경용)
# 프로덕션 환경에서는 allow_origins를 프론트엔드 도메인으로 제한해야 합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

# --- API 엔드포인트 ---

@app.get("/", summary="서버 상태 확인")
async def read_root():
    """서버가 정상적으로 실행 중인지 확인하는 기본 엔드포인트입니다."""
    return {"message": "베어링 고장 예측 API 서버가 실행 중입니다."}

@app.post("/predict/wav", summary="WAV 파일로 고장 예측")
async def predict_wav(file: UploadFile = File(...)):
    """
    WAV 파일을 업로드하여 베어링의 고장 유형을 예측합니다.
    
    - **file**: 예측할 오디오 데이터 (.wav 형식)
    """
    if not file.filename.endswith('.wav'):
        raise HTTPException(status_code=400, detail="WAV 파일만 업로드할 수 있습니다.")

    try:
        # 업로드된 파일의 바이트 읽기
        wav_bytes = await file.read()

        # WavFeatureExtractor를 사용하여 특징 추출
        extractor = ml_models["wav_extractor"]
        features_df = extractor.process_wav_bytes(wav_bytes)

        # 예측에 필요한 컬럼만 선택
        feature_columns_order = ['max', 'min', 'rms', 'kurtosis', 'crest', 'form']
        if not all(col in features_df.columns for col in feature_columns_order):
            raise HTTPException(status_code=400, detail=f"WAV 파일에서 필요한 특징을 추출하지 못했습니다. 필수 컬럼: {feature_columns_order}")

        X = features_df[feature_columns_order].values

        # 모델을 사용한 예측
        model = ml_models["model"]
        label_encoder = ml_models["label_encoder"]
        
        y_pred_encoded = model.predict(X)
        y_pred_labels = label_encoder.inverse_transform(y_pred_encoded)

        # 결과를 JSON으로 반환
        result_df = features_df[feature_columns_order].copy()
        result_df["predicted_fault"] = y_pred_labels
        
        return JSONResponse(content=result_df.to_dict(orient="records"))

    except Exception as e:
        # 상세한 오류 로깅
        print(f"오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"예측 중 오류가 발생했습니다: {str(e)}")

# 서버 실행을 위한 엔트리포인트 (uvicorn으로 직접 실행할 때 사용)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
