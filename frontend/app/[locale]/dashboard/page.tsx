"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { ClipboardCheck, FileQuestion, Library, Send, ShieldCheck, TableProperties } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function DashboardPage() {
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const modules = [
    { href: "questions", title: t("questions_title"), text: t("questions_text"), icon: FileQuestion },
    { href: "send-feedback", title: t("send_title"), text: t("send_text"), icon: Send },
    { href: "fill-feedback", title: t("fill_title"), text: t("fill_text"), icon: ClipboardCheck },
    { href: "approvals", title: t("approvals_title"), text: t("approvals_text"), icon: ShieldCheck },
    { href: "reuse-library", title: t("reuse_title"), text: t("reuse_text"), icon: Library },
    { href: "reports", title: t("reports_title"), text: t("reports_text"), icon: TableProperties }
  ];

  return (
    <Guard>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.href}
              href={`/${locale}/${module.href}`}
              className="group rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-md border border-teal-100 bg-teal-50 p-2.5 text-brand transition group-hover:bg-brand group-hover:text-white">
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-ink">{module.title}</div>
                  <div className="mt-1 text-sm leading-6 text-muted">{module.text}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Guard>
  );
}
