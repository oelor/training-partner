import { Metadata } from 'next'
import Link from 'next/link'
import { Users, MapPin, ArrowRight, Shield, Star, Zap, ChevronRight } from 'lucide-react'

const sportsMap: Record<string, string> = {
  wrestling: 'Wrestling', mma: 'MMA', bjj: 'BJJ', boxing: 'Boxing',
  kickboxing: 'Kickboxing', 'muay-thai': 'Muay Thai', judo: 'Judo',
  karate: 'Karate', sambo: 'Sambo',
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
  const params: { sport: string; city: string }[] = []
  for (const sport of Object.keys(sportsMap)) {
    for (const city of popularCities) {
      params.push({ sport, city })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ sport: string; city: string }> }): Promise<Metadata> {
  const { sport, city } = await params
  const sportName = sportsMap[sport] || sport
  const cityName = citySlugToName(city)

  return {
    title: `${sportName} Training Partners in ${cityName} | Training Partner`,
    description: `Find ${sportName.toLowerCase()} training partners in ${cityName}. Connect with local athletes at your skill level for sparring, drilling, and competition prep.`,
    alternates: {
      canonical: `https://trainingpartner.app/partners/${sport}/${city}`,
    },
    openGraph: {
      title: `${sportName} Training Partners in ${cityName}`,
      description: `Find ${sportName.toLowerCase()} training partners in ${cityName}. Connect with local athletes at your skill level.`,
      type: 'website',
    },
  }
}

export default async function CityPage({ params }: { params: Promise<{ sport: string; city: string }> }) {
  const { sport, city } = await params
  const sportName = sportsMap[sport]
  const cityName = citySlugToName(city)

  const pageUrl = `https://trainingpartner.app/partners/${sport}/${city}`
  const pageDescription = `Find ${sportName?.toLowerCase() || sport} training partners in ${cityName}. Connect with local athletes at your skill level for sparring, drilling, and competition prep.`

  const jsonLd = sportName ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${sportName} Training Partners in ${cityName}`,
        description: pageDescription,
        url: pageUrl,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://trainingpartner.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: sportName,
            item: `https://trainingpartner.app/partners/${sport}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: cityName,
            item: pageUrl,
          },
        ],
      },
    ],
  } : null

  if (!sportName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-white mb-4">NOT FOUND</h1>
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
            <Link href={`/partners/${sport}`} className="hover:text-white transition-colors">{sportName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{cityName}</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-12 lg:py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full text-primary text-sm mb-6">
              <MapPin className="w-4 h-4" />
              {cityName}
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl text-white mb-6">
              {sportName.toUpperCase()} TRAINING PARTNERS IN {cityName.toUpperCase()}
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
              Connect with {sportName.toLowerCase()} athletes in {cityName}. Find training partners at your skill level for sparring, drilling, and competition prep — completely free.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors"
            >
              Find Partners in {cityName} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-6 bg-surface border-y border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl text-white mb-10 text-center">HOW IT WORKS</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: 'Create Profile', desc: `Set up your ${sportName.toLowerCase()} profile with your skill level, weight class, and training goals.` },
                { icon: Star, title: 'Get Matched', desc: `Our matching algorithm finds compatible ${sportName.toLowerCase()} partners in ${cityName}.` },
                { icon: Zap, title: 'Start Training', desc: 'Message potential partners, schedule sessions, and level up your training.' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="font-heading text-sm text-primary mb-2">STEP {i + 1}</div>
                  <h3 className="text-white font-medium mb-2">{step.title}</h3>
                  <p className="text-text-secondary text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other sports in this city */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl text-white mb-8 text-center">
              OTHER SPORTS IN {cityName.toUpperCase()}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(sportsMap)
                .filter(([key]) => key !== sport)
                .map(([key, name]) => (
                  <Link
                    key={key}
                    href={`/partners/${key}/${city}`}
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-text-secondary hover:text-white hover:border-primary transition-colors text-sm flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 shrink-0 text-primary" />
                    {name}
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-primary/10 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl text-white mb-4">
              JOIN {cityName.toUpperCase()}&apos;S {sportName.toUpperCase()} COMMUNITY
            </h2>
            <p className="text-text-secondary mb-8">
              Create your free account and start connecting with {sportName.toLowerCase()} athletes in {cityName} today.
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
