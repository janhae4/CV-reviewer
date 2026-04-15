---
description: Cách deploy ứng dụng lên Vercel
---

Workflow này hướng dẫn bạn cách đưa ứng dụng CV Reviewer lên môi trường production trên Vercel.

### 1. Chuẩn bị
Đảm bảo bạn đã có tài khoản [Vercel](https://vercel.com/) và đã cài đặt Vercel CLI nếu muốn deploy từ dòng lệnh.

### 2. Các bước thực hiện

// turbo
#### Bước 2.1: Cài đặt Vercel CLI (nếu chưa có)
```bash
npm install -g vercel
```

#### Bước 2.2: Đăng nhập
```bash
vercel login
```

#### Bước 2.3: Liên kết và Deploy
Chạy lệnh sau để bắt đầu quá trình setup project. Vercel sẽ tự động nhận diện đây là project Next.js.
```bash
vercel
```

### 3. Cấu hình Biến môi trường (QUAN TRỌNG)
Ứng dụng cần API Key của Gemini để hoạt động. Bạn cần thêm nó vào Vercel Dashboard hoặc qua CLI:

```bash
vercel env add GEMINI_API_KEY
```
*Nhập giá trị API Key của bạn khi được hỏi.*

### 4. Deploy Production
Sau khi đã cấu hình xong, chạy lệnh sau để deploy bản chính thức:
```bash
vercel --prod
```

### 5. Lưu ý bảo mật
- Không bao giờ commit file `.env` lên GitHub.
- Đảm bảo biến môi trường `GEMINI_API_KEY` đã được đặt đúng trong phần **Settings > Environment Variables** trên Vercel Dashboard.
