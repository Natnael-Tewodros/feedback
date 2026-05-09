"use client";

import { Guard } from "@/components/Guard";
import { PageHeader } from "@/components/PageHeader";
import { api, Cycle } from "@/lib/api";
import { BarChart3, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Stats = {
  totalAssignments: number;
  submittedAssignments: number;
  responseRate: number;
  averageRating?: number;
};

export default function ReportsPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleId, setCycleId] = useState<number | "">("");
  const [stats, setStats] = useState<Stats | null>(null);
  const selectedCycle = useMemo(() => cycles.find((cycle) => cycle.id === cycleId), [cycles, cycleId]);

  async function load() {
    const [cycleData, statData] = await Promise.all([
      api<Cycle[]>("/api/cycles"),
      api<Stats>(cycleId ? `/api/dashboard?cycleId=${cycleId}` : "/api/dashboard")
    ]);
    setCycles(cycleData);
    setStats(statData);
  }

  useEffect(() => { load().catch(console.error); }, [cycleId]);

  const rows = [
    ["Feedback cycle", selectedCycle?.title ?? "All cycles"],
    ["Cycle status", selectedCycle?.status ?? "Mixed"],
    ["Questions in cycle", selectedCycle ? selectedCycle.questionIds.length : "All"],
    ["Total assignments", stats?.totalAssignments ?? 0],
    ["Submitted or approved", stats?.submittedAssignments ?? 0],
    ["Response rate", `${(stats?.responseRate ?? 0).toFixed(1)}%`],
    ["Average rating", stats?.averageRating?.toFixed(2) ?? "N/A"]
  ];

  return (
    <Guard>
      <PageHeader title="Reports" subtitle="Cycle-level summary for management review" />
      <div className="mb-5 grid gap-3 rounded-md border border-line bg-white p-4 md:grid-cols-[1fr_auto]">
        <select value={cycleId} onChange={(e) => setCycleId(e.target.value ? Number(e.target.value) : "")}>
          <option value="">All feedback cycles</option>
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>{cycle.title} ({cycle.status})</option>
          ))}
        </select>
        <button onClick={load} className="flex items-center justify-center gap-2 border border-line bg-white hover:bg-panel">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-muted"><BarChart3 size={16} /> Response Rate</div>
          <div className="mt-2 text-3xl font-semibold">{(stats?.responseRate ?? 0).toFixed(1)}%</div>
        </div>
        <div className="rounded-md border border-line bg-white p-4">
          <div className="text-sm text-muted">Submitted</div>
          <div className="mt-2 text-3xl font-semibold">{stats?.submittedAssignments ?? 0}</div>
        </div>
        <div className="rounded-md border border-line bg-white p-4">
          <div className="text-sm text-muted">Average Rating</div>
          <div className="mt-2 text-3xl font-semibold">{stats?.averageRating?.toFixed(2) ?? "N/A"}</div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-line bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-2 border-b border-line p-3 text-sm last:border-0">
            <div className="font-medium">{label}</div>
            <div className="text-muted">{value}</div>
          </div>
        ))}
      </div>
    </Guard>
  );
}

