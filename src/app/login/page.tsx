"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
      <div className="card p-8">
        <div className="mb-6 flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <div>
            <div className="font-display text-2xl">CalAgg</div>
            <div className="text-sm text-mist-500">Calendar aggregator</div>
          </div>
        </div>
        <h1 className="font-display text-3xl leading-tight text-mist-100">
          One-way mirrors, with provenance.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mist-500">
          Connect a main Google account, pick a dedicated target calendar, then
          pull selected calendars from work or secondary accounts. Native Google
          Calendar is enough — no extension.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-mist-300">
          <li className="flex gap-2"><span className="text-mint-400">→</span> Source → target only. Never ping-pong.</li>
          <li className="flex gap-2"><span className="text-mint-400">→</span> Titles prefixed, descriptions tagged, colors per source.</li>
          <li className="flex gap-2"><span className="text-mint-400">→</span> Privacy modes: full, title-only, or busy.</li>
        </ul>
        <button
          className="btn-primary mt-8 w-full"
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        >
          Continue with Google
        </button>
        <p className="mt-3 text-center text-xs text-mist-500">
          The first Google account you connect becomes your main (target) account.
        </p>
        <p className="mt-6 text-center text-xs text-mist-500">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-mint-400 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-mint-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <p className="mt-6 text-center text-xs text-mist-500">
        <Link href="/" className="hover:text-mist-100">
          ← Back to home
        </Link>
        {" · "}
        <Link href="/privacy" className="hover:text-mist-100">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="hover:text-mist-100">
          Terms
        </Link>
        {" · "}
        <Link href="/security" className="hover:text-mist-100">
          Security
        </Link>
      </p>
    </div>
  );
}
