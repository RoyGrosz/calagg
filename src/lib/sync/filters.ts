import type { RouteFilters, SourceEvent } from "../types";

export function isAllDay(event: SourceEvent): boolean {
  return Boolean(event.start?.date) && !event.start?.dateTime;
}

export function isDeclined(event: SourceEvent, selfEmail?: string): boolean {
  const attendees = event.attendees ?? [];
  const self = attendees.find((a) => {
    if (a.self) return true;
    if (selfEmail && a.email && a.email.toLowerCase() === selfEmail.toLowerCase()) {
      return true;
    }
    return false;
  });
  return self?.responseStatus === "declined";
}

export function isOutOfOffice(event: SourceEvent): boolean {
  return event.eventType === "outOfOffice";
}

export function isFocusTime(event: SourceEvent): boolean {
  return event.eventType === "focusTime";
}

export function hasCalAggMarkers(event: SourceEvent): boolean {
  const priv = event.extendedProperties?.private ?? {};
  return Boolean(
    priv.calagg_route_id ||
      priv.calagg_source_event_id ||
      priv.calagg_source_cal_id ||
      priv.calagg_source_account
  );
}

export function shouldSkipEvent(
  event: SourceEvent,
  filters: RouteFilters,
  selfEmail?: string
): { skip: boolean; reason?: string } {
  if (hasCalAggMarkers(event)) {
    return { skip: true, reason: "already-mirrored" };
  }
  if (filters.skipDeclined && isDeclined(event, selfEmail)) {
    return { skip: true, reason: "declined" };
  }
  if (filters.skipOOO && isOutOfOffice(event)) {
    return { skip: true, reason: "out-of-office" };
  }
  if (filters.skipFocusTime && isFocusTime(event)) {
    return { skip: true, reason: "focus-time" };
  }
  if (filters.skipAllDay && isAllDay(event)) {
    return { skip: true, reason: "all-day" };
  }
  return { skip: false };
}
