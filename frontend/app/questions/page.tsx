"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { api, AuthUser, getAuth, Question, QuestionType } from "@/lib/api";
import { Copy, Plus, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [text, setText] = useState("");
  const [type, setType] = useState<QuestionType>("TEXT");
  const [ratingMin, setRatingMin] = useState(1);
  const [ratingMax, setRatingMax] = useState(5);
  const [choices, setChoices] = useState(["Excellent", "Good", "Fair", "Poor"]);
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

  async function create(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!canManage) {
      setError("Only Admin or Manager users can create questions. Log in as admin@example.com or manager@example.com.");
      return;
    }
    const body = {
      text,
      type,
      ratingMin: type === "RATING" ? ratingMin : undefined,
      ratingMax: type === "RATING" ? ratingMax : undefined,
      choices: type === "MCQ" ? choices.map((label, i) => ({ label: label.trim(), sortOrder: i })).filter(choice => choice.label) : undefined
    };
    try {
      await api("/api/questions", { method: "POST", body: JSON.stringify(body) });
      setText("");
      if (type === "MCQ") setChoices(["Excellent", "Good", "Fair", "Poor"]);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Save failed"); }
  }

  function updateChoice(index: number, value: string) {
    setChoices(choices.map((choice, i) => i === index ? value : choice));
  }

  function addChoice() {
    setChoices([...choices, ""]);
  }

  function removeChoice(index: number) {
    setChoices(choices.filter((_, i) => i !== index));
  }

  return (
    <Guard>
      <PageHeader title="Manage Questions" subtitle="Create text, rating, yes/no, and multiple-choice questions" />
      {canManage ? (
        <form onSubmit={create} className="mb-5 rounded-md border border-line bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <input placeholder="Question text" value={text} onChange={(e) => setText(e.target.value)} />
            <select value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
              <option value="TEXT">Text answer</option>
              <option value="RATING">Rating scale</option>
              <option value="YES_NO">Yes / No</option>
              <option value="MCQ">Multiple choice</option>
            </select>
            <button className="flex items-center justify-center gap-2 bg-brand text-white"><Plus size={16} /> Add</button>
          </div>

          {type === "RATING" && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium">
                Minimum rating
                <input className="mt-1" type="number" min={0} value={ratingMin} onChange={(e) => setRatingMin(Number(e.target.value))} />
              </label>
              <label className="text-sm font-medium">
                Maximum rating
                <input className="mt-1" type="number" min={1} value={ratingMax} onChange={(e) => setRatingMax(Number(e.target.value))} />
              </label>
            </div>
          )}

          {type === "MCQ" && (
            <div className="mt-4 rounded-md border border-line p-3">
              <div className="mb-2 text-sm font-medium">Choices</div>
              <div className="space-y-2">
                {choices.map((choice, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-[24px_1fr_auto]">
                    <input type="radio" disabled className="mt-3" aria-label="Choice preview" />
                    <input value={choice} onChange={(e) => updateChoice(index, e.target.value)} placeholder={`Choice ${index + 1}`} />
                    <button type="button" title="Remove choice" onClick={() => removeChoice(index)} className="border border-line text-red-700 disabled:opacity-40" disabled={choices.length <= 1}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addChoice} className="mt-3 border border-line bg-white hover:bg-panel">Add Choice</button>
            </div>
          )}

          {type === "TEXT" && (
            <div className="mt-4 rounded-md border border-line p-3">
              <div className="mb-2 text-sm font-medium">Answer format</div>
              <textarea disabled rows={3} placeholder="Employee writes a text response here" />
            </div>
          )}
          {type === "YES_NO" && (
            <div className="mt-4 rounded-md border border-line p-3">
              <div className="mb-2 text-sm font-medium">Answer options</div>
              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2"><input type="radio" disabled /> Yes</label>
                <label className="flex items-center gap-2"><input type="radio" disabled /> No</label>
              </div>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        </form>
      ) : (
        <div className="mb-5 rounded-md border border-line bg-white p-4 text-sm text-muted">
          You can view questions, but only Admin or Manager users can create, clone, or deactivate them.
        </div>
      )}
      <div className="overflow-hidden rounded-md border border-line bg-white">
        {questions.map((q) => (
          <div key={q.id} className="flex items-start justify-between gap-4 border-b border-line p-4 last:border-0">
            <div>
              <div className="font-medium">{q.text}</div>
              <div className="mt-1 text-sm text-muted">
                {q.type === "TEXT" && "Text answer"}
                {q.type === "RATING" && `Rating ${q.ratingMin ?? 1}-${q.ratingMax ?? 5}`}
                {q.type === "YES_NO" && "Yes / No"}
                {q.type === "MCQ" && `Multiple choice - ${q.choices.map(c => c.label).join(", ")}`}
              </div>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <button type="button" title="Clone question" onClick={() => api(`/api/questions/${q.id}/clone`, { method: "POST" }).then(load)} className="border border-line"><Copy size={16} /></button>
                <button type="button" title="Delete question" onClick={() => api(`/api/questions/${q.id}`, { method: "DELETE" }).then(load)} className="border border-line text-red-700"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Guard>
  );
}
