// Points schema.prisma at the kind of database in DATABASE_URL: SQLite for a file: URL,
// PostgreSQL for a postgres:// URL (e.g. Neon from the Vercel Marketplace).
// The Vercel build runs this before `prisma generate`; locally nothing needs to change.
import fs from 'node:fs';

const file = new URL('./schema.prisma', import.meta.url);
const provider = /^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? '') ? 'postgresql' : 'sqlite';

// Schema changes (db push) need a direct connection; Neon's DATABASE_URL goes through a pooler.
const directEnv =
  provider === 'postgresql' && ['DATABASE_URL_UNPOOLED', 'POSTGRES_URL_NON_POOLING'].find((name) => process.env[name]);

let schema = fs
  .readFileSync(file, 'utf8')
  .replace(/(datasource db \{\s*provider\s*=\s*)"\w+"/, `$1"${provider}"`)
  .replace(/\n\s*directUrl\s*=.*/, '');
if (directEnv) schema = schema.replace(/(url\s*=\s*env\("DATABASE_URL"\))/, `$1\n  directUrl = env("${directEnv}")`);

fs.writeFileSync(file, schema);
console.log(`schema.prisma now uses ${provider}${directEnv ? ` (schema changes through ${directEnv})` : ''}`);
