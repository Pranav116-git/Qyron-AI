export function QyronStaticOrb({ size = 28, className = '', alt = 'Qyron AI', state = 'idle', loading = false }) {
  const stateClass = loading ? 'orb-state-thinking' : `orb-state-${state}`
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
      src={`${import.meta.env.BASE_URL}qyron-orb.png`}
      alt={alt}
      aria-hidden="true"
      className={`qyron-orb-img ${stateClass} ${className}`.trim()}
      style={style}
    />
  )
}


