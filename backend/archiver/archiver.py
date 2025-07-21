# Data Archiver Service
# This script continuously archives sensor data from Redis to local storage.
# In a full production environment, this would typically archive to a distributed file system like HDFS.

import redis
# from hdfs import InsecureClient  # HDFS is not used in this version, but kept for reference
import json
from datetime import datetime
import os
import time

# Configuration from environment variables
REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
# HDFS_NAMENODE_HOST = os.getenv('HDFS_NAMENODE_HOST', 'namenode') # HDFS config for future integration
# HDFS_NAMENODE_PORT = int(os.getenv('HDFS_NAMENODE_PORT', 9870))

# Local directory to archive data (acts as a temporary or primary archive location)
LOCAL_ARCHIVE_PATH = '/app/data_archive'

def archive_data():
    # Connect to Redis
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    # hdfs_client = InsecureClient(f'http://{HDFS_NAMENODE_HOST}:{HDFS_NAMENODE_PORT}', user='root') # HDFS client initialization

    # Ensure local archive directory exists
    if not os.path.exists(LOCAL_ARCHIVE_PATH):
        os.makedirs(LOCAL_ARCHIVE_PATH)

    # print(f"[{datetime.now()}] Archiving data to HDFS") # Debug print for HDFS archiving

    try:
        # Get data from Redis list (using RPOP to process one item at a time)
        data_to_archive = r.rpop('sensor_data')

        if not data_to_archive:
            # print(f"[{datetime.now()}] No data to archive.") # Log if no data is available
            return

        # Archive data to a single JSON file with a timestamp for unique identification
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        local_path = os.path.join(LOCAL_ARCHIVE_PATH, f'data_{timestamp}.json')

        with open(local_path, 'w', encoding='utf-8') as f:
            f.write(data_to_archive)

        print(f"[{datetime.now()}] Successfully archived 1 item to {local_path}")

    except Exception as e:
        print(f"[{datetime.now()}] Error during archiving: {e}", flush=True)
        import traceback
        traceback.print_exc() # Print full traceback for debugging

if __name__ == "__main__":
    print("Archiver started. Will check for data every 5 seconds.")
    # Main loop to continuously archive data
    while True:
        archive_data()
        time.sleep(5) # Sleep for 5 seconds before checking again