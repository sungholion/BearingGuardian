# BearingGuardian 디렉토리 구조 설명

```
BearingGuardian/
├
├── backend/                      # 🖥️ 백엔드 서버 (FastAPI)
│   ├── app/
│   │   ├── __init__.py          # FastAPI 앱 초기화
│   │   ├── api/                 # 🔌 API 엔드포인트들
│   │   │   ├── __init__.py
│   │   │   ├── routes.py        # 라우터 설정
│   │   │   └── endpoints/       # 📡 API 엔드포인트 구현
│   │   │       ├── __init__.py
│   │   │       ├── health.py    # 서버 상태 확인
│   │   │       ├── prediction.py # 예측 API
│   │   │       ├── statistics.py # 통계 API
│   │   │       └── upload.py    # 파일 업로드 API
│   │   │
│   │   ├── config/              # ⚙️ 설정 파일들
│   │   │   ├── __init__.py
│   │   │   ├── database.py      # DB 연결 설정
│   │   │   └── settings.py      # 앱 설정
│   │   │
│   │   ├── data/                # 📊 데이터 저장소
│   │   │
│   │   ├── models/              # 🔬 ML 모델 파일들 (joblib)
│   │   │   ├── clf_augmented_rf_model.joblib  # 훈련된 모델
│   │   │   ├── label_encoder.joblib           # 클래스 인코더
│   │   │   └── scaler_augmented_data.joblib   # 특성 스케일러
│   │   │
│   │   ├── modules/             # 🧩 핵심 기능 모듈들
│   │   │   ├── __init__.py
│   │   │   ├── database/        # 💾 데이터베이스 관련
│   │   │   │   ├── __init__.py
│   │   │   │   ├── connection.py # DB 연결
│   │   │   │   ├── models.py     # DB 모델 정의
│   │   │   │   └── repository.py # 데이터 접근 로직
│   │   │   │
│   │   │   ├── model_loader/    # 📦 모델 로딩 (데이터 모델 팀이 사용)
│   │   │   │   ├── __init__.py
│   │   │   │   └── model_loader.py # joblib 파일 로드
│   │   │   │
│   │   │   ├── predictor/       # 🔮 예측 엔진
│   │   │   │   ├── __init__.py
│   │   │   │   └── predictor.py # ML 모델로 예측 수행
│   │   │   │
│   │   │   ├── preprocessor/    # 🔧 데이터 전처리
│   │   │   │   ├── __init__.py
│   │   │   │   └── wav_preprocessor.py # WAV 파일 → 13개 특성 추출
│   │   │   │
│   │   │   └── statistics/      # 📈 통계 기능
│   │   │       └── __init__.py
│   │   │
│   │   ├── schemas/             # 📋 API 요청/응답 형식 정의
│   │   │   ├── __init__.py
│   │   │   ├── health.py        # 헬스체크 응답 형식
│   │   │   ├── prediction.py    # 예측 요청/응답 형식
│   │   │   ├── statistics.py    # 통계 응답 형식
│   │   │   └── upload.py        # 업로드 응답 형식
│   │   │
│   │   └── utils/               # 🛠️ 유틸리티 함수들
│   │       └── __init__.py
│   │
│   ├── requirements.txt         # 📦 Python 패키지 의존성
│   ├── test_db_connection.py   # 🧪 DB 연결 테스트
│   └── tmp/                    # 📁 임시 파일 저장소
│
├── docker-compose.yml          # 🐳 Docker 컨테이너 설정
├── docs/                       # 📚 문서들
│   ├── README.md              # 프로젝트 설명서
│   └── system_architecture.puml # 시스템 아키텍처 다이어그램
│
├── frontend/                   # 🎨 프론트엔드 (미구현)
├── pyproject.toml             # 📋 프로젝트 설정
├── README.md                  # 📖 메인 README
├── shared/                    # 🔗 공유 모듈
│   └── __init__.py
│
├── tests/                     # 🧪 테스트 코드들
│   ├── __init__.py
│   ├── test_database.py       # DB 테스트
│   ├── test_model_loader.py   # 모델 로더 테스트
│   ├── test_predictor.py      # 예측기 테스트
│   └── test_wav_preprocessor.py # WAV 전처리 테스트
│
└── venv/                      # 🐍 Python 가상환경
```

## 🎯 **팀별 영역**

### 🔬 **데이터 모델 팀(정훈,정은)이 보는 부분**
```
backend/app/models/              # ← 여기에 joblib 파일만 추가하면 됨
backend/app/modules/model_loader/ # ← 여기서 모델 등록 (1줄 추가)
backend/app/modules/preprocessor/ # ← 여기서 특성 추출 로직 확인
```

### 🎨 **프론트엔드 개발자(지원)가 보는 부분**
```
backend/app/api/endpoints/       # ← 여기서 API 엔드포인트 확인
backend/app/schemas/            # ← 여기서 요청/응답 형식 확인
```

### 🖥️ **백엔드 팀이 관리하는 부분**
```
backend/app/                    # ← 전체 백엔드 코드
backend/requirements.txt        # ← 의존성 관리
```

## 📋 **핵심 파일 설명**

### 🔬 **데이터 모델 팀용**
- `backend/app/models/*.joblib` - ML 모델 파일들
- `backend/app/modules/model_loader/model_loader.py` - 모델 로딩 로직
- `backend/app/modules/preprocessor/wav_preprocessor.py` - 특성 추출 로직

### 🎨 **프론트엔드 팀용**
- `backend/app/api/endpoints/upload.py` - 파일 업로드 API
- `backend/app/api/endpoints/prediction.py` - 예측 API
- `backend/app/schemas/` - API 형식 정의

### 🖥️ **백엔드 팀용**
- `backend/app/__init__.py` - FastAPI 앱 설정
- `backend/app/api/routes.py` - API 라우팅
- `backend/app/modules/predictor/predictor.py` - 예측 엔진

## 🚀 **작업 플로우**

### 🔬 **데이터 모델 팀**
1. ML 모델 훈련 → joblib 파일 생성
2. `backend/app/models/`에 파일 복사
3. `model_loader.py`에 모델 등록 (1줄)
4. 서버 재시작 → 완료!

### 🎨 **프론트엔드 팀**
1. `backend/app/api/endpoints/`에서 API 확인
2. `backend/app/schemas/`에서 형식 확인
3. 프론트엔드에서 API 호출 → 완료!

**이렇게 각 팀이 자신의 영역만 알면 되는 깔끔한 구조!** ✨ 