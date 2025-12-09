# Báo Cáo Backend Hệ Thống MyBook và Định Hướng Frontend

## Tổng Quan Kiến Trúc
- Thành phần: `api-gateway` (Spring Cloud Gateway) và các microservice: `identity`, `book`, `review`, `library`, `transaction`, `order`, `payment`.
- Giao tiếp: Frontend gọi qua gateway theo tiền tố `http://localhost:8888/api/v1`.
- Quan trắc: Actuator, Prometheus; Zipkin sẽ đồng bộ sau khi hoàn tất cấu hình phụ thuộc.

## API Gateway
- Tiền tố API: `app.api-prefix=/api/v1`.
- Bộ lọc mặc định: `CircuitBreaker` (fallback `/fallback`), `RequestRateLimiter` (theo IP), `Retry` cho lỗi 5xx.
- Tuyến (route) chính:
  - Identity: Path `/api/v1/identity/**`, `StripPrefix=2` → tới `identity-service`.
  - Book: Path `/api/v1/book/**`, `StripPrefix=2`, `RewritePath=/book/(?<segment>.*), /${segment}` → `/books`, `/books/{id}`.
  - Review: Path `/api/v1/review/**`, `StripPrefix=2`, `RewritePath=/review/(?<segment>.*), /${segment}` → `/reviews`, `/reviews/{id}`.
  - Library: Path `/api/v1/library/**`, `StripPrefix=2` (không rewrite) → `/library/items`, `/library/items/by-shelf`.
  - Transaction: Path `/api/v1/transaction/**`, `StripPrefix=2`, `RewritePath=/transaction/(?<segment>.*), /${segment}` → `/transactions/...`.
  - Order: Path `/api/v1/order/**`, `StripPrefix=2`, `RewritePath=/order/(?<segment>.*), /${segment}` → `/orders/...`.
  - Payment: Path `/api/v1/payment/**`, `StripPrefix=2`, `RewritePath=/payment/(?<segment>.*), /${segment}` → `/payments/...`.

## Dịch Vụ & Chức Năng
- Identity Service
  - Auth: `POST /auth/token`, `POST /auth/introspect`, `POST /auth/refresh`, `POST /auth/logout`.
  - User: `POST /users/registration`, `GET /users`, `GET /users/{userId}`, `GET /users/my-info`, `DELETE /users/{userId}`, `PUT /users/{userId}`.
  - Role: `POST /roles`, `GET /roles`, `DELETE /roles/{role}`.
  - Permission: `POST /permissions`, `GET /permissions`, `DELETE /permissions/{permission}`.
- Book Service
  - `GET /books`, `GET /books/{id}`, `POST /books`, `PUT /books/{id}`, `DELETE /books/{id}`.
- Review Service
  - `GET /reviews`, `GET /reviews/{id}`, `GET /reviews/by-book/{bookId}`, `POST /reviews`, `PUT /reviews/{id}`, `DELETE /reviews/{id}`.
  - Health: `GET /ping`.
- Library Service
  - `GET /library/items`, `GET /library/items/{id}`, `GET /library/items/by-shelf?userId=&shelf=`, `POST /library/items`, `DELETE /library/items/{id}`.
- Transaction Service
  - `GET /transactions/by-user/{userId}`, `POST /transactions/borrow`, `POST /transactions/return`.
- Order Service
  - `GET /orders/by-user/{userId}`, `POST /orders`, `POST /orders/{id}/paid`, `POST /orders/{id}/cancel`.
- Payment Service
  - `POST /payments/charge`.

## Bảo Mật
- Cơ chế: JWT (phát hành ở `identity-service`), gateway kiểm tra token cho các tuyến không-public.
- RBAC: Các thao tác quản trị (`roles`, `permissions`, quản lý `users`) yêu cầu vai trò phù hợp (ví dụ `ADMIN`).
- Trạng thái hiện tại: Một số tuyến công khai tạm thời phục vụ demo; nên gỡ whitelist để bắt buộc JWT trước khi sản phẩm hóa.

## Khả Năng Chịu Lỗi & Hiệu Năng
- Rate Limiting: Giới hạn theo IP trên gateway; header phản hồi cung cấp `X-RateLimit-*`.
- Retry: Tự động thử lại cho `502/503/504` với số lần giới hạn.
- Circuit Breaker: Khi backend lỗi kéo dài, trả fallback `/fallback` (HTTP 503) từ gateway.
- Actuator: Mở `health`, `info`, `metrics`, `prometheus` trên các service lõi.

## CSDL & Lưu Trữ
- MySQL: `book`, `library`, `order`, `transaction` (JPA/Hibernate, `ddl-auto: update`).
- MongoDB: `review`.
- Redis: phục vụ `RequestRateLimiter` ở gateway.

## Định Hướng Frontend Theo Logic Backend
- Kết nối API
  - Qua gateway: `BASE_URL=http://localhost:8888/api/v1`.
  - Axios interceptor: gắn `Authorization: Bearer <token>` nếu đăng nhập; xử lý đặc biệt cho `429/503`.
- Trang & Endpoint
  - Books
    - Danh sách: `GET /book/books` → Hiển thị grid sách, phân trang (client/server tùy yêu cầu).
    - Chi tiết: `GET /book/books/{id}` → Thông tin sách, nút thêm vào đơn hàng.
  - Reviews
    - Theo sách: `GET /review/reviews/by-book/{bookId}` → Danh sách đánh giá.
    - Tạo/sửa/xóa: `POST/PUT/DELETE /review/reviews` → Form validation (nội dung, rating).
  - Library
    - Kệ người dùng: `GET /library/items/by-shelf?userId=&shelf=` → Tab kệ (`WISHLIST/READING/READ`).
    - Thêm/xóa: `POST /library/items`, `DELETE /library/items/{id}`.
  - Orders
    - Danh sách theo user: `GET /order/orders/by-user/{userId}`.
    - Tạo đơn: `POST /order/orders` → nhập `bookId`, xác nhận.
    - Thanh toán: `POST /order/orders/{id}/paid` (cập nhật trạng thái sau khi charge).
  - Payments
    - Charge: `POST /payment/payments/charge` → `orderId`, `userId`, `amount`.
  - Auth
    - Login: `POST /identity/auth/token` → lưu JWT; fetch `GET /identity/users/my-info` để đồng bộ hồ sơ.
- Luồng Tương Tác Mẫu
  - Đặt đơn: Chọn sách → `POST /order/orders` → `POST /payment/payments/charge` → `POST /order/orders/{id}/paid`.
  - Quản lý kệ: `GET /library/items/by-shelf` → `POST /library/items` khi thêm → `DELETE /library/items/{id}` khi bỏ.
  - Đánh giá: `GET /review/reviews/by-book/{bookId}` → `POST /review/reviews`.
- Xử Lý Lỗi
  - `429`: Hiển thị thông báo giới hạn tốc độ, cho phép retry sau.
  - `503`: Hiển thị fallback, nút thử lại; ghi sự kiện (telemetry) để theo dõi.
  - `401/403`: Điều hướng tới trang đăng nhập/hiển thị quyền truy cập.
- UI/UX & Kỹ Thuật
  - TailwindCSS: Responsive theo breakpoints, component hóa theo features.
  - State: React Query cho dữ liệu server; Redux Toolkit cho state app (auth, UI).
  - Router: Tách route theo feature, lazy-load để tối ưu bundle.
  - Performance: cache SWR, code-splitting, prefetch khi hover.

## Kiểm Thử & Triển Khai
- Kiểm thử giao diện: nhiều kích thước màn hình, tương tác form, điều hướng.
- Kiểm thử tốc độ: quan sát kích thước bundle, time-to-interactive; bật gzip/brotli theo server.
- CI/CD: build + test; triển khai container (Docker), hoặc static hosting cho frontend.

## Gợi Ý Nâng Cấp
- Bật lại tracing Zipkin đồng bộ toàn hệ sau khi ổn định phụ thuộc.
- Chuẩn hóa hợp đồng OpenAPI cho tất cả service (phân trang, schema lỗi, ví dụ mẫu).
- Hoàn thiện `payment-service`: idempotency, webhook nhà cung cấp, trạng thái thanh toán.
- Gỡ whitelist ở gateway và bắt buộc JWT cho toàn bộ tuyến người dùng.

## Phụ Lục
- BASE_URL frontend: `http://localhost:8888/api/v1`.
- Fallback endpoint: `GET /fallback` (gateway).
- Actuator (ví dụ): `GET /actuator/health`, `GET /actuator/prometheus`.
