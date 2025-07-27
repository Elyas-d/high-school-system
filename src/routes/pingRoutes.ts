import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/ping
router.get('/', (req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router; 