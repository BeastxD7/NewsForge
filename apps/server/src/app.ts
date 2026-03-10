import express from "express"
import cors from "cors"
import { v1Router } from "./api/v1/router"
import { errorHandler } from "./middleware/error-handler"

export function createApp() {
  const app = express()

  // Middleware
  app.use(cors({ origin: process.env.NEXTAUTH_URL ?? "http://localhost:3000" }))
  app.use(express.json({ limit: "10mb" }))
  app.use(express.urlencoded({ extended: true }))

  // Routes
  app.use("/api/v1", v1Router)

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "NOT_FOUND", message: "Route not found", statusCode: 404 })
  })

  // Global error handler (must be last)
  app.use(errorHandler)

  return app
}
