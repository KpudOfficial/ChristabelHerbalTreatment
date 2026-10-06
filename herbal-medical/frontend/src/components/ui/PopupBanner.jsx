/**
 * PopupBanner — modal popup for 'popup' placement banners.
 * Appears 3 seconds after mount. Dismissed by clicking X or clicking outside.
 * Frequency is set per-banner by the admin (popup_frequency_days field).
 * Tracks last-shown timestamp in localStorage keyed by banner id.
 */
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { bannersAPI } from '../../services/api'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'
const STORAGE_PREFIX = 'popup_banner_shown_'  // key per banner id

function shouldShowPopup(bannerId, frequencyDays) {
  const key = `${STORAGE_PREFIX}${bannerId}`
  const last = localStorage.getItem(key)
  if (!last) return true
  const daysSince = (Date.now() - Number(last)) / (1000 * 60 * 60 * 24)
  return daysSince >= frequencyDays
}

function markPopupShown(bannerId) {
  localStorage.setItem(`${STORAGE_PREFIX}${bannerId}`, String(Date.now()))
}

function imgSrc(path) {
  return path ? (path.startsWith('http') ? path : `${MEDIA_URL}${path}`) : null
}

export default function PopupBanner() {
  const [visible, setVisible] = useState(false)

  const { data } = useQuery({
    queryKey: ['banners', 'popup'],
    queryFn: () => bannersAPI.getActiveBanners('popup'),
    staleTime: 1000 * 60 * 10,
  })

  const banners = data?.data?.results || data?.data || []
  const banner = banners[0]

  useEffect(() => {
    if (!banner) return
    const frequencyDays = banner.popup_frequency_days ?? 1
    if (!shouldShowPopup(banner.id, frequencyDays)) return
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [banner])

  function dismiss() {
    setVisible(false)
    if (banner) markPopupShown(banner.id)
  }

  if (!visible || !banner) return null

  const src = imgSrc(banner.image)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label={banner.title}
    >
      <div
        className="relative max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>

        {src ? (
          banner.link_url ? (
            <a
              href={banner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { bannersAPI.trackClick(banner.id).catch(() => {}); dismiss() }}
            >
              <img src={src} alt={banner.image_alt || banner.title} className="w-full block" />
            </a>
          ) : (
            <img src={src} alt={banner.image_alt || banner.title} className="w-full block" />
          )
        ) : (
          <div className="bg-primary-600 text-white p-8 text-center">
            <h2 className="text-2xl font-heading font-bold mb-2">{banner.title}</h2>
            {banner.link_url && (
              <a href={banner.link_url} target="_blank" rel="noopener noreferrer"
                className="btn-primary bg-white text-primary-700 hover:bg-gray-100 mt-4">
                Learn More
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
