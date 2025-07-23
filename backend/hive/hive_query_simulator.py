
# -*- coding: utf-8 -*-

import time
import datetime

# ==============================================================================
#  HDFS Data Querying with Hive 시뮬레이터
# ==============================================================================
# 설명:
# 이 스크립트는 HDFS에 아카이빙된 데이터를 Hive를 통해 조회하고 분석하는 과정을
# 시뮬레이션합니다. `PyHive` 라이브러리를 사용하여 HiveServer2에 연결하고,
# HDFS 경로를 외부 테이블(External Table)로 매핑한 뒤, HQL 쿼리를 실행합니다.
#
# 아키텍처:
# 1. Hive Connection: PyHive를 사용하여 HiveServer2에 연결합니다.
# 2. CREATE EXTERNAL TABLE: HDFS에 저장된 데이터(JSON 형식)를 Hive에서
#    조회할 수 있도록 테이블 스키마를 정의하고 HDFS 경로와 매핑합니다.
#    이 테이블은 HDFS의 원본 데이터를 직접 참조하므로, 데이터 로딩 과정이 필요 없습니다.
# 3. HQL Query Execution: 정의된 Hive 테이블에 대해 SQL과 유사한 HQL 쿼리를
#    실행하여 데이터를 분석하고, 그 결과를 가져옵니다.
# ==============================================================================

class HiveConnectionSimulator:
    """PyHive를 사용한 HiveServer2 연결을 시뮬레이션합니다."""
    def __init__(self, host='hive-server', port=10000, username='hadoop'):
        self.host = host
        self.port = port
        self.username = username
        self.connection = None
        self.cursor = None
        print(f"Hive 연결 시뮬레이터 초기화. (Target: {host}:{port})")

    def connect(self):
        """HiveServer2 연결 시뮬레이션."""
        print(f"[Hive] HiveServer2({self.host}:{self.port})에 연결을 시도합니다...")
        # 실제 PyHive 연결 코드와 유사하게 보입니다.
        # from pyhive import hive
        # self.connection = hive.connect(host=self.host, port=self.port, username=self.username)
        # self.cursor = self.connection.cursor()
        time.sleep(0.5)
        print("[Hive] HiveServer2에 성공적으로 연결되었습니다.")

    def execute_query(self, query):
        """HQL 쿼리 실행을 시뮬레이션합니다."""
        print("-"*20)
        print(f"[Hive] HQL 쿼리 실행:")
        # 쿼리를 여러 줄로 예쁘게 출력
        for line in query.strip().split('\n'):
            print(f"  {line.strip()}")
        print("-"*20)
        
        # self.cursor.execute(query)
        time.sleep(1.5) # 쿼리 실행 시간 시뮬레이션
        print("[Hive] 쿼리가 성공적으로 실행되었습니다 (시뮬레이션).")

    def fetch_results(self):
        """쿼리 결과 반환을 시뮬레이션합니다."""
        # return self.cursor.fetchall()
        # 실제 쿼리에 대한 가짜 결과 생성
        print("[Hive] 쿼리 결과를 가져옵니다...")
        mock_results = [
            ('bearing_status:bearing_15', 'OK - Vib:0.567, Temp:75', '2025-07-23T11:10:05.123456'),
            ('bearing_status:bearing_8', 'Abnormal - Vib:2.891, Temp:92', '2025-07-23T11:09:55.654321'),
            ('bearing_status:bearing_21', 'OK - Vib:0.234, Temp:58', '2025-07-23T11:09:45.987654')
        ]
        return mock_results

    def close(self):
        """연결 종료 시뮬레이션."""
        # self.cursor.close()
        # self.connection.close()
        print("[Hive] HiveServer2 연결을 종료합니다.")


def run_hive_analytics():
    """HDFS 데이터를 Hive로 분석하는 전체 과정을 보여주는 함수."""
    hive_conn = HiveConnectionSimulator()

    try:
        hive_conn.connect()

        # 1. HDFS 데이터를 참조하는 외부 테이블 생성 (테이블이 없는 경우)
        # 이 쿼리는 HDFS의 /data_archive/bearing/ 경로에 있는 JSON 파일들을
        # `bearing_archive`라는 테이블로 만들어줍니다.
        create_table_hql = """
        CREATE EXTERNAL TABLE IF NOT EXISTS bearing_archive (
            key STRING,
            value STRING,
            archived_at STRING
        )
        ROW FORMAT SERDE 'org.apache.hive.hcatalog.data.JsonSerDe'
        LOCATION '/data_archive/bearing/'
        """
        hive_conn.execute_query(create_table_hql)

        # 2. 데이터 분석 쿼리 실행
        # 예: 특정 베어링의 최근 상태 기록 조회
        analytics_hql = """
        SELECT 
            key, 
            value, 
            archived_at
        FROM 
            bearing_archive
        WHERE 
            key = 'bearing_status:bearing_15'
        ORDER BY 
            archived_at DESC
        LIMIT 10
        """
        hive_conn.execute_query(analytics_hql)

        # 3. 결과 가져오기 및 출력
        results = hive_conn.fetch_results()
        print("\n[Analytics] Hive 쿼리 분석 결과:")
        print("| {:<25} | {:<30} | {:<28} |".format("Bearing Key", "Status Value", "Archived Timestamp"))
        print("-"*95)
        for row in results:
            print("| {:<25} | {:<30} | {:<28} |".format(*row))

    except Exception as e:
        print(f"오류 발생: {e}")
    finally:
        hive_conn.close()


if __name__ == '__main__':
    print("="*60)
    print(" HDFS Data Querying with Hive Simulator")
    print(" 이 스크립트는 HDFS에 저장된 데이터를 HiveQL로 조회하는 것을 시뮬레이션합니다.")
    print("="*60)
    run_hive_analytics()
