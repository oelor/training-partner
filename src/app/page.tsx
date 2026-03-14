'use client'

import { useState, useEffect } from 'react'
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
  CheckCircle,
  ArrowRight,
  Crown,
  Heart
} from 'lucide-react'
import {
  WrestlerSilhouette,
  BJJGuardSilhouette,
  MuayThaiKickSilhouette,
  BoxerSilhouette,
  JudoThrowSilhouette,
  MMAFighterSilhouette
} from '@/components/silhouettes'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('tp_token'))
  }, [])

  return (
    <div className="min-h-screen bg-background bg-pattern">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading text-2xl text-white">TRAINING PARTNER</span>
            </Link>

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
              {isLoggedIn ? (
                <Link
                  href="/app"
                  className="bg-primary text-white px-5 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors btn-glow"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
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
                </>
              )}
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-t border-border">
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-text-secondary hover:text-primary">
                Features
              </Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-text-secondary hover:text-primary">
                How It Works
              </Link>
              <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-text-secondary hover:text-primary">
                Pricing
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/app"
                  className="block bg-primary text-white px-5 py-2 rounded-md font-medium text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin" className="block text-text-secondary hover:text-primary">
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block bg-primary text-white px-5 py-2 rounded-md font-medium text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #FF4D00 10px, #FF4D00 20px)',
          }} />
        </div>
        {/* Decorative silhouettes */}
        <WrestlerSilhouette className="silhouette hidden md:block absolute left-4 lg:left-12 top-32 w-72 lg:w-80 text-primary opacity-[0.06] z-0 -rotate-6" />
        <BJJGuardSilhouette className="silhouette hidden md:block absolute right-4 lg:right-12 top-48 w-64 lg:w-80 text-primary opacity-[0.06] z-0 rotate-6" />
        <div className="max-w-7xl mx-auto relative z-10">
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

            {/* Hero Visual — abstract match visualization (no fake profiles) */}
            <div className="mt-16 animate-slide-up delay-400 relative max-w-3xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-heading text-sm text-white">SMART MATCHING</span>
                  </div>
                  <span className="text-accent font-mono text-xs font-bold">LIVE</span>
                </div>
                {/* Abstract matching visualization */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { sport: 'BJJ', level: 'Purple Belt', match: 94, color: 'primary' },
                    { sport: 'Wrestling', level: 'Advanced', match: 91, color: 'accent' },
                    { sport: 'MMA', level: 'Intermediate', match: 87, color: 'primary' },
                  ].map((p, i) => (
                    <div key={i} className="bg-background rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-accent font-mono text-sm font-bold">{p.match}%</span>
                      </div>
                      <div className="text-white text-sm font-medium">{p.sport}</div>
                      <div className="text-text-secondary text-xs">{p.level} · Near you</div>
                      {/* Match bar */}
                      <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${p.match}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface relative overflow-hidden">
        <MuayThaiKickSilhouette className="silhouette hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] text-white opacity-[0.04] z-0" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              WHY ATHLETES <span className="gradient-text">CHOOSE US</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              We make finding the right training partner and gym space effortless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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

            <div className="bg-background p-8 rounded-xl border border-border card-hover">
              <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-2xl text-white mb-3">VERIFIED ATHLETES</h3>
              <p className="text-text-secondary">
                Every profile is verified. Train with confidence knowing everyone on the platform
                is serious about their craft.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — 3 bold steps */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              HOW IT <span className="gradient-text">WORKS</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Get matched with your perfect training partner in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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

      {/* Supported Sports */}
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
              'Sambo', 'Muay Thai', 'Capoeira', 'Kung Fu'
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

      {/* Pricing Section — detailed tiers */}
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
                  { text: 'Everything in Free', icon: 'heart' },
                  { text: 'Verified badge (ID verification)', icon: 'shield' },
                  { text: 'Ad-free experience', icon: 'check' },
                  { text: 'Boosted profile in search', icon: 'check' },
                  { text: 'Secure encrypted messaging', icon: 'check' },
                  { text: 'Priority matching algorithm', icon: 'check' },
                  { text: 'Discounts on clinics & events', icon: 'check' },
                  { text: 'Advanced filters (distance, age, etc.)', icon: 'check' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                    {item.icon === 'heart' ? <Heart className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" /> :
                     item.icon === 'shield' ? <Shield className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" /> :
                     <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />}
                    {item.text}
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
                  { text: 'Everything in Free (gym)', icon: 'crown' },
                  { text: 'Promoted listing in search', icon: 'check' },
                  { text: 'Upload insurance & certifications', icon: 'check' },
                  { text: 'Sell private lessons on platform', icon: 'check' },
                  { text: 'Advanced analytics dashboard', icon: 'check' },
                  { text: 'Featured gym badge', icon: 'check' },
                  { text: 'Priority support', icon: 'check' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                    {item.icon === 'crown' ? <Crown className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> :
                     <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />}
                    {item.text}
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

      {/* Built For Athletes — Visual showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <JudoThrowSilhouette className="silhouette hidden md:block absolute left-4 lg:left-12 top-1/3 w-72 lg:w-80 text-primary opacity-[0.05] z-0 -rotate-3" />
        <BoxerSilhouette className="silhouette hidden md:block absolute right-4 lg:right-12 top-1/4 w-64 lg:w-72 text-primary opacity-[0.05] z-0 rotate-3" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              BUILT FOR <span className="gradient-text">ATHLETES</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              We&apos;re building the platform we wish existed — by combat sports athletes, for combat sports athletes.
            </p>
          </div>

          {/* Gym showcase — gradient with grid pattern */}
          <div className="relative rounded-2xl overflow-hidden mb-12 group bg-gradient-to-br from-primary/20 via-background to-accent/10 border border-border h-[400px]">
            {/* Accent shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(90deg, #FF4D00 1px, transparent 1px), linear-gradient(#FF4D00 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            {/* Gradient overlay from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            {/* Content positioned at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="font-heading text-3xl text-white mb-2">TRAIN AT THE BEST GYMS</h3>
              <p className="text-text-secondary max-w-lg">
                Discover local gyms, check open mat schedules, and access exclusive training sessions — all in one place.
              </p>
            </div>
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

      {/* CTA Section with app mockup */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-surface overflow-hidden">
        <MMAFighterSilhouette className="silhouette hidden md:block absolute left-1/4 top-1/2 -translate-y-1/2 w-80 lg:w-96 text-white opacity-[0.04] z-0" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* App mockup — CSS phone */}
            <div className="relative mx-auto md:mx-0 max-w-[280px] md:max-w-[320px]">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/20 border-8 border-gray-900 bg-black aspect-[9/16]">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20" />

                <div className="w-full h-full bg-gradient-to-b from-background to-surface p-4 flex flex-col">
                  <div className="flex justify-between items-center text-white text-xs mb-4 mt-2">
                    <span>9:41</span>
                    <span>📶</span>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-heading text-white text-sm">TRAINING PARTNER</h3>
                    <p className="text-text-secondary text-xs">Your matches</p>
                  </div>

                  <div className="space-y-2 flex-1">
                    {[
                      { sport: 'BJJ', level: 'Purple Belt', pct: 94 },
                      { sport: 'Wrestling', level: 'Advanced', pct: 91 },
                      { sport: 'MMA', level: 'Blue Belt', pct: 87 },
                    ].map((m, i) => (
                      <div key={i} className="bg-surface border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <Target className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-accent text-xs font-mono">{m.pct}%</span>
                        </div>
                        <div className="text-white text-xs font-medium">{m.sport}</div>
                        <div className="text-text-secondary text-xs">{m.level} · Nearby</div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-primary text-white py-2 rounded-lg font-heading text-xs mt-4">
                    CONNECT
                  </button>
                </div>
              </div>
              <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-3xl -z-10" />
            </div>

            {/* CTA content */}
            <div className="text-center md:text-left">
              <h2 className="font-heading text-4xl sm:text-5xl text-white mb-6">
                READY TO FIND YOUR <span className="gradient-text">TRAINING PARTNER</span>?
              </h2>
              <p className="text-text-secondary text-lg mb-10">
                Sign up free and start finding training partners today. Available on web and mobile.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/auth/signup"
                  className="inline-block bg-primary text-white px-10 py-4 rounded-md font-heading text-xl hover:bg-primary/90 transition-all btn-glow hover:scale-105 text-center"
                >
                  START TRAINING NOW
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 text-text-secondary hover:text-white transition-colors px-6 py-4"
                >
                  Learn More <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
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
              <h4 className="font-heading text-lg text-white mb-4">SPORTS</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><Link href="/partners/wrestling" className="hover:text-primary">Wrestling Partners</Link></li>
                <li><Link href="/partners/mma" className="hover:text-primary">MMA Partners</Link></li>
                <li><Link href="/partners/bjj" className="hover:text-primary">BJJ Partners</Link></li>
                <li><Link href="/partners/muay-thai" className="hover:text-primary">Muay Thai Partners</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-lg text-white mb-4">LEGAL</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-text-secondary text-sm">
            &copy; 2026 Training Partner. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
