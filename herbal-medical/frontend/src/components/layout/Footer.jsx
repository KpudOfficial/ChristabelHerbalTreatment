import { Link } from 'react-router-dom'
import {
  Leaf, Phone, Mail, MapPin,
  Facebook, Instagram, Twitter, Youtube, Linkedin,
} from 'lucide-react'
import { useSiteSettings } from '../../context/SiteSettingsContext'

// TikTok has no Lucide icon — use a simple SVG inline
function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.2 8.2 0 004.79 1.53V7.05a4.85 4.85 0 01-1.02-.36z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { key: 'facebook_url',  label: 'Facebook',  Icon: Facebook },
  { key: 'instagram_url', label: 'Instagram', Icon: Instagram },
  { key: 'twitter_url',   label: 'X (Twitter)', Icon: Twitter },
  { key: 'youtube_url',   label: 'YouTube',   Icon: Youtube },
  { key: 'tiktok_url',    label: 'TikTok',    Icon: TikTokIcon },
  { key: 'linkedin_url',  label: 'LinkedIn',  Icon: Linkedin },
]

export default function Footer() {
  const { settings } = useSiteSettings()

  // Build full address string from parts
  const addressParts = [
    settings.address_line_1,
    settings.address_line_2,
    settings.city,
    settings.region,
    settings.country,
  ].filter(Boolean)
  const fullAddress = addressParts.length > 0
    ? addressParts.join(', ')
    : null

  // Only render social icons that have a URL set
  const activeSocials = SOCIAL_LINKS.filter(({ key }) => settings[key])

  return (
    <footer className="bg-herbal-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              {settings.logo_dark_url ? (
                <img
                  src={settings.logo_dark_url}
                  alt={settings.site_name}
                  className="block object-contain"
                  style={{ maxHeight: '64px', width: 'auto', maxWidth: '220px' }}
                />
              ) : settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.site_name}
                  className="block object-contain"
                  style={{ maxHeight: '64px', width: 'auto', maxWidth: '220px' }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Leaf className="w-6 h-6 text-herbal-mint" />
                  <span className="text-xl font-heading font-bold">{settings.site_name}</span>
                </div>
              )}
            </div>
            {settings.tagline && (
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{settings.tagline}</p>
            )}

            {/* Social icons — only shown if URLs are configured */}
            {activeSocials.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {activeSocials.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={settings[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-gray-400 hover:text-herbal-mint transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold mb-4 text-herbal-mint">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                { to: '/shop', label: 'Herbal Shop' },
                { to: '/services', label: 'Consultations' },
                { to: '/book', label: 'Book Appointment' },
                { to: '/blog', label: 'Health Blog' },
                { to: '/about', label: 'About Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-herbal-mint transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-semibold mb-4 text-herbal-mint">Information</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                { to: '/about', label: 'Our Story' },
                { to: '/about#certifications', label: 'Certifications' },
                { to: '/contact', label: 'Contact Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-herbal-mint transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-herbal-mint">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {fullAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-herbal-mint flex-shrink-0" />
                  {settings.google_maps_link ? (
                    <a
                      href={settings.google_maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-herbal-mint transition-colors"
                    >
                      {fullAddress}
                    </a>
                  ) : (
                    <span>{fullAddress}</span>
                  )}
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-herbal-mint flex-shrink-0" />
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-herbal-mint transition-colors">
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              {settings.contact_phone_2 && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-herbal-mint flex-shrink-0" />
                  <a href={`tel:${settings.contact_phone_2}`} className="hover:text-herbal-mint transition-colors">
                    {settings.contact_phone_2}
                  </a>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-herbal-mint flex-shrink-0" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-herbal-mint transition-colors">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings.opening_hours && (
                <li className="flex items-start gap-2">
                  <span className="text-herbal-mint mt-0.5">⏰</span>
                  <span>{settings.opening_hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {settings.site_name}. All rights reserved.</p>
          <p className="mt-1 text-xs">
            For informational purposes only. Always consult a qualified health professional before using herbal products or changing your health regimen.
          </p>
        </div>
      </div>
    </footer>
  )
}
