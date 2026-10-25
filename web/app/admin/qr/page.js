"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { Field, PageTitle, buttonClass, inputClass } from "@/components/admin/ui";
import { api } from "@/lib/api";
import { faNumber, parsePrice } from "@/lib/format";

const MAX_TABLES = 60;

const noSubscribe = () => () => {};

export default function QrPage() {
  // Until the admin types a domain, use the address this panel is open on.
  const origin = useSyncExternalStore(noSubscribe, () => window.location.origin, () => "");
  const [customUrl, setCustomUrl] = useState(null);
  const baseUrl = customUrl ?? origin;
  const [tables, setTables] = useState("۸");
  const [cafeName, setCafeName] = useState("");
  const [cards, setCards] = useState([]);

  useEffect(() => {
    api("/cafe")
      .then((cafe) => setCafeName(cafe?.name ?? ""))
      .catch(() => {});
  }, []);

  const tableCount = Math.min(parsePrice(tables) ?? 0, MAX_TABLES);

  // Draw a printable card (café name, QR code, table number) for the general menu and each table.
  useEffect(() => {
    if (!baseUrl || !cafeName) return;
    let cancelled = false;
    const root = baseUrl.replace(/\/+$/, "");
    const specs = [
      { key: "menu", url: `${root}/menu`, title: "منوی دیجیتال" },
      ...Array.from({ length: tableCount }, (_, i) => ({
        key: `table-${i + 1}`,
        url: `${root}/menu?table=${i + 1}`,
        title: `میز ${faNumber(i + 1)}`,
      })),
    ];
    Promise.all(specs.map(async (s) => ({ ...s, image: await renderCard({ ...s, cafeName }) }))).then((result) => {
      if (!cancelled) setCards(result);
    });
    return () => {
      cancelled = true;
    };
  }, [baseUrl, cafeName, tableCount]);

  return (
    <>
      <div className="no-print">
        <PageTitle title="QR کد منو" subtitle="کارت‌ها را چاپ کنید و روی میزها بگذارید؛ هر میز کد مخصوص خودش را دارد.">
          <button onClick={() => window.print()} className={buttonClass.primary}>
            <Printer className="size-4" aria-hidden="true" />
            چاپ همه
          </button>
        </PageTitle>

        <div className="grid gap-4 rounded-3xl border border-line bg-paper p-5 sm:grid-cols-[1fr_10rem]">
          <Field label="آدرس سایت" hint="بعد از انتشار سایت، دامنه‌ی اصلی کافه را اینجا وارد کنید.">
            <input value={baseUrl} onChange={(e) => setCustomUrl(e.target.value)} dir="ltr" className={inputClass} />
          </Field>
          <Field label="تعداد میزها" hint={`حداکثر ${faNumber(MAX_TABLES)}`}>
            <input value={tables} onChange={(e) => setTables(e.target.value)} inputMode="numeric" className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 print:mt-0 print:grid-cols-3 print:gap-6">
        {cards.map((card) => (
          <figure key={card.key} className="break-inside-avoid">
            <img src={card.image} alt={`QR کد ${card.title}`} className="w-full rounded-3xl shadow-sm shadow-espresso/10 print:shadow-none" />
            <a
              href={card.image}
              download={`qr-${card.key}.png`}
              className="no-print mt-2 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium text-roast hover:bg-paper"
            >
              <Download className="size-4" aria-hidden="true" />
              دانلود
            </a>
          </figure>
        ))}
      </div>
    </>
  );
}

async function renderCard({ url, title, cafeName }) {
  const W = 600;
  const H = 780;
  const font = getComputedStyle(document.body).fontFamily;
  await Promise.all([document.fonts.load(`800 40px ${font}`), document.fonts.load(`500 24px ${font}`)]);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.direction = "rtl";
  ctx.textAlign = "center";

  ctx.fillStyle = "#fbf6ef";
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 40);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, W, 150, [40, 40, 0, 0]);
  ctx.clip();
  ctx.fillStyle = "#2b1d14";
  ctx.fillRect(0, 0, W, 150);
  ctx.fillStyle = "#e46f24";
  ctx.beginPath();
  ctx.arc(40, 10, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#fbf6ef";
  ctx.font = `800 44px ${font}`;
  ctx.fillText(cafeName, W / 2, 92);

  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, url, { width: 400, margin: 1, errorCorrectionLevel: "M", color: { dark: "#2b1d14", light: "#ffffff" } });
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 220, 190, 440, 440, 32);
  ctx.fill();
  ctx.drawImage(qr, W / 2 - 200, 210, 400, 400);

  ctx.fillStyle = "#2b1d14";
  ctx.font = `800 40px ${font}`;
  ctx.fillText(title, W / 2, 692);
  ctx.fillStyle = "#75594a";
  ctx.font = `500 24px ${font}`;
  ctx.fillText("برای دیدن منو، کد را اسکن کنید", W / 2, 738);

  return canvas.toDataURL("image/png");
}
