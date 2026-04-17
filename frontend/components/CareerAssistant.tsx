import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiMessageSquare, FiSend, FiUser, FiCpu, FiTerminal, FiChevronRight, FiSettings, FiZap } from "react-icons/fi";

import { Message } from "@/types/resume";

interface Props {
  resumeText: string;
  jobDescription: string;
  lang: string;
  userApiKey: string;
  visitorId: string;
  aiSettings?: { maxInput: number; maxOutput: number };
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onOpenSettings?: () => void;
  t: any;
}

export default function CareerAssistant({ resumeText, jobDescription, lang, userApiKey, visitorId, aiSettings, messages, setMessages, onOpenSettings, t }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          resumeText,
          jobDescription,
          lang,
          apiKey: userApiKey,
          maxTokens: aiSettings?.maxOutput || 1000
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 500 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 500, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="w-[380px] h-[520px] bg-background border-2 border-border shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative mb-4"
          >
            {/* Header */}
            <div className="bg-surface border-b-2 border-border p-4 flex items-center justify-between font-mono relative z-20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent text-background flex items-center justify-center font-black">AI</div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest">{t.careerAssistant || "CAREER ASSISTANT"}</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[8px] font-bold text-neutral uppercase opacity-50 tracking-tighter">System Live</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onOpenSettings}
                  className="w-8 h-8 flex items-center justify-center hover:bg-neutral/10 transition-colors"
                  title="AI Parameters"
                >
                  <FiSettings />
                </button>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 hover:bg-neutral/10 flex items-center justify-center transition-colors">
                  <FiChevronRight className="rotate-90" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
              <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4 bg-dots custom-scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <FiTerminal className="text-4xl text-neutral/20 mb-4" />
                    <p className="text-[10px] font-medium text-neutral/40 leading-relaxed uppercase tracking-widest">
                      {t.chatWelcome || "Session established. Ready for parameters analysis."}
                    </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3 text-[11px] leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-2 ${
                      m.role === "user" ? "bg-accent text-background border border-border" : "bg-surface text-foreground border border-border"
                    }`}>
                      <div className="shrink-0 mt-0.5 opacity-50">
                        {m.role === "user" ? <FiUser /> : <FiCpu />}
                      </div>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-surface p-3 border border-border flex items-center gap-2">
                      <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1 h-1 bg-accent rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface border-t-2 border-border bg-dots-light">
              <div className="relative flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t.chatPlaceholder || "Ask anything..."}
                  className="flex-1 bg-background border border-border p-3 text-[11px] font-medium focus:outline-none focus:border-accent resize-none max-h-32 min-h-[44px] custom-scrollbar"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`w-11 h-11 flex items-center justify-center transition-all border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                    isLoading || !input.trim() ? "bg-neutral text-background opacity-50 cursor-not-allowed" : "bg-accent text-background hover:bg-accent/90"
                  }`}
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-accent text-background border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-2xl relative group overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiChevronRight className="rotate-90" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <FiMessageSquare />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </motion.button>
    </div>
  );
}
