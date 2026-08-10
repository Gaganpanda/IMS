# ── Stage 1: Build ─────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Leverage Docker layer cache: resolve dependencies first
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Now copy sources and build
COPY src ./src
RUN mvn -B clean package -DskipTests

# ── Stage 2: Runtime ───────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Non-root user for security
RUN groupadd -r ims && useradd -r -g ims ims

COPY --from=build /app/target/*.jar app.jar

# Directory for uploaded item images (mounted as a volume in compose)
RUN mkdir -p /app/uploads && chown -R ims:ims /app

USER ims

EXPOSE 8080

ENV JAVA_OPTS=""

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://localhost:8080/api/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
