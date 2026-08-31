import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { encryptToken } from "./crypto";
import { CALENDAR_SCOPE_STRING } from "./google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
          scope: CALENDAR_SCOPE_STRING,
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== "google") return false;
      const email = user.email;
      if (!email) return false;

      const refresh = account.refresh_token;
      const googleSub = account.providerAccountId;
      const scopes = account.scope || CALENDAR_SCOPE_STRING;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      const dbUser =
        existingUser ??
        (await prisma.user.create({
          data: {
            email,
            name: user.name,
            image: user.image,
          },
        }));

      const existingAcct = await prisma.googleAccount.findUnique({ where: { googleSub } });

      if (existingAcct) {
        await prisma.googleAccount.update({
          where: { id: existingAcct.id },
          data: {
            email,
            name: user.name,
            scopes,
            status: "active",
            userId: dbUser.id,
            ...(refresh ? { encryptedRefreshToken: encryptToken(refresh) } : {}),
          },
        });
      } else {
        const hasMain = await prisma.googleAccount.findFirst({
          where: { userId: dbUser.id, isMain: true },
        });
        if (!refresh) {
          console.warn("Google sign-in without refresh_token for", email);
        }
        await prisma.googleAccount.create({
          data: {
            userId: dbUser.id,
            googleSub,
            email,
            name: user.name,
            encryptedRefreshToken: refresh ? encryptToken(refresh) : encryptToken(""),
            scopes,
            status: refresh ? "active" : "error",
            isMain: !hasMain,
          },
        });
      }

      if (user.name || user.image) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { name: user.name ?? dbUser.name, image: user.image ?? dbUser.image },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (dbUser) token.userId = dbUser.id;
      }
      if (!token.userId && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) token.userId = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) || "";
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
