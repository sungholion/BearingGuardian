# 베어링 가디언 시스템 - 아키텍처 문서

이 문서는 Hadoop, Spark, Kafka를 활용한 베어링 모니터링 시스템의 아키텍처를 설명합니다.

## 📋 목차

1. [Use Case 다이어그램](#use-case-다이어그램)
2. [시스템 아키텍처 다이어그램](#시스템-아키텍처-다이어그램)
3. [데이터 플로우 다이어그램](#데이터-플로우-다이어그램)
4. [기술 스택](#기술-스택)
5. [시스템 특징](#시스템-특징)

## 🎯 Use Case 다이어그램

**파일**: `use_case_diagram.puml`

베어링 가디언 시스템의 주요 사용자와 기능을 보여주는 Use Case 다이어그램입니다.

### 주요 액터
- **시스템 관리자**: 시스템 설정, 사용자 권한, 모델 관리
- **운영자**: 실시간 모니터링, 알림 관리, 보고서 생성
- **분석가**: 트렌드 분석, 예측 정확도 분석, 모델 학습
- **베어링 센서**: 실시간 데이터 수집
- **알림 시스템**: 자동 알림 전송

### 주요 기능 레이어
1. **데이터 수집 레이어**: 센서 데이터 수집 및 검증
2. **데이터 처리 레이어**: HDFS 저장, Spark 처리
3. **분석 및 예측 레이어**: 머신러닝 기반 예측
4. **모니터링 레이어**: 실시간 상태 모니터링
5. **관리 레이어**: 시스템 관리 및 설정
6. **보고서 레이어**: 분석 보고서 생성

## 🏗️ 시스템 아키텍처 다이어그램

**파일**: `system_architecture.puml`

전체 시스템의 컴포넌트 구조와 상호작용을 보여주는 아키텍처 다이어그램입니다.

### 주요 레이어
1. **데이터 수집 레이어**: 센서 데이터 수집 및 Kafka 전송
2. **메시지 브로커**: Kafka 클러스터를 통한 데이터 스트리밍
3. **데이터 처리 레이어**: Spark Streaming/Batch 처리
4. **데이터 저장 레이어**: HDFS, HBase, Redis
5. **머신러닝 레이어**: MLlib 기반 예측 및 학습
6. **비즈니스 로직 레이어**: 베어링 분석 및 예측
7. **API 레이어**: REST API 및 WebSocket
8. **프레젠테이션 레이어**: 웹 대시보드 및 모바일 앱
9. **모니터링 레이어**: 시스템 모니터링 및 로깅

## 🔄 데이터 플로우 다이어그램

**파일**: `data_flow_diagram.puml`

시스템 내 데이터의 흐름과 처리 과정을 보여주는 시퀀스 다이어그램입니다.

### 데이터 플로우 단계
1. **실시간 데이터 처리**: 센서 → 수집기 → Kafka → Spark Streaming → 예측
2. **배치 데이터 처리**: Kafka → HDFS → Spark Batch → 전처리
3. **모델 업데이트**: HDFS → 예측 엔진 → 모델 갱신
4. **모니터링 및 알림**: 예측 결과 → 알림 시스템 → 대시보드

## 🛠️ 기술 스택

### 핵심 기술
- **Apache Kafka**: 실시간 메시지 브로커
- **Apache Hadoop HDFS**: 분산 파일 시스템
- **Apache Spark**: 실시간/배치 데이터 처리
- **Apache Spark MLlib**: 분산 머신러닝
- **Redis**: 인메모리 캐시
- **HBase**: NoSQL 데이터베이스

### 추가 기술
- **Python**: 백엔드 개발
- **FastAPI**: REST API 서버
- **WebSocket**: 실시간 통신
- **React/Vue.js**: 프론트엔드 대시보드
- **Docker**: 컨테이너화
- **Kubernetes**: 오케스트레이션

## ✨ 시스템 특징

### 실시간 처리
- Kafka를 통한 실시간 데이터 스트리밍
- Spark Streaming으로 마이크로 배치 처리
- 실시간 예측 및 알림

### 확장성
- 분산 아키텍처로 수평 확장 가능
- 클러스터 기반 처리로 대용량 데이터 처리
- 모듈화된 구조로 기능 확장 용이

### 고가용성
- 장애 복구 기능
- 데이터 백업 및 복구
- 시스템 모니터링 및 로깅

### 머신러닝
- 실시간 이상 감지
- 베어링 상태 예측
- 고장 예측 모델
- 자동 모델 업데이트

## 📊 다이어그램 생성 방법

이 다이어그램들은 PlantUML을 사용하여 작성되었습니다.

### PlantUML 설치 및 실행
```bash
# PlantUML JAR 파일 다운로드
wget https://github.com/plantuml/plantuml/releases/download/v1.2023.10/plantuml-1.2023.10.jar

# 다이어그램 생성
java -jar plantuml.jar use_case_diagram.puml
java -jar plantuml.jar system_architecture.puml
java -jar plantuml.jar data_flow_diagram.puml
```

### 온라인 도구
- [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
- [PlantText](https://www.planttext.com/)

## 📝 참고사항

- 모든 다이어그램은 PlantUML 문법으로 작성되었습니다
- 실제 구현 시에는 비즈니스 요구사항에 맞게 조정이 필요합니다
- 보안, 성능, 확장성 등을 고려한 추가 설계가 필요합니다 