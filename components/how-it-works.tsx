"use client"

import { motion } from "motion/react"
import { Upload, Wand2, Share2 } from "lucide-react"

const STEPS = [
  {
    icon: Upload,
    title: "Upload",
    body: "Any photo — portrait, landscape, off-center. Even iPhone HEIC. No cropping needed first.",
  },
  {
    icon: Wand2,
    title: "Generate",
    body: "Pick a PFP frame or Builder Pass. Nudge the crop and it renders live, instantly.",
  },
  {
    icon: Share2,
    title: "Share",
    body: "Download a real PNG or hit Share to X with the #FrameInGoa caption already written.",
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="relative rounded-2xl border border-border bg-card/50 p-6"
          >
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <s.icon className="size-5" aria-hidden />
            </div>
            <h3 className="font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
              {s.body}
            </p>
            <span className="absolute right-5 top-5 font-display text-sm font-bold text-muted-foreground/40">
              0{i + 1}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
