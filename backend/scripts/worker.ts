import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { reviewResume, generateCoverLetter, generateInterviewPrep, magicFixBulletPoint } from "../lib/genai";
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
    console.log(`[Worker] Processing ${type} job ${job.id}...`);

    try {
      let result;
      if (type === "review") {
        result = await reviewResume(data.text, data.jobDescription, data.lang, data.userApiKey);
        // Include extracted text for review jobs
        result = { ...result, extractedText: data.text };
      } else if (type === "cover-letter") {
        result = await generateCoverLetter(data.resumeText, data.jobDescription, data.lang, data.userApiKey);
      } else if (type === "interview") {
        result = await generateInterviewPrep(data.resumeText, data.jobDescription, data.lang, data.userApiKey);
      } else if (type === "magic-fix") {
        result = await magicFixBulletPoint(data.quote, data.resumeText, data.jobDescription, data.lang, data.userApiKey);
      }
      
      const resultKey = `result:${job.id}`;
      await connection.set(resultKey, JSON.stringify(result), "EX", 600);
      
      console.log(`[Worker] Job ${job.id} completed.`);
      return result;
    } catch (error) {
      console.error(`[Worker] Error in job ${job.id}:`, error);
      throw error;
    }
  },
  { 
    connection,
    concurrency: 5 
  }
);
