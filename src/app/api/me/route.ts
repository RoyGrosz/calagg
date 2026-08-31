import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const target = await prisma.calendarRef.findFirst({
    where: { role: "target", account: { userId: user.id } },
  });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      onboardedAt: user.onboardedAt,
    },
    accounts: user.accounts.map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      isMain: a.isMain,
      status: a.status,
    })),
    hasTarget: Boolean(target),
  });
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const body = (await req.json().catch(() => ({}))) as { onboarded?: boolean };
  if (body.onboarded) {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardedAt: new Date() },
    });
  }
  return NextResponse.json({ ok: true });
}
