import { Metadata } from 'next'
import Link from 'next/link'
import { Users, Mail, MessageCircle, Shield, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact & Support | Training Partner',
  description: 'Get help with your Training Partner account. Contact our support team for questions about training partners, gyms, subscriptions, and more.',
}

export default function ContactPage() {
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
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-4xl lg:text-5xl text-white mb-4 text-center">CONTACT & SUPPORT</h1>
          <p className="text-text-secondary text-lg text-center mb-12">
            Have a question or need help? We&apos;re here for you.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading text-lg text-white mb-2">EMAIL SUPPORT</h2>
              <p className="text-text-secondary text-sm mb-4">
                For general inquiries, account issues, or partnership opportunities.
              </p>
              <a
                href="mailto:support@trainingpartner.app"
                className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
              >
                support@trainingpartner.app
              </a>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-heading text-lg text-white mb-2">SAFETY & REPORTING</h2>
              <p className="text-text-secondary text-sm mb-4">
                Report harassment, safety concerns, or suspicious accounts.
              </p>
              <a
                href="mailto:safety@trainingpartner.app"
                className="text-accent hover:text-accent/80 font-medium text-sm transition-colors"
              >
                safety@trainingpartner.app
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-surface border border-border rounded-xl p-8">
            <h2 className="font-heading text-2xl text-white mb-8 text-center">FREQUENTLY ASKED QUESTIONS</h2>

            <div className="space-y-6">
              {[
                {
                  q: 'Is Training Partner free to use?',
                  a: 'Yes! Creating an account, building your profile, finding training partners, and messaging are all free. We offer an optional Premium plan with advanced features like unlimited matching and priority support.',
                },
                {
                  q: 'How does the matching algorithm work?',
                  a: 'We match you based on your sport, skill level, weight class, location, training goals, and availability. The more complete your profile, the better your matches.',
                },
                {
                  q: 'How do I report a user?',
                  a: 'You can report a user from their profile page using the flag icon, or email us at safety@trainingpartner.app. We review all reports within 24 hours.',
                },
                {
                  q: 'Can I use Training Partner in my city?',
                  a: 'Training Partner is available everywhere. If there aren\'t many partners in your area yet, creating your profile helps grow the local community.',
                },
                {
                  q: 'How do I delete my account?',
                  a: 'Go to Settings in the app and scroll to the Account section. You can request account deletion there, or email us at support@trainingpartner.app.',
                },
                {
                  q: 'I forgot my password. How do I reset it?',
                  a: 'Click "Forgot Password" on the sign-in page. We\'ll send a reset link to your email address.',
                },
              ].map((faq, i) => (
                <div key={i} className="border-b border-border pb-6 last:border-0 last:pb-0">
                  <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                  <p className="text-text-secondary text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Response time */}
          <div className="mt-8 flex items-center justify-center gap-2 text-text-secondary text-sm">
            <Clock className="w-4 h-4" />
            <span>We typically respond within 24 hours</span>
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
