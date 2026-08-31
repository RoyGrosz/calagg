"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { GOOGLE_EVENT_COLORS, type PrivacyMode } from "@/lib/types";

type Account = {
  id: string;
  email: string;
  name: string | null;
  isMain: boolean;
  status: string;
  calendars: {
    id: string;
    googleCalendarId: string;
    name: string;
    color: string | null;
    role: string;
  }[];
};

type Target = { id: string; name: string; googleCalendarId: string } | null;

type SourcePick = {
  calendarId: string;
  enabled: boolean;
  privacyMode: PrivacyMode;
  titlePrefix: string;
  colorOverride: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [target, setTarget] = useState<Target>(null);
  const [picks, setPicks] = useState<Record<string, SourcePick>>({});
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<{
    status: string;
    progress: { processed: number; created: number; updated: number; deleted: number; skipped: number; errors: number };
    error?: string | null;
  } | null>(null);

  const load = useCallback(async () => {
    const [a, t] = await Promise.all([fetch("/api/accounts"), fetch("/api/target-calendar")]);
    if (!a.ok || !t.ok) throw new Error("Failed to load accounts");
    const aj = await a.json();
    const tj = await t.json();
    setAccounts(aj.accounts);
    setTarget(tj.target);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("linked")) {
      setStep(3);
      fetch("/api/calendars/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
        .then(() => load())
        .catch(() => load());
    }
  }, [load]);

  const main = accounts.find((a) => a.isMain);
  const mainCalendars = main?.calendars ?? [];

  const sourceCandidates = useMemo(() => {
    const out: { account: Account; cal: Account["calendars"][number] }[] = [];
    for (const account of accounts) {
      for (const cal of account.calendars) {
        if (target && cal.id === target.id) continue;
        if (cal.googleCalendarId === "primary" && account.isMain) continue;
        out.push({ account, cal });
      }
    }
    return out;
  }, [accounts, target]);

  async function refreshCals() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/calendars/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Refresh failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function createTarget() {
    setBusy(true);
    setError(null);
    try {
      await refreshCals();
      const res = await fetch("/api/target-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ create: true, name: "From other calendars" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create target calendar");
      setTarget(json.target);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function selectExisting(calendarId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/target-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not select target");
      setTarget(json.target);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function togglePick(calId: string, accountEmail: string) {
    setPicks((prev) => {
      const existing = prev[calId];
      if (existing) {
        return { ...prev, [calId]: { ...existing, enabled: !existing.enabled } };
      }
      const domain = accountEmail.split("@")[1]?.split(".")[0] || "Work";
      const prefix = domain.charAt(0).toUpperCase() + domain.slice(1);
      return {
        ...prev,
        [calId]: {
          calendarId: calId,
          enabled: true,
          privacyMode: "full",
          titlePrefix: prefix,
          colorOverride: "",
        },
      };
    });
  }

  async function saveRoutesAndSync() {
    setBusy(true);
    setError(null);
    try {
      const selected = Object.values(picks).filter((p) => p.enabled);
      if (!selected.length) throw new Error("Pick at least one source calendar");
      const createdIds: string[] = [];
      for (const p of selected) {
        const res = await fetch("/api/routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceCalId: p.calendarId,
            privacyMode: p.privacyMode,
            titlePrefix: p.titlePrefix,
            colorOverride: p.colorOverride || null,
            filters: { skipDeclined: true, skipOOO: true, skipFocusTime: true, skipAllDay: false },
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create route");
        createdIds.push(json.route.id);
      }
      const syncRes = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeIds: createdIds }),
      });
      const syncJson = await syncRes.json();
      if (!syncRes.ok) throw new Error(syncJson.error || "Sync failed to start");
      setJobId(syncJson.jobId);
      setStep(5);
      await fetch("/api/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarded: true }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!jobId) return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/sync/status?jobId=${jobId}`);
      const json = await res.json();
      if (json.job) setJob(json.job);
      if (json.job?.status === "done" || json.job?.status === "error") clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [jobId]);

  const steps = ["Main account", "Target calendar", "Add account", "Sources", "First sync"];

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-mint-400">Setup</p>
        <h1 className="mt-1 font-display text-3xl">Get calendars flowing</h1>
        <ol className="mt-4 flex flex-wrap gap-2 text-xs">
          {steps.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-3 py-1 ${
                step === i + 1 ? "bg-mint-400 text-ink-950" : i + 1 < step ? "bg-ink-700 text-mist-100" : "bg-ink-800 text-mist-500"
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {step === 1 && (
        <section className="card p-6">
          <h2 className="font-display text-xl">Main Google account</h2>
          <p className="mt-1 text-sm text-mist-500">
            This is the account that owns the target calendar. Mirrored events are written here.
          </p>
          {main ? (
            <div className="mt-4 rounded-xl border border-ink-600 bg-ink-900 px-4 py-3">
              <div className="text-sm text-mist-500">Connected</div>
              <div className="text-lg">{main.email}</div>
              <div className="text-xs text-mist-500">status: {main.status}</div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-mist-500">No main account yet — sign in again.</p>
          )}
          <button className="btn-primary mt-6" onClick={() => setStep(2)} disabled={!main}>
            Continue
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="card p-6">
          <h2 className="font-display text-xl">Target calendar</h2>
          <p className="mt-1 text-sm text-mist-500">
            CalAgg never writes to Primary. Use a dedicated calendar such as “From other calendars”.
          </p>
          {target && (
            <p className="mt-3 text-sm text-mint-400">Current target: {target.name}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={createTarget} disabled={busy}>
              {busy ? "Working…" : "Create “From other calendars”"}
            </button>
            <button className="btn-ghost" onClick={refreshCals} disabled={busy}>
              Refresh list
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {mainCalendars.map((c) => (
              <button
                key={c.id}
                onClick={() => selectExisting(c.id)}
                className="flex w-full items-center justify-between rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-left text-sm hover:border-mint-400/40"
              >
                <span>{c.name}</span>
                <span className="text-xs text-mist-500">{c.role}</span>
              </button>
            ))}
            {!mainCalendars.length && (
              <p className="text-sm text-mist-500">Refresh to load calendars from Google.</p>
            )}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="card p-6">
          <h2 className="font-display text-xl">Add another Google account</h2>
          <p className="mt-1 text-sm text-mist-500">
            Connect work or a secondary personal account. You can also mirror other calendars on the main account.
          </p>
          <ul className="mt-4 space-y-2">
            {accounts.map((a) => (
              <li key={a.id} className="rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-sm">
                {a.email} {a.isMain ? <span className="text-mint-400">· main</span> : null}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className="btn-primary" href="/api/accounts/connect">
              Add Google account
            </a>
            <button className="btn-ghost" onClick={refreshCals} disabled={busy}>
              Load calendars
            </button>
            <button className="btn-ghost" onClick={() => setStep(4)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="card p-6">
          <h2 className="font-display text-xl">Pick source calendars</h2>
          <p className="mt-1 text-sm text-mist-500">
            Each source becomes a sync route onto the target. Prefix and privacy are per source.
          </p>
          <div className="mt-4 space-y-3">
            {sourceCandidates.map(({ account, cal }) => {
              const pick = picks[cal.id];
              const on = pick?.enabled;
              return (
                <div key={cal.id} className="rounded-xl border border-ink-600 bg-ink-900 p-4">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(on)}
                      onChange={() => togglePick(cal.id, account.email)}
                    />
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: cal.color || "#5ee0b5" }}
                    />
                    <span className="font-medium">{cal.name}</span>
                    <span className="text-mist-500">· {account.email}</span>
                  </label>
                  {on && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="label">Prefix</label>
                        <input
                          className="field"
                          value={pick.titlePrefix}
                          onChange={(e) =>
                            setPicks((p) => ({ ...p, [cal.id]: { ...p[cal.id], titlePrefix: e.target.value } }))
                          }
                        />
                      </div>
                      <div>
                        <label className="label">Privacy</label>
                        <select
                          className="field"
                          value={pick.privacyMode}
                          onChange={(e) =>
                            setPicks((p) => ({
                              ...p,
                              [cal.id]: { ...p[cal.id], privacyMode: e.target.value as PrivacyMode },
                            }))
                          }
                        >
                          <option value="full">Full</option>
                          <option value="title">Title only</option>
                          <option value="busy">Busy</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Color</label>
                        <select
                          className="field"
                          value={pick.colorOverride}
                          onChange={(e) =>
                            setPicks((p) => ({ ...p, [cal.id]: { ...p[cal.id], colorOverride: e.target.value } }))
                          }
                        >
                          <option value="">Source default</option>
                          {GOOGLE_EVENT_COLORS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {!sourceCandidates.length && (
              <p className="text-sm text-mist-500">Load calendars first (previous step).</p>
            )}
          </div>
          <button className="btn-primary mt-6" onClick={saveRoutesAndSync} disabled={busy}>
            {busy ? "Starting sync…" : "Create routes & run first sync"}
          </button>
        </section>
      )}

      {step === 5 && (
        <section className="card p-6">
          <h2 className="font-display text-xl">First sync</h2>
          <p className="mt-1 text-sm text-mist-500">
            CalAgg is listing source events (±3 months) and upserting onto the target.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(["processed", "created", "updated", "deleted", "skipped", "errors"] as const).map((k) => (
              <div key={k} className="rounded-xl border border-ink-600 bg-ink-900 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-mist-500">{k}</div>
                <div className="font-display text-2xl">{job?.progress?.[k] ?? 0}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-mist-300">
            Status: {job?.status ?? (jobId ? "queued" : "waiting")}
          </p>
          {job?.error && <p className="mt-2 text-sm text-red-300">{job.error}</p>}
          <button
            className="btn-primary mt-6"
            onClick={() => router.push("/")}
            disabled={job?.status === "running" || job?.status === "queued"}
          >
            {job?.status === "done" || job?.status === "error" ? "Go to status" : "Running…"}
          </button>
        </section>
      )}
    </AppShell>
  );
}
