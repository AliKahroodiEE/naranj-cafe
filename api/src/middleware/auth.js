import jwt from 'jsonwebtoken';

export const AUTH_COOKIE = 'naranj_token';

export function signToken(admin) {
  return jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function requireAdmin(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return res.status(401).json({ error: 'ابتدا وارد پنل شوید.' });

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'نشست شما منقضی شده است؛ دوباره وارد شوید.' });
  }
}
