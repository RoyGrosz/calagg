export function HeroMock() {
  return (
    <div className="card relative overflow-hidden p-4 sm:p-5" aria-hidden>
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mint-400/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-sky-400/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mint-400">
            From other calendars
          </p>
          <span className="rounded-full border border-ink-600 bg-ink-900/80 px-2 py-0.5 text-[10px] text-mist-500">
            ~5 min sync
          </span>
        </div>
        <div className="mt-4 space-y-2.5">
          <div className="rounded-xl border border-ink-600/80 bg-ink-900/70 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[11px] font-medium text-sky-400">
                Work
              </span>
              <span className="text-sm text-mist-100">Standup</span>
            </div>
            <p className="mt-1 text-xs text-mist-500">Tue · 9:30–9:45</p>
          </div>
          <div className="rounded-xl border border-ink-600/80 bg-ink-900/70 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-mint-400/15 px-1.5 py-0.5 text-[11px] font-medium text-mint-400">
                Personal
              </span>
              <span className="text-sm text-mist-100">Busy</span>
            </div>
            <p className="mt-1 text-xs text-mist-500">Tue · 12:00–13:00 · privacy: busy</p>
          </div>
          <div className="rounded-xl border border-dashed border-ink-600/80 bg-ink-900/40 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-mist-500/15 px-1.5 py-0.5 text-[11px] font-medium text-mist-300">
                Side
              </span>
              <span className="text-sm text-mist-300">Design review</span>
            </div>
            <p className="mt-1 text-xs text-mist-500">Wed · 15:00–16:00</p>
          </div>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-mist-500">
          Sample mirrored events on your dedicated target — never Primary.
        </p>
      </div>
    </div>
  );
}
