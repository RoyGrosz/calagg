import type {
  EventMapRecord,
  MapContext,
  RouteFilters,
  SourceEvent,
  SyncAction,
  TargetEventPayload,
} from "../types";
import { hasCalAggMarkers, shouldSkipEvent } from "./filters";
import { buildProvenanceBlock, withTitlePrefix } from "./provenance";

export function mapTitle(ctx: MapContext, event: SourceEvent): string {
  if (ctx.privacyMode === "busy") {
    return withTitlePrefix(ctx.titlePrefix, ctx.busyTitle || "Busy");
  }
  return withTitlePrefix(ctx.titlePrefix, event.summary?.trim() || "(No title)");
}

export function mapDescription(ctx: MapContext, event: SourceEvent): string {
  const provenance = buildProvenanceBlock(ctx, event);
  if (ctx.privacyMode === "busy") {
    return `${provenance}\n\nThis time is reserved on ${ctx.sourceLabel} (${ctx.sourceAccountEmail}).`;
  }
  if (ctx.privacyMode === "title") {
    return provenance;
  }
  const parts = [provenance];
  if (event.hangoutLink) parts.push(`Meet: ${event.hangoutLink}`);
  const original = event.description?.trim();
  if (original) parts.push(original);
  return parts.join("\n\n");
}

export function mapLocation(ctx: MapContext, event: SourceEvent): string | undefined {
  if (ctx.privacyMode !== "full") return undefined;
  return event.location?.trim() || undefined;
}

export function toTargetPayload(event: SourceEvent, ctx: MapContext): TargetEventPayload {
  if (!event.id) {
    throw new Error("Cannot map an event without an id");
  }
  const payload: TargetEventPayload = {
    summary: mapTitle(ctx, event),
    description: mapDescription(ctx, event),
    start: event.start ?? {},
    end: event.end ?? {},
    extendedProperties: {
      private: {
        calagg_route_id: ctx.routeId,
        calagg_source_event_id: event.id,
        calagg_source_cal_id: ctx.sourceCalendarGoogleId,
        calagg_source_account: ctx.sourceAccountEmail,
      },
    },
  };

  const location = mapLocation(ctx, event);
  if (location) payload.location = location;

  if (ctx.colorOverride) {
    payload.colorId = ctx.colorOverride;
  } else if (event.colorId) {
    payload.colorId = event.colorId;
  }

  // Meet URL is copied into the description. Do not clone conferenceData:
  // Google rejects foreign conference IDs on insert.

  if (event.transparency) payload.transparency = event.transparency;

  return payload;
}

export function planSyncAction(
  event: SourceEvent,
  eventMap: EventMapRecord | null,
  filters: RouteFilters,
  ctx: MapContext,
  selfEmail?: string
): SyncAction {
  if (!event.id) {
    return { type: "skip", reason: "missing-id" };
  }

  if (hasCalAggMarkers(event)) {
    return { type: "skip", reason: "already-mirrored" };
  }

  const cancelled = event.status === "cancelled";
  if (cancelled) {
    if (eventMap && eventMap.status !== "deleted") {
      return {
        type: "delete",
        eventMapId: eventMap.id,
        targetEventId: eventMap.targetEventId,
      };
    }
    return { type: "skip", reason: "cancelled-unmapped" };
  }

  const filtered = shouldSkipEvent(event, filters, selfEmail);
  if (filtered.skip) {
    if (eventMap && eventMap.status !== "deleted") {
      return {
        type: "delete",
        eventMapId: eventMap.id,
        targetEventId: eventMap.targetEventId,
      };
    }
    return { type: "skip", reason: filtered.reason ?? "filtered" };
  }

  const payload = toTargetPayload(event, ctx);

  if (eventMap && eventMap.status !== "deleted") {
    if (eventMap.sourceUpdated && event.updated && eventMap.sourceUpdated === event.updated) {
      return { type: "skip", reason: "unchanged" };
    }
    if (event.etag && eventMap.sourceUpdated && eventMap.sourceUpdated === event.etag) {
      return { type: "skip", reason: "unchanged" };
    }
    return {
      type: "patch",
      targetEventId: eventMap.targetEventId,
      eventMapId: eventMap.id,
      payload,
    };
  }

  return { type: "insert", payload };
}

export function parseFilters(raw: string | null | undefined): RouteFilters {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as RouteFilters;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
