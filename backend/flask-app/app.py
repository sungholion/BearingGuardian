import sys

from flask import Flask, render_template
from flask_socketio import SocketIO
from kafka import KafkaConsumer
import json
import threading
import redis

import random

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Redis client
redis_client = redis.Redis(host='redis', port=6379, db=0)

consumer = KafkaConsumer(
    'sound-data',
    bootstrap_servers=['kafka:29092'],
    auto_offset_reset='latest',
    enable_auto_commit=True,
    group_id='my-group',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

def kafka_listener():
    # Kafka 메시지 처리 및 실시간 데이터 분석 로직
    for message in consumer:
        # RPM 값 추출 및 프론트엔드로 전송
        rpm = message.value.get('bearing_params', {}).get('a_rpm')
        if rpm is not None:
            socketio.emit('rpm_update', {'rpm': rpm})

        # 베어링 상태 판별 (a_race 기반)
        # TODO: 향후 머신러닝 모델을 통한 고급 이상 감지 로직 통합 예정
        a_race = message.value.get('bearing_params', {}).get('a_race')
        status = '정상'
        if a_race == 'outer':
            status = '외륜 결함'
        elif a_race == 'inner':
            status = '내륜 결함'
        elif a_race == 'normal':
            status = '정상'
        socketio.emit('bearing_status_update', {'status': status})

        # 진동 지표 (RMS, PEAK, CRESTFACTOR) 생성 및 전송
        # TODO: 실제 센서 데이터 연동 및 정밀 분석 기능 추가
        rms = round(random.uniform(0.5, 5.0), 1)
        peak = round(random.uniform(rms * 2, rms * 5), 1) # PEAK should be greater than RMS
        crest_factor = round(peak / rms, 1) if rms != 0 else 0.0

        socketio.emit('vibration_metrics_update', {
            'rms': rms,
            'peak': peak,
            'crest_factor': crest_factor
        })

        # 프론트엔드로 원시 데이터 전송
        socketio.emit('data', {'data': message.value})
        
        # Redis에 센서 데이터 저장 (히스토리 및 빠른 조회를 위함)
        # TODO: 장기 데이터 저장을 위한 HDFS/Hive 연동 강화
        redis_client.lpush('sensor_data', json.dumps(message.value))
        
        sys.stderr.write(f"Received: {message.value}\n")

# 웹 애플리케이션 라우트 정의
@app.route('/')
def index():
    # 메인 대시보드 페이지 렌더링
    return render_template('index.html')

@app.route('/data')
def show_data():
    # 샘플 데이터 표시 페이지 렌더링
    # TODO: 실제 데이터베이스에서 데이터 조회 및 필터링 기능 추가
    try:
        with open('sample_data.txt', 'r') as f:
            content = f.read()
    except FileNotFoundError:
        content = "sample_data.txt file not found."
    return render_template('data.html', data_content=content)

# 애플리케이션 실행 진입점
if __name__ == '__main__':
    # Kafka 리스너 스레드 시작
    kafka_thread = threading.Thread(target=kafka_listener)
    kafka_thread.daemon = True
    kafka_thread.start()
    # SocketIO를 통해 Flask 앱 실행
    # TODO: 배포 환경에 맞는 WSGI 서버 (Gunicorn 등) 설정 추가
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def show_data():
    try:
        with open('sample_data.txt', 'r') as f:
            content = f.read()
    except FileNotFoundError:
        content = "sample_data.txt file not found."
    return render_template('data.html', data_content=content)

if __name__ == '__main__':
    kafka_thread = threading.Thread(target=kafka_listener)
    kafka_thread.daemon = True
    kafka_thread.start()
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)