from joblib import load
import os

class ModelLoader:
    def __init__(self, model_dir=None):
        if model_dir is None:
            # backend/에서 실행된다고 가정
            self.model_dir = "app/models"
        else:
            self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.label_encoder = None
    
    def load_models(self):
        """모델 파일들 로드"""
        self.model = load(os.path.join(self.model_dir, "clf_augmented_rf_model.joblib"))
        self.scaler = load(os.path.join(self.model_dir, "scaler_augmented_data.joblib"))
        self.label_encoder = load(os.path.join(self.model_dir, "label_encoder.joblib"))
    
    def get_models(self):
        """로드된 모델들 반환"""
        return self.model, self.scaler, self.label_encoder 