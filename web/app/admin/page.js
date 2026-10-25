"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, PackageX, Pencil, Plus, Search, Star, Tags, UtensilsCrossed } from "lucide-react";
import ItemImage from "@/components/ItemImage";
import { PageTitle, Switch, buttonClass, inputClass, useToast } from "@/components/admin/ui";
import { api } from "@/lib/api";
import { faNumber, parsePrice, toman } from "@/lib/format";

export default function ItemsPage() {
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [toast, showToast] = useToast();

  // Re-runs every time the page becomes visible again, so the list is always fresh.
  useEffect(() => {
    Promise.all([api("/items"), api("/categories")])
      .then(([items, categories]) => {
        setItems(items);
        setCategories(categories);
      })
      .catch((err) => showToast(err.message, "error"));
  }, [showToast]);

  // Optimistic quick edit: update the list immediately, roll back if the server refuses.
  async function patch(item, changes, successMessage) {
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, ...changes } : i)));
    try {
      await api(`/items/${item.id}`, { method: "PATCH", body: changes });
      showToast(successMessage);
    } catch (err) {
      setItems((list) => list.map((i) => (i.id === item.id ? item : i)));
      showToast(err.message, "error");
    }
  }

  const visible = useMemo(() => {
    if (!items) return [];
    return items.filter((i) => {
      if (filter === "soldout" && i.available) return false;
      if (typeof filter === "number" && i.categoryId !== filter) return false;
      return !query.trim() || i.name.includes(query.trim());
    });
  }, [items, filter, query]);

  const iconOf = (categoryId) => categories.find((c) => c.id === categoryId)?.icon;
  const soldOutCount = items?.filter((i) => !i.available).length ?? 0;

  return (
    <>
      <PageTitle title="آیتم‌های منو" subtitle="قیمت و موجودی را مستقیم از همین فهرست تغییر دهید؛ منو بلافاصله به‌روز می‌شود.">
        <Link href="/admin/items/new" className={buttonClass.primary}>
          <Plus className="size-4" aria-hidden="true" />
          آیتم جدید
        </Link>
      </PageTitle>

      <div className="grid grid-cols-3 gap-3">
        <Stat Icon={UtensilsCrossed} label="آیتم‌ها" value={items?.length} />
        <Stat Icon={Tags} label="دسته‌بندی‌ها" value={categories.length} />
        <Stat Icon={PackageX} label="ناموجود" value={items ? soldOutCount : undefined} tone={soldOutCount ? "berry" : undefined} />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative md:w-64">
          <span className="sr-only">جستجوی آیتم</span>
          <Search className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-roast" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی آیتم…" className={`${inputClass} pr-9`} />
        </label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>همه</Chip>
          <Chip active={filter === "soldout"} onClick={() => setFilter("soldout")}>ناموجودها</Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-paper">
        {!items &&
          [0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse border-b border-line last:border-0" />)}
        {items && visible.length === 0 && <p className="py-16 text-center text-roast">آیتمی پیدا نشد.</p>}
        {visible.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            icon={iconOf(item.categoryId)}
            onToggle={(available) => patch(item, { available }, available ? `«${item.name}» موجود شد` : `«${item.name}» ناموجود شد`)}
            onFeature={() => patch(item, { featured: !item.featured }, item.featured ? "از پیشنهادها حذف شد" : "به پیشنهادها اضافه شد")}
            onPrice={(price) => patch(item, { price }, `قیمت «${item.name}» به ${toman(price)} تغییر کرد`)}
          />
        ))}
      </div>
      {toast}
    </>
  );
}

function ItemRow({ item, icon, onToggle, onFeature, onPrice }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  // Enter submits and the input then loses focus; this keeps us from saving twice.
  const saved = useRef(false);

  function startEdit() {
    saved.current = false;
    setDraft(faNumber(item.price));
    setEditing(true);
  }

  function savePrice(e) {
    e.preventDefault();
    if (saved.current) return;
    saved.current = true;
    const price = parsePrice(draft);
    setEditing(false);
    if (price !== null && price !== item.price) onPrice(price);
  }

  return (
    <div className="flex items-center gap-3 border-b border-line p-3 last:border-0 sm:gap-4 sm:px-4">
      <ItemImage item={item} icon={icon} muted={!item.available} className="size-14 shrink-0 rounded-2xl" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`truncate font-bold ${item.available ? "" : "text-roast"}`}>{item.name}</p>
          <button
            onClick={onFeature}
            aria-label={item.featured ? "حذف از پیشنهادها" : "افزودن به پیشنهادها"}
            title="پیشنهاد ما"
            className="shrink-0 rounded-full p-1 hover:bg-cream"
          >
            <Star className={`size-4 ${item.featured ? "fill-naranj text-naranj" : "text-line"}`} />
          </button>
        </div>
        <p className="text-xs text-roast">{item.category?.name}</p>

        {editing ? (
          <form onSubmit={savePrice} className="mt-1 flex items-center gap-1.5">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={savePrice}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              aria-label={`قیمت ${item.name}`}
              className="h-9 w-32 rounded-lg border border-naranj bg-paper px-2.5 text-sm outline-none ring-4 ring-naranj/15"
            />
            <button type="submit" className="flex size-9 items-center justify-center rounded-lg bg-naranj text-white" aria-label="ذخیره‌ی قیمت">
              <Check className="size-4" />
            </button>
          </form>
        ) : (
          <button onClick={startEdit} className="mt-0.5 text-sm font-semibold text-naranj-dark underline decoration-dotted underline-offset-4">
            {toman(item.price)}
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <Switch checked={item.available} onChange={onToggle} label={`موجودی ${item.name}`} />
        <span className={`text-[11px] ${item.available ? "text-leaf" : "text-berry"}`}>{item.available ? "موجود" : "ناموجود"}</span>
      </div>

      <Link href={`/admin/items/${item.id}`} className="flex size-10 shrink-0 items-center justify-center rounded-xl text-roast hover:bg-cream" aria-label={`ویرایش ${item.name}`}>
        <Pencil className="size-4" />
      </Link>
    </div>
  );
}

function Stat({ Icon, label, value, tone }) {
  return (
    <div className="rounded-3xl border border-line bg-paper p-4">
      <Icon className={`size-5 ${tone === "berry" ? "text-berry" : "text-naranj"}`} aria-hidden="true" />
      <p className="mt-3 text-2xl font-extrabold">{value === undefined ? "–" : faNumber(value)}</p>
      <p className="text-xs text-roast">{label}</p>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium ${
        active ? "border-espresso bg-espresso text-cream" : "border-line bg-paper hover:border-roast/40"
      }`}
    >
      {children}
    </button>
  );
}
