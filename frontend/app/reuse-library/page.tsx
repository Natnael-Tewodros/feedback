"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { api, Cycle, Question } from "@/lib/api";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";

export default function ReuseLibraryPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);

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

  return (
    <Guard>
      <PageHeader title="Reuse Library" subtitle="Clone individual questions or complete feedback cycles without copying old responses" />
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-md border border-line bg-white">
          <div className="border-b border-line p-4 font-semibold">Questions</div>
          {questions.map(q => (
            <div key={q.id} className="flex items-center justify-between border-b border-line p-4 last:border-0">
              <div>
                <div className="font-medium">{q.text}</div>
                <div className="text-sm text-muted">{q.type}</div>
              </div>
              <button title="Clone question" onClick={() => api(`/api/questions/${q.id}/clone`, { method: "POST" }).then(load)} className="border border-line"><Copy size={16} /></button>
            </div>
          ))}
        </section>
        <section className="rounded-md border border-line bg-white">
          <div className="border-b border-line p-4 font-semibold">Feedback Cycles</div>
          {cycles.map(c => (
            <div key={c.id} className="flex items-center justify-between border-b border-line p-4 last:border-0">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-muted">{c.status} - {c.questionIds.length} questions</div>
              </div>
              <button title="Clone cycle" onClick={() => cloneCycle(c)} className="border border-line"><Copy size={16} /></button>
            </div>
          ))}
        </section>
      </div>
    </Guard>
  );
}

