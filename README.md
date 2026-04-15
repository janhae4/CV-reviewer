# 🎯 CV Reviewer Engine

Một công cụ phân tích CV chuyên sâu sử dụng trí tuệ nhân tạo (Gemini AI) giúp tối ưu hóa hồ sơ theo chuẩn ATS (Applicant Tracking System). Dự án được thiết kế với phong cách Brutalist hiện đại, hỗ trợ chú thích trực tiếp trên PDF.

![CV Reviewer Demo](https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop)

## ✨ Tính năng nổi bật

- **🔍 Phân tích ATS chuyên sâu**: Giải mã hồ sơ theo cách các thuật toán nhìn thấy.
- **📝 Chú thích PDF trực tiếp**: Hiển thị các lỗi và gợi ý cải thiện ngay trên file CV của bạn.
- **📊 Keyword Analytics**: So khớp từ khóa giữa CV và mô tả công việc (JD).
- **🌍 Đa ngôn ngữ**: Hỗ trợ đầy đủ tiếng Việt và tiếng Anh.
- **🔒 Quyền riêng tư**: Xử lý dữ liệu tức thời và không lưu trữ hồ sơ của người dùng.
- **☕ Mô hình ủng hộ cộng đồng**: Miễn phí cho mọi người, duy trì qua hình thức quyên góp tự nguyện.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI/UX**: React 19, Tailwind CSS 4, Lucide Icons, Framer Motion
- **AI Core**: [Google Gemini AI SDK](https://ai.google.dev/)
- **PDF Processing**: PDF.js (Client-side rendering & Annotation)
- **Tracking**: FingerprintJS (Quản lý lượt dùng miễn phí)
- **Deployment**: Vercel & GitHub Actions (CI/CD)

## 🚀 Cài đặt Development

Yêu cầu: Node.js 20+ và `pnpm`.

1. **Clone dự án**:
   ```bash
   git clone https://github.com/janhae4/CV-reviewer.git
   cd CV-reviewer
   ```

2. **Cài đặt dependencies**:
   ```bash
   pnpm install
   ```

3. **Cấu hình môi trường**:
   Tạo file `.env.local` và thêm API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Chạy ứng dụng**:
   ```bash
   pnpm dev
   ```

## 🏗️ Cấu trúc dự án

- `/app`: Chứa mã nguồn Next.js (Pages, API Routes, Layouts).
- `/components`: Các UI component dùng chung (PdfAnnotator, v.v.).
- `/lib`: Chứa logic xử lý Gemini AI, dịch thuật và các helper function.
- `/.github/workflows`: Quy trình CI/CD tự động deploy lên Vercel.

## 🔌 CI/CD

Dự án đã được tích hợp sẵn quy trình Deploy tự động:
- Mỗi khi push lên nhánh `main`, GitHub Actions sẽ tự động build và đẩy lên Vercel.
- Cần cấu hình secret `VERCEL_TOKEN` trong repository GitHub để quy trình hoạt động.

## 🤝 Hỗ trợ tác giả

Nếu bạn thấy công cụ này hữu ích, hãy ủng hộ mình một ly cafe qua cổng Momo nhé! Sự đóng góp của bạn giúp duy trì server và chi phí API Gemini hàng tháng.

## 📄 License

Dự án được phát hành dưới bản quyền tự do. Vui lòng ghi rõ nguồn nếu bạn sử dụng lại mã nguồn.

---
Built with ❤️ by **janhae4** using **Gemini AI**
