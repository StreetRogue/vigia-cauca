# ============================
# STAGE 1 — Build
# ============================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# ============================
# STAGE 2 — Runtime
# ============================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

ENV SERVER_PORT=8080

EXPOSE 8080

COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "/app/app.jar"]
