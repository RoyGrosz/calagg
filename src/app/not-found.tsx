import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-16 text-center"
      >
        <Logo className="h-12 w-12" />
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-mint-400">404</p>
        <h1 className="mt-2 font-display text-3xl text-mist-100 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mist-500">
          That link doesn't match anything on EchoCal. Head home or sign in to open the app.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/login" className="btn-ghost">
            Continue with Google
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
