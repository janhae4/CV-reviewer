import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import PdfParse from "pdf-parse";
import { reviewQueue, connection } from "./lib/queue";
import * as dotenv from "dotenv";
import path from "path";
import { logger } from "./lib/logger";
import { errorHandler, AppError } from "./lib/errorHandler";
import { validateReviewRequest, validateGenerateRequest } from "./lib/validator";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  }
});

// Rate Limiter Middleware
const rateLimiter = async (req: Request, res: Response, next: any) => {
  const visitorId = req.body.visitorId || req.ip;
  const userApiKey = req.body.userApiKey;

  if (process.env.NODE_ENV === "test") {
    // logger.info(`[RateLimit] Body: ${JSON.stringify(req.body)}`);
  }

  // Bypass if user provides their own API Key
  const bypass = (userApiKey && userApiKey.trim().length > 10);
  
  if (bypass) {
    console.log(`🚀 [RateLimit] BYPASS ACTIVE: User provided their own Key. (Visitor: ${visitorId})`);
    return next();
  }

  const isChat = req.body.type === 'chat';
  
  // 1. Check Input Length for Chat
  const inputLimit = (bypass && req.body.maxInputChars) ? Number(req.body.maxInputChars) : 1000;
  if (isChat && req.body.message && req.body.message.length > inputLimit) {
    return res.status(400).json({ error: `Message too long (max ${inputLimit} characters).` });
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Create a unique key per CV content for chat, or per day for scans
  const cvHash = isChat ? require('crypto').createHash('md5').update(req.body.resumeText || "").digest('hex').slice(0, 10) : today;
  const bucket = isChat ? 'chatlimit' : 'ratelimit';
  const limit = isChat ? 10 : 2;
  const key = `${bucket}:${visitorId}:${cvHash}`;

  try {
    const count = await connection.incr(key);
    if (count === 1) {
      await connection.expire(key, 86400 * 2); // 48 hours for CV specific chats
    }

    if (count > limit) {
      const message = isChat 
        ? "Chat limit reached (10/day). Please enter your own Gemini API Key to continue the conversation."
        : "Daily limit reached. Please enter your own Gemini API Key in 'Configure App' to continue.";
      
      return res.status(429).json({ error: message });
    }
    next();
  } catch (err) {
    console.error("Rate Limit Error:", err);
    next();
  }
};

// 1. Queue a review job
app.post("/api/review", upload.single("file"), validateReviewRequest, rateLimiter, async (req: Request, res: Response, next: any) => {
  try {
    const file = req.file;
    const { jobDescription, lang, userApiKey } = req.body;
    if (!file) return res.status(400).json({ error: "No file provided" });
    const data = await PdfParse(file.buffer);
    const text = data.text;
    if (!text.trim()) return res.status(400).json({ error: "No text extracted" });

    const job = await reviewQueue.add("review", {
      type: "review",
      text,
      jobDescription,
      lang,
      userApiKey
    });
    res.status(202).json({ jobId: job.id, extractedText: text });
  } catch (error) {
    next(error);
  }
});

// 2. Queue Cover Letter / Interview / Magic Fix
app.post("/api/generate", validateGenerateRequest, rateLimiter, async (req: Request, res: Response, next: any) => {
  try {
    const { type, ...data } = req.body; // type: 'cover-letter' | 'interview' | 'magic-fix'
    const job = await reviewQueue.add(type, { type, ...data });
    res.status(202).json({ jobId: job.id });
  } catch (error) {
    next(error);
  }
});

// 3. Poll job status
app.get("/api/review/status/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 1. Check if result exists in Redis (for completed jobs)
    const resultData = await connection.get(`result:${id}`);
    if (resultData) {
      return res.json({ state: "completed", progress: 100, result: JSON.parse(resultData) });
    }

    // 2. Otherwise, check the job status in the queue
    const job = await reviewQueue.getJob(id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();
    if (state === "completed") {
      // Re-check Redis just in case of race condition
      const data = await connection.get(`result:${id}`);
      return res.json({ state, progress: 100, result: data ? JSON.parse(data) : null });
    }

    if (state === "failed") {
      return res.json({ state, progress: 100, error: job.failedReason || "Failed" });
    }

    res.json({ state, progress: state === "active" ? 50 : 10 });
  } catch (error) {
    console.error("Poll Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. SSE for job status
app.get("/api/review/events/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Immediate check
  const checkStatus = async () => {
    try {
      const resultData = await connection.get(`result:${id}`);
      if (resultData) {
        sendEvent({ state: "completed", progress: 100, result: JSON.parse(resultData) });
        return true;
      }

      const job = await reviewQueue.getJob(id);
      if (!job) {
        sendEvent({ state: "failed", error: "Job not found" });
        return true;
      }

      const state = await job.getState();
      if (state === "completed") {
        const data = await connection.get(`result:${id}`);
        sendEvent({ state, progress: 100, result: data ? JSON.parse(data) : null });
        return true;
      }

      if (state === "failed") {
        sendEvent({ state, progress: 100, error: job.failedReason || "Failed" });
        return true;
      }

      sendEvent({ state, progress: state === "active" ? 50 : 10 });
      return false;
    } catch (err) {
      sendEvent({ state: "failed", error: "Internal error" });
      return true;
    }
  };

  const done = await checkStatus();
  if (done) return res.end();

  const interval = setInterval(async () => {
    const isDone = await checkStatus();
    if (isDone) {
      clearInterval(interval);
      res.end();
    }
  }, 2000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// 5. System Monitor Stats
app.get("/api/monitor/stats", async (req: Request, res: Response, next: any) => {
  try {
    console.log("📊 [DEBUG] Monitor endpoint hit! Fetching queue stats...");
    logger.info("Monitor stats accessed");
    const queueCounts = await reviewQueue.getJobCounts();
    const redisStatus = connection.status;
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      queue: queueCounts,
      redis: redisStatus,
      uptime,
      system: {
        memory: Math.round(memoryUsage.rss / 1024 / 1024) + "MB",
        node: process.version,
        platform: process.platform
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    logger.info(`✅ Backend listening at http://localhost:${port}`);
  });
}
