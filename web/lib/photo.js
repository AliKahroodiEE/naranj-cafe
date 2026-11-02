// Phone photos are often 5–10 MB, and Vercel rejects uploads over 4.5 MB.
// Large photos are shrunk in the browser first; the API resizes to 900px anyway.
export async function shrinkPhoto(file, maxSide = 1600) {
  if (file.size <= 1_500_000 || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    return blob ? new File([blob], "photo.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file; // a format this browser can't read; the API will say if it can't either
  }
}
