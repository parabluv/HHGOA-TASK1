import { SmoothScroll } from "@/components/smooth-scroll"
import { Hero } from "@/components/hero"
import { MarqueeBand } from "@/components/marquee-band"
import { Generator } from "@/components/generator"
import { HowItWorks } from "@/components/how-it-works"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <SmoothScroll />
      <Hero />
      <MarqueeBand />
      <Generator />
      <HowItWorks />
      <SiteFooter />
    </main>
  )
}
