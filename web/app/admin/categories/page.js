"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import CategoryIcon, { CATEGORY_ICONS } from "@/components/CategoryIcon";
import { PageTitle, buttonClass, inputClass, useToast } from "@/components/admin/ui";
import { api } from "@/lib/api";
import { faNumber } from "@/lib/format";

export default function CategoriesPage() {
  const [categories, setCategories] = useState(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("coffee");
  const [pickerFor, setPickerFor] = useState(null);
  const [toast, showToast] = useToast();

  useEffect(() => {
    api("/categories")
      .then(setCategories)
      .catch((err) => showToast(err.message, "error"));
  }, [showToast]);

  async function add(e) {
    e.preventDefault();
    try {
      const created = await api("/categories", { method: "POST", body: { name, icon } });
      setCategories((list) => [...list, { ...created, _count: { items: 0 } }]);
      setName("");
      showToast(`دسته‌ی «${created.name}» اضافه شد`);
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function update(category, changes) {
    const next = { ...category, ...changes };
    setCategories((list) => list.map((c) => (c.id === category.id ? next : c)));
    try {
      await api(`/categories/${category.id}`, { method: "PUT", body: { name: next.name, icon: next.icon } });
      showToast("ذخیره شد");
    } catch (err) {
      setCategories((list) => list.map((c) => (c.id === category.id ? category : c)));
      showToast(err.message, "error");
    }
  }

  async function move(index, step) {
    const previous = categories;
    const list = [...categories];
    [list[index], list[index + step]] = [list[index + step], list[index]];
    setCategories(list);
    try {
      await api("/categories/reorder", { method: "POST", body: { ids: list.map((c) => c.id) } });
    } catch (err) {
      setCategories(previous);
      showToast(err.message, "error");
    }
  }

  async function remove(category) {
    if (!confirm(`دسته‌ی «${category.name}» حذف شود؟`)) return;
    try {
      await api(`/categories/${category.id}`, { method: "DELETE" });
      setCategories((list) => list.filter((c) => c.id !== category.id));
      showToast("حذف شد");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <>
      <PageTitle title="دسته‌بندی‌ها" subtitle="ترتیب دسته‌ها همان ترتیبی است که مشتری در منو می‌بیند." />

      <form onSubmit={add} className="rounded-3xl border border-line bg-paper p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold">دسته‌ی جدید</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} placeholder="مثلاً: نوشیدنی‌های فصل" className={inputClass} />
          <button type="submit" className={`${buttonClass.primary} shrink-0`}>
            <Plus className="size-4" aria-hidden="true" />
            افزودن
          </button>
        </div>
        <IconPicker value={icon} onChange={setIcon} />
      </form>

      <ul className="mt-5 space-y-3">
        {!categories && [0, 1, 2].map((i) => <li key={i} className="h-24 animate-pulse rounded-3xl bg-paper" />)}
        {categories?.map((c, index) => (
          <li key={c.id} className="rounded-3xl border border-line bg-paper p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button onClick={() => move(index, -1)} disabled={index === 0} className="rounded-lg p-1 text-roast hover:bg-cream disabled:opacity-30" aria-label="بالاتر">
                  <ChevronUp className="size-4" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === categories.length - 1}
                  className="rounded-lg p-1 text-roast hover:bg-cream disabled:opacity-30"
                  aria-label="پایین‌تر"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
              <button
                onClick={() => setPickerFor(pickerFor === c.id ? null : c.id)}
                aria-expanded={pickerFor === c.id}
                title="تغییر آیکون"
                aria-label={`تغییر آیکون ${c.name}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-naranj-soft text-naranj-dark ring-naranj/30 hover:ring-4"
              >
                <CategoryIcon icon={c.icon} className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                <input
                  defaultValue={c.name}
                  onBlur={(e) => e.target.value.trim() && e.target.value !== c.name && update(c, { name: e.target.value.trim() })}
                  aria-label="نام دسته"
                  className="w-full rounded-lg bg-transparent px-2 py-1 font-bold outline-none hover:bg-cream focus:bg-cream"
                />
                <p className="px-2 text-xs text-roast">{faNumber(c._count?.items ?? 0)} آیتم</p>
              </div>
              <button onClick={() => remove(c)} className="rounded-xl p-2.5 text-roast hover:bg-berry-soft hover:text-berry" aria-label={`حذف ${c.name}`}>
                <Trash2 className="size-4" />
              </button>
            </div>
            {pickerFor === c.id && (
              <IconPicker
                value={c.icon}
                onChange={(icon) => {
                  setPickerFor(null);
                  update(c, { icon });
                }}
                compact
              />
            )}
          </li>
        ))}
      </ul>
      {toast}
    </>
  );
}

function IconPicker({ value, onChange, compact }) {
  return (
    <div className={`mt-3 flex flex-wrap gap-1.5 ${compact ? "pr-14" : ""}`} role="radiogroup" aria-label="آیکون">
      {Object.entries(CATEGORY_ICONS).map(([key, { label }]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          title={label}
          aria-label={label}
          onClick={() => onChange(key)}
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${
            value === key ? "border-naranj bg-naranj-soft text-naranj-dark" : "border-line text-roast hover:bg-cream"
          }`}
        >
          <CategoryIcon icon={key} className="size-4" />
        </button>
      ))}
    </div>
  );
}
