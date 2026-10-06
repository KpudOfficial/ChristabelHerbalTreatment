import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  Upload, Globe, Phone, MapPin, Share2, LayoutDashboard,
  Facebook, Instagram, Youtube, Linkedin, Twitter,
  DollarSign, BadgeDollarSign, Coins, CreditCard,
  ShoppingBag, ShoppingCart, Package, Box,
  Calendar, CalendarCheck, CalendarDays, Clock,
  Timer, Hourglass, TrendingUp, BarChart2, Activity, Users,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { siteSettingsAPI } from '../../services/api'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import LoadingPage from '../../components/ui/LoadingPage'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

// Map Lucide icon name → component
const ICON_MAP = {
  DollarSign, BadgeDollarSign, Coins, CreditCard,
  ShoppingBag, ShoppingCart, Package, Box,
  Calendar, CalendarCheck, CalendarDays, Clock,
  Timer, Hourglass, TrendingUp, BarChart2, Activity, Users,
}

function LucideIcon({ name, className = 'w-5 h-5' }) {
  const Icon = ICON_MAP[name]
  return Icon ? <Icon className={className} /> : null
}

// Reusable section wrapper
function Section({ icon: Icon, title, children }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="flex items-center gap-2 font-heading font-semibold text-gray-900 text-base">
        <Icon className="w-4 h-4 text-primary-600" />
        {title}
      </h2>
      {children}
    </div>
  )
}

// Single image upload field with preview
function ImageField({ label, hint, currentUrl, onChange }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  const displayUrl = preview || (currentUrl ? currentUrl : null)

  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
      <div className="flex items-center gap-3">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={label}
            className="h-12 rounded border border-gray-200 object-contain bg-gray-50 px-1"
          />
        ) : (
          <div className="h-12 w-20 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
            No file
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-ghost text-sm flex items-center gap-1"
        >
          <Upload className="w-3.5 h-3.5" /> Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  )
}

// Icon picker for a single dashboard card
function IconPicker({ label, value, onChange, iconChoices }) {
  return (
    <div className="space-y-1">
      <label className="label text-xs">{label}</label>
      <div className="grid grid-cols-6 gap-1.5">
        {iconChoices.map(({ value: v }) => (
          <button
            key={v}
            type="button"
            title={v}
            onClick={() => onChange(v)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
              value === v
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-500'
            }`}
          >
            <LucideIcon name={v} className="w-4 h-4" />
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <LucideIcon name={value} className="w-3.5 h-3.5" />
        {value}
      </p>
    </div>
  )
}

export default function AdminSettings() {
  const queryClient = useQueryClient()
  const { settings, isLoading } = useSiteSettings()

  // Track pending file uploads separately (not in react-hook-form)
  const [pendingFiles, setPendingFiles] = useState({})
  // Track icon selections
  const [icons, setIcons] = useState({
    dashboard_icon_revenue: 'DollarSign',
    dashboard_icon_orders: 'ShoppingBag',
    dashboard_icon_bookings: 'Calendar',
    dashboard_icon_pending: 'Clock',
  })

  const iconChoices = settings?.icon_choices || []

  const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm()

  // Populate form when data arrives
  useEffect(() => {
    if (!settings) return
    reset({
      site_name: settings.site_name || '',
      tagline: settings.tagline || '',
      contact_email: settings.contact_email || '',
      contact_phone: settings.contact_phone || '',
      contact_phone_2: settings.contact_phone_2 || '',
      whatsapp_number: settings.whatsapp_number || '',
      address_line_1: settings.address_line_1 || '',
      address_line_2: settings.address_line_2 || '',
      city: settings.city || '',
      region: settings.region || '',
      country: settings.country || '',
      opening_hours: settings.opening_hours || '',
      google_maps_link: settings.google_maps_link || '',
      google_maps_embed_url: settings.google_maps_embed_url || '',
      facebook_url: settings.facebook_url || '',
      instagram_url: settings.instagram_url || '',
      twitter_url: settings.twitter_url || '',
      youtube_url: settings.youtube_url || '',
      tiktok_url: settings.tiktok_url || '',
      linkedin_url: settings.linkedin_url || '',
    })
    setIcons({
      dashboard_icon_revenue: settings.dashboard_icon_revenue || 'DollarSign',
      dashboard_icon_orders: settings.dashboard_icon_orders || 'ShoppingBag',
      dashboard_icon_bookings: settings.dashboard_icon_bookings || 'Calendar',
      dashboard_icon_pending: settings.dashboard_icon_pending || 'Clock',
    })
  }, [settings, reset])

  const mutation = useMutation({
    mutationFn: (formData) => siteSettingsAPI.update(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['site-settings'])
      setPendingFiles({})
      toast.success('Settings saved!')
    },
    onError: (err) => {
      const msg = err?.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save settings.'
      toast.error(msg)
    },
  })

  function onSubmit(formValues) {
    const fd = new FormData()

    // Text fields
    Object.entries(formValues).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v)
    })

    // Icon fields
    Object.entries(icons).forEach(([k, v]) => fd.append(k, v))

    // File fields
    Object.entries(pendingFiles).forEach(([k, v]) => fd.append(k, v))

    mutation.mutate(fd)
  }

  if (isLoading) return <LoadingPage />

  const hasChanges = isDirty || Object.keys(pendingFiles).length > 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Logo, contact details, location, social media, and dashboard icons
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="btn-primary text-sm flex items-center gap-2"
        >
          {isSubmitting || mutation.isPending ? (
            'Saving…'
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Branding */}
      <Section icon={Globe} title="Branding">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Site Name</label>
            <input {...register('site_name')} className="input-field" placeholder="Herbal Medical" />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input {...register('tagline')} className="input-field" placeholder="Nature's healing, modern care." />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <ImageField
            label="Main Logo"
            hint="Shown in navigation header"
            currentUrl={settings?.logo_url}
            onChange={(file) => setPendingFiles((prev) => ({ ...prev, logo: file }))}
          />
          <ImageField
            label="Dark Logo"
            hint="Used on dark backgrounds / footer"
            currentUrl={settings?.logo_dark_url}
            onChange={(file) => setPendingFiles((prev) => ({ ...prev, logo_dark: file }))}
          />
          <ImageField
            label="Favicon"
            hint="32×32 px browser tab icon"
            currentUrl={settings?.favicon_url}
            onChange={(file) => setPendingFiles((prev) => ({ ...prev, favicon: file }))}
          />
        </div>
      </Section>

      {/* Contact */}
      <Section icon={Phone} title="Contact Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input {...register('contact_email')} type="email" className="input-field" placeholder="info@herbalmedical.cm" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input {...register('contact_phone')} className="input-field" placeholder="+237 677 000 000" />
          </div>
          <div>
            <label className="label">Second Phone (optional)</label>
            <input {...register('contact_phone_2')} className="input-field" placeholder="+237 699 000 000" />
          </div>
          <div>
            <label className="label">WhatsApp Number</label>
            <input {...register('whatsapp_number')} className="input-field" placeholder="+237677000000" />
            <p className="text-xs text-gray-400 mt-1">International format, no spaces</p>
          </div>
        </div>
      </Section>

      {/* Location */}
      <Section icon={MapPin} title="Location & Hours">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Address Line 1</label>
            <input {...register('address_line_1')} className="input-field" placeholder="123 Herbal Street" />
          </div>
          <div>
            <label className="label">Address Line 2 (optional)</label>
            <input {...register('address_line_2')} className="input-field" placeholder="Suite 4B" />
          </div>
          <div>
            <label className="label">City</label>
            <input {...register('city')} className="input-field" placeholder="Yaoundé" />
          </div>
          <div>
            <label className="label">Region</label>
            <input {...register('region')} className="input-field" placeholder="Centre" />
          </div>
          <div>
            <label className="label">Country</label>
            <input {...register('country')} className="input-field" placeholder="Cameroon" />
          </div>
          <div>
            <label className="label">Opening Hours</label>
            <input {...register('opening_hours')} className="input-field" placeholder="Mon–Sat 8 AM – 6 PM" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Google Maps Link</label>
            <input {...register('google_maps_link')} className="input-field" placeholder="https://maps.google.com/…" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Google Maps Embed URL</label>
            <input {...register('google_maps_embed_url')} className="input-field" placeholder="Paste the src=… URL from the Google Maps embed code" />
            <p className="text-xs text-gray-400 mt-1">
              In Google Maps → Share → Embed a map → copy the <code>src</code> attribute value
            </p>
          </div>
        </div>
      </Section>

      {/* Social */}
      <Section icon={Share2} title="Social Media">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'facebook_url', label: 'Facebook', Icon: Facebook, placeholder: 'https://facebook.com/yourpage' },
            { name: 'instagram_url', label: 'Instagram', Icon: Instagram, placeholder: 'https://instagram.com/yourhandle' },
            { name: 'twitter_url', label: 'X (Twitter)', Icon: Twitter, placeholder: 'https://x.com/yourhandle' },
            { name: 'youtube_url', label: 'YouTube', Icon: Youtube, placeholder: 'https://youtube.com/@yourchannel' },
            { name: 'tiktok_url', label: 'TikTok', Icon: Share2, placeholder: 'https://tiktok.com/@yourhandle' },
            { name: 'linkedin_url', label: 'LinkedIn', Icon: Linkedin, placeholder: 'https://linkedin.com/company/yourpage' },
          ].map(({ name, label, Icon, placeholder }) => (
            <div key={name}>
              <label className="label flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                {label}
              </label>
              <input {...register(name)} className="input-field" placeholder={placeholder} />
            </div>
          ))}
        </div>
      </Section>

      {/* Dashboard Icons */}
      <Section icon={LayoutDashboard} title="Dashboard Stat Card Icons">
        <p className="text-sm text-gray-500 -mt-2">
          Choose the icon shown in each stat card on the admin dashboard.
        </p>
        {iconChoices.length === 0 ? (
          <p className="text-sm text-gray-400">Loading icon options…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <IconPicker
              label="Revenue card"
              value={icons.dashboard_icon_revenue}
              onChange={(v) => setIcons((p) => ({ ...p, dashboard_icon_revenue: v }))}
              iconChoices={iconChoices}
            />
            <IconPicker
              label="Orders card"
              value={icons.dashboard_icon_orders}
              onChange={(v) => setIcons((p) => ({ ...p, dashboard_icon_orders: v }))}
              iconChoices={iconChoices}
            />
            <IconPicker
              label="Bookings card"
              value={icons.dashboard_icon_bookings}
              onChange={(v) => setIcons((p) => ({ ...p, dashboard_icon_bookings: v }))}
              iconChoices={iconChoices}
            />
            <IconPicker
              label="Pending orders card"
              value={icons.dashboard_icon_pending}
              onChange={(v) => setIcons((p) => ({ ...p, dashboard_icon_pending: v }))}
              iconChoices={iconChoices}
            />
          </div>
        )}
      </Section>

      {/* Floating save hint */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end pointer-events-none">
          <div className="pointer-events-auto bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
            <span className="text-gray-600">You have unsaved changes</span>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary text-sm">
              {isSubmitting || mutation.isPending ? 'Saving…' : 'Save Now'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
