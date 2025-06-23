from flask import Flask, render_template, request
import numpy as np
import joblib
import scipy.io.wavfile as wav
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 모델과 인코더 한 번만 불러오기
loaded = joblib.load("Xgboost_4class.pkl")
model = loaded['model']
encoder = loaded['encoder']

# 특징 추출 함수
from scipy.stats import skew, kurtosis  # 추가 필요

def extract_features_from_wav(file_path):
    sr, data = wav.read(file_path)
    data = data.astype(np.float32)
    data = data - np.mean(data)
    data = data / (np.max(np.abs(data)) + 1e-6)

    rms = np.sqrt(np.mean(data**2))
    crest = np.max(np.abs(data)) / (rms + 1e-6)
    form = rms / (np.mean(np.abs(data)) + 1e-6)

    features = [
        np.max(data),
        np.min(data),
        np.mean(data),
        np.std(data),
        rms,
        skew(data),
        kurtosis(data),
        crest,
        form
    ]
    return np.array(features).reshape(1, -1)


@app.route('/', methods=['GET', 'POST'])
def upload_predict():
    results = []

    if request.method == 'POST':
        files = request.files.getlist('file')
        for f in files:
            filepath = os.path.join(UPLOAD_FOLDER, f.filename)
            f.save(filepath)

            features = extract_features_from_wav(filepath)
            pred = model.predict(features)
            label = encoder.inverse_transform(pred)[0]
            results.append((f.filename, label))  # (파일명, 예측 결과)

    return render_template('index.html', results=results)

if __name__ == '__main__':
    app.run(debug=True)
