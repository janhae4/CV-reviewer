export interface AnalysisResult {
  general: string;
  rate: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  keywords: string[];
  cvKeywords: string[];
  missingKeywords: string[];
  keywordOptimizationTips: { keyword: string; tip: string }[];
  semanticScore: number | null;
  skillsAnalysis: { skill: string; cv: number; jd: number }[];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  cvName: string;
  score: string;
  result: AnalysisResult;
  annotations: any[];
  resumeText: string;
  jobDescription: string;
  lang: string;
}
