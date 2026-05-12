"use client";

import { api } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Login");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const auth = await api<{ token: string; roles: string[]; fullName: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("auth", JSON.stringify(auth));
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login_failed"));
    }
  }

  return (
    <main
      className="grid min-h-screen place-items-center bg-slate-100 p-5"
      style={{
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <form onSubmit={submit} className="w-full max-w-sm rounded-md border border-slate-200 bg-white/95 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-col items-center gap-3">
          <img src="/images/insalogo.jpeg" alt="Insa FMs" className="h-16 w-16 object-contain" />
          <h1 className="text-xl font-semibold">{t("title")}</h1>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium">{t("email")}<input className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block text-sm font-medium">{t("password")}<input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button className="w-full bg-sky-400 text-white hover:bg-sky-500">{t("submit")}</button>
        </div>
      </form>
    </main>
  );
}
