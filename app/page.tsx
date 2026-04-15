"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiChevronRight } from "react-icons/hi";

const LP = {
  en: {
    nav: { pricing: "Pricing", faq: "FAQ", cta: "Launch App →" },
    hero: {
      eyebrow: "Powered by Gemini AI",
      title1: "Your CV,",
      title2: "decoded.",
      sub: "Deep ATS analysis. Highlight directly on PDF.\nLine-by-line suggestions. Vietnamese & English.",
      cta1: "Analyze CV for free",
      cta2: "View Pro plan",
    },
    stats: [
      { num: "ATS", label: "Score Analysis" },
      { num: "PDF", label: "Live Annotation" },
      { num: "AI", label: "Gemini Flash" },
    ],
    how: {
      tag: "HOW IT WORKS",
      title: "Three steps, instant results.",
      steps: [
        { n: "01", title: "Upload CV", desc: "Drag & drop a PDF. Paste a Job Description for ATS keyword analysis." },
        { n: "02", title: "AI Analysis", desc: "Gemini Flash reads your CV, compares to JD, scores ATS fit and highlights strengths / gaps." },
        { n: "03", title: "View Results", desc: "Highlights appear at the exact location on your PDF. Hover to read detailed suggestions." },
      ],
    },
    pricing: {
      tag: "PRICING",
      title: ["Start free,", "upgrade when ready."],
      free: {
        label: "FREE", price: "$0", period: "/ month",
        features: ["2 analyses per day", "Or use your own Gemini API Key (unlimited)", "Basic PDF annotation", "ATS score & keyword analysis", "Vietnamese + English"],
        cta: "Get started",
      },
      donate: {
        label: "SUPPORT", price: "$1", period: " / coffee", popular: "Buy Me a Coffee",
        features: ["Help keep the server running", "No ads, no tracking, ever", "Support independent AI development", "Get a virtual high-five", "Access to early beta features"],
        cta: "Support Project",
        note: "Every donation helps cover Gemini API costs",
      },
      apiNote: { title: "Using your own API Key?", body: "Enter your Gemini API Key in the app for unlimited analyses, completely free.", link: "Get a free API Key →" },
    },
    faq: {
      tag: "FAQ",
      title: "Frequently asked questions.",
      items: [
        { q: "What are the Free plan limits?", a: "You can analyze 2 CVs per day for free. Or enter your own Gemini API Key for unlimited uses." },
        { q: "Is my CV data stored?", a: "No. Your CV is only sent to Gemini AI for analysis and is never stored on any server." },
        { q: "Where do I get a Gemini API Key?", a: "Sign up for free at Google AI Studio (aistudio.google.com), create an API Key and paste it into the app." },
        { q: "How does PDF annotation work?", a: "The AI returns exact quotes from your CV. The system finds real coordinates via the PDF text layer and overlays highlights directly on the document." },
      ],
    },
    finalCta: { label: "READY?", title1: "Analyze your CV", title2: "right now.", cta: "Start for free", sub: "No sign-up. No credit card." },
    footer: "© 2025 · Built with Gemini AI",
  },
  vi: {
    nav: { pricing: "Bảng giá", faq: "FAQ", cta: "Vào ứng dụng →" },
    hero: {
      eyebrow: "Powered by Gemini AI",
      title1: "CV của bạn,",
      title2: "decoded.",
      sub: "Phân tích ATS chuyên sâu. Highlight trực tiếp lên PDF.\nGợi ý cải thiện theo từng dòng. Tiếng Việt & English.",
      cta1: "Phân tích CV miễn phí",
      cta2: "Xem gói Pro",
    },
    stats: [
      { num: "ATS", label: "Phân tích điểm" },
      { num: "PDF", label: "Chú thích trực tiếp" },
      { num: "AI", label: "Gemini Flash" },
    ],
    how: {
      tag: "CÁCH HOẠT ĐỘNG",
      title: "Ba bước, kết quả ngay.",
      steps: [
        { n: "01", title: "Upload CV", desc: "Kéo thả file PDF. Dán Job Description để phân tích keyword ATS." },
        { n: "02", title: "AI Phân tích", desc: "Gemini Flash đọc toàn bộ CV, so sánh JD, chấm điểm ATS và chỉ ra điểm mạnh / yếu." },
        { n: "03", title: "Xem kết quả", desc: "Highlight trực tiếp trên PDF tại đúng vị trí cần cải thiện. Hover để đọc gợi ý." },
      ],
    },
    pricing: {
      tag: "BẢNG GIÁ",
      title: ["Bắt đầu miễn phí,", "nâng cấp khi cần."],
      free: {
        label: "FREE", price: "0đ", period: "/ tháng",
        features: ["2 lần phân tích mỗi ngày", "Hoặc dùng Gemini API Key riêng (không giới hạn)", "PDF annotation cơ bản", "ATS score & keyword analysis", "Tiếng Việt + English"],
        cta: "Bắt đầu ngay",
      },
      donate: {
        label: "ỦNG HỘ", price: "25.000", period: " / ly cafe", popular: "Mời mình ly cafe",
        features: ["Giúp duy trì server & chi phí API", "Mãi mãi không quảng cáo", "Ủng hộ phát triển công cụ Việt", "Nhận được sự trân trọng từ tác giả", "Trải nghiệm tính năng mới sớm nhất"],
        cta: "Ủng hộ tác giả",
        note: "Mọi sự ủng hộ đều được dùng để duy trì API Gemini",
      },
      apiNote: { title: "Dùng API Key riêng?", body: "Nhập Gemini API Key của bạn trong ứng dụng để phân tích không giới hạn hoàn toàn miễn phí.", link: "Lấy API Key miễn phí →" },
    },
    faq: {
      tag: "CÂU HỎI THƯỜNG GẶP",
      title: "Câu hỏi thường gặp.",
      items: [
        { q: "Free plan có giới hạn gì?", a: "Bạn có thể phân tích 2 CV miễn phí mỗi ngày. Hoặc nhập Gemini API Key của riêng bạn để dùng không giới hạn hoàn toàn." },
        { q: "Dữ liệu CV của tôi có được lưu không?", a: "Không. CV của bạn chỉ được gửi tới Gemini AI để phân tích và không được lưu trên bất kỳ server nào." },
        { q: "Tôi lấy Gemini API Key ở đâu?", a: "Đăng ký miễn phí tại Google AI Studio (aistudio.google.com), tạo API Key và dán vào ô trong ứng dụng." },
        { q: "PDF annotation hoạt động như thế nào?", a: "AI trả về các đoạn trích dẫn chính xác từ CV của bạn. Hệ thống tự tìm tọa độ thực trong PDF qua text layer và overlay highlight trực tiếp lên tài liệu." },
      ],
    },
    finalCta: { label: "READY?", title1: "Phân tích CV của bạn", title2: "ngay bây giờ.", cta: "Bắt đầu miễn phí", sub: "Không cần đăng ký. Không thẻ tín dụng." },
    footer: "© 2026 · Built with Gemini AI",
  },
};

type LPLang = "en" | "vi";
const TICKER = ["ATS OPTIMIZED", "AI-POWERED", "GEMINI FLASH", "MULTI-LANGUAGE", "PDF ANNOTATION", "KEYWORD ANALYSIS", "FREE TO START"];

export default function LandingPage() {
  const [lang, setLang] = useState<LPLang>("vi");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const t = LP[lang];


  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : ""}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-16 flex items-center justify-between">
          <span className="font-serif font-black text-lg tracking-widest">RESUME ENGINE</span>
          <div className="flex items-center gap-6 md:gap-8">
            <a href="#pricing" className="hidden md:block text-[11px] font-bold tracking-widest uppercase text-neutral hover:text-foreground transition-colors">{t.nav.pricing}</a>
            <a href="#faq" className="hidden md:block text-[11px] font-bold tracking-widest uppercase text-neutral hover:text-foreground transition-colors">{t.nav.faq}</a>
            {/* Lang toggle */}
            <div className="flex border border-border overflow-hidden">
              {(["vi", "en"] as LPLang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-colors ${lang === l ? "bg-accent text-background" : "text-neutral hover:text-foreground"}`}
                >{l === "vi" ? "VN" : "EN"}</button>
              ))}
            </div>
            <Link href="/app" className="bg-accent text-background text-[11px] font-black tracking-widest uppercase px-5 py-2 hover:opacity-85 transition-opacity">{t.nav.cta}</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center px-8 md:px-12 pt-24 pb-20 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          }}
        />
        <div className=" flex flex-col justify-center items-center w-full relative z-10">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8 animate-entry delay-1">
            <span className="bg-accent text-background text-[9px] font-black tracking-widest uppercase px-2 py-0.5">Beta</span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-neutral">{t.hero.eyebrow}</span>
          </div>
          {/* Title */}
          <h1 className="font-serif font-black leading-[0.88] tracking-tight mb-8 animate-entry delay-2"
            style={{ fontSize: "clamp(64px, 11vw, 140px)" }}>
            {t.hero.title1}<br />
            <span className="text-accent">{t.hero.title2}</span>
          </h1>
          {/* Subtitle */}
          <p className="text-neutral font-light leading-relaxed mb-12 max-w-xl animate-entry delay-3" style={{ fontSize: "16px" }}>
            {t.hero.sub.split("\n").map((l, i) => <span key={i}>{l}{i === 0 && <br />}</span>)}
          </p>
          {/* CTAs */}
          <div className="flex items-center gap-6 flex-wrap mb-16 animate-entry delay-3">
            <Link href="/app"
              className="inline-flex items-center gap-3 bg-accent text-background text-xs font-black tracking-widest uppercase px-8 py-4 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(225,255,1,0.3)] transition-all duration-150">
              {t.hero.cta1} <span className="text-base">→</span>
            </Link>
            <a href="#pricing" className="text-xs font-bold tracking-widest uppercase text-neutral border-b border-border pb-0.5 hover:text-foreground hover:border-neutral transition-all">{t.hero.cta2}</a>
          </div>
          {/* Stats */}
          <div className="flex gap-10 pt-8 border-t border-border animate-entry delay-3">
            {t.stats.map(s => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="font-serif font-black text-accent text-2xl">{s.num}</span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      </section>

      {/* ── TICKER ── */}
      <div className="overflow-hidden border-y border-border bg-surface py-3.5">
        <div className="inline-flex" style={{ animation: "ticker 28s linear infinite" }}>
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="inline-flex items-center px-10 text-[10px] font-black tracking-widest uppercase text-neutral whitespace-nowrap">
              {item} <span className="ml-10 text-accent">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="px-8 md:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="block text-[10px] font-black tracking-[0.2em] uppercase text-accent mb-4">{t.how.tag}</span>
            <h2 className="font-serif font-black leading-tight" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>{t.how.title}</h2>
          </div>

          {/* Steps row */}
          <div className="flex flex-col md:flex-row items-stretch">
            {t.how.steps.map((step, idx) => (
              <div key={step.n} className="flex flex-col md:flex-row items-stretch flex-1 min-w-0">

                {/* Step card */}
                <div className="flex-1 p-10 md:p-12 bg-background group hover:border-accent/40 transition-colors duration-300">
                  <div className="font-serif font-black text-[56px] leading-none text-border mb-2 select-none">{step.n}</div>
                  <div className="mb-4 mt-2 w-[4rem] border-t-5 border-neutral/20"></div>
                  <h3 className="text-base font-black mb-3 tracking-tight uppercase">{step.title}</h3>
                  <p className="text-sm font-light text-neutral leading-relaxed">{step.desc}</p>
                </div>

                {/* Desktop arrow separator */}
                {idx < t.how.steps.length - 1 && (
                  <div className="hidden md:flex p-2 rounded-full items-center justify-center px-2 flex-shrink-0 text-neutral/30">
                    <span className="p-0.5 bg-neutral/20 rounded-full">
                      <HiChevronRight size={28} className="text-accent/50" />
                    </span>
                  </div>
                )}

                {/* Mobile down-arrow separator */}
                {idx < t.how.steps.length - 1 && (
                  <div className="flex md:hidden items-center justify-center py-3 text-accent/50">
                    <HiChevronRight size={22} className="rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-8 md:px-12 py-24 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="block text-[10px] font-black tracking-[0.2em] uppercase text-accent mb-4">{t.pricing.tag}</span>
            <h2 className="font-serif font-black leading-tight" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
              {t.pricing.title[0]}<br />{t.pricing.title[1]}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-10">
            {/* FREE */}
            <div className="bg-background border border-neutral-800 p-10 md:p-12 flex flex-col">
              <span className="inline-block text-[10px] font-black tracking-widest uppercase border border-border text-neutral px-3 py-1 mb-5 w-fit">{t.pricing.free.label}</span>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-serif font-black leading-none" style={{ fontSize: "56px" }}>{t.pricing.free.price}</span>
                <span className="text-sm text-neutral">{t.pricing.free.period}</span>
              </div>
              <ul className="flex flex-col gap-3 flex-1 mb-10">
                {t.pricing.free.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm font-light">
                    <span className="text-neutral text-xs mt-0.5 flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div>
                <Link href="/app" className="block text-center text-[11px] font-black tracking-widest uppercase py-4 border border-border text-foreground hover:bg-foreground hover:text-background transition-all">{t.pricing.free.cta}</Link>
                {/* Spacer to match Pro note height */}
                <p className="text-[11px] invisible mt-3">Placeholder</p>
              </div>
            </div>

            {/* DONATE */}
            <div className="bg-[#0d0d0d] border border-neutral-800 p-10 md:p-12 flex flex-col relative">
              <div className="absolute top-6 right-6 bg-accent text-background text-[9px] font-black tracking-widest uppercase px-2.5 py-1">{t.pricing.donate.popular}</div>
              <span className="inline-block text-[10px] font-black tracking-widest uppercase bg-accent text-background px-3 py-1 mb-5 w-fit">{t.pricing.donate.label}</span>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-serif font-black text-accent leading-none" style={{ fontSize: "56px" }}>{t.pricing.donate.price}</span>
                <span className="text-sm text-neutral">{t.pricing.donate.period}</span>
              </div>
              <ul className="flex flex-col gap-3 flex-1 mb-10">
                {t.pricing.donate.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-3 text-sm font-light">
                    <span className="text-accent text-xs mt-0.5 flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div>
                <button
                  onClick={() => setShowQr(true)}
                  className="block w-full text-center text-[11px] font-black tracking-widest uppercase py-4 bg-accent text-background hover:opacity-85 transition-opacity"
                >
                  {t.pricing.donate.cta}
                </button>
                <p className="text-[11px] text-neutral text-center mt-3">{t.pricing.donate.note}</p>
              </div>
            </div>
          </div>

          {/* QR MODAL */}
          {showQr && (
            <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 animate-entry">
              <div className="max-w-2xl w-full border border-accent/20 bg-surface relative shadow-[0_0_80px_rgba(225,255,1,0.08)] flex flex-col md:flex-row overflow-hidden">
                <button onClick={() => setShowQr(false)} className="absolute top-6 right-6 z-20 text-neutral hover:text-accent transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                {/* Left: QR Area */}
                <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center relative">
                    <Image 
                      src={"/momo_qr.jpg"}
                      width={400}
                      height={400}
                      alt="Momo QR" 
                      className="relative w-full h-full shadow-sm transform transition-transform duration-500" 
                    />
                </div>

                {/* Right: Content Area */}
                <div className="w-full md:w-1/2 p-10 md:p-12 flex flex-col justify-center bg-surface border-t md:border-t-0 md:border-l border-accent/10">
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase text-accent mb-4">Support Independent AI</div>
                  <h3 className="font-serif font-black text-3xl leading-tight mb-6">Mời tác giả<br /><span className="text-accent underline decoration-accent/20 underline-offset-8">một ly cafe.</span></h3>
                  
                  <p className="text-sm text-neutral font-light leading-relaxed mb-8">
                    Sự hỗ trợ của bạn giúp mình duy trì server Gemini API và có thêm động lực phát triển công cụ này hoàn toàn miễn phí cho cộng đồng. ☕
                  </p>

                  <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex items-center gap-3 px-4 py-3 bg-background border border-border">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <span className="text-[10px] font-black tracking-widest uppercase">Momo Transfer Preferred</span>
                    </div>
                    <button
                      onClick={() => setShowQr(false)}
                      className="w-full py-4 bg-accent text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                      Xác nhận đã hiểu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* API note */}
          <div className="flex items-start gap-5 p-6 md:p-8">
            <span className="text-xl flex-shrink-0">🔑</span>
            <p className="text-sm font-light text-neutral leading-relaxed">
              <strong className="text-foreground font-bold">{t.pricing.apiNote.title}</strong>{" "}
              {t.pricing.apiNote.body}{" "}
              <a href="https://aistudio.google.com" target="_blank" rel="noopener" className="text-accent font-bold hover:underline">{t.pricing.apiNote.link}</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-8 md:px-12 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-16">
            <span className="block text-[10px] font-black tracking-[0.2em] uppercase text-accent mb-4">{t.faq.tag}</span>
            <h2 className="font-serif font-black leading-tight" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>{t.faq.title}</h2>
          </div>
          <div className="flex flex-col">
            {t.faq.items.map((faq, i) => (
              <div key={i} className={`border-b border-border cursor-pointer ${i === 0 ? "border-t" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className={`flex justify-between items-center py-6 gap-6 text-base font-bold transition-colors ${openFaq === i ? "text-accent" : "text-foreground"}`}>
                  <span>{faq.q}</span>
                  <span className="text-xl font-light text-neutral flex-shrink-0">{openFaq === i ? "−" : "+"}</span>
                </div>
                {openFaq === i && (
                  <p className="pb-6 text-sm font-light text-neutral leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-8 md:px-12 py-28 border-t border-border text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(225,255,1,0.04) 0%, transparent 70%)" }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-[10px] font-black tracking-[0.2em] uppercase text-accent mb-5">{t.finalCta.label}</div>
          <h2 className="font-serif font-black leading-none mb-12" style={{ fontSize: "clamp(40px, 7vw, 80px)" }}>
            {t.finalCta.title1}<br />
            <span className="text-accent">{t.finalCta.title2}</span>
          </h2>
          <Link href="/app"
            className="inline-flex items-center gap-3 bg-accent text-background text-sm font-black tracking-widest uppercase px-10 py-5 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(225,255,1,0.3)] transition-all duration-150">
            {t.finalCta.cta} <span>→</span>
          </Link>
          <p className="mt-5 text-xs text-neutral tracking-wide">{t.finalCta.sub}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-8 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-serif font-black text-sm tracking-widest">RESUME ENGINE</span>
          <span className="text-xs text-neutral tracking-wide">{t.footer}</span>
        </div>
      </footer>
    </div>
  );
}
