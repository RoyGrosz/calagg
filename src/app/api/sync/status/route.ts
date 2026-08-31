import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (jobId) {
    const job = await prisma.syncJob.findFirst({ where: { id: jobId, userId: user.id } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json({
      job: {
        id: job.id,
        status: job.status,
        progress: JSON.parse(job.progress || "{}"),
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  }

  const latest = await prisma.syncJob.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    job: latest
      ? {
          id: latest.id,
          status: latest.status,
          progress: JSON.parse(latest.progress || "{}"),
          error: latest.error,
          createdAt: latest.createdAt,
          updatedAt: latest.updatedAt,
        }
      : null,
  });
}
