import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: { default: "پنل مدیریت", template: "%s | پنل مدیریت" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
