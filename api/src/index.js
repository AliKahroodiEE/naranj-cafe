import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import { authRouter } from './routes/auth.js';
import { menuRouter } from './routes/menu.js';
import { cafeRouter } from './routes/cafe.js';
import { categoriesRouter } from './routes/categories.js';
import { itemsRouter } from './routes/items.js';
import { uploadsRouter, UPLOAD_DIR } from './routes/uploads.js';
import { errorHandler, notFound } from './middleware/errors.js';

for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[key]) throw new Error(`Missing ${key} in api/.env (see .env.example)`);
}

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);
app.use('/api/cafe', cafeRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/uploads', uploadsRouter);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
// Express 5 passes listen errors (e.g. port already in use) to this callback.
app.listen(port, (err) => {
  if (err) {
    console.error(
      err.code === 'EADDRINUSE'
        ? `Port ${port} is already in use — another copy of the API is running. Stop it, then start again.`
        : err,
    );
    process.exit(1);
  }
  console.log(`API ready on http://localhost:${port}`);
});
