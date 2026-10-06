/**
 * BannerStrip — full-width clickable banner for 'category' and 'sidebar' placements.
 * Fetches active banners for the given placement and renders the first one.
 * Shows nothing if no active banner exists for that placement.
 */
import { useQuery } from '@tanstack/react-query'
import { bannersAPI } from '../../services/api'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

function imgSrc(path) {
  if (!path) return null
  return path.startsWith('http') ? path : `${MEDIA_URL}${path}`
}

export default function BannerStrip({ placement = 'category', className = '' }) {
  const { data } = useQuery({
    queryKey: ['banners', placement],
    queryFn: () => bannersAPI.getActiveBanners(placement),
    staleTime: 1000 * 60 * 10,
  })

  const banners = data?.data?.results || data?.data || []
  if (banners.length === 0) return null

  const banner = banners[0]
  const src = imgSrc(banner.image)
  if (!src) return null

  const content = (
    <img
      src={src}
      alt={banner.image_alt || banner.title}
      className={`w-full object-cover rounded-xl ${className}`}
      style={{ maxHeight: '160px' }}
    />
  )

  if (banner.link_url) {
    return (
      <a
        href={banner.link_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={banner.title}
        className="block mb-6"
        onClick={() => bannersAPI.trackClick(banner.id).catch(() => {})}
      >
        {content}
      </a>
    )
  }

  return <div className="mb-6">{content}</div>
}
