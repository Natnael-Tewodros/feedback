"use client";

import { Guard } from "@/components/Guard";
import { api, Assignment, Cycle, Question } from "@/lib/api";
import { AlertCircle, CheckCircle2, ClipboardList, Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function FillFeedbackPage() {
  const t = useTranslations("FillFeedback");
  const tCommon = useTranslations("Common");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignmentId, setAssignmentId] = useState<number | "">("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const [a, c, q] = await Promise.all([api<Assignment[]>("/api/responses/my-assignments"), api<Cycle[]>("/api/cycles").catch(() => []), api<Question[]>("/api/questions")]);
      setAssignments(a); setCycles(c); setQuestions(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("load_error"));
    } finally {
      setLoading(false);
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
      setError(t("assignment_required"));
      return;
    }
    if (!cycleQuestions.length) {
      setError(t("no_questions"));
      return;
    }
    for (const q of cycleQuestions) {
      const value = answers[q.id];
      if (value === undefined || value === "") {
        setError(t("answer_required", { question: q.text }));
        return;
      }
      if (q.type === "RATING") {
        const rating = Number(value);
        if (!Number.isInteger(rating) || rating < (q.ratingMin ?? 1) || rating > (q.ratingMax ?? 5)) {
          setError(t("rating_between", { min: q.ratingMin ?? 1, max: q.ratingMax ?? 5, question: q.text }));
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
      setSubmitting(true);
      await api(`/api/responses/assignments/${assignmentId}`, { method: "POST", body: JSON.stringify({ answers: payload }) });
      setAnswers({});
      setSubmitted(true);
      setNotice(t("submit_success"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submit_error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Guard>
      <div className="-m-5 min-h-[calc(100vh-57px)] bg-gradient-to-br from-sky-50 via-white to-teal-50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-brand" />
            </div>
          )}

          {!loading && error && !selected && (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-700">
                <AlertCircle size={34} />
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">{t("unavailable_title")}</h2>
              <p className="text-slate-500">{error}</p>
            </div>
          )}

          {!loading && submitted && (
            <div className="py-20 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={42} />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-950">{t("thank_you")}</h2>
              <p className="text-slate-500">{notice || t("recorded")}</p>
            </div>
          )}

          {!loading && !submitted && (
            <>
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                  <ClipboardList size={26} />
                </div>
                <h1 className="text-2xl font-bold text-slate-950">{cycle?.title ?? t("title")}</h1>
                <p className="mt-2 text-slate-500">{cycle?.description || t("subtitle")}</p>
                {cycle?.endDate && (
                  <p className="mt-2 text-sm font-medium text-amber-700">
                    {t("closes", { date: new Date(cycle.endDate).toLocaleDateString() })}
                  </p>
                )}
              </div>

              <div className="mb-5 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <select value={assignmentId} onChange={(e) => { setAssignmentId(e.target.value ? Number(e.target.value) : ""); setAnswers({}); setError(""); setNotice(""); }}>
                  <option value="">{t("select_assignment")}</option>
                  {assignments.map(a => <option key={a.id} value={a.id}>{a.cycleTitle} - {a.status}</option>)}
                </select>
              </div>

              {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}

              {selected && !canSubmit && (
                <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                  {t("cannot_resubmit", { status: selected.status.toLowerCase() })}
                </div>
              )}

              {selected && canSubmit && (
                <form onSubmit={submit} className="space-y-4">
                  {cycleQuestions.map((q, index) => (
                    <div key={q.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                      <label className="flex items-start gap-3 text-sm font-semibold text-slate-900">
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-50 text-xs text-brand">{index + 1}</span>
                        {q.text}
                      </label>
                      <div className="mt-4">
                        {q.type === "TEXT" && <textarea rows={4} value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
                        {q.type === "RATING" && (
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: (q.ratingMax ?? 5) - (q.ratingMin ?? 1) + 1 }, (_, i) => (q.ratingMin ?? 1) + i).map(value => (
                              <label key={value} className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${answers[q.id] === String(value) ? "border-brand bg-sky-50 text-brand" : "border-slate-200 bg-white text-slate-700"}`}>
                                <input className="sr-only" type="radio" name={`question-${q.id}`} value={value} checked={answers[q.id] === String(value)} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                                {value}
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === "YES_NO" && (
                          <div className="flex gap-3 text-sm">
                            <label className={`cursor-pointer rounded-md border px-4 py-2 ${answers[q.id] === "true" ? "border-brand bg-sky-50 text-brand" : "border-slate-200 bg-white text-slate-700"}`}>
                              <input className="sr-only" type="radio" name={`question-${q.id}`} value="true" checked={answers[q.id] === "true"} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} /> {tCommon("yes")}
                            </label>
                            <label className={`cursor-pointer rounded-md border px-4 py-2 ${answers[q.id] === "false" ? "border-brand bg-sky-50 text-brand" : "border-slate-200 bg-white text-slate-700"}`}>
                              <input className="sr-only" type="radio" name={`question-${q.id}`} value="false" checked={answers[q.id] === "false"} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} /> {tCommon("no")}
                            </label>
                          </div>
                        )}
                        {q.type === "MCQ" && (
                          <div className="space-y-2 text-sm">
                            {q.choices.map(c => (
                              <label key={c.id} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 ${answers[q.id] === String(c.id) ? "border-brand bg-sky-50 text-brand" : "border-slate-200 bg-white text-slate-700"}`}>
                                <input type="radio" name={`question-${q.id}`} value={c.id} checked={answers[q.id] === String(c.id)} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                                {c.label}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button disabled={submitting} className="flex w-full items-center justify-center gap-2 bg-brand text-white disabled:opacity-60">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {submitting ? t("submitting") : t("submit")}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-xs text-slate-400">{t("powered_by")}</p>
            </>
          )}
        </div>
      </div>
    </Guard>
  );
}
