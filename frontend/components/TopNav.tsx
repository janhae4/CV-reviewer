"use client";
import { motion } from "motion/react";
import { FiArrowLeft, FiX, FiClock, FiHome, FiZap } from "react-icons/fi";
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
  backHref?: string; // Fixed destination for back button, avoids browser history loops
}

export default function TopNav({
  lang, setLang, isWorkspace, onReset, onShowHistory, historyCount,
  loading, progress, userApiKey, visitorId, t, backHref = "/"
}: TopNavProps) {
  return (
    <header className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-12 flex items-center justify-between gap-4">

        {/* LEFT: Brand + Nav */}
        <div className="flex items-center gap-0 min-w-0">
          {/* Brand */}
          <div className="flex items-center gap-2 pr-4 border-r border-border/40">
            <div className="w-5 h-5 bg-accent flex items-center justify-center shrink-0">
              <FiZap className="text-background text-[10px]" />
            </div>
            <span className="font-serif font-black text-[11px] tracking-widest text-foreground uppercase whitespace-nowrap">
              Resume<span className="text-accent">·</span>Core
            </span>
          </div>

          {/* Back */}
          <Link
            href={backHref}
            className="ml-4 flex items-center gap-1.5 text-neutral/50 hover:text-foreground transition-colors text-[10px] font-black uppercase tracking-[0.15em] group"
          >
            <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform text-xs shrink-0" />
            <span className="hidden sm:inline">{t.back || "Back"}</span>
          </Link>

          {/* Home icon */}
          <Link
            href="/"
            className="ml-3 w-7 h-7 border border-border/30 text-neutral/40 hover:border-accent hover:text-accent transition-all flex items-center justify-center"
            title="Home"
          >
            <FiHome className="text-[11px]" />
          </Link>

          {/* Reset (workspace only) */}
          {isWorkspace && (
            <>
              <div className="w-px h-4 bg-border/30 ml-4 hidden md:block" />
              <button
                onClick={onReset}
                className="ml-3 md:flex hidden items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-neutral/30 hover:text-negative transition-colors"
              >
                <FiX className="text-xs" />
                {t.resetEngine}
              </button>
            </>
          )}
        </div>

        {/* RIGHT: Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User key badge */}
          {userApiKey && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-accent/5 border border-accent/20 text-[8px] font-black uppercase tracking-[0.2em] text-accent">
              <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              KEY_ACTIVE
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-2 border border-border px-2.5 py-1 text-[10px]">
              <div className="w-2.5 h-2.5 border border-border/50 border-t-accent rounded-full animate-spin" />
              <span className="font-black tracking-widest text-accent">{progress.toFixed(0)}%</span>
            </div>
          )}

          {/* History */}
          <button
            onClick={onShowHistory}
            className="w-8 h-7 border border-border/30 text-neutral/40 hover:border-accent hover:text-accent transition-all flex items-center justify-center relative"
          >
            <FiClock className="text-[11px]" />
            {historyCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-accent text-background text-[7px] font-black rounded-full flex items-center justify-center border border-background">
                {historyCount > 9 ? "9+" : historyCount}
              </span>
            )}
          </button>

          {/* Lang switcher */}
          <div className="flex items-center border border-border/30 overflow-hidden">
            {(["en", "vi"] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-[9px] font-black tracking-widest uppercase transition-colors ${
                  lang === l ? "bg-accent text-background" : "text-neutral/40 hover:text-foreground"
                }`}
              >
                {l === "vi" ? "VN" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {loading && (
        <div
          className="absolute bottom-0 left-0 h-[1px] bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      )}
    </header>
  );
}
