"""
Test suite for Predictor module
"""

import pytest
import numpy as np
import pandas as pd
import sys
import os

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.modules.predictor.predictor import Predictor
from app.modules.model_loader.model_loader import ModelLoader


class TestPredictor:
    """Predictor 클래스 테스트"""
    
    @pytest.fixture
    def model_loader(self):
        """ModelLoader 인스턴스 생성"""
        return ModelLoader()
    
    @pytest.fixture
    def predictor(self, model_loader):
        """Predictor 인스턴스 생성"""
        return Predictor(model_loader)
    
    @pytest.fixture
    def sample_features(self):
        """테스트용 샘플 피처 생성"""
        # 13개 피처를 가진 샘플 데이터
        features = np.array([
            1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0
        ])
        return features
    
    @pytest.fixture
    def sample_features_2d(self):
        """테스트용 2D 샘플 피처 생성"""
        # (3, 13) 형태의 배치 데이터
        features = np.array([
            [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0],
            [2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0],
            [3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0]
        ])
        return features
    
    def test_init(self, predictor):
        """초기화 테스트"""
        assert predictor is not None
        assert predictor.model is not None
        assert predictor.scaler is not None
        assert predictor.label_encoder is not None
    
    def test_validate_features_valid_1d(self, predictor, sample_features):
        """유효한 1D 피처 검증 테스트"""
        assert predictor._validate_features(sample_features) is True
    
    def test_validate_features_valid_2d(self, predictor, sample_features_2d):
        """유효한 2D 피처 검증 테스트"""
        assert predictor._validate_features(sample_features_2d) is True
    
    def test_validate_features_invalid_dimension(self, predictor):
        """잘못된 차원 피처 검증 테스트"""
        # 12개 피처 (13개가 아님)
        invalid_features = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0])
        assert predictor._validate_features(invalid_features) is False
    
    def test_validate_features_nan(self, predictor):
        """NaN 값 포함 피처 검증 테스트"""
        features_with_nan = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, np.nan])
        assert predictor._validate_features(features_with_nan) is False
    
    def test_validate_features_inf(self, predictor):
        """무한대 값 포함 피처 검증 테스트"""
        features_with_inf = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, np.inf])
        assert predictor._validate_features(features_with_inf) is False
    
    def test_validate_features_none(self, predictor):
        """None 값 피처 검증 테스트"""
        assert predictor._validate_features(None) is False
    
    def test_scale_features(self, predictor, sample_features):
        """피처 스케일링 테스트"""
        # 1D를 2D로 변환
        features_2d = sample_features.reshape(1, -1)
        scaled_features = predictor._scale_features(features_2d)
        
        assert isinstance(scaled_features, np.ndarray)
        assert scaled_features.shape == (1, 13)
        assert not np.isnan(scaled_features).any()
        assert not np.isinf(scaled_features).any()
    
    def test_make_prediction(self, predictor, sample_features):
        """예측 수행 테스트"""
        # 1D를 2D로 변환
        features_2d = sample_features.reshape(1, -1)
        scaled_features = predictor._scale_features(features_2d)
        
        predicted_classes, predicted_probabilities = predictor._make_prediction(scaled_features)
        
        assert isinstance(predicted_classes, np.ndarray)
        assert isinstance(predicted_probabilities, np.ndarray)
        assert len(predicted_classes) == 1
        assert predicted_probabilities.shape[0] == 1
        assert predicted_probabilities.shape[1] > 0  # 클래스 수
    
    def test_decode_predictions(self, predictor, sample_features):
        """라벨 디코딩 테스트"""
        # 1D를 2D로 변환
        features_2d = sample_features.reshape(1, -1)
        scaled_features = predictor._scale_features(features_2d)
        predicted_classes, _ = predictor._make_prediction(scaled_features)
        
        decoded_labels = predictor._decode_predictions(predicted_classes)
        
        assert isinstance(decoded_labels, list)
        assert len(decoded_labels) == 1
        assert isinstance(decoded_labels[0], str)
    
    def test_create_probability_dict(self, predictor, sample_features):
        """확률 딕셔너리 생성 테스트"""
        # 1D를 2D로 변환
        features_2d = sample_features.reshape(1, -1)
        scaled_features = predictor._scale_features(features_2d)
        _, predicted_probabilities = predictor._make_prediction(scaled_features)
        
        prob_dicts = predictor._create_probability_dict(predicted_probabilities, 0)
        
        assert isinstance(prob_dicts, list)
        assert len(prob_dicts) > 0
        
        for prob_dict in prob_dicts:
            assert "fault_type" in prob_dict
            assert "probability" in prob_dict
            assert isinstance(prob_dict["fault_type"], str)
            assert isinstance(prob_dict["probability"], float)
            assert 0.0 <= prob_dict["probability"] <= 1.0
    
    def test_predict_single(self, predictor, sample_features):
        """단일 예측 테스트"""
        result = predictor.predict(sample_features)
        
        assert isinstance(result, dict)
        assert "predicted_label" in result
        assert "probabilities" in result
        assert "feature_shape" in result
        assert "confidence" in result
        
        assert isinstance(result["predicted_label"], str)
        assert isinstance(result["probabilities"], list)
        assert isinstance(result["feature_shape"], list)
        assert isinstance(result["confidence"], float)
        assert 0.0 <= result["confidence"] <= 1.0
    
    def test_predict_batch(self, predictor, sample_features_2d):
        """배치 예측 테스트"""
        results = predictor.predict_batch(sample_features_2d)
        
        assert isinstance(results, list)
        assert len(results) == 3  # 3개 샘플
        
        for result in results:
            assert isinstance(result, dict)
            assert "predicted_label" in result
            assert "probabilities" in result
            assert "feature_shape" in result
            assert "confidence" in result
            assert "sample_index" in result
    
    def test_predict_from_dataframe(self, predictor):
        """DataFrame 예측 테스트"""
        # 테스트용 DataFrame 생성
        df = pd.DataFrame({
            'mean': [1.0, 2.0],
            'stddev': [2.0, 3.0],
            'rms': [3.0, 4.0],
            'max': [4.0, 5.0],
            'min': [5.0, 6.0],
            'ptp': [6.0, 7.0],
            'skewness': [7.0, 8.0],
            'kurtosis': [8.0, 9.0],
            'crest_factor': [9.0, 10.0],
            'freq_mean': [10.0, 11.0],
            'freq_stddev': [11.0, 12.0],
            'freq_centroid': [12.0, 13.0],
            'freq_bandwidth': [13.0, 14.0]
        })
        
        result_df = predictor.predict_from_dataframe(df)
        
        assert isinstance(result_df, pd.DataFrame)
        assert len(result_df) == 2
        assert "predicted_label" in result_df.columns
        assert "confidence" in result_df.columns
    
    def test_reload_models(self, predictor):
        """모델 재로딩 테스트"""
        # 원본 모델 참조 저장
        original_model = predictor.model
        original_scaler = predictor.scaler
        original_label_encoder = predictor.label_encoder
        
        # 모델 재로딩
        predictor.reload_models()
        
        # 새로운 인스턴스인지 확인
        assert predictor.model is not None
        assert predictor.scaler is not None
        assert predictor.label_encoder is not None
    
    def test_get_model_info(self, predictor):
        """모델 정보 조회 테스트"""
        info = predictor.get_model_info()
        
        assert isinstance(info, dict)
        assert "model_loaded" in info
        assert "scaler_loaded" in info
        assert "label_encoder_loaded" in info
        assert "available_classes" in info
        
        assert isinstance(info["model_loaded"], bool)
        assert isinstance(info["scaler_loaded"], bool)
        assert isinstance(info["label_encoder_loaded"], bool)
        assert info["model_loaded"] is True
        assert info["scaler_loaded"] is True
        assert info["label_encoder_loaded"] is True
    
    def test_predict_invalid_features(self, predictor):
        """잘못된 피처로 예측 테스트"""
        # 12개 피처 (13개가 아님)
        invalid_features = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0])
        
        with pytest.raises(ValueError, match="입력 피처가 유효하지 않습니다"):
            predictor.predict(invalid_features)
    
    def test_predict_nan_features(self, predictor):
        """NaN 값 포함 피처로 예측 테스트"""
        features_with_nan = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, np.nan])
        
        with pytest.raises(ValueError, match="입력 피처가 유효하지 않습니다"):
            predictor.predict(features_with_nan)
    
    def test_predict_batch_invalid_features(self, predictor):
        """잘못된 피처로 배치 예측 테스트"""
        # 잘못된 차원의 피처
        invalid_features = np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])  # (2, 3)
        
        with pytest.raises(ValueError, match="입력 피처가 유효하지 않습니다"):
            predictor.predict_batch(invalid_features)


if __name__ == "__main__":
    pytest.main([__file__]) 