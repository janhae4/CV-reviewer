"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FiActivity, FiDatabase, FiCpu, FiClock, FiShield } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { translations, Language } from "../../../lib/translations";
import TopNav from "../../../components/TopNav";

export default function MonitorPage() {
  const [lang, setLang] = useState<Language>("vi");
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState(false);
  const t = translations[lang];

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/monitor/stats");
      if (!res.ok) {
        console.error(`Monitor API status: ${res.status}`);
        setError(true);
        return;
      }
      const data = await res.json();
      setStats(data);
      setError(false);
    } catch (e) {
      setError(true);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = stats ? [
    { name: t.waitingJobs, value: stats.queue.waiting + stats.queue.delayed, color: "#a3a3a3" },
    { name: t.activeJobs, value: stats.queue.active, color: "var(--accent)" },
    { name: "Done", value: stats.queue.completed, color: "#10b981" },
    { name: "Fail", value: stats.queue.failed, color: "#ef4444" },
  ] : [];

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}H ${m}M`;
  };

  return (
    <div className="h-screen bg-background text-foreground font-sans flex flex-col selection:bg-accent selection:text-background overflow-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0" 
           style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <TopNav 
        lang={lang}
        setLang={setLang}
        isWorkspace={false}
        onReset={() => {}}
        onShowHistory={() => { window.location.href = "/app" }}
        historyCount={0}
        loading={false}
        progress={0}
        userApiKey={true}
        visitorId=""
        t={t}
        backHref="/app"
      />

      <div className="flex-1 p-4 md:p-6 flex flex-col min-h-0 relative z-10">
        <header className="flex items-center gap-3 mb-4 shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${error ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]'}`} />
          <h1 className="text-2xl font-serif font-black tracking-tighter uppercase whitespace-nowrap">
            {t.monitorTitle}
          </h1>
          <div className="flex-1 h-px bg-border/20 mx-4 hidden md:block" />
          <span className="text-[8px] text-neutral/40 font-black tracking-[0.3em] uppercase hidden md:block border border-border px-2 py-0.5">EST. ENGINE v1.2</span>
        </header>

        {!stats && !error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-50">
            <div className="w-8 h-px bg-accent animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Synchronizing Data Pools...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 border border-red-500/10 bg-red-500/5 p-10">
            <FiShield className="text-red-500 text-3xl" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Connection Failed: Proxy Logged Out</p>
            <button onClick={fetchStats} className="text-[9px] font-black uppercase tracking-widest bg-red-500 text-white px-8 py-3 hover:bg-red-600 transition-colors">Reconnect Handshake</button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
            
            {/* Left Column Stats */}
            <div className="w-full md:w-80 flex flex-col gap-3 shrink-0 min-h-0 overflow-y-auto no-scrollbar">
              <StatusCard icon={<FiDatabase />} label={t.redisStatus} value={stats.redis.toUpperCase()} status={stats.redis === "ready" ? "ok" : "warn"} />
              <StatusCard icon={<FiClock />} label={t.systemUptime} value={formatUptime(stats.uptime)} />
              <StatusCard icon={<FiCpu />} label={t.memoryUsage} value={stats.system.memory} />
              
              <div className="flex-1 p-5 border border-border bg-surface/30 flex flex-col justify-end">
                <div className="text-[7px] font-black uppercase text-neutral/30 tracking-[0.4em] mb-4">ENGINE_CORE_SPECS</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-black border-b border-border/5 pb-2">
                    <span className="text-neutral/30 uppercase">NODE</span>
                    <span className="text-accent">{stats.system.node}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-black border-b border-border/5 pb-2">
                    <span className="text-neutral/30 uppercase">HOST</span>
                    <span className="text-accent uppercase whitespace-nowrap overflow-hidden text-ellipsis ml-2">{stats.system.platform}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-black pt-1">
                    <span className="text-neutral/30 uppercase">POLL_INT</span>
                    <span className="text-accent">5000MS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 border border-border bg-surface flex flex-col min-h-0 relative shadow-xl overflow-hidden">
              <div className="absolute top-4 right-4 p-2 opacity-5 pointer-events-none"><FiActivity className="text-4xl" /></div>
              
              <div className="p-4 border-b border-border flex justify-between items-center bg-background/20 shrink-0">
                <span className="text-sm font-serif font-black uppercase tracking-tight">{t.queueStatus}</span>
                <span className="text-[8px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full animate-ping" /> REAL_TIME
                </span>
              </div>
              
              <div className="flex-1 min-h-0 relative">
                <div className="absolute inset-x-4 inset-y-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8, fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8, fontWeight: 900 }} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                      <Bar dataKey="value" barSize={60} radius={[2, 2, 0, 0]}>
                        {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Footer Mini Distributions */}
              <div className="grid grid-cols-4 border-t border-border bg-background/20 h-20 divide-x divide-border shrink-0">
                <MiniStat label="QUEUE" value={stats.queue.waiting + stats.queue.delayed} />
                <MiniStat label="RUNNING" value={stats.queue.active} color="text-accent" />
                <MiniStat label="SUCCEED" value={stats.queue.completed} color="text-green-500" />
                <MiniStat label="ABORTED" value={stats.queue.failed} color="text-red-500" />
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, status }: { icon: any, label: string, value: string, status?: "ok" | "warn" }) {
  return (
    <div className="p-5 border border-border bg-surface shrink-0 hover:border-accent/40 transition-colors group">
      <div className="flex items-center gap-3 mb-2">
        <div className={`text-lg group-hover:scale-110 transition-transform ${status === 'warn' ? 'text-red-500' : 'text-accent'}`}>{icon}</div>
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral/40">{label}</div>
      </div>
      <div className={`text-2xl font-serif font-black tracking-tight ${status === 'warn' ? 'text-red-500' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color="" }: { label: string, value: number, color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 group hover:bg-white/[0.01] transition-colors">
      <div className="text-[7px] font-black text-neutral/30 uppercase tracking-[0.2em]">{label}</div>
      <div className={`text-xl font-serif font-black ${color}`}>{value}</div>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-white/10 p-3 shadow-2xl backdrop-blur-md">
        <p className="text-[7px] font-black uppercase text-neutral/40 mb-1">{payload[0].payload.name}</p>
        <p className="text-xl font-serif font-black">{payload[0].value} <span className="text-[9px] text-neutral/40 italic uppercase">Jobs</span></p>
      </div>
    );
  }
  return null;
}
