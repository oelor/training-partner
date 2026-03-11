import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Training Partner - Find Your Perfect Sparring Partner',
  description: 'Connect with compatible training partners in your area. Match by skill level, weight class, and training goals. Plus access exclusive open mat hours at partner gyms.',
  keywords: 'wrestling, MMA, BJJ, boxing, training partner, sparring, combat sports, gym, open mat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
