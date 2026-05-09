"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { api, AuthUser, Cycle, getAuth, Question, UserSummary } from "@/lib/api";
import { Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export default function SendFeedbackPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [title, setTitle] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [cycleId, setCycleId] = useState<number | "">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const canManage = auth?.roles.some((role) => role === "ADMIN" || role === "MANAGER") ?? false;

  async function load() {
    const [q, u, c] = await Promise.all([api<Question[]>("/api/questions"), api<UserSummary[]>("/api/users"), api<Cycle[]>("/api/cycles")]);
    setQuestions(q); setUsers(u); setCycles(c);
  }
  useEffect(() => {
    async function boot() {
      setError("");
      setLoading(true);
      try {
        const storedAuth = getAuth();
        const serverAuth = await api<AuthUser>("/api/auth/me");
        const merged = { ...serverAuth, token: storedAuth?.token ?? null };
        localStorage.setItem("auth", JSON.stringify(merged));
        setAuth(merged);

        const allowed = merged.roles.some((role) => role === "ADMIN" || role === "MANAGER");
        if (allowed) {
          await load();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load send-feedback data");
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, []);

  function toggle(list: number[], id: number, set: (v: number[]) => void) {
    set(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  }

  async function createCycle(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!canManage) {
      setError("Only Admin or Manager users can create feedback cycles.");
      return;
    }
    if (!title.trim()) {
      setError("Cycle title is required.");
      return;
    }
    if (!selectedQuestions.length) {
      setError("Select at least one question before creating a cycle.");
      return;
    }
    try {
      const cycle = await api<Cycle>("/api/cycles", { method: "POST", body: JSON.stringify({ title: title.trim(), questionIds: selectedQuestions }) });
      setCycleId(cycle.id);
      setTitle("");
      setSelectedQuestions([]);
      setNotice(`Created cycle: ${cycle.title}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create cycle");
    }
  }

  async function send() {
    setError("");
    setNotice("");
    if (!canManage) {
      setError("Only Admin or Manager users can send feedback.");
      return;
    }
    if (!cycleId) {
      setError("Select a cycle first.");
      return;
    }
    if (!selectedUsers.length) {
      setError("Select at least one recipient.");
      return;
    }
    try {
      await api("/api/cycles/send", { method: "POST", body: JSON.stringify({ cycleId, userIds: selectedUsers }) });
      setSelectedUsers([]);
      setNotice("Feedback sent successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send feedback");
    }
  }

  return (
    <Guard>
      <PageHeader title="Send Feedback" subtitle="Create a cycle, attach questions, and assign it to users" />
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">{notice}</div>}
      {loading && <div className="rounded-md border border-line bg-white p-4 text-sm text-muted">Loading...</div>}
      {!loading && !canManage && (
        <div className="rounded-md border border-line bg-white p-4 text-sm text-muted">
          You can view and fill assigned feedback, but only Admin or Manager users can create cycles and send feedback.
        </div>
      )}
      {!loading && canManage && (
      <>
      <form onSubmit={createCycle} className="mb-5 rounded-md border border-line bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input placeholder="Cycle title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button type="submit" className="bg-brand text-white">Create Cycle</button>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {questions.map(q => (
            <label key={q.id} className="flex gap-2 text-sm">
              <input type="checkbox" checked={selectedQuestions.includes(q.id)} onChange={() => toggle(selectedQuestions, q.id, setSelectedQuestions)} /> {q.text}
            </label>
          ))}
        </div>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-line bg-white p-4">
          <h2 className="font-semibold">Cycle</h2>
          <select className="mt-3" value={cycleId} onChange={(e) => setCycleId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Select cycle</option>
            {cycles.map(c => <option key={c.id} value={c.id}>{c.title} ({c.status})</option>)}
          </select>
        </div>
        <div className="rounded-md border border-line bg-white p-4">
          <h2 className="font-semibold">Recipients</h2>
          <div className="mt-3 space-y-2">
            {users.map(u => (
              <label key={u.id} className="flex gap-2 text-sm">
                <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggle(selectedUsers, u.id, setSelectedUsers)} /> {u.fullName} - {u.email}
              </label>
            ))}
          </div>
          <button type="button" disabled={!cycleId || !selectedUsers.length} onClick={send} className="mt-4 flex items-center gap-2 bg-brand text-white disabled:opacity-50"><Send size={16} /> Send</button>
        </div>
      </div>
      </>
      )}
    </Guard>
  );
}
