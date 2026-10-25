const number = new Intl.NumberFormat("fa-IR");

export const faNumber = (n) => number.format(n);

export const toman = (n) => `${number.format(n)} تومان`;

// Accept prices typed with Persian or Arabic digits and separators: «۱۵۰٬۰۰۰» → 150000
export function parsePrice(text) {
  const latin = String(text)
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/\D/g, "");
  return latin === "" ? null : Number(latin);
}
