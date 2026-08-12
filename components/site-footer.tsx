import { Camera } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Camera className="size-4" />
          </div>
          <span className="font-display text-sm font-black tracking-tighter uppercase">
            FRAME<span className="text-gold">IT</span>
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
