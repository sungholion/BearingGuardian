import sys
import os
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
project_root = Path(__file__).parent.parent
backend_path = project_root / "backend"
sys.path.insert(0, str(backend_path))

from app.modules.model_loader import ModelLoader

# 모델 파일이 모두 존재하는지 확인
REQUIRED_FILES = [
    "clf_augmented_rf_model.joblib",
    "scaler_augmented_data.joblib",
    "label_encoder.joblib"
]
MODEL_DIR = "backend/app/models"

def test_model_files_exist():
    for file in REQUIRED_FILES:
        file_path = os.path.join(MODEL_DIR, file)
        assert os.path.exists(file_path), f"{file} 파일이 존재하지 않습니다."

def test_model_loader_loads():
    loader = ModelLoader()
    loader.load_models()
    model, scaler, label_encoder = loader.get_models()
    assert model is not None
    assert scaler is not None
    assert label_encoder is not None 