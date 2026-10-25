// Apply ADMIN_USERNAME / ADMIN_PASSWORD from api/.env without touching the menu.
// Usage: npm run admin:password -w api
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in api/.env');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
await prisma.admin.upsert({
  where: { username: ADMIN_USERNAME },
  update: { passwordHash },
  create: { username: ADMIN_USERNAME, passwordHash },
});
await prisma.$disconnect();
console.log(`Password updated for admin user "${ADMIN_USERNAME}".`);
