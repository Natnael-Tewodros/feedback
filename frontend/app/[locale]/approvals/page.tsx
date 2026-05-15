"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { api, Assignment, AuthUser, getAuth } from "@/lib/api";
import { Check, Clock, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type ApprovalTab = "SUBMITTED" | "APPROVED" | "REJECTED";

export default function ApprovalsPage() {
  const t = useTranslations("Approvals");
  const tCommon = useTranslations("Common");
  const [items, setItems] = useState<Assignment[]>([]);
  const [tab, setTab] = useState<ApprovalTab>("SUBMITTED");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const canManage = auth?.roles.some((role) => role === "ADMIN" || role === "MANAGER") ?? false;

  async function load(status = tab) {
    try {
      setError("");
      setItems(await api<Assignment[]>(`/api/approvals?status=${status}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("load_error"));
    }
  }

  useEffect(() => {
    async function boot() {
      setLoading(true);
      try {
        const storedAuth = getAuth();
        const serverAuth = await api<AuthUser>("/api/auth/me");
        const merged = { ...serverAuth, token: storedAuth?.token ?? null };
        localStorage.setItem("auth", JSON.stringify(merged));
        setAuth(merged);
        if (merged.roles.some((role) => role === "ADMIN" || role === "MANAGER")) {
          await load(tab);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("login_again"));
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, [tab]);

  async function decide(id: number, status: "APPROVED" | "REJECTED") {
    try {
      setError("");
      setNotice("");
      await api(`/api/approvals/assignments/${id}`, { method: "POST", body: JSON.stringify({ status, comments: status.toLowerCase() }) });
      setNotice(status === "APPROVED" ? t("approve_success") : t("reject_success"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("update_error"));
    }
  }

  function keepPending(name: string) {
    setError("");
    setNotice(t("still_pending", { name }));
  }

  return (
    <Guard>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {loading && <div className="mb-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-muted dark:text-slate-400">{tCommon("loading")}</div>}
      {!loading && !canManage && (
        <div className="mb-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-muted dark:text-slate-400">
          {t("view_only")}
        </div>
      )}
      {!loading && canManage && (
      <>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["SUBMITTED", t("pending")],
          ["APPROVED", t("approved")],
          ["REJECTED", t("rejected")]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value as ApprovalTab)}
            className={tab === value ? "bg-brand text-white" : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}
          >
            {label}
          </button>
        ))}
      </div>
      {error && <div className="mb-4 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}
      {notice && <div className="mb-4 rounded-md border border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 p-3 text-sm text-teal-800 dark:text-teal-400">{notice}</div>}
      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {items.map(a => (
          <div key={a.id} className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4 last:border-0">
            <div>
              <div className="font-medium dark:text-slate-100">{a.cycleTitle}</div>
              <div className="text-sm text-muted dark:text-slate-400">{a.assignedToName} - {a.status}</div>
            </div>
            {tab === "SUBMITTED" && (
              <div className="flex flex-wrap gap-2">
                <button title={t("approve")} onClick={() => decide(a.id, "APPROVED")} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-brand dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md px-3 py-1.5"><Check size={16} /> {t("approve")}</button>
                <button title={t("keep_pending")} onClick={() => keepPending(a.assignedToName)} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-muted dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md px-3 py-1.5"><Clock size={16} /> {t("pending")}</button>
                <button title={t("reject")} onClick={() => decide(a.id, "REJECTED")} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-red-700 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md px-3 py-1.5"><X size={16} /> {t("reject")}</button>
              </div>
            )}
          </div>
        ))}
        {!items.length && <div className="p-4 text-sm text-muted dark:text-slate-400">{t("none_found", { status: tab === "SUBMITTED" ? t("pending_lower") : tab.toLowerCase() })}</div>}
      </div>
      </>
      )}
    </Guard>
  );
}
