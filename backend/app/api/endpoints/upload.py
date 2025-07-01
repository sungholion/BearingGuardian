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
        # 파일 존재 확인
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="파일이 선택되지 않았습니다."
            )
        
        # 파일 형식 확인
        if not file.filename.lower().endswith('.wav'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="WAV 파일만 업로드 가능합니다."
            )
        
        # 파일 크기 확인 (50MB 제한)
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:  # 50MB
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="파일 크기가 50MB를 초과합니다."
            )
        
        # 파일 처리
        preprocessor = WAVPreprocessor()
        signal, sampling_rate, features = preprocessor.process_uploaded_file(content, file.filename)
        
        return UploadResponse(
            filename=file.filename,
            sampling_rate=sampling_rate,
            features=features,
            message="WAV 파일 업로드 및 피처 추출 성공"
        )
        
    except HTTPException:
        # 이미 HTTPException이 발생한 경우 그대로 재발생
        raise
    except ValueError as e:
        # 값 오류 (예: 잘못된 WAV 파일)
        logger.error(f"WAV 파일 처리 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"파일 처리 오류: {str(e)}"
        )
    except Exception as e:
        # 기타 예상치 못한 오류
        logger.error(f"WAV 파일 업로드 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        ) 