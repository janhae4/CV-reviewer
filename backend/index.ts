import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import PdfParse from "pdf-parse";
import { reviewQueue, connection } from "./lib/queue";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// 1. Queue a review job
app.post("/api/review", upload.single("file"), async (req: Request, res: Response) => {
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
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Queue Cover Letter / Interview / Magic Fix
app.post("/api/generate", async (req: Request, res: Response) => {
  try {
    const { type, ...data } = req.body; // type: 'cover-letter' | 'interview' | 'magic-fix'
    const job = await reviewQueue.add(type, { type, ...data });
    res.status(202).json({ jobId: job.id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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


app.listen(port, () => {
  console.log(`✅ Backend listening at http://localhost:${port}`);
});
