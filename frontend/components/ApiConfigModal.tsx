"use client";
import { motion, AnimatePresence } from "motion/react";
import { FiZap } from "react-icons/fi";
import Link from "next/link";

interface ApiConfigModalProps {
  show: boolean;
  onClose: () => void;
  userApiKey: string;
  setUserApiKey: (val: string) => void;
  onSave: (key: string) => void;
  t: any;
}

export default function ApiConfigModal({ show, onClose, userApiKey, setUserApiKey, onSave, t }: ApiConfigModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="max-w-md w-full border border-accent p-10 bg-surface flex flex-col gap-6 relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral hover:text-foreground text-xl">✕</button>
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
                onClick={() => onSave(userApiKey)}
                className="w-full bg-accent text-background font-black text-xs uppercase tracking-widest py-4 hover:opacity-90 transition-opacity"
              >
                {t.saveKey || "SAVE KEY"}
              </button>

              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={() => onSave("DEV_BYPASS")}
                  className="w-full border border-dashed border-accent/40 text-accent font-black text-[10px] uppercase tracking-widest py-3 hover:bg-accent/5 transition-colors flex items-center justify-center gap-2"
                >
                  <FiZap className="animate-pulse" /> DEV BYPASS (Unlimited)
                </button>
              )}
            </div>

            <div className="text-center py-4 border-t border-border mt-2">
              <Link href="/#pricing" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-neutral hover:text-accent transition-colors underline decoration-accent/30 underline-offset-4">
                {t.proPlan}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
