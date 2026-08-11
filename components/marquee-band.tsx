const WORDS = [
  "#FrameInGoa",
  "SUNSET SESSIONS",
  "HACKER HOUSE",
  "SHIP IN GOA",
  "BUILDER PASS",
  "2026",
]

export function MarqueeBand() {
  const row = [...WORDS, ...WORDS]
  return (
    <div className="relative border-y border-border bg-secondary/30 py-4">
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap will-change-transform">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="font-display text-xl font-bold tracking-tight text-foreground/80 sm:text-2xl">
              {w}
            </span>
            <span className="size-2 rounded-full bg-primary" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  )
}
