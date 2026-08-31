"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GOOGLE_EVENT_COLORS, DEFAULT_FILTERS, type PrivacyMode, type RouteFilters } from "@/lib/types";

type RouteRow = {
  id: string;
  privacyMode: PrivacyMode;
  titlePrefix: string;
  busyTitle: string;
  colorOverride: string | null;
  filters: string;
  enabled: boolean;
  lastSyncedAt: string | null;
  lastError: string | null;
  lastSyncStatus: string | null;
  mappedEvents: number;
  source: { name: string; color: string | null; accountEmail: string };
  target: { name: string };
};

function parseFilters(raw: string): RouteFilters {
  try {
    return { ...DEFAULT_FILTERS, ...(JSON.parse(raw) as RouteFilters) };
  } catch {
    return { ...DEFAULT_FILTERS };
  }
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/routes");
    const json = await res.json();
    setRoutes(json.routes ?? []);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function save(route: RouteRow, patch: Partial<RouteRow> & { filtersObj?: RouteFilters }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/routes/${route.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privacyMode: patch.privacyMode ?? route.privacyMode,
          titlePrefix: patch.titlePrefix ?? route.titlePrefix,
          busyTitle: patch.busyTitle ?? route.busyTitle,
          colorOverride: patch.colorOverride === undefined ? route.colorOverride : patch.colorOverride,
          enabled: patch.enabled ?? route.enabled,
          filters: patch.filtersObj ?? parseFilters(route.filters),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this route and its mirrored events on the target calendar?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/routes/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-mint-400">Routes</p>
        <h1 className="mt-1 font-display text-3xl">What gets mirrored</h1>
        <p className="mt-1 text-sm text-mist-500">Prefix, color, privacy, and filters. Pause without disconnecting.</p>
      </div>
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      )}
      <div className="space-y-4">
        {routes.map((r) => {
          const filters = parseFilters(r.filters);
          const open = editing === r.id;
          return (
            <div key={r.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {r.titlePrefix ? `[${r.titlePrefix}] ` : ""}
                    {r.source.name} <span className="text-mist-500">→ {r.target.name}</span>
                  </div>
                  <div className="text-xs text-mist-500">
                    {r.source.accountEmail} · {r.privacyMode} · {r.enabled ? "enabled" : "paused"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost" onClick={() => save(r, { enabled: !r.enabled })} disabled={busy}>
                    {r.enabled ? "Pause" : "Resume"}
                  </button>
                  <button className="btn-ghost" onClick={() => setEditing(open ? null : r.id)}>
                    {open ? "Close" : "Edit"}
                  </button>
                  <button className="btn-danger" onClick={() => remove(r.id)} disabled={busy}>
                    Delete
                  </button>
                </div>
              </div>
              {open && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Title prefix</label>
                    <input
                      className="field"
                      defaultValue={r.titlePrefix}
                      onBlur={(e) => save(r, { titlePrefix: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Privacy</label>
                    <select
                      className="field"
                      defaultValue={r.privacyMode}
                      onChange={(e) => save(r, { privacyMode: e.target.value as PrivacyMode })}
                    >
                      <option value="full">Full — title, time, location, description, Meet</option>
                      <option value="title">Title — title + time + provenance</option>
                      <option value="busy">Busy — block + which source reserved time</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Busy title</label>
                    <input
                      className="field"
                      defaultValue={r.busyTitle}
                      onBlur={(e) => save(r, { busyTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Color override</label>
                    <select
                      className="field"
                      defaultValue={r.colorOverride ?? ""}
                      onChange={(e) => save(r, { colorOverride: e.target.value || null })}
                    >
                      <option value="">Source default</option>
                      {GOOGLE_EVENT_COLORS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex flex-wrap gap-4 text-sm">
                    {(
                      [
                        ["skipDeclined", "Skip declined"],
                        ["skipOOO", "Skip out of office"],
                        ["skipFocusTime", "Skip focus time"],
                        ["skipAllDay", "Skip all-day"],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={Boolean(filters[key])}
                          onChange={(e) =>
                            save(r, { filtersObj: { ...filters, [key]: e.target.checked } })
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!routes.length && <p className="text-sm text-mist-500">No routes yet. Finish setup first.</p>}
      </div>
    </AppShell>
  );
}
