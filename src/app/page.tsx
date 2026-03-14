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
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Hero background pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #FF4D00 10px, #FF4D00 20px)',
          }} />
        </div>
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
              <h3 className="font-heading text-2xl text-white mb-3">VERIFIED ATHLETES</h3>
              <p className="text-text-secondary">
                Every profile is verified. Train with confidence knowing everyone on the platform 
                is serious about their craft.
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
              Get matched with your perfect training partner in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your profile with your combat sport, skill level, and goals.' },
              { step: '2', title: 'Get Matched', desc: 'Our algorithm finds compatible training partners near you.' },
              { step: '3', title: 'Connect', desc: 'Message partners, coordinate sessions, and build your network.' },
              { step: '4', title: 'Train', desc: 'Start training with verified partners at gyms worldwide.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-surface border border-border rounded-xl p-6 text-center card-hover">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-heading text-lg mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-heading text-xl text-white mb-2">{item.title}</h3>
                  <p className="text-text-secondary text-sm">{item.desc}</p>
                </div>
                {/* Connector line */}
                {item.step !== '4' && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              SIMPLE <span className="gradient-text">PRICING</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Start free. Upgrade when you're ready for premium features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-background border border-border rounded-xl p-8">
              <h3 className="font-heading text-2xl text-white mb-2">FREE</h3>
              <p className="text-text-secondary mb-6">Forever free</p>
              <div className="text-4xl font-heading text-primary mb-6">$0<span className="text-lg text-text-secondary">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Find training partners</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Browse gyms</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Send messages</span>
                </li>
              </ul>
              <Link 
                href="/auth/signup"
                className="w-full bg-border text-white px-6 py-3 rounded-md font-heading text-center hover:bg-border/80 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan (Featured) */}
            <div className="bg-gradient-to-br from-primary/20 to-accent/10 border-2 border-primary rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-heading">
                MOST POPULAR
              </div>
              <h3 className="font-heading text-2xl text-white mb-2">PRO</h3>
              <p className="text-text-secondary mb-6">For serious athletes</p>
              <div className="text-4xl font-heading text-primary mb-6">$9.99<span className="text-lg text-text-secondary">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Gym access pass</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Priority matching</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Advanced filters</span>
                </li>
              </ul>
              <Link 
                href="/auth/signup"
                className="w-full bg-primary text-white px-6 py-3 rounded-md font-heading text-center hover:bg-primary/90 transition-colors btn-glow"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Elite Plan */}
            <div className="bg-background border border-border rounded-xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="font-heading text-2xl text-white">ELITE</h3>
              </div>
              <p className="text-text-secondary mb-6">For competitors</p>
              <div className="text-4xl font-heading text-primary mb-6">$19.99<span className="text-lg text-text-secondary">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Unlimited gym access</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Training analytics</span>
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link 
                href="/auth/signup"
                className="w-full bg-primary text-white px-6 py-3 rounded-md font-heading text-center hover:bg-primary/90 transition-colors btn-glow"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center text-text-secondary text-sm mt-8">
            All plans come with a 7-day free trial. Cancel anytime. Powered by Stripe.
          </p>
        </div>
      </section>

      {/* Why Training Partner — Visual showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              BUILT FOR <span className="gradient-text">ATHLETES</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              We're building the platform we wish existed — by combat sports athletes, for combat sports athletes.
            </p>
          </div>

          {/* Gym showcase with CSS visual */}
          <div className="relative rounded-2xl overflow-hidden mb-12 group bg-gradient-to-br from-primary/20 via-background to-accent/10 border border-border p-12 h-[400px] flex flex-col justify-between">
            {/* Accent shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(90deg, #FF4D00 1px, transparent 1px), linear-gradient(#FF4D00 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
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
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* App mockup - CSS-based phone */}
            <div className="relative mx-auto md:mx-0 max-w-[280px] md:max-w-[320px]">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/20 border-8 border-gray-900 bg-black aspect-[9/16]">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20" />
                
                {/* Phone screen content */}
                <div className="w-full h-full bg-gradient-to-b from-background to-surface p-4 flex flex-col">
                  {/* Status bar */}
                  <div className="flex justify-between items-center text-white text-xs mb-4 mt-2">
                    <span>9:41</span>
                    <span>📶</span>
                  </div>
                  
                  {/* App header */}
                  <div className="mb-4">
                    <h3 className="font-heading text-white text-sm">TRAINING PARTNER</h3>
                    <p className="text-text-secondary text-xs">Your matches</p>
                  </div>
                  
                  {/* Match cards */}
                  <div className="space-y-2 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-surface border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold">A</div>
                          <span className="text-accent text-xs font-mono">92%</span>
                        </div>
                        <div className="text-white text-xs font-medium">Partner {i}</div>
                        <div className="text-text-secondary text-xs">BJJ · Purple</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA button */}
                  <button className="w-full bg-primary text-white py-2 rounded-lg font-heading text-xs mt-4 hover:bg-primary/90">
                    CONNECT
                  </button>
                </div>
              </div>
              {/* Glow effect behind phone */}
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
                <li><Link href="/terms" className="hover:text-primary">Liability Waiver</Link></li>
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
