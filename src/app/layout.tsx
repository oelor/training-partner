import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import CookieConsent from '@/components/cookie-consent'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://trainingpartner.app'),
  title: {
    default: 'Find Sparring Partners & Training Buddies Near You | Training Partner',
    template: '%s | Training Partner',
  },
  description: 'Find local sparring partners and training buddies for BJJ, MMA, wrestling, boxing, Muay Thai, judo, kickboxing and 50+ combat sports. Match by skill level, weight class, and training goals. Free to join.',
  keywords: 'sparring partners, training buddies, combat sports, BJJ, MMA, wrestling, boxing, Muay Thai, judo, kickboxing, training partner, gym, open mat, martial arts',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Training Partner - Never Train Alone Again',
    description: 'Connect with compatible training partners based on skill level, weight class, and training goals.',
    type: 'website',
    siteName: 'Training Partner',
    images: [
      {
        url: 'https://trainingpartner.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Training Partner - Never Train Alone Again',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Training Partner - Never Train Alone Again',
    description: 'Connect with compatible training partners based on skill level, weight class, and training goals.',
    images: ['https://trainingpartner.app/og-image.png'],
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trainingpartner.app'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: 'Training Partner',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description: 'Connect with compatible training partners in your area for combat sports.',
      sameAs: [] as string[],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Training Partner',
      publisher: { '@id': `${SITE_URL}/#org` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/partners?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      name: 'Training Partner',
      url: SITE_URL,
      applicationCategory: 'SportsApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Training Partner',
      operatingSystem: 'Web',
      applicationCategory: 'SportsApplication',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
      },
      description: 'Find local sparring partners and training buddies for BJJ, MMA, wrestling, boxing and 50+ combat sports.',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <CookieConsent />
        {/* Cloudflare Web Analytics — free, privacy-first, no cookies */}
        {process.env.NEXT_PUBLIC_CF_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token":"${process.env.NEXT_PUBLIC_CF_BEACON_TOKEN}"}`}
          />
        )}
      </body>
    </html>
  )
}
