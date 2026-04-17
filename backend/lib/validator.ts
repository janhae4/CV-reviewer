import { Request, Response, NextFunction } from "express";

/**
 * Basic validation for review requests
 */
export const validateReviewRequest = (req: Request, res: Response, next: NextFunction) => {
  const { jobDescription, lang, visitorId } = req.body;

  if (!jobDescription || typeof jobDescription !== "string") {
    return res.status(400).json({ error: "Job description is required and must be a string." });
  }

  if (jobDescription.trim().length < 50) {
    return res.status(400).json({ error: "Job description is too short. Please provide at least 50 characters for a better analysis." });
  }

  if (jobDescription.length > 30000) {
    return res.status(400).json({ error: "Job description is too long. Max 30,000 characters." });
  }

  if (lang && !["vi", "en"].includes(lang)) {
    return res.status(400).json({ error: "Unsupported language. Use 'vi' or 'en'." });
  }

  if (!visitorId) {
    return res.status(400).json({ error: "Visitor ID is required for security and rate limiting." });
  }

  next();
};

/**
 * Basic validation for generic generation requests (Cover Letter, Interview)
 */
export const validateGenerateRequest = (req: Request, res: Response, next: NextFunction) => {
  const { type, resumeText, jobDescription, visitorId } = req.body;

  const validTypes = ["cover-letter", "interview", "magic-fix"];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid request type. Must be one of: ${validTypes.join(", ")}` });
  }

  if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 100) {
    return res.status(400).json({ error: "Resume text is missing or too short for generation." });
  }

  if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 50) {
    return res.status(400).json({ error: "Job description is missing or too short for generation." });
  }

  if (!visitorId) {
    return res.status(400).json({ error: "Visitor ID is required." });
  }

  next();
};
