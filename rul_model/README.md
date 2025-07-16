# BearingGuardian

베어링 진동 데이터 기반 불량 유형 예측 및 잔여수명 예측 시스템

## 프로젝트 구조

```
BearingGuardian/
│
├── backend/                # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py           # FastAPI 앱 엔트리포인트
│   │   ├── api/
│   │   │   └── ml.py         # 머신러닝 관련 API
│   │   ├── core/
│   │   │   ├── config.py     # 환경설정
│   │   │   └── database.py   # DB 연결 설정
│   │   ├── models/
│   │   │   ├── schemas.py    # Pydantic 모델
│   │   │   └── db_models.py  # SQLAlchemy ORM 모델
│   │   └── services/
│   │       └── ml_service.py # ML 비즈니스 로직
│   ├── requirements.txt    # 백엔드 의존성
│   └── .env               # 환경변수
│
├── frontend/              # React 프론트엔드
│   ├── public/              # 정적 파일
│   ├── src/                 # React 소스코드
│   ├── package.json         # 프론트엔드 의존성
│   └── ...
│
├── data/                  # 데이터셋, 샘플 데이터
├── scripts/               # 데이터 전처리, 학습 스크립트
└── README.md
```

## 기술 스택
- Backend: FastAPI, SQLAlchemy, MySQL
- Frontend: React
- ML/DL: (추후 추가 예정)
- DDDDD