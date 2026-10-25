import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/db.js';
import { loginSchema } from '../lib/validation.js';
import { AUTH_COOKIE, requireAdmin, signToken } from '../middleware/auth.js';

export const authRouter = Router();

// Slow down password guessing: 10 attempts per 15 minutes per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'تعداد تلاش‌ها زیاد بود؛ ۱۵ دقیقه‌ی دیگر دوباره امتحان کنید.' },
});

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = loginSchema.parse(req.body);
  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
  }

  res.cookie(AUTH_COOKIE, signToken(admin), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ username: admin.username });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE);
  res.json({ ok: true });
});

authRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ username: req.admin.username });
});
