import { z } from 'zod';

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || null);

export const ICONS = ['coffee', 'cold', 'tea', 'breakfast', 'cake', 'food', 'juice', 'snack'];

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'نام کاربری را وارد کنید.'),
  password: z.string().min(1, 'رمز عبور را وارد کنید.'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'نام دسته‌بندی را وارد کنید.').max(40, 'نام دسته‌بندی طولانی است.'),
  icon: z.enum(ICONS).default('coffee'),
});

export const reorderSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1),
});

const itemFields = {
  name: z.string().trim().min(1, 'نام آیتم را وارد کنید.').max(80, 'نام آیتم طولانی است.'),
  description: optionalText(300),
  price: z.coerce
    .number({ error: 'قیمت را به عدد وارد کنید.' })
    .int('قیمت باید عدد صحیح باشد.')
    .min(0, 'قیمت نمی‌تواند منفی باشد.')
    .max(1_000_000_000, 'قیمت وارد‌شده بیش از حد بزرگ است.'),
  image: z
    .string()
    .regex(/^\/uploads\/[\w.-]+$/, 'آدرس تصویر نامعتبر است.')
    .nullish()
    .transform((v) => v || null),
  available: z.boolean(),
  featured: z.boolean(),
  categoryId: z.coerce.number().int().positive('دسته‌بندی را انتخاب کنید.'),
};

export const itemSchema = z.object({
  ...itemFields,
  available: itemFields.available.default(true),
  featured: itemFields.featured.default(false),
});

// PATCH accepts any subset of fields, e.g. { available: false } or { price: 120000 }.
// Built from the fields without defaults, so omitted fields are left unchanged.
export const itemPatchSchema = z
  .object(itemFields)
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'هیچ تغییری ارسال نشده است.' });

export const cafeSchema = z.object({
  name: z.string().trim().min(1, 'نام کافه را وارد کنید.').max(60),
  tagline: optionalText(120),
  about: optionalText(600),
  phone: optionalText(30),
  address: optionalText(200),
  hours: optionalText(80),
  instagram: optionalText(40),
});

export const idParam = z.coerce.number().int().positive('شناسه نامعتبر است.');
