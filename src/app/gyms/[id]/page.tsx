import { Metadata } from 'next'
import Link from 'next/link'
import { Users, MapPin, Star, ArrowRight, Shield, Clock, ChevronRight } from 'lucide-react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trainingpartner.app'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trainingpartner.app'

interface GymDetailData {
  id: number
  name: string
  address: string
  city: string
  state: string
  lat: number
  lng: number
  phone: string
  email: string
  description: string
  sports: string[]
  amenities: string[]
  verified: boolean
  premium: boolean
  rating: number
  review_count: number
  price: string
  sessions: { id: number; day_of_week: string; start_time: string; end_time: string; max_slots: number }[]
  reviews: { id: number; user_name: string; rating: number; comment: string; created_at: string }[]
}

async function fetchGym(id: string): Promise<GymDetailData | null> {
  try {
    const res = await fetch(`${API_URL}/api/gyms/${id}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.gym || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const gym = await fetchGym(id)

  if (!gym) {
    return { title: 'Gym Not Found | Training Partner' }
  }

  const title = `${gym.name} - ${gym.city}${gym.state ? `, ${gym.state}` : ''} | Training Partner`
  const description = gym.description
    ? `${gym.description.slice(0, 150)}... Sports: ${gym.sports.join(', ')}. Read reviews and find open mat times.`
    : `${gym.name} in ${gym.city} offers ${gym.sports.join(', ')}. Find schedules, reviews, and open mat times on Training Partner.`

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/gyms/${id}`,
    },
    openGraph: {
      title: `${gym.name} - ${gym.city}`,
      description,
      type: 'website',
    },
  }
}

function buildJsonLd(gym: GymDetailData) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/gyms/${gym.id}`,
        name: gym.name,
        description: gym.description,
        address: {
          '@type': 'PostalAddress',
          streetAddress: gym.address,
          addressLocality: gym.city,
          addressRegion: gym.state,
        },
        ...(gym.lat && gym.lng ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: gym.lat,
            longitude: gym.lng,
          },
        } : {}),
        ...(gym.phone ? { telephone: gym.phone } : {}),
        ...(gym.email ? { email: gym.email } : {}),
        url: `${SITE_URL}/gyms/${gym.id}`,
        ...(gym.rating > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: gym.rating,
            reviewCount: gym.review_count || 1,
          },
        } : {}),
      },
      {
        '@type': 'SportsActivityLocation',
        name: gym.name,
        description: gym.description,
        address: {
          '@type': 'PostalAddress',
          streetAddress: gym.address,
          addressLocality: gym.city,
          addressRegion: gym.state,
        },
        url: `${SITE_URL}/gyms/${gym.id}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Gyms', item: `${SITE_URL}/gyms` },
          { '@type': 'ListItem', position: 3, name: gym.name, item: `${SITE_URL}/gyms/${gym.id}` },
        ],
      },
    ],
  }
}

export default async function GymDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gym = await fetchGym(id)

  if (!gym) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-white mb-4">GYM NOT FOUND</h1>
          <Link href="/gyms" className="text-primary hover:underline">Browse All Gyms</Link>
        </div>
      </div>
    )
  }

  const jsonLd = buildJsonLd(gym)
  // Safe: JSON.stringify of server-controlled API data, not user input
  const jsonLdString = JSON.stringify(jsonLd)

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />
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
        {/* Breadcrumb */}
        <nav className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/gyms" className="hover:text-white transition-colors">Gyms</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{gym.name}</span>
          </div>
        </nav>

        {/* Gym Header */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-3 mb-4">
              <h1 className="font-heading text-4xl text-white">
                {gym.name.toUpperCase()}
              </h1>
              {gym.verified && (
                <Shield className="w-6 h-6 text-primary shrink-0 mt-2" />
              )}
            </div>

            <div className="flex items-center gap-4 text-text-secondary mb-6 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{gym.address ? `${gym.address}, ` : ''}{gym.city}{gym.state ? `, ${gym.state}` : ''}</span>
              </div>
              {gym.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-white font-medium">{gym.rating.toFixed(1)}</span>
                  <span>({gym.review_count} reviews)</span>
                </div>
              )}
            </div>

            {gym.sports && gym.sports.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {gym.sports.map(s => (
                  <span key={s} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {gym.description && (
              <p className="text-text-secondary leading-relaxed mb-8">
                {gym.description}
              </p>
            )}
          </div>
        </section>

        {/* Schedule */}
        {gym.sessions && gym.sessions.length > 0 && (
          <section className="py-16 px-6 bg-surface border-y border-border">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl text-white mb-8">SCHEDULE & OPEN MAT TIMES</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {gym.sessions.map(session => (
                  <div key={session.id} className="bg-background border border-border rounded-lg p-4 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <div className="text-white font-medium">{session.day_of_week}</div>
                      <div className="text-text-secondary text-sm">{session.start_time} - {session.end_time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Amenities */}
        {gym.amenities && gym.amenities.length > 0 && (
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl text-white mb-8">AMENITIES</h2>
              <div className="flex flex-wrap gap-3">
                {gym.amenities.map(amenity => (
                  <span key={amenity} className="bg-surface border border-border rounded-lg px-4 py-2 text-text-secondary text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Reviews Preview */}
        {gym.reviews && gym.reviews.length > 0 && (
          <section className="py-16 px-6 bg-surface border-y border-border">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl text-white mb-8">REVIEWS</h2>
              <div className="space-y-4">
                {gym.reviews.slice(0, 3).map(review => (
                  <div key={review.id} className="bg-background border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium">{review.user_name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? 'text-accent fill-accent' : 'text-border'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-text-secondary text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 px-6 bg-primary/10 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl text-white mb-4">
              SIGN UP TO SEE FULL DETAILS
            </h2>
            <p className="text-text-secondary mb-8">
              Create a free account to see full gym details, read all reviews, book sessions, and connect with training partners at {gym.name}.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up Free <ArrowRight className="w-5 h-5" />
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
