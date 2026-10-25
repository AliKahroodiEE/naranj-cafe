"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Coffee, ExternalLink, LayoutList, LogOut, QrCode, Settings, Tags } from "lucide-react";
import { api } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "آیتم‌ها", Icon: LayoutList },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", Icon: Tags },
  { href: "/admin/qr", label: "QR کد", Icon: QrCode },
  { href: "/admin/settings", label: "تنظیمات", Icon: Settings },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  // Every API route checks the login cookie itself; here we only send
  // signed-out visitors (or expired sessions) to the login page.
  useEffect(() => {
    if (isLogin) return;
    const toLogin = () => router.replace("/admin/login");
    api("/auth/me").catch(toLogin);
    // Fired by lib/api.js when any request gets 401.
    window.addEventListener("admin:unauthorized", toLogin);
    return () => window.removeEventListener("admin:unauthorized", toLogin);
  }, [isLogin, router]);

  if (isLogin) return children;

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  }

  const isActive = (href) => (href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/items") : pathname.startsWith(href));

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="no-print sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-naranj text-white">
              <Coffee className="size-5" aria-hidden="true" />
            </span>
            <span className="font-extrabold">پنل مدیریت</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive(href) ? "bg-naranj-soft text-naranj-dark" : "text-roast hover:bg-cream"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/menu" target="_blank" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-roast hover:bg-cream">
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">مشاهده‌ی منو</span>
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-roast hover:bg-cream">
              <LogOut className="size-4 -scale-x-100" aria-hidden="true" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      {/* Bottom tab bar for phones: staff mostly edit the menu from their phone. */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${isActive(href) ? "text-naranj-dark" : "text-roast"}`}
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
