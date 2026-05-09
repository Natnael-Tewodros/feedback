"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ClipboardCheck, FileQuestion, Library, LogOut, Send, ShieldCheck, TableProperties } from "lucide-react";
import { getAuth } from "@/lib/api";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/questions", label: "Questions", icon: FileQuestion },
  { href: "/send-feedback", label: "Send", icon: Send },
  { href: "/fill-feedback", label: "Fill", icon: ClipboardCheck },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/reuse-library", label: "Reuse", icon: Library },
  { href: "/reports", label: "Reports", icon: TableProperties }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === "/login") return <>{children}</>;

  function logout() {
    localStorage.removeItem("auth");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-panel">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white p-4 md:block">
        <div className="mb-6 text-lg font-semibold">Feedback System</div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-brand text-white" : "text-ink hover:bg-panel"}`}>
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="md:pl-64">
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-3">
          <div className="font-medium">{mounted ? (auth?.fullName ?? "Guest") : "Guest"}</div>
          <button onClick={logout} className="flex items-center gap-2 border border-line bg-white hover:bg-panel">
            <LogOut size={16} /> Logout
          </button>
        </header>
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}
