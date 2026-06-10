import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'SmartRead — Lector inteligente con traducción instantánea'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background:
            'linear-gradient(135deg, #0a0a1a 0%, #130d2e 40%, #0d1a1f 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
            }}
          />
          <span style={{ fontSize: '34px', color: '#a8a6c8', fontWeight: 600 }}>
            SmartRead
          </span>
        </div>
        <div
          style={{
            fontSize: '76px',
            fontWeight: 800,
            color: '#f1f0ff',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
          }}
        >
          Lee más rápido.
          <br />
          Entiende mejor.
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#a8a6c8',
            marginTop: '32px',
            maxWidth: '880px',
          }}
        >
          Lector PDF · EPUB · TXT con traducción instantánea en 8 idiomas
        </div>
      </div>
    ),
    { ...size },
  )
}
