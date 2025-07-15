from pyspark.sql import SparkSession

# Create a SparkSession
spark = SparkSession.builder \
    .appName("HDFSJsonReader") \
    .master("spark://spark-master:7077") \
    .config("spark.hadoop.fs.defaultFS", "hdfs://namenode:9870") \
    .config("spark.hadoop.ipc.maximum.data.length", "268435456") \
    .config("spark.sql.files.maxPartitionBytes", "134217728") \
    .config("spark.sql.files.ignoreCorruptFiles", "true") \
    .config("spark.hadoop.mapreduce.input.fileinputformat.split.maxsize", "134217728") \
    .config("spark.hadoop.dfs.client.block.write.locate.max.retries", "10") \
    .getOrCreate()

# Read JSON data from HDFS
# Ensure the path matches where your archiver service is writing data
df = spark.read.json("hdfs://namenode:9870/redis_archive/*.jsonl")

# Show the schema and some data
df.printSchema()
df.show()

# Stop the SparkSession
spark.stop()