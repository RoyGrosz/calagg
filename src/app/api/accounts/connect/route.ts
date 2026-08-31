import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { CALENDAR_SCOPE_STRING, appBaseUrl, getOAuthClient } from "@/lib/google";
import { signOAuthState } from "@/lib/oauth-state";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response!;

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appBaseUrl()}/api/accounts/callback`;
  const client = getOAuthClient(redirectUri);
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account consent",
    scope: CALENDAR_SCOPE_STRING.split(" "),
    state: signOAuthState(user.id),
    include_granted_scopes: false,
  });
  return NextResponse.redirect(url);
}
