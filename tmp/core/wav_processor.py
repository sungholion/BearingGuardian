# core/wav_processor.py
import numpy as np
import pandas as pd
import scipy.stats
import scipy.io.wavfile as wavfile
import io

class WavFeatureExtractor:
    def __init__(self, window_size=2048, step_size=2048):
        self.window_size = window_size
        self.step_size = step_size

    def extract_features(self, window):
        rms = np.sqrt(np.mean(window**2))
        return {
            "max": np.max(window),
            "min": np.min(window),
            "mean": np.mean(window),
            "sd": np.std(window),
            "rms": rms,
            "skewness": scipy.stats.skew(window),
            "kurtosis": scipy.stats.kurtosis(window),
            "crest": np.max(np.abs(window)) / rms if rms != 0 else 0,
            "form": rms / np.mean(np.abs(window)) if np.mean(np.abs(window)) != 0 else 0,
        }

    def process_wav_bytes(self, wav_bytes):
        # 바이너리 스트림에서 wav 읽기
        sample_rate, signal = wavfile.read(io.BytesIO(wav_bytes))
        if signal.dtype == np.int16:
            signal = signal.astype(np.float32) / 32768.0

        features = []
        for start in range(0, len(signal) - self.window_size + 1, self.step_size):
            window = signal[start:start + self.window_size]
            feats = self.extract_features(window)
            features.append(feats)

        return pd.DataFrame(features)
