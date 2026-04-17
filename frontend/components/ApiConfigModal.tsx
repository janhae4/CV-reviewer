"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiDatabase, FiSliders, FiKey, FiAlertTriangle, FiTerminal, FiChevronDown, FiRefreshCw } from "react-icons/fi";

export type ConfigMode = 'all' | 'chat' | 'history';

interface ApiConfigModalProps {
  show: boolean;
  mode: ConfigMode;
  isLimitReached: boolean;
  onClose: () => void;
  userApiKey: string;
  setUserApiKey: (val: string) => void;
  onSave: (key: string, settings?: any) => void;
  t: any;
}

export default function ApiConfigModal({ 
  show, mode, isLimitReached,
  onClose, userApiKey, setUserApiKey, onSave, t 
}: ApiConfigModalProps) {
  const [maxInput, setMaxInput] = useState(1000);
  const [maxOutput, setMaxOutput] = useState(1000);
  const [maxHistory, setMaxHistory] = useState(10);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [devBypass, setDevBypass] = useState(false);

  useEffect(() => {
    setIsDev(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    setDevBypass(localStorage.getItem('dev_bypass') === 'true');
  }, []);

  useEffect(() => {
    if (!show) return;
    try {
      const saved = localStorage.getItem("resume_ai_settings");
      if (saved) {
        const p = JSON.parse(saved);
        setMaxInput(p.maxInput || 1000);
        setMaxOutput(p.maxOutput || 1000);
        setMaxHistory(p.maxHistory || 10);
      }
    } catch {}
  }, [show]);

  const handleSave = () => {
    const settings = { maxInput, maxOutput, maxHistory };
    localStorage.setItem("resume_ai_settings", JSON.stringify(settings));
    onSave(userApiKey, settings);
  };

  const showStorage = mode === 'all' || mode === 'history';
  const showIO     = mode === 'all' || mode === 'chat';

  const TITLE = isLimitReached
    ? (t.limitReached || "LIMIT REACHED")
    : mode === 'history' ? "STORAGE" : mode === 'chat' ? "AI CONFIG" : "SETTINGS";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="max-w-sm w-full border-2 border-accent bg-surface shadow-[8px_8px_0px_var(--border)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`px-6 py-5 border-b border-border flex items-start justify-between gap-4 ${isLimitReached ? 'bg-negative/5' : 'bg-accent/5'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 flex items-center justify-center border ${isLimitReached ? 'border-negative/30 text-negative bg-negative/10' : 'border-accent/30 text-accent bg-accent/10'}`}>
                  {isLimitReached ? <FiAlertTriangle className="text-base" /> : <FiSliders className="text-base" />}
                </div>
                <div>
                  <h2 className={`font-serif font-black text-lg uppercase tracking-tight leading-none ${isLimitReached ? 'text-negative' : 'text-foreground'}`}>
                    {TITLE}
                  </h2>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral/50 mt-0.5">
                    {isLimitReached ? "Action Required" : "Advanced Configuration"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-neutral hover:text-foreground transition-colors text-xl leading-none mt-0.5">✕</button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-5">
              {/* STORAGE QUOTA */}
              {showStorage && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-neutral/50">
                    <FiDatabase className="text-xs" /> Storage Quota
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="text-neutral/70">Max Saved Scans</span>
                      <span className="text-accent">{maxHistory}</span>
                    </div>
                    <input 
                      type="range" min="5" max="50" step="1"
                      value={maxHistory}
                      onChange={(e) => setMaxHistory(Number(e.target.value))}
                      className="w-full accent-accent h-1 appearance-none bg-border rounded-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[7px] font-bold text-neutral/30 uppercase tracking-tighter">
                      <span>5 min</span><span>50 max</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DIVIDER */}
              {showStorage && showIO && <div className="border-t border-border/50" />}

              {/* I/O PARAMS */}
              {showIO && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-neutral/50">
                    <FiSliders className="text-xs" /> AI Parameters
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-neutral/70">Max Input Chars</span>
                        <span className="text-accent">{maxInput.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" min="1000" max="50000" step="1000"
                        value={maxInput}
                        onChange={(e) => setMaxInput(Number(e.target.value))}
                        className="w-full accent-accent h-1 appearance-none bg-border rounded-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-neutral/70">Max Output Tokens</span>
                        <span className="text-accent">{maxOutput.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" min="500" max="8000" step="100"
                        value={maxOutput}
                        onChange={(e) => setMaxOutput(Number(e.target.value))}
                        className="w-full accent-accent h-1 appearance-none bg-border rounded-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-border/50" />

              {/* GEMINI API KEY */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-neutral/50">
                  <FiKey className="text-xs" /> Gemini API Key
                </div>
                <input
                  type="password"
                  placeholder="AIza••••••••••••••••••••••••••••••"
                  className="w-full bg-background border border-border px-4 py-3 text-xs focus:outline-none focus:border-accent font-mono tracking-wider"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                />
                <p className="text-[7px] font-bold uppercase tracking-tighter text-neutral/30">
                  Removes usage limits • Stored locally only
                </p>
              </div>

              {/* DEV BYPASS — only on localhost */}
              {isDev && (
                <div className="border border-dashed border-border/40 overflow-hidden">
                  <button
                    onClick={() => setShowDevPanel(p => !p)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-background/40 hover:bg-background/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-neutral/30">
                      <FiTerminal className="text-xs" />
                      Dev Bypass
                    </div>
                    <FiChevronDown className={`text-xs text-neutral/30 transition-transform duration-200 ${showDevPanel ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showDevPanel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3 flex flex-col gap-3 bg-background/20">
                          {/* Bypass toggle */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-neutral/50">Bypass Usage Limit</div>
                              <div className="text-[7px] font-bold text-neutral/25 uppercase tracking-tighter">Skip free quota check</div>
                            </div>
                            <button
                              onClick={() => {
                                const next = !devBypass;
                                setDevBypass(next);
                                localStorage.setItem('dev_bypass', String(next));
                              }}
                              className={`w-10 h-5 relative transition-colors ${
                                devBypass ? 'bg-accent' : 'bg-border'
                              }`}
                            >
                              <span className={`absolute top-0.5 w-4 h-4 bg-background transition-all ${
                                devBypass ? 'left-[calc(100%-18px)]' : 'left-0.5'
                              }`} />
                            </button>
                          </div>

                          {/* Reset counter */}
                          <button
                            onClick={() => {
                              localStorage.setItem('resume_usage_count', '0');
                              // Force page re-read
                              window.location.reload();
                            }}
                            className="flex items-center gap-2 px-3 py-2 border border-dashed border-border/30 text-neutral/30 hover:text-neutral/60 hover:border-border/60 transition-all w-full"
                          >
                            <FiRefreshCw className="text-xs" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Reset Usage Counter</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* SAVE */}
              <button
                onClick={handleSave}
                className="w-full bg-accent text-background font-black text-[10px] uppercase tracking-[0.2em] py-3.5 hover:opacity-90 transition-opacity border border-accent"
              >
                {t.saveKey || "Save & Apply"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
