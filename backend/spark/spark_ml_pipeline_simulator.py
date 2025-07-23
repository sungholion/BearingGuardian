# -*- coding: utf-8 -*-

import time
import datetime
import os

# ==============================================================================
#  Spark ETL & ML Prediction Pipeline 시뮬레이터
# ==============================================================================
# 설명:
# 이 스크립트는 Apache Spark를 사용하여 전체 데이터 파이프라인을 실행하는 과정을
# 시뮬레이션합니다. 실제 서비스와 통신하지 않으며, PySpark, Boto3, Psycopg2 등의
# 라이브러리를 사용하는 것처럼 보이는 코드를 통해 전체 아키텍처를 증빙합니다.
#
# 파이프라인 흐름:
# 1. [ETL] Spark, Hive 데이터 로드: Spark가 Hive 테이블(HDFS 기반)에서 대규모 원본 데이터를 로드합니다.
# 2. [ETL] 데이터 전처리: 로드된 데이터에 대해 정제, 변환, 피처 엔지니어링 등 전처리 작업을 수행합니다.
# 3. [ETL] S3에 중간 결과 저장: 전처리된 데이터를 Parquet 형식으로 S3에 저장합니다.
# 4. [ML] S3에서 데이터 로드: 머신러닝 모델 입력을 위해 S3에 저장된 전처리 데이터를 Spark로 다시 로드합니다.
# 5. [ML] Spark ML 모델 예측: 미리 학습된 Spark ML 파이프라인 모델을 로드하여 데이터의 RUL(잔여 유효 수명)을 예측합니다.
# 6. [ML] PostgreSQL에 최종 결과 저장: 예측 결과를 최종적으로 PostgreSQL 데이터베이스에 저장하여 다른 서비스에서 활용할 수 있도록 합니다.
# ==============================================================================

# --- 가짜 라이브러리 및 클래스 --- #
# 실제 실행 환경에서는 이 클래스들 대신 실제 라이브러리(PySpark 등)의 객체가 사용됩니다.

class SparkSessionSimulator:
    """PySpark의 SparkSession을 시뮬레이션합니다."""
    def __init__(self):
        self._app_name = "SparkPipelineSimulator"
        print(f"[Spark] SparkSession 빌더 초기화 (AppName: {self._app_name})")

    def getOrCreate(self):
        print("[Spark] 가상 SparkSession을 생성했습니다.")
        return self

    def read(self):
        print("[Spark] DataFrameReader를 생성합니다.")
        return DataFrameReaderSimulator()

    def stop(self):
        print("[Spark] SparkSession을 종료합니다.")

class DataFrameReaderSimulator:
    """DataFrame 읽기 작업을 시뮬레이션합니다."""
    def table(self, table_name):
        print(f"[Spark-Read] Hive 테이블 '{table_name}'에서 데이터를 읽습니다.")
        time.sleep(1) # 데이터 로딩 시간 시뮬레이션
        return DataFrameSimulator("HiveData")

    def load(self, path):
        print(f"[Spark-Read] Parquet 파일 '{path}'에서 데이터를 읽습니다.")
        time.sleep(0.5)
        return DataFrameSimulator("S3Data")

class DataFrameSimulator:
    """PySpark의 DataFrame을 시뮬레이션합니다."""
    def __init__(self, source, is_empty=False):
        self.source = source
        self.columns = ["key", "value"]
        self._is_empty = is_empty

    def withColumn(self, colName, col):
        print(f"[Spark-Transform] 컬럼 추가/변경: '{colName}'")
        if colName not in self.columns:
            self.columns.append(colName)
        return self

    def select(self, *cols):
        print(f"[Spark-Transform] 컬럼 선택: {cols}")
        self.columns = list(cols)
        return self

    def write(self):
        return DataFrameWriterSimulator()

    def show(self):
        print(f"[Spark-Show] DataFrame 내용 미리보기 (Source: {self.source})")
        print(f"Columns: {self.columns}")

    def isEmpty(self):
        """DataFrame이 비어있는지 확인하는 메서드 시뮬레이션."""
        # 실제로는 self.rdd.isEmpty() 또는 self.count() == 0 사용
        print("[Spark-Check] DataFrame이 비어있는지 확인합니다...")
        return self._is_empty

class DataFrameWriterSimulator:
    """DataFrame 쓰기 작업을 시뮬레이션합니다."""
    def mode(self, mode):
        self._mode = mode
        print(f"[Spark-Write] 쓰기 모드 설정: {mode}")
        return self

    def save(self, path):
        print(f"[Spark-Write] DataFrame을 '{path}' 경로에 저장합니다 (시뮬레이션).")
        time.sleep(1)

    def option(self, key, value):
        print(f"[Spark-Write] 옵션 설정: {key}={value}")
        return self

    def format(self, fmt):
        print(f"[Spark-Write] 포맷 설정: {fmt}")
        return self

class SparkMLModelSimulator:
    """미리 학습된 Spark ML 모델을 시뮬레이션합니다."""
    @staticmethod
    def load(path):
        print(f"[Spark-ML] S3 경로에서 사전 학습된 ML 모델을 로드합니다: {path}")
        return SparkMLModelSimulator()

    def transform(self, dataframe):
        print("[Spark-ML] DataFrame에 대해 RUL 예측 변환을 수행합니다.")
        dataframe.withColumn("prediction", None) # 예측 컬럼 추가
        return dataframe

# --- 파이프라인 단계별 함수 --- #

def run_spark_etl_job(spark, s3_bucket):
    """1단계: Hive 데이터 전처리 및 S3 저장."""
    print("\n--- [Phase 1: ETL] Spark ETL 작업을 시작합니다. ---")
    # 1. Hive에서 데이터 로드
    raw_df = spark.read().table("bearing_db.bearing_archive")
    raw_df.show()

    # 2. 데이터 전처리 (가상)
    processed_df = raw_df.withColumn("parsed_value", None) \
                           .withColumn("feature_vibration", None) \
                           .withColumn("feature_temperature", None) \
                           .select("key", "feature_vibration", "feature_temperature")
    processed_df.show()

    # 3. [개선된 로직] 데이터 유효성 검사: DataFrame이 비어있는지 확인
    # HDFS의 원본 파티션에 데이터가 없는 경우, 후속 작업을 방지하여 파이프라인 안정성 확보
    if processed_df.isEmpty():
        print("[Spark-ETL-Check] 경고: 처리할 데이터가 없습니다. S3에 빈 데이터를 저장하지 않고 작업을 종료합니다.")
        print("--- [Phase 1: ETL] 작업 조기 종료 (데이터 없음). ---")
        return None # 후속 ML 작업이 실행되지 않도록 None 반환
    else:
        print("[Spark-ETL-Check] 유효한 데이터가 확인되었습니다. S3에 저장을 계속합니다.")
        # 4. S3에 Parquet 형식으로 저장
        today_str = datetime.datetime.now().strftime('%Y-%m-%d')
        s3_output_path = f"s3a://{s3_bucket}/processed-data/{today_str}/"
        processed_df.write().mode("overwrite").save(s3_output_path)
        print("--- [Phase 1: ETL] ETL 작업 완료. ---")
        return s3_output_path

def run_spark_prediction_job(spark, s3_processed_path, s3_model_path, pg_options):
    """2단계: S3 데이터로 ML 예측 및 PostgreSQL 저장."""
    print("\n--- [Phase 2: ML] Spark ML 예측 작업을 시작합니다. ---")
    # 4. S3에서 전처리된 데이터 로드
    feature_df = spark.read().load(s3_processed_path)
    feature_df.show()

    # 5. Spark ML 모델 로드 및 예측
    model = SparkMLModelSimulator.load(s3_model_path)
    predictions_df = model.transform(feature_df)
    predictions_df.show()

    # 6. PostgreSQL에 결과 저장
    print("[PostgreSQL-Sink] 예측 결과를 PostgreSQL에 저장합니다.")
    predictions_df.write() \
                  .format("jdbc") \
                  .option("url", pg_options["url"]) \
                  .option("dbtable", pg_options["dbtable"]) \
                  .option("user", pg_options["user"]) \
                  .option("password", pg_options["password"]) \
                  .mode("append") \
                  .save(None) # save()는 액션이므로 호출 필요
    print("--- [Phase 2: ML] ML 예측 작업 완료. ---")


if __name__ == "__main__":
    print("="*60)
    print(" Spark ETL & ML Prediction Pipeline Simulator")
    print(" 이 스크립트는 Spark를 이용한 전체 데이터 파이프라인을 시뮬레이션합니다.")
    print("="*60)

    # SparkSession 시작
    spark_session = SparkSessionSimulator().getOrCreate()

    # 설정 변수
    S3_BUCKET = "bearing-guardian-data-lake"
    S3_MODEL_PATH = f"s3a://{S3_BUCKET}/models/spark-rul-predictor-v1/"
    POSTGRES_OPTIONS = {
        "url": "jdbc:postgresql://postgres-db:5432/prediction_db",
        "dbtable": "public.bearing_rul_predictions",
        "user": "admin",
        "password": "a_secure_password"
    }

    # 파이프라인 실행
    try:
        # 1단계 실행
        s3_path = run_spark_etl_job(spark_session, S3_BUCKET)
        
        # [개선된 로직] ETL 작업 결과가 있을 때만 ML 예측 실행
        if s3_path:
            # 2단계 실행
            run_spark_prediction_job(spark_session, s3_path, S3_MODEL_PATH, POSTGRES_OPTIONS)
        else:
            print("\n[Pipeline-Control] ETL 단계에서 생성된 데이터가 없어 ML 예측 단계를 건너뜁니다.")

    finally:
        # SparkSession 종료
        spark_session.stop()

    print("\n[SUCCESS] 전체 데이터 파이프라인 시뮬레이션이 성공적으로 완료되었습니다.")