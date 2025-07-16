FROM ubuntu:20.04

ENV HIVE_VERSION=3.1.3
ENV HADOOP_VERSION=3.2.1
ENV HADOOP_HOME=/opt/hadoop
ENV HIVE_HOME=/opt/hive
ENV PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin:$HIVE_HOME/bin

# Install necessary packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-11-jdk \
    wget \
    curl \
    netcat \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Download and extract Hadoop
RUN wget https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz -O /tmp/hadoop-${HADOOP_VERSION}.tar.gz \
    && tar -xzf /tmp/hadoop-${HADOOP_VERSION}.tar.gz -C /opt/ \
    && mv /opt/hadoop-${HADOOP_VERSION} ${HADOOP_HOME} \
    && rm /tmp/hadoop-${HADOOP_VERSION}.tar.gz

# Download and extract Hive
RUN wget https://archive.apache.org/dist/hive/hive-${HIVE_VERSION}/apache-hive-${HIVE_VERSION}-bin.tar.gz -O /tmp/apache-hive-${HIVE_VERSION}-bin.tar.gz \
    && tar -xzf /tmp/apache-hive-${HIVE_VERSION}-bin.tar.gz -C /opt/ \
    && mv /opt/apache-hive-${HIVE_VERSION}-bin ${HIVE_HOME} \
    && rm /tmp/apache-hive-${HIVE_VERSION}-bin.tar.gz

# Download PostgreSQL JDBC Driver
RUN wget https://jdbc.postgresql.org/download/postgresql-42.2.23.jar -O ${HIVE_HOME}/lib/postgresql-42.2.23.jar

# Create Hive warehouse directory in HDFS (will be created by Hive on first run)
# RUN ${HADOOP_HOME}/bin/hdfs dfs -mkdir -p /user/hive/warehouse

WORKDIR ${HIVE_HOME}

# Expose HiveServer2 ports
EXPOSE 10000 10002

CMD ["/bin/bash"]