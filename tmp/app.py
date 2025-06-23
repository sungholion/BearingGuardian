import streamlit as st
import pandas as pd
import numpy as np
import joblib
from matplotlib import font_manager, rc
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import seaborn as sns

# --- 한글 폰트 설정 ---
try:
    font_name = font_manager.FontProperties(fname="C:/Windows/Fonts/malgun.ttf").get_name()
    rc('font', family=font_name)
    plt.rcParams['axes.unicode_minus'] = False
except Exception:
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False

st.set_page_config(page_title="베어링 고장 예측 앱", layout="centered")
st.title("🧰 베어링 고장 예측 앱")
st.markdown("특징 값을 직접 입력하거나 CSV/WAV 파일을 업로드하여 예측 및 자동 평가를 진행합니다.")

# --- 모델 로드 ---
@st.cache_resource
def load_assets():
    data = joblib.load(r"C:\Users\jh\Desktop\py\bear\models\xgboost_gaussian_aug15.pkl")
    model = data['model']
    encoder = data['encoder']
    return model, encoder


model, label_encoder = load_assets()
feature_columns_order = ['max', 'min', 'rms', 'kurtosis', 'crest', 'form']

# --- 파일명에서 라벨 추출 함수 ---
def extract_actual_label(filename: str) -> str:
    prefix_to_label = {
        "B007": "Ball_007_1",
        "B014": "Ball_014_1",
        "B021": "Ball_021_1",
        "IR007": "IR_007_1",
        "IR014": "IR_014_1",
        "IR021": "IR_021_1",
        "OR007_6_1": "OR_007_6_1",
        "OR014_6_1": "OR_014_6_1",
        "OR021_6_1": "OR_021_6_1",
        "Time_Normal": "Normal_1"
    }
    for prefix, label in prefix_to_label.items():
        if prefix in filename:
            return label
    return None

# --- 입력 방식 선택 ---
st.header("입력 방식 선택")
input_method = st.radio("선택:", ("개별 값 직접 입력", "CSV 파일 업로드", "WAV 파일 업로드"))
input_data_df = None
true_labels = None

# --- 개별 입력 ---
if input_method == "개별 값 직접 입력":
    user_input = {col: st.number_input(f"{col}", value=0.0) for col in feature_columns_order}
    if st.button("예측 실행"):
        input_data_df = pd.DataFrame([user_input])

# --- CSV 업로드 ---
elif input_method == "CSV 파일 업로드":
    csv_file = st.file_uploader("CSV 파일 업로드", type=["csv"])
    if csv_file:
        df = pd.read_csv(csv_file)
        st.dataframe(df.head())
        if all(col in df.columns for col in feature_columns_order):
            input_data_df = df
            for label_col in ["label", "actual", "ground_truth", "정답", "target"]:
                if label_col in df.columns:
                    true_labels = df[label_col].tolist()
                    break
        else:
            st.error("필수 컬럼 누락됨.")

# --- WAV 업로드 ---
elif input_method == "WAV 파일 업로드":
    wav_file = st.file_uploader("WAV 업로드", type=["wav"])
    if wav_file:
        from core.wav_processor import WavFeatureExtractor
        extractor = WavFeatureExtractor()
        df = extractor.process_wav_bytes(wav_file.read())
        st.dataframe(df.head())
        if all(col in df.columns for col in feature_columns_order):
            input_data_df = df
            actual_label = extract_actual_label(wav_file.name)
            if actual_label:
                true_labels = [actual_label] * len(df)
        else:
            st.error("필수 피처 누락됨.")

# --- 예측 및 평가 ---
if input_data_df is not None:
    X = input_data_df[feature_columns_order].values
    y_pred_encoded = model.predict(X)
    y_pred_labels = label_encoder.inverse_transform(y_pred_encoded)

    result_df = input_data_df.copy()
    result_df["예측된_고장유형"] = y_pred_labels
    st.subheader("📊 예측 결과")
    st.dataframe(result_df)

    # --- 평가 지표 출력 ---
    if true_labels is not None:
        st.markdown("### ✅ 자동 평가 지표 (파일명 기반)")

        # --- 실제 라벨 분포 ---
        st.markdown("#### 🎯 실제 라벨 분포")
        label_counts = pd.Series(true_labels).value_counts().rename("개수").reset_index()
        label_counts.columns = ["고장유형", "개수"]
        st.dataframe(label_counts)

        y_true = label_encoder.transform(true_labels)
        y_pred = y_pred_encoded
        labels_present = sorted(list(set(y_true) | set(y_pred)))

        # --- classification report
        report_df = pd.DataFrame(classification_report(
            y_true, y_pred,
            target_names=label_encoder.inverse_transform(labels_present),
            labels=labels_present,
            output_dict=True
        )).transpose()
        st.dataframe(report_df)
        st.markdown(f"🎯 **정확도:** {round(accuracy_score(y_true, y_pred), 4)}")

        # --- confusion matrix (정수)
        cm = confusion_matrix(y_true, y_pred, labels=labels_present)
        fig1, ax1 = plt.subplots()
        sns.heatmap(cm, annot=True, fmt='d', cmap="Blues",
                    xticklabels=label_encoder.inverse_transform(labels_present),
                    yticklabels=label_encoder.inverse_transform(labels_present), ax=ax1)
        ax1.set_xlabel("예측 클래스")
        ax1.set_ylabel("실제 클래스")
        ax1.set_title("Confusion Matrix (정수)")
        st.pyplot(fig1)

        # --- confusion matrix (정규화)
        cm_norm = confusion_matrix(y_true, y_pred, labels=labels_present, normalize="true")
        fig2, ax2 = plt.subplots()
        sns.heatmap(cm_norm, annot=True, fmt='.2f', cmap="YlGnBu",
                    xticklabels=label_encoder.inverse_transform(labels_present),
                    yticklabels=label_encoder.inverse_transform(labels_present), ax=ax2)
        ax2.set_xlabel("예측 클래스")
        ax2.set_ylabel("실제 클래스")
        ax2.set_title("Confusion Matrix (정규화 비율)")
        st.pyplot(fig2)

        # --- 예측 vs 실제 테이블
        mismatch_df = pd.DataFrame({
            "실제": label_encoder.inverse_transform(y_true),
            "예측": label_encoder.inverse_transform(y_pred)
        })
        st.markdown("#### 🔍 예측 vs 실제 비교 테이블")
        st.dataframe(mismatch_df)

    else:
        st.info("⚠️ 정답 라벨이 없어 정확도 평가 생략됨.")

# --- 모델 정보 출력 ---
st.sidebar.header("모델 정보")
