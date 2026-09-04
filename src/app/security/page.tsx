import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Security",
  description: "How CalAgg protects OAuth tokens and calendar data.",
};

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-mint-400">Trust</p>
        <h1 className="mt-2 font-display text-4xl text-mist-100">Security</h1>
        <p className="mt-2 text-sm text-mist-500">
          Short overview of how CalAgg handles credentials and calendar writes.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-mist-300">
          <div className="card p-5">
            <h2 className="font-medium text-mist-100">Encrypted refresh tokens</h2>
            <p className="mt-2">
              Google OAuth refresh tokens are encrypted at rest with AES-256-GCM before they are
              stored in the database. Access tokens are obtained as needed for API calls.
            </p>
          </div>
          <div className="card p-5">
            <h2 className="font-medium text-mist-100">Dedicated target — never Primary</h2>
            <p className="mt-2">
              Mirrored events are written only to a dedicated target calendar you choose or create.
              CalAgg does not write to your Google Primary calendar.
            </p>
          </div>
          <div className="card p-5">
            <h2 className="font-medium text-mist-100">Provenance markers</h2>
            <p className="mt-2">
              Mirrored events carry title prefixes, description tags, and{" "}
              <code className="text-mint-300">calagg_*</code> extendedProperties so you can tell
              them apart from native events and so updates/deletes stay mapped correctly.
            </p>
          </div>
          <div className="card p-5">
            <h2 className="font-medium text-mist-100">One-way sync</h2>
            <p className="mt-2">
              Sync is source → target only. CalAgg never ping-pongs changes back onto sources.
            </p>
          </div>
          <div className="card p-5">
            <h2 className="font-medium text-mist-100">Revoke access anytime</h2>
            <p className="mt-2">
              Disconnect accounts in CalAgg Settings, or revoke the app under{" "}
              <a
                className="text-mint-400 hover:underline"
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
              >
                Google Account → Third-party access
              </a>
              .
            </p>
          </div>
          <p>
            More detail on data practices:{" "}
            <Link href="/privacy" className="text-mint-400 hover:underline">
              Privacy Policy
            </Link>
            . Support:{" "}
            <a className="text-mint-400 hover:underline" href="mailto:roysbots@gmail.com">
              roysbots@gmail.com
            </a>
            .
          </p>
        </div>

        <p className="mt-10 text-sm text-mist-500">
          <Link href="/" className="text-mint-400 hover:underline">
            ← Home
          </Link>
          {" · "}
          <Link href="/privacy" className="text-mint-400 hover:underline">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="text-mint-400 hover:underline">
            Terms
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
