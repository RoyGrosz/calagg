import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { emptyProgress, syncUserRoutes } from "@/lib/sync/engine";
import { runAllEnabledRoutes } from "@/lib/worker";

function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function handleCron() {
  await runAllEnabledRoutes();
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handleCron();
}

export async function POST(req: NextRequest) {
  if (isCronAuthorized(req)) {
    return handleCron();
  }

  const { user, response } = await requireUser();
  if (!user) return response!;
  const body = (await req.json().catch(() => ({}))) as { routeIds?: string[] };

  const job = await prisma.syncJob.create({
    data: {
      userId: user.id,
      status: "queued",
      progress: JSON.stringify(emptyProgress()),
      routeId: body.routeIds?.length === 1 ? body.routeIds[0] : null,
    },
  });

  void (async () => {
    try {
      await prisma.syncJob.update({ where: { id: job.id }, data: { status: "running" } });
      const result = await syncUserRoutes(user.id, body.routeIds);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { status: "done", progress: JSON.stringify(result.progress) },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { status: "error", error: message.slice(0, 500) },
      });
    }
  })();

  return NextResponse.json({ jobId: job.id, status: "queued" }, { status: 202 });
}
