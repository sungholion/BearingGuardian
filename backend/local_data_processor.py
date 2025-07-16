import pandas as pd
import os
import time
import json

ARCHIVE_DIR = 'data_archive'
PROCESSED_DIR = 'processed_data'

def process_new_files():
    if not os.path.exists(ARCHIVE_DIR):
        print(f"Error: Archive directory '{ARCHIVE_DIR}' not found.")
        return

    if not os.path.exists(PROCESSED_DIR):
        os.makedirs(PROCESSED_DIR)

    new_files = [f for f in os.listdir(ARCHIVE_DIR) if f.endswith('.json')]
    
    if not new_files:
        # print("No new files to process.")
        return

    print(f"Found {len(new_files)} new files to process.")

    for filename in new_files:
        file_path = os.path.join(ARCHIVE_DIR, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Convert single JSON object to a list of dictionaries for DataFrame
            if isinstance(data, dict):
                df = pd.DataFrame([data])
            else:
                df = pd.DataFrame(data)

            print(f"\n--- Processing file: {filename} ---")
            print("Original Data:")
            print(df)

            # --- Data Preprocessing Logic (Simulating Spark Transformations) ---
            # Example: Convert 'value' column to numeric and calculate mean
            if 'value' in df.columns:
                df['value'] = pd.to_numeric(df['value'], errors='coerce')
                print(f"Mean of 'value': {df['value'].mean()}")
            
            # Example: Add a new column based on existing data
            if 'timestamp' in df.columns:
                df['processed_timestamp'] = pd.to_datetime(df['timestamp'])
                print("Processed Timestamp added.")

            print("Processed Data (first 5 rows):")
            print(df.head())
            # --- End of Data Preprocessing Logic ---

            # Move processed file to PROCESSED_DIR
            os.rename(file_path, os.path.join(PROCESSED_DIR, filename))
            print(f"Finished processing {filename}. Moved to {PROCESSED_DIR}/")

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from {filename}: {e}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

def main():
    print(f"Monitoring '{ARCHIVE_DIR}' for new files...")
    while True:
        process_new_files()
        time.sleep(2) # Check for new files every 2 seconds

if __name__ == "__main__":
    main()