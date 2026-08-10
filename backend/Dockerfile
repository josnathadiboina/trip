# ============================================================
# TRIPWITHUS — Backend build (multi-stage Maven + JRE)
# ============================================================

# ---- Stage 1: Build ----
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy POM first to leverage Docker layer caching
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a non-root user to run the app securely
RUN addgroup -S tripwithus && adduser -S tripwithus -G tripwithus

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar

USER tripwithus

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
