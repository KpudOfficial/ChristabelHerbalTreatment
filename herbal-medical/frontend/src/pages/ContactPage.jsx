import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

export default function ContactPage() {
  const { settings } = useSiteSettings()

  const addressParts = [
    settings.address_line_1,
    settings.address_line_2,
    settings.city,
    settings.region,
    settings.country,
  ].filter(Boolean)
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null

  const contactItems = [
    fullAddress && {
      icon: MapPin,
      color: 'bg-primary-100 text-primary-600',
      title: 'Our Location',
      content: (
        <>
          {settings.google_maps_link ? (
            <a href={settings.google_maps_link} target="_blank" rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
              {fullAddress}
            </a>
          ) : (
            <p className="text-sm text-gray-500">{fullAddress}</p>
          )}
        </>
      ),
    },
    settings.contact_phone && {
      icon: Phone,
      color: 'bg-primary-100 text-primary-600',
      title: 'Phone',
      content: (
        <div className="space-y-1">
          <a href={`tel:${settings.contact_phone}`}
            className="block text-sm text-gray-500 hover:text-primary-600 transition-colors">
            {settings.contact_phone}
          </a>
          {settings.contact_phone_2 && (
            <a href={`tel:${settings.contact_phone_2}`}
              className="block text-sm text-gray-500 hover:text-primary-600 transition-colors">
              {settings.contact_phone_2}
            </a>
          )}
        </div>
      ),
    },
    settings.whatsapp_number && {
      icon: MessageCircle,
      color: 'bg-green-100 text-green-600',
      title: 'WhatsApp',
      content: (
        <>
          <p className="text-sm text-gray-500 mb-3">{settings.whatsapp_number}</p>
          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent('Hello! I would like to inquire about your herbal medicine services.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>
        </>
      ),
    },
    settings.contact_email && {
      icon: Mail,
      color: 'bg-primary-100 text-primary-600',
      title: 'Email',
      content: (
        <>
          <p className="text-sm text-gray-500 mb-3">{settings.contact_email}</p>
          <a
            href={`mailto:${settings.contact_email}?subject=${encodeURIComponent('Enquiry – Herbal Medical')}&body=${encodeURIComponent('Hello,\n\nI would like to enquire about your services.\n\n')}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors min-h-[44px]"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </a>
        </>
      ),
    },
    settings.opening_hours && {
      icon: Clock,
      color: 'bg-primary-100 text-primary-600',
      title: 'Working Hours',
      content: (
        <p className="text-sm text-gray-500 whitespace-pre-line">{settings.opening_hours}</p>
      ),
    },
  ].filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="section-heading">Contact Us</h1>
        <p className="section-subheading">We're here to help with your health journey</p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {contactItems.map(({ icon: Icon, color, title, content }) => (
          <div key={title} className="card p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              {content}
            </div>
          </div>
        ))}
      </div>

      {/* Google Maps embed — full width */}
      {settings.google_maps_embed_url && (
        <div className="rounded-xl overflow-hidden border border-gray-200 h-64 sm:h-80">
          <iframe
            src={settings.google_maps_embed_url}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location map"
          />
        </div>
      )}

      {/* No contact items configured yet */}
      {contactItems.length === 0 && !settings.google_maps_embed_url && (
        <div className="text-center py-16 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Contact details not configured yet.</p>
          <p className="text-sm mt-1">Go to Admin → Site Settings to add them.</p>
        </div>
      )}
    </div>
  )
}
