"use client";
import { useState, useCallback } from "react";
import { AnalysisResult, HistoryEntry } from "../types/resume";

interface UseCVAnalysisProps {
  lang: string;
  visitorId: string;
  userApiKey: string;
  onSuccess?: (result: AnalysisResult, file: File | null) => void;
  aiSettings?: { maxInput: number; maxOutput: number };
}

export function useCVAnalysis({ lang, visitorId, userApiKey, onSuccess, aiSettings }: UseCVAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult>({
    general: "", rate: "0/10", strengths: [], weaknesses: [], improvements: [],
    keywords: [], cvKeywords: [], missingKeywords: [], keywordOptimizationTips: [],
    semanticScore: null, skillsAnalysis: [],
  });
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [resumeText, setResumeText] = useState("");

  const connectSSE = useCallback((jobId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`/api/review/events/${jobId}`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "heartbeat") return;
        if (data.state === "completed") { eventSource.close(); resolve(data.result); }
        else if (data.state === "failed") { eventSource.close(); reject(new Error(data.error || "Failed")); }
      };
      eventSource.onerror = (err) => { eventSource.close(); reject(err); };
    });
  }, []);

  const analyze = async (file: File | null, jobDescription: string, options: { force?: boolean, useText?: boolean } = {}) => {
    const { force = false, useText = false } = options;
    if (!file && !useText) return;

    setLoading(true);
    setError("");
    setProgress(0);

    try {
      const formData = new FormData();
      if (!useText && file) formData.append("file", file);
      else formData.append("text", resumeText);
      formData.append("jobDescription", jobDescription);
      formData.append("lang", lang);
      formData.append("visitorId", visitorId);
      if (userApiKey) formData.append("userApiKey", userApiKey);
      if (force) formData.append("force", "true");
      if (aiSettings) {
        formData.append("maxInputChars", aiSettings.maxInput.toString());
        formData.append("maxOutputTokens", aiSettings.maxOutput.toString());
      }

      const progressInterval = setInterval(() => {
        setProgress(prev => prev >= 98 ? prev : prev + (prev < 60 ? Math.random() * 8 : Math.random() * 1.5));
      }, 500);

      const res = await fetch(`/api/review`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Review Error");

      const finalResult = await connectSSE(data.jobId);
      clearInterval(progressInterval);
      setProgress(100);

      // Wait for progress bar animation (300ms) + small buffer
      await new Promise(resolve => setTimeout(resolve, 800));

      if (finalResult.extractedText) setResumeText(finalResult.extractedText);
      
      const formattedResult: AnalysisResult = {
        general: finalResult.general || "",
        rate: finalResult.rate || "0/10",
        strengths: finalResult.strengths || [],
        weaknesses: finalResult.weaknesses || [],
        improvements: finalResult.improvements || [],
        keywords: finalResult.keywords || [],
        cvKeywords: finalResult.cvKeywords || [],
        missingKeywords: finalResult.missingKeywords || [],
        keywordOptimizationTips: finalResult.keywordOptimizationTips || [],
        semanticScore: finalResult.semanticScore || null,
        skillsAnalysis: finalResult.skillsAnalysis || [],
      };

      setResult(formattedResult);
      setAnnotations(finalResult.annotations || []);
      
      if (onSuccess) onSuccess(finalResult, file);
      
      return finalResult;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setError(msg);
      throw err; // Re-throw so parent can handle specific errors
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setResult({
      general: "", rate: "0/10", strengths: [], weaknesses: [], improvements: [],
      keywords: [], cvKeywords: [], missingKeywords: [], keywordOptimizationTips: [],
      semanticScore: null, skillsAnalysis: [],
    });
    setAnnotations([]);
    setResumeText("");
    setError("");
    setProgress(0);
  };

  const restoreAnalysis = (entry: HistoryEntry) => {
    setResult(entry.result);
    setAnnotations(entry.annotations);
    setResumeText(entry.resumeText);
  };

  return {
    loading, progress, error, result, annotations, resumeText,
    analyze, resetAnalysis, restoreAnalysis, setResumeText, setAnnotations, setResult
  };
}
