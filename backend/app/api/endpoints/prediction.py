"""
Prediction API Endpoints

베어링 고장 예측 관련 API 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import Dict, List, Any, Optional
import numpy as np
import logging
from datetime import datetime

from ...modules.predictor.predictor import Predictor
from ...modules.database.repository import VibrationRepository
from ...modules.database.connection import get_db_manager
from ...schemas.prediction import PredictionRequest, PredictionResponse, PredictionHistory

logger = logging.getLogger(__name__)

router = APIRouter()


def get_predictor() -> Predictor:
    """예측기 인스턴스 반환"""
    return Predictor()


def get_repository() -> VibrationRepository:
    """저장소 인스턴스 반환"""
    db = get_db_manager().get_session()
    return VibrationRepository(db)


@router.post("/predict", response_model=PredictionResponse)
async def predict_fault(
    request: PredictionRequest,
    predictor: Predictor = Depends(get_predictor),
    repository: VibrationRepository = Depends(get_repository)
) -> PredictionResponse:
    """
    🎯 **베어링 고장 예측**
    
    진동 데이터에서 추출된 13개 특성값을 입력받아 베어링의 고장 유형을 예측합니다.
    
    **입력 특성값:**
    - `mean`: 평균값
    - `stddev`: 표준편차
    - `rms`: RMS (Root Mean Square)
    - `max`: 최대값
    - `min`: 최소값
    - `ptp`: Peak-to-Peak
    - `skewness`: 왜도
    - `kurtosis`: 첨도
    - `crest_factor`: 크레스트 팩터
    - `freq_mean`: 주파수 평균
    - `freq_stddev`: 주파수 표준편차
    - `freq_centroid`: 주파수 중심
    - `freq_bandwidth`: 주파수 대역폭
    
    **예측 결과:**
    - 고장 유형 (정상/내륜/외륜/볼 고장)
    - 신뢰도 (0~1)
    - 각 고장 유형별 확률
    """
    try:
        # 피처를 numpy 배열로 변환
        features_array = np.array([
            request.mean, request.stddev, request.rms, request.max, request.min,
            request.ptp, request.skewness, request.kurtosis, request.crest_factor,
            request.freq_mean, request.freq_stddev, request.freq_centroid, request.freq_bandwidth
        ])
        
        # 예측 수행
        prediction_result = predictor.predict(features_array)
        
        # 결과를 데이터베이스에 저장
        features_dict = {
            "mean": request.mean, "stddev": request.stddev, "rms": request.rms,
            "max": request.max, "min": request.min, "ptp": request.ptp,
            "skewness": request.skewness, "kurtosis": request.kurtosis,
            "crest_factor": request.crest_factor, "freq_mean": request.freq_mean,
            "freq_stddev": request.freq_stddev, "freq_centroid": request.freq_centroid,
            "freq_bandwidth": request.freq_bandwidth
        }
        
        saved_result = repository.save_prediction(features_dict, prediction_result)
        
        # datetime을 문자열로 변환
        prediction_time_str = None
        if saved_result["predicted_time"]:
            if isinstance(saved_result["predicted_time"], datetime):
                prediction_time_str = saved_result["predicted_time"].isoformat()
            else:
                prediction_time_str = str(saved_result["predicted_time"])
        
        # 응답 생성
        response = PredictionResponse(
            prediction_id=saved_result["result_id"],
            predicted_label=prediction_result["predicted_label"],
            confidence=prediction_result["confidence"],
            probabilities=prediction_result["probabilities"],
            features=features_dict,
            prediction_time=prediction_time_str
        )
        
        logger.info(f"예측 완료: {prediction_result['predicted_label']} (신뢰도: {prediction_result['confidence']:.3f})")
        return response
        
    except Exception as e:
        logger.error(f"예측 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"예측 중 오류가 발생했습니다: {str(e)}"
        )


@router.post("/predict-batch", response_model=List[PredictionResponse])
async def predict_fault_batch(
    requests: List[PredictionRequest],
    predictor: Predictor = Depends(get_predictor),
    repository: VibrationRepository = Depends(get_repository)
) -> List[PredictionResponse]:
    """
    베어링 고장 예측 (배치)
    
    여러 개의 피처를 받아서 일괄 예측을 수행합니다.
    """
    try:
        if len(requests) > 100:  # 배치 크기 제한
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="배치 크기는 100개를 초과할 수 없습니다."
            )
        
        # 피처들을 numpy 배열로 변환
        features_list = []
        for request in requests:
            features_array = np.array([
                request.mean, request.stddev, request.rms, request.max, request.min,
                request.ptp, request.skewness, request.kurtosis, request.crest_factor,
                request.freq_mean, request.freq_stddev, request.freq_centroid, request.freq_bandwidth
            ])
            features_list.append(features_array)
        
        features_batch = np.array(features_list)
        
        # 배치 예측 수행
        prediction_results = predictor.predict_batch(features_batch)
        
        # 결과들을 데이터베이스에 저장하고 응답 생성
        responses = []
        for i, (request, prediction_result) in enumerate(zip(requests, prediction_results)):
            features_dict = {
                "mean": request.mean, "stddev": request.stddev, "rms": request.rms,
                "max": request.max, "min": request.min, "ptp": request.ptp,
                "skewness": request.skewness, "kurtosis": request.kurtosis,
                "crest_factor": request.crest_factor, "freq_mean": request.freq_mean,
                "freq_stddev": request.freq_stddev, "freq_centroid": request.freq_centroid,
                "freq_bandwidth": request.freq_bandwidth
            }
            
            saved_result = repository.save_prediction(features_dict, prediction_result)
            
            # datetime을 문자열로 변환
            prediction_time_str = None
            if saved_result["predicted_time"]:
                if isinstance(saved_result["predicted_time"], datetime):
                    prediction_time_str = saved_result["predicted_time"].isoformat()
                else:
                    prediction_time_str = str(saved_result["predicted_time"])
            
            response = PredictionResponse(
                prediction_id=saved_result["result_id"],
                predicted_label=prediction_result["predicted_label"],
                confidence=prediction_result["confidence"],
                probabilities=prediction_result["probabilities"],
                features=features_dict,
                prediction_time=prediction_time_str
            )
            responses.append(response)
        
        logger.info(f"배치 예측 완료: {len(responses)}개")
        return responses
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"배치 예측 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"배치 예측 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/history", response_model=PredictionHistory)
async def get_prediction_history(
    limit: int = 10,
    repository: VibrationRepository = Depends(get_repository)
) -> PredictionHistory:
    """
    예측 히스토리 조회
    
    최근 예측 결과들을 조회합니다.
    """
    try:
        if limit > 100:  # 조회 제한
            limit = 100
        
        history = repository.get_recent_predictions(limit)
        
        return PredictionHistory(
            total_count=len(history),
            predictions=history
        )
        
    except Exception as e:
        logger.error(f"예측 히스토리 조회 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"예측 히스토리 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/{prediction_id}", response_model=Dict[str, Any])
async def get_prediction_by_id(
    prediction_id: int,
    repository: VibrationRepository = Depends(get_repository)
) -> Dict[str, Any]:
    """
    특정 예측 결과 조회
    
    예측 ID로 특정 예측 결과를 조회합니다.
    """
    try:
        result = repository.get_prediction_by_id(prediction_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"예측 ID {prediction_id}를 찾을 수 없습니다."
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"예측 결과 조회 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"예측 결과 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.delete("/{prediction_id}")
async def delete_prediction(
    prediction_id: int,
    repository: VibrationRepository = Depends(get_repository)
) -> Dict[str, str]:
    """
    예측 결과 삭제
    
    특정 예측 결과를 삭제합니다.
    """
    try:
        success = repository.delete_prediction(prediction_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"예측 ID {prediction_id}를 찾을 수 없습니다."
            )
        
        return {"message": f"예측 ID {prediction_id}가 성공적으로 삭제되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"예측 결과 삭제 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"예측 결과 삭제 중 오류가 발생했습니다: {str(e)}"
        ) 