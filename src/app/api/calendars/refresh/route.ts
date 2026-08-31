import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { listCalendars } from "@/lib/google";

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response!;

  const body = (await req.json().catch(() => ({}))) as { accountId?: string };
  const accounts = await prisma.googleAccount.findMany({
    where: {
      userId: user.id,
      status: "active",
      ...(body.accountId ? { id: body.accountId } : {}),
    },
  });

  const upserted: { accountId: string; count: number }[] = [];
  for (const account of accounts) {
    try {
      const list = await listCalendars(account.encryptedRefreshToken);
      const seen = new Set<string>();
      for (const item of list) {
        seen.add(item.id);
        await prisma.calendarRef.upsert({
          where: {
            accountId_googleCalendarId: {
              accountId: account.id,
              googleCalendarId: item.id,
            },
          },
          create: {
            accountId: account.id,
            googleCalendarId: item.id,
            name: item.summary,
            color: item.backgroundColor ?? undefined,
            role: "ignored",
            timeZone: item.timeZone ?? undefined,
          },
          update: {
            name: item.summary,
            color: item.backgroundColor ?? undefined,
            timeZone: item.timeZone ?? undefined,
          },
        });
      }
      upserted.push({ accountId: account.id, count: seen.size });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.googleAccount.update({
        where: { id: account.id },
        data: { status: "error" },
      });
      return NextResponse.json(
        { error: `Failed to list calendars for ${account.email}: ${message}` },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ ok: true, upserted });
}
