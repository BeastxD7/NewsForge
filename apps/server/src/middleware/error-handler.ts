import type { Request, Response, NextFunction } from "express"
import { AppError } from "../lib/errors"
import { ZodError } from "zod"

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Invalid request data",
      statusCode: 400,
      details: err.flatten().fieldErrors,
    })
    return
  }

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      statusCode: err.statusCode,
    })
    return
  }

  // Unknown errors
  console.error("[Error]", err)
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    statusCode: 500,
  })
}
