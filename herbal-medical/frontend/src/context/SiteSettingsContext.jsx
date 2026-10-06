/**
 * SiteSettingsContext — fetches /api/site-settings/ once at app startup
 * and makes the data available everywhere via useSiteSettings().
 *
 * The endpoint is public (no auth required), so this is safe to call on
 * every page load. React Query caches it for 10 minutes.
 */
import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { siteSettingsAPI } from '../services/api'

const SiteSettingsContext = createContext(null)

// Sane defaults so consumers never have to null-check everything
const DEFAULTS = {
  site_name: 'HerbalMedical',
  tagline: '',
  logo_url: null,
  logo_dark_url: null,
  favicon_url: null,
  contact_email: '',
  contact_phone: '',
  contact_phone_2: '',
  whatsapp_number: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  region: '',
  country: '',
  opening_hours: '',
  google_maps_link: '',
  google_maps_embed_url: '',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  youtube_url: '',
  tiktok_url: '',
  linkedin_url: '',
  dashboard_icon_revenue: 'DollarSign',
  dashboard_icon_orders: 'ShoppingBag',
  dashboard_icon_bookings: 'Calendar',
  dashboard_icon_pending: 'Clock',
  about_hero_title: 'About Us',
  about_hero_subtitle: '',
  about_story: '',
  about_doctor_name: '',
  about_doctor_bio: '',
  about_doctor_image_url: null,
}

export function SiteSettingsProvider({ children }) {
  const { data, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsAPI.get,
    staleTime: 10 * 60 * 1000,   // 10 minutes
    gcTime: 15 * 60 * 1000,      // keep in cache for 15 minutes
    retry: 1,
  })

  const settings = { ...DEFAULTS, ...(data?.data || {}) }

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  return ctx
}
