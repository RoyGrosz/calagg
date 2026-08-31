import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteMirroredEventsForRoute } from "@/lib/sync/engine";
import type { PrivacyMode } from "@/lib/types";

const PRIVACY: PrivacyMode[] = ["full", "title", "busy"];

async function loadRoute(userId: string, id: string) {
  return prisma.syncRoute.findFirst({ where: { id, userId } });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const { id } = await ctx.params;
  const route = await loadRoute(user.id, id);
  if (!route) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as {
    privacyMode?: string;
    titlePrefix?: string;
    busyTitle?: string;
    colorOverride?: string | null;
    filters?: unknown;
    enabled?: boolean;
  };

  const data: Record<string, unknown> = {};
  if (body.privacyMode && PRIVACY.includes(body.privacyMode as PrivacyMode)) {
    data.privacyMode = body.privacyMode;
  }
  if (typeof body.titlePrefix === "string") data.titlePrefix = body.titlePrefix;
  if (typeof body.busyTitle === "string") data.busyTitle = body.busyTitle;
  if (body.colorOverride !== undefined) data.colorOverride = body.colorOverride;
  if (body.filters !== undefined) data.filters = JSON.stringify(body.filters);
  if (typeof body.enabled === "boolean") data.enabled = body.enabled;

  const updated = await prisma.syncRoute.update({ where: { id }, data });
  return NextResponse.json({ route: updated });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const { id } = await ctx.params;
  const route = await loadRoute(user.id, id);
  if (!route) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deletedEvents = await deleteMirroredEventsForRoute(id);
  await prisma.syncRoute.delete({ where: { id } });
  return NextResponse.json({ ok: true, deletedEvents });
}
