import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Training Partner - Find Your Perfect Sparring Partner'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
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

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#FF4D00',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold',
            }}
          >
            TP
          </div>
          <span style={{ color: '#999', fontSize: '24px', letterSpacing: '3px' }}>
            TRAINING PARTNER
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '24px',
          }}
        >
          Find Your Perfect
        </div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#FF4D00',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '32px',
          }}
        >
          Sparring Partner
        </div>

        {/* Sports list */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {['BJJ', 'MMA', 'Wrestling', 'Boxing', 'Muay Thai', 'Judo'].map(sport => (
            <div
              key={sport}
              style={{
                padding: '8px 20px',
                border: '1px solid #333',
                borderRadius: '999px',
                color: '#999',
                fontSize: '16px',
              }}
            >
              {sport}
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '22px',
            color: '#666',
            textAlign: 'center',
          }}
        >
          50+ combat sports. Free to join. Find partners near you.
        </div>
      </div>
    ),
    { ...size }
  )
}
