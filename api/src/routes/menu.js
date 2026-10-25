import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { subscribe } from '../lib/events.js';

export const menuRouter = Router();

const byOrder = [{ sortOrder: 'asc' }, { id: 'asc' }];

// Public menu: café info + categories with their items.
// Out-of-stock items are included so the menu can show them as «ناموجود».
menuRouter.get('/', async (req, res) => {
  const [cafe, categories] = await Promise.all([
    prisma.cafe.findUnique({ where: { id: 1 } }),
    prisma.category.findMany({
      orderBy: byOrder,
      include: { items: { orderBy: byOrder } },
    }),
  ]);

  res.set('Cache-Control', 'no-store');
  res.json({ cafe, categories: categories.filter((c) => c.items.length > 0) });
});

menuRouter.get('/stream', subscribe);
