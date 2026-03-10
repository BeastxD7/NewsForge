import type { Response } from "express"
import type { PaginatedData } from "@news-app/types"

export function apiSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  })
}

export function apiCreated<T>(res: Response, data: T, message = "Created"): void {
  apiSuccess(res, data, message, 201)
}

export function apiNoContent(res: Response): void {
  res.status(204).send()
}

export function apiPaginated<T>(
  res: Response,
  payload: PaginatedData<T>,
  message = "Success"
): void {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message,
    data: payload.data,
    total: payload.total,
    page: payload.page,
    pageSize: payload.pageSize,
    totalPages: payload.totalPages,
  })
}
