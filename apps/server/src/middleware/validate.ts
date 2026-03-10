import type { Request, Response, NextFunction } from "express"
import type { ZodSchema } from "zod"

type ValidateTarget = "body" | "query" | "params"

export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      next(result.error)
      return
    }
    // req.query and req.params are read-only getters in Express 5 —
    // use defineProperty to shadow them with the coerced/parsed values
    try {
      req[target] = result.data
    } catch {
      Object.defineProperty(req, target, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      })
    }
    next()
  }
}
