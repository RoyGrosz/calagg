import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { deleteAllMirrorsForUser } from "@/lib/sync/engine";

export async function DELETE(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response!;
  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "DELETE") {
    return NextResponse.json(
      { error: 'Type confirm: "DELETE" to wipe all mirrored events' },
      { status: 400 }
    );
  }
  const deleted = await deleteAllMirrorsForUser(user.id);
  return NextResponse.json({ ok: true, deleted });
}
