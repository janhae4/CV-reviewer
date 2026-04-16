import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

export class AppError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  logger.error(`${req.method} ${req.url} - Error: ${message}`, {
    stack: err.stack,
    body: req.body,
    ip: req.ip
  });

  res.status(statusCode).json({
    error: message,
    status: "fail"
  });
};
