"use client";
import { motion, AnimatePresence } from "motion/react";
import { FiAlertTriangle, FiTrash2, FiKey, FiArrowRight, FiX, FiExternalLink } from "react-icons/fi";

interface LimitModalProps {
  show: boolean;
  onClose: () => void;
  type: 'usage' | 'storage';
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  t: any;
}

export default function LimitModal({ show, onClose, type, onOpenSettings, onOpenHistory, t }: LimitModalProps) {
  const isStorage = type === 'storage';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-surface border-2 border-border shadow-[12px_12px_0px_var(--border)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-negative/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-negative/10 border border-negative/20 flex items-center justify-center text-negative">
                  <FiAlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-negative">
                    {isStorage ? "Storage Limit" : "Usage Limit"}
                  </h3>
                  <p className="text-[8px] text-neutral uppercase font-bold tracking-widest">
                    {isStorage ? "Vault is full" : "Free quota exhausted"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 border border-border text-neutral hover:border-negative hover:text-negative transition-all flex items-center justify-center"
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              <p className="text-[11px] text-neutral/70 leading-relaxed font-light">
                {isStorage
                  ? "Bộ nhớ phân tích của bạn đã đầy. Hãy xóa bớt các bản ghi cũ hoặc nhập Gemini API Key để mở khoá không giới hạn."
                  : "Bạn đã sử dụng hết 2 lần quét miễn phí. Hãy nhập Gemini API Key để tiếp tục không giới hạn."}
              </p>

              <div className="flex flex-col gap-2">
                {/* Primary: API Key */}
                <button
                  onClick={() => { onClose(); onOpenSettings(); }}
                  className="group w-full flex items-center justify-between px-5 py-4 bg-accent text-background hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <FiKey className="text-sm" />
                    <div className="text-left">
                      <div className="text-[10px] font-black uppercase tracking-widest">Nhập API Key</div>
                      <div className="text-[8px] opacity-70 font-bold uppercase tracking-tighter">Mở khoá không giới hạn</div>
                    </div>
                  </div>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Secondary: depends on type */}
                {isStorage ? (
                  <button
                    onClick={() => { onClose(); onOpenHistory(); }}
                    className="group w-full flex items-center justify-between px-5 py-4 border border-border hover:border-accent hover:text-accent text-neutral transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <FiTrash2 className="text-sm" />
                      <div className="text-left">
                        <div className="text-[10px] font-black uppercase tracking-widest">Quản lý lịch sử</div>
                        <div className="text-[8px] opacity-50 font-bold uppercase tracking-tighter">Xóa bớt bản ghi cũ</div>
                      </div>
                    </div>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full flex items-center justify-between px-5 py-4 border border-border hover:border-accent hover:text-accent text-neutral transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <FiExternalLink className="text-sm" />
                      <div className="text-left">
                        <div className="text-[10px] font-black uppercase tracking-widest">Lấy Key miễn phí</div>
                        <div className="text-[8px] opacity-50 font-bold uppercase tracking-tighter">Google AI Studio</div>
                      </div>
                    </div>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex justify-between items-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-neutral/30">
                {isStorage ? `Auto-cleanup every 7 days` : `2 scans / session`}
              </p>
              <button
                onClick={onClose}
                className="text-[9px] font-black uppercase tracking-widest text-neutral/40 hover:text-neutral transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
