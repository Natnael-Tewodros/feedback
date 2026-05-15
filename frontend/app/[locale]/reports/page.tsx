"use client";

import { Guard } from "@/components/Guard";
import { api, Cycle, ReportQuestion, SurveyReport } from "@/lib/api";
import { DonutChart, ProgressRing } from "@/components/charts";
import { AlertTriangle, BarChart3, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  SENT: "bg-emerald-100 text-emerald-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-gray-100 text-gray-500",
  DRAFT: "bg-amber-100 text-amber-600",
  ARCHIVED: "bg-red-50 text-red-500"
};

type DraftFilters = { dateFrom: string; dateTo: string };

export default function ReportsPage() {
  const t = useTranslations("Reports");
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleId, setCycleId] = useState<number | "">("");
  const [report, setReport] = useState<SurveyReport | null>(null);
  const [draft, setDraft] = useState<DraftFilters>({ dateFrom: "", dateTo: "" });
  const [filters, setFilters] = useState<Partial<DraftFilters>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashStats, setDashStats] = useState<any>(null);
  const selectedCycle = useMemo(() => cycles.find((cycle) => cycle.id === cycleId), [cycles, cycleId]);

  async function loadCycles() {
    const cycleData = await api<Cycle[]>("/api/cycles");
    setCycles(cycleData);
    if (cycleData.length === 0) setLoading(false);
    setCycleId((current) => current || cycleData[0]?.id || "");
  }

  async function loadReport(targetCycleId = cycleId) {
    if (!targetCycleId) {
      setReport(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (filters.dateFrom) query.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) query.set("dateTo", filters.dateTo);
      const suffix = query.toString() ? `?${query}` : "";
      setReport(await api<SurveyReport>(`/api/reports/${targetCycleId}${suffix}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("load_error"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCycles().catch((err) => setError(err instanceof Error ? err.message : t("load_error")));
    api("/api/dashboard").then(setDashStats).catch(console.error);
  }, []);
  useEffect(() => { loadReport().catch(console.error); }, [cycleId, filters]);

  function applyFilters() {
    setFilters({ dateFrom: draft.dateFrom || undefined, dateTo: draft.dateTo || undefined });
  }

  function clearFilters() {
    setDraft({ dateFrom: "", dateTo: "" });
    setFilters({});
  }

  const averageRating = useMemo(() => {
    const values = report?.questions.map(q => q.averageRating).filter((value): value is number => typeof value === "number") ?? [];
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }, [report]);

  return (
    <Guard>
      <div className="-m-5 min-h-[calc(100vh-57px)] bg-gray-50 dark:bg-slate-950">
        <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex items-center gap-2 whitespace-nowrap text-lg font-bold text-brand">
                <BarChart3 size={20} /> {t("title")}
              </span>
              <span className="text-gray-300">/</span>
              <span className="truncate text-sm text-gray-500">{report?.title ?? selectedCycle?.title ?? t("select_cycle")}</span>
            </div>
            <button onClick={() => loadReport()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600">
              <RefreshCw size={15} /> {t("refresh")}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
          {dashStats && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-slate-500 mb-4 w-full text-left uppercase tracking-wider">Response Rate</h3>
                <ProgressRing value={dashStats.responseRate || 0} label="Completed" size={120} stroke={10} color="#1e3a5f" />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm md:col-span-2">
                <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Assignment Status</h3>
                <div className="flex h-[140px] items-center">
                  <DonutChart
                    data={[
                      { label: "Submitted", value: dashStats.submittedAssignments || 0, color: "#1e3a5f" },
                      { label: "Pending", value: Math.max(0, (dashStats.totalAssignments || 0) - (dashStats.submittedAssignments || 0)), color: "#94a3b8" }
                    ]}
                    total={dashStats.totalAssignments || 0}
                    size={140}
                    thickness={24}
                  />
                </div>
              </div>
            </div>
          )}
          {loading && (
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-52 animate-pulse rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button onClick={() => loadReport()} className="text-sm text-brand underline hover:text-sky-800">
                {t("try_again")}
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-6 rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">{report?.title ?? t("select_cycle")}</h1>
                  <p className="mt-0.5 text-sm text-gray-400">
                    {report ? t("generated", { date: new Date(report.generatedAt).toLocaleString() }) : t("choose_cycle_report")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  <Metric label={t("total_responses")} value={(report?.totalResponses ?? 0).toLocaleString()} />
                  <Metric label={t("questions")} value={report?.questions.length ?? 0} />
                  <Metric label={t("average_rating")} value={averageRating === null ? t("not_available") : averageRating.toFixed(2)} />
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[report?.status ?? selectedCycle?.status ?? ""] ?? "bg-gray-100 text-gray-500"}`}>
                    {report?.status ?? selectedCycle?.status ?? t("not_available")}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3 rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm">
                <Field label={t("feedback_cycle")} value={String(cycleId)} onChange={(value) => setCycleId(value ? Number(value) : "")}>
                  <option value="">{t("select_cycle")}</option>
                  {cycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>{cycle.title} ({cycle.status})</option>
                  ))}
                </Field>
                <Field label={t("from")} type="date" value={draft.dateFrom} onChange={(value) => setDraft((current) => ({ ...current, dateFrom: value }))} />
                <Field label={t("to")} type="date" value={draft.dateTo} onChange={(value) => setDraft((current) => ({ ...current, dateTo: value }))} />
                <button onClick={applyFilters} className="bg-brand text-white hover:bg-sky-800">{t("apply")}</button>
                <button onClick={clearFilters} className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800">{t("clear")}</button>
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="self-center text-xs text-brand">
                    {t("filtered", { from: filters.dateFrom ?? "...", to: filters.dateTo ?? "..." })}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {report?.questions.map((question, index) => (
                  <QuestionReportCard key={question.questionId} question={question} index={index} />
                ))}
                {report && report.questions.length === 0 && (
                  <div className="rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm text-gray-500 dark:text-slate-400">{t("no_questions")}</div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </Guard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

function Field({ label, type, value, onChange, children }: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-w-36 flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</label>
      {children ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm">
          {children}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
      )}
    </div>
  );
}

function QuestionReportCard({ question, index }: { question: ReportQuestion; index: number }) {
  const t = useTranslations("Reports");
  const maxChoiceCount = Math.max(1, ...question.choices.map(choice => choice.count));

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/50 bg-gray-50 dark:bg-slate-800/50 px-4 py-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30 text-xs font-bold text-brand dark:text-sky-400">{index + 1}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 dark:text-slate-200">{question.text}</span>
        <span className="hidden text-xs text-gray-400 sm:block">{question.type}</span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-5 text-sm">
          <Metric label={t("responses")} value={question.responseCount} />
          {question.averageRating !== null && question.averageRating !== undefined && <Metric label={t("average_rating")} value={question.averageRating.toFixed(2)} />}
          {question.yesCount !== null && question.yesCount !== undefined && <Metric label={t("yes")} value={question.yesCount} />}
          {question.noCount !== null && question.noCount !== undefined && <Metric label={t("no")} value={question.noCount} />}
        </div>

        {question.choices.length > 0 && (
          <div className="space-y-2">
            {question.choices.map((choice) => (
              <div key={choice.choiceId}>
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>{choice.label}</span>
                  <span>{choice.count}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.round((choice.count / maxChoiceCount) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {question.textAnswers.length > 0 && (
          <div className="space-y-2">
            {question.textAnswers.slice(0, 5).map((answer, answerIndex) => (
              <div key={`${question.questionId}-${answerIndex}`} className="rounded-md border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 p-3 text-sm text-gray-700 dark:text-slate-300">{answer}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
