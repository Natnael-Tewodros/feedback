"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { api, Cycle, Question } from "@/lib/api";
import { ChevronDown, ChevronUp, Copy, Edit3, FileQuestion, Layers, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReuseLibraryPage() {
  const t = useTranslations("ReuseLibrary");
  const tQuestions = useTranslations("Questions");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  async function load() {
    const [q, c] = await Promise.all([api<Question[]>("/api/questions"), api<Cycle[]>("/api/cycles")]);
    setQuestions(q); setCycles(c);
  }
  useEffect(() => { load().catch(console.error); }, []);

  async function cloneCycle(cycle: Cycle) {
    await api(`/api/cycles/${cycle.id}/clone`, {
      method: "POST",
      body: JSON.stringify({ title: `${cycle.title} Copy`, description: cycle.description })
    });
    await load();
  }

  function typeLabel(question: Pick<Question, "type" | "ratingMin" | "ratingMax" | "choices">) {
    if (question.type === "TEXT") return tQuestions("type_text");
    if (question.type === "RATING") return tQuestions("rating_range", { min: question.ratingMin ?? 1, max: question.ratingMax ?? 5 });
    if (question.type === "YES_NO") return tQuestions("type_yes_no");
    return tQuestions("mcq_summary", { choices: (question.choices ?? []).map(c => c.label).join(", ") });
  }

  function toggleQuestion(id: number) {
    setExpandedQuestions((current) => ({ ...current, [id]: current[id] === false }));
  }

  function QuestionPreview({ question }: { question: Question }) {
    if (question.type === "TEXT") {
      return (
        <textarea
          disabled
          rows={3}
          className="w-full resize-none rounded-md border border-gray-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm dark:text-slate-300"
          placeholder={tQuestions("text_answer_placeholder")}
        />
      );
    }
    if (question.type === "RATING") {
      const min = question.ratingMin ?? 1;
      const max = question.ratingMax ?? 5;
      const steps = Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => min + i);
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {steps.map((value) => (
              <button key={value} type="button" disabled className="h-10 w-10 rounded-md border-2 border-gray-200 dark:border-slate-800 p-0 text-sm font-semibold text-gray-600 dark:text-slate-400">
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{tQuestions("rating_low", { value: min })}</span>
            <span>{tQuestions("rating_high", { value: max })}</span>
          </div>
        </div>
      );
    }
    if (question.type === "YES_NO") {
      return (
        <div className="flex gap-3">
          <button type="button" disabled className="flex-1 rounded-md border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {tCommon("yes")}
          </button>
          <button type="button" disabled className="flex-1 rounded-md border-2 border-red-400 bg-red-50 dark:bg-red-900/20 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">
            {tCommon("no")}
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {(question.choices ?? []).map((choice) => (
          <label key={choice.id} className="group flex cursor-default items-center gap-3">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 dark:border-slate-600" />
            <span className="text-sm text-gray-700 dark:text-slate-300">{choice.label}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <Guard>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-slate-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                <FileQuestion size={16} />
              </span>
              {t("questions")}
            </div>
            <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 text-xs text-muted dark:text-slate-400">{questions.length}</span>
          </div>
          {questions.length === 0 && (
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-muted dark:text-slate-400">{t("empty_questions")}</div>
          )}
          {questions.map((q, index) => (
            <div key={q.id} className="overflow-hidden rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/50 bg-gray-50 dark:bg-slate-800/50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30 text-xs font-bold text-brand dark:text-sky-400">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 dark:text-slate-200">
                  {q.text || tQuestions("untitled_question")}
                </span>
                <span className="hidden text-xs text-gray-400 sm:block">{typeLabel(q)}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={expandedQuestions[q.id] === false ? tQuestions("expand") : tQuestions("collapse")}
                    onClick={() => toggleQuestion(q.id)}
                    className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-300"
                  >
                    {expandedQuestions[q.id] === false ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                  <button
                    type="button"
                    title={tQuestions("edit_question")}
                    onClick={() => router.push(`/${locale}/questions?edit=${q.id}`)}
                    className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-300"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    title={t("clone_question")}
                    onClick={() => api(`/api/questions/${q.id}/clone`, { method: "POST" }).then(load)}
                    className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-300"
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    type="button"
                    title={tQuestions("delete_question")}
                    onClick={() => api(`/api/questions/${q.id}`, { method: "DELETE" }).then(load)}
                    className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {expandedQuestions[q.id] !== false && (
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-sm font-semibold leading-snug text-gray-800 dark:text-slate-200">{q.text}</p>
                    <p className="mt-1 text-xs text-gray-400">{typeLabel(q)}</p>
                  </div>
                  <QuestionPreview question={q} />
                </div>
              )}
            </div>
          ))}
        </section>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-slate-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                <Layers size={16} />
              </span>
              {t("feedback_cycles")}
            </div>
            <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 text-xs text-muted dark:text-slate-400">{cycles.length}</span>
          </div>
          {cycles.length === 0 && (
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-muted dark:text-slate-400">{t("empty_cycles")}</div>
          )}
          {cycles.map((c, index) => (
            <div key={c.id} className="overflow-hidden rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/50 bg-gray-50 dark:bg-slate-800/50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30 text-xs font-bold text-brand dark:text-sky-400">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 dark:text-slate-200">
                  {c.title}
                </span>
                <span className="hidden text-xs text-gray-400 sm:block">{t("cycle_summary", { status: c.status, count: c.questionIds.length })}</span>
                <button
                  type="button"
                  title={t("clone_cycle")}
                  onClick={() => cloneCycle(c)}
                  className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-300"
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </Guard>
  );
}
