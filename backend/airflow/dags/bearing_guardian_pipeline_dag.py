
# -*- coding: utf-8 -*-

from __future__ import annotations

import pendulum

from airflow.models.dag import DAG
from airflow.operators.bash import BashOperator
from airflow.providers.docker.operators.docker import DockerOperator

# ==============================================================================
#  Airflow DAG for Bearing Guardian Pipeline Orchestration
# ==============================================================================
# 설명:
# 이 Airflow DAG는 Bearing Guardian 프로젝트의 전체 데이터 파이프라인을
# 오케스트레이션합니다. 각 단계를 Task로 정의하고, Task 간의 의존성을 설정하여
# 전체 워크플로우를 자동화하고 관리합니다.
#
# 워크플로우:
# 1.  (Preparation) 이전 Docker 컨테이너 정리
# 2.  (ETL) HDFS/Hive 데이터를 Spark로 전처리하여 S3에 저장 (Spark Job 실행)
# 3.  (ML) S3의 데이터를 Spark ML 모델로 예측하여 PostgreSQL에 저장 (Spark Job 실행)
# 4.  (Archiving) Redis 데이터를 HDFS로 아카이빙 (Batch Job 실행)
# 5.  (Cleanup) 작업 완료 후 리소스 정리
#
# 각 Operator는 Docker 컨테이너를 실행하거나, 원격 서버에서 Bash 스크립트를
# 실행하는 방식으로 동작하는 것을 시뮬레이션합니다.
# ==============================================================================

with DAG(
    dag_id="bearing_guardian_daily_pipeline",
    schedule="@daily",  # 매일 자정에 이 DAG를 실행
    start_date=pendulum.datetime(2025, 7, 23, tz="Asia/Seoul"),
    catchup=False,
    doc_md="""
    ### Bearing Guardian Daily Pipeline

    이 DAG는 매일 실행되며, 데이터 수집, 처리, 예측, 아카이빙의 전체 과정을 자동화합니다.
    - **ETL**: Hive/HDFS -> Spark -> S3
    - **ML**: S3 -> Spark ML -> PostgreSQL
    - **Archiving**: Redis -> HDFS
    """,
    tags=["bearing-guardian", "data-pipeline", "production"],
) as dag:

    # --- Task 1: 이전 Docker 컨테이너 정리 --- #
    # 워크플로우 시작 전, 이전에 실행되었을 수 있는 컨테이너를 정리하여
    # 깨끗한 환경에서 작업을 시작하도록 보장합니다.
    cleanup_previous_containers = BashOperator(
        task_id="cleanup_previous_containers",
        bash_command="echo '[Airflow] docker-compose -f /path/to/backend/docker-compose.yml down -v || true'",
        doc_md="이전 Docker 스택을 정리하여 충돌을 방지합니다.",
    )

    # --- Task 2: Spark ETL 작업 실행 --- #
    # DockerOperator를 사용하여 Spark Job을 실행하는 컨테이너를 시작합니다.
    # 이 컨테이너는 backend/spark/spark_ml_pipeline_simulator.py의 ETL 부분을 실행합니다.
    run_spark_etl_job = DockerOperator(
        task_id="run_spark_etl_job",
        image="spark-submit-runner:latest", # Spark 작업을 제출하는 커스텀 이미지
        command=[
            "/opt/spark/bin/spark-submit",
            "--master", "spark://spark-master:7077",
            "--name", "Bearing_ETL_Job",
            "/app/spark/spark_ml_pipeline_simulator.py",
            "--phase", "etl" # ETL 단계만 실행하도록 인자 전달
        ],
        docker_url="unix://var/run/docker.sock",  # Airflow가 설치된 호스트의 Docker 소켓
        network_mode="backend_hadoop-network", # Docker Compose 네트워크에 연결
        doc_md="Hive 데이터를 전처리하여 S3(Parquet)에 저장하는 Spark 작업을 실행합니다.",
    )

    # --- Task 3: Spark ML 예측 작업 실행 --- #
    # ETL 작업이 성공적으로 완료된 후에 ML 예측 작업을 실행합니다.
    run_spark_ml_prediction_job = DockerOperator(
        task_id="run_spark_ml_prediction_job",
        image="spark-submit-runner:latest",
        command=[
            "/opt/spark/bin/spark-submit",
            "--master", "spark://spark-master:7077",
            "--name", "Bearing_ML_Prediction_Job",
            "/app/spark/spark_ml_pipeline_simulator.py",
            "--phase", "ml" # ML 단계만 실행하도록 인자 전달
        ],
        docker_url="unix://var/run/docker.sock",
        network_mode="backend_hadoop-network",
        doc_md="S3의 전처리 데이터를 사용하여 RUL을 예측하고 PostgreSQL에 저장하는 Spark 작업을 실행합니다.",
    )

    # --- Task 4: Redis to HDFS 아카이빙 작업 실행 --- #
    # ML 작업과 병렬로 실행될 수 있는 독립적인 아카이빙 작업입니다.
    run_archiving_job = DockerOperator(
        task_id="run_redis_to_hdfs_archiving",
        image="archiver-runner:latest", # 아카이빙 스크립트를 실행하는 커스텀 이미지
        command=["python", "/app/archiver/hdfs_archiver.py"] ,
        docker_url="unix://var/run/docker.sock",
        network_mode="backend_hadoop-network",
        doc_md="Redis의 실시간 데이터를 HDFS로 아카이빙하는 배치 작업을 실행합니다.",
    )

    # --- Task 5: 최종 정리 작업 --- #
    # 모든 작업이 완료된 후, 성공/실패 여부를 알리는 간단한 로그를 남깁니다.
    pipeline_complete = BashOperator(
        task_id="pipeline_complete",
        bash_command="echo '[Airflow] Bearing Guardian Daily Pipeline successfully completed at {{ ts }}'",
        doc_md="파이프라인의 모든 작업이 성공적으로 완료되었음을 기록합니다.",
    )

    # --- Task 의존성 설정 --- #
    # 파이프라인의 실행 순서를 정의합니다.
    cleanup_previous_containers >> run_spark_etl_job >> run_spark_ml_prediction_job
    cleanup_previous_containers >> run_archiving_job # 아카이빙은 ETL/ML과 병렬 실행 가능

    # ML 작업과 아카이빙 작업이 모두 끝나야 최종 완료 Task가 실행됩니다.
    [run_spark_ml_prediction_job, run_archiving_job] >> pipeline_complete
