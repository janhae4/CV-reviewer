"use client";
import { motion } from "motion/react";
import { FiArrowLeft, FiX, FiClock, FiSettings } from "react-icons/fi";
import Link from "next/link";
import { Language } from "../lib/translations";

interface TopNavProps {
  lang: Language;
  setLang: (lang: Language) => void;
  isWorkspace: boolean;
  onReset: () => void;
  onShowHistory: () => void;
  historyCount: number;
  loading: boolean;
  progress: number;
  userApiKey: boolean;
  visitorId: string;
  t: any;
}

export default function TopNav({
  lang, setLang, isWorkspace, onReset, onShowHistory, historyCount,
  loading, progress, userApiKey, visitorId, t
}: TopNavProps) {
  return (
    <header className="flex-shrink-0 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-neutral hover:text-foreground transition-colors text-xs tracking-widest uppercase font-bold flex items-center gap-2">
            <FiArrowLeft /> Home
          </Link>
          <span className="text-border">|</span>
          <span className="font-serif font-black text-sm tracking-wide text-foreground">RESUME ENGINE</span>
          {isWorkspace && (
            <button onClick={onReset} className="text-xs tracking-widest uppercase font-bold text-neutral hover:text-negative transition-colors ml-2 flex items-center gap-1.5">
              <FiX /> {t.resetEngine}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {userApiKey && (
            <div className="hidden md:flex items-center gap-2 border border-accent/20 px-3 py-1 text-[10px] uppercase font-bold text-accent bg-accent/5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              User Key Active
            </div>
          )}

          {visitorId && (
            <div className="hidden lg:flex items-center gap-2 border border-border px-2 py-1 text-[8px] uppercase font-bold text-neutral opacity-50">
              ID: {visitorId.slice(0, 8)}...
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 border border-border px-3 py-1 text-xs">
              <div className="w-3 h-3 border border-border border-t-accent rounded-full animate-spin" />
              <span className="font-bold tracking-widest text-accent text-sm">{progress.toFixed(0)}%</span>
            </div>
          )}

          <button
            onClick={onShowHistory}
            className="w-10 h-8 border border-border text-neutral hover:border-accent hover:text-accent transition-all flex items-center justify-center relative"
          >
            <FiClock className="text-sm" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent text-background text-[7px] font-black rounded-full flex items-center justify-center border border-background">
                {historyCount}
              </span>
            )}
          </button>

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
  );
}
