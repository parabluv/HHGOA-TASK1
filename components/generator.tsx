"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Shuffle, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Uploader } from "@/components/uploader";
import { renderGraphic, renderCombinedGraphic, generateTitle, type Format, type Sticker } from "@/lib/graphic";

function getBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "https://hhgoa2026.app";
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    return "https://hhgoa2026.app";
  }
  return window.location.origin;
}

function generateBuilderId(seed?: string) {
  const base = seed && seed.length ? seed : Math.random().toString();
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  const num = (h % 900) + 100; // 3-digit number [100, 999]
  return `HHGOA-BID-${num}`;
}

/* ensure the canvas fonts are actually available before drawing */
let fontsReady: Promise<void> | null = null;
function ensureFonts() {
  if (fontsReady) return fontsReady;
  fontsReady = (async () => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    try {
      await Promise.all([
        document.fonts.load('700 82px "Space Grotesk"'),
        document.fonts.load('500 34px "Space Grotesk"'),
        document.fonts.load('500 30px "Inter"'),
        document.fonts.load('600 30px "Inter"'),
      ]);
      await document.fonts.ready;
    } catch {
      /* fall back to system fonts */
    }
  })();
  return fontsReady;
}



async function resizeImage(file: File, maxW = 800, maxH = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let y = img.height;
        if (w > y) {
          if (w > maxW) {
            y = Math.round((y * maxW) / w);
            w = maxW;
          }
        } else {
          if (y > maxH) {
            w = Math.round((w * maxH) / y);
            y = maxH;
          }
        }
        canvas.width = w;
        canvas.height = y;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context is null"));
        ctx.drawImage(img, 0, 0, w, y);
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Failed to create blob"));
          },
          "image/jpeg",
          0.9
        );
      };
      img.onerror = () => reject(new Error("Image load error"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Reader error"));
    reader.readAsDataURL(file);
  });
}

async function preprocessImage(file: File): Promise<Blob> {
  let blob: Blob = file;
  const isHeic =
    /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    blob = Array.isArray(out) ? out[0] : (out as Blob);
  }
  const tempFile = new File([blob], "temp.jpg", { type: "image/jpeg" });
  return await resizeImage(tempFile);
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  let blob: Blob = file;
  const isHeic =
    /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });
    blob = Array.isArray(out) ? out[0] : (out as Blob);
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
}

const ROLES = [
  "Full-stack Dev",
  "Founder",
  "Designer",
  "AI Engineer",
  "Product",
  "Solo Hacker",
];

const BG_PRESETS = [
  { name: "Goa Beach Green", key: "goa-green", color: "bg-[#114030]" },
  { name: "Sunset Plum", key: "plum", color: "bg-[#1c1029]" },
  { name: "Peach Sun", key: "peach", color: "bg-gradient-to-tr from-[#fcb69f] to-[#ffecd2]" },
  { name: "Neon Mint", key: "mint", color: "bg-gradient-to-tr from-[#10b981] to-[#70ffd0]" },
  { name: "Electric Sky", key: "sky", color: "bg-gradient-to-tr from-[#0072ff] to-[#00f0ff]" },
  { name: "Dreamy Lavender", key: "lavender", color: "bg-gradient-to-tr from-[#a6c1ee] to-[#fbc2eb]" },
  { name: "Vibrant Coral", key: "coral", color: "bg-gradient-to-tr from-[#ff9966] to-[#ff5e62]" },
  { name: "Summer Sunshine", key: "sunshine", color: "bg-gradient-to-tr from-[#ffe79a] to-[#fff275]" },
  { name: "Cherry Blossom", key: "cherry", color: "bg-gradient-to-tr from-[#fecfef] to-[#ff9a9e]" },
  { name: "Cyber Neon", key: "cyber", color: "bg-gradient-to-tr from-[#7b2ff7] to-[#f107a3]" },
  { name: "Aura Hologram", key: "hologram", color: "bg-gradient-to-tr from-[#e0c3fc] to-[#8ec5fc]" },
  { name: "Lime Burst", key: "lime", color: "bg-gradient-to-tr from-[#78ffd6] to-[#a8ff78]" },
  { name: "Golden Hour", key: "gold", color: "bg-gradient-to-tr from-[#fda085] to-[#f6d365]" },
];

const BORDER_PRESETS = [
  { name: "Sunset Gradient", key: "sunset", color: "bg-gradient-to-tr from-[#ffcf6a] via-[#ff6a4d] to-[#ff4d9d]" },
  { name: "Neon Mint", key: "mint", color: "bg-[#10b981]" },
  { name: "Electric Sky", key: "sky", color: "bg-[#0072ff]" },
  { name: "Cyber Pink", key: "pink", color: "bg-[#ff4d9d]" },
  { name: "Vibrant Coral", key: "coral", color: "bg-[#ff6a4d]" },
  { name: "Golden Hour", key: "gold", color: "bg-[#ffcf6a]" },
  { name: "Goa Beach Green", key: "green", color: "bg-[#114030]" },
  { name: "Cream White", key: "white", color: "bg-[#ffffff]" },
];

const HACKER_EMOJIS = [
  "💻", "🚀", "🛠️", "🤖", "👾", "🧠", "⚡", "⌨️", 
  "🧪", "🔮", "☕", "🍕", "🎯", "🔑", "🛡️", "📈"
];

const GENZ_EMOJIS = [
  "💀", "😭", "💅", "🤡", "🧢", "🤫", "🧏", "🥺", 
  "🤝", "🐐", "👑", "💥", "🦄", "🦖", "🥑", "🦁"
];

const HACKER_PRESETS = [
  "SHIP IT", "LFG", "NO BUG", "HACK", "BUILD", 
  "PROD", "COFFEE", "COMPILING", "DEBUG", "0-BUG"
];

const GENZ_PRESETS = [
  "SLAY", "NO CAP", "GOAT", "RIZZ", "FR FR", 
  "ATE", "COOKING", "BRUH", "BIG W", "ERA"
];

const GOA_EMOJIS = [
  "🌴", "🏖️", "🏄", "🍹", "🍍", "🌊", "☀️", "🐬", 
  "🐟", "⚓", "🕶️", "🎸", "🥥", "🦀", "⛵", "🐚"
];

const GOA_PRESETS = [
  "GOA", "SUSEGAD", "BEACH", "SUNSET", "VIBES", 
  "PALMS", "HACK IN GOA", "COASTAL", "SHACK", "FROTH"
];

export function Generator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<Format>("pfp");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingText, setProcessingText] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState(() => generateTitle("goa"));

  const [focusX, setFocusX] = useState(0.5);
  const [focusY, setFocusY] = useState(0.4);
  const [zoom, setZoom] = useState(1);
  const [justDownloaded, setJustDownloaded] = useState(false);

  // New customization states
  const [bgColor, setBgColor] = useState("goa-green");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [qrImage, setQrImage] = useState<HTMLImageElement | null>(null);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [borderColor, setBorderColor] = useState("sunset");
  const [builderId, setBuilderId] = useState(() => generateBuilderId("goa"));

  const addEmojiSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Math.random().toString(),
      type: "emoji",
      value: emoji,
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const addTextSticker = (text: string) => {
    if (!text.trim()) return;
    const newSticker: Sticker = {
      id: Math.random().toString(),
      type: "text",
      value: text.trim().slice(0, 12),
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    setCustomText("");
  };

  const updateSticker = (id: string, updates: Partial<Sticker>) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const removeSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  // Mouse drag handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    let foundSticker: Sticker | null = null;
    let minDistance = 0.08;

    stickers.forEach((s) => {
      const dx = clickX - s.x;
      const dy = clickY - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        foundSticker = s;
      }
    });

    if (foundSticker) {
      setSelectedStickerId((foundSticker as Sticker).id);
      setIsDragging(true);
    } else {
      setSelectedStickerId(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedStickerId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / rect.width;
    const currentY = (e.clientY - rect.top) / rect.height;

    const clampedX = Math.min(Math.max(currentX, 0.02), 0.98);
    const clampedY = Math.min(Math.max(currentY, 0.02), 0.98);

    updateSticker(selectedStickerId, { x: clampedX, y: clampedY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers for mobile devices
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const clickX = (touch.clientX - rect.left) / rect.width;
    const clickY = (touch.clientY - rect.top) / rect.height;

    let foundSticker: Sticker | null = null;
    let minDistance = 0.08;

    stickers.forEach((s) => {
      const dx = clickX - s.x;
      const dy = clickY - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        foundSticker = s;
      }
    });

    if (foundSticker) {
      setSelectedStickerId((foundSticker as Sticker).id);
      setIsDragging(true);
      if (e.cancelable) e.preventDefault();
    } else {
      setSelectedStickerId(null);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedStickerId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const currentX = (touch.clientX - rect.left) / rect.width;
    const currentY = (touch.clientY - rect.top) / rect.height;

    const clampedX = Math.min(Math.max(currentX, 0.02), 0.98);
    const clampedY = Math.min(Math.max(currentY, 0.02), 0.98);

    updateSticker(selectedStickerId, { x: clampedX, y: clampedY });
    if (e.cancelable) e.preventDefault();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderGraphic(canvas, {
      format,
      image,
      name,
      role,
      title,
      focusX,
      focusY,
      zoom,
      bgColor,
      stickers,
      selectedStickerId,
      qrImage,
      frameImage,
      borderColor,
      builderId,
    });
  }, [format, image, name, role, title, focusX, focusY, zoom, bgColor, stickers, selectedStickerId, qrImage, frameImage, borderColor, builderId]);

  // redraw whenever anything changes (after fonts are ready)
  useEffect(() => {
    let active = true;
    ensureFonts().then(() => {
      if (active) draw();
    });
    return () => {
      active = false;
    };
  }, [draw]);

  // Pre-warm the background removal model on mount for instant user experience
  useEffect(() => {
    const prewarm = async () => {
      try {
        const { removeBackground } = await import("@imgly/background-removal");
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        canvas.toBlob(async (blob) => {
          if (blob) {
            console.log("[AI] Pre-warming background removal model...");
            await removeBackground(blob, {
              model: "isnet_quint8",
            });
            console.log("[AI] Pre-warming complete! Ready for instantaneous background removal.");
          }
        }, "image/jpeg");
      } catch (err) {
        console.warn("[AI] Pre-warming failed or skipped:", err);
      }
    };
    const timer = setTimeout(prewarm, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Generate QR Code once on mount directing back to this portal for frames creation
  useEffect(() => {
    const generateQR = async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const originUrl = getBaseUrl();
        const dataUrl = await QRCode.toDataURL(originUrl, {
          margin: 1,
          width: 240,
          color: {
            dark: "#1c1029", // dark plum color for crisp scan contrast
            light: "#ffffff",
          }
        });
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => setQrImage(img);
      } catch (err) {
        console.error("[QR] Failed to generate QR Code:", err);
      }
    };
    generateQR();
  }, []);

  // Load frame template image once on mount
  useEffect(() => {
    const img = new Image();
    img.src = "/frame.jpg";
    img.onload = () => {
      setFrameImage(img);
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setProcessing(true);
    setProcessingText("Optimizing image size...");
    
    // Step 1: Immediately render the original photo on the canvas as an instant preview
    try {
      setProcessingText("Generating preview...");
      const previewImg = await fileToImage(file);
      setImage(previewImg);
      setFocusX(0.5);
      setFocusY(0.4);
      setZoom(1);
    } catch (previewErr) {
      console.warn("Failed to generate immediate preview:", previewErr);
    }

    // Step 2: Run AI background removal in the background
    try {
      const optimizedBlob = await preprocessImage(file);
      
      setProcessingText("AI removing background: 0%");
      const { removeBackground } = await import("@imgly/background-removal");
      
      const outBlob = await removeBackground(optimizedBlob, {
        model: "isnet_quint8",
        progress: (state: string, progress: number) => {
          const percent = Math.round(progress * 100);
          setProcessingText(`AI removing background: ${percent}%`);
        }
      });

      setProcessingText("Applying cutout...");
      const url = URL.createObjectURL(outBlob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      await img.decode();
      
      // Step 3: Swap preview with the clean cutout
      setImage(img);
    } catch (err) {
      console.log("[v0] failed to process background removal:", err);
      // Since the preview is already loaded on the canvas, we don't block the user
    } finally {
      setProcessing(false);
      setProcessingText("");
    }
  }, []);

  const filename = `hh-goa-2026-${format === "pfp" ? "frame" : "pass"}.png`;

  const getBlob = () =>
    new Promise<Blob | null>((resolve) => {
      canvasRef.current?.toBlob((b) => resolve(b), "image/png");
    });

  const download = async () => {
    await ensureFonts();
    draw();
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    // Auto copy caption to clipboard for easy commenting/replying
    try {
      const text = getCaptionText();
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.warn("Failed to copy caption to clipboard:", err);
    }

    setJustDownloaded(true);
    setTimeout(() => setJustDownloaded(false), 2200);
  };

  const getCaptionText = () => {
    const defaultText = "I'm a builder at HH Goa 2026! 🚀";
    if (!name.trim()) return `${defaultText} #FrameInGoa #HHGoa2026`;
    
    let base = `I'm a builder at HH Goa 2026 — ${name.trim()}`;
    if (role.trim()) {
      base += ` | ${role.trim()}`;
    }
    if (title.trim()) {
      base += ` "${title.trim()}"`;
    }
    return `${base} #FrameInGoa #HHGoa2026`;
  };

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://hhgoa2026.app";

  // Render + attempt the native share sheet (which can attach the image directly).
  // Returns true if the file was shared natively, false if we should fall back to a web intent.
  const prepareShare = async (): Promise<boolean> => {
    await ensureFonts();
    draw();
    const blob = await getBlob();
    if (!blob) return false;
    const file = new File([blob], filename, { type: "image/png" });

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };
    if (isMobile && nav.canShare && nav.canShare({ files: [file] })) {
      try {
        const text = getCaptionText();
        await nav.share({
          files: [file],
          text,
          title: "HH Goa 2026 Builder ID",
        });
        return true;
      } catch {
        /* user cancelled or unsupported — fall through to web intent */
      }
    }

    // Note: We removed the local desktop download fallback here because
    // the new shareTo function handles the desktop flow by uploading to the cloud.
    return false;
  };

  const shareTo = (platform: "x" | "telegram" | "linkedin") => async () => {
    // Copy the custom builder caption text to clipboard automatically
    const caption = getCaptionText();
    try {
      await navigator.clipboard?.writeText(caption);
    } catch {
      /* clipboard blocked — non-fatal */
    }

    // Direct platform web intent flow for consistent post composition with prefilled text and dynamic OG image card showcasing PFP + Pass bundle
    setProcessing(true);
    setProcessingText("Generating share link...");
    let cloudImageUrl = "";

    try {
      const combinedCanvas = document.createElement("canvas");
      renderCombinedGraphic(combinedCanvas, {
        format,
        image,
        name,
        role,
        title,
        focusX,
        focusY,
        zoom,
        bgColor,
        stickers,
        selectedStickerId,
        qrImage,
        frameImage,
        borderColor,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        combinedCanvas.toBlob((b) => resolve(b), "image/jpeg", 0.82);
      });

      if (!blob) throw new Error("No image generated");

      const formData = new FormData();
      formData.append("file", blob, "hh-goa-bundle.jpg");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }
      if (data.url) {
        cloudImageUrl = data.url;
      } else {
        throw new Error("No URL returned from upload server");
      }
    } catch (error) {
      console.error(error);
      alert(`Failed to prepare image for sharing: ${error instanceof Error ? error.message : "Unknown error"}. Please download it instead.`);
      setProcessing(false);
      setProcessingText("");
      return;
    }
    setProcessing(false);
    setProcessingText("");

    // Construct the dynamic share link
    const baseUrl = getBaseUrl();
    const dynamicShareLink = `${baseUrl}/share?img=${encodeURIComponent(
      cloudImageUrl,
    )}`;

    const text = encodeURIComponent(caption);
    const encodedShareUrl = encodeURIComponent(dynamicShareLink);

    const targets: Record<typeof platform, string> = {
      // X and Telegram both accept pre-filled text + the dynamic URL
      x: `https://twitter.com/intent/tweet?text=${text}&url=${encodedShareUrl}`,
      telegram: `https://t.me/share/url?url=${encodedShareUrl}&text=${text}`,
      // LinkedIn no longer honors pre-filled text in its share dialog; the caption is on the clipboard instead
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
    };

    window.open(targets[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="studio"
      className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-24"
    >
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5 text-gold" aria-hidden /> The Studio
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl text-balance">
          Make your <span className="sunset-text">HH Goa 2026</span> graphic
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground text-pretty">
          Upload a photo, tweak the crop, and download or share in one pass. No
          login, no wait.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.05fr] md:items-start md:gap-8 lg:gap-10">
        {/* ---- controls ---- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="order-2 md:order-1"
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:border-white/20 transition-all duration-300 sm:p-6">
            {/* format toggle */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-white/[0.04] border border-white/5 p-1 backdrop-blur-md">
              {(["pfp", "card"] as Format[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  {format === f && (
                    <motion.span
                      layoutId="fmt-pill"
                      className="absolute inset-0 rounded-xl bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      format === f
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {f === "pfp" ? "PFP Frame" : "Builder Pass"}
                  </span>
                </button>
              ))}
            </div>

            {!image ? (
              <Uploader onFile={handleFile} processing={processing} processingText={processingText} />
            ) : (
              <Uploader onFile={handleFile} processing={processing} processingText={processingText} compact />
            )}

            {/* crop controls */}
            {image && (
              <div className="mt-5 space-y-4">
                <Slider
                  label="Zoom"
                  value={zoom}
                  min={1}
                  max={2.6}
                  step={0.02}
                  onChange={setZoom}
                />
                <Slider
                  label="Horizontal"
                  value={focusX}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={setFocusX}
                />
                <Slider
                  label="Vertical"
                  value={focusY}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={setFocusY}
                />
              </div>
            )}

            {/* background theme presets */}
            <div className="mt-5 space-y-3.5 border-t border-border pt-5">
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Background Theme
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {BG_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setBgColor(preset.key)}
                    title={preset.name}
                    className={`relative size-8 rounded-full border border-border/80 transition hover:scale-110 active:scale-95 ${preset.color} ${
                      bgColor === preset.key ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                    }`}
                  >
                    {bgColor === preset.key && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* border color presets */}
            <div className="mt-5 space-y-3.5 border-t border-border pt-5">
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Border Color
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {BORDER_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setBorderColor(preset.key)}
                    title={preset.name}
                    className={`relative size-8 rounded-full border border-border/80 transition hover:scale-110 active:scale-95 ${preset.color} ${
                      borderColor === preset.key ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                    }`}
                  >
                    {borderColor === preset.key && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-primary-foreground font-bold drop-shadow">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* stickers & emojis sections */}
            <div className="mt-5 space-y-4 border-t border-border pt-5">
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Stickers & Emojis
              </h3>

              {/* Coding & Hackathon Emojis shelf */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  💻 Coding & Hackathon Emojis
                </label>
                <div className="grid grid-cols-8 gap-1">
                  {HACKER_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmojiSticker(emoji)}
                      className="flex size-9 items-center justify-center rounded-xl bg-secondary/50 text-xl transition hover:scale-105 hover:bg-secondary active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gen-Z Emojis shelf */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  💅 Gen-Z Emojis
                </label>
                <div className="grid grid-cols-8 gap-1">
                  {GENZ_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmojiSticker(emoji)}
                      className="flex size-9 items-center justify-center rounded-xl bg-secondary/50 text-xl transition hover:scale-105 hover:bg-secondary active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goa Emojis shelf */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  🌴 Goa style Emojis
                </label>
                <div className="grid grid-cols-8 gap-1">
                  {GOA_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmojiSticker(emoji)}
                      className="flex size-9 items-center justify-center rounded-xl bg-secondary/50 text-xl transition hover:scale-105 hover:bg-secondary active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coding Pass labels */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  ⚙️ Hacker Pass Labels
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HACKER_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addTextSticker(preset)}
                      className="rounded-lg border border-border bg-secondary/30 px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-secondary active:scale-95"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* GenZ Slang labels */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  👑 Gen-Z Slang Labels
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GENZ_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addTextSticker(preset)}
                      className="rounded-lg border border-border bg-secondary/30 px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-secondary active:scale-95"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goa themed labels */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  🌊 Goa Themed Labels
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GOA_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addTextSticker(preset)}
                      className="rounded-lg border border-border bg-secondary/30 px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-secondary active:scale-95"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create custom label form */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  ✍️ Create Custom Word Sticker
                </label>
                <div className="flex gap-2">
                  <input
                    value={customText}
                    maxLength={12}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Type custom word..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/15 backdrop-blur-md text-foreground placeholder:text-muted-foreground/50 hover:border-white/15"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addTextSticker(customText)}
                    className="shrink-0 font-semibold"
                  >
                    Add Label
                  </Button>
                </div>
              </div>

              {/* Active sticker editor panel */}
              {stickers.length > 0 && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 space-y-4 shadow-sm backdrop-blur-md">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Select Stamp
                      </label>
                      <select
                        value={selectedStickerId || ""}
                        onChange={(e) => setSelectedStickerId(e.target.value || null)}
                        className="rounded-lg border border-white/10 bg-[#120a1c] px-2 py-1.5 text-xs outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 text-foreground backdrop-blur-md"
                    >
                      <option value="">-- Choose sticker --</option>
                      {stickers.map((s, idx) => (
                        <option key={s.id} value={s.id}>
                          {idx + 1}. {s.type === "emoji" ? s.value : `"${s.value}"`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const activeSticker = stickers.find((s) => s.id === selectedStickerId);
                    if (!activeSticker) {
                      return (
                        <p className="text-center text-[11px] text-muted-foreground py-1">
                          Choose a stamp above to position/scale it
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-3 pt-1">
                        <Slider
                          label="Horizontal"
                          value={activeSticker.x}
                          min={0.05}
                          max={0.95}
                          step={0.01}
                          onChange={(v) => updateSticker(activeSticker.id, { x: v })}
                        />
                        <Slider
                          label="Vertical"
                          value={activeSticker.y}
                          min={0.05}
                          max={0.95}
                          step={0.01}
                          onChange={(v) => updateSticker(activeSticker.id, { y: v })}
                        />
                        <Slider
                          label="Size"
                          value={activeSticker.scale}
                          min={0.3}
                          max={3.0}
                          step={0.05}
                          onChange={(v) => updateSticker(activeSticker.id, { scale: v })}
                        />
                        <Slider
                          label="Rotation"
                          value={activeSticker.rotation}
                          min={-180}
                          max={180}
                          step={5}
                          onChange={(v) => updateSticker(activeSticker.id, { rotation: v })}
                        />
                        <div className="flex pt-1.5">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="w-full font-semibold text-xs h-8"
                            onClick={() => removeSticker(activeSticker.id)}
                          >
                            Remove Sticker
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* card fields */}
            <AnimatePresence initial={false}>
              {format === "card" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 space-y-4 pt-1">
                    <Field label="Name">
                      <input
                        value={name}
                        maxLength={22}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ada Lovelace"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/15 backdrop-blur-md text-foreground placeholder:text-muted-foreground/50 hover:border-white/15"
                      />
                    </Field>

                    <Field label="Stack / Role">
                      <input
                        value={role}
                        maxLength={34}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Full-stack Dev"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/15 backdrop-blur-md text-foreground placeholder:text-muted-foreground/50 hover:border-white/15"
                      />
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ROLES.map((r) => (
                          <button
                            key={r}
                            onClick={() => setRole(r)}
                            className="rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-1 text-xs text-muted-foreground transition hover:border-white/20 hover:text-foreground hover:bg-white/[0.06] backdrop-blur-sm"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Builder ID">
                      <div className="flex gap-2">
                        <input
                          value={builderId}
                          maxLength={15}
                          onChange={(e) => setBuilderId(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/15 backdrop-blur-md text-foreground placeholder:text-muted-foreground/50 hover:border-white/15"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          aria-label="Generate a new builder ID"
                          onClick={() => setBuilderId(generateBuilderId())}
                          className="shrink-0"
                        >
                          <Shuffle className="size-4" />
                        </Button>
                      </div>
                    </Field>
 
                    <Field label="Builder title">
                      <div className="flex gap-2">
                        <input
                          value={title}
                          maxLength={26}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/15 backdrop-blur-md text-foreground placeholder:text-muted-foreground/50 hover:border-white/15"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          aria-label="Generate a new builder title"
                          onClick={() => setTitle(generateTitle())}
                          className="shrink-0"
                        >
                          <Shuffle className="size-4" />
                        </Button>
                      </div>
                    </Field>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* actions */}
            <div className="mt-6 space-y-2.5">
              <Button
                onClick={download}
                disabled={!image}
                className="h-12 w-full gap-2 text-base font-semibold"
              >
                {justDownloaded ? (
                  <>
                    <Check className="size-4" /> Saved to device
                  </>
                ) : (
                  <>
                    <Download className="size-4" /> Download graphic
                  </>
                )}
              </Button>

              <div className="grid grid-cols-3 gap-2.5">
                <ShareButton
                  label="X"
                  onClick={shareTo("x")}
                  disabled={!image}
                  icon={<XLogo className="size-4" />}
                />
                <ShareButton
                  label="Telegram"
                  onClick={shareTo("telegram")}
                  disabled={!image}
                  icon={<TelegramLogo className="size-4" />}
                />
                <ShareButton
                  label="LinkedIn"
                  onClick={shareTo("linkedin")}
                  disabled={!image}
                  icon={<LinkedInLogo className="size-4" />}
                />
              </div>
            </div>

            <AnimatePresence>
              {justDownloaded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-xs text-emerald-400 font-medium">
                    ✨ Image saved! Predefined post text has been copied to your clipboard. Paste it directly as your post or comment on X!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              Caption is pre-filled with{" "}
              <span className="text-gold">#FrameInGoa #HHGoa2026</span>. Click X to post directly with preview, or click Download to copy share text to clipboard!
            </p>
          </div>
        </motion.div>

        {/* ---- live preview ---- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="order-1 md:order-2"
        >
          <div className="sticky top-6 flex flex-col items-center">
            <div className="glow-ring rounded-3xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl shadow-2xl">
              <motion.canvas
                key={format}
                ref={canvasRef}
                initial={{ opacity: 0.4, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasMouseUp}
                className={`block h-auto w-full rounded-2xl cursor-grab active:cursor-grabbing select-none touch-none ${
                  format === "pfp" ? "max-w-[420px]" : "max-w-[380px]"
                }`}
              />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {image
                ? "Live preview · exported at full resolution"
                : "Upload a photo to see it framed instantly"}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- small UI atoms ---------- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-primary focus:outline-none"
      />
    </label>
  );
}

function ShareButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Share to ${label}`}
      className="flex h-12 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-secondary/50 text-xs font-semibold text-foreground transition hover:border-primary/60 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M21.94 4.63a1.06 1.06 0 0 0-1.1-.17L3.3 11.32c-.78.31-.76 1.42.03 1.7l4.28 1.5 1.66 5.31c.2.64 1 .84 1.48.37l2.4-2.33 4.28 3.15c.5.37 1.22.11 1.37-.5l3.02-14.6a1.06 1.06 0 0 0-.36-1.29zM9.7 14.13l7.9-4.98-6.5 5.86c-.15.14-.25.32-.29.52l-.35 2.02z" />
    </svg>
  );
}

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}
