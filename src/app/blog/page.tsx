import { Metadata } from 'next'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { getAllPosts } from '@/lib/blog'
import BlogContent from './blog-content'

export const metadata: Metadata = {
  title: 'Combat Sports Training Blog | Training Partner',
  description: 'Expert guides on finding training partners, open mat etiquette, sparring safety, and choosing the right gym for BJJ, MMA, wrestling, and boxing.',
  alternates: {
    canonical: 'https://trainingpartner.app/blog',
  },
  openGraph: {
    title: 'Combat Sports Training Blog | Training Partner',
    description: 'Expert guides on finding training partners, sparring safety, and gym etiquette for combat sports.',
    type: 'website',
    url: 'https://trainingpartner.app/blog',
    siteName: 'Training Partner',
  },
}

export default function BlogPage() {
  const allPosts = getAllPosts()

  /* Structured data built from static blog content - safe for inline rendering */
  const blogListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Combat Sports Training Blog',
    description: 'Expert guides on finding training partners, open mat etiquette, sparring safety, and choosing the right gym for BJJ, MMA, wrestling, and boxing.',
    url: 'https://trainingpartner.app/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Training Partner',
      url: 'https://trainingpartner.app',
    },
    blogPost: allPosts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: {
        '@type': 'Organization',
        name: post.author,
      },
      url: `https://trainingpartner.app/blog/${post.slug}`,
    })),
  }

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-xl text-white">TRAINING PARTNER</span>
          </Link>
          <Link href="/auth/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors btn-glow">
            Sign Up Free
          </Link>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <BlogContent />
        </div>
      </main>

      {/* Footer */}
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
