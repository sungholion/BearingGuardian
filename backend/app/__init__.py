"""
BearingGuardian Backend Application

베어링 고장 예측 시스템의 FastAPI 백엔드 애플리케이션
"""

from fastapi import FastAPI # FastAPI 애플리케이션 생성용 클래스
from fastapi.middleware.cors import CORSMiddleware # CORS 설정용 미들웨어
from fastapi.middleware.trustedhost import TrustedHostMiddleware # 신뢰할 수 있는 호스트 설정용 미들웨어, 개발 단계에서는 "*"로 허용하고, 배포 시에는 꼭 특정 도메인만 허용
import logging # Python 기본 로깅 모듈
import uvicorn # FASTAPI 실행 서버

from .config.settings import settings # app/config/settings.py에 있는 Settings 클래스 인스턴스
from .api.routes import api_router # app/api/routes.py에 있는 api_router 객체


### 애플리케이션 생성 함수 시작
def create_app() -> FastAPI:
    """FastAPI 애플리케이션 생성"""
    
    # 로깅 설정
    logging.basicConfig(
        level=getattr(logging, settings.log_level), # 개발 중 : DEBUG, 배포 중 : INFO
        format=settings.log_format
    )
    
    # FastAPI app 생성
    app = FastAPI(
        title=settings.app_name, # BearingGuardian
        version=settings.app_version, # 1.0.0
        description="""
        # BearingGuardian API
        
        베어링 진동 데이터를 분석하여 고장 유형을 예측하는 머신러닝 기반 시스템입니다.
        
        ## 주요 기능
        - 🎯 **실시간 고장 예측**: 진동 데이터로 즉시 고장 유형 분석
        - 📊 **배치 처리**: 여러 데이터 일괄 분석
        - 📈 **통계 정보**: 예측 히스토리 및 성능 지표
        - 🎵 **오디오 처리**: WAV 파일 업로드 및 분석
        
        ## 지원하는 고장 유형
        - 정상 (Normal)
        - 내륜 고장 (Inner Race Fault)
        - 외륜 고장 (Outer Race Fault)
        - 볼 고장 (Ball Fault)
        
        ## 사용 방법
        1. 진동 데이터의 13개 특성값을 입력
        2. API 호출로 고장 유형 예측
        3. 신뢰도와 확률 정보 확인
        """,
        docs_url="/docs", #  Swagger 페이지 경로
        redoc_url="/redoc", # UI 다른 문서 페이지 경로
        debug=settings.debug # 개발 중 : True, 배포 중 : False
    )
    
    # CORS 미들웨어 설정 - 프론트와 백엔드 간 포트 다를 때도 통신 허용할 수 있는 브라우저 보안 정책
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Trusted Host 미들웨어 설정
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # 배포시에는 특정 호스트만 허용
    )
    
    # API 라우터 등록
    app.include_router(api_router, prefix=settings.api_prefix)
    
    # 헬스체크 엔드포인트 - 서버 살아있는지지
    @app.get("/health")
    async def health_check():
        """헬스체크 엔드포인트"""
        return {
            "status": "healthy",
            "app_name": settings.app_name,
            "version": settings.app_version
        }
    
    # 루트 엔드포인트
    @app.get("/")
    async def root():
        """루트 엔드포인트"""
        return {
            "message": f"Welcome to {settings.app_name} API",
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/health"
        }
    
    return app
### 애플리케이션 생성 함수 끝

# 애플리케이션 인스턴스 생성
app = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
