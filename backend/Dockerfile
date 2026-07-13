# Stage 1: build bằng Maven, cần JDK đầy đủ để biên dịch
FROM maven:3.9-eclipse-temurin-21 AS build
# Đặt "thư mục làm việc hiện tại" bên trong image thành /app
WORKDIR /app
# Copy file pom.xml vào image
COPY pom.xml .
# Tải tất cả các dependency về trước, để tận dụng cache của Docker
RUN mvn -B dependency:go-offline
# Copy toàn bộ phần còn lại của thư mục backend vào image
COPY src ./src
# Biên dịch và đóng gói ứng dụng Spring Boot thành file JAR
RUN mvn -B clean package -DskipTests

# Stage 2: chạy ứng dụng Spring Boot với JRE nhẹ hơn
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copy file JAR đã build từ stage trước sang image mới
COPY --from=build /app/target/*.jar app.jar
# Khai báo container này lắng nghe cổng 8080
EXPOSE 8080
# Chạy ứng dụng Spring Boot khi container khởi động
ENTRYPOINT ["java", "-jar", "app.jar"]
