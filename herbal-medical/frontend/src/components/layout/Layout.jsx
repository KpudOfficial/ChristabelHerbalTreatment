import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useSiteSettings } from '../../context/SiteSettingsContext'

export default function Layout() {
  const { settings } = useSiteSettings()

  // Apply dynamic favicon from site settings
  useEffect(() => {
    if (!settings.favicon_url) return
    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = settings.favicon_url
  }, [settings.favicon_url])

  // Update document title with site name
  useEffect(() => {
    if (settings.site_name) {
      document.title = `${settings.site_name} | Natural Healing, Expert Care`
    }
  }, [settings.site_name])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
