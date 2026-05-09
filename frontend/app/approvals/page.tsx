"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { api, Assignment, AuthUser, getAuth } from "@/lib/api";
import { Check, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";

type ApprovalTab = "SUBMITTED" | "APPROVED" | "REJECTED";

export default function ApprovalsPage() {
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
      setError(err instanceof Error ? err.message : "Could not load approvals");
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
        setError(err instanceof Error ? err.message : "Please log in again.");
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
      setNotice(status === "APPROVED" ? "Feedback approved successfully." : "Feedback rejected and returned for resubmission.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update approval");
    }
  }

  function keepPending(name: string) {
    setError("");
    setNotice(`${name}'s feedback is still pending review.`);
  }

  return (
    <Guard>
      <PageHeader title="Pending Approvals" subtitle="Review submitted feedback before finalizing" />
      {loading && <div className="mb-4 rounded-md border border-line bg-white p-4 text-sm text-muted">Loading...</div>}
      {!loading && !canManage && (
        <div className="mb-4 rounded-md border border-line bg-white p-4 text-sm text-muted">
          Only Admin or Manager users can access approvals. Log in again with an Admin or Manager account.
        </div>
      )}
      {!loading && canManage && (
      <>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["SUBMITTED", "Pending"],
          ["APPROVED", "Approved"],
          ["REJECTED", "Rejected"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value as ApprovalTab)}
            className={tab === value ? "bg-brand text-white" : "border border-line bg-white hover:bg-panel"}
          >
            {label}
          </button>
        ))}
      </div>
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">{notice}</div>}
      <div className="overflow-hidden rounded-md border border-line bg-white">
        {items.map(a => (
          <div key={a.id} className="flex items-center justify-between border-b border-line p-4 last:border-0">
            <div>
              <div className="font-medium">{a.cycleTitle}</div>
              <div className="text-sm text-muted">{a.assignedToName} - {a.status}</div>
            </div>
            {tab === "SUBMITTED" && (
              <div className="flex flex-wrap gap-2">
                <button title="Approve" onClick={() => decide(a.id, "APPROVED")} className="flex items-center gap-2 border border-line text-brand"><Check size={16} /> Approve</button>
                <button title="Keep pending" onClick={() => keepPending(a.assignedToName)} className="flex items-center gap-2 border border-line text-muted"><Clock size={16} /> Pending</button>
                <button title="Reject" onClick={() => decide(a.id, "REJECTED")} className="flex items-center gap-2 border border-line text-red-700"><X size={16} /> Reject</button>
              </div>
            )}
          </div>
        ))}
        {!items.length && <div className="p-4 text-sm text-muted">No {tab === "SUBMITTED" ? "pending" : tab.toLowerCase()} approvals found.</div>}
      </div>
      </>
      )}
    </Guard>
  );
}
