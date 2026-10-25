"use client";

import { RefreshCw } from "lucide-react";

export default function MenuError({ retry }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-bold">منو در حال حاضر در دسترس نیست</p>
      <p className="mt-2 text-sm text-roast">لطفاً چند لحظه‌ی دیگر دوباره تلاش کنید یا از همکاران ما بپرسید.</p>
      <button
        onClick={() => retry()}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-naranj px-5 py-2.5 text-sm font-semibold text-white hover:bg-naranj-dark"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        تلاش دوباره
      </button>
    </div>
  );
}
