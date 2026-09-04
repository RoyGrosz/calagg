import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How EchoCal collects, uses, and protects data for Google Calendar aggregation.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="prose-legal mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-mint-400">Legal</p>
        <h1 className="mt-2 font-display text-4xl text-mist-100">Privacy Policy</h1>
        <p className="mt-2 text-sm text-mist-500">Effective date: September 4, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-mist-300">
          <section>
            <h2 className="font-display text-xl text-mist-100">Overview</h2>
            <p className="mt-2">
              EchoCal (&quot;we&quot;, &quot;the app&quot;) is a free personal tool that one-way mirrors selected Google
              calendars onto a dedicated target calendar you control. Production site:{" "}
              <a className="text-mint-400 hover:underline" href="https://calagg.vercel.app">
                https://calagg.vercel.app
              </a>
              . This policy describes what we collect, how we use it, and your controls. EchoCal uses
              Google APIs and complies with the{" "}
              <a
                className="text-mint-400 hover:underline"
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">What data we collect</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-mist-100">Google profile / email</strong> — used to identify
                your EchoCal user and linked Google accounts (main and secondary).
              </li>
              <li>
                <strong className="text-mist-100">OAuth tokens</strong> — access and refresh tokens
                needed to call Google Calendar APIs. Refresh tokens are encrypted at rest with
                AES-256-GCM before storage.
              </li>
              <li>
                <strong className="text-mist-100">Calendar event data</strong> — only what is needed
                to mirror events according to your privacy mode (full, title, or busy): titles,
                times, descriptions, attendees/visibility fields as applicable, and identifiers used
                for mapping updates and deletes.
              </li>
              <li>
                <strong className="text-mist-100">App records</strong> — SyncRoute configuration
                (source/target calendars, privacy mode, filters, prefixes), EventMap mappings
                between source and mirrored events, and SyncJob status/error metadata for sync runs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">How we use data</h2>
            <p className="mt-2">
              Data is used solely to provide one-way calendar aggregation: read selected source
              calendars and write mirrored events to your dedicated target calendar (never Primary),
              with provenance via title prefix, description tags, and{" "}
              <code className="text-mint-300">calagg_*</code> extendedProperties. We do not use
              Google user data for advertising, do not sell it, and do not transfer it to third
              parties except as needed to operate the service (hosting and database providers below)
              or as required by law.
            </p>
            <p className="mt-2">
              EchoCal does not use Google user data for AI/ML model training unrelated to providing
              or improving the user-facing sync features you configure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Google API Limited Use</h2>
            <p className="mt-2">
              EchoCal&apos;s use of information received from Google APIs adheres to the Google API
              Services User Data Policy, including the Limited Use requirements. Calendar data is
              used only to provide and improve the user-facing sync features of EchoCal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Third parties</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-mist-100">Google</strong> — authentication and Calendar API
                access per your OAuth grants.
              </li>
              <li>
                <strong className="text-mist-100">Vercel</strong> — application hosting for{" "}
                <a className="text-mint-400 hover:underline" href="https://calagg.vercel.app">
                  calagg.vercel.app
                </a>
                .
              </li>
              <li>
                <strong className="text-mist-100">Neon</strong> — Postgres database for user,
                account, route, EventMap, and SyncJob records (encrypted tokens included).
              </li>
            </ul>
            <p className="mt-2">
              These providers process data as needed to run the app. We do not sell personal data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Retention</h2>
            <p className="mt-2">
              We retain account and sync configuration data while your EchoCal account is active.
              Mirrored events live on your Google target calendar under your control. When you
              disconnect an account or delete routes, we remove related EventMaps and attempt to
              delete corresponding mirrored events on the target. SyncJob logs may be retained
              briefly for debugging and then discarded. You may request deletion of your EchoCal
              account data by contacting us (below).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">User controls</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Disconnect linked Google accounts in Settings (wipes maps and mirrored events for that account).</li>
              <li>Delete or pause SyncRoutes; change privacy modes and filters.</li>
              <li>
                Revoke EchoCal access at any time in your{" "}
                <a
                  className="text-mint-400 hover:underline"
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Account permissions
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Children</h2>
            <p className="mt-2">
              EchoCal is not directed to children under 13, and we do not knowingly collect personal
              information from children.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Changes</h2>
            <p className="mt-2">
              We may update this policy from time to time. The effective date at the top will
              change when we do. Continued use of the service after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Contact</h2>
            <p className="mt-2">
              EchoCal support — open an issue at{" "}
              <a
                className="text-mint-400 hover:underline"
                href="https://github.com/RoyGrosz/calagg"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/RoyGrosz/calagg
              </a>{" "}
              or email the Google Cloud project support email. Contact: the email listed on the
              Google OAuth consent screen, or{" "}
              <a className="text-mint-400 hover:underline" href="mailto:roysbots@gmail.com">
                roysbots@gmail.com
              </a>
              . Homepage:{" "}
              <a className="text-mint-400 hover:underline" href="https://calagg.vercel.app">
                https://calagg.vercel.app
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm text-mist-500">
          <Link href="/" className="text-mint-400 hover:underline">
            ← Home
          </Link>
          {" · "}
          <Link href="/terms" className="text-mint-400 hover:underline">
            Terms
          </Link>
          {" · "}
          <Link href="/security" className="text-mint-400 hover:underline">
            Security
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
