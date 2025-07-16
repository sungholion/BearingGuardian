import redis
# from hdfs import InsecureClient  # HDFS is not used in this version
import json
from datetime import datetime
import os
import time

REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
# HDFS_NAMENODE_HOST = os.getenv('HDFS_NAMENODE_HOST', 'namenode')
# HDFS_NAMENODE_PORT = int(os.getenv('HDFS_NAMENODE_PORT', 9870))

# Local directory to archive data
LOCAL_ARCHIVE_PATH = '/app/data_archive'

def archive_data():
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    # hdfs_client = InsecureClient(f'http://{HDFS_NAMENODE_HOST}:{HDFS_NAMENODE_PORT}', user='root')

    # Ensure local archive directory exists
    if not os.path.exists(LOCAL_ARCHIVE_PATH):
        os.makedirs(LOCAL_ARCHIVE_PATH)

    # print(f"[{datetime.now()}] Archiving data to HDFS")

    try:
        # Get all data from the list
        # We use RPOP to get one item at a time to simulate a stream
        data_to_archive = r.rpop('sensor_data')

        if not data_to_archive:
            # print(f"[{datetime.now()}] No data to archive.")
            return

        # Archive data to a single JSON file with a timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        local_path = os.path.join(LOCAL_ARCHIVE_PATH, f'data_{timestamp}.json')

        with open(local_path, 'w', encoding='utf-8') as f:
            f.write(data_to_archive)

        print(f"[{datetime.now()}] Successfully archived 1 item to {local_path}")

    except Exception as e:
        print(f"[{datetime.now()}] Error during archiving: {e}", flush=True)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("Archiver started. Will check for data every 5 seconds.")
    while True:
        archive_data()
        time.sleep(5) # Sleep for 5 seconds