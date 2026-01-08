# REST API Backend

Backend REST API sử dụng Spring Boot 3.2.0 và Java 17 - cung cấp RESTful API cho Authors và Books.

## Yêu cầu
- Java 17
- Maven 3.6+

## Cài đặt và Chạy

### Build project
```bash
mvn clean install
```

### Chạy ứng dụng
```bash
mvn spring-boot:run
```

Backend sẽ chạy trên port **8081**: http://localhost:8081

## API Endpoints

### Authors

- **GET** `/api/authors` - Lấy tất cả tác giả
- **GET** `/api/authors/{id}` - Lấy tác giả theo ID
- **GET** `/api/authors/search?name={name}` - Tìm kiếm tác giả theo tên
- **POST** `/api/authors` - Tạo tác giả mới
  ```json
  {
    "name": "Author Name",
    "bio": "Author biography"
  }
  ```
- **PUT** `/api/authors/{id}` - Cập nhật tác giả
- **DELETE** `/api/authors/{id}` - Xóa tác giả

### Books

- **GET** `/api/books` - Lấy tất cả sách
- **GET** `/api/books/{id}` - Lấy sách theo ID
- **GET** `/api/books/search?title={title}` - Tìm kiếm sách theo tiêu đề
- **GET** `/api/books/author/{authorId}` - Lấy sách theo tác giả
- **POST** `/api/books` - Tạo sách mới
  ```json
  {
    "title": "Book Title",
    "pageCount": 300,
    "authorId": 1
  }
  ```
- **PUT** `/api/books/{id}` - Cập nhật sách
- **DELETE** `/api/books/{id}` - Xóa sách

## Database

Ứng dụng sử dụng H2 in-memory database. H2 Console có thể truy cập tại:
- URL: http://localhost:8081/h2-console
- JDBC URL: `jdbc:h2:mem:restdb`
- Username: `sa`
- Password: (để trống)

## Sample Data

Backend tự động tạo sample data khi khởi động:
- 3 Authors: J.K. Rowling, George R.R. Martin, J.R.R. Tolkien
- 6 Books: Harry Potter series, Game of Thrones series, The Hobbit, Lord of the Rings

## Công nghệ sử dụng

- Spring Boot 3.2.0
- Java 17
- Spring Data JPA
- Spring Web (REST API)
- H2 Database
- Lombok
- Maven
