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
      success: false,
      statusCode: 400,
      message: "Invalid request data",
      error: "VALIDATION_ERROR",
      details: err.flatten().fieldErrors,
    })
    return
  }

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      error: err.code,
    })
    return
  }

  // Unknown errors
  console.error("[Error]", err)
  res.status(500).json({
    success: false,
    statusCode: 500,
    message: "An unexpected error occurred",
    error: "INTERNAL_ERROR",
  })
}
