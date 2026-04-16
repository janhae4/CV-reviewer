"use client";
import { motion, AnimatePresence } from "motion/react";
import { FiRefreshCw, FiZap } from "react-icons/fi";
import { Language } from "../lib/translations";

interface ScanFormProps {
  lang: Language;
  t: any;
  usageCount: number;
  userApiKey: string;
  file: File | null;
  dragActive: boolean;
  jobDescription: string;
  loading: boolean;
  error: string;
  showApiConfig: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClickUpload: () => void;
  onJobDescriptionChange: (val: string) => void;
  onToggleApiConfig: () => void;
  onApiKeyChange: (val: string) => void;
  onClearApiKey: () => void;
  onSubmit: () => void;
}

export default function ScanForm({
  lang, t, usageCount, userApiKey, file, dragActive, jobDescription, loading, error, showApiConfig,
  onDragEnter, onDragLeave, onDragOver, onDrop, onClickUpload, onJobDescriptionChange,
  onToggleApiConfig, onApiKeyChange, onClearApiKey, onSubmit
}: ScanFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full flex flex-col gap-5"
    >
      {/* Header row */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black tracking-[0.25em] uppercase text-accent mb-1.5">ATS Resume Analyzer</div>
          <h1 className="font-serif text-5xl font-black leading-tight tracking-tight text-foreground">
            {lang === "vi"
              ? <><span className="text-accent">Phân tích CV</span> chuyên sâu.</>
              : <><span className="text-accent">Analyze</span> your CV deeply.</>
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
          <motion.div
            whileHover={{ scale: 1.01, borderColor: "var(--accent)" }}
            whileTap={{ scale: 0.99 }}
            className={`h-32 border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${dragActive ? "border-accent bg-accent/5" : file ? "border-accent/40 bg-accent/5" : "border-border border-dashed hover:border-neutral/50"}`}
            onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
            onClick={onClickUpload}
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
          </motion.div>
        </div>

        {/* JD */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-widest font-black text-neutral">{t.step2}</div>
            <span className="text-[10px] text-neutral/40">{jobDescription.length} {t.chars}</span>
          </div>
          <textarea
            value={jobDescription}
            onChange={e => onJobDescriptionChange(e.target.value)}
            placeholder={t.jobPlaceholder}
            className="h-32 p-3 bg-surface border border-border text-foreground placeholder:text-neutral/30 focus:outline-none focus:border-accent transition-colors resize-none font-light text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* API Key accordion */}
      <div className="border border-border bg-surface overflow-hidden">
        <button
          onClick={onToggleApiConfig}
          className="w-full px-5 py-2.5 flex items-center justify-between text-[10px] font-black tracking-widest uppercase hover:bg-accent/5 transition-colors text-foreground"
        >
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${userApiKey ? "bg-accent animate-pulse" : "bg-neutral/30"}`} />
            {userApiKey ? (lang === "vi" ? "API Key đang hoạt động" : "API Key Active") : t.showApiLabel}
          </div>
          <motion.span
            animate={{ rotate: showApiConfig ? 180 : 0 }}
            className="opacity-30 font-light text-base leading-none"
          >{showApiConfig ? "−" : "+"}</motion.span>
        </button>
        <AnimatePresence>
          {showApiConfig && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 py-3 border-t border-border bg-accent/5 flex gap-2 items-center"
            >
              <input
                type="password"
                value={userApiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="AIza..."
                className="flex-1 bg-background border border-border px-3 py-1.5 text-[10px] text-foreground placeholder:text-neutral/30 focus:outline-none focus:border-accent font-mono"
              />
              <button
                onClick={onClearApiKey}
                className="px-3 py-1.5 border border-border text-[8px] font-black uppercase hover:bg-accent hover:text-background transition-colors text-foreground"
              >Clear</button>
              <span className="text-[8px] text-neutral/40 italic hidden sm:block">Stored locally only</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onSubmit}
          disabled={loading || !file}
          className="group relative w-full h-12 border border-border hover:border-accent hover:bg-accent hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-xs font-black tracking-[0.2em] uppercase overflow-hidden text-foreground"
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
    </motion.div>
  );
}
