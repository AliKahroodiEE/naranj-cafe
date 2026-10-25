"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Coffee, LogIn } from "lucide-react";
import { api } from "@/lib/api";
import { Field, buttonClass, inputClass } from "@/components/admin/ui";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setLoading(true);
    setError("");
    try {
      await api("/auth/login", {
        method: "POST",
        body: { username: form.get("username"), password: form.get("password") },
      });
      // The page stays mounted in the background after navigating, so clear the password.
      formEl.reset();
      router.replace("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-3xl bg-paper p-7 shadow-xl shadow-espresso/5">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-naranj text-white">
          <Coffee className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold">ورود به پنل مدیریت</h1>
        <p className="mt-1 text-sm text-roast">منو، قیمت‌ها و موجودی را از همین‌جا مدیریت کنید.</p>

        <div className="mt-6 space-y-4">
          <Field label="نام کاربری">
            <input name="username" autoComplete="username" dir="ltr" required className={inputClass} />
          </Field>
          <Field label="رمز عبور">
            <input name="password" type="password" autoComplete="current-password" dir="ltr" required className={inputClass} />
          </Field>
        </div>

        {error && <p className="mt-4 rounded-xl bg-berry-soft px-3 py-2.5 text-sm text-berry">{error}</p>}

        <button type="submit" disabled={loading} className={`${buttonClass.primary} mt-6 w-full`}>
          <LogIn className="size-4 -scale-x-100" aria-hidden="true" />
          {loading ? "در حال ورود…" : "ورود"}
        </button>
      </form>
    </div>
  );
}
