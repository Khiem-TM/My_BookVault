# Báo Cáo Tổng Hợp Hệ Thống MyBook

## Mục Lục
- [Tổng quan hệ thống](#tổng-quan-hệ-thống)
- [Khắc phục sự cố api-gateway](#khắc-phục-sự-cố-api-gateway)
- [Hướng dẫn sử dụng API](#hướng-dẫn-sử-dụng-api)
- [Kế hoạch phát triển frontend](#kế-hoạch-phát-triển-frontend)
- [Phụ lục](#phụ-lục)

## Tổng quan hệ thống

- Kiến trúc microservices, giao tiếp qua `api-gateway` với `RewritePath`, `RateLimiter`, `Retry`, `CircuitBreaker`.
- Service chính:
  - `identity-service`: xác thực, phát hành JWT, RBAC theo vai trò/quyền; endpoint introspect/refresh/logout.
  - `profile-service`: quản lý hồ sơ người dùng.
  - `book-service`: quản lý sách, CRUD và OpenAPI docs.
  - `review-service`: lưu trữ đánh giá (Mongo), CRUD và docs.
  - `library-service`: quản lý `shelf` người dùng (MySQL), truy vấn theo `userId` và `shelf`.
  - `transaction-service`: giao dịch mượn/trả, sinh `dueDate` và trạng thái.
  - `order-service`: tạo đơn, đánh dấu PAID/CANCELLED.
  - `payment-service`: xử lý charge (skeleton), nhận `orderId,userId,amount`.
  - `notification-service`, `file-service`, `chat-service`, `post-service`: chức năng hỗ trợ xã hội hóa và truyền thông.
- Quan sát: Actuator `health/info/metrics` đã bật; Prometheus endpoint khả dụng ở các service; Zipkin sẽ cấu hình lại sau (đã tạm gỡ ở gateway để khởi động ổn định).

## Khắc phục sự cố api-gateway

### 1) Phân tích log lỗi

- Triệu chứng: khởi động `api-gateway` thất bại với `NoClassDefFoundError: zipkin2/reporter/BytesMessageSender`.
- Nguyên nhân gốc rễ: cấu hình `management.zipkin.tracing.endpoint` kết hợp `opentelemetry-exporter-zipkin` thiếu thư viện `zipkin-reporter2` phù hợp dẫn đến autoconfigure Zipkin tạo `ZipkinSpanExporter` lỗi classpath.

### 2) Kiểm tra trạng thái kết nối

- Sau khi loại bỏ cấu hình Zipkin khỏi gateway, `Netty` khởi động ổn định trên `:8888`.
- Kiểm thử nhanh qua gateway:
  - `GET /api/v1/book/books`, `GET /api/v1/review/reviews`, `GET /api/v1/library/items?...`, `GET /api/v1/transaction/transactions/by-user/1`, `GET /api/v1/order/orders/by-user/1`, `POST /api/v1/payment/payments/charge`.
  - Kết quả: 503 cho hầu hết do backend chưa chạy; đây là fallback của `CircuitBreaker` (gateway khỏe, backend cần khởi chạy).

### 3) Xác minh routing và bảo mật

- `application.yaml` của gateway: các route định nghĩa chuẩn, `StripPrefix=2`, `RewritePath` loại bỏ segment module (`book`, `review`, `library`, `transaction`, `order`, `payment`).
- `RateLimiter` dùng Redis và IP key resolver; `Retry` 2 lần cho `502/503/504`.
- `AuthenticationFilter`:
  - Whitelist tạm: `/book/.*`, `/review/.*`, `/library/.*`, `/transaction/.*`, `/order/.*`, `/payment/.*` để kiểm thử.
  - Với endpoint không public, gateway gọi `identity-service` `/auth/introspect` để xác thực JWT.

### 4) Biện pháp khắc phục và kiểm thử lại

- Khắc phục:
  - Loại bỏ cấu hình Zipkin ở gateway để tránh autoconfigure lỗi classpath.
  - Giữ Actuator/Prometheus và tracing bridge; sẽ thêm Zipkin sau với bộ phụ thuộc phù hợp toàn hệ.
- Kiểm thử:
  - Khởi động gateway thành công; xác minh `actuator` và các route trả về 503 khi backend chưa chạy (dấu hiệu circuit breaker hoạt động).
  - Sau khi khởi động backend (`order-service`, `payment-service`, `transaction-service`, `book-service`, `review-service`, `library-service`), các `GET/POST` qua gateway trả 200/405/4xx tương ứng logic endpoint.

## Hướng dẫn sử dụng API

### Vai trò và chức năng các service

- `identity-service`: phát hành/kiểm tra JWT; RBAC.
- `book-service`: danh sách/chi tiết/tạo/cập nhật/xóa sách.
- `review-service`: CRUD đánh giá theo sách.
- `library-service`: quản lý danh mục `WISHLIST`, `READING`, `READ` theo người dùng.
- `transaction-service`: mượn/trả; sinh giao dịch và hạn trả.
- `order-service`: tạo đơn và chuyển trạng thái PAID/CANCELLED.
- `payment-service`: thu phí đơn hàng (skeleton).

### Endpoint quan trọng qua gateway (`/api/v1`)

- `GET /book/books` → danh sách sách.
- `GET /review/reviews` → danh sách đánh giá.
- `GET /library/items?userId={id}&shelf={type}` → truy vấn theo người dùng và shelf.
- `GET /transaction/transactions/by-user/{userId}` → danh sách giao dịch.
- `POST /transaction/transactions/borrow` → tạo giao dịch mượn.
- `POST /transaction/transactions/return` → tạo giao dịch trả.
- `GET /order/orders/by-user/{userId}` → danh sách đơn.
- `POST /order/orders` → tạo đơn.
- `POST /order/orders/{id}/paid` → đánh dấu đã thanh toán.
- `POST /order/orders/{id}/cancel` → hủy đơn.
- `POST /payment/payments/charge` → thu phí.
- `POST /identity/auth/token` → cấp JWT.
- `POST /identity/auth/introspect` → kiểm tra token.

### Mẫu Request/Response

- Tạo đơn hàng
  - Request: `POST /api/v1/order/orders`
    ```json
    {"userId": 1, "bookId": 1001}
    ```
  - Response:
    ```json
    {"id": 10, "userId": 1, "bookId": 1001, "status": "PENDING", "createdAt": "2025-12-09T07:12:11Z"}
    ```
- Mượn sách
  - Request: `POST /api/v1/transaction/transactions/borrow`
    ```json
    {"userId": 1, "bookId": 1001}
    ```
  - Response:
    ```json
    {"id": 21, "userId": 1, "bookId": 1001, "type": "BORROW", "status": "ACTIVE", "dueDate": "2025-12-23T07:12:11Z"}
    ```
- Thu phí đơn hàng (skeleton)
  - Request: `POST /api/v1/payment/payments/charge`
    ```json
    {"orderId": 10, "userId": 1, "amount": 1000}
    ```
  - Response:
    ```json
    "charged"
    ```

### Xác thực và phân quyền

- Luồng xác thực:
  - Client lấy token qua `POST /identity/auth/token`.
  - Mọi endpoint không nằm trong whitelist sẽ được `api-gateway` kiểm tra bằng `/identity/auth/introspect`.
- RBAC:
  - `identity-service` gán `ROLE_*` và `permission` vào claim `scope` (AuthenticationService:175).
  - Controller admin (`/roles`, `/permissions`, `updateUser`, `deleteUser`, `getUsers`) yêu cầu `hasRole('ADMIN')`.

### Lưu ý performance và bảo mật

- Rate limit theo IP: bảo vệ chống lạm dụng API.
- Circuit breaker và retry: tăng độ ổn định trước lỗi tạm thời.
- Actuator metrics: sẵn sàng scrape bằng Prometheus.
- Bảo mật:
  - Không lưu/ghi secret vào log; dùng biến môi trường và secret manager khi triển khai.
  - RBAC chi tiết cho endpoint quản trị; bỏ whitelist tạm sau kiểm thử.

## Kế hoạch phát triển frontend

### Kiến trúc ứng dụng ReactJS

- Công nghệ: React 18, Vite, TypeScript, TailwindCSS, Redux Toolkit, React Query.
- Cấu trúc:
  - `src/app`: store, router, providers.
  - `src/features`: mô-đun (books, reviews, library, orders, payments, auth, profile).
  - `src/shared`: UI components, hooks, utils.
  - `src/services`: API client (axios) qua `api-gateway`.

### Kế hoạch tích hợp với api-gateway

- Base URL: `VITE_API_BASE=http://localhost:8888/api/v1`.
- Interceptor Axios:
  - Gắn `Authorization: Bearer <JWT>`.
  - Retry theo `Retry-After` khi nhận `429`.
  - Fallback UI khi nhận `503` (circuit mở).

### Phân chia component và routing

- Routes chính:
  - `/books` (danh sách), `/books/:id` (chi tiết).
  - `/library` (theo shelf), `/orders`, `/payments`, `/auth/login`.
- Component:
  - `BookList`, `BookDetail`, `LibraryShelf`, `OrderList`, `OrderCreate`, `PaymentCharge`, `AuthLogin`.

### Xử lý state management

- Redux Toolkit: session, cart/order, user profile.
- React Query: cache dữ liệu sách, review, library, orders; stale-while-revalidate.
- Error boundary: hiển thị fallback cho lỗi API và circuit breaker.

### Kế hoạch triển khai và CI/CD

- CI: GitHub Actions
  - Job `frontend`: build Vite, chạy test unit (Vitest), lint.
  - Job `backend`: matrix dịch vụ, chạy `mvn test`, báo cáo Jacoco.
- CD: Docker + docker-compose cho local; Helm chart cho môi trường staging/production.
- Observability: tích hợp Sentry (frontend), Prometheus/Grafana (backend), Zipkin/Tempo (tracing) sau khi ổn định phụ thuộc.

## Phụ lục

- Khởi chạy nhanh (local):
  - `docker compose up -d redis zipkin mysql mongodb neo4j`.
  - Khởi động `order-service`, `payment-service`, `transaction-service`, `book-service`, `review-service`, `library-service`.
  - Khởi động `api-gateway` và sử dụng các endpoint `/api/v1/...`.
- Lộ trình gỡ whitelist và bật xác thực đầy đủ:
  - Gỡ `/book|/review|/library|/transaction|/order|/payment` khỏi `AuthenticationFilter`.
  - Frontend luôn gửi JWT; gateway introspect token trước khi forward.
- Debug nhanh:
  - 503: backend chưa chạy / circuit mở.
  - 405: sai HTTP method / endpoint.
  - 429: vượt hạn mức rate limit.

