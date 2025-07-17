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
    if seed is not None:
        np.random.seed(seed)
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    base_freq = 30
    base_vib = 1.0 * np.sin(2 * np.pi * base_freq * t)
    hf = np.sin(2 * np.pi * 6000 * t) * 0.1
    envelope = 1 + 0.1 * np.sin(2 * np.pi * base_freq * t)
    modulated_signal = base_vib * envelope + hf
    noise = np.random.normal(0, 0.03, size=len(t))
    x = modulated_signal + noise

    if fault_type in ['IR', 'OR']:
        fault_rate = 90 if fault_type == 'IR' else 70
        interval = int(sr / fault_rate)
        impulses = np.zeros_like(t)
        for i in range(0, len(t), interval):
            width = np.random.randint(5, 15)
            if i + width < len(impulses):
                impulses[i:i+width] += gaussian(width, std=width/4) * np.random.uniform(0.5, 1.0)
        x += impulses
        sos = butter(4, [5000, 7000], btype='bandpass', fs=sr, output='sos')
        x += sosfilt(sos, x) * 2.0

    x /= np.max(np.abs(x)) + 1e-8
    return (x * 0.95).astype(np.float32)

def save_wav(wav_data, sr, output_path):
    wav_int16 = (wav_data * 32767).astype(np.int16)
    wav_write(output_path, sr, wav_int16)

def wav_to_spectrogram(wav_data, sr, output_path, dpi=100):
    plt.figure(figsize=(2.56, 1.28), dpi=dpi)
    S = librosa.feature.melspectrogram(y=wav_data, sr=sr, n_mels=128, fmax=8000)
    S_dB = librosa.power_to_db(S + 1e-6, ref=np.max)
    librosa.display.specshow(S_dB, sr=sr, fmax=8000, cmap='gray')
    plt.axis('off')
    plt.tight_layout(pad=0)
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
    plt.close()

def split_and_save(cls_name, fault_type, count, base_dir, sr):
    indices = list(range(count))
    train_idx, test_val_idx = train_test_split(indices, test_size=0.4, random_state=42)
    val_idx, test_idx = train_test_split(test_val_idx, test_size=0.5, random_state=42)
    split_map = {'train': train_idx, 'val': val_idx, 'test': test_idx}

    for split, idx_list in split_map.items():
        out_dir = os.path.join(base_dir, split, cls_name)
        os.makedirs(out_dir, exist_ok=True)
        for i in tqdm(idx_list, desc=f"{cls_name}-{split}"):
            x = generate_bearing_fault_signal(sr=sr, fault_type=fault_type, seed=i)
            base_fname = f"{cls_name}_{i:04d}"
            wav_path = os.path.join(out_dir, f"{base_fname}.wav")
            img_path = os.path.join(out_dir, f"{base_fname}.png")
            save_wav(x, sr, wav_path)
            wav_to_spectrogram(x, sr, img_path)

def generate_full_dataset(output_dir='finetune_data_split', sr=16000):
    stage1_map = {
        'Normal': ('normal', 200),
        'Abnormal': ('IR', 100),
    }
    stage2_map = {
        'Normal_Healthy': ('normal', 250),
        'Inner_Race_Fault': ('IR', 250),
        'Outer_Race_Fault': ('OR', 250)
    }

    s1_root = output_dir + '_s1'
    for cls_name, (fault_type, count) in stage1_map.items():
        split_and_save(cls_name, fault_type, count, s1_root, sr)

    s2_root = output_dir + '_s2'
    for cls_name, (fault_type, count) in stage2_map.items():
        split_and_save(cls_name, fault_type, count, s2_root, sr)

    return s1_root, s2_root

# 실행
if __name__ == "__main__":
    s1_path, s2_path = generate_full_dataset()
    print(f"Stage1 dataset saved to: {s1_path}")
    print(f"Stage2 dataset saved to: {s2_path}")
