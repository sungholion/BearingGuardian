import time
import json
import numpy as np
from kafka import KafkaProducer
from DES.Simulation import Simulation
from Bearing.Bearing import Bearing
from DES.Acquisition import Acquisition
import random

# Global counters for event ratios
event_counts = {"normal": 0, "outer": 0, "inner": 0}
total_events = 0

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
    a_L = 0.0 # Default to no defect
    a_N = 0 # Default to no defect
    a_lambda = [0.0] * 5 # Default to no defect
    a_delta = [0.0] * 5 # Default to no defect

    # Generate normal parameters within their defined ranges
    a_n = random.randint(NORMAL_PARAMS["a_n"][0], NORMAL_PARAMS["a_n"][1])
    a_dP = round(random.uniform(NORMAL_PARAMS["a_dP"][0], NORMAL_PARAMS["a_dP"][1]), 3)
    a_rpm = random.randint(NORMAL_PARAMS["a_rpm"][0], NORMAL_PARAMS["a_rpm"][1])
    a_dB = round(random.uniform(NORMAL_PARAMS["a_dB"][0], NORMAL_PARAMS["a_dB"][1]), 4)
    a_theta = round(random.uniform(NORMAL_PARAMS["a_theta"][0], NORMAL_PARAMS["a_theta"][1]), 2)
    a_duration = round(random.uniform(NORMAL_PARAMS["a_duration"][0], NORMAL_PARAMS["a_duration"][1]), 5)
    a_frequency = random.randint(NORMAL_PARAMS["a_frequency"][0], NORMAL_PARAMS["a_frequency"][1])
    a_noise = round(random.uniform(NORMAL_PARAMS["a_noise"][0], NORMAL_PARAMS["a_noise"][1]), 2)

    # Determine a_race based on desired probabilities (Normal: 70%, Outer: 20%, Inner: 10%)
    # This logic ensures the ratio is maintained over every 100 events.
    global event_counts, total_events

    if total_events % 100 == 0:
        # Reset counts for the new block of 100 events
        event_counts = {"normal": 0, "outer": 0, "inner": 0}

    # Determine which event to generate based on remaining slots in the current 100-event block
    remaining_normal = 70 - event_counts["normal"]
    remaining_outer = 20 - event_counts["outer"]
    remaining_inner = 10 - event_counts["inner"]

    possible_races = []
    possible_races.extend(["normal"] * remaining_normal)
    possible_races.extend(["outer"] * remaining_outer)
    possible_races.extend(["inner"] * remaining_inner)

    if possible_races:
        a_race = random.choice(possible_races)
        event_counts[a_race] += 1
    else:
        # Fallback if for some reason no possible races are left (shouldn't happen with correct logic)
        a_race = random.choice(["normal", "outer", "inner"])

    total_events += 1

    # Introduce defect parameters only if a_race is not "normal"
    if a_race != "normal":
        a_L = round(random.uniform(DEFECT_PARAMS["a_L"][0], DEFECT_PARAMS["a_L"][1]), 1)
        a_N = random.randint(DEFECT_PARAMS["a_N"][0], DEFECT_PARAMS["a_N"][1])
        a_lambda = [round(random.uniform(DEFECT_PARAMS["a_lambda"][0], DEFECT_PARAMS["a_lambda"][1]), 1) for _ in range(5)]
        a_delta = [round(random.uniform(DEFECT_PARAMS["a_delta"][0], DEFECT_PARAMS["a_delta"][1]), 1) for _ in range(5)]

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

producer = KafkaProducer(
    bootstrap_servers=['kafka:29092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

try:
    while True:
        data = generate_data()
        producer.send('sound-data', value=data)
        print(f"Sent simulation input: {data}")
        time.sleep(3)
except Exception as e:
    print(f"An error occurred: {e}")
