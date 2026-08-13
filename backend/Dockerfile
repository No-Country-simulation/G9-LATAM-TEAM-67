FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY backend/mvnw .
COPY backend/.mvn ./.mvn
COPY backend/pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY backend/src ./src

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]
