import { describe, expect, it } from "vitest";
import type { EventMapRecord, MapContext, SourceEvent } from "../types";
import { mapDescription, mapTitle, planSyncAction, toTargetPayload } from "./mapper";
import { hasCalAggMarkers } from "./filters";

const ctx: MapContext = {
  routeId: "route-1",
  privacyMode: "full",
  titlePrefix: "Acme",
  busyTitle: "Busy",
  colorOverride: "7",
  sourceAccountEmail: "you@acme.com",
  sourceCalendarName: "Team calendar",
  sourceCalendarGoogleId: "cal-src",
  sourceLabel: "Acme Work",
};

function event(over: Partial<SourceEvent> = {}): SourceEvent {
  return {
    id: "evt-1",
    status: "confirmed",
    summary: "Standup",
    description: "Daily notes",
    location: "Room 4",
    htmlLink: "https://calendar.google.com/event?eid=abc",
    hangoutLink: "https://meet.google.com/xyz",
    start: { dateTime: "2026-09-01T09:00:00-07:00", timeZone: "America/Los_Angeles" },
    end: { dateTime: "2026-09-01T09:30:00-07:00", timeZone: "America/Los_Angeles" },
    updated: "2026-08-31T12:00:00.000Z",
    ...over,
  };
}

const mapRec: EventMapRecord = {
  id: "map-1",
  targetEventId: "tgt-1",
  sourceUpdated: "old",
  status: "active",
};

describe("privacy mapping", () => {
  it("prefixes titles from the route", () => {
    expect(mapTitle(ctx, event())).toBe("[Acme] Standup");
  });

  it("busy mode uses the busy title", () => {
    expect(mapTitle({ ...ctx, privacyMode: "busy" }, event())).toBe("[Acme] Busy");
  });

  it("full mode keeps location, description, and Meet, plus provenance", () => {
    const payload = toTargetPayload(event(), ctx);
    expect(payload.location).toBe("Room 4");
    expect(payload.description).toContain("Meet: https://meet.google.com/xyz");
    expect(payload.description).toContain("Source: Acme Work · Team calendar");
    expect(payload.description).toContain("Account: you@acme.com");
    expect(payload.description).toContain("Open original: https://calendar.google.com/event?eid=abc");
    expect(payload.description).toContain("Synced by EchoCal · do not edit");
    expect(payload.description).toContain("Daily notes");
    expect(payload.extendedProperties.private).toEqual({
      calagg_route_id: "route-1",
      calagg_source_event_id: "evt-1",
      calagg_source_cal_id: "cal-src",
      calagg_source_account: "you@acme.com",
    });
    expect(payload.start.timeZone).toBe("America/Los_Angeles");
    expect(payload.colorId).toBe("7");
  });

  it("title mode drops location and original description", () => {
    const payload = toTargetPayload(event(), { ...ctx, privacyMode: "title" });
    expect(payload.location).toBeUndefined();
    expect(payload.description).toContain("Synced by EchoCal");
    expect(payload.description).not.toContain("Daily notes");
    expect(payload.hangoutLink).toBeUndefined();
    expect(payload.summary).toBe("[Acme] Standup");
  });

  it("busy mode hides the real title and says which source reserved time", () => {
    const desc = mapDescription({ ...ctx, privacyMode: "busy" }, event());
    expect(desc).toContain("This time is reserved on Acme Work (you@acme.com)");
    expect(desc).not.toContain("Daily notes");
  });
});

describe("EventMap upsert/delete planner", () => {
  it("skips events that already carry calagg markers", () => {
    const e = event({
      extendedProperties: { private: { calagg_route_id: "other" } },
    });
    expect(hasCalAggMarkers(e)).toBe(true);
    expect(planSyncAction(e, null, {}, ctx).type).toBe("skip");
    expect(planSyncAction(e, null, {}, ctx)).toMatchObject({ reason: "already-mirrored" });
  });

  it("inserts when there is no EventMap", () => {
    const action = planSyncAction(event(), null, {}, ctx);
    expect(action.type).toBe("insert");
    if (action.type === "insert") {
      expect(action.payload.summary).toBe("[Acme] Standup");
    }
  });

  it("patches when EventMap exists and source changed", () => {
    const action = planSyncAction(event(), mapRec, {}, ctx);
    expect(action.type).toBe("patch");
    if (action.type === "patch") {
      expect(action.targetEventId).toBe("tgt-1");
      expect(action.eventMapId).toBe("map-1");
    }
  });

  it("skips unchanged events when updated matches EventMap", () => {
    const action = planSyncAction(event(), { ...mapRec, sourceUpdated: "2026-08-31T12:00:00.000Z" }, {}, ctx);
    expect(action).toMatchObject({ type: "skip", reason: "unchanged" });
  });

  it("deletes the target when the source is cancelled", () => {
    const action = planSyncAction(event({ status: "cancelled" }), mapRec, {}, ctx);
    expect(action).toEqual({ type: "delete", eventMapId: "map-1", targetEventId: "tgt-1" });
  });

  it("does not delete when a cancelled event was never mapped", () => {
    const action = planSyncAction(event({ status: "cancelled" }), null, {}, ctx);
    expect(action).toMatchObject({ type: "skip", reason: "cancelled-unmapped" });
  });

  it("deletes previously mapped events that are now filtered (declined)", () => {
    const e = event({
      attendees: [{ email: "you@acme.com", self: true, responseStatus: "declined" }],
    });
    const action = planSyncAction(e, mapRec, { skipDeclined: true }, ctx, "you@acme.com");
    expect(action.type).toBe("delete");
  });

  it("skips declined unmapped events", () => {
    const e = event({
      attendees: [{ self: true, responseStatus: "declined" }],
    });
    const action = planSyncAction(e, null, { skipDeclined: true }, ctx);
    expect(action).toMatchObject({ type: "skip", reason: "declined" });
  });
});
