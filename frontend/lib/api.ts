"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type QuestionType = "TEXT" | "RATING" | "YES_NO" | "MCQ";
export type Question = {
  id: number;
  text: string;
  type: QuestionType;
  ratingMin?: number;
  ratingMax?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  choices: Choice[];
};
export type Choice = { id: number; label: string; sortOrder: number; active: boolean };
export type Cycle = { id: number; title: string; description?: string; isAnonymous: boolean; status: string; startDate?: string; endDate?: string; questionIds: number[] };
export type Assignment = { id: number; cycleId: number; cycleTitle: string; assignedToId: number; assignedToName: string; status: string };
export type UserSummary = { id: number; fullName: string; email: string; department?: string };
export type AuthUser = { token: string | null; userId: number; fullName: string; email: string; roles: string[] };
export type ReportChoice = { choiceId: number; label: string; count: number };
export type ReportQuestion = {
  questionId: number;
  text: string;
  type: QuestionType;
  responseCount: number;
  averageRating?: number | null;
  yesCount?: number | null;
  noCount?: number | null;
  choices: ReportChoice[];
  textAnswers: string[];
};
export type SurveyReport = {
  id: number;
  title: string;
  description?: string;
  status: string;
  generatedAt: string;
  totalResponses: number;
  questions: ReportQuestion[];
};

export function getCycles() {
  return api<Cycle[]>("/api/cycles");
}

export function getAuth() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth");
  return raw ? JSON.parse(raw) as AuthUser : null;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const auth = getAuth();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...init.headers
    }
  });
  if (!res.ok) {
    let message = `Request failed with ${res.status}`;
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth");
      message = "Session expired or missing. Please log in again.";
    }
    const text = await res.text();
    if (text) {
      try {
        const body = JSON.parse(text) as { message?: string };
        message = body.message || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? JSON.parse(text) as T : undefined as T;
}
