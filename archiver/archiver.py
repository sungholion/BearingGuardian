import redis
from hdfs import InsecureClient
import json
from datetime import datetime
import os
import time

REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
HDFS_NAMENODE_HOST = os.getenv('HDFS_NAMENODE_HOST', 'namenode')
HDFS_NAMENODE_PORT = int(os.getenv('HDFS_NAMENODE_PORT', 9870))

def archive_data():
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    hdfs_client = InsecureClient(f'http://{HDFS_NAMENODE_HOST}:{HDFS_NAMENODE_PORT}', user='root')

    # Ensure HDFS directory exists
    if not hdfs_client.status('/redis_archive', strict=False):
        hdfs_client.makedirs('/redis_archive')

    print(f"[{datetime.now()}] Archiving data to HDFS")

    try:
        # Get all data from the list
        data_to_archive = r.lrange('sensor_data', 0, -1)

        if not data_to_archive:
            print(f"[{datetime.now()}] No data to archive.")
            return

        # Clear the list in Redis
        r.delete('sensor_data')

        # Archive data to a single JSONL file for the current day
        current_date = datetime.now().strftime("%Y%m%d")
        hdfs_path = f'/redis_archive/data_{current_date}.jsonl'

        # Append to the file if it exists, otherwise create a new one
        mode = 'ab' if hdfs_client.status(hdfs_path, strict=False) else 'wb'

        with hdfs_client.write(hdfs_path, encoding='utf-8', overwrite=False, append=True) as writer:
            for item_str in data_to_archive:
                writer.write(item_str + '\n')

        print(f"[{datetime.now()}] Successfully archived {len(data_to_archive)} items to HDFS: {hdfs_path}")

    except Exception as e:
        print(f"[{datetime.now()}] Error during archiving: {e}", flush=True)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    while True:
        archive_data()
        print(f"[{datetime.now()}] Next archive in 60 seconds...")
        time.sleep(60) # Sleep for 60 seconds