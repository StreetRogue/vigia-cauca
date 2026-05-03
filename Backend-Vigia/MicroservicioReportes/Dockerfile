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
ENV PORT=5004

# Base de datos PostgreSQL
ENV REPORTES_DB_URL=""
ENV REPORTES_DB_USER=""
ENV REPORTES_DB_PASS=""

# RabbitMQ
ENV SPRING_RABBITMQ_HOST=""
ENV SPRING_RABBITMQ_PORT=5672
ENV SPRING_RABBITMQ_USERNAME=""
ENV SPRING_RABBITMQ_PASSWORD=""
ENV RABBITMQ_QUEUE_NOVEDADES=cola.novedades.estadisticas
ENV RABBITMQ_EXCHANGE_NOVEDADES=exchange.novedades
ENV RABBITMQ_RK_NOVEDADES=rk.novedades.estadisticas

# Cliente REST externo
ENV CLIENTS_NOVEDADES_BASE_URL=http://localhost:5003

# Directorio temporal para reportes
ENV REPORTES_TEMP_DIR=/tmp/reportes

# ------------------------------------
EXPOSE ${PORT}

COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "/app/app.jar"]
