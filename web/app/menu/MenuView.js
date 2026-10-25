"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Coffee, Search, Sparkles, X } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import ItemImage from "@/components/ItemImage";
import { faNumber, toman } from "@/lib/format";

// Make Persian search forgiving: Arabic ي/ك, half-spaces and extra spaces all match.
const normalize = (text = "") =>
  text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").replace(/\s+/g, " ").trim();

export default function MenuView({ initialMenu, table }) {
  const [menu, setMenu] = useState(initialMenu);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(initialMenu.categories[0]?.id);
  const [updated, setUpdated] = useState(false);
  const chipBar = useRef(null);
  const jumping = useRef(false);
  const { cafe } = menu;

  // Live updates: the API pushes an event whenever the admin changes the menu.
  useEffect(() => {
    const source = new EventSource("/api/menu/stream");
    let timer;
    source.addEventListener("menu-updated", async () => {
      const res = await fetch("/api/menu", { cache: "no-store" }).catch(() => null);
      if (!res?.ok) return;
      setMenu(await res.json());
      setUpdated(true);
      clearTimeout(timer);
      timer = setTimeout(() => setUpdated(false), 2500);
    });
    return () => {
      source.close();
      clearTimeout(timer);
    };
  }, []);

  const q = normalize(query);
  const categories = useMemo(() => {
    if (!q) return menu.categories;
    return menu.categories
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => normalize(`${i.name} ${i.description ?? ""}`).includes(q)),
      }))
      .filter((c) => c.items.length > 0);
  }, [menu, q]);

  const featured = useMemo(
    () =>
      menu.categories.flatMap((c) => c.items.filter((i) => i.featured && i.available).map((i) => ({ ...i, icon: c.icon }))),
    [menu],
  );

  // Highlight the chip of the section under the sticky header: the last section
  // whose top has scrolled past the header line (or the last one at the page end).
  useEffect(() => {
    let frame = null;
    const update = () => {
      frame = null;
      if (jumping.current) return;
      const sections = [...document.querySelectorAll("[data-section]")];
      const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = sections[0];
      for (const s of sections) if (s.getBoundingClientRect().top <= header + 24) current = s;
      if (atEnd) current = sections.at(-1);
      if (current) setActiveId(Number(current.dataset.id));
    };
    const onScroll = () => {
      frame ??= requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [categories]);

  // Keep the active chip centred in the horizontal bar (works in RTL too).
  useEffect(() => {
    const bar = chipBar.current;
    const chip = bar?.querySelector(`[data-chip="${activeId}"]`);
    if (!chip) return;
    const barBox = bar.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    bar.scrollBy({ left: chipBox.left + chipBox.width / 2 - (barBox.left + barBox.width / 2), behavior: "smooth" });
  }, [activeId]);

  // While the page glides to a tapped category, keep that chip highlighted
  // instead of flickering through every section on the way.
  function jumpTo(id) {
    setActiveId(id);
    jumping.current = true;
    const release = () => {
      jumping.current = false;
      clearTimeout(fallback);
    };
    const fallback = setTimeout(release, 1500); // browsers without the scrollend event
    window.addEventListener("scrollend", release, { once: true });
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-cream/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 pt-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-naranj text-white shadow-sm shadow-naranj/30">
                <Coffee className="size-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-extrabold leading-tight">{cafe?.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-roast">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-leaf" />
                  </span>
                  قیمت‌ها و موجودی به‌روز
                </span>
              </span>
            </Link>
            {table && (
              <span className="rounded-full bg-espresso px-3.5 py-1.5 text-sm font-semibold text-cream">
                میز {faNumber(table)}
              </span>
            )}
          </div>

          <label className="relative mt-4 block">
            <span className="sr-only">جستجو در منو</span>
            <Search className="pointer-events-none absolute inset-y-0 right-3.5 my-auto size-5 text-roast" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو؛ مثلاً لاته، کیک…"
              className="h-11 w-full rounded-2xl border border-line bg-paper pr-11 pl-10 text-[15px] outline-none placeholder:text-roast/60 focus:border-naranj focus:ring-4 focus:ring-naranj/15"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute inset-y-0 left-2 my-auto flex size-7 items-center justify-center rounded-full text-roast hover:bg-cream"
                aria-label="پاک کردن جستجو"
              >
                <X className="size-4" />
              </button>
            )}
          </label>

          <nav ref={chipBar} className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-3" aria-label="دسته‌بندی‌ها">
            {categories.map((c) => (
              <button
                key={c.id}
                data-chip={c.id}
                onClick={() => jumpTo(c.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                  activeId === c.id
                    ? "border-espresso bg-espresso text-cream"
                    : "border-line bg-paper text-espresso hover:border-roast/40"
                }`}
              >
                <CategoryIcon icon={c.icon} className="size-4" />
                {c.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        {!q && featured.length > 0 && (
          <section className="pt-6" aria-labelledby="featured-title">
            <h2 id="featured-title" className="flex items-center gap-2 text-base font-bold">
              <Sparkles className="size-5 text-naranj" aria-hidden="true" />
              پیشنهاد ما
            </h2>
            <div className="no-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
              {featured.map((item) => (
                <article key={item.id} className="w-44 shrink-0 snap-start overflow-hidden rounded-3xl bg-paper shadow-sm shadow-espresso/5">
                  <ItemImage item={item} icon={item.icon} className="aspect-square" />
                  <div className="p-3">
                    <h3 className="truncate font-bold">{item.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-naranj-dark">{toman(item.price)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {categories.length === 0 && (
          <p className="py-20 text-center text-roast">موردی با «{query}» پیدا نشد.</p>
        )}

        {categories.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} data-section data-id={c.id} className="menu-section pt-8">
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <CategoryIcon icon={c.icon} className="size-6 text-naranj" />
              {c.name}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {c.items.map((item) => (
                <MenuItem key={item.id} item={item} icon={c.icon} />
              ))}
            </div>
          </section>
        ))}

        {cafe && (
          <footer className="mt-14 border-t border-line pt-6 text-center text-sm leading-7 text-roast">
            {cafe.hours && <p>{cafe.hours}</p>}
            {cafe.address && <p>{cafe.address}</p>}
            <p className="mt-2 text-xs text-roast/70">قیمت‌ها به تومان است.</p>
          </footer>
        )}
      </main>

      <div
        role="status"
        className={`fixed inset-x-0 bottom-5 z-30 mx-auto w-fit rounded-full bg-espresso px-4 py-2 text-sm text-cream shadow-lg transition-all duration-300 ${
          updated ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        منو به‌روز شد
      </div>
    </div>
  );
}

function MenuItem({ item, icon }) {
  const soldOut = !item.available;
  return (
    <article className={`flex gap-3 rounded-3xl bg-paper p-3 shadow-sm shadow-espresso/5 ${soldOut ? "opacity-70" : ""}`}>
      <ItemImage item={item} icon={icon} muted={soldOut} className="size-24 shrink-0 rounded-2xl" />
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-7">{item.name}</h3>
          {item.featured && !soldOut && (
            <span className="shrink-0 rounded-full bg-naranj-soft px-2 py-0.5 text-[11px] font-semibold text-naranj-dark">پیشنهاد ما</span>
          )}
        </div>
        {item.description && <p className="mt-0.5 line-clamp-2 text-sm leading-6 text-roast">{item.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className={`font-bold ${soldOut ? "text-roast line-through decoration-1" : "text-naranj-dark"}`}>{toman(item.price)}</span>
          {soldOut && (
            <span className="rounded-full bg-berry-soft px-2.5 py-0.5 text-xs font-semibold text-berry">ناموجود</span>
          )}
        </div>
      </div>
    </article>
  );
}
