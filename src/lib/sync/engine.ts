import { prisma } from "../prisma";
import {
  createNamedCalendar,
  deleteTargetEvent,
  googleErrorCode,
  insertTargetEvent,
  listEventsPage,
  patchTargetEvent,
} from "../google";
import type { EventMapRecord, MapContext, SourceEvent, SyncProgress } from "../types";
import { DEFAULT_FILTERS } from "../types";
import { parseFilters, planSyncAction } from "./mapper";

const WINDOW_MS = 1000 * 60 * 60 * 24 * 90;

export function defaultWindow(): { timeMin: string; timeMax: string } {
  const now = Date.now();
  return {
    timeMin: new Date(now - WINDOW_MS).toISOString(),
    timeMax: new Date(now + WINDOW_MS).toISOString(),
  };
}

export function emptyProgress(): SyncProgress {
  return { processed: 0, created: 0, updated: 0, deleted: 0, skipped: 0, errors: 0 };
}

export interface CalendarWriteApi {
  insert(targetCalendarId: string, payload: Parameters<typeof insertTargetEvent>[2]): ReturnType<typeof insertTargetEvent>;
  patch(targetCalendarId: string, eventId: string, payload: Parameters<typeof patchTargetEvent>[3]): ReturnType<typeof patchTargetEvent>;
  delete(targetCalendarId: string, eventId: string): Promise<void>;
}

export interface CalendarReadApi {
  listPage(opts: {
    calendarId: string;
    syncToken?: string | null;
    timeMin?: string;
    timeMax?: string;
    pageToken?: string;
    singleEvents?: boolean;
  }): Promise<{ items: SourceEvent[]; nextPageToken?: string; nextSyncToken?: string }>;
}

function liveWriteApi(mainToken: string): CalendarWriteApi {
  return {
    insert: (targetId, payload) => insertTargetEvent(mainToken, targetId, payload),
    patch: (targetId, eventId, payload) => patchTargetEvent(mainToken, targetId, eventId, payload),
    delete: (targetId, eventId) => deleteTargetEvent(mainToken, targetId, eventId),
  };
}

function liveReadApi(sourceToken: string): CalendarReadApi {
  return {
    listPage: (opts) => listEventsPage(sourceToken, opts),
  };
}

export async function applyEventDecision(opts: {
  event: SourceEvent;
  eventMap: EventMapRecord | null;
  filters: ReturnType<typeof parseFilters>;
  ctx: MapContext;
  selfEmail: string;
  targetCalendarId: string;
  sourceCalendarId: string;
  routeId: string;
  write: CalendarWriteApi;
}): Promise<{ action: "skip" | "insert" | "patch" | "delete"; reason?: string }> {
  const decision = planSyncAction(opts.event, opts.eventMap, opts.filters, opts.ctx, opts.selfEmail);

  if (decision.type === "skip") {
    return { action: "skip", reason: decision.reason };
  }

  if (decision.type === "delete") {
    await opts.write.delete(opts.targetCalendarId, decision.targetEventId);
    await prisma.eventMap.update({
      where: { id: decision.eventMapId },
      data: { status: "deleted", lastSyncedAt: new Date() },
    });
    return { action: "delete" };
  }

  const sourceUpdated = opts.event.updated || opts.event.etag || null;

  if (decision.type === "insert") {
    const created = await opts.write.insert(opts.targetCalendarId, decision.payload);
    await prisma.eventMap.upsert({
      where: {
        sourceCalendarId_sourceEventId: {
          sourceCalendarId: opts.sourceCalendarId,
          sourceEventId: opts.event.id!,
        },
      },
      create: {
        routeId: opts.routeId,
        sourceCalendarId: opts.sourceCalendarId,
        sourceEventId: opts.event.id!,
        targetEventId: created.id,
        sourceUpdated,
        lastSyncedAt: new Date(),
        status: "active",
      },
      update: {
        routeId: opts.routeId,
        targetEventId: created.id,
        sourceUpdated,
        lastSyncedAt: new Date(),
        status: "active",
      },
    });
    return { action: "insert" };
  }

  try {
    await opts.write.patch(opts.targetCalendarId, decision.targetEventId, decision.payload);
    await prisma.eventMap.update({
      where: { id: decision.eventMapId },
      data: { sourceUpdated, lastSyncedAt: new Date(), status: "active" },
    });
    return { action: "patch" };
  } catch (err) {
    const code = googleErrorCode(err);
    if (code === 404 || code === 410) {
      const created = await opts.write.insert(opts.targetCalendarId, decision.payload);
      await prisma.eventMap.update({
        where: { id: decision.eventMapId },
        data: {
          targetEventId: created.id,
          sourceUpdated,
          lastSyncedAt: new Date(),
          status: "active",
        },
      });
      return { action: "insert" };
    }
    throw err;
  }
}

export async function syncRoute(
  routeId: string,
  deps?: { read?: CalendarReadApi; write?: CalendarWriteApi }
): Promise<SyncProgress> {
  const progress = emptyProgress();
  const route = await prisma.syncRoute.findUnique({
    where: { id: routeId },
    include: {
      sourceCal: { include: { account: true } },
      targetCal: { include: { account: true } },
    },
  });
  if (!route) throw new Error(`Route ${routeId} not found`);
  if (!route.enabled) {
    return progress;
  }

  const sourceAcct = route.sourceCal.account;
  const targetAcct = route.targetCal.account;
  if (sourceAcct.status !== "active") {
    throw new Error(`Source account ${sourceAcct.email} is ${sourceAcct.status}`);
  }
  if (targetAcct.status !== "active") {
    throw new Error(`Target account ${targetAcct.email} is ${targetAcct.status}`);
  }

  await prisma.syncRoute.update({
    where: { id: routeId },
    data: { lastSyncStatus: "running", lastError: null },
  });

  const filters = { ...DEFAULT_FILTERS, ...parseFilters(route.filters) };
  const ctx: MapContext = {
    routeId: route.id,
    privacyMode: (route.privacyMode as MapContext["privacyMode"]) || "full",
    titlePrefix: route.titlePrefix || "",
    busyTitle: route.busyTitle || "Busy",
    colorOverride: route.colorOverride,
    sourceAccountEmail: sourceAcct.email,
    sourceCalendarName: route.sourceCal.name,
    sourceCalendarGoogleId: route.sourceCal.googleCalendarId,
    sourceLabel: route.titlePrefix || sourceAcct.name || sourceAcct.email,
  };

  const read = deps?.read ?? liveReadApi(sourceAcct.encryptedRefreshToken);
  const write = deps?.write ?? liveWriteApi(targetAcct.encryptedRefreshToken);

  const window = defaultWindow();
  let syncToken = route.sourceCal.syncToken;
  let pageToken: string | undefined;
  let nextSyncToken: string | undefined;
  let usedIncremental = Boolean(syncToken);

  const consumePage = async (items: SourceEvent[]) => {
    for (const event of items) {
      progress.processed += 1;
      if (!event.id) {
        progress.skipped += 1;
        continue;
      }
      try {
        const existing = await prisma.eventMap.findUnique({
          where: {
            sourceCalendarId_sourceEventId: {
              sourceCalendarId: route.sourceCal.googleCalendarId,
              sourceEventId: event.id,
            },
          },
        });
        const result = await applyEventDecision({
          event,
          eventMap: existing,
          filters,
          ctx,
          selfEmail: sourceAcct.email,
          targetCalendarId: route.targetCal.googleCalendarId,
          sourceCalendarId: route.sourceCal.googleCalendarId,
          routeId: route.id,
          write,
        });
        if (result.action === "insert") progress.created += 1;
        else if (result.action === "patch") progress.updated += 1;
        else if (result.action === "delete") progress.deleted += 1;
        else progress.skipped += 1;
      } catch (err) {
        progress.errors += 1;
        console.error(`sync event ${event.id} failed`, err);
      }
    }
  };

  try {
    do {
      try {
        const page = await read.listPage({
          calendarId: route.sourceCal.googleCalendarId,
          syncToken: usedIncremental ? syncToken : null,
          timeMin: usedIncremental ? undefined : window.timeMin,
          timeMax: usedIncremental ? undefined : window.timeMax,
          pageToken,
          singleEvents: usedIncremental ? undefined : true,
        });
        await consumePage(page.items);
        pageToken = page.nextPageToken;
        if (page.nextSyncToken) nextSyncToken = page.nextSyncToken;
      } catch (err) {
        const code = googleErrorCode(err);
        if (usedIncremental && (code === 410 || code === 400)) {
          usedIncremental = false;
          syncToken = null;
          pageToken = undefined;
          continue;
        }
        throw err;
      }
    } while (pageToken);

    if (nextSyncToken) {
      await prisma.calendarRef.update({
        where: { id: route.sourceCalId },
        data: { syncToken: nextSyncToken },
      });
    }

    await prisma.syncRoute.update({
      where: { id: routeId },
      data: {
        lastSyncedAt: new Date(),
        lastSyncStatus: progress.errors ? "error" : "ok",
        lastError: progress.errors ? `${progress.errors} event(s) failed` : null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.syncRoute.update({
      where: { id: routeId },
      data: { lastSyncStatus: "error", lastError: message.slice(0, 500) },
    });
    throw err;
  }

  return progress;
}

export async function syncUserRoutes(userId: string, routeIds?: string[]): Promise<{
  jobId: string;
  progress: SyncProgress;
}> {
  const routes = await prisma.syncRoute.findMany({
    where: {
      userId,
      enabled: true,
      ...(routeIds?.length ? { id: { in: routeIds } } : {}),
    },
    select: { id: true },
  });

  const job = await prisma.syncJob.create({
    data: { userId, status: "running", progress: JSON.stringify(emptyProgress()) },
  });

  const totals = emptyProgress();
  try {
    for (const route of routes) {
      const p = await syncRoute(route.id);
      totals.processed += p.processed;
      totals.created += p.created;
      totals.updated += p.updated;
      totals.deleted += p.deleted;
      totals.skipped += p.skipped;
      totals.errors += p.errors;
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { progress: JSON.stringify(totals) },
      });
    }
    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "done", progress: JSON.stringify(totals) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "error", error: message.slice(0, 500), progress: JSON.stringify(totals) },
    });
    throw err;
  }

  return { jobId: job.id, progress: totals };
}

export async function ensureTargetCalendar(userId: string, name = "From other calendars") {
  const main = await prisma.googleAccount.findFirst({
    where: { userId, isMain: true },
  });
  if (!main) throw new Error("Main Google account is not connected");

  const existing = await prisma.calendarRef.findFirst({
    where: { accountId: main.id, role: "target" },
  });
  if (existing) return existing;

  const created = await createNamedCalendar(main.encryptedRefreshToken, name);
  return prisma.calendarRef.create({
    data: {
      accountId: main.id,
      googleCalendarId: created.id,
      name: created.summary,
      color: "#0b8043",
      role: "target",
      timeZone: created.timeZone ?? undefined,
    },
  });
}

export async function deleteMirroredEventsForRoute(routeId: string): Promise<number> {
  const route = await prisma.syncRoute.findUnique({
    where: { id: routeId },
    include: { targetCal: { include: { account: true } }, eventMaps: true },
  });
  if (!route) return 0;
  const token = route.targetCal.account.encryptedRefreshToken;
  let deleted = 0;
  for (const map of route.eventMaps) {
    if (map.status === "deleted") continue;
    try {
      await deleteTargetEvent(token, route.targetCal.googleCalendarId, map.targetEventId);
      deleted += 1;
    } catch (err) {
      const code = googleErrorCode(err);
      if (code !== 404 && code !== 410) {
        console.error("failed deleting mirrored event", map.targetEventId, err);
      }
    }
  }
  await prisma.eventMap.deleteMany({ where: { routeId } });
  return deleted;
}

export async function deleteAllMirrorsForUser(userId: string): Promise<number> {
  const routes = await prisma.syncRoute.findMany({ where: { userId }, select: { id: true } });
  let total = 0;
  for (const r of routes) {
    total += await deleteMirroredEventsForRoute(r.id);
  }
  return total;
}
