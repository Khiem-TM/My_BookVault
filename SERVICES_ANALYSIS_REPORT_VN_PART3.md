# 📊 BÁO CÁO PHÂN TÍCH CÁC SERVICE - PHẦN 3

**Tiếp theo từ SERVICES_ANALYSIS_REPORT_VN_PART2.md**

---

## 💬 7. CHAT SERVICE (Dịch vụ Trò chuyện)

### 📌 Vai trò

- **Quản lý hội thoại**: Tạo, lấy danh sách conversation
- **Tin nhắn**: Gửi và nhận tin nhắn
- **Participants**: Quản lý người tham gia
- **Message history**: Lưu trữ lịch sử tin nhắn
- **Real-time updates**: WebSocket cho live messaging (có thể thêm)

### 🏛️ Tình trạng

✅ **Hoàn thành** - Conversation & messaging core
⚠️ **Có thể enhance** - WebSocket cho real-time

### 📐 Design Pattern Áp dụng

1. **Service-to-Service Communication**

   - OpenFeign client gọi Profile Service
   - Fallback handling khi service down

2. **Repository Pattern (MongoDB)**

   - `ConversationRepository extends MongoRepository`
   - Custom queries: `findByParticipantIdsContains()`, `findByParticipantsHash()`

3. **Service Layer**

   - `ConversationService` - Conversation management
   - `ChatMessageService` - Message handling

4. **Document Database Design**

   - Flexible schema cho participants info
   - Embedded documents cho message history

5. **Security Context**
   - `SecurityContextHolder` để lấy user hiện tại
   - User isolation (user chỉ xem được conversations của mình)

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/chat

Conversation:
GET    /conversations/my-conversations     → Danh sách hội thoại của tôi
POST   /conversations/create               → Tạo hội thoại mới
       └─ body: { participantIds: [...] }

GET    /conversations/{id}                 → Chi tiết conversation
DELETE /conversations/{id}                 → Xóa conversation

Messages:
GET    /messages/{conversationId}          → Tin nhắn trong conversation
POST   /messages                           → Gửi tin nhắn mới
       └─ body: { conversationId, content, ... }

DELETE /messages/{id}                      → Xóa tin nhắn
```

### 📊 Document Models

**Conversation Document**

```json
{
  "_id": ObjectId,
  "participantIds": ["user_123", "user_456"],
  "participantsHash": "hash_of_sorted_ids",
  "participants": [
    {
      "userId": "123",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "url"
    },
    { ... }
  ],
  "lastMessage": "Latest message text",
  "lastMessageTime": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate,
  "archived": false
}
```

**ChatMessage Document**

```json
{
  "_id": ObjectId,
  "conversationId": ObjectId,
  "senderId": "user_123",
  "content": "Message text",
  "createdAt": ISODate,
  "reactions": { "👍": 2, "❤️": 1 },
  "readBy": ["user_456"],
  "edited": false,
  "editedAt": null
}
```

### 💾 Database

- **MongoDB** (NoSQL)
- **Indexes**:
  - `participantIdsContains` - Tìm conversations của user
  - `participantsHash` - Unique conversation giữa 2 người
  - `conversationId` - Message queries

### 🔄 Inter-Service Calls

- **Profile Service**: Fetch user info khi tạo conversation
  - `/api/v1/profile/users/{userId}` → Get profile info
  - Fallback nếu Profile Service down

### 🚀 Features

- ✅ Create conversations between users
- ✅ Unique conversation per user pair (via hash)
- ✅ Message history
- ✅ Participant info caching
- ✅ Read receipts (có thể enhance)

---

## 📁 8. FILE SERVICE (Dịch vụ Lưu trữ File)

### 📌 Vai trò

- **Upload media**: Hình ảnh, PDF, ebook, etc.
- **Download files**: Lấy file đã upload
- **File management**: Lưu metadata
- **Storage**: Local hoặc cloud storage (AWS S3, etc.)

### 🏛️ Tình trạng

✅ **Hoàn thành** - Upload/Download core functionality

### 📐 Design Pattern Áp dụng

1. **Service Layer**

   - `FileService` - Upload, download, delete logic
   - Storage abstraction (có thể switch giữa local/cloud)

2. **DTO Pattern**

   - `FileResponse` - Return file metadata
   - `FileUploadRequest` - Multipart file handling

3. **Resource Pattern**

   - `Spring Resource API` để serve files
   - Content-Type detection

4. **Exception Handling**
   - Custom `AppException` cho file errors

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/file

POST   /media/upload                       → Upload file mới
       └─ Content-Type: multipart/form-data
       └─ param: file=<file>

GET    /media/download/{fileName}          → Download file
       └─ Returns: File bytes + Content-Type header

DELETE /media/{fileName}                   → Xóa file (admin)
```

### 📋 File Response DTO

```json
{
  "fileName": "profile_123.jpg",
  "fileSize": 204800,
  "contentType": "image/jpeg",
  "uploadedAt": "2025-12-11T10:30:00Z",
  "url": "/api/v1/file/media/download/profile_123.jpg"
}
```

### 💾 Storage

- **Local File System**: `/uploads` directory
- **File Metadata**: DB (MySQL) hoặc just filenames
- **Scalability**: Có thể migrate sang S3

### 🚀 Features

- ✅ Multipart file upload
- ✅ Content-Type detection
- ✅ File size validation
- ✅ Download with proper headers

---

## 📰 9. POST SERVICE (Dịch vụ Bài Viết)

### 📌 Vai trò

- **Tạo bài viết**: User tạo nội dung (blog, reviews, tips)
- **Quản lý bài viết**: CRUD posts
- **Pagination**: Danh sách bài viết với phân trang
- **User posts**: Lấy bài viết của user cụ thể
- **Flexible content**: Metadata tùy chỉnh

### 🏛️ Tình trạng

✅ **Hoàn thành** - CRUD posts, pagination

### 📐 Design Pattern Áp dụng

1. **Repository Pattern (MongoDB)**

   - `PostRepository extends MongoRepository`
   - Custom query methods

2. **Service Layer**

   - `PostService` - CRUD & pagination logic
   - Transactional operations

3. **Mapper Pattern**

   - `PostMapper` - Document ↔ DTO

4. **Pagination Pattern**

   - `PageResponse<PostResponse>` wrapper
   - Page info: currentPage, totalPages, pageSize

5. **Document Database**
   - Flexible schema cho post content
   - Metadata field cho custom data

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/post

GET    /my-posts                           → Bài viết của tôi
       ├─ ?page=1&size=10                 → Phân trang
       └─ Returns: { page, totalPages, data: [...] }

POST   /create                             → Tạo bài viết mới
       └─ body: { title, content, ... }

GET    /{id}                               → Chi tiết bài viết
PUT    /{id}                               → Cập nhật bài viết
DELETE /{id}                               → Xóa bài viết

GET    /by-author/{userId}                 → Bài viết của user
```

### 📊 Post Document Structure

```json
{
  "_id": ObjectId,
  "userId": "user_123",
  "title": "5 cuốn sách bạn nên đọc năm nay",
  "content": "Lorem ipsum...",
  "excerpt": "Short summary...",
  "cover_image": "url",
  "tags": ["reading", "recommendation", "2025"],
  "likes": 42,
  "comments_count": 12,
  "views": 1250,
  "createdAt": ISODate,
  "updatedAt": ISODate,
  "published": true,
  "metadata": {
    "category": "recommendation",
    "difficulty": "easy"
  }
}
```

### 💾 Database

- **MongoDB** (NoSQL)
- **Indexes**:
  - userId (để query posts của user)
  - createdAt (để sort mới nhất)
  - tags (để search)

### 🚀 Features

- ✅ CRUD posts
- ✅ Pagination
- ✅ Metadata flexibility
- ✅ Publishing status
- ✅ Tags/Categories

---

## 🔔 10. NOTIFICATION SERVICE (Dịch vụ Thông báo)

### 📌 Vai trò

- **Gửi email**: Notification qua email
- **Email templates**: Verify account, password reset, order update
- **Integration**: Brevo/Mailgun API
- **Async**: Kafka consumers cho async notifications

### 🏛️ Tình trạng

✅ **Hoàn thành** - Email sending core

### 📐 Design Pattern Áp dụng

1. **Service Layer**

   - `EmailService` - Email logic
   - External API integration

2. **Feign Client Pattern**

   - `EmailClient` (OpenFeign) → Brevo API
   - Fallback handling

3. **Event-Driven Pattern** (có thể enhance)

   - Kafka consumers để xử lý async events
   - Trigger emails từ events (order created, etc.)

4. **Template Pattern**
   - Email templates cho different scenarios
   - HTML content rendering

### 🔌 Endpoints & Gateway Routes

```
📍 Base URL (qua Gateway): /api/v1/notification

POST   /email/send                         → Gửi email
       └─ body: { to, subject, htmlContent }

POST   /email/verify                       → Gửi email xác minh
POST   /email/password-reset               → Gửi reset password
POST   /email/order-confirmation           → Gửi order confirmation
```

### 📋 Email Request DTO

```json
{
  "to": "user@example.com",
  "subject": "Welcome to MyBook!",
  "htmlContent": "<h1>Welcome!</h1>..."
}
```

### 🔄 Inter-Service Communication

- **Brevo API**: Send emails via external service
- **Kafka**: Listen to events (có thể implement)
  - order.created → send order confirmation
  - user.registered → send welcome email
  - password.reset → send reset link

### 🚀 Features

- ✅ Email sending via Brevo
- ✅ Error handling & retry
- ✅ Multiple email templates
- ✅ Async processing ready

---

Tiếp theo: Xem file **SERVICES_ANALYSIS_REPORT_VN_PART4.md**
