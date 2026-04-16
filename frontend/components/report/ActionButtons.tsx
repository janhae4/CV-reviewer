"use client";
import { motion, AnimatePresence } from "motion/react";
import { FiFileText, FiMic } from "react-icons/fi";
import { Language } from "../../lib/translations";

interface ActionButtonsProps {
  onGenerateCL: () => void;
  isGeneratingCL: boolean;
  clProgress: number;
  hasCL: boolean;
  onGenerateInterview: () => void;
  isGeneratingInterview: boolean;
  interviewProgress: number;
  hasInterview: boolean;
  t: any;
  lang: Language;
}

export default function ActionButtons({
  onGenerateCL, isGeneratingCL, clProgress, hasCL,
  onGenerateInterview, isGeneratingInterview, interviewProgress, hasInterview,
  t, lang
}: ActionButtonsProps) {
  return (
    <div className="px-10 py-8 border-t border-border bg-surface flex items-center gap-6">
      {/* Cover Letter Button */}
      <button
        onClick={onGenerateCL}
        disabled={isGeneratingCL}
        className="flex-1 relative h-14 bg-background border border-border hover:border-accent hover:bg-accent hover:text-background transition-all group overflow-hidden"
      >
        <AnimatePresence>
          {isGeneratingCL && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clProgress}%` }}
              exit={{ opacity: 0 }}
              className="absolute inset-y-0 left-0 bg-accent/10 pointer-events-none"
            />
          )}
        </AnimatePresence>
        <div className="relative z-10 flex items-center justify-center gap-3">
          {isGeneratingCL ? (
            <FiFileText className="animate-pulse text-accent" />
          ) : (
            <>
              <FiFileText className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                {hasCL ? (lang === 'vi' ? 'XEM COVER LETTER' : 'VIEW COVER LETTER') : t.generateCL}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Interview Prep Button */}
      <button
        onClick={onGenerateInterview}
        disabled={isGeneratingInterview}
        className="flex-1 relative h-14 bg-background border border-border hover:border-positive hover:bg-positive hover:text-black transition-all group overflow-hidden"
      >
        <AnimatePresence>
          {isGeneratingInterview && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${interviewProgress}%` }}
              exit={{ opacity: 0 }}
              className="absolute inset-y-0 left-0 bg-positive/10 pointer-events-none"
            />
          )}
        </AnimatePresence>
        <div className="relative z-10 flex items-center justify-center gap-3">
          {isGeneratingInterview ? (
            <FiMic className="animate-pulse text-positive" />
          ) : (
            <>
              <FiMic className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                {hasInterview ? (lang === 'vi' ? 'XEM PHỎNG VẤN' : 'VIEW INTERVIEW') : t.prepareInterview}
              </span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}
