import type { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import { UnauthorizedError, ForbiddenError } from "../lib/errors"
import { env } from "../config/env"

/**
 * Verifies the request carries a valid admin session.
 * Next.js passes the session token via Authorization header.
 *
 * Header format: Authorization: Bearer <sessionToken>
 */
export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing authorization header"))
  }

  const token = authHeader.slice(7)

  // Validate internal API calls from Next.js server using API_SECRET
  if (token === env.API_SECRET) {
    // Internal server-to-server call — trusted
    next()
    return
  }

  // Validate user session token from NextAuth
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  })

  if (!session || session.expires < new Date()) {
    return next(new UnauthorizedError("Invalid or expired session"))
  }

  if (session.user.role !== "ADMIN") {
    return next(new ForbiddenError("Admin access required"))
  }

  next()
}
