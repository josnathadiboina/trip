# ---------- Stage 1: Build ----------
# Use a JDK image that includes Maven-capable tooling via the wrapper (./mvnw).
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# 1) Copy the Maven wrapper (mvnw, mvnw.cmd, .mvn) and pom.xml first
#    so dependency resolution is cached in a separate layer.
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Note: `sh mvnw` is used instead of `./mvnw` so the build works even if the
# executable bit was not preserved by git on the checkout (robust on any host).
# 2) Download dependencies in a standalone step (cached for rebuilds).
RUN sh mvnw -B -DskipTests dependency:go-offline

# 3) Copy the source and build the executable jar.
COPY src src
RUN sh mvnw -B -DskipTests clean package

# ---------- Stage 2: Runtime ----------
# Minimal JRE image to run the packaged Spring Boot jar.
FROM eclipse-temurin:17-jre

WORKDIR /app

# Create a non-root user for better container security.
RUN groupadd -r app && useradd -r -g app app

# Copy the built jar from the build stage.
COPY --from=build /app/target/*.jar app.jar

# The app listens on 8080 by default (see application.properties).
EXPOSE 8080

# Run as non-root.
USER app

# Use exec-form so the Spring Boot process receives signals correctly.
ENTRYPOINT ["java", "-jar", "app.jar"]
