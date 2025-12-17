# 🔐 Admin Account Credentials

## Tài khoản Admin mặc định

Khi khởi động `identity-service` lần đầu tiên, hệ thống sẽ **tự động tạo** tài khoản admin với thông tin sau:

### Thông tin đăng nhập:

```
Username: admin
Password: admin
Email: (Chưa có - cần cập nhật sau khi đăng nhập)
Role: ADMIN
```

## 📍 Vị trí code khởi tạo:

File: `src/main/java/com/khiem/identity/configuration/ApplicationInitConfig.java`

```java
static final String ADMIN_USER_NAME = "admin";
static final String ADMIN_PASSWORD = "admin";
```

## 🔄 Cách thức hoạt động:

1. Khi application khởi động, `ApplicationRunner` sẽ chạy
2. Kiểm tra xem user `admin` đã tồn tại chưa
3. Nếu chưa có:
   - Tạo role `USER` và `ADMIN`
   - Tạo user `admin` với password được mã hóa
   - Gán role `ADMIN` cho user

## 🧪 Test đăng nhập:

### 1. Qua API Gateway:

```bash
curl -X POST http://localhost:8080/identity/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

### 2. Trực tiếp Identity Service:

```bash
curl -X POST http://localhost:8888/identity/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

### 3. Từ Client (React):

```typescript
import { authService } from "./services/apiServices";

const login = async () => {
  const response = await authService.login({
    username: "admin",
    password: "admin",
  });
  console.log("Access Token:", response.token);
};
```

## ⚠️ Lưu ý bảo mật:

### ❌ KHÔNG NÊN:

- Sử dụng mật khẩu mặc định trong môi trường production
- Commit mật khẩu thật vào Git
- Chia sẻ thông tin đăng nhập công khai

### ✅ NÊN:

- **Đổi mật khẩu ngay sau khi đăng nhập lần đầu**
- Sử dụng mật khẩu mạnh (ít nhất 12 ký tự, bao gồm chữ hoa, chữ thường, số, ký tự đặc biệt)
- Lưu mật khẩu trong môi trường biến môi trường hoặc secret manager
- Enable 2FA (Two-Factor Authentication) nếu có thể

## 🔧 Thay đổi mật khẩu mặc định:

### Cách 1: Qua Environment Variables

```yaml
# application.yml
app:
  admin:
    username: ${ADMIN_USERNAME:admin}
    password: ${ADMIN_PASSWORD:admin}
```

### Cách 2: Qua API sau khi đăng nhập

```bash
curl -X PUT http://localhost:8080/identity/users/my-info \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewStrongPassword@123"
  }'
```

## 📊 Kiểm tra tài khoản trong Database:

```sql
-- Kết nối vào MySQL
mysql -u root -p mybook_identity

-- Xem thông tin admin
SELECT u.id, u.username, u.email_verified, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.name
WHERE u.username = 'admin';
```

## 🚀 Quyền hạn của Admin:

Admin có toàn quyền trên hệ thống, bao gồm:

- ✅ Quản lý users (tạo, sửa, xóa, xem)
- ✅ Quản lý roles và permissions
- ✅ Quản lý books (CRUD)
- ✅ Xem tất cả orders, transactions
- ✅ Quản lý reviews, comments
- ✅ Access tất cả các services thông qua gateway
- ✅ Xem thống kê và báo cáo hệ thống

## 📝 Logs khi khởi tạo:

Khi identity-service khởi động, bạn sẽ thấy log:

```
[WARN] admin user has been created with default password: admin, please change it
```

---

**Ngày tạo:** 17/12/2025  
**Service:** Identity Service  
**Version:** 1.0.0
