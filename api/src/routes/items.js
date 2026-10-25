import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { menuChanged } from '../lib/events.js';
import { idParam, itemPatchSchema, itemSchema } from '../lib/validation.js';
import { requireAdmin } from '../middleware/auth.js';
import { badRequest } from '../middleware/errors.js';
import { deleteUpload } from './uploads.js';

export const itemsRouter = Router();
itemsRouter.use(requireAdmin);

async function assertCategory(categoryId) {
  if (categoryId === undefined) return;
  const exists = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!exists) throw badRequest('دسته‌بندی انتخاب‌شده وجود ندارد.');
}

itemsRouter.get('/', async (req, res) => {
  const items = await prisma.item.findMany({
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }, { id: 'asc' }],
    include: { category: { select: { id: true, name: true } } },
  });
  res.json(items);
});

itemsRouter.get('/:id', async (req, res) => {
  const item = await prisma.item.findUniqueOrThrow({ where: { id: idParam.parse(req.params.id) } });
  res.json(item);
});

itemsRouter.post('/', async (req, res) => {
  const data = itemSchema.parse(req.body);
  await assertCategory(data.categoryId);
  const item = await prisma.item.create({ data });
  menuChanged();
  res.status(201).json(item);
});

itemsRouter.put('/:id', async (req, res) => {
  const id = idParam.parse(req.params.id);
  const data = itemSchema.parse(req.body);
  await assertCategory(data.categoryId);
  const before = await prisma.item.findUniqueOrThrow({ where: { id } });
  const item = await prisma.item.update({ where: { id }, data });
  if (before.image && before.image !== item.image) await deleteUpload(before.image);
  menuChanged();
  res.json(item);
});

// Quick edits from the admin list: availability toggle, price, featured.
itemsRouter.patch('/:id', async (req, res) => {
  const id = idParam.parse(req.params.id);
  const data = itemPatchSchema.parse(req.body);
  await assertCategory(data.categoryId);
  const item = await prisma.item.update({ where: { id }, data });
  menuChanged();
  res.json(item);
});

itemsRouter.delete('/:id', async (req, res) => {
  const item = await prisma.item.delete({ where: { id: idParam.parse(req.params.id) } });
  if (item.image) await deleteUpload(item.image);
  menuChanged();
  res.json({ ok: true });
});
