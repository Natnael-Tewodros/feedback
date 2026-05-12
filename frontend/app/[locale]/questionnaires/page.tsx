"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { Cycle, getCycles, api } from "@/lib/api";
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
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm hover:border-brand"
            >
              <Link href={`/${locale}/questionnaires/${cycle.id}/questions`} className="flex-1">
                <h3 className="font-medium text-brand hover:underline">{cycle.title}</h3>
                <p className="text-sm text-gray-500">{cycle.description}</p>
                {cycle.isAnonymous && <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Anonymous</span>}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg">
            <h2 className="text-lg font-medium">{t("create_new_survey")}</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <label className="text-xs font-medium text-gray-600 block">
                {t("survey_title_label")}
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t("survey_title_placeholder")}
                />
              </label>
              <label className="text-xs font-medium text-gray-600 block">
                {t("survey_description_label")}
                <textarea
                  className="mt-1 w-full rounded border px-2 py-1"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t("survey_description_placeholder")}
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.target.checked)}
                />
                {t("survey_anonymous_label")}
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-sm font-medium"
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
