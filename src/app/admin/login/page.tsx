"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CupMark } from "@/components/CupMark";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "Connexion impossible.");
        return;
      }
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Réseau indisponible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <CupMark className="mx-auto h-11 w-11 text-or" />
          <h1 className="mt-5 font-display text-3xl font-light uppercase tracking-[0.16em] text-creme-soft">
            Noir et Crème
          </h1>
          <p className="mt-2 font-body text-[11px] uppercase tracking-[0.28em] text-creme-muted">
            Espace administration
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="card-sheen mt-8 space-y-4 rounded-2xl border border-creme/10 p-6"
        >
          <div>
            <label
              htmlFor="username"
              className="block font-body text-[10px] uppercase tracking-[0.2em] text-creme-muted"
            >
              Identifiant
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-creme/15 bg-black/40 px-3 py-2.5 font-body text-creme outline-none transition-colors focus:border-or/60"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-body text-[10px] uppercase tracking-[0.2em] text-creme-muted"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-creme/15 bg-black/40 px-3 py-2.5 font-body text-creme outline-none transition-colors focus:border-or/60"
              required
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 font-body text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-or px-4 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-noir transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-[10px] uppercase tracking-[0.2em] text-creme/25">
          <a href="/" className="transition-colors hover:text-or/70">
            ← Retour à la carte
          </a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh" />}>
      <LoginForm />
    </Suspense>
  );
}
