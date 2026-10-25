"use client";

import { useCallback, useRef, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

export const inputClass =
  "h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-[15px] outline-none placeholder:text-roast/50 focus:border-naranj focus:ring-4 focus:ring-naranj/15";

export const buttonClass = {
  primary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-naranj px-5 text-sm font-bold text-white hover:bg-naranj-dark disabled:opacity-60",
  secondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-espresso hover:bg-cream disabled:opacity-60",
  danger:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-berry hover:bg-berry-soft disabled:opacity-60",
};

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-roast">{hint}</span>}
    </label>
  );
}

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:opacity-60 ${
        checked ? "bg-leaf" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${checked ? "right-6" : "right-1"}`}
      />
    </button>
  );
}

// Minimal toast: const [toast, show] = useToast(); show("ذخیره شد"); render {toast}
export function useToast() {
  const [state, setState] = useState(null);
  const timer = useRef();
  const show = useCallback((message, type = "success") => {
    setState({ message, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState(null), 3000);
  }, []);

  const toast = state && (
    <div
      role="status"
      className={`fixed inset-x-0 bottom-24 z-40 mx-auto flex w-fit max-w-[90vw] items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-8 ${
        state.type === "error" ? "bg-berry" : "bg-espresso"
      }`}
    >
      {state.type === "error" ? <CircleAlert className="size-5 shrink-0" /> : <CircleCheck className="size-5 shrink-0 text-leaf-soft" />}
      {state.message}
    </div>
  );
  return [toast, show];
}

export function PageTitle({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-roast">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
