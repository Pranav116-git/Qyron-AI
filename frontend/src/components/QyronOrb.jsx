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
    const matches = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    console.log('[QyronOrb] initial prefersReducedMotion:', matches)
    return matches
  })
  const [hasVideoError, setHasVideoError] = useState(false)
  const lastLoggedTimeRef = useRef(-1)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e) => {
      console.log('[QyronOrb] prefersReducedMotion changed:', e.matches)
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion || hasVideoError) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true

    console.log('[QyronOrb] video element mounted', {
      src: video.src,
      readyState: video.readyState,
      networkState: video.networkState,
      paused: video.paused,
      muted: video.muted,
      currentTime: video.currentTime,
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      error: video.error,
    })

    const attemptPlay = () => {
      if (!videoRef.current) return
      const v = videoRef.current
      v.muted = true
      v.defaultMuted = true
      v.playsInline = true
      const playPromise = v.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[QyronOrb] play() rejected (autoplay policy or transient state):', err)
        })
      }
    }

    attemptPlay()

    const timer05 = setTimeout(() => {
      const v = videoRef.current
      if (v) {
        console.log(`[QyronOrb] currentTime check at 0.5s: ${v.currentTime} (paused: ${v.paused}, readyState: ${v.readyState})`)
        if (v.paused) attemptPlay()
      }
    }, 500)

    const timer15 = setTimeout(() => {
      const v = videoRef.current
      if (v) {
        console.log(`[QyronOrb] currentTime check at 1.5s: ${v.currentTime} (paused: ${v.paused}, readyState: ${v.readyState})`)
        if (v.paused) attemptPlay()
      }
    }, 1500)

    const timer25 = setTimeout(() => {
      const v = videoRef.current
      if (v) {
        console.log(`[QyronOrb] currentTime check at 2.5s: ${v.currentTime} (paused: ${v.paused}, readyState: ${v.readyState})`)
        if (v.paused) attemptPlay()
      }
    }, 2500)

    return () => {
      clearTimeout(timer05)
      clearTimeout(timer15)
      clearTimeout(timer25)
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
      preload="auto"
      aria-hidden="true"
      controls={false}
      onTimeUpdate={() => {
        const v = videoRef.current
        if (v && Math.floor(v.currentTime) !== lastLoggedTimeRef.current) {
          lastLoggedTimeRef.current = Math.floor(v.currentTime)
          console.log(`[QyronOrb] PLAYING currentTime=${v.currentTime.toFixed(2)}s`)
        }
      }}
      onLoadedMetadata={() => {
        const v = videoRef.current
        console.log('[QyronOrb] loadedmetadata', {
          src: v?.src,
          readyState: v?.readyState,
          networkState: v?.networkState,
          duration: v?.duration,
          paused: v?.paused,
          muted: v?.muted,
          currentTime: v?.currentTime,
          videoWidth: v?.videoWidth,
          videoHeight: v?.videoHeight,
          error: v?.error,
        })
      }}
      onCanPlay={() => {
        const v = videoRef.current
        console.log('[QyronOrb] canplay', {
          src: v?.src,
          readyState: v?.readyState,
          networkState: v?.networkState,
          paused: v?.paused,
          muted: v?.muted,
          currentTime: v?.currentTime,
          duration: v?.duration,
          videoWidth: v?.videoWidth,
          videoHeight: v?.videoHeight,
          error: v?.error,
        })
        if (v) {
          v.muted = true
          v.defaultMuted = true
          v.playsInline = true
          v.play().catch((err) => {
            console.warn('[QyronOrb] canplay play() rejected:', err)
          })
        }
      }}
      onPlaying={() => {
        const v = videoRef.current
        console.log('[QyronOrb] playing', {
          src: v?.src,
          readyState: v?.readyState,
          networkState: v?.networkState,
          paused: v?.paused,
          muted: v?.muted,
          currentTime: v?.currentTime,
          duration: v?.duration,
          videoWidth: v?.videoWidth,
          videoHeight: v?.videoHeight,
          error: v?.error,
        })
      }}
      onPause={() => {
        const v = videoRef.current
        console.log('[QyronOrb] pause', {
          src: v?.src,
          readyState: v?.readyState,
          networkState: v?.networkState,
          paused: v?.paused,
          muted: v?.muted,
          currentTime: v?.currentTime,
          duration: v?.duration,
          videoWidth: v?.videoWidth,
          videoHeight: v?.videoHeight,
          error: v?.error,
        })
      }}
      onError={(event) => {
        const v = videoRef.current
        const err = v?.error || event.currentTarget?.error
        console.error('[QyronOrb] video error event:', event, {
          error: err,
          code: err?.code,
          message: err?.message,
          src: v?.src,
          readyState: v?.readyState,
          networkState: v?.networkState,
          paused: v?.paused,
          muted: v?.muted,
          currentTime: v?.currentTime,
          duration: v?.duration,
        })
        if (err && err.code && err.code !== 0) {
          setHasVideoError(true)
        } else {
          console.warn('[QyronOrb] ignoring non-fatal or null video error event')
        }
      }}
      className={className}
      style={style}
    />
  )
}

export default function QyronOrb({ animated = false, ...props }) {
  return animated ? <QyronAnimatedOrb {...props} /> : <QyronStaticOrb {...props} />
}



