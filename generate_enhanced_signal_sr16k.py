import numpy as np
import scipy.signal as signal
from scipy.signal.windows import gaussian
import os
from scipy.io.wavfile import write as wav_write

def generate_bearing_fault_signal(duration=10.0, sr=16000, fault_type='normal', seed=None):
    """
    Generate synthetic bearing signal with enhanced realism (16kHz version)
    Supports 'normal', 'IR', 'OR'.
    """
    if seed:
        np.random.seed(seed)

    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    base_freq = 30  # base mechanical rotation frequency [Hz]

    # ----- Base low-frequency vibration -----
    base_vib = 0.5 * np.sin(2 * np.pi * base_freq * t)

    # ----- High-frequency motor-like signal -----
    hf = np.sin(2 * np.pi * 6000 * t) * 0.1

    # ----- Envelope modulation -----
    envelope = 1 + 0.3 * np.sin(2 * np.pi * base_freq * t)
    modulated_signal = base_vib * envelope + hf

    # ----- Fault impulse generation -----
    impulses = np.zeros_like(t)
    if fault_type != 'normal':
        fault_rate = 90 if fault_type == 'IR' else 70  # Hz
        interval = int(sr / fault_rate)
        for i in range(0, len(t), interval):
            width = np.random.randint(5, 15)
            if i + width < len(impulses):
                impulses[i:i+width] += gaussian(width, std=width/4) * np.random.uniform(0.5, 1.0)
    fault_component = impulses

    # ----- Combined signal -----
    x = modulated_signal + fault_component

    # ----- Band energy emphasis: 5–7kHz -----
    sos = signal.butter(4, [5000, 7000], btype='bandpass', fs=sr, output='sos')
    band_energy = signal.sosfilt(sos, x) * 2.0
    final_signal = x + band_energy

    # ----- Normalize to [-1, 1] -----
    final_signal /= np.max(np.abs(final_signal)) + 1e-8
    return (final_signal * 0.95).astype(np.float32)


def save_synthetic_dataset(output_dir='enhanced_wav_sr16k', sr=16000, samples_per_class=5):
    """
    Save enhanced synthetic bearing signals for each class as .wav (16kHz, 10s)
    """
    os.makedirs(output_dir, exist_ok=True)
    for cls in ['normal', 'IR', 'OR']:
        cls_dir = os.path.join(output_dir, cls)
        os.makedirs(cls_dir, exist_ok=True)
        for i in range(samples_per_class):
            x = generate_bearing_fault_signal(sr=sr, fault_type=cls, seed=42+i)
            fname = f"{cls}_{i:04d}.wav"
            wav_write(os.path.join(cls_dir, fname), sr, x)
            print(f"Saved: {cls}/{fname}")


if __name__ == "__main__":
    save_synthetic_dataset(output_dir='enhanced_wav_sr16k', sr=16000, samples_per_class=5)
