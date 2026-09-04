"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";

type RouteRow = {
  id: string;
  privacyMode: string;
  titlePrefix: string;
  enabled: boolean;
  lastSyncedAt: string | null;
  lastError: string | null;
  lastSyncStatus: string | null;
  mappedEvents: number;
  source: { name: string; color: string | null; accountEmail: string };
  target: { name: string };
};

export default function AppPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; email: string; isMain: boolean; status: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    const [me, r, a] = await Promise.all([fetch("/api/me"), fetch("/api/routes"), fetch("/api/accounts")]);
    if (me.status === 401) {
      router.push("/login");
      return;
    }
    const mej = await me.json();
    const rj = await r.json();
    const aj = await a.json();
    setOnboarded(Boolean(mej.user?.onboardedAt) || (rj.routes?.length ?? 0) > 0);
    setRoutes(rj.routes ?? []);
    setAccounts(aj.accounts ?? []);
  }, [router]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function resync(routeIds?: string[]) {
    setBusy(routeIds?.[0] ?? "all");
    setError(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sync failed");
      const jobId = json.jobId as string;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const st = await fetch(`/api/sync/status?jobId=${jobId}`);
        const sj = await st.json();
        if (sj.job?.status === "done" || sj.job?.status === "error") {
          if (sj.job.status === "error") setError(sj.job.error || "Sync error");
          break;
        }
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-mint-400">Status</p>
          <h1 className="mt-1 font-display text-3xl">Mirrors</h1>
          <p className="mt-1 text-sm text-mist-500">Last sync per route. One-way, source → target.</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn-ghost" href="/onboarding">
            Setup
          </Link>
          <button className="btn-primary" onClick={() => resync()} disabled={Boolean(busy) || !routes.length}>
            {busy === "all" ? "Syncing…" : "Resync all"}
          </button>
        </div>
      </div>

      {onboarded === false && (
        <div className="card mb-6 p-5">
          <p className="text-sm text-mist-300">Finish setup to create a target calendar and pick sources.</p>
          <Link className="btn-primary mt-3 inline-flex" href="/onboarding">
            Open setup
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="mb-8 grid gap-3 sm:grid-cols-3">
        {accounts.map((a) => (
          <div key={a.id} className="card p-4">
            <div className="text-xs uppercase tracking-wide text-mist-500">
              {a.isMain ? "Main" : "Linked"} · {a.status}
            </div>
            <div className="mt-1 truncate text-sm">{a.email}</div>
          </div>
        ))}
        {!accounts.length && <div className="text-sm text-mist-500">No accounts yet.</div>}
      </section>

      <section className="space-y-3">
        {routes.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: r.source.color || "#5ee0b5" }}
                />
                <span className="font-medium">
                  {r.titlePrefix ? `[${r.titlePrefix}] ` : ""}
                  {r.source.name}
                </span>
                <span className="text-xs text-mist-500">→ {r.target.name}</span>
              </div>
              <div className="mt-1 text-xs text-mist-500">
                {r.source.accountEmail} · {r.privacyMode} · {r.mappedEvents} mapped ·{" "}
                {r.enabled ? "on" : "paused"} · {r.lastSyncStatus || "never synced"}
                {r.lastSyncedAt ? ` · ${new Date(r.lastSyncedAt).toLocaleString()}` : ""}
              </div>
              {r.lastError && <div className="mt-1 text-xs text-red-300">{r.lastError}</div>}
            </div>
            <button
              className="btn-ghost"
              disabled={Boolean(busy)}
              onClick={() => resync([r.id])}
            >
              {busy === r.id ? "Syncing…" : "Resync"}
            </button>
          </div>
        ))}
        {!routes.length && onboarded && (
          <p className="text-sm text-mist-500">
            No routes yet. <Link href="/onboarding" className="text-mint-400">Add sources in setup</Link>.
          </p>
        )}
      </section>
    </AppShell>
  );
}
