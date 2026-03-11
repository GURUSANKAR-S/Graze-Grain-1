"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { ApiSuccess } from "@/types/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await apiFetch<ApiSuccess<{ access_token: string }>>(
        "/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      login(data.data.access_token);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_10%,#ffd6ae_0%,transparent_40%),linear-gradient(180deg,#fff8ee_0%,#f5efe6_100%)] px-4">
      <div className="glass-surface w-full max-w-md rounded-3xl p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand)]">Admin Access</p>
        <h1 className="mt-2 text-4xl font-semibold">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-[var(--muted)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-[var(--muted)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[var(--brand-strong)]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
