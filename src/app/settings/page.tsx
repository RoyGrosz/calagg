"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Account = {
  id: string;
  email: string;
  name: string | null;
  isMain: boolean;
  status: string;
};

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/accounts");
    const json = await res.json();
    setAccounts(json.accounts ?? []);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function disconnect(id: string, email: string) {
    if (!confirm(`Disconnect ${email}? Mirrored events from this account will be deleted on the target.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Disconnect failed");
      setMessage(`Disconnected ${json.disconnected}. Removed ${json.deletedEvents} mirrored events.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function wipeAll() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/mirrors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Wipe failed");
      setMessage(`Deleted ${json.deleted} mirrored events. Routes were kept.`);
      setConfirmText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-mint-400">Settings</p>
        <h1 className="mt-1 font-display text-3xl">Accounts & safety</h1>
      </div>
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      )}
      {message && (
        <div className="mb-4 rounded-xl border border-mint-400/30 bg-mint-400/10 px-4 py-3 text-sm text-mint-300">
          {message}
        </div>
      )}

      <section className="card mb-6 p-6">
        <h2 className="font-display text-xl">Google accounts</h2>
        <p className="mt-1 text-sm text-mist-500">
          Disconnecting wipes EventMaps for that account and deletes mirrored events on the target.
        </p>
        <ul className="mt-4 space-y-3">
          {accounts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-600 bg-ink-900 px-4 py-3">
              <div>
                <div className="text-sm">{a.email}</div>
                <div className="text-xs text-mist-500">
                  {a.isMain ? "main / target owner" : "linked"} · {a.status}
                </div>
              </div>
              <button className="btn-danger" disabled={busy} onClick={() => disconnect(a.id, a.email)}>
                Disconnect
              </button>
            </li>
          ))}
        </ul>
        <a className="btn-ghost mt-4 inline-flex" href="/api/accounts/connect">
          Add Google account
        </a>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-xl">Delete all mirrors</h2>
        <p className="mt-1 text-sm text-mist-500">
          Removes every CalAgg-created event from the target calendar and clears EventMaps. Routes stay so you can resync.
        </p>
        <label className="label mt-4">Type DELETE to confirm</label>
        <input className="field max-w-xs" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        <div>
          <button className="btn-danger mt-4" disabled={busy || confirmText !== "DELETE"} onClick={wipeAll}>
            Delete all mirrored events
          </button>
        </div>
      </section>
    </AppShell>
  );
}
