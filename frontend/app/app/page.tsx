"use client";
import { useState, lazy, Suspense, useRef, useEffect, useReducer } from "react";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from "motion/react";
import { FiRefreshCw, FiFilePlus, FiEdit3, FiFileText, FiDownload, FiMoreHorizontal, FiSettings, FiCoffee, FiMic } from "react-icons/fi";

// Components
import TopNav from "@/components/TopNav";
import ScanForm from "@/components/ScanForm";
import ApiConfigModal from "@/components/ApiConfigModal";
import SupportQrModal from "@/components/SupportQrModal";
import CareerAssistant from "@/components/CareerAssistant";
import AnalysisReport from "@/components/report/AnalysisReport";
import ReportHistory from "@/components/report/ReportHistory";
import ActionButtons from "@/components/report/ActionButtons";

// Hooks
import { useCVAnalysis } from "@/hooks/useCVAnalysis";
import { useAIContent } from "@/hooks/useAIContent";

// Types/Lib
import { translations, Language } from "@/lib/translations";
import { AnalysisResult, HistoryEntry } from "@/types/resume";
import { saveFileToDB, getFileFromDB, deleteFileFromDB, clearAllFromDB } from "@/lib/db";



const PdfAnnotator = lazy(() => import("@/components/PdfAnnotator"));

// UI State Reducer
type UIState = {
  showLimitModal: boolean;
  showQr: boolean;
  showHistoryModal: boolean;
  showCLModal: boolean;
  showInterviewModal: boolean;
  showApiConfig: boolean;
  showMoreMenu: boolean;
  isWorkspace: boolean;
};

type UIAction =
  | { type: 'TOGGLE_MODAL'; modal: keyof UIState }
  | { type: 'SET_MODAL'; modal: keyof UIState; value: boolean }
  | { type: 'CLOSE_ALL' };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_MODAL':
      return { ...state, [action.modal]: !state[action.modal] };
    case 'SET_MODAL':
      return { ...state, [action.modal]: action.value };
    case 'CLOSE_ALL':
      return { ...state, showLimitModal: false, showQr: false, showHistoryModal: false, showCLModal: false, showInterviewModal: false, showMoreMenu: false };
    default:
      return state;
  }
}

export default function AppPage() {
  // Input State
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [lang, setLang] = useState<Language>("vi");
  const [dragActive, setDragActive] = useState(false);

  // Persistent State
  const [usageCount, setUsageCount] = useState(0);
  const [userApiKey, setUserApiKey] = useState("");
  const [visitorId, setVisitorId] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [toast, setToast] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // UI State
  const [ui, dispatch] = useReducer(uiReducer, {
    showLimitModal: false, showQr: false, showHistoryModal: false,
    showCLModal: false, showInterviewModal: false, showApiConfig: false,
    showMoreMenu: false, isWorkspace: false
  });

  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logic Hooks
  const {
    loading, progress, error, result, annotations, resumeText,
    analyze, resetAnalysis, restoreAnalysis, setResumeText
  } = useCVAnalysis({
    lang, visitorId, userApiKey,
    onSuccess: (res: AnalysisResult, f: File | null) => {
      if (!userApiKey) {
        const nextCount = usageCount + 1;
        setUsageCount(nextCount);
        localStorage.setItem("resume_usage_count", nextCount.toString());
      }
      saveToHistory(res, f);
      dispatch({ type: 'SET_MODAL', modal: 'isWorkspace', value: true });
    }
  });

  const {
    coverLetter, setCoverLetter, isGeneratingCL, clProgress, generateCoverLetter,
    interviewPrep, setInterviewPrep, isGeneratingInterview, interviewProgress, generateInterviewPrep,
    resetAIContent
  } = useAIContent({ resumeText, jobDescription, lang, userApiKey });

  // Effects
  useEffect(() => {
    setUsageCount(Number(localStorage.getItem("resume_usage_count") || 0));
    setUserApiKey(localStorage.getItem("resume_user_api_key") || "");
    try { setHistory(JSON.parse(localStorage.getItem("resume_history") || "[]")); } catch (e) { }

    FingerprintJS.load().then(fp => fp.get()).then(res => setVisitorId(res.visitorId));
  }, []);

  // Handlers
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem("resume_user_api_key", key);
    dispatch({ type: 'SET_MODAL', modal: 'showLimitModal', value: false });
    showToast(lang === "vi" ? "Đã lưu API Key" : "API Key Saved");
  };

  const saveToHistory = async (res: any, f: File | null) => {
    const id = Date.now().toString();
    const entry: HistoryEntry = {
      id: id,
      timestamp: new Date().toISOString(),
      cvName: f ? f.name : "Text Analysis",
      score: res.rate,
      result: res,
      annotations: res.annotations || [],
      resumeText: res.extractedText || resumeText,
      jobDescription,
      lang
    };

    if (f) {
      await saveFileToDB(id, f);
    }

    const newHistory = [entry, ...history.slice(0, 9)];
    setHistory(newHistory);
    localStorage.setItem("resume_history", JSON.stringify(newHistory));
    setCurrentId(id);
  };

  const updateHistoryContent = (id: string, updates: Partial<HistoryEntry>) => {
    setHistory(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, ...updates } : h);
      localStorage.setItem("resume_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRestoreHistory = async (entry: HistoryEntry) => {
    restoreAnalysis(entry);
    setJobDescription(entry.jobDescription);
    setLang(entry.lang as Language);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    
    // Attempt to restore PDF file from IndexedDB
    const storedFile = await getFileFromDB(entry.id);
    if (storedFile) {
      setFile(storedFile);
      setFileUrl(URL.createObjectURL(storedFile));
    } else {
      setFile(null);
      setFileUrl(null);
    }

    setCoverLetter(entry.coverLetter || "");
    setInterviewPrep(entry.interviewPrep || []);
    setCurrentId(entry.id);

    dispatch({ type: 'SET_MODAL', modal: 'isWorkspace', value: true });
    dispatch({ type: 'SET_MODAL', modal: 'showHistoryModal', value: false });
    showToast(
      storedFile 
        ? (lang === "vi" ? "Đã khôi phục lịch sử & PDF" : "History & PDF Restored")
        : (lang === "vi" ? "Đã khôi phục lịch sử (Không tìm thấy PDF)" : "History Restored (PDF not found)")
    );
  };

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(f);
    setFileUrl(f.type === "application/pdf" ? URL.createObjectURL(f) : null);
    if (ui.isWorkspace) { resetAnalysis(); resetAIContent(); setCurrentId(null); }
  };

  const onHandleSubmit = (opts = {}) => {
    if (usageCount >= 2 && !userApiKey) { dispatch({ type: 'SET_MODAL', modal: 'showLimitModal', value: true }); return; }
    analyze(file, jobDescription, opts);
    dispatch({ type: 'SET_MODAL', modal: 'showMoreMenu', value: false });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { ReportPDF } = await import("@/components/report/ReportPDF");

      const blob = await pdf(<ReportPDF result={result} lang={lang} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_Analysis_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      showToast("High Quality PDF Exported!");
    } catch (e) {
      console.error(e);
      showToast("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(interviewPrep.map((it: any, i: number) => ({
      'No.': i + 1, 'Question': it.question, 'Rationale': it.rationale, 'Answer': it.answer
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Interview Prep");
    XLSX.writeFile(wb, `InterviewPrep_${Date.now()}.xlsx`);
  };

  const hasResults = result.general !== "" || result.strengths.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <input type="file" ref={fileInputRef} onChange={e => handleFileChange(e.target.files?.[0] ?? null)} className="hidden" accept="application/pdf" />

      <TopNav
        lang={lang} setLang={setLang} isWorkspace={ui.isWorkspace}
        onReset={() => { 
          resetAnalysis(); 
          resetAIContent(); 
          setFile(null); 
          if (fileUrl) URL.revokeObjectURL(fileUrl);
          setFileUrl(null); 
          setCurrentId(null);
          dispatch({ type: 'SET_MODAL', modal: 'isWorkspace', value: false }); 
        }}
        onShowHistory={() => dispatch({ type: 'SET_MODAL', modal: 'showHistoryModal', value: true })}
        historyCount={history.length} loading={loading} progress={progress}
        userApiKey={!!userApiKey} visitorId={visitorId} t={t}
      />

      <main className="flex-1 overflow-hidden">
        {!ui.isWorkspace ? (
          <div className="h-[calc(100vh-56px)] flex items-center justify-center px-6 py-4">
            <ScanForm
              lang={lang} t={t} usageCount={usageCount} userApiKey={userApiKey}
              file={file} dragActive={dragActive} jobDescription={jobDescription}
              loading={loading} error={error} showApiConfig={ui.showApiConfig}
              onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setDragActive(false); handleFileChange(e.dataTransfer.files?.[0] ?? null); }}
              onClickUpload={() => fileInputRef.current?.click()}
              onJobDescriptionChange={setJobDescription}
              onToggleApiConfig={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'showApiConfig' })}
              onApiKeyChange={(key) => { setUserApiKey(key); localStorage.setItem("resume_user_api_key", key); }}
              onClearApiKey={() => handleSaveApiKey("")}
              onSubmit={onHandleSubmit}
            />
          </div>
        ) : (
          <div className="flex h-[calc(100vh-56px)] overflow-hidden">
            <div className="w-[60%] flex-shrink-0 border-r border-border overflow-y-auto flex flex-col bg-background custom-scrollbar">
              {!hasResults ? (
                <div className="flex-1 p-8 flex flex-col gap-10">
                  <div className="flex flex-col gap-3">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-black text-accent">{t.activeVersion}</div>
                    <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 p-5 border border-accent/20 bg-accent/5 hover:border-accent transition-all cursor-pointer text-foreground group shadow-lg">
                      <FiFileText className="text-accent text-2xl group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-serif italic text-accent truncate">{file?.name}</div>
                        <div className="text-[9px] uppercase tracking-[0.3em] text-neutral opacity-40">{t.clickToChange}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-black text-neutral opacity-50">{t.targetJD}</div>
                    <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder={t.jobPlaceholder} className="flex-1 w-full p-6 bg-surface border border-border text-foreground focus:outline-none focus:border-accent resize-none font-light text-sm shadow-inner" />
                  </div>
                  <button onClick={onHandleSubmit} disabled={loading} className="h-20 border border-accent bg-accent text-background text-xs font-black tracking-[0.5em] uppercase hover:opacity-90 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                    {loading ? <FiRefreshCw className="animate-spin text-lg" /> : t.startAnalysis}
                  </button>
                </div>
              ) : (
                <>
                  <AnalysisReport result={result} t={t} lang={lang} />
                  <ActionButtons
                    onGenerateCL={async () => { 
                      dispatch({ type: 'SET_MODAL', modal: 'showCLModal', value: true });
                      if (!coverLetter && !isGeneratingCL) {
                        const cl = await generateCoverLetter();
                        if (cl && currentId) updateHistoryContent(currentId, { coverLetter: cl });
                        showToast(t.toastCLSuccess);
                      }
                    }} 
                    isGeneratingCL={isGeneratingCL} clProgress={clProgress} hasCL={!!coverLetter}
                    onGenerateInterview={async () => { 
                      dispatch({ type: 'SET_MODAL', modal: 'showInterviewModal', value: true });
                      if (interviewPrep.length === 0 && !isGeneratingInterview) {
                        const prep = await generateInterviewPrep();
                        if (prep && currentId) updateHistoryContent(currentId, { interviewPrep: prep });
                        showToast(t.toastInterviewSuccess);
                      }
                    }} 
                    isGeneratingInterview={isGeneratingInterview} interviewProgress={interviewProgress} hasInterview={interviewPrep.length > 0}
                    t={t} lang={lang}
                  />
                  <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-center gap-8">
                    <button onClick={() => dispatch({ type: 'SET_MODAL', modal: 'showLimitModal', value: true })} className="text-[9px] uppercase font-black tracking-[0.3em] overflow-hidden whitespace-nowrap text-accent/60 hover:text-accent transition-colors flex items-center gap-2">
                      <FiSettings /> {(usageCount >= 2 && !userApiKey) ? t.configAppLimit : t.configAppNormal}
                    </button>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <button onClick={() => dispatch({ type: 'SET_MODAL', modal: 'showQr', value: true })} className="text-[9px] uppercase font-black tracking-[0.3em] text-neutral/40 hover:text-neutral transition-colors flex items-center gap-2">
                      <FiCoffee /> {t.support}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-black/50">
              <div className="flex-shrink-0 border-b border-border bg-surface px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest font-black text-accent">{t.liveAnnotator}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportPDF} disabled={isExporting} className="h-8 border border-border bg-surface px-4 hover:border-accent hover:text-accent transition-all flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase">{isExporting ? <FiRefreshCw className="animate-spin" /> : <FiDownload />} PDF</button>
                  <button onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'showMoreMenu' })} className="h-8 border border-border bg-surface px-2 hover:border-accent hover:text-accent transition-all relative">
                    <FiMoreHorizontal className={`text-sm transition-transform ${ui.showMoreMenu ? 'rotate-90' : ''}`} />
                    <AnimatePresence>
                      {ui.showMoreMenu && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border shadow-2xl z-50 flex flex-col overflow-hidden">
                          <button onClick={() => { dispatch({ type: 'SET_MODAL', modal: 'showMoreMenu', value: false }); fileInputRef.current?.click(); }} className="w-full text-left px-4 py-4 hover:bg-accent hover:text-background text-[9px] font-black uppercase tracking-[0.2em] border-b border-border flex justify-between items-center text-foreground transition-colors group">
                            {lang === 'vi' ? 'Cập nhật CV' : 'Update CV'}
                            <FiFilePlus className="group-hover:scale-110 transition-transform" />
                          </button>
                          <button onClick={() => { dispatch({ type: 'SET_MODAL', modal: 'showMoreMenu', value: false }); dispatch({ type: 'SET_MODAL', modal: 'isWorkspace', value: false }); }} className="w-full text-left px-4 py-4 hover:bg-accent hover:text-background text-[9px] font-black uppercase tracking-[0.2em] flex justify-between items-center text-foreground transition-colors group">
                            {lang === 'vi' ? 'Thay đổi JD' : 'Change JD'}
                            <FiEdit3 className="group-hover:scale-110 transition-transform" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                  <button onClick={() => onHandleSubmit({ force: true })} disabled={loading} className="h-8 px-5 border border-accent bg-accent text-background text-[9px] font-black tracking-[0.2em] uppercase flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95">
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} /> {t.reScan}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-4">
                {fileUrl ? (
                  <Suspense fallback={<div className="h-full flex items-center justify-center text-[10px] font-black tracking-widest opacity-20">LOADER...</div>}>
                    <PdfAnnotator fileUrl={fileUrl} annotations={annotations} t={t} resumeText={resumeText} jobDescription={jobDescription} lang={lang} userApiKey={userApiKey} />
                  </Suspense>
                ) : (
                  <div className="h-full flex items-center justify-center text-[10px] font-black tracking-widest opacity-20 text-center">PREVIEW INACTIVE</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ApiConfigModal show={ui.showLimitModal} onClose={() => dispatch({ type: 'SET_MODAL', modal: 'showLimitModal', value: false })} userApiKey={userApiKey} setUserApiKey={setUserApiKey} onSave={handleSaveApiKey} t={t} />
      <SupportQrModal show={ui.showQr} onClose={() => dispatch({ type: 'SET_MODAL', modal: 'showQr', value: false })} />
      <ReportHistory 
        show={ui.showHistoryModal} 
        onClose={() => dispatch({ type: 'SET_MODAL', modal: 'showHistoryModal', value: false })} 
        history={history} 
        onRestore={handleRestoreHistory} 
        onDelete={async (id) => { 
          const n = history.filter(h => h.id !== id); 
          setHistory(n); 
          localStorage.setItem("resume_history", JSON.stringify(n)); 
          await deleteFileFromDB(id);
        }} 
        onClearAll={async () => {
          setHistory([]);
          localStorage.removeItem("resume_history");
          await clearAllFromDB();
          showToast(lang === "vi" ? "Đã xóa toàn bộ lịch sử" : "All History Cleared");
        }}
      />

      {ui.isWorkspace && <CareerAssistant resumeText={resumeText} jobDescription={jobDescription} lang={lang} userApiKey={userApiKey} t={t} />}

      {/* CL Modal */}
      <AnimatePresence>
        {ui.showCLModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-background/90 backdrop-blur-md flex items-center justify-center p-6 text-foreground">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="max-w-3xl w-full max-h-[85vh] bg-background border border-border flex flex-col shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-border bg-surface flex items-center justify-between">
                <h3 className="font-serif font-black text-xl uppercase tracking-tight">{t.clTitle}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      const cl = await generateCoverLetter();
                      if (cl && currentId) updateHistoryContent(currentId, { coverLetter: cl });
                      showToast(t.toastCLSuccess);
                    }}
                    disabled={isGeneratingCL}
                    className="h-9 border border-accent/20 bg-surface px-4 hover:bg-accent hover:text-background transition-all flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase disabled:opacity-30"
                  >
                    <FiRefreshCw className={isGeneratingCL ? 'animate-spin' : ''} /> {lang === 'vi' ? 'TẠO LẠI' : 'REGENERATE'}
                  </button>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(coverLetter); showToast(t.toastCopied); }} 
                    disabled={isGeneratingCL || !coverLetter} 
                    className="h-9 border border-border bg-surface px-4 hover:border-accent hover:bg-accent hover:text-black transition-all flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase disabled:opacity-30"
                  >
                    {lang === 'vi' ? 'SAO CHÉP' : 'COPY'}
                  </button>
                  <button onClick={() => dispatch({ type: 'SET_MODAL', modal: 'showCLModal', value: false })} className="px-3 py-2 border border-border text-neutral hover:text-negative ml-2">✕</button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden p-10 custom-scrollbar">
                {isGeneratingCL ? (
                  <div className="flex flex-col gap-6">
                    <div className="h-8 w-1/3 animate-shimmer rounded-sm" />
                    <div className="h-4 w-full animate-shimmer rounded-sm" />
                    <div className="h-4 w-[95%] animate-shimmer rounded-sm" />
                    <div className="h-4 w-[98%] animate-shimmer rounded-sm" />
                    <div className="h-4 w-full animate-shimmer rounded-sm mt-4" />
                    <div className="h-4 w-[92%] animate-shimmer rounded-sm" />
                    <div className="h-4 w-[96%] animate-shimmer rounded-sm" />
                    <div className="h-4 w-full animate-shimmer rounded-sm mt-4" />
                    <div className="h-4 w-[85%] animate-shimmer rounded-sm" />
                  </div>
                ) : !coverLetter ? (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-6 border-2 border-dashed border-border rounded-xl">
                    <FiFileText className="text-6xl text-neutral opacity-20" />
                    <div className="text-center">
                      <p className="text-neutral mb-4 uppercase tracking-[0.2em] font-black text-xs">{lang === 'vi' ? 'Chưa có nội dung Cover Letter' : 'No Cover Letter generated yet'}</p>
                      <button 
                        onClick={async () => {
                          const cl = await generateCoverLetter();
                          if (cl && currentId) updateHistoryContent(currentId, { coverLetter: cl });
                          showToast(t.toastCLSuccess);
                        }}
                        className="px-10 py-4 bg-accent text-background font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                      >
                        {t.generateCL}
                      </button>
                    </div>
                  </div>
                ) : (
                  <textarea 
                    value={coverLetter} 
                    onChange={e => {
                      const val = e.target.value;
                      setCoverLetter(val);
                      if (currentId) updateHistoryContent(currentId, { coverLetter: val });
                    }} 
                    className="w-full h-full min-h-[500px] overflow-y-auto bg-transparent text-foreground font-light text-[17px] leading-relaxed resize-none focus:outline-none custom-scrollbar" 
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interview Modal */}
      <AnimatePresence>
        {ui.showInterviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-background/90 backdrop-blur-md flex items-center justify-center p-6 text-foreground">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="max-w-3xl w-full max-h-[85vh] bg-background border border-border flex flex-col shadow-2xl">
              <div className="p-6 border-b border-border bg-surface flex items-center justify-between">
                <h3 className="font-serif font-black text-xl uppercase tracking-tight">{t.interviewTitle}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportExcel} disabled={isGeneratingInterview || interviewPrep.length === 0} className="h-9 border border-accent/20 bg-surface px-4 hover:bg-accent hover:text-background transition-all flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase disabled:opacity-30">{lang === 'vi' ? 'Xuất Excel' : 'Excel'}</button>
                  <button 
                    onClick={async () => {
                      const prep = await generateInterviewPrep();
                      if (prep && currentId) updateHistoryContent(currentId, { interviewPrep: prep });
                      showToast(t.toastInterviewSuccess);
                    }}
                    disabled={isGeneratingInterview}
                    className="h-9 border border-positive/20 bg-surface px-4 hover:bg-positive hover:text-black transition-all flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase disabled:opacity-30"
                  >
                    <FiRefreshCw className={isGeneratingInterview ? 'animate-spin' : ''} /> {lang === 'vi' ? 'TẠO LẠI' : 'REGENERATE'}
                  </button>
                  <button onClick={() => dispatch({ type: 'SET_MODAL', modal: 'showInterviewModal', value: false })} className="px-3 py-2 border border-border text-neutral hover:text-negative ml-2">✕</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {isGeneratingInterview ? (
                  <div className="flex flex-col gap-10">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex flex-col gap-4">
                        <div className="flex gap-4 items-start">
                          <div className="w-7 h-7 bg-border animate-pulse shrink-0" />
                          <div className="flex-1 flex flex-col gap-2">
                             <div className="h-2 w-16 animate-shimmer" />
                             <div className="h-5 w-full animate-shimmer" />
                          </div>
                        </div>
                        <div className="ml-11 h-20 bg-border/20 animate-shimmer" />
                      </div>
                    ))}
                  </div>
                ) : interviewPrep.length === 0 ? (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-6 border-2 border-dashed border-border rounded-xl">
                    <FiMic className="text-6xl text-neutral opacity-20" />
                    <div className="text-center">
                      <p className="text-neutral mb-4 uppercase tracking-[0.2em] font-black text-xs">{lang === 'vi' ? 'Chưa có bộ câu hỏi phỏng vấn' : 'No interview questions generated yet'}</p>
                      <button 
                        onClick={async () => {
                          const prep = await generateInterviewPrep();
                          if (prep && currentId) updateHistoryContent(currentId, { interviewPrep: prep });
                          showToast(t.toastInterviewSuccess);
                        }}
                        className="px-10 py-4 bg-positive text-background font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                      >
                        {t.prepareInterview}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-10">
                    {interviewPrep.map((item, i) => (
                      <div key={i} className="flex flex-col gap-4">
                        <div className="flex gap-4 items-start">
                          <span className="w-7 h-7 flex-shrink-0 bg-accent text-background flex items-center justify-center text-[10px] font-black">0{i + 1}</span>
                          <div>
                            <div className="text-[9px] font-black uppercase text-accent/60 mb-1">{t.rationale}</div>
                            <p className="text-[11px] text-neutral italic mb-2">{item.rationale}</p>
                            <h4 className="text-lg font-serif font-black text-foreground leading-tight">{item.question}</h4>
                          </div>
                        </div>
                        <div className="ml-11 p-5 bg-accent/5 border-l border-accent">
                          <div className="text-[9px] font-black uppercase text-accent mb-2">{t.answer}</div>
                          <p className="text-sm font-light text-foreground/80 leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-border bg-surface flex justify-end">
                <button onClick={() => dispatch({ type: 'SET_MODAL', modal: 'showInterviewModal', value: false })} className="text-[10px] font-black uppercase text-neutral hover:text-foreground transition-colors">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && (
        <motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }} className="fixed bottom-10 left-1/2 z-[300] bg-foreground text-background px-6 py-3 text-[10px] font-black uppercase tracking-widest border border-accent shadow-[0_0_30px_rgba(225,255,1,0.3)]">{toast}</motion.div>
      )}</AnimatePresence>
    </div>
  );
}
