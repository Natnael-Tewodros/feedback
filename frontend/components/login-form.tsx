"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { api } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Login");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const auth = await api<{ token: string; roles: string[]; fullName: string; userId: number; email: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("auth", JSON.stringify(auth));
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login_failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full shadow-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="text-center pb-4 pt-8 px-8">
          {/* Logo — visible on mobile (hidden on desktop where the left panel shows it) */}
          <div className="flex justify-center mb-4 lg:hidden">
            <div className="rounded-xl bg-[#1e3a5f] p-2 shadow-md">
              <img
                src="/images/insalogo.jpeg"
                alt="INSA"
                className="h-12 w-12 object-contain rounded-lg"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1e3a5f] dark:text-slate-100 tracking-tight">
            {t("title")}
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-10 border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/20 dark:focus:border-sky-500 dark:focus:ring-sky-500/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-10 border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/20 dark:focus:border-sky-500 dark:focus:ring-sky-500/20"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="mt-2 w-full h-10 text-sm font-semibold text-white tracking-wide transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#1e3a5f' }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
