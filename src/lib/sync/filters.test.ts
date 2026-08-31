import { describe, expect, it } from "vitest";
import { hasCalAggMarkers, shouldSkipEvent } from "./filters";
import type { SourceEvent } from "../types";

const base: SourceEvent = {
  id: "1",
  status: "confirmed",
  summary: "Focus",
  start: { dateTime: "2026-09-01T10:00:00Z" },
  end: { dateTime: "2026-09-01T11:00:00Z" },
};

describe("filters", () => {
  it("skips out of office", () => {
    expect(shouldSkipEvent({ ...base, eventType: "outOfOffice" }, { skipOOO: true })).toMatchObject({
      skip: true,
      reason: "out-of-office",
    });
  });

  it("skips focus time", () => {
    expect(shouldSkipEvent({ ...base, eventType: "focusTime" }, { skipFocusTime: true })).toMatchObject({
      skip: true,
      reason: "focus-time",
    });
  });

  it("skips all-day when asked", () => {
    const e: SourceEvent = { ...base, start: { date: "2026-09-01" }, end: { date: "2026-09-02" } };
    expect(shouldSkipEvent(e, { skipAllDay: true }).reason).toBe("all-day");
    expect(shouldSkipEvent(e, { skipAllDay: false }).skip).toBe(false);
  });

  it("detects calagg private markers", () => {
    expect(hasCalAggMarkers(base)).toBe(false);
    expect(
      hasCalAggMarkers({
        ...base,
        extendedProperties: { private: { calagg_source_event_id: "x" } },
      })
    ).toBe(true);
  });
});
