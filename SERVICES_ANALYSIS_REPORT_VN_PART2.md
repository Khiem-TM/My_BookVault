# 📊 BÁO CÁO PHÂN TÍCH CÁC SERVICE - PHẦN 2

**Tiếp theo từ SERVICES_ANALYSIS_REPORT_VN.md**

---

## 📝 3. REVIEW SERVICE (Dịch vụ Đánh giá)

### 📌 Vai trò

- **Quản lý đánh giá**: Tạo, sửa, xóa review cho sách
- **Lấy đánh giá theo sách**: Query reviews của một cuốn sách
- **Rating aggregation**: Tính toán rating trung bình
- **NoSQL storage**: Lưu trữ unstructured review data

### 🏛️ Tình trạng

✅ **Hoàn thành** - CRUD review, query theo book

### 📐 Design Pattern Áp dụng

1. **Repository Pattern (MongoDB)**

   - `ReviewRepository extends MongoRepository`
   - Custom query: `findByBookId(Long bookId)`

2. **Service Layer**

   - `ReviewCrudService` - CRUD & business logic
   - Transactional operations

3. **Mapper Pattern**

   - `ReviewMapper` - Document ↔ DTO

4. **Document Database Design**
   - Flexible schema (no strict columns)
   - Nested structures cho metadata

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/review

GET    /reviews                            → Tất cả reviews
GET    /reviews/{id}                       → Chi tiết review
GET    /reviews/by-book/{bookId}           → Reviews của một sách

POST   /reviews                            → Tạo review mới
PUT    /reviews/{id}                       → Cập nhật review
DELETE /reviews/{id}                       → Xóa review
```

### 📊 Review Document Structure

```json
{
  "_id": "review_id",
  "bookId": 123,
  "userId": 456,
  "rating": 4.5,
  "title": "Cuốn sách tuyệt vời",
  "content": "Nội dung chi tiết đánh giá...",
  "helpful": 42,
  "createdAt": "2025-12-11T10:30:00Z",
  "updatedAt": "2025-12-11T10:30:00Z",
  "verified_purchase": true,
  "tags": ["educational", "inspiring"]
}
```

### 💾 Database

- **MongoDB** (NoSQL)
- **Indexes**: bookId (để query nhanh)
- **Flexible schema**: Có thể add fields tùy ý

---

## 👤 4. PROFILE SERVICE (Dịch vụ Hồ sơ Người dùng)

### 📌 Vai trò

- **Hồ sơ cá nhân**: Quản lý thông tin người dùng
- **Avatar management**: Upload/update ảnh đại diện
- **Tìm kiếm người dùng**: Search by name, username
- **Sync từ Identity Service**: Cập nhật từ auth service

### 🏛️ Tình trạng

✅ **Hoàn thành** - CRUD profile, avatar, tìm kiếm

### 📐 Design Pattern Áp dụng

1. **Service-to-Service Communication**

   - Spring Cloud OpenFeign (HTTP client)
   - Fallback handling cho failures

2. **Repository Pattern**

   - `UserProfileRepository extends JpaRepository`

3. **Service Layer**

   - `UserProfileService` - Business logic
   - Authorization check (user context)

4. **Mapper Pattern**

   - `UserProfileMapper`

5. **File Upload Pattern**
   - Integration với File Service
   - Multipart file handling

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/profile

GET    /users/{profileId}                  → Chi tiết hồ sơ
GET    /users                              → Danh sách tất cả
GET    /users/my-profile                   → Hồ sơ của tôi

PUT    /users/my-profile                   → Cập nhật hồ sơ
PUT    /users/avatar                       → Cập nhật avatar
       └─ ?file=<multipart>

POST   /users/search                       → Tìm kiếm người dùng
       └─ body: { firstName, lastName, username, ... }
```

### 👥 User Profile Entity

```
UserProfile
├── id (PK)
├── userId (fk từ identity-service)
├── username
├── firstName
├── lastName
├── email
├── bio
├── avatarUrl
├── phone
├── address
├── birthDate
├── gender
├── createdAt
├── updatedAt
└── Following/Followers (có thể add)
```

### 🔗 Inter-Service Communication

- **Calls to Identity Service**: Verify user, get user info
- **Calls to File Service**: Upload avatar
- **Communication Type**: OpenFeign (synchronous HTTP)

---

## 📦 5. ORDER SERVICE (Dịch vụ Đơn Hàng)

### 📌 Vai trò

- **Quản lý đơn hàng**: Buy vs Rent orders
- **Rental management**: Ngày thuê, ngày trả, tính phí
- **Status tracking**: PENDING → PAID → RETURNED/OVERDUE
- **Overdue detection**: Tự động phát hiện sách quá hạn
- **User orders**: Lấy đơn hàng của người dùng cụ thể

### 🏛️ Tình trạng

✅ **Hoàn thành** - Buy/Rent, status tracking, overdue detection

### 📐 Design Pattern Áp dụng

1. **Entity Lifecycle Pattern**

   - Order state transitions (PENDING → PAID → RETURNED)
   - Enum for OrderType (BUY, RENT) & Status

2. **Repository Pattern with Custom Queries**

   - `findByUserId()`
   - `findByUserIdAndOrderType()`
   - Index optimization

3. **Service Layer**

   - `OrderService` - CRUD & business logic
   - `createBuyOrder()`, `createRentalOrder()`
   - `checkOverdueRentals()` - Scheduled task

4. **Mapper Pattern**

   - `OrderMapper` - Entity ↔ DTO

5. **Transactional Pattern**
   - @Transactional cho ACID compliance

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/order

GET    /orders/by-user/{userId}            → Tất cả orders của user
GET    /orders/rentals/by-user/{userId}    → Chỉ rental orders
GET    /orders/{id}                        → Chi tiết order

POST   /orders/purchase                    → Tạo đơn mua
POST   /orders/rent                        → Tạo đơn thuê
       └─ body: { bookId, rentalDays, ... }

POST   /orders/{id}/paid                   → Đánh dấu đã thanh toán
POST   /orders/{id}/cancel                 → Hủy đơn
POST   /orders/{id}/return                 → Trả sách (rental)

POST   /orders/check-overdue               → Kiểm tra quá hạn (admin)
```

### 📋 Order Entity

```
Order
├── id (PK)
├── userId (indexed)
├── bookId
├── orderType (BUY, RENT) → indexed
├── status (PENDING, PAID, CANCELLED, RETURNED, OVERDUE)
├── createdAt
├── updatedAt
├── totalPrice
├── paymentMethod
│
├─ For Rental Only:
├── rentalStartDate → indexed
├── rentalEndDate → indexed
├── rentalDays
├── rentalPrice
└── notes
```

### 💾 Database

- **MySQL** (InnoDB)
- **Indexes**:
  - user_id, status (để query orders của user nhanh)
  - order_type (BUY vs RENT filtering)
  - rental_end_date (for overdue detection)

### 🔄 Order Workflow

```
BUY Order:
  PENDING → PAID → (Completed)

RENT Order:
  PENDING → PAID → RETURNED
                ↓ (nếu quá hạn)
              OVERDUE → RETURNED
```

### ⏰ Scheduled Tasks

- **Overdue Detection**: Chạy định kỳ check orders có `rentalEndDate < TODAY`
- **Notification**: Gửi thông báo khi sách sắp hết hạn

---

## 📚 6. LIBRARY SERVICE (Dịch vụ Thư viện Cá nhân)

### 📌 Vai trò

- **Thư viện cá nhân**: Quản lý sách của user (Reading, Read, Wishlist)
- **Playlist**: Tạo danh sách sách tùy chỉnh
- **Reordering**: Sắp xếp lại thứ tự sách trong playlist
- **Book management**: Add/remove sách từ thư viện

### 🏛️ Tình trạng

✅ **Hoàn thành** - Library shelves + Playlist management

### 📐 Design Pattern Áp dụng

1. **Repository Pattern**

   - `LibraryItemRepository` - Quản lý sách trong thư viện
   - `PlaylistRepository` - Quản lý playlists
   - `PlaylistBookRepository` - Junction table cho many-to-many

2. **Service Layer**

   - `LibraryItemService` - Quản lý thư viện cơ bản
   - `PlaylistService` - Quản lý playlists

3. **Entity Relationship**

   - One-to-Many: User → LibraryItems
   - Many-to-Many: Playlist ↔ Book (via PlaylistBook)

4. **Mapper Pattern**
   - `LibraryItemMapper`, `PlaylistMapper`, `PlaylistBookMapper`

### 🔌 Endpoints & Gateway Routes

```
📍 Library - Base URL: /api/v1/library

GET    /library/items                      → Tất cả items
GET    /library/items/{id}                 → Chi tiết item
GET    /library/items/by-shelf?userId=X&shelf=reading
       → Sách theo shelf (reading, read, wishlist)

POST   /library/items                      → Thêm sách vào thư viện
DELETE /library/items/{id}                 → Xóa sách khỏi thư viện

---

📍 Playlist - Base URL: /api/v1/library

GET    /playlists                          → Danh sách playlists (của user)
GET    /playlists/{id}                     → Chi tiết playlist + books

POST   /playlists                          → Tạo playlist mới
PUT    /playlists/{id}                     → Cập nhật playlist
DELETE /playlists/{id}                     → Xóa playlist

POST   /playlists/{id}/books/{bookId}      → Thêm sách vào playlist
DELETE /playlists/{id}/books/{bookId}      → Xóa sách khỏi playlist

POST   /playlists/{id}/reorder             → Sắp xếp lại thứ tự
       └─ body: [bookId1, bookId2, ...]
```

### 📊 Entity Models

**LibraryItem**

```
├── id (PK)
├── userId (indexed)
├── bookId (indexed)
├── shelf (READING, READ, WISHLIST)
├── addedAt
├── lastAccessedAt
└── notes
```

**Playlist**

```
├── id (PK)
├── userId (indexed)
├── name
├── description
├── createdAt
├── updatedAt
└── books (One-to-Many with PlaylistBook)
```

**PlaylistBook**

```
├── id (PK)
├── playlistId (FK)
├── bookId
├── position (for ordering)
└── addedAt
```

### 💾 Database

- **MySQL** (InnoDB)
- **Indexes**: userId, bookId, shelf
- **Unique Constraints**: (userId, bookId) cho library items
- **Junction Table**: playlist_books với unique (playlistId, bookId)

### 🚀 Features

- ✅ Multiple shelf categories (Reading, Read, Wishlist)
- ✅ Custom playlists
- ✅ Reordering books (position tracking)
- ✅ User isolation (X-User-Id header)

---

Tiếp theo: Xem file **SERVICES_ANALYSIS_REPORT_VN_PART3.md**
