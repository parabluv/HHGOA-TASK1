"use client"

import { motion } from "motion/react"
import { ArrowDown, Zap } from "lucide-react"

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
}
const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Hero() {
  return (
    <header className="relative overflow-hidden">
      {/* ambient sunset glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[520px] rounded-full opacity-60 blur-3xl animate-float-slow"
        style={{
          background:
            "radial-gradient(circle, oklch(0.83 0.14 80 / 0.5), oklch(0.66 0.21 350 / 0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 left-[-10%] size-[440px] rounded-full opacity-50 blur-3xl animate-float-slow"
        style={{
          background:
            "radial-gradient(circle, oklch(0.7 0.2 28 / 0.45), oklch(0.66 0.21 350 / 0) 70%)",
        }}
      />

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-gold shadow-[0_0_20px_2px_oklch(0.83_0.14_80_/_0.6)]" />
          <span className="font-display text-lg font-bold tracking-tight">
            HH GOA <span className="text-primary">2026</span>
          </span>
        </div>
        <a
          href="#studio"
          className="rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/60 hover:bg-secondary"
        >
          Open Studio
        </a>
      </nav>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-10 text-center sm:pt-16"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary"
        >
          <Zap className="size-3.5" aria-hidden /> Upload → graphic in seconds
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-7xl"
        >
          Frame yourself for the{" "}
          <span className="sunset-text">Goa Hacker House</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty"
        >
          Drop any photo and instantly get a branded HH Goa 2026 profile frame or
          Builder Pass — ready to download and post to X with{" "}
          <span className="font-semibold text-foreground">#FrameInGoa</span>.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#studio"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          >
            Make mine
            <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
          </a>
          <span className="text-sm text-muted-foreground">
            No login · works on your phone
          </span>
        </motion.div>
      </motion.div>
    </header>
  )
}
