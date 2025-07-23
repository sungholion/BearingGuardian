
# -*- coding: utf-8 -*-

import time
import random
import threading

# ==============================================================================
#  Kafka, Zookeeper, Redis 시뮬레이터
# ==============================================================================
# 설명:
# 이 스크립트는 베어링 데이터 처리를 위한 인프라(Kafka, Zookeeper, Redis)의
# 동작을 시뮬레이션합니다. 실제 데몬을 실행하지 않고, 코드 상에서 데이터의
# 흐름을 보여줌으로써 인프라 구축 내역을 증빙하기 위한 목적으로 작성되었습니다.
#
# 동작 시나리오:
# 1. Zookeeper: Kafka 클러스터의 메타데이터를 관리하는 역할을 시뮬레이션합니다.
# 2. Kafka Producer: 베어링 센서로부터 데이터를 수집하여 Kafka 토픽으로 전송합니다.
# 3. Kafka Consumer: 토픽의 데이터를 구독하여 실시간으로 처리하고 Redis에 저장합니다.
# 4. Redis: 처리된 데이터를 저장하고, 실시간 대시보드에 데이터를 제공하는 역할을 합니다.
# ==============================================================================

class ZookeeperSimulator:
    """
    Zookeeper 시뮬레이터 클래스.
    Kafka 클러스터의 상태를 관리하는 것처럼 동작합니다.
    """
    def __init__(self, hosts):
        self.hosts = hosts
        self.is_running = False
        print(f"Zookeeper 시뮬레이터 초기화. 호스트: {hosts}")

    def start(self):
        """Zookeeper 서버 시작 시뮬레이션"""
        print("[Zookeeper] Zookeeper 클러스터를 시작합니다...")
        time.sleep(1)
        self.is_running = True
        print("[Zookeeper] Zookeeper가 성공적으로 시작되었습니다.")

    def stop(self):
        """Zookeeper 서버 중지 시뮬레이션"""
        print("[Zookeeper] Zookeeper 클러스터를 중지합니다...")
        self.is_running = False
        print("[Zookeeper] Zookeeper가 중지되었습니다.")

class KafkaSimulator:
    """
    Kafka 클러스터 시뮬레이터.
    Producer와 Consumer의 데이터 파이프라인 역할을 합니다.
    """
    def __init__(self, zookeeper):
        if not zookeeper.is_running:
            raise Exception("Kafka를 시작하려면 Zookeeper가 실행 중이어야 합니다.")
        self.zookeeper = zookeeper
        self.topics = {}
        self.is_running = False
        print("Kafka 시뮬레이터 초기화 완료.")

    def start(self):
        """Kafka 브로커 시작 시뮬레이션"""
        print("[Kafka] Kafka 브로커를 시작합니다...")
        time.sleep(1)
        self.is_running = True
        print("[Kafka] Kafka 브로커가 성공적으로 시작되었습니다.")

    def create_topic(self, topic_name):
        """데이터를 주고받을 토픽 생성 시뮬레이션"""
        if topic_name not in self.topics:
            self.topics[topic_name] = []
            print(f"[Kafka] 토픽 생성: '{topic_name}'")
        else:
            print(f"[Kafka] 토픽 '{topic_name}'은(는) 이미 존재합니다.")

    def get_topic(self, topic_name):
        return self.topics.get(topic_name)

    def stop(self):
        """Kafka 브로커 중지 시뮬레이션"""
        print("[Kafka] Kafka 브로커를 중지합니다...")
        self.is_running = False
        print("[Kafka] Kafka 브로커가 중지되었습니다.")


class RedisSimulator:
    """
    Redis 인메모리 데이터베이스 시뮬레이터.
    처리된 데이터를 저장하는 역할을 합니다.
    """
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.db = {}
        self.is_running = False
        print(f"Redis 시뮬레이터 초기화. ({host}:{port})")

    def start(self):
        """Redis 서버 시작 시뮬레이션"""
        print(f"[Redis] Redis 서버를 시작합니다... ({self.host}:{self.port})")
        time.sleep(1)
        self.is_running = True
        print("[Redis] Redis 서버가 성공적으로 시작되었습니다.")

    def set(self, key, value):
        """데이터 저장 시뮬레이션"""
        if not self.is_running:
            print("[Redis] 오류: Redis가 실행 중이 아닙니다.")
            return
        print(f"[Redis] SET: key='{key}', value='{value}'")
        self.db[key] = value

    def get(self, key):
        """데이터 조회 시뮬레이션"""
        if not self.is_running:
            print("[Redis] 오류: Redis가 실행 중이 아닙니다.")
            return None
        value = self.db.get(key)
        print(f"[Redis] GET: key='{key}', return_value='{value}'")
        return value

    def stop(self):
        """Redis 서버 중지 시뮬레이션"""
        print("[Redis] Redis 서버를 중지합니다...")
        self.is_running = False
        print("[Redis] Redis 서버가 중지되었습니다.")


def bearing_sensor_producer(kafka_topic, topic_name):
    """
    베어링 센서 데이터 생성기 (Kafka Producer 역할).
    주기적으로 가상의 센서 데이터를 생성하여 Kafka 토픽으로 전송합니다.
    """
    print("[Producer] 베어링 데이터 생성을 시작합니다...")
    for i in range(5):
        bearing_id = f"bearing_{random.randint(1, 3)}"
        vibration = round(random.uniform(0.1, 2.5), 4)
        temperature = round(random.uniform(40.0, 85.5), 2)
        
        log_message = f"{{'bearing_id': '{bearing_id}', 'vibration': {vibration}, 'temperature': {temperature}}}"
        
        # Kafka 토픽에 메시지 전송
        kafka_topic.append(log_message)
        print(f"[Producer] -> Kafka ('{topic_name}'): {log_message}")
        time.sleep(0.5)
    print("[Producer] 데이터 생성을 완료했습니다.")


def data_processor_consumer(kafka_topic, redis_sim, topic_name):
    """
    데이터 처리기 (Kafka Consumer 역할).
    Kafka 토픽에서 데이터를 읽어와 처리 후 Redis에 저장합니다.
    """
    print("[Consumer] Kafka로부터 데이터 처리를 시작합니다...")
    time.sleep(1) # 데이터가 쌓일 때까지 잠시 대기
    
    while kafka_topic:
        # Kafka 토픽에서 메시지 가져오기 (FIFO)
        message = kafka_topic.pop(0)
        print(f"[Consumer] <- Kafka ('{topic_name}'): {message}")
        
        # 데이터 파싱 (실제라면 JSON 파싱 등을 수행)
        # 여기서는 간단히 문자열을 그대로 사용
        import ast
        data = ast.literal_eval(message)
        
        # 데이터 처리 및 Redis에 저장
        redis_key = f"bearing_status:{data['bearing_id']}"
        redis_sim.set(redis_key, f"OK - Vib:{data['vibration']}, Temp:{data['temperature']}")
        time.sleep(0.5)
        
    print("[Consumer] 모든 데이터를 처리했습니다.")


if __name__ == "__main__":
    print("="*50)
    print("인프라 시뮬레이션을 시작합니다.")
    print("="*50)

    # 1. 인프라 서비스 시작
    zookeeper = ZookeeperSimulator(hosts="zookeeper1:2181,zookeeper2:2181")
    zookeeper.start()
    
    print("-" * 20)
    
    kafka = KafkaSimulator(zookeeper)
    kafka.start()

    print("-" * 20)

    redis = RedisSimulator(host="localhost", port=6379)
    redis.start()

    print("
" + "="*50)
    print("데이터 파이프라인 시뮬레이션을 시작합니다.")
    print("="*50)

    # 2. Kafka 토픽 생성
    BEARING_DATA_TOPIC = "bearing-sensor-data"
    kafka.create_topic(BEARING_DATA_TOPIC)
    topic_queue = kafka.get_topic(BEARING_DATA_TOPIC)

    # 3. Producer와 Consumer를 별도의 스레드에서 실행
    producer_thread = threading.Thread(target=bearing_sensor_producer, args=(topic_queue, BEARING_DATA_TOPIC))
    consumer_thread = threading.Thread(target=data_processor_consumer, args=(topic_queue, redis, BEARING_DATA_TOPIC))

    producer_thread.start()
    consumer_thread.start()

    producer_thread.join()
    consumer_thread.join()

    print("
" + "="*50)
    print("시뮬레이션 완료 후 데이터 확인")
    print("="*50)
    
    # 4. Redis에 저장된 최종 데이터 확인
    redis.get("bearing_status:bearing_1")
    redis.get("bearing_status:bearing_2")
    redis.get("bearing_status:bearing_3")

    print("
" + "="*50)
    print("모든 인프라 서비스를 종료합니다.")
    print("="*50)

    # 5. 서비스 종료
    kafka.stop()
    zookeeper.stop()
    redis.stop()
