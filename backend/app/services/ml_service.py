# app/services/ml_service.py

from joblib import load
import numpy as np
from scipy.io import wavfile
from sklearn.preprocessing import StandardScaler
from scipy.stats import skew, kurtosis
from scipy.fft import fft, fftfreq
import io
import csv
from app.models.schemas import PredictionResponse, Probability
import os
import tempfile
from pydub import AudioSegment
from app.models.database import SessionLocal, VibrationInput, VibrationResult
import pandas as pd

def extract_features_from_wav(wav_path: str):
    sampling_rate, data = wavfile.read(wav_path)
    signal = data.astype(np.float32)

    # 시간 영역 피처 (9개)
    mean = np.mean(signal)
    std = np.std(signal)
    rms = np.sqrt(np.mean(signal ** 2))
    max_val = np.max(signal)
    min_val = np.min(signal)
    ptp_val = np.ptp(signal)
    skewness = skew(signal)
    kurt = kurtosis(signal)
    crest_factor = np.max(np.abs(signal)) / rms

    # 주파수 영역 피처 (4개)
    fft_vals = np.abs(fft(signal))
    freqs = fftfreq(len(signal), 1 / sampling_rate)
    fft_half = fft_vals[:len(fft_vals)//2]
    freqs_half = freqs[:len(freqs)//2]

    freq_mean = np.mean(fft_half)
    freq_std = np.std(fft_half)
    spectral_centroid = np.sum(freqs_half * fft_half) / np.sum(fft_half)
    spectral_bandwidth = np.sqrt(np.sum(((freqs_half - spectral_centroid) ** 2) * fft_half) / np.sum(fft_half))

    X = np.array([
        mean, std, rms, max_val, min_val, ptp_val,
        skewness, kurt, crest_factor,
        freq_mean, freq_std, spectral_centroid, spectral_bandwidth
    ]).reshape(1, -1)

    features = {
        "mean": mean,
        "stddev": std,
        "rms": rms,
        "max": max_val,
        "min": min_val,
        "ptp": ptp_val,
        "skewness": skewness,
        "kurtosis": kurt,
        "crest_factor": crest_factor,
        "freq_mean": freq_mean,
        "freq_stddev": freq_std,
        "freq_centroid": spectral_centroid,
        "freq_bandwidth": spectral_bandwidth
    }

    return X, sampling_rate, features


async def predict_fault_from_wav(file):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        contents = await file.read()
        temp_file.write(contents)
        temp_path = temp_file.name

    try:
        X, sampling_rate, features = extract_features_from_wav(temp_path)

        if np.isnan(X).any():
            raise ValueError("NaN이 포함된 피처가 존재합니다. 오디오 품질을 확인해주세요.")

        base_path = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(base_path, "../../saved_models")
        model = load(os.path.join(model_dir, "clf_augmented_rf_model.joblib"))
        scaler = load(os.path.join(model_dir, "scaler_augmented_data.joblib"))
        label_encoder = load(os.path.join(model_dir, "label_encoder.joblib"))

        X_scaled = scaler.transform(X)
        pred_proba = model.predict_proba(X_scaled)[0]
        pred_class_index = np.argmax(pred_proba)
        pred_label = label_encoder.inverse_transform([pred_class_index])[0]

        probabilities = [
            Probability(
                fault_type=label_encoder.inverse_transform([i])[0],
                probability=float(prob)
            ) for i, prob in enumerate(pred_proba)
        ]

        csv_buffer = io.StringIO()
        writer = csv.writer(csv_buffer)
        writer.writerow(list(features.keys()))
        writer.writerow([features[k] for k in features])
        csv_str = csv_buffer.getvalue()

        session = SessionLocal()
        try:
            input_row = VibrationInput(
                mean=features["mean"],
                stddev=features["stddev"],
                min=features["min"],
                max=features["max"],
                ptp=features["ptp"],
                rms=features["rms"],
                skewness=features["skewness"],
                kurtosis=features["kurtosis"],
                crest_factor=features["crest_factor"],
                freq_mean=features["freq_mean"],
                freq_stddev=features["freq_stddev"],
                freq_centroid=features["freq_centroid"],
                freq_bandwidth=features["freq_bandwidth"]
            )
            session.add(input_row)
            session.flush()

            result_row = VibrationResult(
                input_id=input_row.id,
                predicted_fault=pred_label
            )
            session.add(result_row)
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"DB 저장 오류: {e}")
        finally:
            session.close()

        return PredictionResponse(
            predicted_label=pred_label,
            sampling_rate=sampling_rate,
            extracted_feature_shape=list(X.shape),
            probabilities=probabilities,
            preprocessed_csv_data=csv_str
        )

    finally:
        os.remove(temp_path)

def predict_faults_from_csv(df):
    base_path = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base_path, "../../saved_models")
    model = load(os.path.join(model_dir, "clf_augmented_rf_model.joblib"))
    scaler = load(os.path.join(model_dir, "scaler_augmented_data.joblib"))
    label_encoder = load(os.path.join(model_dir, "label_encoder.joblib"))

    expected_columns = [
        "mean", "stddev", "rms", "max", "min", "ptp",
        "skewness", "kurtosis", "crest_factor",
        "freq_mean", "freq_stddev", "freq_centroid", "freq_bandwidth"
    ]

    if list(df.columns) != expected_columns:
        raise ValueError(f"CSV 컬럼 순서가 예상과 다릅니다. 다음 순서를 맞춰주세요: {expected_columns}")

    if df.isnull().values.any():
        raise ValueError("CSV에 NaN 값이 포함되어 있습니다.")

    X = scaler.transform(df.values)
    preds = model.predict(X)
    pred_labels = label_encoder.inverse_transform(preds)

    result_df = df.copy()
    result_df["predicted_label"] = pred_labels

    return result_df
