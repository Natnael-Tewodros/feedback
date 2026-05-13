"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ClipboardCheck,
  FileQuestion,
  Library,
  LogOut,
  Send,
  ShieldCheck,
  TableProperties,
} from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const auth = getAuth();

  const nav = [
    { href: `/${locale}/dashboard`, label: t("dashboard"), icon: BarChart3 },
    { href: `/${locale}/questionnaires`, label: t("questions"), icon: FileQuestion },
    { href: `/${locale}/send-feedback`, label: t("send_feedback"), icon: Send },
    { href: `/${locale}/fill-feedback`, label: t("fill_feedback"), icon: ClipboardCheck },
    { href: `/${locale}/approvals`, label: t("approvals"), icon: ShieldCheck },
    { href: `/${locale}/reuse-library`, label: t("reuse_library"), icon: Library },
    { href: `/${locale}/reports`, label: t("reports"), icon: TableProperties },
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
      {/* ── Sidebar ── */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white shadow-sm transition-[width] duration-200 ease-out md:flex",
          isExpanded ? "w-64" : "w-[60px]"
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-[64px] shrink-0 items-center px-[14px] mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm">
              <img src="/images/insalogo.jpeg" alt="Insa FMs" className="h-6 w-6 object-contain" />
            </div>
            <div className={cn(
              "flex flex-col min-w-0 transition-all duration-200",
              "opacity-0 -translate-x-3 invisible pointer-events-none",
              "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:visible group-hover/sidebar:pointer-events-auto"
            )}>
              <span className="text-sm font-semibold text-ink truncate">Insa FMs</span>
              <span className="text-[10px] text-slate-400 truncate">Feedback workspace</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-x-hidden px-2 space-y-4">
          <nav className="space-y-1">
            <p className={cn(
              "px-3 text-[9px] font-bold tracking-[0.2em] text-slate-400/60 uppercase transition-all duration-200",
              "opacity-0 mb-0 -translate-x-3 pointer-events-none h-0",
              "group-hover/sidebar:opacity-100 group-hover/sidebar:mb-1.5 group-hover/sidebar:translate-x-0 group-hover/sidebar:pointer-events-auto group-hover/sidebar:h-auto"
            )}>
              Portal
            </p>
            <div className="space-y-1 focus-visible:outline-none">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group/item flex items-center h-[40px] rounded-xl transition-all duration-200 relative",
                      isActive
                        ? "text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-ink"
                    )}
                    style={isActive ? { backgroundColor: '#1e3a5f' } : undefined}
                  >
                    <div className="flex w-[44px] h-full items-center justify-center shrink-0">
                      <div className={cn(
                        "flex items-center justify-center rounded-lg transition-transform duration-200 group-hover/item:scale-110",
                        isActive ? "text-white" : "text-slate-500"
                      )}>
                        <Icon
                          className="h-[20px] w-[20px]"
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </div>
                    </div>

                    <span className={cn(
                      "text-[13px] font-medium tracking-tight whitespace-nowrap transition-all duration-200",
                      "opacity-0 -translate-x-3 invisible pointer-events-none",
                      "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:visible group-hover/sidebar:pointer-events-auto"
                    )}>
                      {item.label}
                    </span>

                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full" style={{ backgroundColor: '#5a8cc8' }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Footer / Profile & Logout */}
        <div className="mt-auto px-2 py-2 space-y-1 border-t border-slate-200/60 text-xs">
          <div className={cn("flex items-center h-[32px] rounded-lg px-2 transition-all duration-200", "group-hover/sidebar:bg-slate-50")}>
            <div className="flex w-[30px] items-center justify-center shrink-0">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]" style={{ backgroundColor: '#1e3a5f' }}>
                {mounted && auth?.fullName ? auth.fullName[0].toUpperCase() : "G"}
              </div>
            </div>
            <div className={cn(
              "ml-2 flex flex-col min-w-0 transition-all duration-200",
              "opacity-0 -translate-x-3 invisible pointer-events-none",
              "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:visible group-hover/sidebar:pointer-events-auto"
            )}>
              <span className="text-[11px] font-semibold truncate text-ink leading-tight">
                {mounted ? (auth?.fullName ?? tCommon("guest")) : tCommon("guest")}
              </span>
              <span className="text-[9px] text-slate-400 truncate leading-tight">
                {mounted ? (auth?.roles?.join(", ") || tCommon("guest")) : tCommon("guest")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="group/logout flex items-center h-[32px] w-full rounded-lg transition-all duration-200 text-slate-500 hover:bg-red-50 hover:text-red-600 text-[11px]"
          >
            <div className="flex w-[30px] h-full items-center justify-center shrink-0">
              <LogOut className="h-[16px] w-[16px] group-hover/logout:scale-110 transition-transform" strokeWidth={2} />
            </div>
            <span className={cn(
              "font-medium transition-all duration-200",
              "opacity-0 -translate-x-3 invisible pointer-events-none",
              "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:visible group-hover/sidebar:pointer-events-auto"
            )}>
              {t("logout")}
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={cn("transition-[padding] duration-200 ease-out", isExpanded ? "md:pl-64" : "md:pl-[60px]")}>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
          <div>
            <div className="text-sm font-semibold text-ink">{mounted ? (auth?.fullName ?? tCommon("guest")) : tCommon("guest")}</div>
            <div className="text-xs text-slate-400">{auth?.roles?.join(", ") || tCommon("guest")}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-slate-600">
              <LocaleSwitcher />
            </div>
          </div>
        </header>
        <div className="p-5 md:p-6">{children}</div>
      </main>
    </div>
  );
}
