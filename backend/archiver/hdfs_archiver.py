
# -*- coding: utf-8 -*-

import time
import datetime
import os
import json

# ==============================================================================
#  Redis to HDFS Data Archiver 시뮬레이터
# ==============================================================================
# 설명:
# 이 스크립트는 Redis에 저장된 실시간 데이터를 주기적으로 (24시간마다) Hadoop HDFS에
# 안전하게 아카이빙하는 배치(batch) 작업을 시뮬레이션합니다. 실제 HDFS와 통신하지
# 않으며, `hdfs` 라이브러리를 사용하는 것처럼 보이는 코드를 통해 데이터 보관
# 아키텍처를 증빙하는 것을 목적으로 합니다.
#
# 아키텍처:
# 1. Redis Client (시뮬레이션): 분석 및 대시보드에 사용된 실시간 데이터를 Redis에서
#    가져오는 역할을 합니다. 특정 패턴(예: 'bearing_status:*')의 모든 키를 조회합니다.
# 2. HDFS Client (시뮬레이션): `hdfs` 라이브러리를 사용하여 HDFS 클러스터에 연결하고,
#    가져온 데이터를 CSV 또는 JSON 형태로 변환하여 HDFS 경로에 저장합니다.
# 3. Scheduler (시뮬레이션): 이 아카이빙 작업을 24시간 주기로 실행하는 스케줄러
#    (예: Cron, Airflow, APScheduler)의 역할을 시뮬레이션합니다.
# ==============================================================================

class RedisClientSimulator:
    """Redis 클라이언트의 동작을 시뮬레이션합니다."""
    def __init__(self, host='localhost', port=6379):
        self.host = host
        self.port = port
        # 아카이빙할 가짜 데이터 생성
        self._db = {
            f"bearing_status:bearing_{i}": f"OK - Vib:0.{random.randint(100, 999)}, Temp:{random.randint(40, 80)}"
            for i in range(1, 25)
        }
        print(f"Redis 클라이언트 시뮬레이터 초기화. ({host}:{port})")

    def keys(self, pattern='*'):
        """특정 패턴의 키를 조회하는 것을 시뮬레이션합니다."""
        print(f"[Redis] KEYS '{pattern}' 실행...")
        # 실제로는 정규표현식으로 패턴 매칭을 해야 하지만, 여기서는 간단히 처리합니다.
        matched_keys = [k for k in self._db.keys() if k.startswith(pattern.replace('*', ''))]
        print(f"[Redis] {len(matched_keys)}개의 키를 찾았습니다.")
        return matched_keys

    def get(self, key):
        """키에 해당하는 값을 가져옵니다."""
        return self._db.get(key)

    def delete_keys(self, keys):
        """오래된 데이터를 삭제하는 것을 시뮬레이션합니다."""
        print(f"[Redis] 아카이빙이 완료된 {len(keys)}개의 오래된 데이터를 삭제합니다.")
        for key in keys:
            if key in self._db:
                del self._db
        return len(keys)

class HDFSClientSimulator:
    """`hdfs` 라이브러리를 사용한 HDFS 연결 및 파일 저장을 시뮬레이션합니다."""
    def __init__(self, hdfs_url, user):
        self.hdfs_url = hdfs_url
        self.user = user
        self.client = None
        print(f"HDFS 클라이언트 시뮬레이터 초기화. (URL: {hdfs_url}, User: {user})")

    def connect(self):
        """HDFS NameNode에 연결을 시뮬레이션합니다."""
        print(f"[HDFS] HDFS NameNode({self.hdfs_url})에 연결을 시도합니다...")
        # 실제 HDFS 클라이언트 생성 코드와 유사하게 보입니다.
        # from hdfs import InsecureClient
        # self.client = InsecureClient(self.hdfs_url, user=self.user)
        time.sleep(0.5)
        print("[HDFS] HDFS 클라이언트가 성공적으로 연결되었습니다.")

    def write(self, hdfs_path, data, overwrite=True):
        """
        데이터를 HDFS 경로에 쓰는 것을 시뮬레이션합니다.
        """
        print(f"[HDFS] HDFS에 데이터 쓰기 시작...")
        print(f"  - HDFS 경로: {hdfs_path}")
        print(f"  - 데이터 크기: {len(data.encode('utf-8'))} bytes")
        print(f"  - 덮어쓰기: {overwrite}")
        
        # 실제 HDFS 쓰기 로직 (주석 처리)
        # with self.client.write(hdfs_path, encoding='utf-8', overwrite=overwrite) as writer:
        #     writer.write(data)
        
        time.sleep(1) # HDFS 쓰기 시간 시뮬레이션
        print(f"[HDFS] 데이터가 '{hdfs_path}'에 성공적으로 저장되었습니다 (시뮬레이션).")

def archive_redis_to_hdfs():
    """Redis 데이터를 HDFS로 아카이빙하는 메인 함수."""
    print("\n--- [Job Start] Redis to HDFS 아카이빙 작업을 시작합니다. ---")
    start_time = time.time()

    # 1. 클라이언트 초기화 및 연결
    redis_sim = RedisClientSimulator()
    hdfs_sim = HDFSClientSimulator(hdfs_url='http://namenode:9870', user='hadoop')
    hdfs_sim.connect()

    # 2. Redis에서 데이터 가져오기
    keys_to_archive = redis_sim.keys('bearing_status:*')
    archived_data = []
    for key in keys_to_archive:
        value = redis_sim.get(key)
        # 데이터 포맷 변환 (JSON Lines 형태)
        record = {
            'key': key,
            'value': value,
            'archived_at': datetime.datetime.now().isoformat()
        }
        archived_data.append(json.dumps(record))

    if not archived_data:
        print("[Job] 아카이빙할 데이터가 없습니다. 작업을 종료합니다.")
        return

    # 3. HDFS에 데이터 저장
    # 날짜 기반으로 HDFS 경로 생성 (예: /data_archive/bearing/2023/07/22/data.jsonl)
    today = datetime.datetime.now()
    hdfs_path = f"/data_archive/bearing/{today.strftime('%Y/%m/%d')}/data.jsonl"
    hdfs_sim.write(hdfs_path, data='\n'.join(archived_data))

    # 4. 아카이빙 완료된 Redis 데이터 삭제 (선택적)
    # redis_sim.delete_keys(keys_to_archive)

    end_time = time.time()
    print(f"--- [Job End] 아카이빙 작업 완료. (소요 시간: {end_time - start_time:.2f}초) ---")


if __name__ == '__main__':
    print("="*60)
    print(" Redis to HDFS Archiver Simulator")
    print(" 이 스크립트는 24시간 주기로 실행되는 배치 작업을 시뮬레이션합니다.")
    print(" (실제로는 무한 루프 대신 Cron이나 Airflow로 실행됩니다.)")
    print("="*60)

    # 이 루프는 스케줄러가 주기적으로 작업을 실행하는 것을 흉내 냅니다.
    # 데모를 위해 10초마다 실행되도록 설정합니다.
    # 실제 24시간 주기는 time.sleep(24 * 60 * 60) 입니다.
    while True:
        archive_redis_to_hdfs()
        print("\n다음 아카이빙 작업은 10초 후에 실행됩니다... (Ctrl+C로 종료)")
        try:
            time.sleep(10) # 데모용: 10초, 실제: 24 * 60 * 60
        except KeyboardInterrupt:
            print("\n시뮬레이터를 종료합니다.")
            break
