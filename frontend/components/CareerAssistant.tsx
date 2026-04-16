"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { LuBrainCircuit } from "react-icons/lu";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  resumeText: string;
  jobDescription: string;
  lang: string;
  userApiKey: string;
  t: any;
}

export default function CareerAssistant({ resumeText, jobDescription, lang, userApiKey, t }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Handle auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const resp = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          message: userMsg,
          history,
          resumeText,
          jobDescription,
          lang,
          userApiKey
        })
      });

      const data = await resp.json();
      if (data.jobId) {
        const result = await pollJob(data.jobId);
        setMessages(prev => [...prev, { role: "assistant", content: result }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Could not connect to the assistant." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const pollJob = async (jobId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`/api/review/events/${jobId}`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "heartbeat") return;
        if (data.state === "completed") {
          eventSource.close();
          resolve(data.result);
        } else if (data.state === "failed") {
          eventSource.close();
          reject(new Error(data.error || "Failed"));
        }
      };
      eventSource.onerror = (err) => {
        eventSource.close();
        reject(err);
      };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[580px] bg-surface border border-accent/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden rounded-sm"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-accent/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/10 flex items-center justify-center text-accent">
                  <LuBrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-accent">{t.chatTitle}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    <span className="text-[8px] uppercase tracking-tighter text-neutral">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral hover:text-foreground p-1 transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-background/50 scroll-smooth">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                  <LuBrainCircuit className="w-12 h-12 mb-4 text-accent animate-pulse" />
                  <p className="text-xs font-light leading-relaxed">{t.chatWelcome}</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-entry`}>
                  <div className={`max-w-[90%] p-3 text-xs leading-relaxed ${
                    m.role === "user" 
                      ? "bg-accent/10 border border-accent/20 text-accent font-medium rounded-sm" 
                      : "bg-surface border border-border text-foreground font-light rounded-sm shadow-sm"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="markdown-prose">
                        <ReactMarkdown>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-surface border border-border p-3 rounded-sm flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Thinking Banner - Fixed alignment */}
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mx-4 mb-2 bg-accent/5 backdrop-blur-sm border border-accent/20 p-2 text-[8px] uppercase tracking-widest text-accent font-black text-center rounded-sm"
                >
                  {t.chatTitle} IS THINKING...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Overlay */}
            <div className="p-4 border-t border-border bg-surface relative">
              <div className="flex items-end gap-2 bg-background border border-border p-1 focus-within:border-accent transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.chatPlaceholder}
                  rows={1}
                  className="flex-1 bg-transparent px-3 py-2.5 text-xs focus:outline-none resize-none placeholder:opacity-30 disabled:opacity-50 min-h-[40px] max-h-[120px]"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-accent text-background flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity mb-0.5 mr-0.5"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, rotate: isOpen ? -90 : 0 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(225,255,1,0.2)] transition-all duration-300 ${
          isOpen ? "bg-surface border border-accent text-accent" : "bg-accent text-background"
        }`}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
