"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ImagePlus, Loader2, Save, Trash2, X } from "lucide-react";
import ItemImage from "@/components/ItemImage";
import { Field, PageTitle, Switch, buttonClass, inputClass, useToast } from "@/components/admin/ui";
import { api } from "@/lib/api";
import { faNumber, parsePrice, toman } from "@/lib/format";

const EMPTY = { name: "", description: "", price: "", categoryId: "", image: null, available: true, featured: false };

export default function ItemForm({ id }) {
  const router = useRouter();
  const fileInput = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, showToast] = useToast();

  useEffect(() => {
    api("/categories")
      .then((list) => {
        setCategories(list);
        if (!id && list[0]) setForm((f) => (f.categoryId ? f : { ...f, categoryId: list[0].id }));
      })
      .catch((err) => showToast(err.message, "error"));

    if (id) {
      api(`/items/${id}`)
        .then((item) => {
          setForm({ ...item, description: item.description ?? "", price: faNumber(item.price) });
          setLoading(false);
        })
        .catch((err) => showToast(err.message, "error"));
    }
  }, [id, showToast]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const price = parsePrice(form.price);
  const category = categories.find((c) => c.id === Number(form.categoryId));

  async function onUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("image", file);
    setUploading(true);
    try {
      const { url } = await api("/uploads", { method: "POST", form: data });
      set("image")(url);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name,
      description: form.description,
      price: price ?? "",
      categoryId: Number(form.categoryId),
      image: form.image,
      available: form.available,
      featured: form.featured,
    };
    try {
      await api(id ? `/items/${id}` : "/items", { method: id ? "PUT" : "POST", body });
      // This page stays mounted in the background, so start fresh next time.
      if (!id) setForm({ ...EMPTY, categoryId: form.categoryId });
      router.push("/admin");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm(`«${form.name}» از منو حذف شود؟`)) return;
    try {
      await api(`/items/${id}`, { method: "DELETE" });
      router.push("/admin");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-3xl bg-paper" aria-busy="true" />;

  return (
    <>
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1.5 text-sm text-roast hover:text-espresso">
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به آیتم‌ها
      </Link>
      <PageTitle title={id ? `ویرایش «${form.name}»` : "آیتم جدید"} />

      <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[18rem_1fr]">
        <div className="space-y-3">
          <ItemImage item={form} icon={category?.icon} className="aspect-square rounded-3xl border border-line" />
          <input ref={fileInput} type="file" accept="image/*" onChange={onUpload} className="hidden" />
          <div className="flex gap-2">
            <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} className={`${buttonClass.secondary} flex-1`}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {uploading ? "در حال آپلود…" : form.image ? "تغییر عکس" : "افزودن عکس"}
            </button>
            {form.image && (
              <button type="button" onClick={() => set("image")(null)} className={buttonClass.danger} aria-label="حذف عکس">
                <X className="size-4" />
              </button>
            )}
          </div>
          <p className="text-xs leading-5 text-roast">عکس با گوشی هم قابل آپلود است؛ به‌صورت خودکار فشرده و بهینه می‌شود.</p>
        </div>

        <div className="space-y-5 rounded-3xl border border-line bg-paper p-5 sm:p-6">
          <Field label="نام آیتم">
            <input value={form.name} onChange={(e) => set("name")(e.target.value)} required maxLength={80} placeholder="مثلاً: لاته" className={inputClass} />
          </Field>

          <Field label="توضیحات" hint="مواد اصلی یا نکته‌ای که مشتری باید بداند (اختیاری).">
            <textarea
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              maxLength={300}
              rows={3}
              className={`${inputClass} h-auto py-2.5 leading-7`}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="قیمت (تومان)" hint={price !== null ? toman(price) : "فقط عدد وارد کنید."}>
              <input
                value={form.price}
                onChange={(e) => set("price")(e.target.value)}
                onBlur={() => price !== null && set("price")(faNumber(price))}
                inputMode="numeric"
                required
                placeholder="۱۵۰٬۰۰۰"
                className={inputClass}
              />
            </Field>
            <Field label="دسته‌بندی">
              <select value={form.categoryId} onChange={(e) => set("categoryId")(e.target.value)} required className={inputClass}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="divide-y divide-line rounded-2xl border border-line">
            <Toggle label="موجود است" hint="اگر خاموش باشد، در منو با برچسب «ناموجود» نمایش داده می‌شود." checked={form.available} onChange={set("available")} />
            <Toggle label="پیشنهاد ما" hint="در بخش پیشنهادهای ویژه‌ی منو و صفحه‌ی اصلی نمایش داده می‌شود." checked={form.featured} onChange={set("featured")} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="submit" disabled={saving || uploading} className={buttonClass.primary}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {id ? "ذخیره‌ی تغییرات" : "افزودن به منو"}
            </button>
            {id && (
              <button type="button" onClick={onDelete} className={`${buttonClass.danger} ms-auto`}>
                <Trash2 className="size-4" />
                حذف آیتم
              </button>
            )}
          </div>
        </div>
      </form>
      {toast}
    </>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-roast">{hint}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
