from flask import Flask, render_template, request
from tensorflow.keras.models import load_model
from tensorflow.keras import backend as K
import librosa, soundfile as sf
from io import BytesIO
import numpy as np
import os

# focal loss
def focal_loss(gamma=2., alpha=0.25):
    def focal_loss_fixed(y_true, y_pred):
        eps = K.epsilon()
        y_pred = tf.clip_by_value(y_pred, eps, 1. - eps)
        pt = tf.where(tf.equal(y_true, 1), y_pred, 1 - y_pred)
        loss = -alpha * tf.pow(1. - pt, gamma) * tf.math.log(pt)
        return tf.reduce_mean(loss)
    return focal_loss_fixed

app = Flask(__name__)
model = load_model("transformer_focal_model_v2.h5",
                   custom_objects={'focal_loss_fixed': focal_loss(gamma=2.0, alpha=0.25)})

@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    if request.method == "POST":
        files = request.files.getlist("files")
        X = []
        y_true = []  # 실제 라벨

        for file in files:
            fname = file.filename.lower()
            if 'normal' in fname:
                y_true.append(0)
            elif 'anomaly' in fname:
                y_true.append(1)
            else:
                y_true.append(-1)  # 라벨 불명

            wav_bytes = BytesIO(file.read())
            y, sr = sf.read(wav_bytes)
            mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
            mel_db = librosa.power_to_db(mel, ref=np.max)
            mel_db = librosa.util.fix_length(mel_db, size=313, axis=1)
            X.append(mel_db[..., np.newaxis])

        X = np.array(X)
        preds = model.predict(X).ravel()
        preds_binary = (preds > 0.35747).astype(int)

        # 예측/실제 비교
        correct = sum([1 for p, t in zip(preds_binary, y_true) if p == t])
        total = len(y_true)
        acc = round(correct / total * 100, 2)

        result = {
            '정상(예측)': int((preds_binary == 0).sum()),
            '이상(예측)': int((preds_binary == 1).sum()),
            '정상(실제)': int((np.array(y_true) == 0).sum()),
            '이상(실제)': int((np.array(y_true) == 1).sum()),
            '전체': total,
            '정확도': f"{acc}%"
        }

    return render_template("index.html", result=result)
if __name__ == "__main__":
    app.run(debug=True) 