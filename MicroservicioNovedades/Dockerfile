# ============================
# STAGE 1 — Build
# ============================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Descargar dependencias primero (aprovecha caché de Docker)
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Compilar
COPY src ./src
RUN mvn -B package -DskipTests


# ============================
# STAGE 2 — Runtime
# ============================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# ------------------------------------
# Variables de entorno
# (los valores reales vienen del .env)
# ------------------------------------

# Servidor
ENV PORT=5003

# Base de datos PostgreSQL
ENV NOVEDADES_DB_URL=""
ENV NOVEDADES_DB_USER=""
ENV NOVEDADES_DB_PASS=""

# RabbitMQ
ENV SPRING_RABBITMQ_HOST=""
ENV SPRING_RABBITMQ_PORT=5672
ENV SPRING_RABBITMQ_USERNAME=""
ENV SPRING_RABBITMQ_PASSWORD=""
ENV RABBITMQ_QUEUE_NAME=cola.novedades.notificaciones

# Cliente REST externo
ENV CLIENTS_USUARIOS_BASE_URL=http://localhost:8081

# ------------------------------------
EXPOSE ${PORT}

COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "/app/app.jar"]
