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
    for message in consumer:
        # Extract RPM value
        rpm = message.value.get('bearing_params', {}).get('a_rpm')
        if rpm is not None:
            socketio.emit('rpm_update', {'rpm': rpm})

        # Determine bearing status based on a_race
        a_race = message.value.get('bearing_params', {}).get('a_race')
        status = '정상'
        if a_race == 'outer':
            status = '외륜 결함'
        elif a_race == 'inner':
            status = '내륜 결함'
        elif a_race == 'normal':
            status = '정상'
        socketio.emit('bearing_status_update', {'status': status})

        # Generate random RMS, PEAK, CRESTFACTOR
        rms = round(random.uniform(0.5, 5.0), 1)
        peak = round(random.uniform(rms * 2, rms * 5), 1) # PEAK should be greater than RMS
        crest_factor = round(peak / rms, 1) if rms != 0 else 0.0

        socketio.emit('vibration_metrics_update', {
            'rms': rms,
            'peak': peak,
            'crest_factor': crest_factor
        })

        # Emit to frontend
        socketio.emit('data', {'data': message.value})
        
        # Save to Redis
        redis_client.lpush('sensor_data', json.dumps(message.value))
        
        sys.stderr.write(f"Received: {message.value}\n")

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