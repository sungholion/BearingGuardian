import os
import numpy as np
import scipy.io
from scipy.fft import fft
from scipy.stats import kurtosis, skew
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

# === 설정 ===
window_size = 2048
step_size = 2048
label_map = {
    "B007": "Ball_007", "B014": "Ball_014", "B021": "Ball_021",
    "IR007": "InnerRace_007", "IR014": "InnerRace_014", "IR021": "InnerRace_021",
    "OR007": "OuterRace_007", "OR014": "OuterRace_014", "OR021": "OuterRace_021",
    "Time_Normal": "Normal"
}

# === 1단계: 시계열 로딩 및 윈도우 분할 ===
def load_and_window_signals(data_dir):
    X_raw, y_raw = [], []
    file_list = [os.path.join(data_dir, f) for f in os.listdir(data_dir) if f.endswith(".mat")]
    for path in file_list:
        mat = scipy.io.loadmat(path)
        fname = os.path.basename(path).split(".")[0]
        de_key = [k for k in mat.keys() if "DE_time" in k][0]
        signal = mat[de_key].squeeze()
        label = next((label_map[k] for k in label_map if k in fname), "Unknown")
        for i in range(0, len(signal) - window_size + 1, step_size):
            X_raw.append(signal[i:i + window_size])
            y_raw.append(label)
    return np.array(X_raw), np.array(y_raw)

# === 2단계: 통계 + 주파수 피처 추출 (13개 피처) ===
def extract_features(signal):
    features = [
        np.mean(signal), np.std(signal), np.sqrt(np.mean(signal**2)),
        np.max(signal), np.min(signal), np.ptp(signal),
        skew(signal), kurtosis(signal),
        np.max(np.abs(signal)) / np.sqrt(np.mean(signal**2))
    ]
    
    # FFT 계산 시 데이터 타입이 복소수여야 할 수 있으므로 astype(np.complex_) 추가
    fft_vals = np.abs(fft(signal.astype(np.complex_)))[:len(signal)//2]
    
    # fft_vals의 합이 0이 되는 경우(신호가 0인 경우 등)를 처리하여 0으로 나누는 오류 방지
    if np.sum(fft_vals) == 0:
        spectral_centroid = 0.0
        spectral_bandwidth = 0.0
    else:
        spectral_centroid = np.sum(np.arange(len(fft_vals)) * fft_vals) / np.sum(fft_vals)
        spectral_bandwidth = np.sqrt(np.sum(((np.arange(len(fft_vals)) - spectral_centroid) ** 2) * fft_vals) / np.sum(fft_vals))
    
    features += [np.mean(fft_vals), np.std(fft_vals), spectral_centroid, spectral_bandwidth]
    return features

def create_feature_matrix(X_windowed):
    return np.array([extract_features(x) for x in X_windowed])

# === 3단계: 학습 및 평가 함수 ===
def train_and_evaluate(X_features, y_labels, plot_title="Confusion Matrix"):
    le = LabelEncoder()
    y_encoded = le.fit_transform(y_labels)
    scaler = StandardScaler() # 이 스케일러는 X_features에 fit됩니다.
    X_scaled = scaler.fit_transform(X_features)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="macro")
    cm = confusion_matrix(y_test, y_pred)

    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt="d", xticklabels=le.classes_, yticklabels=le.classes_)
    plt.title(plot_title)
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.tight_layout()
    plt.show()

    print(f"✅ Accuracy: {acc:.4f}")
    print(f"✅ F1-score: {f1:.4f}")
    return clf, le, scaler # 학습된 모델, 인코더, 스케일러 반환

# === 메인 실행 부분 ===
if __name__ == "__main__":
    data_directory = "C:/Users/jh/Desktop/py/bear2/data" # 실제 데이터 폴더 경로로 변경해주세요.

    # 1. 데이터 로드 및 윈도우 분할
    X_raw, y_labels = load_and_window_signals(data_directory)
    print(f"Raw signal windows shape: {X_raw.shape}")
    print(f"Labels shape: {y_labels.shape}")

    # 2. 피처 추출 (13개 피처)
    X_features_13 = create_feature_matrix(X_raw)
    print(f"Extracted features shape: {X_features_13.shape}")
    print(f"Number of features per sample: {X_features_13.shape[1]}")

    # 3. 모델 학습 및 평가 (13개 피처 기반)
    clf_13, le_13, scaler_13 = train_and_evaluate(X_features_13, y_labels, plot_title="Confusion Matrix (13 Features Only)")

    # 4. 학습된 모델, 라벨 인코더, 스케일러 저장
    # 이 때 저장되는 scaler_13은 13개의 피처에 fit된 스케일러입니다.
    output_model_dir = "model_13_features" # 저장될 폴더명
    os.makedirs(output_model_dir, exist_ok=True)

    joblib.dump(clf_13, os.path.join(output_model_dir, "rf_model.pkl"))
    joblib.dump(le_13, os.path.join(output_model_dir, "label_encoder.pkl"))
    joblib.dump(scaler_13, os.path.join(output_model_dir, "scaler.pkl"))

    print(f"✅ 13개 피처 기반 모델, 인코더, 스케일러가 '{output_model_dir}' 폴더에 저장되었습니다.")

#### 안녕안녕