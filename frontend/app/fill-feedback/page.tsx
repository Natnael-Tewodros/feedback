"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { api, Assignment, Cycle, Question } from "@/lib/api";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function FillFeedbackPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignmentId, setAssignmentId] = useState<number | "">("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const [a, c, q] = await Promise.all([api<Assignment[]>("/api/responses/my-assignments"), api<Cycle[]>("/api/cycles").catch(() => []), api<Question[]>("/api/questions")]);
      setAssignments(a); setCycles(c); setQuestions(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load assignments");
    }
  }
  useEffect(() => { load().catch(console.error); }, []);

  const selected = assignments.find(a => a.id === assignmentId);
  const cycle = cycles.find(c => c.id === selected?.cycleId);
  const cycleQuestions = useMemo(() => questions.filter(q => cycle?.questionIds.includes(q.id)), [questions, cycle]);
  const canSubmit = selected?.status === "PENDING" || selected?.status === "REJECTED";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!assignmentId) {
      setError("Select an assignment first.");
      return;
    }
    if (!cycleQuestions.length) {
      setError("This assignment has no questions available.");
      return;
    }
    for (const q of cycleQuestions) {
      const value = answers[q.id];
      if (value === undefined || value === "") {
        setError(`Answer required: ${q.text}`);
        return;
      }
      if (q.type === "RATING") {
        const rating = Number(value);
        if (!Number.isInteger(rating) || rating < (q.ratingMin ?? 1) || rating > (q.ratingMax ?? 5)) {
          setError(`Rating must be between ${q.ratingMin ?? 1} and ${q.ratingMax ?? 5}: ${q.text}`);
          return;
        }
      }
    }

    const payload = cycleQuestions.map(q => {
      const value = answers[q.id];
      return {
        questionId: q.id,
        answerText: q.type === "TEXT" ? value : undefined,
        ratingValue: q.type === "RATING" ? Number(value) : undefined,
        yesNoValue: q.type === "YES_NO" ? value === "true" : undefined,
        choiceId: q.type === "MCQ" ? Number(value) : undefined
      };
    });
    try {
      await api(`/api/responses/assignments/${assignmentId}`, { method: "POST", body: JSON.stringify({ answers: payload }) });
      setAnswers({});
      setNotice("Feedback submitted successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit feedback");
    }
  }

  return (
    <Guard>
      <PageHeader title="Fill Feedback" subtitle="Submit answers for assigned feedback cycles" />
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">{notice}</div>}
      <div className="mb-5 rounded-md border border-line bg-white p-4">
        <select value={assignmentId} onChange={(e) => { setAssignmentId(e.target.value ? Number(e.target.value) : ""); setAnswers({}); setError(""); setNotice(""); }}>
          <option value="">Select assignment</option>
          {assignments.map(a => <option key={a.id} value={a.id}>{a.cycleTitle} - {a.status}</option>)}
        </select>
      </div>
      {selected && !canSubmit && (
        <div className="rounded-md border border-line bg-white p-4 text-sm text-muted">
          This assignment is {selected.status.toLowerCase()} and cannot be submitted again.
        </div>
      )}
      {selected && canSubmit && (
        <form onSubmit={submit} className="space-y-4">
          {cycleQuestions.map(q => (
            <div key={q.id} className="rounded-md border border-line bg-white p-4">
              <label className="block text-sm font-medium">{q.text}</label>
              <div className="mt-3">
                {q.type === "TEXT" && <textarea rows={3} value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
                {q.type === "RATING" && <input type="number" min={q.ratingMin ?? 1} max={q.ratingMax ?? 5} value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
                {q.type === "YES_NO" && (
                  <div className="flex gap-6 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name={`question-${q.id}`} value="true" checked={answers[q.id] === "true"} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} /> Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name={`question-${q.id}`} value="false" checked={answers[q.id] === "false"} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} /> No
                    </label>
                  </div>
                )}
                {q.type === "MCQ" && (
                  <div className="space-y-2 text-sm">
                    {q.choices.map(c => (
                      <label key={c.id} className="flex items-center gap-2">
                        <input type="radio" name={`question-${q.id}`} value={c.id} checked={answers[q.id] === String(c.id)} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                        {c.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <button className="bg-brand text-white">Submit Feedback</button>
        </form>
      )}
    </Guard>
  );
}
