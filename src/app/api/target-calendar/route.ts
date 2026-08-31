import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ensureTargetCalendar } from "@/lib/sync/engine";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const target = await prisma.calendarRef.findFirst({
    where: { role: "target", account: { userId: user.id } },
    include: { account: { select: { email: true } } },
  });
  return NextResponse.json({ target });
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const body = (await req.json().catch(() => ({}))) as {
    calendarId?: string;
    create?: boolean;
    name?: string;
  };

  if (body.calendarId) {
    const cal = await prisma.calendarRef.findFirst({
      where: { id: body.calendarId, account: { userId: user.id, isMain: true } },
    });
    if (!cal) return NextResponse.json({ error: "Calendar not found on main account" }, { status: 404 });
    await prisma.calendarRef.updateMany({
      where: { account: { userId: user.id }, role: "target" },
      data: { role: "ignored" },
    });
    const updated = await prisma.calendarRef.update({
      where: { id: cal.id },
      data: { role: "target" },
    });
    return NextResponse.json({ target: updated });
  }

  const created = await ensureTargetCalendar(user.id, body.name || "From other calendars");
  return NextResponse.json({ target: created });
}
