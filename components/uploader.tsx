"use client"

import { useCallback, useRef, useState } from "react"
import { ImageUp, Loader2 } from "lucide-react"

interface UploaderProps {
  onFile: (file: File) => void
  processing: boolean
  processingText?: string
  compact?: boolean
}

export function Uploader({ onFile, processing, processingText, compact }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file) onFile(file)
    },
    [onFile],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a photo"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={[
        "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed text-center transition-all duration-300 backdrop-blur-md",
        compact ? "px-4 py-6" : "px-6 py-12",
        drag
          ? "border-primary bg-primary/10 scale-[1.01] shadow-[0_0_20px_rgba(var(--primary),0.2)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] shadow-sm",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-110">
        {processing ? (
          <Loader2 className="size-6 animate-spin" aria-hidden />
        ) : (
          <ImageUp className="size-6" aria-hidden />
        )}
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">
          {processing ? (processingText || "Decoding photo…") : compact ? "Replace photo" : "Drop your photo"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          JPG, PNG or iPhone HEIC · tap to browse
        </p>
      </div>
    </div>
  )
}
