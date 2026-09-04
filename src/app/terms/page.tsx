import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using CalAgg, a free as-is Google Calendar aggregator.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-mint-400">Legal</p>
        <h1 className="mt-2 font-display text-4xl text-mist-100">Terms of Service</h1>
        <p className="mt-2 text-sm text-mist-500">Effective date: September 4, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-mist-300">
          <section>
            <h2 className="font-display text-xl text-mist-100">The service</h2>
            <p className="mt-2">
              CalAgg is a free personal tool that one-way mirrors selected Google calendars onto a
              dedicated target calendar. Production:{" "}
              <a className="text-mint-400 hover:underline" href="https://calagg.vercel.app">
                https://calagg.vercel.app
              </a>
              . By using CalAgg you agree to these terms and our{" "}
              <Link href="/privacy" className="text-mint-400 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">As-is, free tool</h2>
            <p className="mt-2">
              CalAgg is provided free of charge, &quot;as is&quot; and &quot;as available,&quot; without warranties of
              any kind, express or implied, including fitness for a particular purpose or
              uninterrupted availability. Sync may lag, fail, or omit events. You are responsible
              for verifying important calendar data in Google Calendar itself.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Your responsibilities</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Use CalAgg only with Google accounts you are authorized to access.</li>
              <li>Configure privacy modes appropriately for sensitive calendars.</li>
              <li>Do not abuse the service, attempt unauthorized access, or disrupt others.</li>
              <li>Comply with Google&apos;s terms and applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Limitation of liability</h2>
            <p className="mt-2">
              To the fullest extent permitted by law, the operator of CalAgg is not liable for any
              indirect, incidental, special, consequential, or punitive damages, or any loss of
              data, calendars, or business, arising from your use of the service. Aggregate
              liability for any claim related to CalAgg shall not exceed zero dollars, as the
              service is free.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Changes and termination</h2>
            <p className="mt-2">
              We may change or discontinue CalAgg at any time. We may update these terms; the
              effective date will change when we do. You may stop using the service and revoke
              Google access at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-mist-100">Contact</h2>
            <p className="mt-2">
              CalAgg support — open an issue at{" "}
              <a
                className="text-mint-400 hover:underline"
                href="https://github.com/RoyGrosz/calagg"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/RoyGrosz/calagg
              </a>{" "}
              or email{" "}
              <a className="text-mint-400 hover:underline" href="mailto:roysbots@gmail.com">
                roysbots@gmail.com
              </a>
              . Contact: the email listed on the Google OAuth consent screen.
            </p>
          </section>
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
          <Link href="/security" className="text-mint-400 hover:underline">
            Security
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
