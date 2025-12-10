# 📊 BÁO CÁO PHÂN TÍCH CÁC SERVICE - PHẦN 4 (CUỐI)

**Tiếp theo từ SERVICES_ANALYSIS_REPORT_VN_PART3.md**

---

## 💳 11. PAYMENT SERVICE (Dịch vụ Thanh toán)

### 📌 Vai trò

- **Xử lý thanh toán**: Charge card, online payment
- **Payment methods**: Credit card, e-wallet, bank transfer
- **Payment gateway integration**: Stripe, PayPal, VN Pay
- **Transaction record**: Lưu lịch sử thanh toán

### 🏛️ Tình trạng

⚠️ **Cơ bản** - Chỉ có charge endpoint, cần enhance

### 📐 Design Pattern Áp dụng

1. **Service Layer** (cần implement)

   - `PaymentService` - Payment logic
   - Support multiple payment methods

2. **Adapter Pattern** (cần implement)

   - `PaymentGatewayAdapter` cho khác gateway
   - `StripeAdapter`, `PayPalAdapter`, etc.

3. **Factory Pattern** (cần implement)

   - `PaymentGatewayFactory` để select adapter
   - Strategy pattern cho payment methods

4. **DTO Pattern**
   - `PaymentRequest` - Input
   - `PaymentResponse` - Output

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/payment

POST   /payments/charge                    → Xử lý thanh toán
       └─ body: { amount, currency, cardToken, ... }

POST   /payments/webhook                   → Webhook từ payment gateway
       └─ body: { transactionId, status, ... }

GET    /payments/{transactionId}           → Chi tiết giao dịch
GET    /payments/history/{userId}          → Lịch sử thanh toán
```

### 📋 Payment Request DTO

```json
{
  "orderId": 123,
  "amount": 250000,
  "currency": "VND",
  "paymentMethod": "CREDIT_CARD",
  "cardToken": "tok_visa_...",
  "description": "Order #123"
}
```

### 🔄 Payment Workflow

```
Client
  ↓ POST /payments/charge
Backend Payment Service
  ↓ Call Payment Gateway (Stripe/PayPal)
Payment Gateway
  ↓ Process payment
  ↓ Return status
Backend
  ↓ Update Order Status → PAID
Order Service
  ↓ Notify user
Notification Service
```

### 🚀 TODO/Enhancement

- ✅ Basic charge endpoint
- ⚠️ Payment gateway integration (Stripe, PayPal)
- ⚠️ Webhook handling
- ⚠️ Refund support
- ⚠️ Multiple payment methods
- ⚠️ 3D Secure authentication
- ⚠️ Payment history tracking

---

## 📊 12. TRANSACTION SERVICE (Dịch vụ Giao dịch)

### 📌 Vai trò

- **Ghi nhật ký giao dịch**: Record mỗi transaction
- **Borrow/Return books**: Theo dõi mượn/trả sách
- **Transaction history**: Lịch sử giao dịch của user
- **Audit trail**: Bảo mật & compliance

### 🏛️ Tình trạng

✅ **Hoàn thành** - CRUD transactions, borrow/return tracking

### 📐 Design Pattern Áp dụng

1. **Repository Pattern**

   - `TransactionRepository extends JpaRepository`
   - Custom queries: `findByUser(userId)`

2. **Service Layer**

   - `TransactionService` - CRUD & business logic
   - `borrow()`, `returnBook()` methods

3. **Entity Lifecycle**

   - Transaction states: BORROWED, RETURNED, OVERDUE
   - Timestamps: borrowedAt, returnedAt

4. **Mapper Pattern**
   - `TransactionMapper` - Entity ↔ DTO

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/transaction

GET    /transactions                       → Tất cả transactions
GET    /transactions/by-user/{userId}      → Transactions của user

POST   /transactions/borrow                → Ghi nhận mượn sách
       └─ body: { userId, bookId, dueDate }

POST   /transactions/return                → Ghi nhận trả sách
       └─ body: { transactionId, returnDate }

DELETE /transactions/{id}                  → Xóa transaction
```

### 📋 Transaction Entity

```
Transaction
├── id (PK)
├── userId (indexed)
├── bookId
├── transactionType (BORROW, RETURN)
├── status (ACTIVE, COMPLETED, OVERDUE)
├── borrowedAt
├── returnedAt
├── dueDate
├── actualReturnDate
├── fineAmount
├── notes
└── createdAt
```

### 💾 Database

- **MySQL** (InnoDB)
- **Indexes**: userId, bookId, status
- **Queries**: Get user's active loans, overdue transactions

### 🚀 Features

- ✅ Borrow/Return tracking
- ✅ Due date management
- ✅ Fine calculation (có thể enhance)
- ✅ Audit trail

---

## 🏛️ API GATEWAY (API Gateway Service)

### 📌 Vai trò

- **Request routing**: Chuyển request đến services phù hợp
- **Load balancing**: Phân tải requests
- **Rate limiting**: Giới hạn requests per IP/user
- **Circuit breaker**: Failover khi service down
- **CORS handling**: Cross-origin requests
- **Filter/Middleware**: Request/response filtering

### 🏛️ Tình trạng

✅ **Hoàn thành** - Routing, rate limiting, circuit breaker, CORS

### 📐 Design Pattern Áp dụng

1. **Gateway Pattern**

   - Spring Cloud Gateway
   - Single entry point cho tất cả requests

2. **Routing Pattern**

   - Path-based routing
   - Dynamic routing updates possible

3. **Resilience Patterns**

   - Circuit Breaker (Resilience4j)
   - Fallback handling
   - Retry mechanism

4. **Rate Limiting**

   - Token bucket algorithm
   - IP-based limits
   - Redis-backed storage

5. **Filter Chain Pattern**
   - Global filters
   - Route-specific filters

### 📋 Gateway Configuration (application-docker.yaml)

```yaml
Routes Configured:
├── /api/v1/identity/** → identity-service:8080
├── /api/v1/profile/** → profile-service:8081
├── /api/v1/notification/** → notification-service:8082
├── /api/v1/post/** → post-service:8083
├── /api/v1/file/** → file-service:8084
├── /api/v1/chat/** → chat-service:8085
├── /api/v1/book/** → book-service:8086
│   ├─ Rate Limit: 100 req/sec
│   └─ Retry: 2 attempts
├── /api/v1/review/** → review-service:8087
│   ├─ Rate Limit: 100 req/sec
│   └─ Retry: 2 attempts
├── /api/v1/library/** → library-service:8088
│   ├─ Rate Limit: 100 req/sec
│   └─ Retry: 2 attempts
├── /api/v1/transaction/** → transaction-service:8090
│   ├─ Rate Limit: 50 req/sec
│   └─ Retry: 2 attempts
├── /api/v1/order/** → order-service:8091
│   ├─ Rate Limit: 50 req/sec
│   └─ Retry: 2 attempts
└── /api/v1/payment/** → payment-service:8092
    ├─ Rate Limit: 30 req/sec
    └─ Retry: 2 attempts
```

### 🔒 CORS Configuration

```yaml
Allowed Origins:
  - http://localhost:4173 (Vite dev server)
  - http://localhost:3000  (React dev server)

Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Authorization, Content-Type, X-Requested-With
Allow Credentials: true
Max Age: 3600 seconds
```

### 🔄 Request Flow

```
Client Request
    ↓
API Gateway (8888)
    ├─ Parse path → /api/v1/book/books
    ├─ Route → book-service:8086
    ├─ Apply Filters:
    │   ├─ Rate Limit check
    │   ├─ Circuit Breaker check
    │   └─ CORS headers
    ├─ StripPrefix=2 → /books
    └─ Forward to book-service
        ↓
    BookService Response
        ↓
    API Gateway
        ├─ Apply response filters
        └─ Return to Client
```

### 🚀 Features

- ✅ Path-based routing
- ✅ Rate limiting (Redis-backed)
- ✅ Circuit breaker pattern
- ✅ Retry mechanism
- ✅ CORS support
- ✅ Health checks
- ✅ Request/Response logging

---

## 📊 TỔNG HỢP TECHNOLOGY STACK

### Backend Stack

| Layer             | Technology                | Version   |
| ----------------- | ------------------------- | --------- |
| **Language**      | Java                      | 21        |
| **Framework**     | Spring Boot               | 3.2.5+    |
| **API Gateway**   | Spring Cloud Gateway      | 2023.0.1  |
| **ORM**           | Spring Data JPA           | Hibernate |
| **MongoDB**       | Spring Data MongoDB       | -         |
| **Messaging**     | Kafka/Spring Cloud Stream | 7.5.0     |
| **HTTP Client**   | Spring Cloud OpenFeign    | 2023.0.1  |
| **Security**      | Spring Security + OAuth2  | JWT       |
| **Caching**       | Spring Cache + Redis      | 7.0       |
| **Validation**    | Jakarta Validation        | 3.0       |
| **Mapping**       | MapStruct                 | 1.5.5     |
| **Logging**       | SLF4J + Logback           | -         |
| **Documentation** | SpringDoc OpenAPI         | 2.5.0     |
| **Monitoring**    | Zipkin                    | 2.24      |
| **Build Tool**    | Maven                     | 3.9       |

### Database Stack

| Database        | Purpose                     | Type      |
| --------------- | --------------------------- | --------- |
| **MySQL 8.0**   | Relational data             | RDBMS     |
| **MongoDB 4.4** | Flexible/Document data      | NoSQL     |
| **Neo4j 5.24**  | Graph data (User relations) | Graph DB  |
| **Redis 7**     | Caching & sessions          | In-memory |

### Infrastructure

| Component          | Technology     | Port       |
| ------------------ | -------------- | ---------- |
| **Message Broker** | Kafka          | 9092, 9094 |
| **Zookeeper**      | Coordination   | 2181       |
| **Monitoring**     | Zipkin         | 9411       |
| **Container**      | Docker         | -          |
| **Orchestration**  | Docker Compose | -          |

### Frontend Stack

| Layer                | Technology                   |
| -------------------- | ---------------------------- |
| **Framework**        | React 18 + TypeScript        |
| **Build Tool**       | Vite                         |
| **HTTP Client**      | TanStack Query (React Query) |
| **Styling**          | Tailwind CSS                 |
| **State Management** | Zustand/Redux (TBD)          |
| **Form Handling**    | React Hook Form              |

---

## 🔐 SECURITY OVERVIEW

### Authentication

- **Method**: JWT (JSON Web Token)
- **Signing**: HMAC SHA-256
- **Storage**: In-memory blacklist (InvalidatedToken table)
- **Refresh**: Refresh token mechanism
- **Expiration**: Configurable (typically 1 hour + 7 days refresh)

### Authorization

- **Type**: RBAC (Role-Based Access Control)
- **Implementation**: Spring Security with @PreAuthorize
- **Roles**: USER, ADMIN, MODERATOR (custom)
- **Permissions**: Granular resource-level

### Inter-Service Security

- **Service-to-Service**: OpenFeign with JWT forwarding
- **Header**: X-User-Id custom header
- **API Gateway**: Central authentication check

### Data Protection

- **Password**: BCryptPasswordEncoder
- **HTTPS**: Configure in production
- **CORS**: Restricted origins
- **Rate Limiting**: Prevent brute force

---

## 📈 PERFORMANCE OPTIMIZATIONS

### Database

- **Indexing**: Strategic indexes on frequently queried columns
- **Query Optimization**: Using Specifications & JPA queries
- **Connection Pooling**: HikariCP
- **Caching**: Redis for hot data

### API Gateway

- **Rate Limiting**: Token bucket per IP
- **Circuit Breaker**: Prevent cascading failures
- **Retry Logic**: Automatic retry for transient failures
- **Load Balancing**: Distribute load across instances

### Caching Strategy

- **Book Service**: Cache query results
- **Profile Service**: Cache user profiles
- **Redis TTL**: Configurable per entity type
- **Cache Invalidation**: @CacheEvict on updates

---

## 🚀 DEPLOYMENT & SCALABILITY

### Horizontal Scaling

```
Each service can be scaled independently:

Load Balancer
    ↓
┌─────────────────────────────────────┐
├─ Book-Service-1 :8086              │
├─ Book-Service-2 :8086              │
├─ Book-Service-3 :8086              │
└─────────────────────────────────────┘
    ↑
Requests routed via API Gateway
```

### Docker Deployment

- **Dockerfile**: Multi-stage builds (build + runtime)
- **Container Registry**: Docker Hub / ECR
- **Orchestration**: Docker Compose (dev), Kubernetes (prod)

### Database Replication

- **MySQL**: Master-Slave replication
- **MongoDB**: Replica sets
- **Redis**: Sentinel mode for failover

---

## 📝 API DOCUMENTATION

Tất cả services có **OpenAPI/Swagger documentation**:

- URL: `http://localhost:{port}/swagger-ui.html`
- Examples:
  - Book Service: `http://localhost:8086/swagger-ui.html`
  - Order Service: `http://localhost:8091/swagger-ui.html`
  - Library Service: `http://localhost:8088/swagger-ui.html`

---

## ✅ SUMMARY TABLE

| Service          | Vai trò        | DB      | Status | Endpoints |
| ---------------- | -------------- | ------- | ------ | --------- |
| **Identity**     | Auth & RBAC    | MySQL   | ✅     | 7         |
| **Book**         | Book catalog   | MySQL   | ✅     | 8         |
| **Review**       | Book ratings   | MongoDB | ✅     | 5         |
| **Library**      | User library   | MySQL   | ✅     | 10        |
| **Profile**      | User profiles  | MySQL   | ✅     | 6         |
| **Order**        | Orders/Rentals | MySQL   | ✅     | 9         |
| **Payment**      | Payments       | -       | ⚠️     | 3         |
| **Transaction**  | Transactions   | MySQL   | ✅     | 6         |
| **Chat**         | Messages       | MongoDB | ✅     | 5         |
| **File**         | File storage   | -       | ✅     | 3         |
| **Post**         | Posts/Content  | MongoDB | ✅     | 5         |
| **Notification** | Email/Alerts   | -       | ✅     | 3         |
| **API Gateway**  | Routing/Auth   | Redis   | ✅     | -         |

---

## 📚 TÀI LIỆU LIÊN QUAN

1. **SERVICES_ANALYSIS_REPORT_VN.md** - Phần 1: Identity & Book Service
2. **SERVICES_ANALYSIS_REPORT_VN_PART2.md** - Phần 2: Review, Profile, Order, Library
3. **SERVICES_ANALYSIS_REPORT_VN_PART3.md** - Phần 3: Chat, File, Post, Notification
4. **SERVICES_ANALYSIS_REPORT_VN_PART4.md** (file này) - Phần 4: Payment, Transaction, Gateway, Summary
5. **PLAYLIST_ORDER_INTEGRATION.md** - Chi tiết Playlist & Order integration
6. **IMPLEMENTATION_COMPLETE.md** - Project status overview

---

**Báo cáo hoàn tất** ✅  
**Ngày**: 11 tháng 12, 2025  
**Người tạo**: AI Assistant
