import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { menuChanged } from '../lib/events.js';
import { categorySchema, idParam, reorderSchema } from '../lib/validation.js';
import { requireAdmin } from '../middleware/auth.js';

export const categoriesRouter = Router();
categoriesRouter.use(requireAdmin);

categoriesRouter.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { items: true } } },
  });
  res.json(categories);
});

categoriesRouter.post('/', async (req, res) => {
  const data = categorySchema.parse(req.body);
  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const category = await prisma.category.create({
    data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 },
  });
  menuChanged();
  res.status(201).json(category);
});

// Body: { ids: [3, 1, 2] } — the new order of all categories.
categoriesRouter.post('/reorder', async (req, res) => {
  const { ids } = reorderSchema.parse(req.body);
  await prisma.$transaction(
    ids.map((id, index) => prisma.category.update({ where: { id }, data: { sortOrder: index } })),
  );
  menuChanged();
  res.json({ ok: true });
});

categoriesRouter.put('/:id', async (req, res) => {
  const id = idParam.parse(req.params.id);
  const category = await prisma.category.update({ where: { id }, data: categorySchema.parse(req.body) });
  menuChanged();
  res.json(category);
});

categoriesRouter.delete('/:id', async (req, res) => {
  const id = idParam.parse(req.params.id);
  const count = await prisma.item.count({ where: { categoryId: id } });
  if (count > 0) {
    return res
      .status(409)
      .json({ error: `این دسته ${count.toLocaleString('fa-IR')} آیتم دارد؛ اول آیتم‌ها را حذف یا جابه‌جا کنید.` });
  }
  await prisma.category.delete({ where: { id } });
  menuChanged();
  res.json({ ok: true });
});
