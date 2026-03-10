import { Router, type Request, type Response } from "express"

const router = Router()

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
  })
})

export { router as healthRouter }
