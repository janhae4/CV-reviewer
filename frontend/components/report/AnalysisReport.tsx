"use client";
import { motion } from "motion/react";
import { FiCheckCircle, FiInfo } from "react-icons/fi";
import SkillsChart from "../SkillsChart";
import { AnalysisResult } from "../../types/resume";
import { Language } from "../../lib/translations";

interface AnalysisReportProps {
  result: AnalysisResult;
  t: any;
  lang: Language;
}

export default function AnalysisReport({ result, t, lang }: AnalysisReportProps) {
  const scoreNum = parseInt(result.rate.split("/")[0]) || 0;
  const scoreColor = scoreNum >= 7 ? "var(--accent)" : scoreNum >= 5 ? "#FF9F0A" : "#ff453a";

  return (
    <div id="report-content" className="flex flex-col flex-1 pb-10 bg-background text-foreground">
      {/* ROW 1: THE DASHBOARD HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-10 py-10 border-b border-border bg-surface relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex items-center justify-center">
            <div className="w-full">
              <h4 className="font-serif text-4xl font-black flex justify-center leading-tight tracking-tight text-foreground">{t.executiveSummary}</h4>
              <div className="flex items-center justify-center gap-16 bg-background/20 py-4">
                {/* Metric 1: Overall Match */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-neutral/40 mb-2">{t.overallMatch}</span>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-serif text-6xl font-black leading-none tracking-tighter"
                    style={{ color: scoreColor }}
                  >{result.rate}</motion.div>
                </div>

                {result.semanticScore !== null && (
                  <div className="h-12 w-px bg-accent/20 rotate-12" />
                )}

                {/* Metric 2: Semantic Match */}
                {result.semanticScore !== null && (
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-neutral/40 mb-2">{t.semanticMatch}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-serif font-black text-accent">{result.semanticScore}%</span>
                      <span className="text-[8px] bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.5 font-black uppercase tracking-tighter">{t.aiAccurate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {result.general && (
            <div className="bg-background/40 border-l-2 border-accent p-6 backdrop-blur-sm">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-accent mb-2">{t.aiAssessment}</div>
              <p className="text-sm font-light text-neutral leading-relaxed italic">"{result.general}"</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ROW 2: CORE ANALYSIS GRID */}
      <div className="grid grid-cols-5 border-b border-border bg-surface/20">
        {/* Radar Chart Section - Widened */}
        <div className="col-span-3 border-r border-border flex flex-col">
          <div className="p-8 pb-4 flex items-center justify-center bg-background/10">
            <div className="w-full max-w-md">
              <div className="text-[10px] font-black uppercase text-accent mb-2 mt-2 text-center tracking-[0.3em]">{t.competencyMatrix}</div>
              <SkillsChart data={result.skillsAnalysis} />
            </div>
          </div>

          {/* Subtle Separator */}
          <div className="px-10">
            <div className="h-px w-full bg-linear-to-r from-transparent via-border to-transparent opacity-90" />
          </div>

          <div className="p-10 pt-8 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-10">
              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                  {t.keywordGapAnalysis}
                  <span className="text-[7px] bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.5 font-black uppercase">v2.1</span>
                </div>
                <div className="text-[8px] text-neutral/40 font-bold uppercase tracking-[0.2em]">{t.atsCompatibility}</div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <div className="text-[8px] text-neutral/50 font-black uppercase tracking-[0.1em] mb-1 leading-none">{t.matchRate}</div>
                  <div className="text-2xl font-serif font-black text-accent leading-none">
                    {Math.round((result.cvKeywords.length / (result.cvKeywords.length + result.missingKeywords.length || 1)) * 100)}%
                  </div>
                </div>
                <div className="w-24 h-1.5 bg-border/40 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(result.cvKeywords.length / (result.cvKeywords.length + result.missingKeywords.length || 1)) * 100}%` }}
                    className="h-full bg-accent shadow-[0_0_8px_rgba(225,255,1,0.4)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {result.cvKeywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-accent/5 border border-accent/20 text-accent text-[9px] uppercase font-bold tracking-widest hover:bg-accent/10 transition-colors">{kw}</span>
              ))}
              {result.missingKeywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-negative/5 border border-negative/10 text-negative/40 text-[9px] uppercase font-bold tracking-widest">{kw}</span>
              ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4">
              {result.keywordOptimizationTips.slice(0, 2).map((tip, i) => (
                <div key={i} className="p-4 bg-surface/50 border border-border/40 hover:border-accent/30 transition-all rounded-sm group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-accent/5 -mr-4 -mt-4 rotate-45 group-hover:bg-accent/10" />
                  <div className="relative z-10 font-black text-accent text-[9px] uppercase mb-2 flex items-center gap-2 tracking-[0.1em]">
                    <span className="w-1 h-1 bg-accent rounded-full" />
                    {tip.keyword}
                  </div>
                  <p className="relative z-10 text-[9px] font-light text-neutral leading-relaxed italic">{tip.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Section */}
        <div className="col-span-2 flex flex-col divide-y divide-border bg-surface/10">
          <div className="p-10 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-8 flex items-center justify-between border-b border-accent/10 pb-3">
              <span className="flex items-center gap-2"><FiCheckCircle /> {t.keyStrengths}</span>
              <span className="text-[8px] text-neutral/40 font-bold uppercase tracking-widest">{t.strongPoints}</span>
            </div>
            <ul className="flex flex-col gap-5">
              {result.strengths.slice(0, 4).map((s, i) => (
                <li key={i} className="flex gap-4 items-start text-xs font-light leading-relaxed text-foreground/80 group">
                  <span className="text-accent mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-125 transition-transform" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-10 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-negative mb-8 flex items-center justify-between border-b border-negative/10 pb-3">
              <span className="flex items-center gap-2"><FiInfo /> {t.criticalGaps}</span>
              <span className="text-[8px] text-neutral/40 font-bold uppercase tracking-widest">{t.improvements}</span>
            </div>
            <ul className="flex flex-col gap-5">
              {result.weaknesses.slice(0, 4).map((w, i) => (
                <li key={i} className="flex gap-4 items-start text-xs font-light leading-relaxed text-foreground/70 group">
                  <span className="text-negative mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-negative group-hover:scale-125 transition-transform" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ROW 3: STRATEGIC IMPROVEMENTS - FULL WIDTH */}
      <div className="bg-surface/10 border-b border-border p-10">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-10 flex items-center justify-between">
          <span>{t.strategicImprovements}</span>
          <span className="h-px flex-1 bg-accent/10 ml-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {result.improvements.slice(0, 4).map((imp, i) => (
            <div key={i} className="group flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full border border-accent/20 flex items-center justify-center font-serif italic text-accent text-lg shrink-0 group-hover:bg-accent group-hover:text-background transition-all shadow-lg shadow-accent/5">0{i + 1}</div>
              <div className="flex flex-col gap-1">
                <div className="text-[9px] font-black text-accent/40 uppercase tracking-[0.3em]">{t.strategy} 0{i + 1}</div>
                <p className="text-sm font-light text-neutral leading-relaxed">{imp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
