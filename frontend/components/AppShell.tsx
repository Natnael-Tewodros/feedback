"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ClipboardCheck, FileQuestion, Library, LogOut, Menu, Send, ShieldCheck, TableProperties } from "lucide-react";
import { getAuth } from "@/lib/api";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const tCommon = useTranslations("Common");
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const auth = getAuth();

  const nav = [
    { href: `/${locale}/dashboard`, label: t("dashboard"), icon: BarChart3 },
    { href: `/${locale}/questions`, label: t("questions"), icon: FileQuestion },
    { href: `/${locale}/send-feedback`, label: t("send_feedback"), icon: Send },
    { href: `/${locale}/fill-feedback`, label: t("fill_feedback"), icon: ClipboardCheck },
    { href: `/${locale}/approvals`, label: t("approvals"), icon: ShieldCheck },
    { href: `/${locale}/reuse-library`, label: t("reuse_library"), icon: Library },
    { href: `/${locale}/reports`, label: t("reports"), icon: TableProperties }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Login page should not show shell, but must also respect locale segment
  if (pathname === `/${locale}/login`) return <>{children}</>;

  function logout() {
    localStorage.removeItem("auth");
    router.push(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <aside
        className={`fixed inset-y-0 left-0 hidden border-r border-slate-200 bg-white p-4 shadow-sm md:block ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="mb-7 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? "sr-only" : ""}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm">
              <img src="/images/insalogo.jpeg" alt="Insa FMs" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">Insa FMs</div>
              <div className="text-xs text-muted">Feedback workspace</div>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-ink"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={16} />
          </button>
        </div>
        <nav className="space-y-1.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-md border px-3 py-2.5 text-sm font-medium ${
                  isCollapsed ? "justify-center" : "gap-2"
                } ${active ? "border-teal-100 bg-teal-50 text-brand" : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-ink"}`}
              >
                <Icon size={16} />
                <span className={isCollapsed ? "sr-only" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className={isCollapsed ? "md:pl-16" : "md:pl-64"}>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
          <div>
            <div className="text-sm font-semibold text-ink">{mounted ? (auth?.fullName ?? tCommon("guest")) : tCommon("guest")}</div>
            <div className="text-xs text-muted">{auth?.roles?.join(", ") || tCommon("guest")}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-slate-600">
              <LocaleSwitcher />
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-ink"
            >
              <LogOut size={16} /> {t("logout")}
            </button>
          </div>
        </header>
        <div className="p-5 md:p-6">{children}</div>
      </main>
    </div>
  );
}
