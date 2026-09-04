import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OpenAppCta } from "@/components/OpenAppCta";
import { Logo } from "@/components/Logo";

const features = [
  {
    title: "Multi-account",
    body: "Connect a main Google account plus work or secondary accounts. Pick which calendars to mirror.",
  },
  {
    title: "One-way only",
    body: "Source → dedicated target. Never ping-pong. Primary is never written.",
  },
  {
    title: "Privacy modes",
    body: "full, title-only, or busy — control how much detail lands on the target.",
  },
  {
    title: "Provenance",
    body: "Title prefixes, description tags, and calagg_* extendedProperties so you always know the source.",
  },
  {
    title: "Native Calendar",
    body: "No extension. Use Google Calendar on web or phone — mirrored events are just events.",
  },
  {
    title: "Free personal tool",
    body: "Built for personal use. Poll sync about every 5 minutes. Tokens encrypted at rest.",
  },
];

const steps = [
  {
    n: "1",
    title: "Sign in with Google",
    body: "Your first account becomes the main (target) account.",
  },
  {
    n: "2",
    title: "Pick a dedicated target",
    body: "CalAgg creates or uses a calendar that is never Primary.",
  },
  {
    n: "3",
    title: "Mirror sources",
    body: "Link accounts, choose calendars, set privacy modes — sync runs on its own.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:py-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-mint-400/30 bg-mint-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-mint-300">
          Free
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <Logo className="h-10 w-10" />
              <span className="font-display text-2xl tracking-tight">CalAgg</span>
            </div>
            <h1 className="font-display text-4xl leading-tight text-mist-100 sm:text-5xl">
              One-way Google Calendar mirrors, with provenance.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-mist-500 sm:text-lg">
              Aggregate calendars from multiple Google accounts onto a dedicated target.
              Never ping-pong. Native Google Calendar is enough — no extension.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn-primary">
                Continue with Google
              </Link>
              <Link href="/security" className="btn-ghost">
                How we keep it safe
              </Link>
            </div>
            <OpenAppCta />
          </div>
          <div className="card max-w-sm p-5 text-sm text-mist-300">
            <p className="text-xs uppercase tracking-[0.2em] text-mint-400">At a glance</p>
            <ul className="mt-3 space-y-2">
              <li>Dedicated target calendar (never Primary)</li>
              <li>Privacy: full · title · busy</li>
              <li>Refresh tokens AES-256-GCM encrypted</li>
              <li>Poll sync ~5 min · calagg.vercel.app</li>
            </ul>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl text-mist-100">Features</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-5">
                <h3 className="font-medium text-mist-100">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-500">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl text-mist-100">How it works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="card p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-mint-400">Step {s.n}</div>
                <h3 className="mt-2 font-medium text-mist-100">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-500">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/login" className="btn-primary">
              Get started — Continue with Google
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
