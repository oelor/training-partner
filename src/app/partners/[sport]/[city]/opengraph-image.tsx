import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Training Partner'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const sportsMap: Record<string, string> = {
  wrestling: 'Wrestling', mma: 'MMA', bjj: 'BJJ', boxing: 'Boxing',
  kickboxing: 'Kickboxing', 'muay-thai': 'Muay Thai', judo: 'Judo',
  karate: 'Karate', sambo: 'Sambo',
}

function citySlugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default async function OGImage({ params }: { params: { sport: string; city: string } }) {
  const sportName = sportsMap[params.sport] || params.sport
  const cityName = citySlugToName(params.city)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0D0D0D 0%, #1a1a2e 50%, #0D0D0D 100%)',
          padding: '60px',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #FF4D00, #FF8C00)',
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: '#FF4D00',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            TP
          </div>
          <span style={{ color: '#999', fontSize: '20px', letterSpacing: '2px' }}>
            TRAINING PARTNER
          </span>
        </div>

        {/* Sport name */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}
        >
          {sportName.toUpperCase()}
        </div>

        {/* City */}
        <div
          style={{
            fontSize: '42px',
            fontWeight: 'bold',
            color: '#FF4D00',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '24px',
          }}
        >
          Training Partners in {cityName}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '22px',
            color: '#999',
            textAlign: 'center',
          }}
        >
          Find sparring partners at your skill level. Free to join.
        </div>
      </div>
    ),
    { ...size }
  )
}
