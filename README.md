# GraphQL Library Project

Dự án quản lý thư viện sách sử dụng Spring Boot GraphQL Backend và React TypeScript Frontend với Apollo Client.

## 🚀 Công nghệ sử dụng

### Backend
- **Spring Boot 3.2.0** - Framework Java
- **Spring GraphQL** - GraphQL API
- **Spring Data JPA** - ORM
- **H2 Database** - In-memory database
- **Lombok** - Giảm boilerplate code

### Frontend
- **React 18** với TypeScript
- **Apollo Client** - GraphQL client
- **React Router** - Routing
- **CSS3** - Styling

## 📋 Tính năng

### Quản lý sách (Books)
- ✅ Xem danh sách tất cả sách
- ✅ Xem chi tiết sách
- ✅ Thêm sách mới
- ✅ Cập nhật thông tin sách
- ✅ Xóa sách

### Quản lý tác giả (Authors)
- ✅ Xem danh sách tác giả
- ✅ Xem chi tiết tác giả và danh sách sách của họ
- ✅ Thêm tác giả mới
- ✅ Cập nhật thông tin tác giả
- ✅ Xóa tác giả
- ✅ Tìm kiếm tác giả theo tên

### Mối quan hệ
- ✅ Sách có thể liên kết với tác giả (ManyToOne)
- ✅ Tác giả có danh sách các sách của họ (OneToMany)

## 🛠️ Cài đặt và chạy

### Backend (Spring Boot)

1. **Điều hướng đến thư mục backend:**
```bash
cd backend
```

2. **Chạy ứng dụng:**
```bash
./mvnw spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

**GraphQL Playground:** `http://localhost:8080/graphiql`

**H2 Console:** `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:bookdb`
- Username: `sa`
- Password: (để trống)

### Frontend (React)

1. **Điều hướng đến thư mục frontend:**
```bash
cd frontend
```

2. **Cài đặt dependencies (nếu chưa):**
```bash
npm install
```

3. **Chạy ứng dụng:**
```bash
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 📝 GraphQL Schema

### Types

```graphql
type Book {
    id: ID!
    title: String!
    author: String!
    year: Int!
    description: String
    authorEntity: Author
}

type Author {
    id: ID!
    name: String!
    bio: String
    country: String
    books: [Book!]!
}
```

### Queries

```graphql
# Books
books: [Book!]!
book(id: ID!): Book

# Authors
authors: [Author!]!
author(id: ID!): Author
searchAuthors(name: String!): [Author!]!
```

### Mutations

```graphql
# Books
addBook(title: String!, author: String!, year: Int!, description: String): Book!
updateBook(id: ID!, title: String, author: String, year: Int, description: String): Book
deleteBook(id: ID!): Boolean!

# Authors
addAuthor(name: String!, bio: String, country: String): Author!
updateAuthor(id: ID!, name: String, bio: String, country: String): Author
deleteAuthor(id: ID!): Boolean!
```

## 🔍 Ví dụ GraphQL Queries

### Lấy tất cả sách
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

### Thêm sách mới
```graphql
mutation {
  addBook(
    title: "The Hobbit"
    author: "J.R.R. Tolkien"
    year: 1937
    description: "A fantasy novel"
  ) {
    id
    title
    author
    year
  }
}
```

### Lấy tác giả với danh sách sách
```graphql
query {
  author(id: "1") {
    id
    name
    bio
    country
    books {
      id
      title
      year
    }
  }
}
```

### Tìm kiếm tác giả
```graphql
query {
  searchAuthors(name: "Orwell") {
    id
    name
    country
    bio
  }
}
```

## 📂 Cấu trúc Project

```
graphQL-project/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/graphql/
│   │   │   │   ├── config/
│   │   │   │   │   └── DataInitializer.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── BookController.java
│   │   │   │   │   └── AuthorController.java
│   │   │   │   ├── entity/
│   │   │   │   │   ├── Book.java
│   │   │   │   │   └── Author.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── BookRepository.java
│   │   │   │   │   └── AuthorRepository.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── BookService.java
│   │   │   │   │   └── AuthorService.java
│   │   │   │   └── GraphqlBackendApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── graphql/
│   │   │           └── schema.graphqls
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── BookList.tsx
    │   │   ├── BookDetail.tsx
    │   │   ├── AddBook.tsx
    │   │   ├── AuthorList.tsx
    │   │   ├── AuthorDetail.tsx
    │   │   ├── AddAuthor.tsx
    │   │   └── Navigation.tsx
    │   ├── graphql/
    │   │   └── queries.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── apollo-client.ts
    │   ├── App.tsx
    │   └── index.tsx
    └── package.json
```

## 🎨 Giao diện

- **Modern UI/UX** với CSS3
- **Responsive Design** 
- **Card-based Layout**
- **Smooth Transitions & Animations**

## 🔧 Cấu hình

### Backend Configuration (application.properties)
```properties
server.port=8080
spring.graphql.graphiql.enabled=true
spring.graphql.path=/graphql
spring.graphql.cors.allowed-origins=http://localhost:3000
```

### Frontend Apollo Client
```typescript
const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});
```

## 📚 Dữ liệu mẫu

Khi khởi động, ứng dụng tự động tạo dữ liệu mẫu:
- 3 tác giả (F. Scott Fitzgerald, Harper Lee, George Orwell)
- 4 sách (The Great Gatsby, To Kill a Mockingbird, 1984, Animal Farm)

## 🚦 Trạng thái

✅ Backend hoàn thành
✅ Frontend hoàn thành
✅ CRUD operations cho Books
✅ CRUD operations cho Authors
✅ GraphQL API đầy đủ
✅ UI/UX hiện đại

## 📖 Hướng dẫn phát triển thêm

### Thêm tính năng mới:
1. Cập nhật schema GraphQL trong `schema.graphqls`
2. Tạo/cập nhật Entity trong package `entity`
3. Tạo/cập nhật Repository trong package `repository`
4. Tạo/cập nhật Service trong package `service`
5. Tạo/cập nhật Controller trong package `controller`
6. Cập nhật frontend queries trong `graphql/queries.ts`
7. Tạo React components tương ứng

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue trên GitHub.

---

**Happy Coding! 🚀📚**

