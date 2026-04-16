import request from "supertest";
import { app } from "../index";
import { reviewQueue } from "../lib/queue";

// Mock the queue to avoid needing a real Redis connection for API tests
jest.mock("../lib/queue", () => ({
  reviewQueue: {
    add: jest.fn().mockResolvedValue({ id: "mock-job-id" }),
    getJob: jest.fn(),
  },
  connection: {
    get: jest.fn(),
    set: jest.fn(),
    expire: jest.fn(),
    incr: jest.fn().mockResolvedValue(1),
  },
}));

describe("API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { connection } = require("../lib/queue");
    connection.incr.mockResolvedValue(1); // Default to not exceeding limit
  });

  describe("POST /api/generate", () => {
    it("should return 202 on successful job queuing", async () => {
      const { connection } = require("../lib/queue");
      connection.incr.mockResolvedValue(1);

      const res = await request(app)
        .post("/api/generate")
        .send({ type: "cover-letter", visitorId: "test-user" });

      expect(res.status).toBe(202);
      expect(res.body.jobId).toBe("mock-job-id");
    });

    it("should return 429 if rate limit exceeded", async () => {
      const { connection } = require("../lib/queue");
      connection.incr.mockResolvedValue(3); // Above limit of 2

      const res = await request(app)
        .post("/api/generate")
        .send({ type: "cover-letter", visitorId: "test-user" });

      expect(res.status).toBe(429);
      expect(res.body.error).toContain("Daily limit reached");
    });

    it("should bypass rate limit if userApiKey is provided", async () => {
      const { connection } = require("../lib/queue");
      connection.incr.mockResolvedValue(10); // Would be limit exceeded if not bypassed

      const res = await request(app)
        .post("/api/generate")
        .send({
          type: "cover-letter",
          visitorId: "test-user",
          userApiKey: "this-is-a-long-enough-api-key-to-bypass"
        });

      expect(res.status).toBe(202);
      expect(res.body.jobId).toBe("mock-job-id");
      expect(connection.incr).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/review", () => {
    it("should return 400 if no file is provided", async () => {
      const res = await request(app)
        .post("/api/review")
        .field("visitorId", "test-user");

      expect(res.status).toBe(400);
    });
  });
});
