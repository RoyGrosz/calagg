"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function OpenAppCta() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return (
    <p className="mt-4 text-center text-sm text-mist-500">
      Already signed in?{" "}
      <Link href="/app" className="text-mint-400 hover:underline">
        Open app
      </Link>
    </p>
  );
}
