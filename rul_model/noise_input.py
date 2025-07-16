
import numpy as np

class RealisticNoiseInjector:
    """
    실제 마이크 기반 진동 신호 환경을 모사한 노이즈 삽입기
    - 진동 간섭 (60Hz 사인파)
    - 임펄스 충격 노이즈
    - SNR 기반 Gaussian White Noise
    """

    def __init__(self, seed=None):
        if seed is not None:
            np.random.seed(seed)

    def generate_vibration_noise(self, length, amplitude=0.3, freq=60):
        t = np.linspace(0, 1, length)
        vibration = amplitude * np.sin(2 * np.pi * freq * t)
        noise = 0.05 * np.random.normal(0, 1, length)
        return vibration + noise

    def generate_impulse_noise(self, length, base_std=0.02, impact_length=20, impact_range=(0.5, 1.5)):
        base = base_std * np.random.normal(0, 1, length)
        num_impacts = np.random.randint(5, 15)
        for _ in range(num_impacts):
            idx = np.random.randint(0, length - impact_length)
            impact_magnitude = np.random.uniform(*impact_range)
            base[idx:idx + impact_length] += np.hanning(impact_length) * impact_magnitude
        return base

    def add_noise_snr(self, signal, snr_db):
        if np.sum(signal ** 2) == 0:
            return signal
        signal_power = np.mean(signal ** 2)
        if snr_db == -np.inf:
            noise = np.random.normal(0, 1, signal.shape)
            return noise
        snr_linear = 10 ** (snr_db / 10)
        noise_power = signal_power / snr_linear
        noise = np.random.normal(0, np.sqrt(noise_power), signal.shape)
        return signal + noise

    def inject(self, signal, include_vibration=True, include_impulse=True):
        noisy = np.copy(signal)
        if include_vibration:
            noisy += self.generate_vibration_noise(len(signal))
        if include_impulse:
            noisy += self.generate_impulse_noise(len(signal))
        return noisy
