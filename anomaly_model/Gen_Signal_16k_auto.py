import os
import numpy as np
import matplotlib.pyplot as plt
import librosa
import librosa.display
from scipy.io.wavfile import write as wav_write
from scipy.signal import butter, sosfilt
from scipy.signal.windows import gaussian
from tqdm import tqdm
from sklearn.model_selection import train_test_split

def generate_bearing_fault_signal(duration=10.0, sr=16000, fault_type='normal', seed=None):
    """
    베어링 결함 신호를 시뮬레이션하여 생성합니다.
    정상, 내륜(IR) 결함, 외륜(OR) 결함 신호를 생성할 수 있습니다.

    Args:
        duration (float): 신호의 길이 (초).
        sr (int): 샘플링 레이트 (Hz).
        fault_type (str): 생성할 신호의 종류 ('normal', 'IR', 'OR').
        seed (int, optional): 난수 생성을 위한 시드값.

    Returns:
        np.ndarray: 생성된 베어링 신호 (float32).
    """
    # 난수 시드 설정으로 재현성 보장
    if seed is not None:
        np.random.seed(seed)
    
    # 시간 배열 생성
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    
    # 기본 진동 신호 생성 (회전 주파수)
    base_freq = 30  # Hz
    base_vib = 1.0 * np.sin(2 * np.pi * base_freq * t)
    
    # 고주파 성분 추가
    hf = np.sin(2 * np.pi * 6000 * t) * 0.1
    
    # 진폭 변조 효과 추가
    envelope = 1 + 0.1 * np.sin(2 * np.pi * base_freq * t)
    modulated_signal = base_vib * envelope + hf
    
    # 백색 가우시안 노이즈 추가
    noise = np.random.normal(0, 0.03, size=len(t))
    x = modulated_signal + noise

    # 결함 유형에 따라 충격(impulse) 신호 추가
    if fault_type in ['IR', 'OR']:
        # 내륜(IR) 또는 외륜(OR) 결함 주파수 설정
        fault_rate = 90 if fault_type == 'IR' else 70  # Hz
        interval = int(sr / fault_rate)
        impulses = np.zeros_like(t)
        
        # 주기적인 충격 생성
        for i in range(0, len(t), interval):
            width = np.random.randint(5, 15)  # 충격의 너비
            if i + width < len(impulses):
                # 가우시안 윈도우를 사용하여 충격 형태 모델링
                impulses[i:i+width] += gaussian(width, std=width/4) * np.random.uniform(0.5, 1.0)
        
        x += impulses
        
        # 대역 통과 필터를 사용하여 공진 효과 시뮬레이션
        sos = butter(4, [5000, 7000], btype='bandpass', fs=sr, output='sos')
        x += sosfilt(sos, x) * 2.0

    # 신호 정규화 (-1과 1 사이의 값으로)
    x /= np.max(np.abs(x)) + 1e-8
    return (x * 0.95).astype(np.float32)

def save_wav(wav_data, sr, output_path):
    """
    생성된 신호 데이터를 16비트 정수형 WAV 파일로 저장합니다.

    Args:
        wav_data (np.ndarray): 저장할 WAV 데이터.
        sr (int): 샘플링 레이트.
        output_path (str): 저장할 파일 경로.
    """
    # 데이터를 16비트 정수형으로 변환
    wav_int16 = (wav_data * 32767).astype(np.int16)
    wav_write(output_path, sr, wav_int16)

def wav_to_spectrogram(wav_data, sr, output_path, dpi=100):
    """
    WAV 데이터를 멜 스펙트로그램 이미지로 변환하여 저장합니다.

    Args:
        wav_data (np.ndarray): 변환할 WAV 데이터.
        sr (int): 샘플링 레이트.
        output_path (str): 저장할 이미지 파일 경로.
        dpi (int): 이미지의 DPI (Dots Per Inch).
    """
    plt.figure(figsize=(2.56, 1.28), dpi=dpi)
    # 멜 스펙트로그램 계산
    S = librosa.feature.melspectrogram(y=wav_data, sr=sr, n_mels=128, fmax=8000)
    # 파워를 데시벨(dB)로 변환
    S_dB = librosa.power_to_db(S + 1e-6, ref=np.max)
    # 스펙트로그램 표시 (회색조)
    librosa.display.specshow(S_dB, sr=sr, fmax=8000, cmap='gray')
    # 축과 여백 제거
    plt.axis('off')
    plt.tight_layout(pad=0)
    # 이미지 파일로 저장
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
    plt.close()

def split_and_save(cls_name, fault_type, count, base_dir, sr):
    """
    지정된 클래스에 대한 데이터를 생성하고, train/val/test로 분할하여 저장합니다.
    각 데이터에 대해 WAV 파일과 스펙트로그램 이미지를 모두 생성합니다.

    Args:
        cls_name (str): 클래스 이름 (예: 'Normal', 'Inner_Race_Fault').
        fault_type (str): `generate_bearing_fault_signal`에 전달될 결함 유형.
        count (int): 생성할 총 데이터 샘플 수.
        base_dir (str): 데이터셋을 저장할 기본 디렉토리.
        sr (int): 샘플링 레이트.
    """
    indices = list(range(count))
    # 전체 데이터를 6:2:2 비율로 train, validation, test 세트로 분할
    train_idx, test_val_idx = train_test_split(indices, test_size=0.4, random_state=42)
    val_idx, test_idx = train_test_split(test_val_idx, test_size=0.5, random_state=42)
    split_map = {'train': train_idx, 'val': val_idx, 'test': test_idx}

    # 각 세트(train, val, test)에 대해 파일 생성
    for split, idx_list in split_map.items():
        out_dir = os.path.join(base_dir, split, cls_name)
        os.makedirs(out_dir, exist_ok=True)
        
        # tqdm을 사용하여 진행 상황 표시
        for i in tqdm(idx_list, desc=f"{cls_name}-{split}"):
            # 결함 신호 생성
            x = generate_bearing_fault_signal(sr=sr, fault_type=fault_type, seed=i)
            base_fname = f"{cls_name}_{i:04d}"
            
            # WAV 파일 저장
            wav_path = os.path.join(out_dir, f"{base_fname}.wav")
            save_wav(x, sr, wav_path)
            
            # 스펙트로그램 이미지 저장
            img_path = os.path.join(out_dir, f"{base_fname}.png")
            wav_to_spectrogram(x, sr, img_path)

def generate_full_dataset(output_dir='finetune_data_split', sr=16000):
    """
    두 단계의 분류 모델을 위한 전체 데이터셋을 생성합니다.
    - Stage 1: 정상/비정상 이진 분류 데이터셋.
    - Stage 2: 정상/내륜결함/외륜결함 다중 클래스 분류 데이터셋.

    Args:
        output_dir (str): 데이터셋을 저장할 기본 폴더 이름.
        sr (int): 샘플링 레이트.

    Returns:
        tuple: (Stage 1 데이터셋 경로, Stage 2 데이터셋 경로).
    """
    # Stage 1: 정상(Normal) vs 비정상(Abnormal) 분류를 위한 데이터셋 구성
    stage1_map = {
        'Normal': ('normal', 200),   # (결함 유형, 샘플 수)
        'Abnormal': ('IR', 100),     # 비정상은 내륜(IR) 결함으로 대표
    }
    
    # Stage 2: 결함 유형(정상, 내륜, 외륜) 분류를 위한 데이터셋 구성
    stage2_map = {
        'Normal_Healthy': ('normal', 250),
        'Inner_Race_Fault': ('IR', 250),
        'Outer_Race_Fault': ('OR', 250)
    }

    # Stage 1 데이터셋 생성
    s1_root = output_dir + '_s1'
    for cls_name, (fault_type, count) in stage1_map.items():
        split_and_save(cls_name, fault_type, count, s1_root, sr)

    # Stage 2 데이터셋 생성
    s2_root = output_dir + '_s2'
    for cls_name, (fault_type, count) in stage2_map.items():
        split_and_save(cls_name, fault_type, count, s2_root, sr)

    return s1_root, s2_root

# 스크립트가 직접 실행될 때 데이터셋 생성 함수를 호출
if __name__ == "__main__":
    s1_path, s2_path = generate_full_dataset()
    print(f"Stage1 dataset saved to: {s1_path}")
    print(f"Stage2 dataset saved to: {s2_path}")
