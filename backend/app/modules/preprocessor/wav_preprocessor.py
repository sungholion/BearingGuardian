"""
WAV Preprocessor Module

This module provides functionality for preprocessing WAV files and extracting
features for bearing fault prediction.
"""

import numpy as np
from scipy.io import wavfile
from scipy.stats import skew, kurtosis
from scipy.fft import fft, fftfreq
from typing import Dict, Tuple, Optional, Union
import logging
import tempfile
import os
from pathlib import Path

logger = logging.getLogger(__name__)


class WAVPreprocessor:
    """
    WAV 파일 전처리 및 피처 추출 클래스
    
    베어링 진동 데이터의 WAV 파일에서 시간 영역 및 주파수 영역 피처를 추출합니다.
    """
    
    def __init__(self):
        """WAV 전처리기 초기화"""
        self.feature_names = [
            # 시간 영역 피처 (9개)
            "mean", "stddev", "rms", "max", "min", "ptp",
            "skewness", "kurtosis", "crest_factor",
            # 주파수 영역 피처 (4개)
            "freq_mean", "freq_stddev", "freq_centroid", "freq_bandwidth"
        ]
    
    def load_wav_file(self, file_path: Union[str, Path]) -> Tuple[np.ndarray, int]:
        """
        WAV 파일을 로드합니다.
        
        Args:
            file_path: WAV 파일 경로
            
        Returns:
            Tuple[np.ndarray, int]: (오디오 데이터, 샘플링 레이트)
            
        Raises:
            FileNotFoundError: 파일이 존재하지 않는 경우
            ValueError: WAV 파일 형식이 올바르지 않은 경우
        """
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"WAV 파일을 찾을 수 없습니다: {file_path}")
            
            sampling_rate, data = wavfile.read(file_path)
            signal = data.astype(np.float32)
            
            logger.info(f"WAV 파일 로드 완료: {file_path}")
            logger.info(f"샘플링 레이트: {sampling_rate}Hz, 데이터 길이: {len(signal)}")
            
            return signal, sampling_rate
            
        except Exception as e:
            logger.error(f"WAV 파일 로드 실패: {e}")
            raise ValueError(f"WAV 파일 로드 중 오류 발생: {e}")
    
    def extract_time_domain_features(self, signal: np.ndarray) -> Dict[str, float]:
        """
        시간 영역 피처를 추출합니다.
        
        Args:
            signal: 오디오 신호 데이터
            
        Returns:
            Dict[str, float]: 시간 영역 피처 딕셔너리
        """
        try:
            # 기본 통계 피처
            mean = np.mean(signal)
            std = np.std(signal)
            rms = np.sqrt(np.mean(signal ** 2))
            max_val = np.max(signal)
            min_val = np.min(signal)
            ptp_val = np.ptp(signal)  # peak-to-peak
            
            # 고차 모멘트 피처 (제로 신호나 상수 신호 처리)
            if std > 1e-10:  # 표준편차가 충분히 클 때만 계산
                skewness = skew(signal)
                kurt = kurtosis(signal)
            else:
                skewness = 0.0
                kurt = 0.0
            
            # 크레스트 팩터 (신호의 피크값과 RMS의 비율)
            crest_factor = np.max(np.abs(signal)) / rms if rms > 0 else 0
            
            features = {
                "mean": float(mean),
                "stddev": float(std),
                "rms": float(rms),
                "max": float(max_val),
                "min": float(min_val),
                "ptp": float(ptp_val),
                "skewness": float(skewness),
                "kurtosis": float(kurt),
                "crest_factor": float(crest_factor)
            }
            
            logger.debug(f"시간 영역 피처 추출 완료: {len(features)}개 피처")
            return features
            
        except Exception as e:
            logger.error(f"시간 영역 피처 추출 실패: {e}")
            raise ValueError(f"시간 영역 피처 추출 중 오류 발생: {e}")
    
    def extract_frequency_domain_features(self, signal: np.ndarray, sampling_rate: int) -> Dict[str, float]:
        """
        주파수 영역 피처를 추출합니다.
        
        Args:
            signal: 오디오 신호 데이터
            sampling_rate: 샘플링 레이트
            
        Returns:
            Dict[str, float]: 주파수 영역 피처 딕셔너리
        """
        try:
            # FFT 계산
            fft_vals = np.abs(fft(signal))
            freqs = fftfreq(len(signal), 1 / sampling_rate)
            
            # 양의 주파수 부분만 사용 (Nyquist 정리)
            fft_half = fft_vals[:len(fft_vals)//2]
            freqs_half = freqs[:len(freqs)//2]
            
            # 주파수 영역 통계 피처
            freq_mean = np.mean(fft_half)
            freq_std = np.std(fft_half)
            
            # 스펙트럴 센트로이드 (주파수 가중 평균)
            fft_sum = np.sum(fft_half)
            if fft_sum > 0:
                spectral_centroid = np.sum(freqs_half * fft_half) / fft_sum
            else:
                spectral_centroid = 0.0
            
            # 스펙트럴 대역폭
            if fft_sum > 0:
                spectral_bandwidth = np.sqrt(
                    np.sum(((freqs_half - spectral_centroid) ** 2) * fft_half) / fft_sum
                )
            else:
                spectral_bandwidth = 0.0
            
            features = {
                "freq_mean": float(freq_mean),
                "freq_stddev": float(freq_std),
                "freq_centroid": float(spectral_centroid),
                "freq_bandwidth": float(spectral_bandwidth)
            }
            
            logger.debug(f"주파수 영역 피처 추출 완료: {len(features)}개 피처")
            return features
            
        except Exception as e:
            logger.error(f"주파수 영역 피처 추출 실패: {e}")
            raise ValueError(f"주파수 영역 피처 추출 중 오류 발생: {e}")
    
    def extract_all_features(self, signal: np.ndarray, sampling_rate: int) -> Dict[str, float]:
        """
        모든 피처를 추출합니다 (시간 영역 + 주파수 영역).
        
        Args:
            signal: 오디오 신호 데이터
            sampling_rate: 샘플링 레이트
            
        Returns:
            Dict[str, float]: 모든 피처를 포함한 딕셔너리
        """
        try:
            time_features = self.extract_time_domain_features(signal)
            freq_features = self.extract_frequency_domain_features(signal, sampling_rate)
            
            all_features = {**time_features, **freq_features}
            
            # NaN 값 검증
            if any(np.isnan(value) for value in all_features.values()):
                raise ValueError("추출된 피처에 NaN 값이 포함되어 있습니다.")
            
            logger.info(f"전체 피처 추출 완료: {len(all_features)}개 피처")
            return all_features
            
        except Exception as e:
            logger.error(f"피처 추출 실패: {e}")
            raise ValueError(f"피처 추출 중 오류 발생: {e}")
    
    def features_to_array(self, features: Dict[str, float]) -> np.ndarray:
        """
        피처 딕셔너리를 numpy 배열로 변환합니다.
        
        Args:
            features: 피처 딕셔너리
            
        Returns:
            np.ndarray: 피처 배열 (1, 13) 형태
        """
        try:
            # 피처 순서 보장
            feature_values = [features[name] for name in self.feature_names]
            feature_array = np.array(feature_values).reshape(1, -1)
            
            return feature_array
            
        except Exception as e:
            logger.error(f"피처 배열 변환 실패: {e}")
            raise ValueError(f"피처 배열 변환 중 오류 발생: {e}")
    
    def process_wav_file(self, file_path: Union[str, Path]) -> Tuple[np.ndarray, int, Dict[str, float]]:
        """
        WAV 파일을 완전히 처리합니다.
        
        Args:
            file_path: WAV 파일 경로
            
        Returns:
            Tuple[np.ndarray, int, Dict[str, float]]: (피처 배열, 샘플링 레이트, 피처 딕셔너리)
        """
        try:
            # WAV 파일 로드
            signal, sampling_rate = self.load_wav_file(file_path)
            
            # 피처 추출
            features = self.extract_all_features(signal, sampling_rate)
            
            # 배열 형태로 변환
            feature_array = self.features_to_array(features)
            
            logger.info(f"WAV 파일 처리 완료: {file_path}")
            return feature_array, sampling_rate, features
            
        except Exception as e:
            logger.error(f"WAV 파일 처리 실패: {e}")
            raise ValueError(f"WAV 파일 처리 중 오류 발생: {e}")
    
    def process_uploaded_file(self, file_content: bytes, filename: str) -> Tuple[np.ndarray, int, Dict[str, float]]:
        """
        업로드된 파일을 처리합니다.
        
        Args:
            file_content: 파일 바이트 내용
            filename: 파일명
            
        Returns:
            Tuple[np.ndarray, int, Dict[str, float]]: (피처 배열, 샘플링 레이트, 피처 딕셔너리)
        """
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(file_content)
                temp_path = temp_file.name
            
            try:
                result = self.process_wav_file(temp_path)
                return result
            finally:
                # 임시 파일 삭제
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
        except Exception as e:
            logger.error(f"업로드 파일 처리 실패: {e}")
            raise ValueError(f"업로드 파일 처리 중 오류 발생: {e}")
    
    def get_feature_names(self) -> list:
        """
        피처 이름 목록을 반환합니다.
        
        Returns:
            list: 피처 이름 리스트
        """
        return self.feature_names.copy()
    
    def validate_features(self, features: Dict[str, float]) -> bool:
        """
        추출된 피처의 유효성을 검증합니다.
        
        Args:
            features: 피처 딕셔너리
            
        Returns:
            bool: 유효성 검증 결과
        """
        try:
            # 필수 피처 존재 확인
            for name in self.feature_names:
                if name not in features:
                    logger.error(f"필수 피처가 누락되었습니다: {name}")
                    return False
            
            # NaN 값 확인
            for name, value in features.items():
                if np.isnan(value):
                    logger.error(f"피처에 NaN 값이 포함되어 있습니다: {name}")
                    return False
                if np.isinf(value):
                    logger.error(f"피처에 무한대 값이 포함되어 있습니다: {name}")
                    return False
            
            logger.debug("피처 유효성 검증 통과")
            return True
            
        except Exception as e:
            logger.error(f"피처 유효성 검증 실패: {e}")
            return False 