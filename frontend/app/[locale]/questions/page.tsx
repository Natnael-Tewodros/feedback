"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { api, AuthUser, getAuth, Question, QuestionType } from "@/lib/api";
import { ChevronDown, ChevronUp, Copy, Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type QuestionForm = {
  text: string;
  type: QuestionType;
  ratingMin: number;
  ratingMax: number;
  startDate: string;
  endDate: string;
  active: boolean;
  choices: string[];
};

const QUESTION_TYPES: QuestionType[] = ["TEXT", "MCQ", "RATING", "YES_NO"];

export default function QuestionsPage() {
  const t = useTranslations("Questions");
  const tCommon = useTranslations("Common");
  const searchParams = useSearchParams();
  const handledEditRef = useRef<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const defaultChoices = [t("choice_excellent"), t("choice_good"), t("choice_fair"), t("choice_poor")];
  const emptyForm = (): QuestionForm => ({ text: "", type: "TEXT", ratingMin: 1, ratingMax: 5, startDate: "", endDate: "", active: true, choices: defaultChoices });
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorExpanded, setEditorExpanded] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const canManage = auth?.roles.some((role) => role === "ADMIN" || role === "MANAGER") ?? false;

  async function load() { setQuestions(await api<Question[]>("/api/questions")); }

  useEffect(() => {
    const storedAuth = getAuth();
    setAuth(storedAuth);
    Promise.all([
      load(),
      api<AuthUser>("/api/auth/me").then((serverAuth) => {
        const merged = { ...serverAuth, token: storedAuth?.token ?? null };
        localStorage.setItem("auth", JSON.stringify(merged));
        setAuth(merged);
      })
    ]).catch(console.error);
  }, []);

  useEffect(() => {
    const editParam = searchParams.get("edit");
    const editId = editParam ? Number(editParam) : NaN;
    if (!Number.isFinite(editId)) return;
    if (handledEditRef.current === editId) return;
    const target = questions.find((question) => question.id === editId);
    if (!target) return;
    handledEditRef.current = editId;
    startEdit(target);
  }, [questions, searchParams]);

  function toBody(value: QuestionForm) {
    return {
      text: value.text.trim(),
      type: value.type,
      active: value.active,
      ratingMin: value.type === "RATING" ? value.ratingMin : undefined,
      ratingMax: value.type === "RATING" ? value.ratingMax : undefined,
      startDate: value.startDate || undefined,
      endDate: value.endDate || undefined,
      choices: value.type === "MCQ"
        ? value.choices.map((label, i) => ({ label: label.trim(), sortOrder: i })).filter(choice => choice.label)
        : undefined
    };
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!canManage) {
      setError(t("manage_error"));
      return;
    }
    try {
      const body = toBody(form);
      if (editingId) {
        await api(`/api/questions/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await api("/api/questions", { method: "POST", body: JSON.stringify(body) });
      }
      setForm(emptyForm());
      setEditingId(null);
      setEditorOpen(false);
      setEditorExpanded(true);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : t("save_failed")); }
  }

  function addSurvey() {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
    setEditorOpen(true);
    setEditorExpanded(true);
  }

  function startEdit(question: Question) {
    setError("");
    setEditingId(question.id);
    setEditorOpen(true);
    setEditorExpanded(true);
    setForm({
      text: question.text,
      type: question.type,
      ratingMin: question.ratingMin ?? 1,
      ratingMax: question.ratingMax ?? 5,
      startDate: question.startDate ?? "",
      endDate: question.endDate ?? "",
      active: question.active,
      choices: question.choices?.length ? question.choices.map(choice => choice.label) : defaultChoices
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
    setEditorOpen(false);
    setEditorExpanded(true);
    setError("");
  }

  function updateChoice(index: number, value: string) {
    setForm({ ...form, choices: form.choices.map((choice, i) => i === index ? value : choice) });
  }

  function addChoice() {
    setForm({ ...form, choices: [...form.choices, ""] });
  }

  function removeChoice(index: number) {
    setForm({ ...form, choices: form.choices.filter((_, i) => i !== index) });
  }

  function typeLabel(question: Pick<Question, "type" | "ratingMin" | "ratingMax" | "choices">) {
    if (question.type === "TEXT") return t("type_text");
    if (question.type === "RATING") return t("rating_range", { min: question.ratingMin ?? 1, max: question.ratingMax ?? 5 });
    if (question.type === "YES_NO") return t("type_yes_no");
    return t("mcq_summary", { choices: (question.choices ?? []).map(c => c.label).join(", ") });
  }

  function dateLabel(question: Pick<Question, "startDate" | "endDate">) {
    if (!question.startDate && !question.endDate) return t("date_not_set");
    if (question.startDate && question.endDate) return t("date_range", { start: question.startDate, end: question.endDate });
    if (question.startDate) return t("starts_on", { date: question.startDate });
    return t("ends_on", { date: question.endDate ?? "" });
  }

  function formTypeLabel(type: QuestionType) {
    if (type === "TEXT") return t("type_text");
    if (type === "RATING") return t("type_rating");
    if (type === "YES_NO") return t("type_yes_no");
    return t("type_mcq");
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
          className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm"
          placeholder={t("text_answer_placeholder")}
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
              <button key={value} type="button" disabled className="h-10 w-10 rounded-md border-2 border-gray-200 p-0 text-sm font-semibold text-gray-600">
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{t("rating_low", { value: min })}</span>
            <span>{t("rating_high", { value: max })}</span>
          </div>
        </div>
      );
    }
    if (question.type === "YES_NO") {
      return (
        <div className="flex gap-3">
          <button type="button" disabled className="flex-1 rounded-md border-2 border-emerald-500 bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700">
            {tCommon("yes")}
          </button>
          <button type="button" disabled className="flex-1 rounded-md border-2 border-red-400 bg-red-50 py-2.5 text-sm font-medium text-red-600">
            {tCommon("no")}
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {(question.choices ?? []).map((choice, index) => (
          <label key={choice.id ?? `${choice.label}-${index}`} className="group flex cursor-default items-center gap-3">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-gray-300" />
            <span className="text-sm text-gray-700">{choice.label}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <Guard>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {canManage ? (
        <div className="mb-5 space-y-4">
          {!editorOpen && (
            <button type="button" onClick={addSurvey} className="flex items-center gap-2 bg-brand text-white">
              <Plus size={16} /> {t("add_question")}
            </button>
          )}

          {editorOpen && (
            <form onSubmit={save} className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-brand">
                  {editingId ? t("edit_short") : "1"}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                  {form.text || t("untitled_question")}
                </span>
                <span className="hidden text-xs text-gray-400 sm:block">{formTypeLabel(form.type)}</span>
                <div className="flex items-center gap-1">
                  <button type="button" title={editorExpanded ? t("collapse") : t("expand")} onClick={() => setEditorExpanded((open) => !open)} className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                    {editorExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button type="button" title={t("cancel")} onClick={cancelEdit} className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {editorExpanded && (
                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="text-xs font-medium text-gray-600 sm:col-span-2">
                      {t("question_text")}
                      <input className="mt-1" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder={t("question_placeholder")} />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      {t("question_type")}
                      <select className="mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as QuestionType })}>
                        {QUESTION_TYPES.map((value) => (
                          <option key={value} value={value}>{formTypeLabel(value)}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium text-gray-600">
                      {t("start_date")}
                      <input className="mt-1" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      {t("end_date")}
                      <input className="mt-1" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                    </label>
                  </div>

                  {form.type === "RATING" && (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs font-medium text-gray-600">
                        {t("minimum_rating")}
                        <input className="mt-1" type="number" min={0} value={form.ratingMin} onChange={(e) => setForm({ ...form, ratingMin: Number(e.target.value) })} />
                      </label>
                      <label className="text-xs font-medium text-gray-600">
                        {t("maximum_rating")}
                        <input className="mt-1" type="number" min={1} value={form.ratingMax} onChange={(e) => setForm({ ...form, ratingMax: Number(e.target.value) })} />
                      </label>
                    </div>
                  )}

                  {form.type === "MCQ" && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">{t("choices")}</label>
                      {form.choices.map((choice, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-4 text-xs text-gray-300">{index + 1}.</span>
                          <input className="flex-1" value={choice} onChange={(e) => updateChoice(index, e.target.value)} placeholder={t("choice_placeholder", { number: index + 1 })} />
                          <button type="button" title={t("remove_choice")} onClick={() => removeChoice(index)} disabled={form.choices.length <= 1} className="flex h-8 w-8 items-center justify-center rounded p-0 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addChoice} className="flex items-center gap-2 border border-line bg-white text-brand hover:bg-panel">
                        <Plus size={16} /> {t("add_choice")}
                      </button>
                    </div>
                  )}

                  {form.type === "YES_NO" && (
                    <div className="flex gap-3">
                      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{tCommon("yes")}</div>
                      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{tCommon("no")}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                      {t("active_question")}
                    </label>
                    <div className="flex gap-2">
                      <button type="button" onClick={cancelEdit} className="border border-line bg-white hover:bg-panel">{t("cancel")}</button>
                      <button className="flex items-center gap-2 bg-brand text-white">
                        {editingId ? <Save size={16} /> : <Plus size={16} />}
                        {editingId ? t("save_changes") : t("add")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {error && <p className="px-4 pb-4 text-sm text-red-700">{error}</p>}
            </form>
          )}
        </div>
      ) : (
        <div className="mb-5 rounded-md border border-line bg-white p-4 text-sm text-muted">
          {t("view_only")}
        </div>
      )}
      <div className="space-y-4">
        {questions.length === 0 && (
          <div className="rounded-md border border-line bg-white p-4 text-sm text-muted">{t("no_questions")}</div>
        )}
        {questions.map((q, index) => (
          <div key={q.id} className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-brand">{index + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                {q.text || t("untitled_question")}
              </span>
              <span className="hidden text-xs text-gray-400 sm:block">{formTypeLabel(q.type)}</span>
              <div className="flex items-center gap-1">
                <button type="button" title={expandedQuestions[q.id] === false ? t("expand") : t("collapse")} onClick={() => toggleQuestion(q.id)} className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                  {expandedQuestions[q.id] === false ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
                {canManage && (
                  <>
                    <button type="button" title={t("edit_question")} onClick={() => startEdit(q)} className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Edit3 size={15} /></button>
                    <button type="button" title={t("clone_question")} onClick={() => api(`/api/questions/${q.id}/clone`, { method: "POST" }).then(load)} className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Copy size={15} /></button>
                    <button type="button" title={t("delete_question")} onClick={() => api(`/api/questions/${q.id}`, { method: "DELETE" }).then(load)} className="flex h-7 w-7 items-center justify-center rounded p-0 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                  </>
                )}
              </div>
            </div>
            {expandedQuestions[q.id] !== false && (
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-sm font-semibold leading-snug text-gray-800">{q.text}</p>
                  <p className="mt-1 text-xs text-gray-400">{typeLabel(q)}</p>
                  <p className="mt-1 text-xs text-gray-400">{dateLabel(q)}</p>
                </div>
                <QuestionPreview question={q} />
              </div>
            )}
          </div>
        ))}
      </div>
    </Guard>
  );
}
