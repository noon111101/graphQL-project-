# 📝 HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY PROJECT

## ✅ Yêu cầu hệ thống

### Backend:
- **Java 17 hoặc cao hơn**
- **Maven 3.6+**

### Frontend:
- **Node.js 14+**
- **npm hoặc yarn**

## 🔧 Cài đặt công cụ cần thiết

### Cài đặt Java (nếu chưa có):
```bash
# macOS (sử dụng Homebrew)
brew install openjdk@17

# Hoặc download từ: https://adoptium.net/
```

### Cài đặt Maven (nếu chưa có):
```bash
# macOS
brew install maven

# Kiểm tra version
mvn --version
```

### Cài đặt Node.js (nếu chưa có):
```bash
# macOS
brew install node

# Kiểm tra version
node --version
npm --version
```

## 🚀 CHẠY ỨNG DỤNG

### Cách 1: Sử dụng Script (Khuyến nghị)

#### Backend:
```bash
cd backend
./run.sh
```

#### Frontend (Terminal khác):
```bash
cd frontend
./run.sh
```

### Cách 2: Chạy thủ công

#### Backend:
```bash
cd backend

# Build project
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8080**

#### Frontend:
```bash
cd frontend

# Cài đặt dependencies (chỉ cần làm 1 lần)
npm install

# Chạy ứng dụng
npm start
```

Frontend sẽ chạy tại: **http://localhost:3000**

### Cách 3: Sử dụng IDE

#### Backend (IntelliJ IDEA hoặc Eclipse):
1. Import project as Maven project
2. Tìm file `GraphqlBackendApplication.java`
3. Click chuột phải và chọn "Run"

#### Frontend (VS Code hoặc bất kỳ editor nào):
1. Mở terminal trong thư mục frontend
2. Chạy `npm install` (chỉ lần đầu)
3. Chạy `npm start`

## 🔍 Kiểm tra ứng dụng

### Backend Endpoints:
- **GraphQL API:** http://localhost:8080/graphql
- **GraphiQL Interface:** http://localhost:8080/graphiql
- **H2 Database Console:** http://localhost:8080/h2-console

### Frontend:
- **Main App:** http://localhost:3000
- **Books Page:** http://localhost:3000/
- **Authors Page:** http://localhost:3000/authors

## 🧪 Test GraphQL API

Mở GraphiQL tại `http://localhost:8080/graphiql` và thử query sau:

```graphql
query {
  books {
    id
    title
    author
    year
    description
    authorEntity {
      name
      country
    }
  }
}
```

## 🐛 Xử lý lỗi thường gặp

### Backend không khởi động:
1. **Kiểm tra Java version:**
   ```bash
   java -version
   ```
   Cần Java 17+

2. **Port 8080 đã được sử dụng:**
   - Tìm process đang dùng port: `lsof -i :8080`
   - Kill process: `kill -9 <PID>`
   - Hoặc thay đổi port trong `application.properties`

### Frontend không khởi động:
1. **Node modules lỗi:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Port 3000 đã được sử dụng:**
   - Chọn port khác khi được hỏi
   - Hoặc kill process: `lsof -i :3000` và `kill -9 <PID>`

### CORS Error:
- Đảm bảo backend đang chạy
- Kiểm tra `application.properties` có cấu hình CORS đúng
- Frontend phải chạy ở `http://localhost:3000`

## 📊 Cấu trúc Database

Ứng dụng sử dụng H2 in-memory database, dữ liệu sẽ reset mỗi khi restart.

### Truy cập H2 Console:
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:bookdb`
- Username: `sa`
- Password: (để trống)

## 🎯 Tính năng chính

### Books Management:
- ✅ Xem danh sách sách
- ✅ Xem chi tiết sách
- ✅ Thêm sách mới
- ✅ Sửa thông tin sách
- ✅ Xóa sách

### Authors Management:
- ✅ Xem danh sách tác giả
- ✅ Xem chi tiết tác giả và sách của họ
- ✅ Thêm tác giả mới
- ✅ Sửa thông tin tác giả
- ✅ Xóa tác giả
- ✅ Tìm kiếm tác giả

## 📝 Dữ liệu mẫu

Khi khởi động, hệ thống tự động tạo:
- **3 tác giả:** F. Scott Fitzgerald, Harper Lee, George Orwell
- **4 sách:** The Great Gatsby, To Kill a Mockingbird, 1984, Animal Farm

## 🔐 Security Note

Đây là project demo, không có authentication/authorization. Trong production cần thêm:
- Spring Security
- JWT tokens
- User management
- Input validation

## 📚 Tài liệu tham khảo

- [Spring GraphQL Documentation](https://docs.spring.io/spring-graphql/docs/current/reference/html/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Specification](https://spec.graphql.org/)

---

**Chúc bạn code vui vẻ! 🚀**

