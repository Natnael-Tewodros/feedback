"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { Question, QuestionType, api } from "@/lib/api";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Choice = { id: number | null; label: string };

export default function QuestionsPage() {
  const t = useTranslations("Questions");
  const searchParams = useSearchParams();
  const questionnaireId = searchParams.get("questionnaireId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [text, setText] = useState("");
  const [type, setType] = useState<QuestionType>("TEXT");
  const [choices, setChoices] = useState<Choice[]>([]);
  const [ratingMin, setRatingMin] = useState<string>("1");
  const [ratingMax, setRatingMax] = useState<string>("5");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    api<Question[]>("/api/questions").then((data) => setQuestions(data));
  }, []);

  function edit(question: Question) {
    setEditingQuestion(question);
    setText(question.text);
    setType(question.type);
    setChoices(question.choices?.map((c) => ({ id: c.id, label: c.label })) ?? []);
    setRatingMin(question.ratingMin != null ? String(question.ratingMin) : "1");
    setRatingMax(question.ratingMax != null ? String(question.ratingMax) : "5");
    setStartDate(question.startDate ?? "");
    setEndDate(question.endDate ?? "");
  }

  function reset() {
    setEditingQuestion(null);
    setText("");
    setType("TEXT");
    setChoices([]);
    setRatingMin("1");
    setRatingMax("5");
    setStartDate("");
    setEndDate("");
  }

  function handleTypeChange(newType: QuestionType) {
    setType(newType);
    // Clear choices when switching away from MCQ
    if (newType !== "MCQ") setChoices([]);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const method = editingQuestion ? "PUT" : "POST";
    const url = editingQuestion ? `/api/questions/${editingQuestion.id}` : "/api/questions";

    const body: Record<string, unknown> = {
      text,
      type,
      // Only send choices for MCQ; sending an empty array causes a backend validation error
      choices: type === "MCQ" ? choices.map((c, i) => ({ ...c, sortOrder: i })) : null,
      // Only send ratingMin/ratingMax for RATING type
      ratingMin: type === "RATING" ? Number(ratingMin) : null,
      ratingMax: type === "RATING" ? Number(ratingMax) : null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    try {
      const savedQuestion = await api<Question>(url, { method, body: JSON.stringify(body) });

      if (questionnaireId && !editingQuestion) {
        await api(`/api/cycles/${questionnaireId}/questions`, {
          method: "POST",
          body: JSON.stringify({ questionIds: [savedQuestion.id] }),
        });
      }

      if (editingQuestion) {
        setQuestions(questions.map((q) => (q.id === editingQuestion.id ? savedQuestion : q)));
      } else {
        setQuestions([...questions, savedQuestion]);
      }
      reset();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  }

  function addChoice() {
    setChoices([...choices, { id: null, label: "" }]);
  }

  function updateChoice(index: number, label: string) {
    const newChoices = [...choices];
    newChoices[index].label = label;
    setChoices(newChoices);
  }

  function removeChoice(index: number) {
    setChoices(choices.filter((_, i) => i !== index));
  }

  async function deleteQuestion(id: number) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await api(`/api/questions/${id}`, { method: "DELETE" });
      setQuestions(questions.filter((q) => q.id !== id));
      if (editingQuestion?.id === id) reset();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  }

  return (
    <Guard>
      <PageHeader title={t("title")} />
      <div className="mb-4 flex justify-end">
        <Link href="/questionnaires" className="bg-brand px-3 py-2 text-sm font-medium text-white">
          {t("manage_surveys_button")}
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium">{t("questions_list")}</h2>
          <ul className="mt-4 space-y-2">
            {questions.map((question) => (
              <li key={question.id} className="flex items-center justify-between rounded-md border p-2">
                <span>{question.text}</span>
                <div className="flex gap-4">
                  <button onClick={() => edit(question)} className="text-sm text-blue-500 hover:text-blue-700">
                    {t("edit_button")}
                  </button>
                  <button onClick={() => deleteQuestion(question.id!)} className="text-sm text-red-500 hover:text-red-700">
                    {t("delete_button")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-medium">{editingQuestion ? t("edit_question_title") : t("new_question_title")}</h2>
          <form onSubmit={save} className="mt-4 space-y-4 rounded-md border bg-white p-4">
            <label className="block">
              <span className="text-sm font-medium">{t("question_text_label")}</span>
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("question_type_label")}</span>
              <select value={type} onChange={(e) => handleTypeChange(e.target.value as QuestionType)} className="mt-1 w-full">
                <option value="TEXT">Text</option>
                <option value="RATING">Rating</option>
                <option value="YES_NO">Yes/No</option>
                <option value="MCQ">Multiple Choice</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Start Date</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-md border p-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">End Date</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded-md border p-2 text-sm" />
              </label>
            </div>
            {type === "RATING" && (
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium">Min Rating</span>
                  <input
                    type="number"
                    value={ratingMin}
                    onChange={(e) => setRatingMin(e.target.value)}
                    className="mt-1 w-full rounded-md border p-2 text-sm"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Max Rating</span>
                  <input
                    type="number"
                    value={ratingMax}
                    onChange={(e) => setRatingMax(e.target.value)}
                    className="mt-1 w-full rounded-md border p-2 text-sm"
                    required
                  />
                </label>
              </div>
            )}
            {type === "MCQ" && (
              <div>
                <h3 className="text-sm font-medium">{t("choices_label")}</h3>
                <div className="mt-2 space-y-2">
                  {(choices ?? []).map((choice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={choice.label}
                        onChange={(e) => updateChoice(index, e.target.value)}
                        className="w-full"
                        placeholder={`${t("choice_placeholder")} ${index + 1}`}
                      />
                      <button type="button" onClick={() => removeChoice(index)} className="text-red-500">
                        {t("remove_button")}
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addChoice} className="mt-2 text-sm text-blue-500">
                  {t("add_choice_button")}
                </button>
              </div>
            )}
            <div className="flex justify-end gap-2">
              {editingQuestion && (
                <button type="button" onClick={reset} className="px-3 py-2 text-sm">
                  {t("cancel_button")}
                </button>
              )}
              <button type="submit" className="bg-brand px-3 py-2 text-sm font-medium text-white">
                {editingQuestion ? t("save_changes_button") : t("save_question_button")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Guard>
  );
}
