export type PrivacyMode = "full" | "title" | "busy";
export type CalendarRole = "source" | "target" | "ignored";
export type AccountStatus = "active" | "revoked" | "error";

export interface EventTime {
  dateTime?: string | null;
  date?: string | null;
  timeZone?: string | null;
}

export interface SourceAttendee {
  email?: string | null;
  self?: boolean | null;
  responseStatus?: string | null;
}

export interface SourceEvent {
  id?: string | null;
  status?: string | null;
  summary?: string | null;
  description?: string | null;
  location?: string | null;
  htmlLink?: string | null;
  hangoutLink?: string | null;
  conferenceData?: Record<string, unknown> | null;
  start?: EventTime | null;
  end?: EventTime | null;
  attendees?: SourceAttendee[] | null;
  eventType?: string | null;
  transparency?: string | null;
  visibility?: string | null;
  extendedProperties?: {
    private?: Record<string, string> | null;
    shared?: Record<string, string> | null;
  } | null;
  updated?: string | null;
  etag?: string | null;
  recurrence?: string[] | null;
  recurringEventId?: string | null;
  colorId?: string | null;
  organizer?: { email?: string | null; displayName?: string | null } | null;
}

export interface RouteFilters {
  skipDeclined?: boolean;
  skipOOO?: boolean;
  skipFocusTime?: boolean;
  skipAllDay?: boolean;
}

export interface MapContext {
  routeId: string;
  privacyMode: PrivacyMode;
  titlePrefix: string;
  busyTitle: string;
  colorOverride?: string | null;
  sourceAccountEmail: string;
  sourceCalendarName: string;
  sourceCalendarGoogleId: string;
  sourceLabel: string;
}

export interface TargetEventPayload {
  summary: string;
  description: string;
  location?: string;
  start: EventTime;
  end: EventTime;
  colorId?: string;
  transparency?: string;
  hangoutLink?: string;
  conferenceData?: Record<string, unknown>;
  extendedProperties: {
    private: {
      calagg_route_id: string;
      calagg_source_event_id: string;
      calagg_source_cal_id: string;
      calagg_source_account: string;
    };
  };
}

export interface EventMapRecord {
  id: string;
  targetEventId: string;
  sourceUpdated?: string | null;
  status: string;
}

export type SyncAction =
  | { type: "skip"; reason: string }
  | { type: "delete"; eventMapId: string; targetEventId: string }
  | { type: "insert"; payload: TargetEventPayload }
  | { type: "patch"; targetEventId: string; eventMapId: string; payload: TargetEventPayload };

export interface SyncProgress {
  processed: number;
  created: number;
  updated: number;
  deleted: number;
  skipped: number;
  errors: number;
}

export const DEFAULT_FILTERS: Required<RouteFilters> = {
  skipDeclined: true,
  skipOOO: true,
  skipFocusTime: true,
  skipAllDay: false,
};

export const GOOGLE_EVENT_COLORS: { id: string; name: string; hex: string }[] = [
  { id: "1", name: "Lavender", hex: "#7986cb" },
  { id: "2", name: "Sage", hex: "#33b679" },
  { id: "3", name: "Grape", hex: "#8e24aa" },
  { id: "4", name: "Flamingo", hex: "#e67c73" },
  { id: "5", name: "Banana", hex: "#f6bf26" },
  { id: "6", name: "Tangerine", hex: "#f4511e" },
  { id: "7", name: "Peacock", hex: "#039be5" },
  { id: "8", name: "Graphite", hex: "#616161" },
  { id: "9", name: "Blueberry", hex: "#3f51b5" },
  { id: "10", name: "Basil", hex: "#0b8043" },
  { id: "11", name: "Tomato", hex: "#d50000" },
];
