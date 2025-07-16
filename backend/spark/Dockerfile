FROM openjdk:17-jdk-slim-bullseye

ENV SPARK_VERSION=3.5.1
ENV HADOOP_VERSION=3.3.6
ENV SPARK_HOME=/opt/spark
ENV PATH=$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin

# Install necessary packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    curl \
    netcat \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Download and extract Spark
RUN wget https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop3.tgz -O /tmp/spark-${SPARK_VERSION}-bin-hadoop3.tgz \
    && tar -xzf /tmp/spark-${SPARK_VERSION}-bin-hadoop3.tgz -C /opt/ \
    && mv /opt/spark-${SPARK_VERSION}-bin-hadoop3 ${SPARK_HOME} \
    && rm /tmp/spark-${SPARK_VERSION}-bin-hadoop3.tgz

# Install PySpark dependencies
RUN pip install pyspark

WORKDIR ${SPARK_HOME}

# Expose Spark Master ports
EXPOSE 8080 7077

CMD ["/bin/bash"]
