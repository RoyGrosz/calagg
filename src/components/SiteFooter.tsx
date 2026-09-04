import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink-600/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-mist-500 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md space-y-2">
          <p className="font-display text-mist-300">EchoCal</p>
          <p>
            Free personal one-way Google Calendar aggregator. Homepage:{" "}
            <a className="text-mint-400 hover:underline" href="https://calagg.vercel.app">
              calagg.vercel.app
            </a>
            .
          </p>
          <p>
            EchoCal support — open an issue at{" "}
            <a
              className="text-mint-400 hover:underline"
              href="https://github.com/RoyGrosz/calagg"
              target="_blank"
              rel="noreferrer"
            >
              github.com/RoyGrosz/calagg
            </a>{" "}
            or email the Google Cloud project support email. Contact:{" "}
            <a className="text-mint-400 hover:underline" href="mailto:roysbots@gmail.com">
              roysbots@gmail.com
            </a>{" "}
            (also the email listed on the Google OAuth consent screen).
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/privacy" className="hover:text-mist-100">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-mist-100">
            Terms
          </Link>
          <Link href="/security" className="hover:text-mist-100">
            Security
          </Link>
          <Link href="/login" className="hover:text-mist-100">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
