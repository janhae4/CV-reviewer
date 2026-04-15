# 🎯 CV Reviewer Engine

Một công cụ phân tích CV chuyên sâu sử dụng trí tuệ nhân tạo (Gemini AI) giúp tối ưu hóa hồ sơ theo chuẩn ATS (Applicant Tracking System). Dự án được thiết kế với phong cách Brutalist hiện đại, hỗ trợ chú thích trực tiếp trên PDF và cung cấp bộ công cụ tối ưu toàn diện cho ứng viên.

![CV Reviewer Demo](https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop)

## ✨ Tính năng nổi bật

### 🔍 Core Analytics
- **Phân tích ATS chuyên sâu**: Giải mã hồ sơ theo cách các thuật toán nhìn thấy, chấm điểm phù hợp dựa trên Job Description (JD).
- **📝 Chú thích PDF trực tiếp**: Hiển thị các lỗi và gợi ý cải thiện ngay trên file CV của bạn với tọa độ chính xác.
- **📊 Keyword ATS Optimizer**: So khớp từ khóa và phân tích khoảng cách kỹ năng (Gap Analysis) trực quan.

### 🚀 Premium AI Tools
- **✨ Magic Bullet Point Fixer**: Tự động viết lại các dòng kinh nghiệm theo công thức chuẩn quốc tế (Action Verb + Task + Result) chỉ với 1 cú click.
- **🎤 Interview Q&A Generator**: Dự đoán các câu hỏi phỏng vấn hóc búa nhất dựa trên CV/JD kèm gợi ý trả lời và lý do hỏi từ nhà tuyển dụng.
- **📄 Smart Cover Letter**: Tự động soạn thảo thư xin việc chuyên nghiệp, đồng bộ hóa phong cách cá nhân với yêu cầu công việc.
- **🔥 Content-Aware Heatmap**: Mô phỏng hướng mắt nhìn của nhà tuyển dụng (F-pattern) dựa trên các vùng dữ liệu thực tế trong CV của bạn.

### 🛠️ Export & Integration
- **📥 Excel Export**: Xuất bộ câu hỏi phỏng vấn ra file Excel (.xlsx) để luyện tập offline.
- **🌍 Đa ngôn ngữ**: Hỗ trợ đầy đủ tiếng Việt và tiếng Anh (100% bản dịch).
- **⚙️ Custom API Key**: Cho phép người dùng sử dụng API Key Gemini cá nhân để không bị giới hạn lượt dùng.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI/UX**: React 19, Tailwind CSS 4, Lucide Icons, Framer Motion
- **AI Core**: [Google Gemini 2.0 Flash](https://ai.google.dev/)
- **PDF Processing**: PDF.js (Client-side rendering & Annotation)
- **Data Export**: XLSX (SheetJS)
- **Tracking**: FingerprintJS (Quản lý thiết bị & lượt dùng)
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
- `/api`: Hệ thống API endpoint xử lý logic AI (Review, Cover Letter, Interview, Magic Fix).

## 🤝 Hỗ trợ tác giả

Nếu bạn thấy công cụ này hữu ích, hãy ủng hộ mình một ly cafe qua cổng Momo tích hợp sẵn trong ứng dụng nhé! Sự đóng góp của bạn giúp duy trì server và chi phí API Gemini hàng tháng.

---
Built with ❤️ by **janhae4** using **Gemini AI**
