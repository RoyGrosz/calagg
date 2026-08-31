import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteMirroredEventsForRoute } from "@/lib/sync/engine";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const { id } = await ctx.params;

  const account = await prisma.googleAccount.findFirst({
    where: { id, userId: user.id },
    include: { calendars: { include: { sourceRoutes: true, targetRoutes: true } } },
  });
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const routeIds = new Set<string>();
  for (const cal of account.calendars) {
    for (const r of cal.sourceRoutes) routeIds.add(r.id);
    for (const r of cal.targetRoutes) routeIds.add(r.id);
  }

  let deletedEvents = 0;
  for (const routeId of routeIds) {
    deletedEvents += await deleteMirroredEventsForRoute(routeId);
  }

  await prisma.syncRoute.deleteMany({ where: { id: { in: [...routeIds] } } });
  await prisma.calendarRef.deleteMany({ where: { accountId: account.id } });
  await prisma.googleAccount.delete({ where: { id: account.id } });

  if (account.isMain) {
    const next = await prisma.googleAccount.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.googleAccount.update({ where: { id: next.id }, data: { isMain: true } });
    }
  }

  return NextResponse.json({ ok: true, deletedEvents, disconnected: account.email });
}
