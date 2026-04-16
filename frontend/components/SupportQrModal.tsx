"use client";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

interface SupportQrModalProps {
  show: boolean;
  onClose: () => void;
}

export default function SupportQrModal({ show, onClose }: SupportQrModalProps) {
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
            className="max-w-2xl w-full border border-accent/20 bg-surface relative shadow-[0_0_80px_rgba(225,255,1,0.08)] flex flex-col md:flex-row overflow-hidden text-left"
          >
            <button onClick={onClose} className="absolute top-6 right-6 z-20 text-neutral hover:text-accent transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Left: QR Area */}
            <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-10 md:p-12 relative">
              <div className="absolute top-4 left-4 text-[10px] font-black tracking-widest uppercase text-black/20">Payment Terminal v1.0</div>
              <div className="relative group">
                <div className="absolute -inset-2 bg-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <Image
                  src="/momo_qr.jpg"
                  alt="Momo QR"
                  width={240}
                  height={240}
                  className="relative w-full h-auto max-w-[240px] shadow-sm transform group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              <div className="mt-6 flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-accent"
                ></motion.div>
                <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Awaiting transaction...</span>
              </div>
            </div>

            {/* Right: Content Area */}
            <div className="w-full md:w-1/2 p-10 md:p-12 flex flex-col justify-center bg-surface border-t md:border-t-0 md:border-l border-accent/10">
              <div className="text-[10px] font-black tracking-[0.2em] uppercase text-accent mb-4">Support Independent AI</div>
              <h3 className="font-serif font-black text-3xl leading-tight mb-6">Mời tác giả<br /><span className="text-accent underline decoration-accent/20 underline-offset-8">một ly cafe.</span></h3>

              <p className="text-sm text-neutral font-light leading-relaxed mb-8">
                Sự hỗ trợ của bạn giúp mình duy trì server Gemini API và có thêm động lực phát triển công cụ này hoàn toàn miễn phí cho cộng đồng. ☕
              </p>

              <div className="flex flex-col gap-3 mt-auto">
                <div className="flex items-center gap-3 px-4 py-3 bg-background border border-border">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase">Momo Transfer Preferred</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-accent text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Xác nhận đã hiểu
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
