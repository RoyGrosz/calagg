"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Status" },
  { href: "/routes", label: "Routes" },
  { href: "/onboarding", label: "Setup" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();
  const { data } = useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-ink-600/80 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg tracking-tight">CalAgg</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  active ? "bg-ink-700 text-mist-100" : "text-mist-500 hover:text-mist-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-sm text-mist-500">
          <span className="hidden sm:inline">{data?.user?.email}</span>
          <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
