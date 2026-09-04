import Link from "next/link";
import { Logo } from "./Logo";

export function MarketingHeader() {
  return (
    <header className="border-b border-ink-600/80 bg-ink-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg tracking-tight">EchoCal</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm" aria-label="Marketing">
          <Link
            href="/#features"
            className="rounded-lg px-3 py-1.5 text-mist-500 hover:text-mist-100"
          >
            Features
          </Link>
          <Link
            href="/#faq"
            className="hidden rounded-lg px-3 py-1.5 text-mist-500 hover:text-mist-100 sm:inline"
          >
            FAQ
          </Link>
          <Link
            href="/security"
            className="hidden rounded-lg px-3 py-1.5 text-mist-500 hover:text-mist-100 md:inline"
          >
            Security
          </Link>
          <Link href="/login" className="btn-primary ml-2 !px-3 !py-1.5 text-xs">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
