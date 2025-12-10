# 📊 BÁO CÁO PHÂN TÍCH CÁC SERVICE TRONG DỰ ÁN MYBOOK

**Ngày tạo**: 11 tháng 12, 2025  
**Ngôn ngữ**: Tiếng Việt  
**Trạng thái**: Hoàn thành ✅

---

## 🏗️ TỔNG QUAN KIẾN TRÚC MICROSERVICES

Dự án MyBook sử dụng **Microservices Architecture** với các đặc điểm:

- **API Gateway**: Spring Cloud Gateway tại port 8888
- **Message Queue**: Kafka cho inter-service communication
- **Databases**: MySQL, MongoDB, Neo4j
- **Cache**: Redis
- **Monitoring**: Zipkin distributed tracing
- **Orchestration**: Docker Compose

---

## 📋 DANH SÁCH CÁC SERVICE

| Service                  | Port | DB      | Vai trò                    | Trạng thái    |
| ------------------------ | ---- | ------- | -------------------------- | ------------- |
| **Identity Service**     | 8080 | MySQL   | Xác thực, phân quyền       | ✅ Hoàn thành |
| **Book Service**         | 8086 | MySQL   | Quản lý sách, thư viện     | ✅ Hoàn thành |
| **Review Service**       | 8087 | MongoDB | Đánh giá sách              | ✅ Hoàn thành |
| **Library Service**      | 8088 | MySQL   | Thư viện cá nhân, Playlist | ✅ Hoàn thành |
| **Profile Service**      | 8081 | MySQL   | Hồ sơ người dùng           | ✅ Hoàn thành |
| **Order Service**        | 8091 | MySQL   | Đơn hàng, Thuê sách        | ✅ Hoàn thành |
| **Payment Service**      | 8092 | N/A     | Xử lý thanh toán           | ⚠️ Cơ bản     |
| **Transaction Service**  | 8090 | MySQL   | Ghi nhật ký giao dịch      | ✅ Hoàn thành |
| **Chat Service**         | 8085 | MongoDB | Tin nhắn, Hội thoại        | ✅ Hoàn thành |
| **File Service**         | 8084 | N/A     | Lưu trữ file, Media        | ✅ Hoàn thành |
| **Post Service**         | 8083 | MongoDB | Bài viết, Tạo nội dung     | ✅ Hoàn thành |
| **Notification Service** | 8082 | N/A     | Email, Thông báo           | ✅ Hoàn thành |

---

## 🔐 1. IDENTITY SERVICE (Dịch vụ Xác thực)

### 📌 Vai trò

- **Quản lý người dùng**: Đăng ký, đăng nhập, xóa tài khoản
- **Quản lý JWT**: Cấp token, xác thực token, refresh token
- **Quản lý vai trò và quyền**: RBAC (Role-Based Access Control)
- **Xác minh email**: Gửi token xác minh qua email
- **Quản lý permission**: Phân quyền chi tiết

### 🏛️ Tình trạng

✅ **Hoàn thành** - Đầy đủ tính năng xác thực

### 📐 Design Pattern Áp dụng

1. **JWT (JSON Web Token)**

   - Stateless authentication
   - Token có thời hạn (valid-duration)
   - Refresh token mechanism

2. **Repository Pattern**

   - `UserRepository` - Quản lý user entities
   - `InvalidatedTokenRepository` - Blacklist tokens khi logout

3. **Service Layer Pattern**

   - `AuthenticationService` - Logic xác thực
   - `UserService` - CRUD người dùng
   - `EmailVerificationService` - Gửi email xác minh

4. **Mapper Pattern**

   - `UserMapper` - Entity ↔ DTO conversion

5. **Exception Handling**
   - Custom `AppException` với `ErrorCode` enum
   - Centralized error handling

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/identity

POST   /auth/register                      → Đăng ký tài khoản
POST   /auth/token                         → Đăng nhập
POST   /auth/introspect                    → Xác thực token
POST   /auth/refresh                       → Làm mới token
POST   /auth/logout                        → Đăng xuất
POST   /auth/verify-email                  → Xác minh email
POST   /auth/resend-verification-email     → Gửi lại email xác minh

GET    /users/{id}                         → Lấy thông tin user
POST   /users                              → Tạo user (admin)
DELETE /users/{id}                         → Xóa user (admin)

GET    /roles                              → Danh sách vai trò
POST   /roles                              → Tạo vai trò (admin)

GET    /permissions                        → Danh sách quyền
POST   /permissions                        → Tạo quyền (admin)
```

### 🏗️ Cấu trúc Thư mục

```
identity-service/
├── controller/
│   ├── AuthenticationController.java
│   ├── UserController.java
│   ├── RoleController.java
│   └── PermissionController.java
├── service/
│   ├── AuthenticationService.java
│   ├── UserService.java
│   ├── EmailVerificationService.java
│   ├── RoleService.java
│   └── PermissionService.java
├── entity/
│   ├── User.java
│   ├── Role.java
│   ├── Permission.java
│   ├── InvalidatedToken.java
│   └── UserRole.java
├── dto/
│   ├── request/ (UserCreationRequest, AuthenticationRequest, etc.)
│   └── response/ (UserResponse, AuthenticationResponse, etc.)
├── repository/
├── mapper/
├── exception/
├── validator/
└── configuration/
```

### 💾 Database Schema

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE user_roles (
    user_id BIGINT,
    role_id BIGINT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE invalidated_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token TEXT NOT NULL,
    expiration_time DATETIME NOT NULL
);
```

### 🔒 Bảo mật

- **Password Encoding**: BCryptPasswordEncoder
- **JWT Signing**: HMAC SHA-256
- **Token Validation**: Signature + Expiration check
- **Email Verification**: Token-based verification
- **Rate Limiting**: Có thể cấu hình trên gateway

---

## 📚 2. BOOK SERVICE (Dịch vụ Quản lý Sách)

### 📌 Vai trò

- **Quản lý kho sách**: CRUD sách, tìm kiếm, phân loại
- **Import sách**: Từ Google Books API
- **Thống kê sách**: Số lượng, rating, danh mục
- **Tìm kiếm nâng cao**: Theo tiêu đề, tác giả, thể loại
- **Caching**: Redis caching cho performance

### 🏛️ Tình trạng

✅ **Hoàn thành** - Đầy đủ CRUD, tìm kiếm, import từ Google Books

### 📐 Design Pattern Áp dụng

1. **Repository Pattern with Specification**

   - `BookRepository extends JpaRepository + JpaSpecificationExecutor`
   - `BookSpecification` - Dynamic query building

2. **Service Layer Pattern**

   - `BookCrudService` - CRUD logic
   - Transactional methods
   - Separation of concerns

3. **Mapper Pattern**

   - `BookMapper` - Entity ↔ DTO conversion
   - MapStruct framework

4. **Caching Strategy**

   - `@Cacheable` trên các query methods
   - `@CacheEvict` khi update/delete
   - Redis backend

5. **Specification Pattern**
   - Dynamic filtering: keyword, category
   - Reusable query conditions

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/book

GET    /books                              → Lấy danh sách sách (có phân trang)
       ├─ ?keyword=...                    → Tìm kiếm theo từ khóa
       ├─ ?category=...                   → Lọc theo thể loại
       └─ ?page=1&size=10                 → Phân trang

GET    /books/{id}                         → Chi tiết một sách
GET    /books/categories                   → Danh sách thể loại
GET    /books/statistics                   → Thống kê (admin)

POST   /books                              → Tạo sách (admin)
PUT    /books/{id}                         → Cập nhật sách (admin)
DELETE /books/{id}                         → Xóa sách (admin)

POST   /books/import                       → Import từ Google Books (admin)
       └─ ?query=...&limit=10

POST   /books/provision                    → Tạo dữ liệu test (admin)
       └─ ?count=20
```

### 🏗️ Cấu trúc Entity

```
Book
├── id (PK)
├── title (indexed)
├── author (indexed)
├── isbn (unique, indexed)
├── description
├── categories (ElementCollection)
├── publishedAt
├── status (AVAILABLE/OUT_OF_STOCK/ARCHIVED)
├── publisher
├── thumbnailUrl
├── pageCount
├── averageRating
├── ratingsCount
└── language
```

### 💾 Database

- **MySQL** (InnoDB)
- **Indexes**: title, author, isbn
- **Partitioning**: Có thể thêm nếu data lớn

### 🚀 Features

- ✅ Full-text search trên title, author, description
- ✅ Category filtering
- ✅ Pagination & sorting
- ✅ Google Books API integration
- ✅ Redis caching
- ✅ Statistics & analytics

---

Tiếp theo: Xem file **SERVICES_ANALYSIS_REPORT_VN_PART2.md**
