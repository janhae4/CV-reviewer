"use client";
import { motion, AnimatePresence } from "motion/react";
import { FiClock, FiX, FiExternalLink, FiTrash2 } from "react-icons/fi";
import { HistoryEntry } from "../../types/resume";

interface ReportHistoryProps {
  show: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function ReportHistory({ show, onClose, history, onRestore, onDelete, onClearAll }: ReportHistoryProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl bg-surface border-2 border-border shadow-[12px_12px_0px_var(--border)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-border bg-accent/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent">
                  <FiClock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent">Analysis Vault</h3>
                  <p className="text-[8px] text-neutral uppercase font-bold tracking-widest">Saved locally on this device</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button 
                    onClick={() => { if(confirm("Clear all history?")) onClearAll(); }} 
                    className="h-10 px-4 border border-negative/20 text-negative hover:bg-negative hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    Delete All
                  </button>
                )}
                <button onClick={onClose} className="w-10 h-10 border border-border text-neutral hover:border-accent hover:text-accent transition-all flex items-center justify-center">
                  <FiX />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {history.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                  <FiClock className="w-12 h-12 mb-4" />
                  <p className="text-[10px] uppercase font-black tracking-widest">No history found</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="group p-4 bg-background border border-border hover:border-accent transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 flex items-center justify-center text-3xl font-serif font-black text-accent border border-border bg-surface">
                          {entry.score.split('/')[0]}
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-accent transition-colors">{entry.cvName}</div>
                          <div className="mt-1 flex items-center gap-3 text-[8px] text-neutral font-bold uppercase tracking-tighter">
                            <span className="flex items-center gap-1"><FiClock /> {new Date(entry.timestamp).toLocaleDateString()}</span>
                            <span className="text-border">|</span>
                            <span>{entry.result.rate} Match</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onRestore(entry)}
                          className="px-4 py-2 bg-accent text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                          <FiExternalLink /> Restore
                        </button>
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="w-10 h-10 border border-border text-neutral hover:text-negative hover:border-negative transition-all flex items-center justify-center"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
