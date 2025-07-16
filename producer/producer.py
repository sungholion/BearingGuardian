import sys
import time
import json
import numpy as np
from kafka import KafkaProducer
from DES.Simulation import Simulation
from Bearing.Bearing import Bearing
from DES.Acquisition import Acquisition
import random

# Define parameter ranges for normal operation
NORMAL_PARAMS = {
    "a_n": [16, 20], # Number of rolling elements (example range)
    "a_dP": [70.0, 75.0], # Pitch diameter (example range)
    "a_rpm": [1800, 2200], # RPM (example range)
    "a_dB": [8.0, 9.0], # Rolling element diameter (example range)
    "a_theta": [14.0, 16.0], # Contact angle (example range)
    "a_duration": [90.0, 100.0], # Acquisition duration (example range)
    "a_frequency": [19000, 21000], # Acquisition frequency (example range)
    "a_noise": [0.05, 0.15] # Noise parameter (example range)
}

# Define defect parameters (example values for a small defect)
DEFECT_PARAMS = {
    "a_L": [3.0, 5.0], # Defect length
    "a_N": [1, 2], # Number of defects (1 or 2 for occasional)
    "a_lambda": [0.7, 0.8], # Defect characteristic (range for lambda)
    "a_delta": [0.5, 0.6] # Defect characteristic (range for delta)
}

DEFECT_CHANCE = 0.1 # 10% chance of a defect occurring

def generate_data():
    # Generate normal parameters within their defined ranges
    a_n = random.randint(NORMAL_PARAMS["a_n"][0], NORMAL_PARAMS["a_n"][1])
    a_dP = round(random.uniform(NORMAL_PARAMS["a_dP"][0], NORMAL_PARAMS["a_dP"][1]), 3)
    a_rpm = random.randint(NORMAL_PARAMS["a_rpm"][0], NORMAL_PARAMS["a_rpm"][1])
    a_dB = round(random.uniform(NORMAL_PARAMS["a_dB"][0], NORMAL_PARAMS["a_dB"][1]), 4)
    a_theta = round(random.uniform(NORMAL_PARAMS["a_theta"][0], NORMAL_PARAMS["a_theta"][1]), 2)
    a_duration = round(random.uniform(NORMAL_PARAMS["a_duration"][0], NORMAL_PARAMS["a_duration"][1]), 5)
    a_frequency = random.randint(NORMAL_PARAMS["a_frequency"][0], NORMAL_PARAMS["a_frequency"][1])
    a_noise = round(random.uniform(NORMAL_PARAMS["a_noise"][0], NORMAL_PARAMS["a_noise"][1]), 2)

    a_race = "outer" # Default to outer, will be randomized if defect occurs
    a_L = 0.0 # Default to no defect
    a_N = 0 # Default to no defect
    a_lambda = [0.0] * 5 # Default to no defect
    a_delta = [0.0] * 5 # Default to no defect

    # Introduce defect occasionally
    if random.random() < DEFECT_CHANCE:
        a_L = round(random.uniform(DEFECT_PARAMS["a_L"][0], DEFECT_PARAMS["a_L"][1]), 1)
        a_N = random.randint(DEFECT_PARAMS["a_N"][0], DEFECT_PARAMS["a_N"][1])
        a_lambda = [round(random.uniform(DEFECT_PARAMS["a_lambda"][0], DEFECT_PARAMS["a_lambda"][1]), 1) for _ in range(5)]
        a_delta = [round(random.uniform(DEFECT_PARAMS["a_delta"][0], DEFECT_PARAMS["a_delta"][1]), 1) for _ in range(5)]
        a_race = random.choice(["inner", "outer"]) # Randomly choose inner or outer defect

    simulation_input_data = {
        "bearing_params": {
            "a_n": a_n,
            "a_dP": a_dP,
            "a_race": a_race,
            "a_rpm": a_rpm,
            "a_dB": a_dB,
            "a_theta": a_theta,
            "a_L": a_L,
            "a_N": a_N,
            "a_lambda": a_lambda,
            "a_delta": a_delta
        },
        "acquisition_params": {
            "a_duration": a_duration,
            "a_frequency": a_frequency,
            "a_noise": a_noise
        }
    }
    return simulation_input_data

with open('/app/producer_output.log', 'w') as f:
    f.write("Producer started!\n")

producer = KafkaProducer(
    bootstrap_servers=['kafka:29092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

try:
    while True:
        data = generate_data()
        producer.send('sound-data', value=data)
        with open('/app/producer_output.log', 'a') as f:
            f.write(f"Sent simulation input: {data}\n")
        time.sleep(1)
except Exception as e:
    with open('/app/producer_output.log', 'a') as f:
        f.write(f"An error occurred: {e}\n")
