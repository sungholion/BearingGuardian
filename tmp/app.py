import streamlit as st
import pandas as pd # pandas 임포트 확인
import numpy as np
import joblib
from matplotlib import font_manager, rc
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import seaborn as sns
# from core.wav_processor import WavFeatureExtractor # 이미 임포트되어 있을 것입니다.

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
    # 이제 13개 피처 기반의 모델을 로드해야 합니다. 경로를 'model_13_features'로 변경
    # xgboost_gaussian_aug15.pkl이 어떤 모델인지 확인 필요. 13개 피처 학습 모델이라면 괜찮습니다.
    # 하지만 rf_model.pkl, scaler.pkl, label_encoder.pkl을 직접 로드하는 것이 더 안전합니다.
    
    # 기존 코드
    # data = joblib.load(r"C:\Users\jh\Desktop\py\bear\models\xgboost_gaussian_aug15.pkl")
    # model = data['model']
    # encoder = data['encoder']

    # 변경된 모델 로드 방식 (이전 대화에서 생성된 13개 피처 모델 로드)
    try:
        model_path = "model_13_features/rf_model.pkl"
        scaler_path = "model_13_features/scaler.pkl"
        label_encoder_path = "model_13_features/label_encoder.pkl"
        
        model = joblib.load(model_path)
        scaler_for_wav = joblib.load(scaler_path) # WAV 처리용 스케일러
        encoder = joblib.load(label_encoder_path)
        
        st.sidebar.success("모델, 스케일러, 라벨 인코더 로드 성공 (13 피처 기반)")
    except FileNotFoundError:
        st.sidebar.error(f"모델 파일을 찾을 수 없습니다. 경로 확인: {model_path}")
        st.stop()
    except Exception as e:
        st.sidebar.error(f"모델 로드 중 오류 발생: {e}")
        st.stop()
        
    return model, encoder, scaler_for_wav # scaler도 반환하도록 수정

# model, label_encoder = load_assets() # 기존 로드
model, label_encoder, scaler_for_wav = load_assets() # 스케일러도 받도록 수정

# feature_columns_order는 이제 CSV/개별 입력용이 됩니다.
# WAV 파일 처리 시에는 WavFeatureExtractor에서 생성하는 컬럼을 사용합니다.
feature_columns_order = ['max', 'min', 'rms', 'kurtosis', 'crest', 'form'] # 이미지 피처들

# --- 파일명에서 라벨 추출 함수 ---
def extract_actual_label(filename: str) -> str:
    # 기존 라벨 맵은 _1이 붙어있네요. 모델 라벨과 일치하는지 확인해야 합니다.
    # 만약 모델이 Normal_1로 예측하지 않고 Normal로 예측한다면, 이 맵도 Normal로 바꿔야 합니다.
    prefix_to_label = {
        "B007": "Ball_007", # _1 제거 또는 모델 라벨 확인
        "B014": "Ball_014",
        "B021": "Ball_021",
        "IR007": "InnerRace_007", # IR -> InnerRace
        "IR014": "InnerRace_014",
        "IR021": "InnerRace_021",
        "OR007_6_1": "OuterRace_007", # OR_007_6_1 -> OuterRace_007
        "OR014_6_1": "OuterRace_014",
        "OR021_6_1": "OuterRace_021",
        "Time_Normal": "Normal"
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
wav_processed_df_for_display = None # WAV 미리보기용 DataFrame

# --- 개별 입력 ---
if input_method == "개별 값 직접 입력":
    user_input = {col: st.number_input(f"{col}", value=0.0) for col in feature_columns_order}
    if st.button("예측 실행"):
        input_data_df = pd.DataFrame([user_input])
        # 개별 입력은 6개 피처만 있으므로, 모델이 13개 피처를 요구한다면
        # 이 부분을 보완해야 합니다. (나머지 7개 피처를 0 등으로 채우는 등)
        # 현재는 이 부분에서 오류가 날 수 있습니다.
        st.warning("개별 입력은 6개 피처만 입력받으므로, 13개 피처 모델에 적합하지 않을 수 있습니다.")


# --- CSV 업로드 ---
elif input_method == "CSV 파일 업로드":
    csv_file = st.file_uploader("CSV 파일 업로드", type=["csv"])
    if csv_file:
        df = pd.read_csv(csv_file)
        st.dataframe(df.head())
        
        # CSV 파일도 13개 피처 모두 포함하고 있어야 합니다.
        # feature_columns_order는 6개 피처만 정의하고 있습니다.
        # CSV 파일에 13개 피처가 모두 있다면, feature_columns_order를 업데이트해야 합니다.
        # 여기서는 CSV에 13개 피처가 있다고 가정하고 X에 df.values를 할당합니다.
        
        # CSV 파일의 컬럼명과 모델 학습 시 사용된 13개 피처의 순서 및 이름이 일치해야 합니다.
        # 예시 (실제 컬럼명으로 대체):
        # model_feature_cols = ['mean', 'std', 'rms', 'max', 'min', 'ptp', 'skew', 'kurtosis', 'shape_factor',
        #                       'fft_mean', 'fft_std', 'spectral_centroid', 'spectral_bandwidth']
        # if all(col in df.columns for col in model_feature_cols):
        #     input_data_df = df[model_feature_cols]
        # else:
        #     st.error("CSV 파일에 모델 예측에 필요한 13개 피처 컬럼이 누락되었습니다.")
        #     input_data_df = None
        
        # 현재 코드의 feature_columns_order (6개)와 불일치 가능성 경고
        if all(col in df.columns for col in feature_columns_order):
            input_data_df = df # 모든 컬럼을 포함하는 df를 input_data_df로 할당
            for label_col in ["label", "actual", "ground_truth", "정답", "target"]:
                if label_col in df.columns:
                    true_labels = df[label_col].tolist()
                    break
        else:
            st.error(f"CSV 파일에 필수 피처 컬럼이 누락되었습니다. 필요한 컬럼: {feature_columns_order}")
            input_data_df = None


# --- WAV 업로드 ---
elif input_method == "WAV 파일 업로드":
    wav_file = st.file_uploader("WAV 업로드", type=["wav"])
    if wav_file:
        from core.wav_processor import WavFeatureExtractor
        
        # WavFeatureExtractor가 13개 피처를 'model_input_features_for_scaler' 컬럼에 담아 반환
        extractor = WavFeatureExtractor()
        processed_df = extractor.process_wav_bytes(wav_file.read())
        
        # 미리보기에 사용할 DataFrame (model_input_features_for_scaler 컬럼 제외)
        wav_processed_df_for_display = processed_df.drop(columns=['model_input_features_for_scaler'])
        
        st.subheader("WAV 파일 데이터 미리보기")
        st.dataframe(wav_processed_df_for_display.head()) # 미리보기
        
        # 실제 예측에 사용할 데이터 (13개 피처)
        # scaler_for_wav 사용
        if not processed_df['model_input_features_for_scaler'].empty:
            X_for_prediction = np.array(processed_df['model_input_features_for_scaler'].tolist())
            
            try:
                # WavFeatureExtractor에서 추출한 13개 피처를 scaler_for_wav로 스케일링
                X_scaled = scaler_for_wav.transform(X_for_prediction)
            except Exception as e:
                st.error(f"WAV 피처 스케일링 중 오류 발생: {e}")
                st.error(f"스케일러의 기대 입력 피처 개수: {scaler_for_wav.n_features_in_}, 현재 추출된 피처 개수: {X_for_prediction.shape[1]}")
                st.stop() # 오류 발생 시 중지
                
            # 예측
            y_pred_encoded = model.predict(X_scaled)
            y_pred_labels = label_encoder.inverse_transform(y_pred_encoded)

            # 결과를 미리보기 DataFrame에 추가
            wav_processed_df_for_display["예측된_고장유형"] = y_pred_labels
            
            st.subheader("📊 예측 결과")
            st.dataframe(wav_processed_df_for_display) # 예측 결과가 추가된 DataFrame 표시

            # WAV 파일의 경우 파일명에서 실제 라벨 추출
            actual_label = extract_actual_label(wav_file.name)
            if actual_label:
                # WAV 파일은 여러 윈도우로 나뉘므로, 각 윈도우의 실제 라벨은 동일함
                true_labels = [actual_label] * len(processed_df) 
            else:
                st.info("⚠️ 파일명에서 정답 라벨을 추출할 수 없어 정확도 평가가 생략됩니다.")

        else:
            st.error("WAV 파일에서 피처를 추출할 수 없습니다. 파일 형식을 확인하거나 길이가 너무 짧지 않은지 확인하세요.")


# --- 예측 및 평가 (기존 로직은 WAV 파일 업로드 로직으로 통합되었으므로, 이 부분은 제거) ---
# 기존 input_data_df를 기반으로 하던 예측 및 평가 로직은 WAV 업로드 부분 안으로 이동해야 합니다.
# 왜냐하면 WAV의 경우, input_data_df가 아닌 X_for_prediction을 사용하기 때문입니다.
# 만약 개별 입력이나 CSV 업로드 후에도 동일한 평가 로직을 사용하고 싶다면,
# 이 부분을 함수로 만들어서 각 입력 방식 끝에서 호출하는 방식으로 재구성할 수 있습니다.
# 현재 제공해주신 app.py 코드에 맞춰 WAV 업로드 로직을 개선했습니다.

# --- 자동 평가 지표 (WAV 업로드에서 true_labels가 설정되었을 경우에만 실행) ---
if input_method == "WAV 파일 업로드" and true_labels is not None:
    st.markdown("### ✅ 자동 평가 지표 (파일명 기반)")

    # --- 실제 라벨 분포 ---
    st.markdown("#### 🎯 실제 라벨 분포")
    label_counts = pd.Series(true_labels).value_counts().rename("개수").reset_index()
    label_counts.columns = ["고장유형", "개수"]
    st.dataframe(label_counts)

    # 예측된 라벨은 이미 y_pred_encoded/y_pred_labels로 설정됨
    y_true = label_encoder.transform(true_labels)
    y_pred = y_pred_encoded # WAV 예측 결과 사용
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

# --- 모델 정보 출력 (기존 위치 유지) ---
st.sidebar.header("모델 정보")