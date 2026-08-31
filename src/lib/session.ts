import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: { orderBy: [{ isMain: "desc" }, { createdAt: "asc" }] } },
  });
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "User not found" }, { status: 401 }) };
  }
  return { user, response: null };
}
