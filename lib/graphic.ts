export type Format = "pfp" | "card"

export interface Sticker {
  id: string
  type: "emoji" | "text"
  value: string
  x: number // 0..1 relative to canvas width
  y: number // 0..1 relative to canvas height
  scale: number // 0.2..3
  rotation: number // -180..180 degrees
}

export interface RenderOptions {
  format: Format
  image: HTMLImageElement | null
  name: string
  role: string
  title: string
  /** focus point of the photo, 0..1 */
  focusX: number
  focusY: number
  /** zoom multiplier, 1..2.5 */
  zoom: number
  bgColor?: string
  stickers?: Sticker[]
  selectedStickerId?: string | null
  qrImage?: HTMLImageElement | null
}

export const PFP_SIZE = 1080
export const CARD_W = 1080
export const CARD_H = 1350

/* ---------- palette (hex mirrors of the CSS tokens) ---------- */
const PLUM = "#1c1029"
const PLUM_DEEP = "#140a1e"
const CORAL = "#ff6a4d"
const MAGENTA = "#ff4d9d"
const GOLD = "#ffcf6a"
const CREAM = "#fbeee2"

/* ---------- small canvas helpers ---------- */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  focusX: number,
  focusY: number,
  zoom: number,
) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const scale = Math.max(dw / iw, dh / ih) * zoom
  const sw = dw / scale
  const sh = dh / scale
  // clamp focus so we never sample outside the image
  const maxSx = iw - sw
  const maxSy = ih - sh
  const sx = Math.min(Math.max((iw - sw) * focusX, 0), Math.max(maxSx, 0))
  const sy = Math.min(Math.max((ih - sh) * focusY, 0), Math.max(maxSy, 0))
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function sunsetGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, GOLD)
  g.addColorStop(0.5, CORAL)
  g.addColorStop(1, MAGENTA)
  return g
}

/** subtle sun-into-horizon glow used across both formats */
function drawSunGlow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  g.addColorStop(0, "rgba(255,207,106,0.9)")
  g.addColorStop(0.35, "rgba(255,106,77,0.55)")
  g.addColorStop(1, "rgba(255,77,157,0)")
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
}

function placeholderPhoto(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, "#3a2440")
  g.addColorStop(1, "#241531")
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = "rgba(251,238,226,0.5)"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `600 ${Math.round(w * 0.045)}px 'Inter', ui-sans-serif, sans-serif`
  ctx.fillText("YOUR PHOTO HERE", x + w / 2, y + h / 2)
}

/* ---------- builder-title generator ---------- */
const TITLE_ADJ = [
  "Midnight",
  "Sunset",
  "Coastal",
  "Caffeinated",
  "Zero-Bug",
  "Ship-Fast",
  "Late-Night",
  "Feral",
  "Turbo",
  "Susegad",
]
const TITLE_NOUN = [
  "Shipper",
  "Architect",
  "Hacker",
  "Wizard",
  "Prototyper",
  "Operator",
  "Tinkerer",
  "Maximalist",
  "Builder",
  "Renegade",
]

export function generateTitle(seed?: string): string {
  const base = (seed && seed.length ? seed : Math.random().toString()) as string
  let h = 0
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0
  const adj = TITLE_ADJ[h % TITLE_ADJ.length]
  const noun = TITLE_NOUN[(h >> 5) % TITLE_NOUN.length]
  return `${adj} ${noun}`
}

/* ---------- brand chip (top-left lockup) ---------- */
function drawBrandLockup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
) {
  const dot = 26 * scale
  drawSunGlow(ctx, x + dot / 2, y + dot / 2, dot * 1.6)
  ctx.fillStyle = GOLD
  ctx.beginPath()
  ctx.arc(x + dot / 2, y + dot / 2, dot / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.textAlign = "left"
  ctx.textBaseline = "middle"
  ctx.fillStyle = CREAM
  ctx.font = `700 ${34 * scale}px 'Space Grotesk', ui-sans-serif, sans-serif`
  const tx = x + dot + 16 * scale
  ctx.fillText("HH GOA", tx, y + dot / 2 - 1)
  const w = ctx.measureText("HH GOA").width
  ctx.fillStyle = CORAL
  ctx.font = `700 ${34 * scale}px 'Space Grotesk', ui-sans-serif, sans-serif`
  ctx.fillText(" 2026", tx + w, y + dot / 2 - 1)
}

function drawStickers(
  ctx: CanvasRenderingContext2D,
  stickers: Sticker[] | undefined,
  w: number,
  h: number,
  selectedStickerId?: string | null,
) {
  if (!stickers) return
  stickers.forEach((s) => {
    ctx.save()
    const cx = s.x * w
    const cy = s.y * h
    ctx.translate(cx, cy)
    ctx.rotate((s.rotation * Math.PI) / 180)
    const size = 64 * s.scale
    const isSelected = selectedStickerId === s.id

    if (s.type === "emoji") {
      ctx.font = `${Math.round(size)}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(s.value, 0, 0)

      if (isSelected) {
        // Selection outline
        ctx.strokeStyle = "#ff4d9d"
        ctx.lineWidth = 3
        ctx.setLineDash([4, 4])
        ctx.strokeRect(-size / 2 - 8, -size / 2 - 8, size + 16, size + 16)
      }
    } else if (s.type === "text") {
      const txt = s.value.toUpperCase()
      ctx.font = "900 24px 'Space Grotesk', sans-serif"
      const tw = ctx.measureText(txt).width
      const th = 24
      const padX = 16
      const padY = 8
      const boxW = (tw + padX * 2) * s.scale
      const boxH = (th + padY * 2) * s.scale
      
      // Sticker outline
      ctx.fillStyle = "#ffffff"
      roundRect(ctx, -boxW / 2 - 4, -boxH / 2 - 4, boxW + 8, boxH + 8, 6)
      ctx.fill()

      // Black background
      ctx.fillStyle = "#000000"
      roundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 4)
      ctx.fill()

      // Border (yellow if selected, pink if not)
      ctx.strokeStyle = isSelected ? "#fbe116" : "#ff4d9d"
      ctx.lineWidth = 3
      roundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 4)
      ctx.stroke()

      // Text
      ctx.fillStyle = "#fcf9f2"
      ctx.font = `900 ${Math.round(24 * s.scale)}px 'Space Grotesk', sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(txt, 0, 0)

      if (isSelected) {
        // Selection outline
        ctx.strokeStyle = "#fbe116"
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.strokeRect(-boxW / 2 - 10, -boxH / 2 - 10, boxW + 20, boxH + 20)
      }
    }
    ctx.restore()
  })
}

/* =========================================================
   PFP FRAME  (1080 x 1080)
   ========================================================= */
function renderPFP(ctx: CanvasRenderingContext2D, o: RenderOptions) {
  const S = PFP_SIZE

  // select gradient based on bgColor option
  const bg = ctx.createLinearGradient(0, 0, 0, S)
  const themeKey = o.bgColor || "plum"
  if (themeKey === "peach") {
    bg.addColorStop(0, "#ffecd2")
    bg.addColorStop(1, "#fcb69f")
  } else if (themeKey === "mint") {
    bg.addColorStop(0, "#70ffd0")
    bg.addColorStop(1, "#10b981")
  } else if (themeKey === "sky") {
    bg.addColorStop(0, "#00f0ff")
    bg.addColorStop(1, "#0072ff")
  } else if (themeKey === "lavender") {
    bg.addColorStop(0, "#fbc2eb")
    bg.addColorStop(1, "#a6c1ee")
  } else if (themeKey === "coral") {
    bg.addColorStop(0, "#ff5e62")
    bg.addColorStop(1, "#ff9966")
  } else if (themeKey === "sunshine") {
    bg.addColorStop(0, "#fff275")
    bg.addColorStop(1, "#ffe79a")
  } else if (themeKey === "cherry") {
    bg.addColorStop(0, "#ff9a9e")
    bg.addColorStop(1, "#fecfef")
  } else if (themeKey === "cyber") {
    bg.addColorStop(0, "#f107a3")
    bg.addColorStop(1, "#7b2ff7")
  } else if (themeKey === "hologram") {
    bg.addColorStop(0, "#8ec5fc")
    bg.addColorStop(1, "#e0c3fc")
  } else if (themeKey === "lime") {
    bg.addColorStop(0, "#a8ff78")
    bg.addColorStop(1, "#78ffd6")
  } else if (themeKey === "gold") {
    bg.addColorStop(0, "#f6d365")
    bg.addColorStop(1, "#fda085")
  } else {
    // Default Sunset Plum
    bg.addColorStop(0, PLUM)
    bg.addColorStop(1, PLUM_DEEP)
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, S, S)

  const pad = 46
  const inner = S - pad * 2

  // photo (clipped to rounded square)
  ctx.save()
  roundRect(ctx, pad, pad, inner, inner, 60)
  ctx.clip()
  if (o.image) {
    drawImageCover(ctx, o.image, pad, pad, inner, inner, o.focusX, o.focusY, o.zoom)
  } else {
    placeholderPhoto(ctx, pad, pad, inner, inner)
  }
  // bottom scrim for text legibility
  const scrim = ctx.createLinearGradient(0, S - 360, 0, S)
  scrim.addColorStop(0, "rgba(20,10,30,0)")
  scrim.addColorStop(1, "rgba(20,10,30,0.92)")
  ctx.fillStyle = scrim
  ctx.fillRect(pad, S - 360, inner, 360 - pad)
  ctx.restore()

  // gradient frame ring
  ctx.lineWidth = 20
  ctx.strokeStyle = sunsetGradient(ctx, pad, pad, S - pad, S - pad)
  roundRect(ctx, pad + 10, pad + 10, inner - 20, inner - 20, 52)
  ctx.stroke()

  // brand lockup top-left
  drawBrandLockup(ctx, pad + 44, pad + 46, 1)

  // top-right pill
  ctx.font = `700 26px 'Space Grotesk', ui-sans-serif, sans-serif`
  const pillTxt = "BUILDER"
  const pw = ctx.measureText(pillTxt).width + 44
  const px = S - pad - 44 - pw
  const py = pad + 40
  ctx.fillStyle = "rgba(255,106,77,0.16)"
  roundRect(ctx, px, py, pw, 52, 26)
  ctx.fill()
  ctx.strokeStyle = "rgba(255,106,77,0.6)"
  ctx.lineWidth = 2
  roundRect(ctx, px, py, pw, 52, 26)
  ctx.stroke()
  ctx.fillStyle = CORAL
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(pillTxt, px + pw / 2, py + 27)

  // bottom hashtag
  ctx.textAlign = "left"
  ctx.textBaseline = "alphabetic"
  ctx.font = `700 72px 'Space Grotesk', ui-sans-serif, sans-serif`
  ctx.fillStyle = sunsetGradient(ctx, pad + 60, S - 150, S - pad, S - 90)
  ctx.fillText("#FrameInGoa", pad + 60, S - 100)

  ctx.font = `500 30px 'Inter', ui-sans-serif, sans-serif`
  ctx.fillStyle = "rgba(251,238,226,0.72)"
  ctx.fillText("Hacker House · Goa · 2026", pad + 62, S - 62)

  // Draw QR code
  if (o.qrImage) {
    const qrSize = 110
    const qrX = S - pad - 50 - qrSize
    const qrY = S - pad - 50 - qrSize

    ctx.save()
    ctx.fillStyle = "white"
    roundRect(ctx, qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 10)
    ctx.fill()
    ctx.drawImage(o.qrImage, qrX, qrY, qrSize, qrSize)

    // Label above QR
    ctx.textAlign = "center"
    ctx.font = `700 12px 'Space Grotesk', ui-sans-serif, sans-serif`
    ctx.fillStyle = "rgba(251,238,226,0.5)"
    ctx.fillText("SCAN TO CREATE", qrX + qrSize / 2, qrY - 14)
    ctx.restore()
  }

  // Draw stickers on top
  drawStickers(ctx, o.stickers, S, S, o.selectedStickerId)
}

/* =========================================================
   BUILDER PASS CARD  (1080 x 1350)
   ========================================================= */
function renderCard(ctx: CanvasRenderingContext2D, o: RenderOptions) {
  const W = CARD_W
  const H = CARD_H

  // background wash based on selected bgColor preset
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  const themeKey = o.bgColor || "plum"
  if (themeKey === "peach") {
    bg.addColorStop(0, "#ffecd2")
    bg.addColorStop(0.55, "#fdbb9b")
    bg.addColorStop(1, "#fcb69f")
  } else if (themeKey === "mint") {
    bg.addColorStop(0, "#70ffd0")
    bg.addColorStop(0.55, "#34d399")
    bg.addColorStop(1, "#10b981")
  } else if (themeKey === "sky") {
    bg.addColorStop(0, "#00f0ff")
    bg.addColorStop(0.55, "#38bdf8")
    bg.addColorStop(1, "#0072ff")
  } else if (themeKey === "lavender") {
    bg.addColorStop(0, "#fbc2eb")
    bg.addColorStop(0.55, "#c3bef7")
    bg.addColorStop(1, "#a6c1ee")
  } else if (themeKey === "coral") {
    bg.addColorStop(0, "#ff5e62")
    bg.addColorStop(0.55, "#ff7c64")
    bg.addColorStop(1, "#ff9966")
  } else if (themeKey === "sunshine") {
    bg.addColorStop(0, "#fff275")
    bg.addColorStop(0.55, "#ffeb8a")
    bg.addColorStop(1, "#ffe79a")
  } else if (themeKey === "cherry") {
    bg.addColorStop(0, "#ff9a9e")
    bg.addColorStop(0.55, "#fecae6")
    bg.addColorStop(1, "#fecfef")
  } else if (themeKey === "cyber") {
    bg.addColorStop(0, "#f107a3")
    bg.addColorStop(0.55, "#b61cf1")
    bg.addColorStop(1, "#7b2ff7")
  } else if (themeKey === "hologram") {
    bg.addColorStop(0, "#8ec5fc")
    bg.addColorStop(0.55, "#b6beff")
    bg.addColorStop(1, "#e0c3fc")
  } else if (themeKey === "lime") {
    bg.addColorStop(0, "#a8ff78")
    bg.addColorStop(0.55, "#90ffd7")
    bg.addColorStop(1, "#78ffd6")
  } else if (themeKey === "gold") {
    bg.addColorStop(0, "#f6d365")
    bg.addColorStop(0.55, "#faae75")
    bg.addColorStop(1, "#fda085")
  } else {
    // Default Sunset Plum
    bg.addColorStop(0, PLUM)
    bg.addColorStop(0.55, PLUM_DEEP)
    bg.addColorStop(1, "#2a0f24")
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // ambient sun glow behind header
  drawSunGlow(ctx, W - 150, 120, 520)
  drawSunGlow(ctx, 120, H - 120, 420)

  const pad = 70

  // outer keyline
  ctx.strokeStyle = "rgba(255,106,77,0.35)"
  ctx.lineWidth = 2
  roundRect(ctx, 24, 24, W - 48, H - 48, 44)
  ctx.stroke()

  // header
  drawBrandLockup(ctx, pad, pad, 1.15)

  ctx.textAlign = "right"
  ctx.textBaseline = "top"
  ctx.font = `700 26px 'Space Grotesk', ui-sans-serif, sans-serif`
  ctx.fillStyle = GOLD
  ctx.fillText("BUILDER PASS", W - pad, pad + 6)
  ctx.font = `500 22px 'Inter', ui-sans-serif, sans-serif`
  ctx.fillStyle = "rgba(251,238,226,0.6)"
  ctx.fillText("NO. 2026", W - pad, pad + 40)

  // photo
  const photoY = pad + 110
  const photoW = W - pad * 2
  const photoH = 620
  ctx.save()
  roundRect(ctx, pad, photoY, photoW, photoH, 34)
  ctx.clip()
  if (o.image) {
    drawImageCover(ctx, o.image, pad, photoY, photoW, photoH, o.focusX, o.focusY, o.zoom)
  } else {
    placeholderPhoto(ctx, pad, photoY, photoW, photoH)
  }
  ctx.restore()
  // photo frame stroke
  ctx.lineWidth = 5
  ctx.strokeStyle = sunsetGradient(ctx, pad, photoY, W - pad, photoY + photoH)
  roundRect(ctx, pad, photoY, photoW, photoH, 34)
  ctx.stroke()

  // name
  const infoY = photoY + photoH + 66
  ctx.textAlign = "left"
  ctx.textBaseline = "alphabetic"
  const name = (o.name || "Your Name").slice(0, 22)
  ctx.fillStyle = CREAM
  ctx.font = `700 82px 'Space Grotesk', ui-sans-serif, sans-serif`
  ctx.fillText(name, pad, infoY)

  // role
  ctx.font = `500 34px 'Inter', ui-sans-serif, sans-serif`
  ctx.fillStyle = "rgba(251,238,226,0.72)"
  ctx.fillText((o.role || "Builder / Maker").slice(0, 34), pad, infoY + 52)

  // builder title chip
  const title = o.title || generateTitle(o.name)
  ctx.font = `700 34px 'Space Grotesk', ui-sans-serif, sans-serif`
  const chipTxt = title.toUpperCase()
  const cw = ctx.measureText(chipTxt).width + 56
  const chipY = infoY + 96
  const chipGrad = sunsetGradient(ctx, pad, chipY, pad + cw, chipY + 66)
  ctx.fillStyle = chipGrad
  roundRect(ctx, pad, chipY, cw, 66, 33)
  ctx.fill()
  ctx.fillStyle = PLUM_DEEP
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"
  ctx.fillText(chipTxt, pad + 28, chipY + 35)

  // Draw QR Code
  if (o.qrImage) {
    const qrSize = 150
    const qrX = W - pad - qrSize
    const qrY = infoY - 40

    ctx.save()
    ctx.fillStyle = "white"
    roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12)
    ctx.fill()
    ctx.drawImage(o.qrImage, qrX, qrY, qrSize, qrSize)

    // Label underneath
    ctx.textAlign = "center"
    ctx.font = `700 13px 'Space Grotesk', ui-sans-serif, sans-serif`
    ctx.fillStyle = "rgba(251,238,226,0.48)"
    ctx.fillText("SCAN TO CREATE", qrX + qrSize / 2, qrY + qrSize + 30)
    ctx.restore()
  }

  // footer perforation + hashtag
  ctx.strokeStyle = "rgba(251,238,226,0.16)"
  ctx.lineWidth = 2
  ctx.setLineDash([6, 12])
  ctx.beginPath()
  ctx.moveTo(pad, H - 118)
  ctx.lineTo(W - pad, H - 118)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.textAlign = "left"
  ctx.textBaseline = "middle"
  ctx.font = `700 40px 'Space Grotesk', ui-sans-serif, sans-serif`
  ctx.fillStyle = sunsetGradient(ctx, pad, H - 80, pad + 340, H - 60)
  ctx.fillText("#FrameInGoa", pad, H - 74)

  ctx.textAlign = "right"
  ctx.font = `500 26px 'Inter', ui-sans-serif, sans-serif`
  ctx.fillStyle = "rgba(251,238,226,0.6)"
  ctx.fillText("hackerhouse.goa", W - pad, H - 74)

  // Draw stickers on top
  drawStickers(ctx, o.stickers, W, H, o.selectedStickerId)
}

/* ---------- public entry ---------- */
export function renderGraphic(canvas: HTMLCanvasElement, o: RenderOptions) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  if (o.format === "pfp") {
    canvas.width = PFP_SIZE
    canvas.height = PFP_SIZE
    renderPFP(ctx, o)
  } else {
    canvas.width = CARD_W
    canvas.height = CARD_H
    renderCard(ctx, o)
  }
}
