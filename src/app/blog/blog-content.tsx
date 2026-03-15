'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, Clock, Tag, BookOpen, ChevronRight } from 'lucide-react'
import { getAllPosts, type BlogPost } from '@/lib/blog'

const SPORT_TABS = ['All', 'BJJ', 'MMA', 'Wrestling', 'Boxing', 'General'] as const

const sportColors: Record<string, string> = {
  BJJ: 'bg-blue-500/20 text-blue-400',
  MMA: 'bg-red-500/20 text-red-400',
  Wrestling: 'bg-yellow-500/20 text-yellow-400',
  Boxing: 'bg-green-500/20 text-green-400',
  General: 'bg-purple-500/20 text-purple-400',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-surface border border-border rounded-xl p-6 card-hover h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sportColors[post.sport] || sportColors.General}`}>
            {post.sport}
          </span>
          <span className="text-text-secondary text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>

        <h2 className="font-heading text-xl text-white mb-3 group-hover:text-primary transition-colors leading-tight">
          {post.title.toUpperCase()}
        </h2>

        <p className="text-text-secondary text-sm mb-4 flex-grow line-clamp-3">
          {post.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <Calendar className="w-3 h-3" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Read <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </article>
    </Link>
  )
}

export default function BlogContent() {
  const [activeTab, setActiveTab] = useState<string>('All')
  const allPosts = getAllPosts()

  const filteredPosts = activeTab === 'All'
    ? allPosts
    : allPosts.filter(post => post.sport === activeTab)

  return (
    <>
      {/* Hero */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 mb-6">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-text-secondary text-sm">Training guides & articles</span>
        </div>
        <h1 className="font-heading text-4xl lg:text-6xl text-white mb-4">
          COMBAT SPORTS <span className="gradient-text">TRAINING BLOG</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Expert guides on finding training partners, sparring safely, gym etiquette, and getting the most out of your combat sports journey.
        </p>
      </div>

      {/* Sport Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {SPORT_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:text-white hover:border-primary/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredPosts.map(post => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary text-lg">No articles found for this category yet.</p>
          <p className="text-text-secondary text-sm mt-2">Check back soon or browse all articles.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 bg-surface border border-border rounded-xl p-8 text-center">
        <h2 className="font-heading text-2xl text-white mb-3">READY TO FIND YOUR TRAINING PARTNER?</h2>
        <p className="text-text-secondary mb-6 max-w-lg mx-auto">
          Stop searching and start training. Get matched with compatible training partners based on your sport, skill level, weight, and location.
        </p>
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors btn-glow"
        >
          Find Partners Now
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  )
}
