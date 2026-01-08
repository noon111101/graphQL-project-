# --- STAGE 1: BUILD (Dùng Maven để build ra file .jar) ---
# Dùng ảnh Maven có sẵn JDK 17 (khớp với project của bạn)
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# [TỐI ƯU CACHE] 1. Chỉ copy file thư viện trước
COPY pom.xml .
# 2. Tải thư viện về (Bước này sẽ được Docker Cache nếu pom.xml không đổi)
RUN mvn dependency:go-offline

# [BUILD] 3. Bây giờ mới copy source code vào
COPY src ./src
# 4. Build ra file .jar (Bỏ qua test để build nhanh hơn)
RUN mvn package -DskipTests

# --- STAGE 2: RUNTIME (Chỉ lấy JRE để chạy - Siêu nhẹ) ---
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# [BẢO MẬT] Tạo user quyền hạn chế, không dùng root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy file .jar từ Stage 1 sang (Tự động lấy file jar bất kể tên version)
COPY --from=builder /app/target/*.jar app.jar

# Biến môi trường mặc định (Có thể override lúc chạy)
ENV SERVER_PORT=8080

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]