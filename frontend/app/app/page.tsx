"use client";
import { useState, lazy, Suspense, useRef, useEffect } from "react";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import Link from "next/link";
import Image from "next/image";
import * as XLSX from 'xlsx';

import { translations, Language } from "../../lib/translations";
const PdfAnnotator = lazy(() => import("../../components/PdfAnnotator"));
import type { AnnotationHint } from "../../components/PdfAnnotator";
// API calls will use relative paths to trigger the Next.js proxy

export default function AppPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const [jobDescription, setJobDescription] = useState("");
  const [lang, setLang] = useState<Language>("vi");
  const [annotations, setAnnotations] = useState<AnnotationHint[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState({
    general: "",
    rate: "0/10",
    strengths: [] as string[],
    weaknesses: [] as string[],
    improvements: [] as string[],
    keywords: [] as string[],
    cvKeywords: [] as string[],
    missingKeywords: [] as string[],
    keywordOptimizationTips: [] as { keyword: string; tip: string }[],
  });

  // Limits & Keys
  const [usageCount, setUsageCount] = useState(0);
  const [userApiKey, setUserApiKey] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isWorkspace, setIsWorkspace] = useState(false);


  const [visitorId, setVisitorId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [clProgress, setClProgress] = useState(0);
  const [showCLModal, setShowCLModal] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState<{ question: string, answer: string, rationale: string }[]>([]);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [toast, setToast] = useState("");



  const fileInputRef = useRef<HTMLInputElement>(null);



  const t = translations[lang];

  // Load usage data
  useEffect(() => {
    const savedCount = localStorage.getItem("resume_usage_count");
    if (savedCount) setUsageCount(parseInt(savedCount));

    const savedKey = localStorage.getItem("resume_user_api_key");
    if (savedKey) setUserApiKey(savedKey);

    // Initialize Fingerprint
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setVisitorId(result.visitorId);
    };
    setFp();
  }, []);


  const saveUsage = (count: number) => {
    setUsageCount(count);
    localStorage.setItem("resume_usage_count", count.toString());
  };

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem("resume_user_api_key", key);
    setShowLimitModal(false);
  };

  // Collapsible sections
  const [open, setOpen] = useState({ strengths: true, weaknesses: true, improvements: true, keywords: true });
  const toggle = (key: keyof typeof open) => setOpen(p => ({ ...p, [key]: !p[key] }));

  const hasResults = result.general !== "" || result.strengths.length > 0;

  const handleGenerateCoverLetter = async () => {
    if (!file) return;

    // If already generated, just re-open
    if (coverLetter) {
      setShowCLModal(true);
      return;
    }

    setIsGeneratingCL(true);
    setClProgress(0);

    const interval = setInterval(() => {
      setClProgress(p => p < 88 ? p + Math.random() * 12 : p);
    }, 350);

    try {
      const resp = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cover-letter", resumeText, jobDescription, lang, userApiKey })
      });
      const data = await resp.json();
      if (data.jobId) {
        const result = await pollJob(data.jobId);
        setClProgress(100);
        setCoverLetter(result);
        showToast(lang === "vi" ? "Đã soạn thảo xong Cover Letter!" : "Cover Letter ready!");
      }
    } catch (e) {
      console.error(e);
      showToast(lang === "vi" ? "Lỗi khi soạn thảo!" : "Error generating letter!");
    } finally {
      clearInterval(interval);
      setTimeout(() => setIsGeneratingCL(false), 400);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const pollJob = async (jobId: string) => {
    let isDone = false;
    while (!isDone) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const statusRes = await fetch(`/api/review/status/${jobId}`);
      const statusData = await statusRes.json();
      if (statusData.state === "completed") return statusData.result;
      if (statusData.state === "failed") throw new Error(statusData.error || "Processing failed");
    }
  };


  // ── File Helpers ──────────────────────────────────────────────────────────
  const handleFileChange = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setFileUrl(f.type === "application/pdf" ? URL.createObjectURL(f) : null);
    if (isWorkspace) {
      setResult({
        general: "", rate: "0/10", strengths: [], weaknesses: [], improvements: [],
        keywords: [], cvKeywords: [], missingKeywords: [], keywordOptimizationTips: []
      });
      setAnnotations([]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!file) return;

    // Check Limit
    if (usageCount >= 2 && !userApiKey) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true); setError(""); setProgress(0);

    setResult({
      general: "", rate: "0/10", strengths: [], weaknesses: [], improvements: [],
      keywords: [], cvKeywords: [], missingKeywords: [], keywordOptimizationTips: []
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);
      formData.append("lang", lang);
      formData.append("visitorId", visitorId);
      if (userApiKey) formData.append("userApiKey", userApiKey);


      let val = 0, isPostComplete = false;
      let pendingData: Record<string, unknown> | null = null;



      const handleComplete = () => {
        clearInterval(progressInterval);
        if (pendingData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const d = pendingData as any;
          if (d.extractedText) setResumeText(d.extractedText);
          setResult({

            general: d.general || "",
            rate: d.rate || "0/10",
            strengths: d.strengths || [],
            weaknesses: d.weaknesses || [],
            improvements: d.improvements || [],
            keywords: d.keywords || [],
            cvKeywords: d.cvKeywords || [],
            missingKeywords: d.missingKeywords || [],
            keywordOptimizationTips: d.keywordOptimizationTips || [],
          });
          setAnnotations(d.annotations || []);

          setIsWorkspace(true);
          showToast(lang === "vi" ? "Phân tích hoàn tất!" : "Analysis complete!");

          // Increment count if NOT using own API Key
          if (!userApiKey) {
            saveUsage(usageCount + 1);
          }
        }
        setLoading(false);
      };

      const progressInterval = setInterval(() => {
        if (!isPostComplete) {
          if (val < 70) {
            val += Math.random() * 5;
          } else if (val < 95) {
            val += Math.random() * 0.8; // Slow creep phase
          }
        } else {
          val += Math.random() * 20; // Fast finish
          if (val >= 100) {
            val = 100;
            setTimeout(handleComplete, 500);
          }
        }
        setProgress(val);
      }, 300);

      const res = await fetch(`/api/review`, { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        clearInterval(progressInterval);
        throw new Error(data.error || "Error");
      }

      // If background processing is enabled (jobId returned)
      if (data.jobId) {
        pendingData = await pollJob(data.jobId);
      } else {
        pendingData = data;
      }

      isPostComplete = true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.error);
      setLoading(false);
    }

  };

  const handleGenerateInterviewPrep = async () => {
    if (!file) return;

    if (interviewPrep.length > 0) {
      setShowInterviewModal(true);
      return;
    }

    setIsGeneratingInterview(true);
    setInterviewProgress(0);

    const interval = setInterval(() => {
      setInterviewProgress(p => (p < 88 ? p + Math.random() * 10 : p));
    }, 400);

    try {
      const resp = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "interview", resumeText, jobDescription, lang, userApiKey })
      });
      const data = await resp.json();
      if (data.jobId) {
        const result = await pollJob(data.jobId);
        setInterviewProgress(100);
        setInterviewPrep(result);
        showToast(lang === "vi" ? "Đã chuẩn bị xong câu hỏi phỏng vấn!" : "Interview prep ready!");
      }
    } catch (e) {
      console.error(e);
      showToast(lang === "vi" ? "Lỗi khi chuẩn bị!" : "Error preparing interview!");
    } finally {
      clearInterval(interval);
      setTimeout(() => setIsGeneratingInterview(false), 400);
    }
  };

  const handleExportExcel = () => {
    if (interviewPrep.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(interviewPrep.map((item, i) => ({
      'No.': i + 1,
      'Question': item.question,
      'Rationale': item.rationale,
      'Optimal Answer': item.answer
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Interview Prep");

    // Auto-size columns (basic approach)
    const wscols = [
      { wch: 5 },   // No.
      { wch: 50 },  // Question
      { wch: 50 },  // Rationale
      { wch: 80 }   // Answer
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `InterviewPrep_${new Date().getTime()}.xlsx`);
    showToast(lang === "vi" ? "Đã tải xuống file Excel!" : "Excel file downloaded!");
  };

  const handleReset = () => {
    setResult({
      general: "", rate: "0/10", strengths: [], weaknesses: [], improvements: [],
      keywords: [], cvKeywords: [], missingKeywords: [], keywordOptimizationTips: []
    });
    setInterviewPrep([]);
    setInterviewProgress(0);
    setProgress(0); setFile(null); setFileUrl(null); setAnnotations([]); setError("");
    setIsWorkspace(false);
    setCoverLetter("");
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  // ── Score ring color ──────────────────────────────────────────────────────
  const scoreNum = parseInt(result.rate.split("/")[0]) || 0;
  const scoreColor = scoreNum >= 7 ? "var(--accent)" : scoreNum >= 5 ? "#FF9F0A" : "#ff453a";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
        className="hidden"
        accept="application/pdf"
      />

      {/* ── LIMIT MODAL ── */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-accent p-10 bg-surface flex flex-col gap-6 relative">
            <button onClick={() => setShowLimitModal(false)} className="absolute top-4 right-4 text-neutral hover:text-foreground text-xl">✕</button>
            <div className="flex flex-col gap-2 text-center">
              <h2 className="font-serif font-black text-3xl uppercase tracking-tight">{t.limitReached}</h2>
              <p className="text-sm font-light text-neutral leading-relaxed">{t.limitSubtitle}</p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-accent">{t.enterApiKey}</label>
              <input
                type="password"
                placeholder={t.apiKeyPlaceholder}
                className="w-full bg-background border border-border p-4 text-sm focus:outline-none focus:border-accent"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
              />
              <button
                onClick={() => handleSaveApiKey(userApiKey)}
                className="w-full bg-accent text-background font-black text-xs uppercase tracking-widest py-4 hover:opacity-90 transition-opacity"
              >
                {t.saveKey || "SAVE KEY"}
              </button>

              {/* Dev Only Button */}
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={() => handleSaveApiKey("DEV_BYPASS")}
                  className="w-full border border-dashed border-accent/40 text-accent font-black text-[10px] uppercase tracking-widest py-3 hover:bg-accent/5 transition-colors"
                >
                  ⚡ DEV BYPASS (Unlimited)
                </button>
              )}
            </div>


            <div className="text-center py-4 border-t border-border mt-2">
              <Link href="/#pricing" onClick={() => setShowLimitModal(false)} className="text-[10px] font-black uppercase tracking-widest text-neutral hover:text-accent transition-colors underline decoration-accent/30 underline-offset-4">
                {t.proPlan}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── QR MODAL ── */}
      {showQr && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-6 animate-entry">
          <div className="max-w-2xl w-full border border-accent/20 bg-surface relative shadow-[0_0_80px_rgba(225,255,1,0.08)] flex flex-col md:flex-row overflow-hidden text-left">
            <button onClick={() => setShowQr(false)} className="absolute top-6 right-6 z-20 text-neutral hover:text-accent transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Left: QR Area */}
            <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-10 md:p-12 relative">
              <div className="absolute top-4 left-4 text-[10px] font-black tracking-widest uppercase text-black/20">Payment Terminal v1.0</div>
              <div className="relative group">
                <div className="absolute -inset-2 bg-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <Image
                  src="/momo_qr.jpg"
                  alt="Momo QR"
                  width={240}
                  height={240}
                  className="relative w-full h-auto max-w-[240px] shadow-sm transform group-hover:scale-[1.02] transition-transform duration-500"
                />


              </div>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Awaiting transaction...</span>
              </div>
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


      {/* ── TOP NAV ── */}
      <header className="flex-shrink-0 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-neutral hover:text-foreground transition-colors text-xs tracking-widest uppercase font-bold">← Home</Link>
            <span className="text-border">|</span>
            <span className="font-serif font-black text-sm tracking-wide text-foreground">RESUME ENGINE</span>
            {process.env.NODE_ENV === "development" && (
              <button onClick={() => setShowLimitModal(true)} className="text-[10px] font-black uppercase tracking-widest text-accent border border-accent/20 px-2 py-1 hover:bg-accent/5">
                Dev
              </button>
            )}
            {isWorkspace && (
              <button onClick={handleReset} className="text-xs tracking-widest uppercase font-bold text-neutral hover:text-negative transition-colors ml-2">
                ✕ {t.resetEngine}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* API Status Indicator */}
            {userApiKey && (
              <div className="hidden md:flex items-center gap-2 border border-accent/20 px-3 py-1 text-[10px] uppercase font-bold text-accent bg-accent/5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                User Key Active
              </div>
            )}

            {/* Dev Badge/Button */}
            {visitorId && (
              <div className="hidden lg:flex items-center gap-2 border border-border px-2 py-1 text-[8px] uppercase font-bold text-neutral opacity-50">
                ID: {visitorId.slice(0, 8)}...
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 border border-border px-3 py-1 text-xs">
                <div className="w-3 h-3 border border-border border-t-accent rounded-full animate-spin" />
                <span className="font-bold tracking-widest text-accent">{progress.toFixed(0)}%</span>
              </div>
            )}
            <div className="flex items-center border border-border overflow-hidden">
              {(["en", "vi"] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-colors ${lang === l ? "bg-accent text-background" : "text-neutral hover:text-foreground"}`}
                >{l === "vi" ? "VN" : "EN"}</button>
              ))}
            </div>
          </div>
        </div>
        {loading && <div className="absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />}
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-hidden">
        {!isWorkspace ? (
          <div className="h-[calc(100vh-56px)] flex items-center justify-center px-6 py-4 overflow-hidden">
            <div className="max-w-4xl w-full flex flex-col gap-5">

              {/* Header row */}
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black tracking-[0.25em] uppercase text-accent mb-1.5">ATS Resume Analyzer</div>
                  <h1 className="font-serif text-5xl font-black leading-tight tracking-tight">
                    {lang === "vi"
                      ? <><span style={{ color: "var(--accent)" }}>Phân tích CV</span> chuyên sâu.</>
                      : <><span style={{ color: "var(--accent)" }}>Analyze</span> your CV deeply.</>
                    }
                  </h1>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 pb-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral/50">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    {usageCount}/2 {lang === "vi" ? "lượt dùng" : "free scans"}
                  </div>
                  {userApiKey && (
                    <div className="flex items-center gap-1.5 border border-accent/30 px-2 py-1 text-[8px] uppercase tracking-widest font-bold text-accent bg-accent/5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                      Key Active
                    </div>
                  )}
                </div>
              </div>

              {/* Input grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Upload */}
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] uppercase tracking-widest font-black text-neutral">{t.step1}</div>
                  <div
                    className={`h-32 border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${dragActive ? "border-accent bg-accent/5" : file ? "border-accent/40 bg-accent/5" : "border-border border-dashed hover:border-neutral/50"}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={triggerFileUpload}
                  >
                    <div className="flex flex-col items-center gap-1.5 text-neutral text-center px-4">
                      {file ? (
                        <>
                          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          <span className="font-serif italic text-accent text-xs truncate max-w-[200px]">{file.name}</span>
                          <span className="text-[10px] text-neutral uppercase tracking-wider">{(file.size / 1024).toFixed(0)} KB · Click to change</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="1" d="M12 4v16m-8-8h16" /></svg>
                          <span className="text-xs font-light">{t.uploadPlaceholder}</span>
                          <span className="text-[10px] uppercase tracking-wider opacity-40">{t.maxCapacity}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* JD */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-widest font-black text-neutral">{t.step2}</div>
                    <span className="text-[10px] text-neutral/40">{jobDescription.length} {t.chars}</span>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    placeholder={t.jobPlaceholder}
                    className="h-32 p-3 bg-surface border border-border text-foreground placeholder:text-neutral/30 focus:outline-none focus:border-accent transition-colors resize-none font-light text-sm leading-relaxed"
                  />
                </div>
              </div>

              {/* API Key accordion */}
              <div className="border border-border bg-surface overflow-hidden">
                <button
                  onClick={() => setShowApiConfig(!showApiConfig)}
                  className="w-full px-5 py-2.5 flex items-center justify-between text-[10px] font-black tracking-widest uppercase hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${userApiKey ? "bg-accent animate-pulse" : "bg-neutral/30"}`} />
                    {userApiKey ? (lang === "vi" ? "API Key đang hoạt động" : "API Key Active") : t.showApiLabel}
                  </div>
                  <span className="opacity-30 font-light text-base leading-none">{showApiConfig ? "−" : "+"}</span>
                </button>
                {showApiConfig && (
                  <div className="px-5 py-3 border-t border-border bg-accent/5 flex gap-2 items-center">
                    <input
                      type="password"
                      value={userApiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                      placeholder="AIza..."
                      className="flex-1 bg-background border border-border px-3 py-1.5 text-[10px] text-foreground placeholder:text-neutral/30 focus:outline-none focus:border-accent font-mono"
                    />
                    <button
                      onClick={() => handleSaveApiKey("")}
                      className="px-3 py-1.5 border border-border text-[8px] font-black uppercase hover:bg-accent hover:text-background transition-colors"
                    >Clear</button>
                    <span className="text-[8px] text-neutral/40 italic hidden sm:block">Stored locally only</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className="group relative w-full h-12 border border-border hover:border-accent hover:bg-accent hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-xs font-black tracking-[0.2em] uppercase overflow-hidden"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t.processing}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {t.initiateScan}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  )}
                </button>
                {error && <p className="text-negative text-[10px] text-center tracking-wide">{error}</p>}
              </div>

            </div>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-56px)] overflow-hidden">
            <div className="w-[420px] flex-shrink-0 border-r border-border overflow-y-auto flex flex-col bg-background">
              {!hasResults ? (
                <div className="flex-1 p-8 flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-widest font-black text-accent">Active Version</div>
                      {!userApiKey && <span className="text-[10px] uppercase text-neutral">{usageCount}/2 Free</span>}
                    </div>
                    <div onClick={triggerFileUpload} className="flex items-center gap-3 p-4 border border-accent/20 bg-accent/5 hover:border-accent transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-serif italic text-accent truncate">{file?.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-neutral">Click to change</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-widest font-black text-neutral">Target JD</div>
                      <span className="text-[10px] text-neutral">{jobDescription.length} chars</span>
                    </div>
                    <textarea
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      placeholder={t.jobPlaceholder}
                      className="flex-1 w-full p-4 bg-surface border border-border text-foreground focus:outline-none focus:border-accent transition-colors resize-none font-light text-sm leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleSubmit} disabled={loading}
                    className="h-16 border border-accent bg-accent text-background text-xs font-black tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
                  >
                    {loading ? <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> : "START ANALYSIS →"}
                  </button>
                  {error && <p className="text-negative text-xs text-center">{error}</p>}
                </div>
              ) : (
                <>
                  <div className="px-8 py-8 border-b border-border bg-surface flex-shrink-0">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-black text-neutral mb-2">{t.overallMatch}</div>
                        <div className="font-serif text-7xl font-black leading-none" style={{ color: scoreColor }}>{result.rate}</div>
                      </div>
                      <svg width="72" height="72" viewBox="0 0 72 72">
                        <circle cx="36" cy="36" r="30" fill="none" stroke="var(--border)" strokeWidth="6" />
                        <circle cx="36" cy="36" r="30" fill="none" stroke={scoreColor} strokeWidth="6"
                          strokeDasharray={`${(scoreNum / 10) * 188.5} 188.5`}
                          strokeLinecap="round" transform="rotate(-90 36 36)" style={{ transition: "stroke-dasharray 1s ease" }}
                        />
                      </svg>
                    </div>
                    {result.general && <p className="mt-4 text-sm font-light text-neutral leading-relaxed border-t border-border pt-4">{result.general}</p>}
                  </div>

                  <div className="flex flex-col divide-y divide-border flex-1">
                    {result.strengths.length > 0 && (
                      <div className="px-6 py-5">
                        <button onClick={() => toggle("strengths")} className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-accent hover:opacity-80 transition-opacity mb-0">
                          <span>{t.keyStrengths}</span><span className="text-lg font-light">{open.strengths ? "-" : "+"}</span>
                        </button>
                        {open.strengths && (
                          <ul className="mt-4 flex flex-col gap-3">
                            {result.strengths.map((s, i) => (
                              <li key={i} className="flex gap-3 items-start">
                                <span className="text-accent text-[10px] uppercase font-black tracking-widest mt-0.5 mr-5 min-w-[28px]">{t.pos}</span>
                                <span className="text-sm font-light leading-relaxed text-foreground/80">{s}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {result.weaknesses.length > 0 && (
                      <div className="px-6 py-5">
                        <button onClick={() => toggle("weaknesses")} className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-negative hover:opacity-80 transition-opacity">
                          <span>{t.criticalGaps}</span><span className="text-lg font-light">{open.weaknesses ? "-" : "+"}</span>
                        </button>
                        {open.weaknesses && (
                          <ul className="mt-4 flex flex-col gap-3">
                            {result.weaknesses.map((w, i) => (
                              <li key={i} className="flex gap-3 items-start">
                                <span className="text-negative text-[10px] uppercase font-black tracking-widest mt-0.5 mr-5 min-w-[28px]">{t.neg}</span>
                                <span className="text-sm font-light leading-relaxed text-foreground/80">{w}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {result.improvements.length > 0 && (
                      <div className="px-6 py-5">
                        <button onClick={() => toggle("improvements")} className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-foreground hover:text-accent transition-colors">
                          <span>{t.strategicImprovements}</span><span className="text-lg font-light">{open.improvements ? "−" : "+"}</span>
                        </button>
                        {open.improvements && (
                          <div className="mt-4 flex flex-col gap-4">
                            {result.improvements.map((imp, i) => (
                              <div key={i} className="flex gap-3 items-start">
                                <span className="font-serif italic text-neutral text-xl leading-none min-w-[28px] mr-5">0{i + 1}</span>
                                <span className="text-sm font-light leading-relaxed text-foreground/80">{imp}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {(result.cvKeywords.length > 0 || result.missingKeywords.length > 0) && (
                      <div className="px-6 py-6 border-b border-border bg-accent/5">
                        <button onClick={() => toggle("keywords")} className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-foreground hover:text-accent transition-colors">
                          <div className="flex items-center gap-3">
                            <span>{t.keywordGapAnalysis}</span>
                            <span className="px-1.5 py-0.5 bg-accent text-background text-[8px] font-black">ATS OPTIMIZER</span>
                          </div>
                          <span className="text-lg font-light">{open.keywords ? "−" : "+"}</span>
                        </button>

                        {open.keywords && (
                          <div className="mt-6 flex flex-col gap-6">
                            {/* Match Progress */}
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral">
                                <span>{t.matchedPercentage}</span>
                                <span className="text-accent">{Math.round((result.cvKeywords.length / (result.cvKeywords.length + result.missingKeywords.length || 1)) * 100)}%</span>
                              </div>
                              <div className="h-1 bg-border w-full">
                                <div
                                  className="h-full bg-accent transition-all duration-1000"
                                  style={{ width: `${(result.cvKeywords.length / (result.cvKeywords.length + result.missingKeywords.length || 1)) * 100}%` }}
                                />
                              </div>
                            </div>

                            {/* Tags Grid */}
                            <div className="flex flex-wrap gap-2">
                              {result.cvKeywords.map((kw, i) => (
                                <span key={`hit-${i}`} className="px-2 py-1 bg-accent/10 border border-accent/30 text-accent text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5">
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                  {kw}
                                </span>
                              ))}
                              {result.missingKeywords.map((kw, i) => (
                                <span key={`miss-${i}`} className="px-2 py-1 bg-negative/5 border border-negative/20 text-negative/60 text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5">
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                  {kw}
                                </span>
                              ))}
                            </div>

                            {/* Optimization Tips */}
                            {result.keywordOptimizationTips.length > 0 && (
                              <div className="flex flex-col gap-3 mt-2">
                                <div className="text-[10px] uppercase tracking-widest text-neutral font-black border-b border-border pb-2">{t.optimizationTips}</div>
                                {result.keywordOptimizationTips.map((tip, i) => (
                                  <div key={i} className="flex gap-4 items-start group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 group-hover:scale-150 transition-transform" />
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-black text-accent uppercase tracking-wider">{tip.keyword}</span>
                                      <p className="text-xs font-light text-foreground/70 leading-relaxed">{tip.tip}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-6 border-b border-border bg-surface flex flex-col gap-3">
                    {/* Cover Letter Button */}
                    <button
                      onClick={handleGenerateCoverLetter}
                      disabled={isGeneratingCL}
                      className="w-full relative h-11 border border-border bg-background text-foreground text-[10px] font-black uppercase tracking-widest overflow-hidden disabled:opacity-50 transition-all hover:bg-accent hover:text-background hover:border-accent"
                    >
                      {isGeneratingCL && (
                        <div
                          className="absolute inset-y-0 left-0 bg-accent transition-all ease-linear pointer-events-none"
                          style={{ width: `${clProgress}%`, transitionDuration: "350ms" }}
                        />
                      )}
                      <span className="relative z-10">
                        {isGeneratingCL
                          ? t.clGenerating
                          : coverLetter
                            ? `📄 ${lang === "vi" ? "Xem lại Cover Letter" : "View Cover Letter"}`
                            : `📄 ${t.generateCL}`
                        }
                      </span>
                    </button>

                    {/* Interview Prep Button */}
                    <button
                      onClick={handleGenerateInterviewPrep}
                      disabled={isGeneratingInterview}
                      className="w-full relative h-11 border border-border bg-background text-foreground text-[10px] font-black uppercase tracking-widest overflow-hidden disabled:opacity-50 transition-all hover:bg-accent hover:text-background hover:border-accent"
                    >
                      {isGeneratingInterview && (
                        <div
                          className="absolute inset-y-0 left-0 bg-accent transition-all ease-linear pointer-events-none"
                          style={{ width: `${interviewProgress}%`, transitionDuration: "350ms" }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isGeneratingInterview ? (
                          t.predictingQuestions
                        ) : (
                          <>🎤 {interviewPrep.length > 0 ? (lang === 'vi' ? 'Xem câu hỏi phỏng vấn' : 'View Interview Prep') : t.prepareInterview}</>
                        )}
                      </span>
                    </button>
                  </div>

                  <div className="p-6 border-t border-border bg-accent/5 flex flex-col gap-2">

                    <button onClick={() => setShowLimitModal(true)} className="w-full py-2 border border-accent/20 text-[10px] uppercase font-black tracking-widest text-accent hover:bg-accent hover:text-background transition-all">
                      {userApiKey ? "⚙ MANAGE API KEY" : "⚙ CONFIGURE API KEY"}
                    </button>
                    <button onClick={() => setShowQr(true)} className="w-full py-2 border border-border text-[10px] uppercase font-black tracking-widest text-neutral hover:border-accent hover:text-accent transition-all">
                      ☕ ỦNG HỘ TÁC GIẢ
                    </button>
                  </div>

                  <div className="px-6 py-4 border-t border-border bg-surface flex-shrink-0">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-accent font-bold">{t.systemOnline}</span>
                      </div>
                      <span>© {new Date().getFullYear()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-black/50">
              <div className="flex-shrink-0 border-b border-border bg-surface px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest font-black text-accent">{t.liveAnnotator}</span>
                  <span className="text-border mx-1 opacity-40">·</span>
                  <span className="hidden sm:block text-[10px] text-neutral font-light italic">{t.hoverTip}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSubmit} disabled={loading} title={t.reScan}
                    className="px-3 py-1.5 border border-accent/20 bg-accent/5 text-accent text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-accent hover:text-background transition-all disabled:opacity-40"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span className="hidden lg:block">{t.reScan}</span>
                  </button>
                  <button
                    onClick={triggerFileUpload} title={t.uploadNew}
                    className="px-3 py-1.5 border border-border text-neutral text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:border-foreground hover:text-foreground transition-all"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="2.5" d="M12 4v16m-8-8h16" /></svg>
                    <span className="hidden lg:block">{t.uploadNew}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden px-4 pt-4">
                {fileUrl ? (
                  <Suspense fallback={<div className="h-full flex items-center justify-center text-neutral text-[10px] uppercase tracking-widest">{t.loadingAnnotator}</div>}>
                    <PdfAnnotator
                      fileUrl={fileUrl}
                      annotations={annotations}
                      t={t}
                      resumeText={resumeText}
                      jobDescription={jobDescription}
                      lang={lang}
                      userApiKey={userApiKey}
                    />
                  </Suspense>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral text-[10px] uppercase tracking-widest whitespace-pre text-center">
                    {"ANNOTATION LAYER INACTIVE\nUPLOAD PDF TO ACTIVATE"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Cover Letter — Full Page */}
      {/* Cover Letter Modal — Centered */}
      {showCLModal && (
        <div className="fixed inset-0 z-[110] bg-background/90 backdrop-blur-md flex items-center justify-center p-6 animate-entry">
          <div className="max-w-2xl w-full max-h-[85vh] bg-background border border-border flex flex-col shadow-2xl relative">

            {/* Top bar */}
            <div className="flex-shrink-0 border-b border-border px-6 py-4 flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-accent text-background flex items-center justify-center font-black text-xs tracking-widest">CL</div>
                <h3 className="font-serif font-black text-xl tracking-tight uppercase">{t.clTitle}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetter);
                    showToast(t.toastCopied);
                  }}
                  className="px-4 py-2 bg-accent text-background text-[10px] font-black uppercase tracking-widest hover:opacity-85 transition-all flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  {t.copyCL}
                </button>
                <button
                  onClick={() => setShowCLModal(false)}
                  className="w-9 h-9 border border-border flex items-center justify-center text-neutral hover:text-negative hover:border-negative/40 transition-all text-sm"
                >✕</button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                spellCheck={false}
                className="w-full min-h-[400px] h-full bg-transparent text-foreground font-light text-[15px] leading-[1.8] tracking-[0.01em] border-0 focus:ring-0 focus:outline-none resize-none"
                style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
              />
            </div>

            {/* Bottom bar */}
            <div className="flex-shrink-0 border-t border-border px-6 py-3 flex items-center justify-between bg-surface/30">
              <span className="text-[8px] uppercase tracking-widest text-neutral/40">
                {coverLetter.split(/\s+/).filter(Boolean).length} words · {coverLetter.length} chars
              </span>
              <button onClick={() => setShowCLModal(false)} className="text-[10px] uppercase tracking-widest font-black text-neutral hover:text-foreground transition-colors">
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Interview Prep Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-[110] bg-background/90 backdrop-blur-md flex items-center justify-center p-6 animate-entry">
          <div className="max-w-3xl w-full max-h-[85vh] bg-background border border-border flex flex-col shadow-2xl relative">

            {/* Top bar */}
            <div className="flex-shrink-0 border-b border-border px-6 py-4 flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-accent text-background flex items-center justify-center font-black text-xs tracking-widest">QA</div>
                <h3 className="font-serif font-black text-xl tracking-tight uppercase">{t.interviewTitle}</h3>
              </div>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="w-9 h-9 border border-border flex items-center justify-center text-neutral hover:text-negative hover:border-negative/40 transition-all text-sm"
              >✕</button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-surface/10">
              <div className="flex flex-col gap-10">
                {interviewPrep.map((item, i) => (
                  <div key={i} className="flex flex-col gap-4 group">
                    <div className="flex gap-4 items-start">
                      <span className="w-8 h-8 rounded-full border border-accent/30 flex items-center justify-center text-accent text-[10px] font-black flex-shrink-0 mt-1">
                        0{i + 1}
                      </span>
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] uppercase tracking-widest font-black text-accent/60">{t.rationale}</div>
                        <p className="text-[11px] text-neutral italic font-light leading-relaxed">{item.rationale}</p>
                        <h4 className="text-lg font-serif font-black leading-snug text-foreground mt-1">{item.question}</h4>
                      </div>
                    </div>
                    <div className="ml-12 p-5 bg-accent/5 border-l-2 border-accent flex flex-col gap-2">
                      <div className="text-[10px] uppercase tracking-widest font-black text-accent">{t.answer}</div>
                      <p className="text-sm font-light text-foreground/80 leading-[1.7]">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex-shrink-0 border-t border-border px-6 py-4 flex items-center justify-between bg-surface/30">
              <button
                onClick={handleExportExcel}
                className="text-[10px] uppercase tracking-widest font-black text-accent border border-accent/20 px-4 py-2 hover:bg-accent hover:text-background transition-all flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {t.exportExcel}
              </button>
              <button onClick={() => setShowInterviewModal(false)} className="text-[10px] uppercase tracking-widest font-black text-neutral hover:text-foreground transition-colors px-4 py-1">
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-foreground text-background px-6 py-3 text-[10px] font-black uppercase tracking-widest border border-accent shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] animate-entry">
          {toast}
        </div>
      )}
    </div>
  );
}

