# Thai Tien Shop - Hair Wax E-commerce Platform

Website thương mại điện tử chuyên biệt cho ngành sáp vuốt tóc và sản phẩm Grooming nam giới. Dự án tập trung vào xây dựng hệ thống Backend hiện đại, bảo mật và quy trình triển khai tự động.

## 🚀 Tech Stack
- **Backend:** NestJS, TypeScript, Node.js
- **Database:** MySQL, Prisma ORM
- **Performance:** Redis (Caching)
- **Infrastructure:** Docker, Docker Compose, AWS (EC2, S3)
- **CI/CD:** GitHub Actions
- **Security:** JWT (Access/Refresh Token), Bcrypt, Throttler, Google OAuth 2.0

## 🛠️ Hướng dẫn cài đặt (Local Development)

Để chạy dự án này ở máy cá nhân, bạn cần có **Node.js** và **Docker Desktop** (khuyến khích).

### 1. Clone dự án
```bash
git clone https://github.com/thaitien09/thaitienshop.git
cd thaitienshop
```

### 2. Cài đặt Dependencies
```bash
# Cài đặt cho Backend
cd backend
npm install

# Cài đặt cho Frontend
cd ../frontend
npm install
```

### 3. Cấu hình Môi trường (.env)
Tạo file `.env` trong thư mục `backend/` dựa trên file mẫu:
```env
DATABASE_URL="mysql://root:password@localhost:3307/thaitienshop"
REDIS_HOST=localhost
REDIS_PORT=6379
# ... Các cấu hình AWS, JWT khác
```

### 4. Khởi chạy Infrastructure (Database & Redis)
Sử dụng Docker để bật nhanh MySQL và Redis mà không cần cài đặt thủ công:
```bash
# Tại thư mục gốc dự án
docker compose up -d db redis
```

### 5. Chạy ứng dụng
```bash
# Tại thư mục backend
npx prisma generate
npm run start:dev

# Tại thư mục frontend
npm run dev
```

## 🏗️ Kiến trúc triển khai (Deployment)
Dự án được triển khai tự động lên **AWS EC2** thông qua **GitHub Actions**. Toàn bộ dịch vụ được đóng gói trong **Docker Containers** giúp đảm bảo tính nhất quán giữa môi trường phát triển và môi trường thực tế.

## 💡 Lưu ý & Xử lý lỗi (Troubleshooting)

### 1. Lỗi kết nối Redis (ConnectionTimeoutError)
Nếu bạn không cài đặt Redis hoặc không chạy Docker, Backend sẽ báo lỗi timeout khi khởi động. 

**Cách khắc phục nhanh:** Mở file `backend/src/app.module.ts` và thay đổi cấu hình Cache:

*   **Trước khi sửa (Dùng Redis):**
```typescript
CacheModule.registerAsync({
  isGlobal: true,
  useFactory: async () => ({
    store: await redisStore({ url: 'redis://redis:6379', ttl: 3600 * 1000 }),
  }),
}),
```

*   **Sau khi sửa (Dùng RAM máy - Chạy ngay):**
```typescript
CacheModule.register({
  isGlobal: true,
  ttl: 3600 * 1000,
}),
```

### 2. Lỗi Prisma (Client not generated)
Nếu gặp lỗi không tìm thấy Prisma Client, hãy chạy lệnh sau trong thư mục `backend/`:
```bash
npx prisma generate
```

---
*Dự án được thực hiện bởi Thai Tien - Backend Developer Fresher.*
