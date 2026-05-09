"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { ClipboardCheck, FileQuestion, Library, Send, ShieldCheck, TableProperties } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const modules = [
    { href: "/questions", title: "Manage Questions", text: "Create and update question banks.", icon: FileQuestion },
    { href: "/send-feedback", title: "Send Feedback", text: "Build cycles and assign users.", icon: Send },
    { href: "/fill-feedback", title: "Fill Feedback", text: "Open assigned forms and submit answers.", icon: ClipboardCheck },
    { href: "/approvals", title: "Pending Approvals", text: "Approve or reject submitted feedback.", icon: ShieldCheck },
    { href: "/reuse-library", title: "Reuse Library", text: "Clone previous questions and cycles.", icon: Library },
    { href: "/reports", title: "Reports", text: "Review cycle summaries and export-ready metrics.", icon: TableProperties }
  ];

  return (
    <Guard>
      <PageHeader title="Dashboard" subtitle="Quick navigation for every feedback workflow" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href} className="rounded-md border border-line bg-white p-4 hover:border-brand hover:shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-panel p-2 text-brand">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="font-semibold">{module.title}</div>
                  <div className="mt-1 text-sm text-muted">{module.text}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Guard>
  );
}
