import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OpenAppCta } from "@/components/OpenAppCta";
import { FadeIn } from "@/components/FadeIn";
import { HeroMock } from "@/components/HeroMock";
import { PrimaryCta } from "@/components/PrimaryCta";
import { benefits, steps, faqs } from "@/lib/landing-copy";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-mint-400/30 bg-mint-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-mint-300">
              Free · personal
            </div>
            <h1 className="font-display text-4xl leading-[1.1] text-mist-100 sm:text-5xl">
              See every Google Calendar in one place.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-mist-500 sm:text-lg">
              Mirror work and personal calendars onto a dedicated target — one-way,
              with clear provenance. Native Google Calendar is enough; no extension.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3">
              <PrimaryCta />
              <p className="text-sm text-mist-500">
                Open source · MIT · No extension · Sync about every 5 minutes
              </p>
              <p className="text-sm text-mist-500">
                <Link href="/security" className="text-mist-300 underline-offset-2 hover:text-mint-400 hover:underline">
                  How we keep it safe
                </Link>
              </p>
              <OpenAppCta />
            </div>
          </div>
          <HeroMock />
        </section>

        <FadeIn className="mt-24 sm:mt-28">
          <p className="mx-auto max-w-3xl text-center font-display text-3xl leading-snug text-mist-100 sm:text-4xl sm:leading-snug">
            Stop tab-hopping between accounts.
            <br className="hidden sm:block" />{" "}
            <span className="text-mist-300">One calendar. Every commitment.</span>
          </p>
        </FadeIn>

        <FadeIn className="mt-20">
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <h2 className="font-display text-xl text-mist-100">The problem</h2>
              <p className="mt-3 text-sm leading-relaxed text-mist-500">
                Work lives in one Google account, life in another. Double-booking
                happens because nothing shows the full picture unless you keep flipping
                calendars — or pasting events by hand.
              </p>
            </div>
            <div className="card border-mint-400/20 p-6">
              <h2 className="font-display text-xl text-mist-100">The solution</h2>
              <p className="mt-3 text-sm leading-relaxed text-mist-500">
                CalAgg mirrors selected calendars one-way onto a dedicated target.
                You keep using Google Calendar; events arrive with source labels and
                the privacy level you chose.
              </p>
            </div>
          </section>
        </FadeIn>

        <FadeIn className="mt-20">
          <section id="features">
            <h2 className="font-display text-2xl text-mist-100 sm:text-3xl">What you get</h2>
            <p className="mt-2 max-w-2xl text-sm text-mist-500 sm:text-base">
              Outcomes that matter day to day — not a feature checklist.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b, i) => (
                <FadeIn key={b.title} delayMs={i * 60}>
                  <div className="card h-full p-5">
                    <h3 className="font-medium text-mist-100">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist-500">{b.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn className="mt-20">
          <section>
            <h2 className="font-display text-2xl text-mist-100 sm:text-3xl">How it works</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="card p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-mint-400">Step {s.n}</div>
                  <h3 className="mt-2 font-medium text-mist-100">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-500">{s.body}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn className="mt-20">
          <section id="faq">
            <h2 className="font-display text-2xl text-mist-100 sm:text-3xl">FAQ</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((item) => (
                <details key={item.q} className="card group open:border-mint-400/25">
                  <summary className="cursor-pointer list-none px-5 py-4 font-medium text-mist-100 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-4">
                      <span>{item.q}</span>
                      <span className="mt-0.5 shrink-0 text-mist-500 transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="border-t border-ink-600/80 px-5 py-4 text-sm leading-relaxed text-mist-500">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn className="mt-20 mb-8">
          <section className="card px-6 py-10 text-center sm:px-10">
            <h2 className="font-display text-2xl text-mist-100 sm:text-3xl">
              Ready for one calendar view?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-mist-500 sm:text-base">
              Connect Google, pick a dedicated target, and start mirroring — free, no card.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <PrimaryCta />
              <p className="text-sm text-mist-500">
                Open source · MIT · No extension · Sync about every 5 minutes
              </p>
            </div>
          </section>
        </FadeIn>
      </main>
      <SiteFooter />
    </div>
  );
}
