import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response!;

  const accounts = await prisma.googleAccount.findMany({
    where: { userId: user.id },
    orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
    include: {
      calendars: { orderBy: { name: "asc" } },
    },
  });

  return NextResponse.json({
    accounts: accounts.map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      isMain: a.isMain,
      status: a.status,
      scopes: a.scopes,
      calendars: a.calendars.map((c) => ({
        id: c.id,
        googleCalendarId: c.googleCalendarId,
        name: c.name,
        color: c.color,
        role: c.role,
        timeZone: c.timeZone,
      })),
    })),
  });
}
