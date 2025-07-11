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

    current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
    hdfs_path = f'/redis_archive/data_{current_time}.json'

    print(f"[{datetime.now()}] Archiving data to HDFS: {hdfs_path}")

    try:
        all_keys = r.keys('*')
        if not all_keys:
            print(f"[{datetime.now()}] No data in Redis to archive.")
            return

        data_to_archive = {}
        for key in all_keys:
            data_to_archive[key] = r.get(key)

        json_data = json.dumps(data_to_archive, indent=2)

        with hdfs_client.write(hdfs_path, encoding='utf-8') as writer:
            writer.write(json_data)

        print(f"[{datetime.now()}] Successfully archived {len(all_keys)} keys to HDFS.")

        # Clear Redis after successful archive
        r.flushdb()
        print(f"[{datetime.now()}] Redis flushed.")

    except Exception as e:
        print(f"[{datetime.now()}] Error during archiving: {e}")

if __name__ == "__main__":
    # Simple loop to run daily (for demonstration, in production use a proper scheduler like cron)
    while True:
        archive_data()
        print(f"[{datetime.now()}] Next archive in 24 hours...")
        time.sleep(60) # Sleep for 60 seconds