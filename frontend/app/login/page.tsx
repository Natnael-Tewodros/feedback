"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
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
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-panel p-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-md border border-line bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium">Email<input className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block text-sm font-medium">Password<input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button className="w-full bg-brand text-white hover:bg-teal-800">Login</button>
        </div>
      </form>
    </main>
  );
}

