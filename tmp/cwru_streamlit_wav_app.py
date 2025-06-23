import streamlit as st
import numpy as np
import scipy.io.wavfile as wavfile
from scipy.fft import fft
from scipy.stats import kurtosis, skew
import joblib
import os

# --- 1. 모델 및 스케일러 로드 ---
# 'model_13_features' 폴더가 Streamlit 앱 스크립트와 같은 디렉토리에 있다고 가정
try:
    model_path = "model_13_features/rf_model.pkl"
    scaler_path = "model_13_features/scaler.pkl"
    label_encoder_path = "model_13_features/label_encoder.pkl"

    clf = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    le = joblib.load(label_encoder_path)
    st.success("모델, 스케일러, 라벨 인코더 로드 성공!")
except FileNotFoundError:
    st.error(f"모델 파일을 찾을 수 없습니다. 다음 경로를 확인해주세요: {model_path}, {scaler_path}, {label_encoder_path}")
    st.stop() # 파일이 없으면 앱 실행을 중지
except Exception as e:
    st.error(f"모델 로드 중 오류 발생: {e}")
    st.stop() # 모델 로드 오류 시 앱 실행을 중지

# --- 2. Feature 추출 함수 (13개 피처) ---
# 이 함수는 train_13.py의 extract_features 함수와 동일해야 합니다.
def extract_features_13(signal, window_size=2048, step_size=2048):
    all_features = []
    
    # 신호가 윈도우 크기보다 작을 경우 처리
    if len(signal) < window_size:
        st.warning(f"신호 길이가 윈도우 크기({window_size})보다 작습니다. 피처 추출 불가.")
        return np.array([]) # 빈 배열 반환

    for start in range(0, len(signal) - window_size + 1, step_size):
        window = signal[start:start + window_size]
        
        # 윈도우 크기가 정확한지 다시 한번 확인 (부분적인 윈도우 방지)
        if len(window) != window_size:
            continue

        features = [
            np.mean(window), np.std(window), np.sqrt(np.mean(window**2)),
            np.max(window), np.min(window), np.ptp(window),
            skew(window), kurtosis(window),
            np.max(np.abs(window)) / np.sqrt(np.mean(window**2))
        ] # 9가지 통계 피처
        
        # FFT 계산 시 데이터 타입이 복소수여야 할 수 있으므로 astype(np.complex_) 추가
        fft_vals = np.abs(fft(window.astype(np.complex_)))[:len(window)//2]
        
        # fft_vals의 합이 0이 되는 경우(신호가 0인 경우 등)를 처리하여 0으로 나누는 오류 방지
        if np.sum(fft_vals) == 0:
            spectral_centroid = 0.0
            spectral_bandwidth = 0.0
        else:
            spectral_centroid = np.sum(np.arange(len(fft_vals)) * fft_vals) / np.sum(fft_vals)
            # np.sqrt의 입력값이 음수가 되지 않도록 보호 로직 추가
            # 간혹 부동소수점 오차로 인해 아주 작은 음수가 될 수 있음
            variance = np.sum(((np.arange(len(fft_vals)) - spectral_centroid) ** 2) * fft_vals) / np.sum(fft_vals)
            spectral_bandwidth = np.sqrt(max(0.0, variance))
        
        features += [np.mean(fft_vals), np.std(fft_vals), spectral_centroid, spectral_bandwidth] # 4가지 주파수 피처
        all_features.append(features)
        
    return np.array(all_features)

# --- 3. Streamlit 앱 UI ---
st.title("WAV 파일 기반 진동 데이터 분류 (13 피처 모델)")

uploaded_file = st.file_uploader("WAV 파일을 업로드하세요", type=["wav"])

if uploaded_file is not None:
    st.audio(uploaded_file, format='audio/wav')

    # WAV 파일 읽기 및 전처리
    try:
        sample_rate, data = wavfile.read(uploaded_file)
        st.write(f"샘플링 레이트: {sample_rate} Hz")
        st.write(f"데이터 길이: {len(data)} 샘플")

        # 모노 채널로 변환 (스테레오일 경우)
        if data.ndim > 1:
            data = data[:, 0] # 첫 번째 채널 사용
            st.info("스테레오 WAV 파일을 모노 채널로 변환했습니다.")

        # 데이터 타입을 float으로 변환 (피처 추출 및 FFT 연산을 위해)
        data = data.astype(float)

        # 피처 추출
        # 여기서는 13개 피처를 추출하는 함수를 사용합니다.
        # window_size와 step_size는 모델 학습 시 사용된 것과 동일하게 유지
        features = extract_features_13(data, window_size=2048, step_size=2048)

        if features.shape[0] > 0:
            st.write(f"추출된 피처 셋 개수: {features.shape[0]}")
            st.write(f"각 피처 셋의 피처 개수: {features.shape[1]}") # 이 값은 이제 13이 되어야 합니다.

            # 피처 스케일링
            try:
                scaled_features = scaler.transform(features)
            except Exception as e:
                st.error(f"피처 스케일링 중 오류 발생: {e}")
                st.error(f"스케일러의 기대 입력 피처 개수: {scaler.n_features_in_}, 현재 추출된 피처 개수: {features.shape[1]}")
                st.stop() # 스케일링 오류 시 앱 실행 중지

            # 예측
            predictions_encoded = clf.predict(scaled_features)
            predictions_labels = le.inverse_transform(predictions_encoded)

            st.subheader("예측 결과:")
            # 각 윈도우/피처 셋에 대한 예측 결과 표시
            for i, pred_label in enumerate(predictions_labels):
                st.write(f"윈도우 {i+1} 예측: **{pred_label}**")

            # 가장 많이 예측된 클래스 (최종 예측)
            if len(predictions_labels) > 0:
                from collections import Counter
                final_prediction = Counter(predictions_labels).most_common(1)[0][0]
                st.success(f"최종 예측 결과 (가장 많이 예측된 클래스): **{final_prediction}**")
            else:
                st.warning("예측할 피처 셋이 없습니다.")

        else:
            st.warning("피처를 추출할 수 없습니다. WAV 파일의 내용 또는 길이를 확인하세요. 윈도우 크기(2048)보다 짧은 신호는 처리되지 않습니다.")

    except Exception as e:
        st.error(f"WAV 파일 처리 중 오류 발생: {e}")

st.markdown("---")
st.markdown("이 앱은 캐스케이드(CWRU) 진동 데이터셋 기반으로 학습된 **13개 피처 모델**을 사용합니다.")
