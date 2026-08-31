export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="1" y="4" width="20" height="20" rx="5" fill="#1e2630" stroke="#5ee0b5" strokeWidth="1.5" />
      <rect x="11" y="8" width="20" height="20" rx="5" fill="#0b0d10" stroke="#7ab8ff" strokeWidth="1.5" />
      <path d="M16 14h10M16 19h7" stroke="#5ee0b5" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
