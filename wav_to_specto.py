import os
import librosa
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

def wav_to_png_no_resize(wav_path, out_path, sr=16000, n_fft=1024, hop_length=512, n_mels=128):
    """
    Save log-mel spectrogram as grayscale PNG with original mel shape (no resizing)
    """
    y, _ = librosa.load(wav_path, sr=sr)

    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=n_fft,
                                         hop_length=hop_length, n_mels=n_mels)
    mel_db = librosa.power_to_db(mel, ref=np.max)

    # Normalize to 0–255
    mel_norm = 255 * (mel_db - mel_db.min()) / (mel_db.max() - mel_db.min())
    mel_img = mel_norm.astype(np.uint8)

    # Save with matplotlib (aspect ratio 유지)
    fig = plt.figure(frameon=False)
    plt.imshow(mel_img, cmap='gray', origin='lower', aspect='auto')
    plt.axis('off')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    plt.savefig(out_path, bbox_inches='tight', pad_inches=0)
    plt.close()
    print(f"Saved PNG (no resize): {out_path}")


def convert_wav_folder_no_resize(wav_root='synthetic_data', output_root='keras_spectrograms_original'):
    """
    Convert all .wav files to original-shape grayscale PNGs (no resizing)
    """
    for class_dir in os.listdir(wav_root):
        in_dir = os.path.join(wav_root, class_dir)
        out_dir = os.path.join(output_root, class_dir)
        if not os.path.isdir(in_dir): continue

        for fname in os.listdir(in_dir):
            if fname.endswith('.wav'):
                wav_path = os.path.join(in_dir, fname)
                base = os.path.splitext(fname)[0]
                out_path = os.path.join(out_dir, base + '.png')
                wav_to_png_no_resize(wav_path, out_path)


if __name__ == "__main__":
    convert_wav_folder_no_resize(wav_root='enhanced_wav_sr16k', output_root='keras_spectrograms_sr16k')

# import os
# import librosa
# import numpy as np
# import matplotlib.pyplot as plt
# from PIL import Image

# def wav_to_png(wav_path, out_path, sr=16000, n_fft=1024, hop_length=512, n_mels=128, resize=(224, 224)):
#     """
#     Convert a single .wav file to a 224x224 grayscale PNG (3채널로 확장 가능)
#     """
#     y, _ = librosa.load(wav_path, sr=sr)

#     mel = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=n_fft,
#                                          hop_length=hop_length, n_mels=n_mels)
#     mel_db = librosa.power_to_db(mel, ref=np.max)

#     # Normalize 0~255
#     mel_norm = 255 * (mel_db - mel_db.min()) / (mel_db.max() - mel_db.min())
#     mel_img = mel_norm.astype(np.uint8)

#     # Resize with PIL
#     img = Image.fromarray(mel_img).convert('L')           # Grayscale
#     img = img.resize(resize, resample=Image.BILINEAR)     # Resize to (224, 224)

#     # Optionally repeat channels for RGB model input
#     img_rgb = img.convert('RGB')                          # (224, 224, 3)

#     os.makedirs(os.path.dirname(out_path), exist_ok=True)
#     img_rgb.save(out_path)
#     print(f"Saved PNG: {out_path}")


# def batch_convert_wavs_to_pngs(input_dir='synthetic_data', output_dir='keras_spectrograms', sr=16000):
#     """
#     Convert all .wav files in subfolders to (224, 224, 3) PNGs
#     """
#     for class_dir in os.listdir(input_dir):
#         in_path = os.path.join(input_dir, class_dir)
#         out_path = os.path.join(output_dir, class_dir)
#         if not os.path.isdir(in_path):
#             continue

#         os.makedirs(out_path, exist_ok=True)

#         for fname in os.listdir(in_path):
#             if fname.endswith('.wav'):
#                 wav_path = os.path.join(in_path, fname)
#                 base = os.path.splitext(fname)[0]
#                 png_path = os.path.join(out_path, base + '.png')
#                 wav_to_png(wav_path, png_path, sr=sr)


# if __name__ == "__main__":
#     batch_convert_wavs_to_pngs(input_dir='synthetic_data', output_dir='keras_spectrograms', sr=16000)
