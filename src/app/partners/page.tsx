import { Metadata } from 'next'
import Link from 'next/link'
import { Users, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Find Training Partners by Sport | Training Partner',
  description: 'Find combat sports training partners near you. Browse by sport — Wrestling, MMA, BJJ, Boxing, Kickboxing, Muay Thai, Judo, Karate, and Sambo.',
}

const sports = [
  { slug: 'wrestling', name: 'Wrestling', desc: 'Freestyle, Greco-Roman, and Folkstyle partners' },
  { slug: 'mma', name: 'MMA', desc: 'Mixed martial arts sparring and drilling partners' },
  { slug: 'bjj', name: 'BJJ', desc: 'Brazilian Jiu-Jitsu rolling and drilling partners' },
  { slug: 'boxing', name: 'Boxing', desc: 'Sparring, pad work, and training partners' },
  { slug: 'kickboxing', name: 'Kickboxing', desc: 'Dutch, K-1, and cardio kickboxing partners' },
  { slug: 'muay-thai', name: 'Muay Thai', desc: 'Thai boxing clinch and sparring partners' },
  { slug: 'judo', name: 'Judo', desc: 'Randori, uchikomi, and competition partners' },
  { slug: 'karate', name: 'Karate', desc: 'Kumite, kata, and point fighting partners' },
  { slug: 'sambo', name: 'Sambo', desc: 'Combat and sport Sambo training partners' },
]

export default function PartnersIndexPage() {
  return (
    <div className="min-h-screen bg-background">
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

      <main className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl lg:text-5xl text-white mb-4 text-center">
            FIND TRAINING PARTNERS BY SPORT
          </h1>
          <p className="text-text-secondary text-lg text-center mb-12 max-w-2xl mx-auto">
            Choose your combat sport to find training partners near you. All skill levels welcome.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sports.map(sport => (
              <Link
                key={sport.slug}
                href={`/partners/${sport.slug}`}
                className="group bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors"
              >
                <h2 className="font-heading text-xl text-white mb-2 group-hover:text-primary transition-colors">
                  {sport.name.toUpperCase()}
                </h2>
                <p className="text-text-secondary text-sm mb-4">{sport.desc}</p>
                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                  Browse Partners <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
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
