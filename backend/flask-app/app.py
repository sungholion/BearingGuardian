
from flask import Flask, render_template
from flask_socketio import SocketIO
from kafka import KafkaConsumer
import json
import threading
import redis

app = Flask(__name__)
socketio = SocketIO(app)

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
        # Emit to frontend
        socketio.emit('data', {'data': message.value})
        
        # Save to Redis
        redis_client.lpush('sensor_data', json.dumps(message.value))
        
        print(f"Received: {message.value}")

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
