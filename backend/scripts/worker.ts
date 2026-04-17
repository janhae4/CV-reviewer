import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { reviewResume, generateCoverLetter, generateInterviewPrep, magicFixBulletPoint, chatWithAi } from "../lib/genai";
import { logger } from "../lib/logger";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new IORedis(REDIS_URL, { 
  maxRetriesPerRequest: null,
  tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
});

console.log("🚀 Worker process started...");

const worker = new Worker(
  "review-queue",
  async (job: Job) => {
    const { type, ...data } = job.data;
    logger.info(`[Worker] 📥 Received ${type} job: ${job.id}`);

    try {
      let result;
      const opt = data.maxOutputTokens;
      if (type === "review") {
        logger.info(`[Worker] 🔍 Analyzing resume for job ${job.id}...`);
        result = await reviewResume(data.text, data.jobDescription, data.lang, data.userApiKey, opt);
        result = { ...result, extractedText: data.text };
      } else if (type === "cover-letter") {
        console.log(`[Worker] 📝 Generating cover letter for job ${job.id}...`);
        result = await generateCoverLetter(data.resumeText, data.jobDescription, data.lang, data.userApiKey, opt);
      } else if (type === "interview") {
        console.log(`[Worker] 🎙️ Generating interview prep for job ${job.id}...`);
        result = await generateInterviewPrep(data.resumeText, data.jobDescription, data.lang, data.userApiKey, opt);
      } else if (type === "magic-fix") {
        console.log(`[Worker] ✨ Applying magic fix for job ${job.id}...`);
        result = await magicFixBulletPoint(data.quote, data.resumeText, data.jobDescription, data.lang, data.userApiKey, opt);
      } else if (type === "chat") {
        console.log(`[Worker] 💬 Responding to chat for job ${job.id}...`);
        result = await chatWithAi(data.message, data.history, data.resumeText, data.jobDescription, data.lang, data.userApiKey, opt);
      }
      
      const resultKey = `result:${job.id}`;
      logger.info(`[Worker] 💾 Saving result to Redis: ${resultKey}`);
      await connection.set(resultKey, JSON.stringify(result), "EX", 600);
      
      logger.info(`[Worker] ✅ Job ${job.id} finished successfully.`);
      return result;
    } catch (error: any) {
      logger.error(`[Worker] ❌ FATAL ERROR in job ${job.id}: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },
  { 
    connection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 }
  }
);

worker.on("failed", (job, err) => {
  console.error(`[Worker] ⚠️ Job ${job?.id} failed with error:`, err.message);
});

worker.on("error", (err) => {
  console.error(`[Worker] 🛑 Worker error:`, err.message);
});

// Heartbeat to keep logs alive and prove worker is running
setInterval(() => {
  const time = new Date().toLocaleTimeString();
  console.log(`[Worker Heartbeat] Alive at ${time} - Waiting for jobs...`);
}, 30000);

