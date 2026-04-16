"use client";
import { useState, useCallback } from "react";

interface UseAIContentProps {
  resumeText: string;
  jobDescription: string;
  lang: string;
  userApiKey: string;
}

export function useAIContent({ resumeText, jobDescription, lang, userApiKey }: UseAIContentProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [clProgress, setClProgress] = useState(0);

  const [interviewPrep, setInterviewPrep] = useState<{ question: string, answer: string, rationale: string }[]>([]);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [interviewProgress, setInterviewProgress] = useState(0);

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

  const generateCoverLetter = async () => {
    if (!resumeText) return;
    setIsGeneratingCL(true);
    setClProgress(0);
    const interval = setInterval(() => setClProgress(p => p < 88 ? p + Math.random() * 8 : p), 350);
    try {
      const resp = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cover-letter", resumeText, jobDescription, lang, userApiKey })
      });
      const data = await resp.json();
      if (data.jobId) {
        const res = await connectSSE(data.jobId);
        setCoverLetter(res);
        setClProgress(100);
        return res;
      }
      return null;
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(interval);
      setIsGeneratingCL(false);
    }
  };

  const generateInterviewPrep = async () => {
    if (!resumeText) return;
    setIsGeneratingInterview(true);
    setInterviewProgress(0);
    const interval = setInterval(() => setInterviewProgress(p => p < 88 ? p + Math.random() * 8 : p), 400);
    try {
      const resp = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "interview", resumeText, jobDescription, lang, userApiKey })
      });
      const data = await resp.json();
      if (data.jobId) {
        const res = await connectSSE(data.jobId);
        setInterviewPrep(res);
        setInterviewProgress(100);
        return res;
      }
      return null;
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(interval);
      setIsGeneratingInterview(false);
    }
  };

  const resetAIContent = () => {
    setCoverLetter("");
    setInterviewPrep([]);
  };

  return {
    coverLetter, setCoverLetter, isGeneratingCL, clProgress, generateCoverLetter,
    interviewPrep, setInterviewPrep, isGeneratingInterview, interviewProgress, generateInterviewPrep,
    resetAIContent
  };
}
