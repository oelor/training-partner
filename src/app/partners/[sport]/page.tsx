import { Metadata } from 'next'
import Link from 'next/link'
import { Users, MapPin, ArrowRight, Shield, Star, Zap } from 'lucide-react'

const sports: Record<string, { name: string; description: string; benefits: string[] }> = {
  wrestling: {
    name: 'Wrestling',
    description: 'Find wrestling training partners near you. Whether you practice freestyle, Greco-Roman, or folkstyle, connect with grapplers at your skill level.',
    benefits: ['Drill takedowns and scrambles', 'Prepare for tournaments', 'Find live wrestling partners'],
  },
  mma: {
    name: 'MMA',
    description: 'Connect with MMA training partners in your area. Find sparring partners, drilling partners, and fighters preparing for competition.',
    benefits: ['Full sparring partners', 'Striking and grappling drills', 'Fight camp preparation'],
  },
  bjj: {
    name: 'BJJ',
    description: 'Find Brazilian Jiu-Jitsu training partners near you. Roll with practitioners at your belt level and improve your ground game.',
    benefits: ['Rolling partners at your level', 'Drill submissions and sweeps', 'Competition preparation'],
  },
  boxing: {
    name: 'Boxing',
    description: 'Find boxing sparring partners and training partners in your city. From beginners to competitive fighters.',
    benefits: ['Sparring at your level', 'Pad work partners', 'Conditioning drills'],
  },
  kickboxing: {
    name: 'Kickboxing',
    description: 'Connect with kickboxing training partners. Find sparring partners for Dutch style, K-1, or Muay Thai kickboxing.',
    benefits: ['Technical sparring', 'Pad and bag work partners', 'Cardio kickboxing groups'],
  },
  'muay-thai': {
    name: 'Muay Thai',
    description: 'Find Muay Thai training partners near you. Practice clinch work, elbows, knees, and full Thai boxing sparring.',
    benefits: ['Clinch work partners', 'Pad holders', 'Technical sparring'],
  },
  judo: {
    name: 'Judo',
    description: 'Connect with Judo training partners in your area. Find uchikomi partners, randori partners, and competition prep partners.',
    benefits: ['Randori partners', 'Uchikomi drilling', 'Competition preparation'],
  },
  karate: {
    name: 'Karate',
    description: 'Find Karate training partners near you. Whether Shotokan, Kyokushin, or sport karate, connect with martial artists at your level.',
    benefits: ['Kumite sparring', 'Kata practice partners', 'Point fighting prep'],
  },
  sambo: {
    name: 'Sambo',
    description: 'Find Sambo training partners. Connect with Combat Sambo and Sport Sambo practitioners for grappling and submission work.',
    benefits: ['Throws and takedowns', 'Leg lock drilling', 'Combat sambo sparring'],
  },
}

const popularCities = [
  'new-york', 'los-angeles', 'chicago', 'houston', 'phoenix',
  'san-antonio', 'san-diego', 'dallas', 'san-francisco', 'austin',
  'miami', 'denver', 'seattle', 'portland', 'las-vegas',
  'atlanta', 'boston', 'philadelphia', 'san-jose', 'nashville',
]

function citySlugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export async function generateStaticParams() {
  return Object.keys(sports).map(sport => ({ sport }))
}

export async function generateMetadata({ params }: { params: Promise<{ sport: string }> }): Promise<Metadata> {
  const { sport } = await params
  const info = sports[sport]
  if (!info) return { title: 'Training Partners | Training Partner' }

  return {
    title: `Find ${info.name} Training Partners | Training Partner`,
    description: info.description,
    openGraph: {
      title: `Find ${info.name} Training Partners Near You`,
      description: info.description,
      type: 'website',
    },
  }
}

export default async function SportPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params
  const info = sports[sport]

  const jsonLd = info ? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Find ${info.name} Training Partners`,
    description: info.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://trainingpartner.app'}/partners/${sport}`,
    isPartOf: { '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://trainingpartner.app'}/#website` },
    about: {
      '@type': 'SportsOrganization',
      name: `${info.name} Training Partners`,
      sport: info.name,
    },
  } : null

  if (!info) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-white mb-4">SPORT NOT FOUND</h1>
          <Link href="/" className="text-primary hover:underline">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* Hero */}
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
              FIND {info.name.toUpperCase()} TRAINING PARTNERS
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
              {info.description}
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-6 bg-surface border-y border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl text-white mb-8 text-center">WHY USE TRAINING PARTNER FOR {info.name.toUpperCase()}?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {info.benefits.map((benefit, i) => (
                <div key={i} className="bg-background border border-border rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {i === 0 ? <Shield className="w-6 h-6 text-primary" /> : i === 1 ? <Star className="w-6 h-6 text-primary" /> : <Zap className="w-6 h-6 text-primary" />}
                  </div>
                  <p className="text-white font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* City Links */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl text-white mb-8 text-center">
              FIND {info.name.toUpperCase()} PARTNERS BY CITY
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularCities.map(city => (
                <Link
                  key={city}
                  href={`/partners/${sport}/${city}`}
                  className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-3 text-text-secondary hover:text-white hover:border-primary transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  {citySlugToName(city)}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-primary/10 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl text-white mb-4">READY TO FIND YOUR NEXT TRAINING PARTNER?</h2>
            <p className="text-text-secondary mb-8">
              Join thousands of {info.name.toLowerCase()} athletes already connected on Training Partner.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors"
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
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
