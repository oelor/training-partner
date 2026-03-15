import { Metadata } from 'next'
import Link from 'next/link'
import { Users, ShoppingBag, Shield, ChevronRight } from 'lucide-react'
import { GearProductCard } from './gear-product-card'
import { GEAR_PRODUCTS } from '@/lib/gear-products'

const SITE_URL = 'https://trainingpartner.app'

export const metadata: Metadata = {
  title: 'Best Combat Sports Gear 2026 | Training Partner Recommendations',
  description: 'Curated gear recommendations for BJJ, MMA, wrestling, and boxing. Gloves, gis, headgear, mouthguards, and more from trusted brands.',
  alternates: {
    canonical: `${SITE_URL}/gear`,
  },
  openGraph: {
    title: 'Best Combat Sports Gear 2026',
    description: 'Curated gear recommendations for BJJ, MMA, wrestling, and boxing from trusted brands.',
    type: 'website',
    url: `${SITE_URL}/gear`,
    siteName: 'Training Partner',
  },
}

const PRODUCTS = GEAR_PRODUCTS
const CATEGORIES = Array.from(new Set(PRODUCTS.map(p => p.category)))

export default function GearPage() {
  // JSON-LD structured data built entirely from static content - safe for inline script
  const jsonLdScript = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best Combat Sports Gear 2026',
    description: 'Curated gear recommendations for BJJ, MMA, wrestling, and boxing.',
    url: `${SITE_URL}/gear`,
    numberOfItems: PRODUCTS.length,
    itemListElement: PRODUCTS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        brand: { '@type': 'Brand', name: p.brand },
        description: p.description,
        offers: {
          '@type': 'Offer',
          price: p.price.replace('$', ''),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Structured data - built from hardcoded static product info, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript }}
      />

      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-xl text-white">TRAINING PARTNER</span>
          </Link>
          <Link href="/auth/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors btn-glow">
            Sign Up Free
          </Link>
        </div>
      </header>

      <main className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Gear Recommendations</span>
          </nav>

          {/* Hero */}
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-3xl sm:text-4xl text-white">RECOMMENDED GEAR</h1>
                <p className="text-text-secondary">Trusted equipment for every combat sport</p>
              </div>
            </div>
            <p className="text-text-secondary max-w-2xl mt-4">
              We have tested and reviewed the best gear across BJJ, MMA, wrestling, and boxing.
              These are our top picks for quality, value, and durability at every price point.
            </p>
          </div>

          {/* Categories */}
          {CATEGORIES.map(category => {
            const categoryProducts = PRODUCTS.filter(p => p.category === category)
            return (
              <section key={category} className="mb-12">
                <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {category.toUpperCase()}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryProducts.map(product => (
                    <GearProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )
          })}

          {/* Disclaimer */}
          <div className="bg-surface border border-border rounded-xl p-6 mt-8 text-sm text-text-secondary">
            <p>
              Training Partner earns a small commission on purchases made through these links.
              This does not affect the price you pay. We only recommend products we believe
              offer genuine value to combat sports practitioners. Product prices and availability
              are subject to change.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-text-secondary mb-4">Looking for training partners to use this gear with?</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-heading text-lg hover:bg-primary/90 transition-colors btn-glow"
            >
              Join Training Partner Free
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
