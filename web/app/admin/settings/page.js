"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Field, PageTitle, buttonClass, inputClass, useToast } from "@/components/admin/ui";
import { api } from "@/lib/api";

const FIELDS = [
  { key: "name", label: "نام کافه", required: true },
  { key: "tagline", label: "شعار", hint: "در صفحه‌ی اصلی سایت نمایش داده می‌شود." },
  { key: "hours", label: "ساعات کاری", placeholder: "همه‌روزه ۸ صبح تا ۱۲ شب" },
  { key: "phone", label: "تلفن" },
  { key: "address", label: "آدرس" },
  { key: "instagram", label: "اینستاگرام", placeholder: "بدون @", ltr: true },
];

export default function SettingsPage() {
  const [cafe, setCafe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();

  useEffect(() => {
    api("/cafe")
      .then((data) => setCafe(data ?? {}))
      .catch((err) => showToast(err.message, "error"));
  }, [showToast]);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const { name, tagline, about, phone, address, hours, instagram } = cafe;
    try {
      setCafe(await api("/cafe", { method: "PUT", body: { name, tagline, about, phone, address, hours, instagram } }));
      showToast("اطلاعات کافه ذخیره شد");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!cafe) return <div className="h-96 animate-pulse rounded-3xl bg-paper" aria-busy="true" />;

  const set = (key) => (e) => setCafe((c) => ({ ...c, [key]: e.target.value }));

  return (
    <>
      <PageTitle title="اطلاعات کافه" subtitle="این اطلاعات در منو و صفحه‌ی اصلی سایت نمایش داده می‌شود." />
      <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-line bg-paper p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map(({ key, label, hint, placeholder, required, ltr }) => (
            <Field key={key} label={label} hint={hint}>
              <input
                value={cafe[key] ?? ""}
                onChange={set(key)}
                required={required}
                placeholder={placeholder}
                dir={ltr ? "ltr" : undefined}
                className={inputClass}
              />
            </Field>
          ))}
        </div>
        <Field label="درباره‌ی کافه">
          <textarea value={cafe.about ?? ""} onChange={set("about")} rows={4} maxLength={600} className={`${inputClass} h-auto py-2.5 leading-7`} />
        </Field>
        <button type="submit" disabled={saving} className={buttonClass.primary}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          ذخیره
        </button>
      </form>
      {toast}
    </>
  );
}
