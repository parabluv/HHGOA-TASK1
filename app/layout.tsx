import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HH Goa 2026 · Frame Studio',
  description:
    'Turn any photo into an on-brand HH Goa 2026 profile frame or Builder Pass in seconds. Upload, generate, download, and share to X with #FrameInGoa.',
  generator: 'v0.app',
  openGraph: {
    title: 'HH Goa 2026 · Frame Studio',
    description:
      'Drop a photo, get an HH Goa 2026 frame or Builder Pass instantly. Share it with #FrameInGoa.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HH Goa 2026 · Frame Studio',
    description:
      'Drop a photo, get an HH Goa 2026 frame or Builder Pass instantly. #FrameInGoa',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a0f22',
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} bg-background`}>
      <head>
        {/* Loaded with explicit family names so <canvas> text can use them */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
