import type { Request, Response } from "express"
import { articlesService } from "./articles.service"
import { apiSuccess, apiNoContent, apiPaginated } from "../../../lib/response"

export const articlesController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await articlesService.list(req.query as never)
    apiPaginated(res, result)
  },

  async findBySlug(req: Request, res: Response): Promise<void> {
    const article = await articlesService.findBySlug(req.params.slug)
    apiSuccess(res, article)
  },

  async update(req: Request, res: Response): Promise<void> {
    const article = await articlesService.update(req.params.id, req.body)
    apiSuccess(res, article, "Article updated")
  },

  async remove(req: Request, res: Response): Promise<void> {
    await articlesService.remove(req.params.id)
    apiNoContent(res)
  },
}
