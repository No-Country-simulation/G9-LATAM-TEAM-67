FROM eclipse-temurin:17-jdk

WORKDIR /app

RUN apt-get update \
    && apt-get install -y unzip \
    && rm -rf /var/lib/apt/lists/*

COPY backend/mvnw .
COPY backend/.mvn ./.mvn
COPY backend/pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY backend/src ./src

EXPOSE 8080

CMD ["sh", "-c", "mkdir -p /opt/oracle/wallet && base64 -d /etc/secrets/oracle-wallet.b64 > /tmp/oracle-wallet.zip && unzip -o /tmp/oracle-wallet.zip -d /opt/oracle/wallet && export TNS_ADMIN=/opt/oracle/wallet && ./mvnw spring-boot:run"]