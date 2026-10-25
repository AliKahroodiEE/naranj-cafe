import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { menuChanged } from '../lib/events.js';
import { cafeSchema } from '../lib/validation.js';
import { requireAdmin } from '../middleware/auth.js';

export const cafeRouter = Router();

cafeRouter.get('/', async (req, res) => {
  res.json(await prisma.cafe.findUnique({ where: { id: 1 } }));
});

cafeRouter.put('/', requireAdmin, async (req, res) => {
  const data = cafeSchema.parse(req.body);
  const cafe = await prisma.cafe.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  menuChanged();
  res.json(cafe);
});
