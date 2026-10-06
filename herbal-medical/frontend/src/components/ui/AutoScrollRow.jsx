/**
 * AutoScrollRow — continuously auto-scrolls its children horizontally on mobile.
 * On md+ screens it falls back to a normal grid (no scrolling).
 *
 * Props:
 *  children      — card elements to scroll
 *  cardWidth     — CSS width of each card (default '72vw', max '280px')
 *  speed         — pixels per second (default 40)
 *  gap           — gap between cards in px (default 16)
 *  gridCols      — Tailwind grid-cols class for desktop (default 'md:grid-cols-4')
 *  className     — extra classes on the wrapper
 */
import { useRef, useEffect } from 'react'

export default function AutoScrollRow({
  children,
  cardWidth = 'min(72vw, 280px)',
  speed = 40,
  gap = 16,
  gridCols = 'md:grid-cols-4',
  className = '',
}) {
  const trackRef = useRef(null)
  const rafRef = useRef(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // Only auto-scroll on mobile (< 768px)
    const mq = window.matchMedia('(max-width: 767px)')
    if (!mq.matches) return

    let pos = 0
    const totalWidth = track.scrollWidth / 2  // duplicated content

    function step(ts) {
      if (!pausedRef.current) {
        pos += speed / 60  // approximate 60fps
        if (pos >= totalWidth) pos = 0
        track.scrollLeft = pos
      }
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    // Pause on touch so user can inspect a card
    const pause = () => { pausedRef.current = true }
    const resume = () => { pausedRef.current = false }
    track.addEventListener('touchstart', pause, { passive: true })
    track.addEventListener('touchend', resume, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      track.removeEventListener('touchstart', pause)
      track.removeEventListener('touchend', resume)
    }
  }, [speed])

  const items = Array.isArray(children) ? children : [children]

  return (
    <>
      {/* Mobile: auto-scroll strip */}
      <div className={`md:hidden -mx-4 px-4 overflow-hidden ${className}`}>
        <div
          ref={trackRef}
          className="flex overflow-x-scroll scrollbar-hide"
          style={{ gap: `${gap}px`, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Duplicate children for seamless loop */}
          {[...items, ...items].map((child, i) => (
            <div
              key={i}
              className="flex-shrink-0"
              style={{ width: cardWidth }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: normal grid */}
      <div className={`hidden md:grid ${gridCols} gap-6 ${className}`}>
        {items}
      </div>
    </>
  )
}
