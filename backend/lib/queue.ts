import { Queue } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
});

export const reviewQueue = new Queue("review-queue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs for monitoring
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs for debugging
    },
  },
});
