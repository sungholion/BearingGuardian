from pyspark.sql import SparkSession

def main():
    """
    Main function to read data from HDFS using Spark.
    """
    spark = SparkSession.builder \
        .appName("HDFS Reader") \
        .getOrCreate()

    # Path to the file in HDFS
    file_path = "hdfs://namenode:8020/test/sample_data.txt"
    
    try:
        # Read the text file from HDFS
        df = spark.read.text(file_path)

        # Show the content of the DataFrame
        print("Successfully read file from HDFS. Content:")
        df.show()

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        # Stop the SparkSession
        spark.stop()

if __name__ == "__main__":
    main()

