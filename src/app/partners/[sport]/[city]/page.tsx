import { Metadata } from 'next'
import Link from 'next/link'
import { Users, MapPin, ArrowRight, Shield, Star, Zap, ChevronRight, HelpCircle } from 'lucide-react'

const sportsMap: Record<string, string> = {
  wrestling: 'Wrestling', mma: 'MMA', bjj: 'BJJ', boxing: 'Boxing',
  kickboxing: 'Kickboxing', 'muay-thai': 'Muay Thai', judo: 'Judo',
  karate: 'Karate', sambo: 'Sambo',
}

const relatedSports: Record<string, string[]> = {
  wrestling: ['bjj', 'mma', 'judo', 'sambo'],
  mma: ['bjj', 'boxing', 'wrestling', 'muay-thai'],
  bjj: ['wrestling', 'judo', 'mma', 'sambo'],
  boxing: ['mma', 'kickboxing', 'muay-thai'],
  kickboxing: ['boxing', 'muay-thai', 'mma', 'karate'],
  'muay-thai': ['kickboxing', 'boxing', 'mma'],
  judo: ['wrestling', 'bjj', 'sambo'],
  karate: ['kickboxing', 'mma', 'judo'],
  sambo: ['wrestling', 'bjj', 'judo', 'mma'],
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

interface SportCityContent {
  trainingGuide: string[]
  gymExpectations: string
  safetyTips: string[]
  faqs: { question: string; answer: string }[]
}

function getSportCityContent(sportName: string, cityName: string): SportCityContent {
  const sportLower = sportName.toLowerCase()
  return {
    trainingGuide: [
      `${cityName} has a thriving ${sportLower} scene with gyms, training groups, and open mat sessions spread across the city. Whether you are a complete beginner looking to learn the fundamentals or an experienced competitor preparing for your next tournament, finding the right training partner in ${cityName} can transform your progress. The key is connecting with athletes who match your skill level, weight class, and training intensity preferences so every session is productive and safe.`,
      `Training ${sportLower} in ${cityName} offers unique advantages. The city's diverse athletic community means you can find partners from a wide range of backgrounds and skill levels. Many ${cityName} gyms host regular open mat sessions, drop-in classes, and sparring nights that are perfect for meeting potential training partners. However, relying solely on gym class schedules limits your training opportunities — having dedicated partners you can coordinate with outside of regular class times is what separates athletes who plateau from those who keep improving.`,
      `The ${sportLower} community in ${cityName} tends to be welcoming to newcomers, but finding compatible training partners through word of mouth alone can take months. Training Partner speeds up this process by matching you with ${sportLower} athletes in ${cityName} based on your specific criteria: weight class, experience level, preferred training schedule, and goals. Whether you need a drilling partner for technique work, a sparring partner who matches your intensity, or a training group for competition preparation, the platform connects you with the right people faster than showing up to open mats and hoping for the best.`,
      `Before your first session with a new ${sportLower} training partner in ${cityName}, communicate clearly about expectations. Discuss intensity levels, any injuries or limitations, what techniques or positions you want to work on, and how long you plan to train. This upfront conversation prevents misunderstandings and ensures both partners get value from the session. Many successful training partnerships in ${cityName} start with a light technical session before progressing to higher-intensity work as trust and familiarity develop.`,
    ],
    gymExpectations: `When visiting a ${sportLower} gym in ${cityName} for the first time, arrive early to introduce yourself to the coach or gym owner. Most gyms require you to sign a waiver before training. Bring your own gear — at minimum a mouthguard, appropriate training attire, and water. Many ${cityName} gyms offer a free trial class, which is a great opportunity to assess the training environment, meet potential partners, and see if the gym culture matches your style. Pay attention to how experienced students treat beginners — this tells you a lot about the gym's culture and whether it is a good place to find long-term training partners.`,
    safetyTips: [
      `Always warm up properly before ${sportLower} training sessions. Cold muscles and joints are significantly more prone to injury, especially in a contact sport.`,
      `Communicate your intensity preference before every round or session. What feels like "light" to one person might be "hard" to another — be explicit about percentages and expectations.`,
      `Never train through sharp pain. Dull muscle soreness is normal, but sharp or sudden pain in joints, neck, or spine means you should stop immediately and assess.`,
      `Train with a mouthguard at all times during live ${sportLower} training. Dental injuries are expensive and entirely preventable with proper equipment.`,
      `Know the tap rules and respect them absolutely. In ${sportLower}, tapping means stop — immediately, every time, with no exceptions regardless of position or timing.`,
    ],
    faqs: [
      {
        question: `How do I find ${sportLower} training partners in ${cityName}?`,
        answer: `The fastest way to find ${sportLower} training partners in ${cityName} is to create a free profile on Training Partner. Set your sport to ${sportName}, add your skill level and weight class, and the matching algorithm will show you compatible athletes in ${cityName}. You can also visit local ${sportLower} gyms for open mat sessions and drop-in classes, but Training Partner lets you connect with athletes across all gyms in ${cityName} rather than being limited to one location.`,
      },
      {
        question: `What skill level do I need to start training ${sportLower} in ${cityName}?`,
        answer: `You can start training ${sportLower} in ${cityName} at any skill level — complete beginners are welcome at most gyms and on Training Partner. When creating your profile, honestly list your experience level so you get matched with appropriate partners. Many experienced ${sportLower} athletes in ${cityName} enjoy working with motivated beginners because it helps them refine their fundamentals. The most important thing is showing up consistently and being a good training partner: respectful, communicative about intensity, and willing to learn.`,
      },
      {
        question: `Is Training Partner free to use in ${cityName}?`,
        answer: `Yes, Training Partner is completely free to join and use for finding ${sportLower} training partners in ${cityName}. You can create a profile, browse matches, message potential partners, and coordinate training sessions at no cost. Premium features like verified badges, boosted profiles, and advanced filters are available for athletes who want to upgrade, but the core matching and messaging functionality is free forever.`,
      },
      {
        question: `What should I bring to my first ${sportLower} training session in ${cityName}?`,
        answer: `For your first ${sportLower} training session in ${cityName}, bring: a mouthguard (essential for any contact sport), appropriate training attire for ${sportName} (ask your training partner or gym what is standard), a water bottle, a towel, and any sport-specific gear you own. If you are unsure about equipment requirements, message your training partner through the app before the session — they can tell you exactly what you need and may even have spare gear you can borrow for your first session.`,
      },
    ],
  }
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
    description: `Find ${sportName.toLowerCase()} training partners and sparring buddies in ${cityName}. Connect with local athletes at your skill level for sparring, drilling, and competition prep. Free to join.`,
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

  const content = sportName ? getSportCityContent(sportName, cityName) : null

  const faqSchema = content ? {
    '@type': 'FAQPage',
    mainEntity: content.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null

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
      ...(faqSchema ? [faqSchema] : []),
    ],
  } : null

  const related = relatedSports[sport] || []
  const nearbyCities = popularCities.filter(c => c !== city).slice(0, 8)

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
          // Safe: jsonLd is built from controlled constants, not user input
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

        {/* Training Guide - Rich SEO Content */}
        {content && (
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl text-white mb-8">
                YOUR GUIDE TO TRAINING {sportName.toUpperCase()} IN {cityName.toUpperCase()}
              </h2>
              <div className="space-y-4">
                {content.trainingGuide.map((paragraph, i) => (
                  <p key={i} className="text-text-secondary leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gym Expectations */}
        {content && (
          <section className="py-16 px-6 bg-surface border-y border-border">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl text-white mb-8">
                WHAT TO EXPECT AT {sportName.toUpperCase()} GYMS IN {cityName.toUpperCase()}
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                {content.gymExpectations}
              </p>

              <h3 className="font-heading text-xl text-white mb-6">SAFETY TIPS FOR {sportName.toUpperCase()} TRAINING</h3>
              <ul className="space-y-4">
                {content.safetyTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* FAQs */}
        {content && (
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl text-white mb-8 text-center">
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <div className="space-y-6">
                {content.faqs.map((faq, i) => (
                  <div key={i} className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="flex items-start gap-3 text-white font-medium mb-3">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-text-secondary leading-relaxed pl-8">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Sports */}
        {related.length > 0 && (
          <section className="py-16 px-6 bg-surface border-y border-border">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl text-white mb-8 text-center">
                RELATED SPORTS IN {cityName.toUpperCase()}
              </h2>
              <p className="text-text-secondary text-center mb-8">
                Many {sportName.toLowerCase()} athletes also cross-train in these complementary sports. Find training partners for multiple disciplines in {cityName}.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {related.map(key => (
                  <Link
                    key={key}
                    href={`/partners/${key}/${city}`}
                    className="bg-background border border-border rounded-lg px-4 py-3 text-text-secondary hover:text-white hover:border-primary transition-colors text-sm flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 shrink-0 text-primary" />
                    {sportsMap[key]} in {cityName}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other sports in this city */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl text-white mb-8 text-center">
              ALL SPORTS IN {cityName.toUpperCase()}
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

        {/* Nearby Cities */}
        <section className="py-16 px-6 bg-surface border-y border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl text-white mb-8 text-center">
              FIND {sportName.toUpperCase()} PARTNERS IN OTHER CITIES
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {nearbyCities.map(c => (
                <Link
                  key={c}
                  href={`/partners/${sport}/${c}`}
                  className="bg-background border border-border rounded-lg px-4 py-3 text-text-secondary hover:text-white hover:border-primary transition-colors text-sm flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  {citySlugToName(c)}
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
