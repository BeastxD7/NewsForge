import type { Request, Response } from "express"
import { articlesService } from "./articles.service"

export const articlesController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await articlesService.list(req.query as never)
    res.json(result)
  },

  async findBySlug(req: Request, res: Response): Promise<void> {
    const article = await articlesService.findBySlug(req.params.slug)
    res.json({ data: article })
  },

  async update(req: Request, res: Response): Promise<void> {
    const article = await articlesService.update(req.params.id, req.body)
    res.json({ data: article })
  },

  async remove(req: Request, res: Response): Promise<void> {
    await articlesService.remove(req.params.id)
    res.status(204).send()
  },
}
