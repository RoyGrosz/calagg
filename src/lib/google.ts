import { google, calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { decryptToken } from "./crypto";
import type { SourceEvent, TargetEventPayload } from "./types";

export const CALENDAR_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar",
];

export const CALENDAR_SCOPE_STRING = CALENDAR_SCOPES.join(" ");

export function appBaseUrl(): string {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getOAuthClient(redirectUri?: string): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri ?? process.env.GOOGLE_REDIRECT_URI ?? `${appBaseUrl()}/api/accounts/callback`
  );
}

export function clientForRefreshToken(refreshToken: string): OAuth2Client {
  const client = getOAuthClient(`${appBaseUrl()}/api/auth/callback/google`);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export function calendarApi(auth: OAuth2Client) {
  return google.calendar({ version: "v3", auth });
}

export function calendarForEncryptedToken(encryptedRefreshToken: string) {
  const refresh = decryptToken(encryptedRefreshToken);
  return calendarApi(clientForRefreshToken(refresh));
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  backgroundColor?: string | null;
  foregroundColor?: string | null;
  primary?: boolean | null;
  accessRole?: string | null;
  timeZone?: string | null;
}

export async function listCalendars(encryptedRefreshToken: string): Promise<CalendarListEntry[]> {
  const cal = calendarForEncryptedToken(encryptedRefreshToken);
  const out: CalendarListEntry[] = [];
  let pageToken: string | undefined;
  do {
    const res = await cal.calendarList.list({ maxResults: 250, pageToken, minAccessRole: "reader" });
    for (const item of res.data.items ?? []) {
      if (!item.id) continue;
      out.push({
        id: item.id,
        summary: item.summary || item.id,
        backgroundColor: item.backgroundColor,
        foregroundColor: item.foregroundColor,
        primary: item.primary,
        accessRole: item.accessRole,
        timeZone: item.timeZone,
      });
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);
  return out;
}

export async function createNamedCalendar(
  encryptedRefreshToken: string,
  summary: string
): Promise<{ id: string; summary: string; timeZone?: string | null }> {
  const cal = calendarForEncryptedToken(encryptedRefreshToken);
  const res = await cal.calendars.insert({
    requestBody: { summary, description: "EchoCal target calendar. Mirrored events — do not edit." },
  });
  if (!res.data.id) throw new Error("Google did not return a calendar id");
  try {
    await cal.calendarList.patch({
      calendarId: res.data.id,
      requestBody: { backgroundColor: "#0b8043", selected: true },
      colorRgbFormat: true,
    });
  } catch {
    // color patch is optional
  }
  return { id: res.data.id, summary: res.data.summary || summary, timeZone: res.data.timeZone };
}

export interface ListEventsOptions {
  calendarId: string;
  syncToken?: string | null;
  timeMin?: string;
  timeMax?: string;
  pageToken?: string;
  singleEvents?: boolean;
}

export async function listEventsPage(
  encryptedRefreshToken: string,
  opts: ListEventsOptions
): Promise<{
  items: SourceEvent[];
  nextPageToken?: string;
  nextSyncToken?: string;
}> {
  const cal = calendarForEncryptedToken(encryptedRefreshToken);
  const params: calendar_v3.Params$Resource$Events$List = {
    calendarId: opts.calendarId,
    maxResults: 250,
    showDeleted: true,
    pageToken: opts.pageToken,
  };

  if (opts.syncToken) {
    params.syncToken = opts.syncToken;
  } else {
    params.timeMin = opts.timeMin;
    params.timeMax = opts.timeMax;
    params.singleEvents = opts.singleEvents ?? true;
    params.orderBy = "startTime";
  }

  const res = await cal.events.list(params);
  return {
    items: (res.data.items ?? []) as SourceEvent[],
    nextPageToken: res.data.nextPageToken ?? undefined,
    nextSyncToken: res.data.nextSyncToken ?? undefined,
  };
}

export async function insertTargetEvent(
  encryptedRefreshToken: string,
  targetCalendarId: string,
  payload: TargetEventPayload
): Promise<{ id: string; etag?: string | null; updated?: string | null; htmlLink?: string | null }> {
  const cal = calendarForEncryptedToken(encryptedRefreshToken);
  const body = toGoogleEventBody(payload);
  const res = await cal.events.insert({
    calendarId: targetCalendarId,
    requestBody: body,
    conferenceDataVersion: payload.conferenceData ? 1 : 0,
  });
  if (!res.data.id) throw new Error("Google did not return an event id");
  return { id: res.data.id, etag: res.data.etag, updated: res.data.updated, htmlLink: res.data.htmlLink };
}

export async function patchTargetEvent(
  encryptedRefreshToken: string,
  targetCalendarId: string,
  eventId: string,
  payload: TargetEventPayload
): Promise<{ id: string; etag?: string | null; updated?: string | null }> {
  const cal = calendarForEncryptedToken(encryptedRefreshToken);
  const body = toGoogleEventBody(payload);
  const res = await cal.events.patch({
    calendarId: targetCalendarId,
    eventId,
    requestBody: body,
    conferenceDataVersion: payload.conferenceData ? 1 : 0,
  });
  return { id: res.data.id || eventId, etag: res.data.etag, updated: res.data.updated };
}

export async function deleteTargetEvent(
  encryptedRefreshToken: string,
  targetCalendarId: string,
  eventId: string
): Promise<void> {
  const cal = calendarForEncryptedToken(encryptedRefreshToken);
  try {
    await cal.events.delete({ calendarId: targetCalendarId, eventId });
  } catch (err: unknown) {
    const code = googleErrorCode(err);
    if (code === 404 || code === 410) return;
    throw err;
  }
}

export function googleErrorCode(err: unknown): number | undefined {
  if (err && typeof err && typeof err === "object") {
    const anyErr = err as { code?: number; response?: { status?: number }; status?: number };
    return anyErr.code ?? anyErr.status ?? anyErr.response?.status;
  }
  return undefined;
}

function toGoogleEventBody(payload: TargetEventPayload): calendar_v3.Schema$Event {
  const body: calendar_v3.Schema$Event = {
    summary: payload.summary,
    description: payload.description,
    start: payload.start,
    end: payload.end,
    extendedProperties: payload.extendedProperties,
  };
  if (payload.location) body.location = payload.location;
  if (payload.colorId) body.colorId = payload.colorId;
  if (payload.transparency) body.transparency = payload.transparency;
  if (payload.conferenceData) {
    body.conferenceData = payload.conferenceData as calendar_v3.Schema$ConferenceData;
  }
  return body;
}

export async function getGoogleUserInfo(accessToken: string): Promise<{
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Google user info (${res.status})`);
  }
  const data = (await res.json()) as {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  };
  if (!data.sub || !data.email) throw new Error("Google user info missing sub/email");
  return data;
}
