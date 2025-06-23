# core/wav_processor.py
# (기존 코드에 아래 내용을 추가하거나 수정해주세요)

import numpy as np
import scipy.io.wavfile as wavfile
from scipy.fft import fft
from scipy.stats import kurtosis, skew
import pandas as pd # pandas 임포트

class WavFeatureExtractor:
    def __init__(self, window_size=2048, step_size=2048):
        self.window_size = window_size
        self.step_size = step_size

    def _extract_single_window_features(self, signal_window):
        # 모델 예측에 사용될 13가지 피처 (기존 extract_features 로직)
        mean_val = np.mean(signal_window)
        std_val = np.std(signal_window)
        rms_val = np.sqrt(np.mean(signal_window**2))
        max_val = np.max(signal_window)
        min_val = np.min(signal_window)
        ptp_val = np.ptp(signal_window) # Peak-to-Peak
        skew_val = skew(signal_window)
        kurtosis_val = kurtosis(signal_window)
        
        # 0으로 나누기 방지
        shape_factor = np.max(np.abs(signal_window)) / rms_val if rms_val != 0 else 0.0

        # 주파수 도메인 피처
        fft_vals = np.abs(fft(signal_window.astype(np.complex_)))[:len(signal_window)//2]
        
        # 0으로 나누기 방지
        if np.sum(fft_vals) == 0:
            spectral_centroid = 0.0
            spectral_bandwidth = 0.0
        else:
            spectral_centroid = np.sum(np.arange(len(fft_vals)) * fft_vals) / np.sum(fft_vals)
            variance = np.sum(((np.arange(len(fft_vals)) - spectral_centroid) ** 2) * fft_vals) / np.sum(fft_vals)
            spectral_bandwidth = np.sqrt(max(0.0, variance)) # 음수 방지

        # 모델 입력용 13개 피처 리스트 (이 순서는 모델 학습 시의 피처 순서와 동일해야 함)
        model_features_list = [
            mean_val, std_val, rms_val,
            max_val, min_val, ptp_val,
            skew_val, kurtosis_val, shape_factor,
            np.mean(fft_vals), np.std(fft_vals), spectral_centroid, spectral_bandwidth
        ]

        # 이미지에서 요구하는 'Crest'와 'Form' 피처 계산
        # Crest Factor = Peak / RMS (Peak는 Max의 절댓값)
        crest_factor = np.max(np.abs(signal_window)) / rms_val if rms_val != 0 else 0.0
        # Form Factor = RMS / Absolute Mean (Absolute Mean은 신호 절댓값의 평균)
        form_factor = rms_val / np.mean(np.abs(signal_window)) if np.mean(np.abs(signal_window)) != 0 else 0.0
        
        # NaN 값 방지 (계산 결과가 NaN이 될 수 있는 경우)
        if np.isnan(crest_factor): crest_factor = 0.0
        if np.isnan(form_factor): form_factor = 0.0
        
        # 미리보기에 표시할 피처 딕셔너리 (이미지 예시와 동일한 컬럼 이름)
        display_features_dict = {
            "Max": max_val,
            "Min": min_val,
            "RMS": rms_val,
            "Kurtosis": kurtosis_val,
            "Crest": crest_factor,
            "Form": form_factor
        }
        
        return model_features_list, display_features_dict

    def process_wav_bytes(self, wav_bytes):
        from io import BytesIO
        samplerate, data = wavfile.read(BytesIO(wav_bytes))

        if data.ndim > 1:
            data = data[:, 0]
        data = data.astype(float)

        all_model_features_raw = [] # 모델 입력에 필요한 13개 피처
        all_display_features_raw = [] # 테이블 미리보기에 필요한 피처

        for start in range(0, len(data) - self.window_size + 1, self.step_size):
            window = data[start:start + self.window_size]
            if len(window) == self.window_size:
                model_feats, display_feats = self._extract_single_window_features(window)
                all_model_features_raw.append(model_feats)
                all_display_features_raw.append(display_feats)
        
        # 미리보기와 최종 결과 표시에 사용할 DataFrame 생성
        df_results = pd.DataFrame(all_display_features_raw)
        
        # 모델 예측에 사용할 13개 피처는 별도의 컬럼으로 저장
        # 이 컬럼은 최종 Streamlit 테이블에서 제거될 것임
        df_results['model_input_features_for_scaler'] = all_model_features_raw

        return df_results