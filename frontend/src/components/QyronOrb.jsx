import { useEffect, useRef, useState } from 'react'

export function QyronStaticOrb({ size = 28, className = '', alt = 'Qyron AI' }) {
  const style = {
    width: size ? `${size}px` : undefined,
    height: size ? `${size}px` : undefined,
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    display: 'inline-block',
    verticalAlign: 'middle',
  }

  return (
    <img
      src="/qyron-orb.png"
      alt={alt}
      aria-hidden="true"
      className={className}
      style={style}
    />
  )
}

export function QyronAnimatedOrb({ size = 96, className = '', alt = 'Qyron AI Orb' }) {
  const videoRef = useRef(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const [hasVideoError, setHasVideoError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video && !prefersReducedMotion && !hasVideoError) {
      video.muted = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[QyronOrb] video play failed:', err)
        })
      }
    }
  }, [prefersReducedMotion, hasVideoError])

  const style = {
    display: 'block',
    width: size ? `${size}px` : '100%',
    height: size ? `${size}px` : '100%',
    objectFit: 'contain',
    background: 'transparent',
  }

  if (prefersReducedMotion || hasVideoError) {
    return <QyronStaticOrb size={size} className={className} alt={alt} />
  }

  return (
    <video
      ref={videoRef}
      src="/qyron-orb-transparent.webm"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      controls={false}
      onLoadedMetadata={() => console.log('[QyronOrb] video loaded metadata')}
      onCanPlay={() => {
        console.log('[QyronOrb] video can play')
        if (videoRef.current) {
          videoRef.current.muted = true
          videoRef.current.play().catch((err) => console.warn('[QyronOrb] canplay play failed:', err))
        }
      }}
      onPlaying={() => console.log('[QyronOrb] video playing')}
      onError={(event) => {
        console.error('[QyronOrb] video error', event)
        setHasVideoError(true)
      }}
      className={className}
      style={style}
    />
  )
}

export default function QyronOrb({ animated = false, ...props }) {
  return animated ? <QyronAnimatedOrb {...props} /> : <QyronStaticOrb {...props} />
}



