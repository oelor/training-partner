import { Metadata } from 'next'
import Link from 'next/link'
import { Users, MapPin, Star, ArrowRight, Shield, Dumbbell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Combat Sports Gyms & Training Centers Near You | Training Partner',
  description: 'Browse combat sports gyms and training centers for BJJ, MMA, wrestling, boxing, Muay Thai, judo and more. Find gym schedules, open mat times, and reviews. Free to browse.',
  alternates: {
    canonical: 'https://trainingpartner.app/gyms',
  },
  openGraph: {
    title: 'Combat Sports Gyms & Training Centers Near You',
    description: 'Browse combat sports gyms for BJJ, MMA, wrestling, boxing and more. Find schedules, reviews, and open mat times.',
    type: 'website',
  },
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trainingpartner.app'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trainingpartner.app'

interface GymData {
  id: number
  name: string
  address: string
  city: string
  state: string
  sports: string[]
  rating: number
  review_count: number
  description: string
  verified: boolean
  premium: boolean
}

async function fetchGyms(): Promise<GymData[]> {
  try {
    const res = await fetch(`${API_URL}/api/gyms`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.gyms || []
  } catch {
    return []
  }
}

function buildJsonLd(gyms: GymData[]) {
  const gymSchemas = gyms.slice(0, 20).map(gym => ({
    '@type': 'LocalBusiness' as const,
    '@id': `${SITE_URL}/gyms/${gym.id}`,
    name: gym.name,
    address: {
      '@type': 'PostalAddress' as const,
      addressLocality: gym.city,
      addressRegion: gym.state,
    },
    ...(gym.rating > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating' as const,
        ratingValue: gym.rating,
        reviewCount: gym.review_count || 1,
      },
    } : {}),
    url: `${SITE_URL}/gyms/${gym.id}`,
  }))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Combat Sports Gyms & Training Centers',
        description: 'Browse combat sports gyms and training centers near you.',
        url: `${SITE_URL}/gyms`,
      },
      ...gymSchemas,
    ],
  }
}

export default async function GymsPage() {
  const gyms = await fetchGyms()
  const jsonLd = buildJsonLd(gyms)
  // JSON.stringify is safe here: data comes from our own API, not user input
  const jsonLdHtml = JSON.stringify(jsonLd)

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-xl text-white">TRAINING PARTNER</span>
          </Link>
          <Link href="/auth/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Sign Up Free
          </Link>
        </div>
      </header>

      <main>
        <section className="py-16 lg:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl lg:text-6xl text-white mb-6">
              COMBAT SPORTS GYMS & TRAINING CENTERS
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
              Browse gyms offering BJJ, MMA, wrestling, boxing, Muay Thai, judo, and more. Find schedules, open mat times, and reviews from real athletes.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up for Full Access <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <section className="py-16 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-2xl text-white mb-8">
              {gyms.length > 0 ? `${gyms.length} GYMS LISTED` : 'GYM DIRECTORY'}
            </h2>

            {gyms.length === 0 ? (
              <div className="text-center py-16">
                <Dumbbell className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary text-lg mb-4">No gyms listed yet. Be the first to claim your gym!</p>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  List Your Gym <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gyms.map(gym => (
                  <Link
                    key={gym.id}
                    href={`/gyms/${gym.id}`}
                    className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-medium group-hover:text-primary transition-colors line-clamp-1">
                        {gym.name}
                      </h3>
                      {gym.verified && (
                        <Shield className="w-4 h-4 text-primary shrink-0 ml-2" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-text-secondary text-sm mb-3">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{gym.city}{gym.state ? `, ${gym.state}` : ''}</span>
                    </div>

                    {gym.rating > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="text-white text-sm font-medium">{gym.rating.toFixed(1)}</span>
                        <span className="text-text-secondary text-sm">({gym.review_count} reviews)</span>
                      </div>
                    )}

                    {gym.sports && gym.sports.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {gym.sports.slice(0, 4).map(s => (
                          <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                        {gym.sports.length > 4 && (
                          <span className="text-xs bg-border text-text-secondary px-2 py-1 rounded-full">
                            +{gym.sports.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {gym.description && (
                      <p className="text-text-secondary text-sm line-clamp-2">
                        {gym.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-primary/10 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl text-white mb-4">
              OWN A GYM? LIST IT FOR FREE
            </h2>
            <p className="text-text-secondary mb-8">
              Claim your gym listing, set your open mat schedule, and connect with athletes in your area. Free for all gyms.
            </p>
            <Link
              href="/auth/signup?plan=gym"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors"
            >
              Claim Your Gym <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-text-secondary text-sm">
          <p>&copy; {new Date().getFullYear()} Training Partner. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
