import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Training Partner - Find Your Perfect Sparring Partner',
  description: 'Connect with compatible training partners in your area. Match by skill level, weight class, and training goals. Plus access exclusive open mat hours at partner gyms.',
  keywords: 'wrestling, MMA, BJJ, boxing, training partner, sparring, combat sports, gym, open mat',
  openGraph: {
    title: 'Training Partner - Never Train Alone Again',
    description: 'Connect with compatible training partners based on skill level, weight class, and training goals.',
    type: 'website',
    siteName: 'Training Partner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Training Partner - Never Train Alone Again',
    description: 'Connect with compatible training partners based on skill level, weight class, and training goals.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D0D0D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
