import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { DEFAULT_FILTERS, type PrivacyMode } from "@/lib/types";

const PRIVACY: PrivacyMode[] = ["full", "title", "busy"];

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response!;

  const routes = await prisma.syncRoute.findMany({
    where: { userId: user.id },
    include: {
      sourceCal: { include: { account: { select: { email: true, isMain: true } } } },
      targetCal: { include: { account: { select: { email: true } } } },
      _count: { select: { eventMaps: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    routes: routes.map((r) => ({
      id: r.id,
      privacyMode: r.privacyMode,
      titlePrefix: r.titlePrefix,
      busyTitle: r.busyTitle,
      colorOverride: r.colorOverride,
      filters: r.filters,
      enabled: r.enabled,
      lastSyncedAt: r.lastSyncedAt,
      lastError: r.lastError,
      lastSyncStatus: r.lastSyncStatus,
      mappedEvents: r._count.eventMaps,
      source: {
        id: r.sourceCal.id,
        name: r.sourceCal.name,
        color: r.sourceCal.color,
        googleCalendarId: r.sourceCal.googleCalendarId,
        accountEmail: r.sourceCal.account.email,
      },
      target: {
        id: r.targetCal.id,
        name: r.targetCal.name,
        googleCalendarId: r.targetCal.googleCalendarId,
        accountEmail: r.targetCal.account.email,
      },
    })),
  });
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const body = (await req.json()) as {
    sourceCalId?: string;
    targetCalId?: string;
    privacyMode?: string;
    titlePrefix?: string;
    busyTitle?: string;
    colorOverride?: string | null;
    filters?: unknown;
    enabled?: boolean;
  };

  if (!body.sourceCalId) {
    return NextResponse.json({ error: "sourceCalId required" }, { status: 400 });
  }

  const source = await prisma.calendarRef.findFirst({
    where: { id: body.sourceCalId, account: { userId: user.id } },
  });
  if (!source) return NextResponse.json({ error: "Source calendar not found" }, { status: 404 });

  let targetId = body.targetCalId;
  if (!targetId) {
    const target = await prisma.calendarRef.findFirst({
      where: { role: "target", account: { userId: user.id } },
    });
    if (!target) return NextResponse.json({ error: "No target calendar. Create one first." }, { status: 400 });
    targetId = target.id;
  }

  if (source.id === targetId) {
    return NextResponse.json({ error: "Source and target must be different" }, { status: 400 });
  }

  const privacyMode = PRIVACY.includes(body.privacyMode as PrivacyMode)
    ? (body.privacyMode as PrivacyMode)
    : "full";

  await prisma.calendarRef.update({ where: { id: source.id }, data: { role: "source" } });

  const route = await prisma.syncRoute.create({
    data: {
      userId: user.id,
      sourceCalId: source.id,
      targetCalId: targetId,
      privacyMode,
      titlePrefix: body.titlePrefix ?? "",
      busyTitle: body.busyTitle ?? "Busy",
      colorOverride: body.colorOverride ?? null,
      filters: JSON.stringify(body.filters ?? DEFAULT_FILTERS),
      enabled: body.enabled ?? true,
    },
  });

  return NextResponse.json({ route }, { status: 201 });
}
