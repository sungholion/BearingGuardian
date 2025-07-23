
# -*- coding: utf-8 -*-

from flask import Flask, render_template_string
from flask_socketio import SocketIO, emit
import time
import random
import threading

# ==============================================================================
#  Flask-SocketIO 실시간 대시보드 시뮬레이터
# ==============================================================================
# 설명:
# 이 스크립트는 Flask-SocketIO를 사용하여 WebSocket 기반의 실시간 데이터 대시보드
# 서버 아키텍처를 시뮬레이션합니다. 백그라운드 스레드가 주기적으로 가상의
# 베어링 데이터를 생성하고, 연결된 모든 클라이언트에게 WebSocket을 통해 실시간으로
# 데이터를 전송(push)합니다.
#
# 아키텍처:
# 1. Flask-SocketIO 서버: WebSocket 연결을 관리하고 클라이언트와 실시간 양방향 통신을 담당합니다.
# 2. 백그라운드 스레드: Kafka Consumer 또는 데이터베이스로부터 새로운 데이터를
#    가져오는 역할을 시뮬레이션합니다. 주기적으로 데이터를 생성하여 'update_data' 이벤트로 전송합니다.
# 3. WebSocket 이벤트 핸들러: 클라이언트의 'connect', 'disconnect' 이벤트를 처리하고,
#    서버에서 생성된 데이터를 클라이언트로 전송합니다.
# 4. 프론트엔드 (시뮬레이션): 클라이언트가 서버에 연결하고 실시간으로 데이터를 수신하는
#    간단한 HTML/JavaScript 코드가 포함되어 있습니다.
# ==============================================================================

# Flask 앱 및 SocketIO 초기화
app = Flask(__name__)
app.config['SECRET_KEY'] = 'a-very-secret-key-for-dev-only!'

# async_mode='threading'은 eventlet이나 gevent 같은 복잡한 비동기 라이브러리 없이
# 스레드 기반으로 간단하게 비동기 작업을 처리하기 위해 사용됩니다.
socketio = SocketIO(app, async_mode='threading', cors_allowed_origins="*")

# 백그라운드 스레드 관련 객체
thread = None
thread_lock = threading.Lock()

def background_data_generator():
    """
    실시간 데이터 피드를 시뮬레이션하는 백그라운드 작업입니다.
    실제 애플리케이션에서는 이 함수가 Kafka 같은 메시지 큐를 구독하거나
    데이터베이스에서 새로운 데이터를 폴링(polling)하게 됩니다.
    """
    print("[WebSocket-Server] 백그라운드 데이터 생성기 시작...")
    event_count = 0
    while True:
        # 2초마다 새로운 데이터가 들어오는 것을 시뮬레이션
        socketio.sleep(2)
        event_count += 1
        
        # 가상 데이터 생성
        bearing_id = f"bearing_{random.randint(1, 5)}"
        vibration = round(random.uniform(0.1, 3.0), 4)
        temperature = round(random.uniform(40.0, 95.0), 2)
        status = "Abnormal" if temperature > 85 or vibration > 2.5 else "Normal"

        # 클라이언트에게 전송할 데이터 페이로드 구성
        data_payload = {
            'id': event_count,
            'bearing_id': bearing_id,
            'vibration': vibration,
            'temperature': temperature,
            'status': status,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }

        # 연결된 모든 클라이언트에게 'update_data' 이벤트를 통해 데이터 전송
        print(f"[WebSocket-Server] 데이터 전송: {data_payload}")
        socketio.emit('update_data', data_payload, namespace='/data')

# --- Flask 라우트 정의 ---
@app.route('/')
def index():
    """
    메인 HTML 페이지를 렌더링합니다.
    이 페이지에는 WebSocket 서버에 연결하기 위한 JavaScript 코드가 포함되어 있습니다.
    실제 Next.js 환경에서는 프론트엔드에서 이 부분을 담당합니다.
    """
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>BearingGuardian - Real-time Monitoring</title>
        <style>
            body { font-family: sans-serif; }
            #log { border: 1px solid #ccc; padding: 10px; height: 400px; overflow-y: scroll; }
            p { margin: 5px 0; }
        </style>
    </head>
    <body>
        <h1>Real-time Bearing Data (Simulation)</h1>
        <div id="log"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
        <script type="text/javascript" charset="utf-8">
            // WebSocket 서버의 /data 네임스페이스로 연결
            var socket = io.connect('http://' + document.domain + ':' + location.port + '/data');

            // 'update_data' 이벤트 수신 시 호출될 핸들러
            socket.on('update_data', function(data) {
                console.log('Received data: ' + JSON.stringify(data));
                var log = document.getElementById('log');
                log.innerHTML = '<p>Received: ' + JSON.stringify(data) + '</p>' + log.innerHTML;
            });

            // 연결 성공 시 호출될 핸들러
            socket.on('connect', function() {
                console.log('WebSocket connected successfully!');
            });
        </script>
    </body>
    </html>
    ''')

# --- SocketIO 이벤트 핸들러 정의 ---
@socketio.on('connect', namespace='/data')
def handle_connect():
    """
    새로운 클라이언트 연결을 처리합니다.
    첫 클라이언트 연결 시, 백그라운드 데이터 생성 스레드를 시작합니다.
    """
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(target=background_data_generator)
    print('[WebSocket-Server] Client has connected.')
    emit('response', {'data': 'Successfully connected to the real-time server!'})

@socketio.on('disconnect', namespace='/data')
def handle_disconnect():
    """클라이언트 연결 종료를 처리합니다."""
    print('[WebSocket-Server] Client has disconnected.')

# --- 메인 실행 블록 ---
if __name__ == '__main__':
    print("="*60)
    print(" Flask-SocketIO Real-time Dashboard Simulator")
    print(" This is a demonstration script and is not integrated with the main app.")
    print(" To run, execute this file: python realtime_dashboard.py")
    print(" Then, open a web browser to http://127.0.0.1:5001")
    print("="*60)
    
    # 메인 앱(포트 5000)과의 충돌을 피하기 위해 다른 포트(5001) 사용
    socketio.run(app, host='0.0.0.0', port=5001, debug=True, allow_unsafe_werkzeug=True)
