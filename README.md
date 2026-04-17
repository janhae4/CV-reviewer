# Resume·Core ⚡
### Advanced ATS CV Reviewer & Career Assistant

A high-performance, brutalist-editorial web application designed for deep CV analysis, ATS optimization, and career preparation. Powered by Google Gemini AI and built with a robust microservices architecture.

![Resume Core Demo](https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3)

---

## 🚀 Features

- **Deep ATS Analysis**: Evaluates CV against Job Descriptions with detailed scoring and actionable feedback.
- **Semantic Matching**: Uses Gemini Embeddings to calculate a multi-dimensional "Matching Score" between candidate and role.
- **Live PDF Annotations**: High-fidelity PDF preview with handwritten-style AI annotations and error highlights.
- **AI Career Tools**:
  - **Cover Letter Gen**: Persuasive, quantified, and JD-tailored cover letters.
  - **Interview Prep**: Predictive interview questions with rationale and ideal answers.
  - **Career Assistant**: Interactive chat for real-time career advice and CV improvements.
- **Brutalist Design**: High-contrast, high-performance interface with glassmorphism and smooth micro-animations.
- **Robust Backend**: Queue-based job processing (BullMQ + Redis) for reliable AI generation.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **PDF Core**: [PDF.js](https://mozilla.github.io/pdf.js/)

### Backend
- **Core**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/) (`@google/genai`)
- **Job Queue**: [BullMQ](https://docs.bullmq.io/) with [Redis](https://redis.io/)
- **File Handling**: [Multer](https://github.com/expressjs/multer) & [PDF-Parse](https://www.npmjs.com/package/pdf-parse)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: IndexedDB (Local Storage) for session persistence.

---

## 📦 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/CV-reviewer.git
   cd CV-reviewer
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root:
   ```env
   GEMINI_API_KEY=your_api_key_here
   REDIS_URL=redis://redis:6379
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

3. **Launch with Docker**
   ```bash
   docker compose up -d --build
   ```

4. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3001`

---

## 🛡 Security & Performance

- **Rate Limiting**: Integrated Redis-based rate limiting per visitor.
- **Data Privacy**: CV files are processed in-memory and never stored permanently (only metadata in IndexedDB).
- **Validation**: Strict backend validation for input length, file types, and JD quality.

---

## 🎨 Aesthetic Philosophy

Resume·Core follows a **Brutalist-Editorial** design system:
- **Typography**: Fraunces (Serif) for headings, Manrope (Sans) for data.
- **Color Palette**: Pitch black surfaces (`#030303`), Neon Accent (`#E1FF01`), and high-contrast status colors.
- **Motion**: Purposeful transitions that respect reduced-motion settings while providing a premium feel.

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ⚡ by [Your Name/Team]
