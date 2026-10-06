/**
 * SwipeRow — horizontal scroll row for mobile with snap behaviour.
 * Users swipe/drag manually. On md+ it falls back to a grid.
 *
 * Props:
 *  children   — card elements
 *  cardWidth  — CSS width of each card (default 'min(80vw, 320px)')
 *  gap        — gap in px (default 16)
 *  gridCols   — Tailwind grid-cols for desktop (default 'md:grid-cols-3')
 *  peek       — show a sliver of the next card to signal scrollability (default true)
 *  className  — extra classes
 */
export default function SwipeRow({
  children,
  cardWidth = 'min(80vw, 320px)',
  gap = 16,
  gridCols = 'md:grid-cols-3',
  peek = true,
  className = '',
}) {
  const items = Array.isArray(children) ? children : [children]

  return (
    <>
      {/* Mobile: swipeable horizontal scroll */}
      <div className={`md:hidden ${peek ? '-mr-4' : ''} ${className}`}>
        <div
          className="flex overflow-x-auto snap-x snap-mandatory"
          style={{
            gap: `${gap}px`,
            paddingBottom: '8px',            // room for scrollbar on some browsers
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              className="flex-shrink-0 snap-start"
              style={{ width: cardWidth }}
            >
              {child}
            </div>
          ))}
          {/* Trailing spacer so last card isn't flush against the edge */}
          {peek && <div className="flex-shrink-0" style={{ width: '1px' }} />}
        </div>
        {/* Swipe hint — fades in on first render */}
        <p className="text-xs text-gray-400 text-center mt-2">← swipe to see more →</p>
      </div>

      {/* Desktop: normal grid */}
      <div className={`hidden md:grid ${gridCols} gap-6 ${className}`}>
        {items}
      </div>
    </>
  )
}
