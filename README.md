# 📚 BookVault - Ứng dụng Web Quản lý Sách

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![Microservices](https://img.shields.io/badge/architecture-microservices-orange.svg)](#kiến-trúc-microservices)

**BookVault** là một ứng dụng web hiện đại để quản lý sách, thư viện cá nhân, và tương tác xã hội xung quanh việc đọc sách. Dự án được xây dựng theo kiến trúc **Microservices** với Spring Boot backend và React frontend.

---

## 🌟 Tính năng chính

- 🔐 **Xác thực & Phân quyền**: Đăng ký, đăng nhập, JWT authentication, RBAC
- 📖 **Quản lý Sách**: CRUD sách, tìm kiếm nâng cao, import từ Google Books API
- ⭐ **Đánh giá & Nhận xét**: Người dùng có thể đánh giá và review sách
- 📚 **Thư viện Cá nhân**: Quản lý sách đã đọc, muốn đọc, đang đọc
- 🎵 **Playlist Sách**: Tạo danh sách sách theo chủ đề, sắp xếp thứ tự
- 🛒 **Đặt hàng & Thuê sách**: Quản lý đơn hàng, thuê sách theo thời gian
- 💳 **Thanh toán**: Tích hợp thanh toán trực tuyến
- 💬 **Chat**: Tin nhắn real-time giữa người dùng
- 📝 **Bài viết**: Chia sẻ bài viết, cảm nhận về sách
- 👤 **Hồ sơ Người dùng**: Quản lý profile với Neo4j graph database
- 🔔 **Thông báo**: Email notifications cho các sự kiện quan trọng
- 📁 **Quản lý File**: Upload và quản lý ảnh, media files

---

## 🏗️ Kiến trúc Microservices

Dự án sử dụng kiến trúc Microservices với các thành phần:

### Infrastructure Services
- **API Gateway** (Port 8888): Spring Cloud Gateway - điểm vào duy nhất cho tất cả API
- **Service Discovery**: Docker DNS resolution
- **Message Queue**: Apache Kafka cho inter-service communication
- **Distributed Tracing**: Zipkin để monitor và trace requests
- **Caching**: Redis cho performance optimization

### Backend Services

| Service | Port | Database | Chức năng |
|---------|------|----------|-----------|
| **identity-service** | 8080 | MySQL | Xác thực, JWT, RBAC, Email verification |
| **book-service** | 8086 | MySQL | Quản lý sách, Google Books integration |
| **review-service** | 8087 | MongoDB | Đánh giá, nhận xét sách |
| **library-service** | 8088 | MySQL | Thư viện cá nhân, Playlists |
| **profile-service** | 8081 | Neo4j | Hồ sơ người dùng, Social graph |
| **order-service** | 8091 | MySQL | Đơn hàng, Thuê sách |
| **payment-service** | 8092 | - | Thanh toán trực tuyến |
| **transaction-service** | 8090 | MySQL | Ghi nhật ký giao dịch |
| **chat-service** | 8085 | MongoDB | Real-time messaging |
| **post-service** | 8083 | MongoDB | Bài viết, Nội dung người dùng |
| **file-service** | 8084 | MongoDB | Upload/Download files, Media |
| **notification-service** | 8082 | MongoDB | Email, Push notifications |

### Frontend
- **Client** (Port 3000): React + TypeScript + Vite
- **UI Framework**: TailwindCSS, HeadlessUI
- **State Management**: Redux Toolkit, Zustand
- **API Client**: Axios, React Query

### Databases
- **MySQL** (Port 3306): Relational data
- **MongoDB** (Port 27017): Document store
- **Neo4j** (Port 7474, 7687): Graph database
- **Redis** (Port 6379): Cache và session store

### Message Queue
- **Apache Kafka** (Port 9092, 9094): Event streaming
- **Zookeeper** (Port 2181): Kafka coordination

---

## 🚀 Bắt đầu

### Yêu cầu hệ thống

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Node.js** >= 18.x (để development frontend)
- **Java** >= 17 (để development backend)
- **Maven** >= 3.8 (để build backend services)

### Cài đặt và Chạy

#### 1. Clone repository

```bash
git clone https://github.com/Khiem-TM/My_BookVault.git
cd My_BookVault
```

#### 2. Cấu hình Environment Variables

Sao chép file `.env.docker` và điều chỉnh nếu cần:

```bash
cp .env.docker .env
```

Các biến quan trọng:
- `JWT_SIGNER_KEY`: Secret key cho JWT signing
- `BREVO_API_KEY`: API key cho email service (Brevo/Sendinblue)
- Database passwords (MySQL, MongoDB, Neo4j)

#### 3. Khởi chạy tất cả services với Docker Compose

```bash
# Build và start tất cả services
docker-compose up --build

# Hoặc chạy ở chế độ background
docker-compose up -d --build
```

Quá trình khởi động có thể mất 5-10 phút lần đầu tiên để:
- Download Docker images
- Build các microservices
- Khởi tạo databases
- Health checks

#### 4. Kiểm tra trạng thái services

```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f api-gateway

# Kiểm tra trạng thái
docker-compose ps
```

#### 5. Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8888
- **Zipkin Tracing UI**: http://localhost:9411
- **Neo4j Browser**: http://localhost:7474

### Health Check Endpoints

Tất cả services đều có Spring Boot Actuator health endpoint:

```bash
# API Gateway
curl http://localhost:8888/actuator/health

# Individual services
curl http://localhost:8080/identity/actuator/health
curl http://localhost:8086/books/actuator/health
# ... và các service khác
```

---

## 🛠️ Development

### Backend Development

Mỗi microservice là một Spring Boot project độc lập:

```bash
cd identity-service
./mvnw clean install
./mvnw spring-boot:run
```

Cấu trúc thư mục chuẩn cho mỗi service:

```
service-name/
├── src/main/java/com/bookvault/service/
│   ├── controller/      # REST endpoints
│   ├── service/         # Business logic
│   ├── repository/      # Data access
│   ├── entity/          # JPA entities
│   ├── dto/             # Data Transfer Objects
│   ├── mapper/          # Entity-DTO mapping
│   ├── exception/       # Custom exceptions
│   ├── configuration/   # Spring configurations
│   └── validator/       # Custom validators
├── src/main/resources/
│   ├── application.yml         # Configuration
│   └── application-docker.yml  # Docker configuration
└── pom.xml
```

### Frontend Development

```bash
cd client

# Install dependencies
npm install

# Development server với hot reload
npm run dev

# Build cho production
npm run build

# Run tests
npm test
```

Cấu trúc frontend:

```
client/src/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── library/       # Library management
│   ├── admin/         # Admin dashboard
│   └── user/          # User features
├── services/          # API services
├── shared/            # Shared components
├── store/             # Redux store
├── types/             # TypeScript types
└── utils/             # Utility functions
```

---

## 📝 API Documentation

### API Gateway Routes

Tất cả API requests đi qua API Gateway tại `http://localhost:8888/api/v1/`:

| Prefix | Target Service | Mô tả |
|--------|----------------|-------|
| `/api/v1/identity/**` | identity-service:8080 | Authentication & Users |
| `/api/v1/book/**` | book-service:8086 | Books management |
| `/api/v1/review/**` | review-service:8087 | Reviews & Ratings |
| `/api/v1/library/**` | library-service:8088 | Personal library |
| `/api/v1/profile/**` | profile-service:8081 | User profiles |
| `/api/v1/order/**` | order-service:8091 | Orders |
| `/api/v1/payment/**` | payment-service:8092 | Payments |
| `/api/v1/transaction/**` | transaction-service:8090 | Transactions |
| `/api/v1/chat/**` | chat-service:8085 | Chat messages |
| `/api/v1/post/**` | post-service:8083 | Posts |
| `/api/v1/file/**` | file-service:8084 | File uploads |
| `/api/v1/notification/**` | notification-service:8082 | Notifications |

### Authentication

API sử dụng JWT Bearer token authentication:

```bash
# 1. Đăng ký
curl -X POST http://localhost:8888/api/v1/identity/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# 2. Đăng nhập
curl -X POST http://localhost:8888/api/v1/identity/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "password": "password123"
  }'

# Response chứa JWT token:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "authenticated": true
}

# 3. Sử dụng token trong các request tiếp theo
curl -X GET http://localhost:8888/api/v1/book/books \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Sample API Calls

#### Books

```bash
# Lấy danh sách sách (có phân trang)
GET /api/v1/book/books?page=0&size=10&keyword=spring

# Chi tiết một sách
GET /api/v1/book/books/{id}

# Tạo sách mới (admin)
POST /api/v1/book/books
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "description": "A Handbook of Agile Software Craftsmanship",
  "categories": ["Programming", "Software Engineering"]
}

# Import sách từ Google Books (admin)
POST /api/v1/book/books/import?query=clean+code&limit=10
```

#### Playlists

```bash
# Lấy playlists của user
GET /api/v1/library/playlists

# Tạo playlist mới
POST /api/v1/library/playlists
{
  "name": "Books to Read in 2025",
  "description": "My reading list for the new year"
}

# Thêm sách vào playlist
POST /api/v1/library/playlists/{playlistId}/books/{bookId}

# Sắp xếp lại thứ tự sách
POST /api/v1/library/playlists/{playlistId}/reorder
{
  "bookIds": [1, 3, 2, 5, 4]
}
```

---

## 📊 Monitoring & Observability

### Zipkin Distributed Tracing

Truy cập Zipkin UI: http://localhost:9411

- Trace requests xuyên suốt các microservices
- Phân tích performance bottlenecks
- Debug distributed transactions

### Spring Boot Actuator

Mỗi service expose các actuator endpoints:

```bash
# Health check
GET /actuator/health

# Metrics
GET /actuator/metrics

# Info
GET /actuator/info
```

### Logs

```bash
# View logs của tất cả services
docker-compose logs -f

# Filter theo service
docker-compose logs -f identity-service book-service

# Tail logs
docker-compose logs -f --tail=100
```

---

## 🗂️ Tài liệu chi tiết

Dự án có các tài liệu chi tiết bằng tiếng Việt:

- **[SERVICES_ANALYSIS_REPORT_VN.md](SERVICES_ANALYSIS_REPORT_VN.md)**: Phân tích chi tiết Identity Service và Book Service
- **[SERVICES_ANALYSIS_REPORT_VN_PART2.md](SERVICES_ANALYSIS_REPORT_VN_PART2.md)**: Review Service, Library Service, Profile Service
- **[SERVICES_ANALYSIS_REPORT_VN_PART3.md](SERVICES_ANALYSIS_REPORT_VN_PART3.md)**: Order Service, Payment Service, Transaction Service
- **[SERVICES_ANALYSIS_REPORT_VN_PART4.md](SERVICES_ANALYSIS_REPORT_VN_PART4.md)**: Chat, Post, File, Notification Services
- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)**: Chi tiết về Playlist và Order features
- **[GOOGLE_BOOKS_INTEGRATION_REPORT.md](GOOGLE_BOOKS_INTEGRATION_REPORT.md)**: Tích hợp Google Books API
- **[PLAYLIST_ORDER_INTEGRATION.md](PLAYLIST_ORDER_INTEGRATION.md)**: Hướng dẫn tích hợp Playlist với Order

---

## 🧪 Testing

### Backend Tests

```bash
# Run tests cho một service
cd identity-service
./mvnw test

# Run với coverage
./mvnw test jacoco:report
```

### Frontend Tests

```bash
cd client

# Run unit tests
npm test

# Run với coverage
npm test -- --coverage

# Run trong watch mode
npm test -- --watch
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port đã được sử dụng

```bash
# Kiểm tra ports đang sử dụng (Linux/Mac)
lsof -i :8888  # API Gateway
lsof -i :3000  # Client/Frontend
lsof -i :3306  # MySQL
lsof -i :8080  # Identity Service
lsof -i :8086  # Book Service

# Kiểm tra ports đang sử dụng (Windows)
netstat -ano | findstr :8888
netstat -ano | findstr :3000
netstat -ano | findstr :3306
netstat -ano | findstr :8080
netstat -ano | findstr :8086

# Stop services đang chạy
docker-compose down
```

#### 2. Database connection errors

```bash
# Restart database containers
docker-compose restart mysql mongodb neo4j

# Check database logs
docker-compose logs mysql
```

#### 3. Out of memory errors

Tăng memory cho Docker:
- Docker Desktop → Settings → Resources → Memory (tối thiểu 4GB)

#### 4. Service không start

```bash
# Check service logs
docker-compose logs service-name

# Rebuild service
docker-compose up -d --build service-name
```

### Reset toàn bộ

```bash
# Stop và xóa tất cả containers, networks, volumes
docker-compose down -v

# Xóa images cũ
docker-compose down --rmi all

# Start lại từ đầu
docker-compose up --build
```

---

## 🔒 Security

### Best Practices được áp dụng

- ✅ JWT token với expiration time
- ✅ Password hashing với BCrypt
- ✅ CORS configuration
- ✅ API rate limiting trên Gateway
- ✅ Input validation và sanitization
- ✅ SQL injection prevention với JPA
- ✅ Sensitive data không được commit (sử dụng .env)

### Production Checklist

- [ ] Thay đổi tất cả default passwords
- [ ] Cấu hình HTTPS/TLS
- [ ] Enable firewall và network segmentation
- [ ] Regular security updates
- [ ] Monitoring và alerting
- [ ] Backup strategy cho databases
- [ ] API rate limiting và DDoS protection

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Author

Dự án được phát triển bởi [Khiem-TM](https://github.com/Khiem-TM).

---

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:

- Mở issue trên [GitHub Issues](https://github.com/Khiem-TM/My_BookVault/issues)
- Xem tài liệu chi tiết trong thư mục `docs/`
- Kiểm tra các report files để hiểu rõ hơn về architecture

---

**Happy Coding! 📚✨**
