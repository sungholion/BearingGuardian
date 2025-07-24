# 'Bearing Guardian' - AI 기반 베어링 모니터링 시스템

<h3>삼성취업아카데미-삼성SDS 빅데이터 분석 심화 프로젝트</h3>
</br>

<div align="center">
<img width="300" height="300" alt="Image" src="https://github.com/user-attachments/assets/fe1c36ea-0bab-4570-a9f3-472008df005c" />
</div>



# 팀원 소개

<div align="center">

| <img src="https://github.com/sungholion.png" width="100"/> | <img src="https://github.com/ezypzylemon.png" width="100"/> | <img src="https://github.com/JEONGEUNdd.png" width="100"/> | <img src="https://github.com/Heojiwonnn.png" width="100"/> |
|:---------------------------------------------------------:|:-------------------------------------------------------:|:----------------------------------------------------------:|:---------------------------------------------------------:|
|      [조성호 - BE/Data/PM](https://github.com/sungholion)         |       [박정훈 - BE/Data](https://github.com/ezypzylemon)       |       [임정은 - BE/Data](https://github.com/JEONGEUNdd)       |       [허지원 - FE/Data](https://github.com/Heojiwonnn)       

</div>

</br>

<center>
<h1>Tech Stack</h1>


### Infra
<p>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Airflow-017CEE?style=for-the-badge&logo=Apache%20Airflow&logoColor=white"/>
  <img src="https://img.shields.io/badge/Amazone S3-569A31?style=for-the-badge&logo=AmazonS3%20S3&logoColor=white"/>
</p>

### Data Pipeline
<p>
  <img src="https://img.shields.io/badge/Kafka-231F20?style=for-the-badge&logo=Apache%20Kafka&logoColor=white"/>
  <img src="https://img.shields.io/badge/Hadoop-66CCFF?style=for-the-badge&logo=Apache%20Hadoop&logoColor=white"/>
  <img src="https://img.shields.io/badge/Hive-FDEE21?style=for-the-badge&logo=Apache%20Hive&logoColor=black"/>
  <img src="https://img.shields.io/badge/Spark-E25A1C?style=for-the-badge&logo=Apache%20Spark&logoColor=white"/>
</p>

### Backend
<p>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=Flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=WebSocket&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=Redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=PostgreSQL&logoColor=white"/>
</p>

### Data Analysis
<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=Python&logoColor=white"/>
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white"/>
  <img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=TensorFlow&logoColor=white"/>
</p>

### FrontEnd

<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white"/>
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=TailwindCSS&logoColor=white"/>
</p>


### Team Collaboration Tools
<p>
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"/>  
  <img src="https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=fff&style=for-the-badge">
  <img src="https://img.shields.io/badge/Notion-000?logo=notion&logoColor=fff&style=for-the-badge">
</p>

</center>

</br>
</br>
<h1>Architecture</h1>
<img width="1007" height="695" alt="Image" src="https://github.com/user-attachments/assets/ee29daed-9149-4a25-835c-d43b5e553bef" />

# 소개

### 🌃 기획 의도

> 기존 베어링 이상 탐지 모니터링 시스템보다 효율적인 서비스를 만들 수 있을까?

모터와 같은 회전하는 부품 사이에서 마찰을 줄여 에너지 손실을 줄여주는 **베어링** 부품은 다양한 산업에 사용됩니다. </br>
베어링이 마모되며 고장이 난다면, 설비 전체에 영향을 끼칠 수 있기에 미리 베어링의 이상을 감지하는 모니터링 시스템이 필요합니다. </br>
기존의 베어링 모니터링 시스템도 충분히 효과적이지만, **진동 센서** 기반이라 비싸다는 단점이 있습니다.

이를 해결하기 위해 **음향 센서**를 활용래 더 효율적이고 저렴한 베어링 모니터링 서비스를 만들게 되었습니다.

<br>
<br>

### 서비스 대상

- 고비용의 진동 센서 기반 모니터링 시스템 도입이 부담스러운 중소기업
- 기존 진동 센서 기반 모니터링 시스템 유지 비용이 부담스러운 기업

비용 감소에 초점을 맞춰 기획을 진행하였고, 기존 솔루션보다 정확도를 높이기 위해 노력했습니다.

<br>
<br>

### 💎 서비스 기능

Dashboard

- 실시간 베어링 소음 센서 데이터 확인 가능
- 실시간 베어링 소음 주파수 분석 데이터 확인 가능
- 실시간 베어링 이상 유형 분류 결과 확인 가능
- 실시간 베어링 잔여 수명(RUL) 예측 결과 확인 가능
- 환경(온도, 습도), 센서 및 모델 구동 상태 확인 가능
- 다수의 베어링에 대한 분석 결과 한 번에 확인 가능
- 모니터링 시스템에 이슈 발생시 알림 발송 가능

History
- 대량의 센서 데이터를 한번에 분석한 결과 내역을 필터(날짜, 특정 베어링)를 통해 확인 가능
- 누적 분석 결과를 다양한 차트를 통해 확인 가능
- 누적 분석 결과를 PDF로 다운로드 가능

Settings
- 사용자 프로필 수정 가능
- 시스템 테마(라이트/다크 모드), 언어(한국어/English) 선택 가능
- 시스템 로그 확인 가능

<br>
<br>

# 🎇 서비스 이용 화면

## 회원가입 & 로그인

### 로그인

첫 화면


<br>
<br>

# 🔨 사용한 기술

## Kafka

본 프로젝트에서는 실제로 동작하는 베어링 소음 센서 데이터를 흉내내기 위해 베어링 소음 테스트 데이터셋으로 시뮬레이터를 구현하였습니다.
Kafka는 대용량 데이터를 안정적으로 처리할 수 있어, 센서 시뮬레이터에서 발생한 데이터를 Flask 기반 웹 서버로 비동기적으로 전달하는 데 사용되었습니다. 이를 통해 실시간 처리 및 확장성 있는 데이터 흐름을 구축할 수 있었습니다.

- **Producer**: 베어링에서 생성되는 시뮬레이션 데이터를 Kafka 토픽으로 전송합니다. 이 데이터는 베어링의 상태를 나타내는 다양한 센서 값을 포함합니다.
- **Consumer**: Kafka 토픽에서 데이터를 실시간으로 수신하고, WebSocket을 통해 Frontend로 전달합니다.

<img width="600" height="500" alt="Image" src="https://github.com/user-attachments/assets/c8cefe0f-9c1a-47f0-89a5-987c4d2f21ca" />

## Hadoop
대용량의 베어링 센서 데이터를 안정적으로 저장하고 관리하기 위해 Hadoop의 분산 파일 시스템인 HDFS(Hadoop Distributed File System)를 사용합니다.
HDFS는 데이터를 여러 노드에 분산 저장하여 높은 처리량과 데이터 안정성을 보장하며, 이는 장기간의 시계열 데이터를 기반으로 한 모델 학습 및 분석의 기반이 됩니다.

## Hive
HDFS에 저장된 대규모 정형 데이터를 쉽게 질의하고 분석하기 위해 데이터 웨어하우스 시스템인 Hive를 도입했습니다. 
HiveSQL이라는 SQL과 유사한 언어를 사용하여 Hadoop 클러스터에 저장된 데이터를 배치 처리하고, 주기적인 리포트 생성 및 통계 분석 작업을 수행합니다. 

## Spark
본 프로젝트의 핵심 데이터 처리 엔진으로 Apache Spark를 활용합니다. Spark는 대규모 배치 처리를 모두 지원합니다.
**Spark MLlib & Batch**: HDFS에 축적된 대규모 데이터를 사용하여 머신러닝 모델을 학습하고 평가합니다. 주기적으로 새로운 데이터로 모델을 재학습하여 예측 성능을 지속적으로 개선합니다.



