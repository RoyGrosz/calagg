import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response!;

  const calendars = await prisma.calendarRef.findMany({
    where: { account: { userId: user.id } },
    include: { account: { select: { id: true, email: true, isMain: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    calendars: calendars.map((c) => ({
      id: c.id,
      googleCalendarId: c.googleCalendarId,
      name: c.name,
      color: c.color,
      role: c.role,
      timeZone: c.timeZone,
      accountId: c.accountId,
      accountEmail: c.account.email,
      isMainAccount: c.account.isMain,
    })),
  });
}
