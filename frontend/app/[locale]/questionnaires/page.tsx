"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { Cycle, getCycles, api } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export default function QuestionnairesPage() {
  const t = useTranslations("Questionnaires");
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCycleId, setEditingCycleId] = useState<number | null>(null);

  useEffect(() => {
    getCycles().then(setCycles);
  }, []);

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    saveCycle().catch(console.error);
  }

  function openCreate() {
    setEditingCycleId(null);
    setTitle("");
    setDescription("");
    setIsAnonymous(false);
    setIsModalOpen(true);
  }

  function openEdit(cycle: Cycle) {
    setEditingCycleId(cycle.id);
    setTitle(cycle.title);
    setDescription(cycle.description || "");
    setIsAnonymous(cycle.isAnonymous || false);
    setIsModalOpen(true);
  }

  async function removeCycle(id: number) {
    if (!confirm(t("delete_confirm"))) return;
    try {
      await api(`/api/cycles/${id}`, { method: "DELETE" });
      setCycles((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function saveCycle() {
    try {
      if (editingCycleId) {
        const updatedCycle = await api<Cycle>(`/api/cycles/${editingCycleId}`, {
          method: "PUT",
          body: JSON.stringify({
            title,
            description,
            isAnonymous,
            status: "DRAFT",
          }),
        });
        setCycles((prev) => prev.map((c) => (c.id === editingCycleId ? updatedCycle : c)));
      } else {
        const newCycle = await api<Cycle>("/api/cycles", {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            isAnonymous,
            status: "DRAFT",
            questionIds: [],
          }),
        });
        setCycles((prev) => [...prev, newCycle]);
      }
      setIsModalOpen(false);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <Guard>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={openCreate}
            className="bg-brand px-3 py-2 text-sm font-medium text-white"
          >
            {t("new_survey_button")}
          </button>
        </div>

        <div className="space-y-4">
          {cycles.map((cycle) => (
            <div
              key={cycle.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-brand dark:hover:border-brand"
            >
              <Link href={`/${locale}/questionnaires/${cycle.id}/questions`} className="flex-1">
                <h3 className="font-medium text-brand hover:underline">{cycle.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{cycle.description}</p>
                {cycle.isAnonymous && <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">Anonymous</span>}
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(cycle)}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  {t("edit_button")}
                </button>
                <button
                  onClick={() => removeCycle(cycle.id)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-50"
                >
                  {t("delete_button")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-md bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-medium dark:text-slate-100">{t("create_new_survey")}</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                {t("survey_title_label")}
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t("survey_title_placeholder")}
                />
              </label>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                {t("survey_description_label")}
                <textarea
                  className="mt-1 w-full rounded border dark:border-slate-700 px-2 py-1"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t("survey_description_placeholder")}
                />
              </label>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                <div>
                  <Label htmlFor="anonymous-switch" className="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                    {t("survey_anonymous_label")}
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Responses will not be linked to respondents</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{isAnonymous ? "Yes" : "No"}</span>
                  <Switch
                    id="anonymous-switch"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-sm font-medium dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  {t("cancel_button")}
                </button>
                <button
                  type="submit"
                  className="bg-brand px-3 py-2 text-sm font-medium text-white"
                  disabled={!title.trim()}
                >
                  {t("create_button")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Guard>
  );
}
