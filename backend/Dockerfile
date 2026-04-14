FROM eclipse-temurin:17-jdk AS builder

WORKDIR /backend

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /backend

COPY --from=builder /backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]

