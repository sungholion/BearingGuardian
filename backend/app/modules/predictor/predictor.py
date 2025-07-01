"""
예측 모듈

이 모듈은 사전 훈련된 모델을 사용하여 예측을 수행하는 기능을 제공합니다.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Union, Optional
import logging
from pathlib import Path

from ..model_loader.model_loader import ModelLoader

logger = logging.getLogger(__name__)

"""
    베어링 고장 예측 클래스
    
    전처리된 피처를 받아서 ML 모델을 통해 고장 유형을 예측합니다.
"""
class Predictor:
    
    def __init__(self, model_loader: Optional[ModelLoader] = None):
        """
        Predictor 초기화
        
        Args:
            model_loader: 모델 로더 인스턴스 (None이면 새로 생성)
        """
        self.model_loader = model_loader or ModelLoader()
        self.model = None
        self.scaler = None
        self.label_encoder = None
        
        # 모델 로딩
        self._load_models()
    
    def _load_models(self):
        """모델, 스케일러, 라벨 인코더를 로드합니다."""
        try:
            # ModelLoader에서 모델들을 로드
            self.model_loader.load_models()
            self.model, self.scaler, self.label_encoder = self.model_loader.get_models()
            
            logger.info("모델, 스케일러, 라벨 인코더 로딩 완료")
            
        except Exception as e:
            logger.error(f"모델 로딩 실패: {e}")
            raise ValueError(f"모델 로딩 중 오류 발생: {e}")
    
    def _validate_features(self, features: np.ndarray) -> bool:
        """
        입력 피처의 유효성을 검증합니다.
        
        Args:
            features: 입력 피처 배열
            
        Returns:
            bool: 유효성 검증 결과
        """
        try:
            if features is None:
                return False
            
            if not isinstance(features, np.ndarray):
                return False
            
            # NaN 값 확인
            if np.isnan(features).any():
                logger.error("입력 피처에 NaN 값이 포함되어 있습니다.")
                return False
            
            # 무한대 값 확인
            if np.isinf(features).any():
                logger.error("입력 피처에 무한대 값이 포함되어 있습니다.")
                return False
            
            # 차원 확인 (1, 13) 또는 (13,) 형태여야 함
            if features.ndim == 1:
                if features.shape[0] != 13:
                    logger.error(f"피처 차원이 올바르지 않습니다. 예상: 13, 실제: {features.shape[0]}")
                    return False
                features = features.reshape(1, -1)
            elif features.ndim == 2:
                if features.shape[1] != 13:
                    logger.error(f"피처 차원이 올바르지 않습니다. 예상: (n, 13), 실제: {features.shape}")
                    return False
            else:
                logger.error(f"피처 차원이 올바르지 않습니다. 예상: 1D 또는 2D, 실제: {features.ndim}D")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"피처 유효성 검증 실패: {e}")
            return False
    
    def _scale_features(self, features: np.ndarray) -> np.ndarray:
        """
        피처를 스케일링합니다.
        
        Args:
            features: 원본 피처 배열
            
        Returns:
            np.ndarray: 스케일링된 피처 배열
        """
        try:
            if self.scaler is None:
                raise ValueError("스케일러가 로드되지 않았습니다.")
            
            scaled_features = self.scaler.transform(features)
            logger.debug(f"피처 스케일링 완료: {features.shape} -> {scaled_features.shape}")
            
            return scaled_features
            
        except Exception as e:
            logger.error(f"피처 스케일링 실패: {e}")
            raise ValueError(f"피처 스케일링 중 오류 발생: {e}")
    
    def _make_prediction(self, scaled_features: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        스케일링된 피처로 예측을 수행합니다.
        
        Args:
            scaled_features: 스케일링된 피처 배열
            
        Returns:
            Tuple[np.ndarray, np.ndarray]: (예측 클래스, 예측 확률)
        """
        try:
            if self.model is None:
                raise ValueError("모델이 로드되지 않았습니다.")
            
            # 예측 수행
            predicted_classes = self.model.predict(scaled_features)
            predicted_probabilities = self.model.predict_proba(scaled_features)
            
            logger.debug(f"예측 완료: {len(predicted_classes)}개 샘플")
            
            return predicted_classes, predicted_probabilities
            
        except Exception as e:
            logger.error(f"예측 실패: {e}")
            raise ValueError(f"예측 중 오류 발생: {e}")
    
    def _decode_predictions(self, predicted_classes: np.ndarray) -> List[str]:
        """
        예측된 클래스 인덱스를 라벨로 디코딩합니다.
        
        Args:
            predicted_classes: 예측된 클래스 인덱스 배열
            
        Returns:
            List[str]: 디코딩된 라벨 리스트
        """
        try:
            if self.label_encoder is None:
                raise ValueError("라벨 인코더가 로드되지 않았습니다.")
            
            decoded_labels = self.label_encoder.inverse_transform(predicted_classes)
            logger.debug(f"라벨 디코딩 완료: {len(decoded_labels)}개")
            
            return decoded_labels.tolist()
            
        except Exception as e:
            logger.error(f"라벨 디코딩 실패: {e}")
            raise ValueError(f"라벨 디코딩 중 오류 발생: {e}")
    
    def _create_probability_dict(self, probabilities: np.ndarray, sample_idx: int = 0) -> List[Dict[str, Union[str, float]]]:
        """
        확률 배열을 딕셔너리 형태로 변환합니다.
        
        Args:
            probabilities: 예측 확률 배열
            sample_idx: 샘플 인덱스 (배치 처리 시 사용)
            
        Returns:
            List[Dict[str, Union[str, float]]]: 확률 딕셔너리 리스트
        """
        try:
            if self.label_encoder is None:
                raise ValueError("라벨 인코더가 로드되지 않았습니다.")
            
            # 모든 클래스 라벨 가져오기
            all_labels = self.label_encoder.classes_
            
            # 해당 샘플의 확률
            sample_probs = probabilities[sample_idx]
            
            # 딕셔너리 형태로 변환
            prob_dicts = []
            for i, (label, prob) in enumerate(zip(all_labels, sample_probs)):
                prob_dicts.append({
                    "fault_type": str(label),
                    "probability": float(prob)
                })
            
            return prob_dicts
            
        except Exception as e:
            logger.error(f"확률 딕셔너리 생성 실패: {e}")
            raise ValueError(f"확률 딕셔너리 생성 중 오류 발생: {e}")
    
    def predict(self, features: np.ndarray) -> Dict:
        """
        단일 피처 배열로 예측을 수행합니다.
        
        Args:
            features: 입력 피처 배열 (1, 13) 또는 (13,)
            
        Returns:
            Dict: 예측 결과 딕셔너리
                {
                    "predicted_label": str,
                    "probabilities": List[Dict],
                    "feature_shape": List[int],
                    "confidence": float
                }
        """
        try:
            # 피처 유효성 검증
            if not self._validate_features(features):
                raise ValueError("입력 피처가 유효하지 않습니다.")
            
            # 1D 배열을 2D로 변환
            if features.ndim == 1:
                features = features.reshape(1, -1)
            
            # 피처 스케일링
            scaled_features = self._scale_features(features)
            
            # 예측 수행
            predicted_classes, predicted_probabilities = self._make_prediction(scaled_features)
            
            # 라벨 디코딩
            predicted_labels = self._decode_predictions(predicted_classes)
            
            # 확률 딕셔너리 생성
            probabilities = self._create_probability_dict(predicted_probabilities, 0)
            
            # 신뢰도 계산 (최대 확률)
            confidence = float(np.max(predicted_probabilities[0]))
            
            result = {
                "predicted_label": predicted_labels[0],
                "probabilities": probabilities,
                "feature_shape": list(features.shape),
                "confidence": confidence
            }
            
            logger.info(f"예측 완료: {predicted_labels[0]} (신뢰도: {confidence:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"예측 실패: {e}")
            raise ValueError(f"예측 중 오류 발생: {e}")
    
    def predict_batch(self, features: np.ndarray) -> List[Dict]:
        """
        배치 피처 배열로 예측을 수행합니다.
        
        Args:
            features: 입력 피처 배열 (n, 13)
            
        Returns:
            List[Dict]: 예측 결과 딕셔너리 리스트
        """
        try:
            # 피처 유효성 검증
            if not self._validate_features(features):
                raise ValueError("입력 피처가 유효하지 않습니다.")
            
            # 1D 배열을 2D로 변환
            if features.ndim == 1:
                features = features.reshape(1, -1)
            
            # 피처 스케일링
            scaled_features = self._scale_features(features)
            
            # 예측 수행
            predicted_classes, predicted_probabilities = self._make_prediction(scaled_features)
            
            # 라벨 디코딩
            predicted_labels = self._decode_predictions(predicted_classes)
            
            # 각 샘플별 결과 생성
            results = []
            for i in range(len(predicted_labels)):
                probabilities = self._create_probability_dict(predicted_probabilities, i)
                confidence = float(np.max(predicted_probabilities[i]))
                
                result = {
                    "predicted_label": predicted_labels[i],
                    "probabilities": probabilities,
                    "feature_shape": [1, 13],
                    "confidence": confidence,
                    "sample_index": i
                }
                results.append(result)
            
            logger.info(f"배치 예측 완료: {len(results)}개 샘플")
            return results
            
        except Exception as e:
            logger.error(f"배치 예측 실패: {e}")
            raise ValueError(f"배치 예측 중 오류 발생: {e}")
    
    def predict_from_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        DataFrame으로 예측을 수행합니다.
        
        Args:
            df: 피처가 포함된 DataFrame (13개 컬럼)
            
        Returns:
            pd.DataFrame: 예측 결과가 추가된 DataFrame
        """
        try:
            # DataFrame을 numpy 배열로 변환
            features = df.values
            
            # 배치 예측 수행
            predictions = self.predict_batch(features)
            
            # 결과를 DataFrame에 추가
            result_df = df.copy()
            result_df["predicted_label"] = [pred["predicted_label"] for pred in predictions]
            result_df["confidence"] = [pred["confidence"] for pred in predictions]
            
            logger.info(f"DataFrame 예측 완료: {len(result_df)}개 행")
            return result_df
            
        except Exception as e:
            logger.error(f"DataFrame 예측 실패: {e}")
            raise ValueError(f"DataFrame 예측 중 오류 발생: {e}")
    
    def reload_models(self):
        """모델을 다시 로드합니다."""
        try:
            self._load_models()
            logger.info("모델 재로딩 완료")
        except Exception as e:
            logger.error(f"모델 재로딩 실패: {e}")
            raise ValueError(f"모델 재로딩 중 오류 발생: {e}")
    
    def get_model_info(self) -> Dict:
        """
        모델 정보를 반환합니다.
        
        Returns:
            Dict: 모델 정보 딕셔너리
        """
        try:
            info = {
                "model_loaded": self.model is not None,
                "scaler_loaded": self.scaler is not None,
                "label_encoder_loaded": self.label_encoder is not None,
                "available_classes": self.label_encoder.classes_.tolist() if self.label_encoder else None
            }
            return info
        except Exception as e:
            logger.error(f"모델 정보 조회 실패: {e}")
            return {"error": str(e)} 