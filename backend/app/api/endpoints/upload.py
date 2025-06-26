"""
Upload API Endpoints

WAV 파일 업로드 및 피처 추출 관련 API 엔드포인트
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Any
import logging

from ...modules.preprocessor.wav_preprocessor import WAVPreprocessor
from ...schemas.upload import UploadResponse

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/wav", response_model=UploadResponse)
async def upload_wav_file(file: UploadFile = File(...)) -> UploadResponse:
    """
    WAV 파일 업로드 및 피처 추출
    """
    try:
        if not file.filename or not file.filename.lower().endswith('.wav'):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WAV 파일만 업로드 가능합니다.")
        
        content = await file.read()
        preprocessor = WAVPreprocessor()
        signal, sampling_rate, features = preprocessor.process_uploaded_file(content, file.filename)
        
        return UploadResponse(
            filename=file.filename,
            sampling_rate=sampling_rate,
            features=features,
            message="WAV 파일 업로드 및 피처 추출 성공"
        )
    except Exception as e:
        logger.error(f"WAV 파일 업로드 실패: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"업로드 실패: {str(e)}") 