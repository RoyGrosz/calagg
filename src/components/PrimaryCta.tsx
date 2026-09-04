import Link from "next/link";

export function PrimaryCta({ className = "" }: { className?: string }) {
  return (
    <Link href="/login" className={`btn-primary ${className}`}>
      Continue with Google
    </Link>
  );
}
