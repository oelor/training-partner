// Static product data matching the seeded affiliate_links table (IDs 1-8)
export interface GearProduct {
  id: number
  name: string
  brand: string
  category: string
  description: string
  price: string
}

export const GEAR_PRODUCTS: GearProduct[] = [
  {
    id: 1,
    name: 'Sanabul Essential MMA Gloves',
    brand: 'Sanabul',
    category: 'Gloves',
    description: 'Versatile MMA gloves ideal for bag work, sparring, and training. Durable synthetic leather with secure wrist wrap.',
    price: '$24.99',
  },
  {
    id: 2,
    name: 'Elite Sports BJJ Gi',
    brand: 'Elite Sports',
    category: 'Gis & Rashguards',
    description: 'Lightweight pearl weave gi with reinforced stitching. IBJJF competition approved and pre-shrunk for consistent fit.',
    price: '$54.99',
  },
  {
    id: 3,
    name: 'Venum Challenger Headgear',
    brand: 'Venum',
    category: 'Headgear',
    description: 'Full-face protection headgear with multi-density foam. Adjustable straps and excellent visibility for sparring.',
    price: '$49.99',
  },
  {
    id: 4,
    name: 'Hayabusa T3 Boxing Gloves',
    brand: 'Hayabusa',
    category: 'Gloves',
    description: 'Premium boxing gloves with multi-layer foam and patented closure system. Excellent wrist support and hand protection.',
    price: '$149.99',
  },
  {
    id: 5,
    name: 'SISU Mouthguard',
    brand: 'SISU',
    category: 'Mouthguards',
    description: 'Ultra-thin custom-fit mouthguard. Only 1.6mm thick, allows talking and drinking while providing superior dental protection.',
    price: '$29.99',
  },
  {
    id: 6,
    name: 'Fuji BJJ Rashguard',
    brand: 'Fuji',
    category: 'Gis & Rashguards',
    description: 'Compression-fit rashguard with sublimated graphics. Four-way stretch fabric with flatlock stitching to prevent chafing.',
    price: '$34.99',
  },
  {
    id: 7,
    name: 'ASICS Matflex Wrestling Shoes',
    brand: 'ASICS',
    category: 'Shoes',
    description: 'Lightweight wrestling shoes with excellent grip and ankle support. Breathable mesh upper with durable rubber outsole.',
    price: '$49.95',
  },
  {
    id: 8,
    name: 'RDX Shin Guards',
    brand: 'RDX',
    category: 'Shin Guards',
    description: 'Maya Hide leather shin guards with gel-integrated padding. Full shin and instep coverage for Muay Thai and kickboxing.',
    price: '$34.99',
  },
]

export function getGearByIds(ids: number[]): GearProduct[] {
  return ids.map(id => GEAR_PRODUCTS.find(p => p.id === id)).filter(Boolean) as GearProduct[]
}
