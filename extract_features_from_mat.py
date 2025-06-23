import os
import scipy.io
import numpy as np
import pandas as pd
from scipy.stats import skew, kurtosis

# 1. 설정
mat_dir = "C:/Users/enjoy/Downloads/archive (2)/raw"  # .mat 파일 폴더
output_csv_path = "C:/Users/enjoy/Downloads/archive (2)/raw/static/features_from_mat.csv"       # 저장 위치
segment_size = 2048                                    # 한 구간 길이

# 2. 결함 단순화 함수
def simplify_fault_from_filename(filename):
    if filename.startswith('B'):
        return 'Ball'
    elif filename.startswith('IR'):
        return 'IR'
    elif filename.startswith('OR'):
        return 'OR'
    else:
        return 'Normal'


# 3. 통계치 추출 함수
def extract_features(segment, label):
    segment = segment.astype(np.float32)
    segment -= np.mean(segment)
    segment /= (np.max(np.abs(segment)) + 1e-6)

    rms = np.sqrt(np.mean(segment ** 2))
    crest = np.max(np.abs(segment)) / (rms + 1e-6)
    form = rms / (np.mean(np.abs(segment)) + 1e-6)

    return [
        np.max(segment),
        np.min(segment),
        np.mean(segment),
        np.std(segment),
        rms,
        skew(segment),
        kurtosis(segment),
        crest,
        form,
        label  # ✔ 여기에 label이 포함됨
    ]

# 4. 전체 처리
all_features = []
for filename in os.listdir(mat_dir):
    if not filename.endswith(".mat"):
        continue

    full_path = os.path.join(mat_dir, filename)
    mat_contents = scipy.io.loadmat(full_path)

    # 신호 벡터 가져오기
    signal = None
    for key in mat_contents:
        if isinstance(mat_contents[key], np.ndarray) and mat_contents[key].ndim == 2:
            arr = mat_contents[key]
            if arr.shape[0] >= segment_size:
                signal = arr[:, 0]
                break

    if signal is None:
        print(f" {filename}에서 유효한 신호를 찾지 못함")
        continue

    label = simplify_fault_from_filename(filename)

    num_segments = len(signal) // segment_size
    for i in range(num_segments):
        segment = signal[i * segment_size:(i + 1) * segment_size]
        feats = extract_features(segment, label)
        all_features.append(feats)  

# 5. 저장
columns = ['max', 'min', 'mean', 'sd', 'rms', 'skewness', 'kurtosis', 'crest', 'form', 'fault']
df = pd.DataFrame(all_features, columns=columns)
df.to_csv(output_csv_path, index=False)
print(f" 총 {len(df)}개 샘플 저장 완료 → {output_csv_path}")
