import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, CalendarCheck, Clock, Coffee, AtSign, MapPin, Phone, QrCode } from "lucide-react";
import ItemImage from "@/components/ItemImage";
import { getMenu } from "@/lib/server-api";
import { toman } from "@/lib/format";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const { cafe, categories } = await getMenu();
  const featured = categories
    .flatMap((c) => c.items.filter((i) => i.featured && i.available).map((i) => ({ ...i, icon: c.icon })))
    .slice(0, 3);

  const info = [
    { Icon: Clock, label: "ساعات کاری", value: cafe.hours },
    { Icon: MapPin, label: "آدرس", value: cafe.address },
    { Icon: Phone, label: "تلفن", value: cafe.phone },
    { Icon: AtSign, label: "اینستاگرام", value: cafe.instagram && `@${cafe.instagram}` },
  ].filter((i) => i.value);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-naranj text-white">
            <Coffee className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold">{cafe.name}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium sm:gap-2">
          <a href="#about" className="hidden rounded-full px-3 py-2 hover:bg-paper sm:block">درباره ما</a>
          <a href="#visit" className="hidden rounded-full px-3 py-2 hover:bg-paper sm:block">ساعات و آدرس</a>
          <Link href="/menu" className="rounded-full bg-espresso px-4 py-2 text-cream hover:bg-espresso/90">منو</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 pt-6 pb-14 sm:px-6 sm:pt-12">
          <div className="relative overflow-hidden rounded-[2rem] bg-espresso px-6 py-14 text-cream sm:px-12 sm:py-20">
            <div className="absolute -top-24 -left-24 size-48 rounded-full bg-naranj/90 blur-[2px] sm:size-72" aria-hidden="true" />
            <div className="absolute -bottom-32 left-28 size-56 rounded-full bg-naranj-dark/50" aria-hidden="true" />
            <div className="relative max-w-lg">
              <p className="text-sm font-semibold text-naranj-soft/80">به {cafe.name} خوش آمدید</p>
              <h1 className="mt-3 text-4xl leading-tight font-black sm:text-5xl sm:leading-tight">{cafe.tagline}</h1>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 rounded-full bg-naranj px-6 py-3 font-bold text-white shadow-lg shadow-black/20 hover:bg-naranj-dark"
                >
                  مشاهده‌ی منو
                  <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-3 text-cream/80">
                  <CalendarCheck className="size-5" aria-hidden="true" />
                  رزرو آنلاین میز — به‌زودی
                </span>
              </div>
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-extrabold">پیشنهادهای ما</h2>
              <Link href="/menu" className="text-sm font-semibold text-naranj-dark hover:underline">همه‌ی منو</Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {featured.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-3xl bg-paper shadow-sm shadow-espresso/5">
                  <ItemImage item={item} icon={item.icon} className="aspect-[4/3]" />
                  <div className="p-5">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    {item.description && <p className="mt-1 text-sm leading-6 text-roast">{item.description}</p>}
                    <p className="mt-3 font-bold text-naranj-dark">{toman(item.price)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="about" className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 sm:px-6 md:grid-cols-5">
          <div className="rounded-3xl bg-paper p-7 md:col-span-3">
            <h2 className="text-2xl font-extrabold">درباره‌ی ما</h2>
            <p className="mt-4 leading-8 text-roast">{cafe.about}</p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl bg-naranj-soft p-7 md:col-span-2">
            <QrCode className="size-10 text-naranj-dark" aria-hidden="true" />
            <div>
              <h2 className="mt-6 text-xl font-extrabold">منوی دیجیتال سر میز</h2>
              <p className="mt-2 text-sm leading-7 text-roast">
                QR کد روی میز را اسکن کنید تا منوی به‌روز، قیمت‌ها و موجودی لحظه‌ای را ببینید.
              </p>
            </div>
          </div>
        </section>

        <section id="visit" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <h2 className="text-2xl font-extrabold">به ما سر بزنید</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {info.map(({ Icon, label, value }) => (
              <div key={label} className="rounded-3xl border border-line bg-paper p-5">
                <Icon className="size-6 text-naranj" aria-hidden="true" />
                <p className="mt-3 text-sm text-roast">{label}</p>
                <p className="mt-1 font-semibold" dir="auto">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-roast sm:flex-row sm:px-6">
          <p>© {cafe.name}</p>
          <p>نسخه‌ی نمایشی — طراحی و توسعه: علی کهرودی</p>
        </div>
      </footer>
    </div>
  );
}
