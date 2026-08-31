import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/crypto";
import { appBaseUrl, getGoogleUserInfo, getOAuthClient } from "@/lib/google";
import { verifyOAuthState } from "@/lib/oauth-state";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const base = appBaseUrl();

  if (error) {
    return NextResponse.redirect(`${base}/onboarding?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${base}/onboarding?error=missing_code`);
  }

  let userId: string;
  try {
    userId = verifyOAuthState(state);
  } catch {
    return NextResponse.redirect(`${base}/onboarding?error=invalid_state`);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.redirect(`${base}/login?error=user_not_found`);
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${base}/api/accounts/callback`;
  const client = getOAuthClient(redirectUri);
  const { tokens } = await client.getToken(code);
  if (!tokens.access_token) {
    return NextResponse.redirect(`${base}/onboarding?error=no_access_token`);
  }

  const profile = await getGoogleUserInfo(tokens.access_token);
  const refresh = tokens.refresh_token;
  const scopes = tokens.scope || "";

  const existing = await prisma.googleAccount.findUnique({ where: { googleSub: profile.sub } });
  if (existing && existing.userId !== userId) {
    return NextResponse.redirect(`${base}/onboarding?error=account_linked_elsewhere`);
  }

  if (existing) {
    await prisma.googleAccount.update({
      where: { id: existing.id },
      data: {
        email: profile.email,
        name: profile.name,
        scopes,
        status: refresh || existing.encryptedRefreshToken ? "active" : "error",
        ...(refresh ? { encryptedRefreshToken: encryptToken(refresh) } : {}),
      },
    });
  } else {
    const hasMain = await prisma.googleAccount.findFirst({
      where: { userId, isMain: true },
    });
    await prisma.googleAccount.create({
      data: {
        userId,
        googleSub: profile.sub,
        email: profile.email,
        name: profile.name,
        encryptedRefreshToken: refresh ? encryptToken(refresh) : encryptToken(""),
        scopes,
        status: refresh ? "active" : "error",
        isMain: !hasMain,
      },
    });
  }

  const dest = user.onboardedAt ? "/settings?linked=1" : "/onboarding?linked=1";
  return NextResponse.redirect(`${base}${dest}`);
}
