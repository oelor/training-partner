import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Users, Calendar, Clock, ChevronRight, ChevronLeft, Shield, BookOpen } from 'lucide-react'
import { getAllPosts, getPostBySlug, type BlogPost } from '@/lib/blog'

const SITE_URL = 'https://trainingpartner.app'

const sportColors: Record<string, string> = {
  BJJ: 'bg-blue-500/20 text-blue-400',
  MMA: 'bg-red-500/20 text-red-400',
  Wrestling: 'bg-yellow-500/20 text-yellow-400',
  Boxing: 'bg-green-500/20 text-green-400',
  General: 'bg-purple-500/20 text-purple-400',
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Article Not Found' }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      siteName: 'Training Partner',
      url: `${SITE_URL}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Parse markdown-like content into sections for table of contents and rendering */
function parseContent(content: string) {
  const lines = content.split('\n')
  const sections: { id: string; title: string; level: number; content: string[] }[] = []
  let currentSection: { id: string; title: string; level: number; content: string[] } | null = null

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/)
    const h3Match = line.match(/^### (.+)$/)

    if (h2Match) {
      if (currentSection) sections.push(currentSection)
      const title = h2Match[1]
      currentSection = {
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        title,
        level: 2,
        content: [],
      }
    } else if (h3Match) {
      if (currentSection) sections.push(currentSection)
      const title = h3Match[1]
      currentSection = {
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        title,
        level: 3,
        content: [],
      }
    } else if (currentSection) {
      currentSection.content.push(line)
    }
  }
  if (currentSection) sections.push(currentSection)
  return sections
}

/** Render a paragraph, converting internal paths to clickable links */
function renderParagraph(text: string, index: number) {
  const linkRegex = /(\/(?:partners\/(?:bjj|mma|wrestling|boxing)|blog\/[a-z0-9-]+|gyms|auth\/signup))/g
  const parts = text.split(linkRegex)

  if (parts.length === 1) {
    return <p key={index} className="text-text-secondary leading-relaxed mb-4">{text}</p>
  }

  return (
    <p key={index} className="text-text-secondary leading-relaxed mb-4">
      {parts.map((part, i) => {
        if (part.match(linkRegex)) {
          const label = part
            .replace('/partners/', '')
            .replace('/blog/', '')
            .replace('/auth/signup', 'sign up')
            .replace('/gyms', 'gyms')
            .replace(/-/g, ' ')
          return (
            <Link key={i} href={part} className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors">
              {label}
            </Link>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

function getRelatedPosts(currentSlug: string, currentSport: string): BlogPost[] {
  const allPosts = getAllPosts()
  const sameSport = allPosts.filter(p => p.slug !== currentSlug && p.sport === currentSport)
  const others = allPosts.filter(p => p.slug !== currentSlug && p.sport !== currentSport)
  return [...sameSport, ...others].slice(0, 3)
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const sections = parseContent(post.content)
  const tocItems = sections.filter(s => s.level === 2)
  const relatedPosts = getRelatedPosts(post.slug, post.sport)

  /* Structured data built entirely from static blog content - safe for inline script */
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Training Partner',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.sport,
    wordCount: post.content.split(/\s+/).length,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  }

  const jsonLdScript = JSON.stringify([articleJsonLd, breadcrumbJsonLd])

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript }}
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

      <main className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white truncate max-w-[200px] sm:max-w-none">{post.title}</span>
          </nav>

          {/* Article */}
          <article>
            <header className="mb-10 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sportColors[post.sport] || sportColors.General}`}>
                  {post.sport}
                </span>
                <span className="text-text-secondary text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-6 leading-tight">
                {post.title.toUpperCase()}
              </h1>

              <p className="text-text-secondary text-lg mb-6">{post.description}</p>

              <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{post.author}</p>
                    <p className="text-text-secondary text-xs">{post.authorTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-text-secondary text-sm">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
              </div>

              {/* Reviewed badge */}
              <div className="mt-4 inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" />
                Reviewed by experienced martial artists
              </div>
            </header>

            {/* Table of Contents */}
            {tocItems.length > 2 && (
              <nav className="bg-surface border border-border rounded-xl p-6 mb-10">
                <h2 className="font-heading text-lg text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  TABLE OF CONTENTS
                </h2>
                <ol className="space-y-2">
                  {tocItems.map((item, i) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-text-secondary hover:text-primary text-sm transition-colors flex items-center gap-2"
                      >
                        <span className="text-primary/60 font-mono text-xs w-5">{i + 1}.</span>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Article Body */}
            <div>
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="mb-8 scroll-mt-24">
                  {section.level === 2 ? (
                    <h2 className="font-heading text-2xl text-white mb-4 mt-10 first:mt-0">
                      {section.title.toUpperCase()}
                    </h2>
                  ) : (
                    <h3 className="font-heading text-xl text-white mb-3 mt-6">
                      {section.title.toUpperCase()}
                    </h3>
                  )}
                  {section.content
                    .join('\n')
                    .split('\n\n')
                    .filter(p => p.trim())
                    .map((paragraph, pIndex) => renderParagraph(paragraph.trim(), pIndex))}
                </section>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
              {post.tags.map(tag => (
                <span key={tag} className="bg-surface border border-border text-text-secondary text-xs px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </article>

          {/* CTA Banner */}
          <div className="mt-12 bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30 rounded-xl p-8 text-center">
            <h2 className="font-heading text-2xl text-white mb-3">FIND YOUR PERFECT TRAINING PARTNER</h2>
            <p className="text-text-secondary mb-6 max-w-lg mx-auto">
              Get matched with compatible training partners based on your sport, skill level, weight class, and location. Free to join.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors btn-glow"
            >
              Sign Up Free
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-heading text-2xl text-white mb-6">RELATED ARTICLES</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(related => (
                  <Link key={related.slug} href={`/blog/${related.slug}`} className="group block">
                    <div className="bg-surface border border-border rounded-xl p-5 card-hover h-full flex flex-col">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full self-start mb-3 ${sportColors[related.sport] || sportColors.General}`}>
                        {related.sport}
                      </span>
                      <h3 className="font-heading text-base text-white mb-2 group-hover:text-primary transition-colors leading-tight">
                        {related.title.toUpperCase()}
                      </h3>
                      <p className="text-text-secondary text-xs mb-3 flex-grow line-clamp-2">
                        {related.description}
                      </p>
                      <div className="flex items-center gap-1 text-text-secondary text-xs">
                        <Clock className="w-3 h-3" />
                        {related.readTime}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to all articles
            </Link>
          </div>
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
