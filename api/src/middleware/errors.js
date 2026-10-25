import { ZodError } from 'zod';
import multer from 'multer';

export function notFound(req, res) {
  res.status(404).json({ error: 'مسیر مورد نظر یافت نشد.' });
}

// Express 5 forwards rejected promises from async handlers to this middleware.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues[0]?.message || 'اطلاعات ارسالی نامعتبر است.' });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.' : 'آپلود فایل ناموفق بود.';
    return res.status(400).json({ error: message });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'مورد درخواستی پیدا نشد.' });
  }
  if (err?.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'خطای داخلی سرور؛ لطفاً دوباره تلاش کنید.' });
}

export function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}
