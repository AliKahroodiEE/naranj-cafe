import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'node:crypto';
import { saveImage } from '../lib/storage.js';
import { requireAdmin } from '../middleware/auth.js';
import { badRequest } from '../middleware/errors.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(badRequest('فقط فایل تصویری (JPG، PNG، WebP) مجاز است.'));
  },
});

export const uploadsRouter = Router();

// Photos from a phone camera are large; resize to 900px WebP so the menu loads fast on mobile data.
uploadsRouter.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) throw badRequest('تصویری انتخاب نشده است.');

  let webp;
  try {
    webp = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw badRequest('فایل تصویر قابل خواندن نیست.');
  }

  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.webp`;
  res.status(201).json({ url: await saveImage(filename, webp) });
});
