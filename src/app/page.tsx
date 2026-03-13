'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  MapPin,
  Shield,
  Zap,
  ChevronRight,
  Menu,
  X,
  Target,
  Clock,
  Heart,
  CheckCircle,
  ArrowRight,
  Crown
} from 'lucide-react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background bg-pattern">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading text-2xl text-white">TRAINING PARTNER</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-text-secondary hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-text-secondary hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="text-text-secondary hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link 
                href="/auth/signin" 
                className="text-text-secondary hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-primary text-white px-5 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors btn-glow"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-t border-border">
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block text-text-secondary hover:text-primary">
                Features
              </Link>
              <Link href="#how-it-works" className="block text-text-secondary hover:text-primary">
                How It Works
              </Link>
              <Link href="#pricing" className="block text-text-secondary hover:text-primary">
                Pricing
              </Link>
              <Link href="/auth/signin" className="block text-text-secondary hover:text-primary">
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="block bg-primary text-white px-5 py-2 rounded-md font-medium text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-border mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm text-text-secondary">Find your perfect training match</span>
            </div>
            
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white mb-6 animate-slide-up">
              NEVER TRAIN <span className="gradient-text">ALONE</span> AGAIN
            </h1>
            
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
              Connect with compatible training partners based on skill level, weight class, 
              and training goals. Plus access exclusive open mat hours at partner gyms.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
              <Link 
                href="/auth/signup" 
                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-md font-heading text-xl hover:bg-primary/90 transition-all btn-glow hover:scale-105"
              >
                START TRAINING FREE
              </Link>
              <Link 
                href="#how-it-works" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-text-secondary hover:text-white transition-colors px-8 py-4"
              >
                See How It Works <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto animate-slide-up delay-300">
              <div>
                <div className="font-heading text-3xl sm:text-4xl text-primary">FREE</div>
                <div className="text-text-secondary text-sm">To Get Started</div>
              </div>
              <div>
                <div className="font-heading text-3xl sm:text-4xl text-primary">BJJ</div>
                <div className="text-text-secondary text-sm">Wrestling · MMA</div>
              </div>
              <div>
                <div className="font-heading text-3xl sm:text-4xl text-primary">24/7</div>
                <div className="text-text-secondary text-sm">Find Partners</div>
              </div>
            </div>

            {/* Hero Visual - App Preview */}
            <div className="mt-16 animate-slide-up delay-400 relative max-w-3xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl shadow-primary/10">
                {/* App preview header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-heading text-sm text-white">YOUR MATCHES</span>
                  </div>
                  <span className="text-text-secondary text-xs">Preview</span>
                </div>
                {/* Example match cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Alex R.', sport: 'BJJ', match: 94, skill: 'Purple Belt' },
                    { name: 'Jordan M.', sport: 'Wrestling', match: 91, skill: 'Advanced' },
                    { name: 'Sam K.', sport: 'MMA', match: 87, skill: 'Intermediate' },
                  ].map((p) => (
                    <div key={p.name} className="bg-background rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-accent font-mono text-sm font-bold">{p.match}%</span>
                      </div>
                      <div className="text-white text-sm font-medium">{p.name}</div>
                      <div className="text-text-secondary text-xs">{p.sport} · {p.skill}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              WHY ATHLETES <span className="gradient-text">CHOOSE US</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              We make finding the right training partner and gym space effortless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background p-8 rounded-xl border border-border card-hover">
              <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-2xl text-white mb-3">SMART MATCHING</h3>
              <p className="text-text-secondary">
                Our algorithm matches you with partners based on skill level, weight class, 
                experience, and training goals. Find someone who pushes you.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background p-8 rounded-xl border border-border card-hover">
              <div className="w-14 h-14 bg-accent/20 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-heading text-2xl text-white mb-3">LOCAL GYM ACCESS</h3>
              <p className="text-text-secondary">
                Get exclusive access to open mat hours at partner gyms. Train anywhere 
                with your subscription - we handle the logistics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background p-8 rounded-xl border border-border card-hover">
              <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-2xl text-white mb-3">VERIFIED & SAFE</h3>
              <p className="text-text-secondary">
                All partner gyms are vetted for safety and insurance. Train with 
                confidence knowing everyone is verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              HOW IT <span className="gradient-text">WORKS</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Get started in minutes - no complicated setup
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 font-heading text-3xl text-white">
                1
              </div>
              <h3 className="font-heading text-2xl text-white mb-3">CREATE PROFILE</h3>
              <p className="text-text-secondary">
                Sign up free and tell us about your sport, skill level, weight class, 
                and training goals.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 font-heading text-3xl text-white">
                2
              </div>
              <h3 className="font-heading text-2xl text-white mb-3">GET MATCHED</h3>
              <p className="text-text-secondary">
                Our algorithm finds compatible training partners in your area. 
                Connect and start training!
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 font-heading text-3xl text-white">
                3
              </div>
              <h3 className="font-heading text-2xl text-white mb-3">TRAIN TOGETHER</h3>
              <p className="text-text-secondary">
                Upgrade to access partner gyms with exclusive open mat hours. 
                Train anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              SUPPORTED <span className="gradient-text">SPORTS</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Wrestling', 'MMA', 'Brazilian Jiu-Jitsu', 'Boxing', 
              'Kickboxing', 'Judo', 'Taekwondo', 'Karate', 
              'Sambo', 'Muay Thai', 'Capoeira', 'Sifu'
            ].map((sport) => (
              <span 
                key={sport}
                className="px-6 py-3 bg-background border border-border rounded-full text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-default"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              SIMPLE <span className="gradient-text">PRICING</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready. Gyms list for free too.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-surface p-8 rounded-xl border border-border">
              <div className="mb-6">
                <h3 className="font-heading text-2xl text-white">FREE</h3>
                <p className="text-text-secondary text-sm mt-1">For athletes &amp; gyms</p>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Create your athlete profile',
                  'Find compatible training partners',
                  'Browse & book open mats',
                  'Direct messaging',
                  'Community posts & content',
                  'Gyms: claim & manage listing',
                  'Gyms: set open mat schedules',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full bg-surface border border-primary text-primary px-6 py-3 rounded-md font-medium text-center hover:bg-primary hover:text-white transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Premium Athlete */}
            <div className="bg-gradient-to-br from-primary/20 to-surface p-8 rounded-xl border border-primary relative">
              <div className="absolute top-0 right-0 bg-accent text-background px-4 py-1 rounded-bl-md rounded-tr-xl font-medium text-xs">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="font-heading text-2xl text-white">PREMIUM</h3>
                <p className="text-text-secondary text-sm mt-1">For serious athletes</p>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-white">$9.99</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'Verified badge (background check)',
                  'Ad-free experience',
                  'Boosted profile in search',
                  'Secure encrypted messaging',
                  'Priority matching algorithm',
                  'Discounts on clinics & events',
                  'Advanced filters (distance, age, etc.)',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                    {i === 0 ? <Heart className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" /> :
                     i === 1 ? <Shield className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" /> :
                     <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />}
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?plan=premium"
                className="block w-full bg-primary text-white px-6 py-3 rounded-md font-medium text-center hover:bg-primary/90 transition-colors btn-glow"
              >
                Get Premium
              </Link>
            </div>

            {/* Gym & Coach */}
            <div className="bg-surface p-8 rounded-xl border border-border relative">
              <div className="absolute top-0 right-0 bg-primary/80 text-white px-4 py-1 rounded-bl-md rounded-tr-xl font-medium text-xs">
                FOR GYMS
              </div>
              <div className="mb-6">
                <h3 className="font-heading text-2xl text-white">GYM PRO</h3>
                <p className="text-text-secondary text-sm mt-1">For gym owners &amp; coaches</p>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-white">$19.99</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free (gym)',
                  'Promoted listing in search',
                  'Upload insurance & certifications',
                  'Sell private lessons on platform',
                  'Advanced analytics dashboard',
                  'Featured gym badge',
                  'Priority support',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                    {i === 0 ? <Crown className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> :
                     <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />}
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?plan=gym"
                className="block w-full bg-surface border border-border text-white px-6 py-3 rounded-md font-medium text-center hover:border-primary hover:text-primary transition-colors"
              >
                Get Gym Pro
              </Link>
            </div>
          </div>

          <p className="text-center text-text-secondary text-sm mt-8">
            All plans come with a 7-day free trial. Cancel anytime. Powered by Stripe.
          </p>
        </div>
      </section>

      {/* Why Training Partner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              BUILT FOR <span className="gradient-text">ATHLETES</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              We&apos;re building the platform we wish existed — by combat sports athletes, for combat sports athletes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🤼',
                title: 'Skill-Based Matching',
                text: 'Get matched with training partners at your level. Filter by sport, weight class, skill, and location.',
              },
              {
                icon: '🏟️',
                title: 'Discover Local Gyms',
                text: 'Find gyms near you with schedules, class info, and open mat times — all in one place.',
              },
              {
                icon: '📱',
                title: 'Coordinate Training',
                text: 'Message partners, plan sessions, and build your training network effortlessly.',
              },
            ].map((t) => (
              <div key={t.title} className="bg-surface border border-border rounded-xl p-6 card-hover">
                <div className="text-4xl mb-4">{t.icon}</div>
                <h3 className="text-white font-heading text-lg mb-2">{t.title}</h3>
                <p className="text-text-secondary leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl sm:text-5xl text-white mb-6">
            READY TO FIND YOUR <span className="gradient-text">TRAINING PARTNER</span>?
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Sign up free and start finding training partners today
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-block bg-primary text-white px-10 py-4 rounded-md font-heading text-xl hover:bg-primary/90 transition-all btn-glow hover:scale-105"
          >
            START TRAINING NOW
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="font-heading text-xl text-white">TRAINING PARTNER</span>
              </div>
              <p className="text-text-secondary text-sm">
                Connecting athletes with their perfect training partners since 2026.
              </p>
            </div>
            
            <div>
              <h4 className="font-heading text-lg text-white mb-4">PLATFORM</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><Link href="/partners" className="hover:text-primary">Find Partners</Link></li>
                <li><Link href="#features" className="hover:text-primary">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary">How It Works</Link></li>
                <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-lg text-white mb-4">COMPANY</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><Link href="/contact" className="hover:text-primary">Contact & Support</Link></li>
                <li><Link href="/partners/wrestling" className="hover:text-primary">Wrestling</Link></li>
                <li><Link href="/partners/mma" className="hover:text-primary">MMA</Link></li>
                <li><Link href="/partners/bjj" className="hover:text-primary">BJJ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading text-lg text-white mb-4">LEGAL</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/waiver" className="hover:text-primary">Liability Waiver</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-text-secondary text-sm">
            © 2026 Training Partner. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
