from mysql_config import engine
from sqlalchemy import text

TABLES = [
    "vibration",
    "vibration_input",
    "vibration_result",
    "vibration_stats"
]

def print_table(table_name):
    print(f"\n===== {table_name} =====")
    with engine.connect() as conn:
        try:
            result = conn.execute(text(f"SELECT * FROM {table_name}"))
            rows = result.fetchall()
            if not rows:
                print("(no data)")
                return
            # Print column names
            print(" | ".join(result.keys()))
            for row in rows:
                print(" | ".join(str(col) for col in row))
        except Exception as e:
            print(f"Error reading {table_name}: {e}")

def main():
    for table in TABLES:
        print_table(table)

if __name__ == "__main__":
    main() 