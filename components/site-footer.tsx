export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-gold" aria-hidden />
          <span className="font-display text-sm font-bold tracking-tight">
            HH GOA <span className="text-primary">2026</span>
          </span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Built for the Hacker House · tag your frame{" "}
          <span className="font-semibold text-gold">#FrameInGoa</span>
        </p>
      </div>
    </footer>
  )
}
