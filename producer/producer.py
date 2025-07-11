import time
import json
import random
from kafka import KafkaProducer

def generate_data():
    return {
        'max': round(random.uniform(0, 100), 2),
        'min': round(random.uniform(0, 100), 2),
        'mean': round(random.uniform(20, 80), 2),
        'sd': round(random.uniform(5, 20), 2),
        'rms': round(random.uniform(30, 70), 2),
        'skewness': round(random.uniform(0, 1), 2),
        'kurtosis': round(random.uniform(0, 1), 2),
        'crest': round(random.uniform(1, 5), 2),
        'form': round(random.uniform(1, 5), 2),
    }

producer = KafkaProducer(
    bootstrap_servers=['kafka:29092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

while True:
    data = generate_data()
    producer.send('sound-data', value=data)
    print(f"Sent: {data}")
    time.sleep(3)
