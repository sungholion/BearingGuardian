"""
Test suite for WAVPreprocessor module
"""

import pytest
import numpy as np
import tempfile
import os
from pathlib import Path
import sys

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.modules.preprocessor.wav_preprocessor import WAVPreprocessor
from scipy.io import wavfile


class TestWAVPreprocessor:
    """WAVPreprocessor 클래스 테스트"""
    
    @pytest.fixture
    def preprocessor(self):
        """WAVPreprocessor 인스턴스 생성"""
        return WAVPreprocessor()
    
    @pytest.fixture
    def sample_signal(self):
        """테스트용 샘플 신호 생성"""
        # 1초 길이의 440Hz 사인파 생성 (샘플링 레이트: 44100Hz)
        sampling_rate = 44100
        duration = 1.0
        frequency = 440.0
        
        t = np.linspace(0, duration, int(sampling_rate * duration), False)
        signal = np.sin(2 * np.pi * frequency * t)
        
        return signal, sampling_rate
    
    @pytest.fixture
    def temp_wav_file(self, sample_signal):
        """임시 WAV 파일 생성"""
        signal, sampling_rate = sample_signal
        
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            wavfile.write(temp_file.name, sampling_rate, signal.astype(np.float32))
            temp_path = temp_file.name
        
        yield temp_path
        
        # 테스트 후 파일 삭제
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    def test_init(self, preprocessor):
        """초기화 테스트"""
        assert preprocessor is not None
        assert len(preprocessor.feature_names) == 13
        assert "mean" in preprocessor.feature_names
        assert "freq_centroid" in preprocessor.feature_names
    
    def test_load_wav_file(self, preprocessor, temp_wav_file):
        """WAV 파일 로드 테스트"""
        signal, sampling_rate = preprocessor.load_wav_file(temp_wav_file)
        
        assert isinstance(signal, np.ndarray)
        assert isinstance(sampling_rate, int)
        assert sampling_rate == 44100
        assert len(signal) > 0
        assert signal.dtype == np.float32
    
    def test_load_wav_file_not_found(self, preprocessor):
        """존재하지 않는 파일 로드 테스트"""
        with pytest.raises(ValueError, match="WAV 파일을 찾을 수 없습니다"):
            preprocessor.load_wav_file("nonexistent_file.wav")
    
    def test_extract_time_domain_features(self, preprocessor, sample_signal):
        """시간 영역 피처 추출 테스트"""
        signal, _ = sample_signal
        features = preprocessor.extract_time_domain_features(signal)
        
        # 필수 피처 확인
        expected_time_features = [
            "mean", "stddev", "rms", "max", "min", "ptp",
            "skewness", "kurtosis", "crest_factor"
        ]
        
        for feature in expected_time_features:
            assert feature in features
            assert isinstance(features[feature], float)
            assert not np.isnan(features[feature])
    
    def test_extract_frequency_domain_features(self, preprocessor, sample_signal):
        """주파수 영역 피처 추출 테스트"""
        signal, sampling_rate = sample_signal
        features = preprocessor.extract_frequency_domain_features(signal, sampling_rate)
        
        # 필수 피처 확인
        expected_freq_features = [
            "freq_mean", "freq_stddev", "freq_centroid", "freq_bandwidth"
        ]
        
        for feature in expected_freq_features:
            assert feature in features
            assert isinstance(features[feature], float)
            assert not np.isnan(features[feature])
    
    def test_extract_all_features(self, preprocessor, sample_signal):
        """전체 피처 추출 테스트"""
        signal, sampling_rate = sample_signal
        features = preprocessor.extract_all_features(signal, sampling_rate)
        
        # 모든 피처 확인
        assert len(features) == 13
        for feature_name in preprocessor.feature_names:
            assert feature_name in features
            assert isinstance(features[feature_name], float)
            assert not np.isnan(features[feature_name])
    
    def test_features_to_array(self, preprocessor, sample_signal):
        """피처를 배열로 변환 테스트"""
        signal, sampling_rate = sample_signal
        features = preprocessor.extract_all_features(signal, sampling_rate)
        feature_array = preprocessor.features_to_array(features)
        
        assert isinstance(feature_array, np.ndarray)
        assert feature_array.shape == (1, 13)
        assert not np.isnan(feature_array).any()
    
    def test_process_wav_file(self, preprocessor, temp_wav_file):
        """WAV 파일 전체 처리 테스트"""
        feature_array, sampling_rate, features = preprocessor.process_wav_file(temp_wav_file)
        
        assert isinstance(feature_array, np.ndarray)
        assert feature_array.shape == (1, 13)
        assert isinstance(sampling_rate, int)
        assert sampling_rate == 44100
        assert isinstance(features, dict)
        assert len(features) == 13
    
    def test_process_uploaded_file(self, preprocessor, temp_wav_file):
        """업로드 파일 처리 테스트"""
        with open(temp_wav_file, 'rb') as f:
            file_content = f.read()
        
        feature_array, sampling_rate, features = preprocessor.process_uploaded_file(
            file_content, "test.wav"
        )
        
        assert isinstance(feature_array, np.ndarray)
        assert feature_array.shape == (1, 13)
        assert isinstance(sampling_rate, int)
        assert isinstance(features, dict)
        assert len(features) == 13
    
    def test_get_feature_names(self, preprocessor):
        """피처 이름 목록 반환 테스트"""
        feature_names = preprocessor.get_feature_names()
        
        assert isinstance(feature_names, list)
        assert len(feature_names) == 13
        assert feature_names == preprocessor.feature_names
    
    def test_validate_features_valid(self, preprocessor, sample_signal):
        """유효한 피처 검증 테스트"""
        signal, sampling_rate = sample_signal
        features = preprocessor.extract_all_features(signal, sampling_rate)
        
        assert preprocessor.validate_features(features) is True
    
    def test_validate_features_missing(self, preprocessor):
        """누락된 피처 검증 테스트"""
        features = {"mean": 1.0, "stddev": 2.0}  # 일부만 포함
        
        assert preprocessor.validate_features(features) is False
    
    def test_validate_features_nan(self, preprocessor):
        """NaN 값 포함 피처 검증 테스트"""
        features = {name: np.nan for name in preprocessor.feature_names}
        
        assert preprocessor.validate_features(features) is False
    
    def test_validate_features_inf(self, preprocessor):
        """무한대 값 포함 피처 검증 테스트"""
        features = {name: np.inf for name in preprocessor.feature_names}
        
        assert preprocessor.validate_features(features) is False
    
    def test_noise_signal_processing(self, preprocessor):
        """노이즈 신호 처리 테스트"""
        # 노이즈 신호 생성
        np.random.seed(42)
        signal = np.random.normal(0, 1, 44100)  # 1초 노이즈
        sampling_rate = 44100
        
        features = preprocessor.extract_all_features(signal, sampling_rate)
        
        assert len(features) == 13
        for value in features.values():
            assert isinstance(value, float)
            assert not np.isnan(value)
            assert not np.isinf(value)
    
    def test_zero_signal_processing(self, preprocessor):
        """제로 신호 처리 테스트"""
        signal = np.zeros(44100)  # 1초 제로 신호
        sampling_rate = 44100
        
        features = preprocessor.extract_all_features(signal, sampling_rate)
        
        assert len(features) == 13
        assert features["mean"] == 0.0
        assert features["stddev"] == 0.0
        assert features["rms"] == 0.0
    
    def test_constant_signal_processing(self, preprocessor):
        """상수 신호 처리 테스트"""
        signal = np.full(44100, 5.0)  # 1초 상수 신호
        sampling_rate = 44100
        
        features = preprocessor.extract_all_features(signal, sampling_rate)
        
        assert len(features) == 13
        assert features["mean"] == 5.0
        assert features["stddev"] == 0.0
        assert features["rms"] == 5.0
        assert features["max"] == 5.0
        assert features["min"] == 5.0


if __name__ == "__main__":
    pytest.main([__file__]) 