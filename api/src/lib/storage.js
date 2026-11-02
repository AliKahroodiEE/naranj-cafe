// Where item photos are kept: the api/uploads folder by default, or Vercel Blob
// when BLOB_READ_WRITE_TOKEN is set (a Vercel deployment has no lasting disk).
import fs from 'node:fs/promises';
import path from 'node:path';
import { del, put } from '@vercel/blob';

export const UPLOAD_DIR = path.resolve(import.meta.dirname, '../../uploads');
export const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Saves a WebP image and returns the URL the menu loads it from.
export async function saveImage(filename, data) {
  if (useBlob) {
    const blob = await put(`items/${filename}`, data, {
      access: 'public',
      contentType: 'image/webp',
      allowOverwrite: true,
    });
    return blob.url;
  }
  if (process.env.VERCEL) throw new Error('Connect a Vercel Blob store to this project to upload photos.');

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), data);
  return `/uploads/${filename}`;
}

export async function deleteImage(url) {
  if (url?.startsWith('/uploads/')) {
    await fs.rm(path.join(UPLOAD_DIR, path.basename(url)), { force: true });
  } else if (url && useBlob) {
    await del(url);
  }
}
