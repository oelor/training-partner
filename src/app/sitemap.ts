import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trainingpartner.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const sports = ['wrestling', 'mma', 'bjj', 'boxing', 'kickboxing', 'muay-thai', 'judo', 'karate', 'sambo']
  const cities = [
    'new-york', 'los-angeles', 'chicago', 'houston', 'phoenix',
    'san-antonio', 'san-diego', 'dallas', 'san-francisco', 'austin',
    'miami', 'denver', 'seattle', 'portland', 'las-vegas',
    'atlanta', 'boston', 'philadelphia', 'san-jose', 'nashville',
  ]

  const staticPages = [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${BASE_URL}/partners`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/gyms`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${BASE_URL}/dmca`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    // Auth pages excluded — they have robots noindex metadata
  ]

  const sportPages = sports.map(sport => ({
    url: `${BASE_URL}/partners/${sport}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const cityPages = sports.flatMap(sport =>
    cities.map(city => ({
      url: `${BASE_URL}/partners/${sport}/${city}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  return [...staticPages, ...sportPages, ...cityPages]
}
