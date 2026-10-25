// Demo data for «کافه نارنج». Safe to re-run: it replaces the menu and keeps uploads.
// Demo photos live in prisma/demo-images (public domain, see CREDITS.md there).
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_IMAGES = path.resolve(import.meta.dirname, 'demo-images');
const UPLOADS = path.resolve(import.meta.dirname, '../uploads');

// Copy a demo photo into uploads/ and return its public URL.
function demoImage(photo) {
  if (!photo) return null;
  const file = `demo-${photo}.webp`;
  fs.copyFileSync(path.join(DEMO_IMAGES, `${photo}.webp`), path.join(UPLOADS, file));
  return `/uploads/${file}`;
}

const cafe = {
  name: 'کافه نارنج',
  tagline: 'قهوه‌ی تازه‌دم، صبحانه‌ی خانگی و دسرهای روز',
  about:
    'کافه نارنج جایی برای یک قهوه‌ی خوب و یک گفت‌وگوی دلنشین است. دانه‌های قهوه را هر هفته تازه برشته می‌کنیم و کیک‌ها و دسرها هر روز صبح در آشپزخانه‌ی خودمان پخته می‌شوند.',
  phone: '۰۲۱-۱۲۳۴۵۶۷۸',
  address: 'تهران، خیابان نمونه، پلاک ۱۲',
  hours: 'همه‌روزه ۸ صبح تا ۱۲ شب',
  instagram: 'naranj.cafe',
};

const menu = [
  {
    name: 'قهوه‌ی گرم',
    icon: 'coffee',
    items: [
      { name: 'اسپرسو', description: 'یک شات ۱۰۰٪ عربیکا با کرمای غلیظ', price: 95000, photo: 'espresso' },
      { name: 'آمریکانو', description: 'اسپرسو و آب داغ؛ سبک و خوش‌عطر', price: 110000, photo: 'americano' },
      { name: 'کاپوچینو', description: 'اسپرسو، شیر بخارداده و فوم نرم', price: 145000, photo: 'cappuccino' },
      { name: 'لاته', description: 'اسپرسو با شیر فراوان و لایه‌ی نازک فوم', price: 150000, featured: true, photo: 'latte' },
      { name: 'موکا', description: 'اسپرسو، شکلات تلخ و شیر', price: 165000, photo: 'mocha' },
      { name: 'قهوه‌ی ترک', description: 'دم‌شده در جزوه، همراه با لوکوم', price: 105000, photo: 'turkish-coffee' },
    ],
  },
  {
    name: 'نوشیدنی سرد',
    icon: 'cold',
    items: [
      { name: 'آیس لاته', description: 'اسپرسو، شیر سرد و یخ', price: 160000, photo: 'iced-latte' },
      { name: 'آیس آمریکانو', description: 'اسپرسو روی یخ', price: 125000, photo: 'iced-americano' },
      { name: 'شیک شکلات', description: 'بستنی وانیلی، شکلات و شیر', price: 195000, photo: 'chocolate-shake' },
      { name: 'لیموناد نعناع', description: 'لیموی تازه، نعناع و سودا', price: 130000, photo: 'mint-lemonade' },
    ],
  },
  {
    name: 'چای و دمنوش',
    icon: 'tea',
    items: [
      { name: 'چای ایرانی (قوری)', description: 'چای لاهیجان، برای دو نفر', price: 110000, photo: 'persian-tea' },
      { name: 'چای ماسالا', description: 'چای سیاه، شیر و ادویه‌های گرم', price: 140000, photo: 'masala-chai' },
      { name: 'دمنوش به‌لیمو و بابونه', description: 'آرامش‌بخش و بدون کافئین', price: 115000, photo: 'herbal-tea' },
    ],
  },
  {
    name: 'صبحانه',
    icon: 'breakfast',
    items: [
      { name: 'املت ایرانی', description: 'گوجه‌ی تازه و تخم‌مرغ، با نان سنگک', price: 195000, photo: 'omelette' },
      { name: 'نیمرو با نان تست', description: 'دو تخم‌مرغ، کره و نان تست', price: 160000, photo: 'fried-eggs-toast' },
      { name: 'پنکیک موز و عسل', description: 'سه پنکیک پفکی با موز تازه و عسل', price: 215000, featured: true, photo: 'pancakes' },
    ],
  },
  {
    name: 'کیک و دسر',
    icon: 'cake',
    items: [
      { name: 'چیزکیک نیویورکی', description: 'با سس توت‌فرنگی خانگی', price: 185000, featured: true, photo: 'cheesecake' },
      { name: 'کیک شکلاتی خیس', description: 'گرم، با سس شکلات', price: 175000, photo: 'chocolate-cake' },
      { name: 'تیرامیسو', description: 'ماسکارپونه، اسپرسو و پودر کاکائو', price: 195000, available: false, photo: 'tiramisu' },
    ],
  },
  {
    name: 'غذا',
    icon: 'food',
    items: [
      { name: 'پاستا آلفردو', description: 'پنه، مرغ گریل و سس قارچ و خامه', price: 345000, photo: 'pasta-alfredo' },
      { name: 'ساندویچ مرغ سوخاری', description: 'فیله‌ی مرغ سوخاری، کاهو و سس مخصوص در نان بریوش', price: 295000, photo: 'chicken-sandwich' },
      { name: 'سالاد سزار', description: 'کاهو رسمی، مرغ، کروتان و سس سزار', price: 315000, photo: 'caesar-salad' },
    ],
  },
];

async function main() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) throw new Error('Set ADMIN_USERNAME and ADMIN_PASSWORD in api/.env');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: { passwordHash },
    create: { username: ADMIN_USERNAME, passwordHash },
  });

  await prisma.cafe.upsert({ where: { id: 1 }, update: cafe, create: { id: 1, ...cafe } });

  fs.mkdirSync(UPLOADS, { recursive: true });
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  for (const [index, { items, ...category }] of menu.entries()) {
    await prisma.category.create({
      data: {
        ...category,
        sortOrder: index,
        items: {
          create: items.map(({ photo, ...item }, i) => ({ ...item, image: demoImage(photo), sortOrder: i })),
        },
      },
    });
  }

  const count = await prisma.item.count();
  console.log(`Seeded ${menu.length} categories and ${count} items. Admin user: ${ADMIN_USERNAME}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
