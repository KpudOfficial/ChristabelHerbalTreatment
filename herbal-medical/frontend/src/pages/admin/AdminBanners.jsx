import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ToggleLeft, ToggleRight, Calendar, Clock, Upload } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useForm } from 'react-hook-form'
import { format, isAfter, isBefore } from 'date-fns'
import toast from 'react-hot-toast'
import LoadingPage from '../../components/ui/LoadingPage'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

const PLACEMENTS = [
  { value: 'hero',     label: 'Homepage Hero',    desc: 'Overlay background on the homepage hero section' },
  { value: 'sidebar',  label: 'Sidebar / Promo',  desc: 'Strip banner on Services and Blog pages' },
  { value: 'category', label: 'Shop / Category',  desc: 'Strip banner above category pills in the Shop' },
  { value: 'popup',    label: 'Popup',             desc: 'Modal popup shown 3 seconds after loading the homepage (once per session)' },
]

export default function AdminBanners() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  // Track the selected image file and its preview separately from react-hook-form
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const imageInputRef = useRef(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: adminAPI.getBanners,
  })

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      title: '', link_url: '', placement: 'hero', is_active: true,
      active_from: '', active_to: '', track_clicks: true, sort_order: 0,
      popup_frequency_days: 1,
    }
  })

  const banners = data?.data?.results || data?.data || []
  const watchedPlacement = watch('placement', 'hero')
  const watchedFrequency = watch('popup_frequency_days', 1)
  const now = new Date()

  const createMutation = useMutation({
    mutationFn: (formData) => {
      if (editingId) return adminAPI.updateBanner(editingId, formData)
      return adminAPI.createBanner(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-banners'])
      toast.success(editingId ? 'Banner updated!' : 'Banner created!')
      handleClose()
    },
    onError: (err) => {
      const msg = err?.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save banner.'
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-banners'])
      toast.success('Banner deleted.')
    },
    onError: () => toast.error('Failed to delete.'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => adminAPI.updateBanner(id, { is_active: !isActive }),
    onSuccess: () => queryClient.invalidateQueries(['admin-banners']),
  })

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleClose() {
    reset()
    setShowForm(false)
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
  }

  const onSubmit = (formData) => {
    const fd = new FormData()
    fd.append('title', formData.title)
    fd.append('link_url', formData.link_url || '')
    fd.append('placement', formData.placement)
    fd.append('is_active', formData.is_active ? 'true' : 'false')
    fd.append('active_from', formData.active_from || '')
    fd.append('active_to', formData.active_to || '')
    fd.append('track_clicks', formData.track_clicks ? 'true' : 'false')
    fd.append('sort_order', parseInt(formData.sort_order) || 0)
    fd.append('popup_frequency_days', parseInt(formData.popup_frequency_days) || 1)
    // Only append image if a new file was selected
    if (imageFile) {
      fd.append('image', imageFile)
    }
    createMutation.mutate(fd)
  }

  const handleEdit = (banner) => {
    setEditingId(banner.id)
    setImageFile(null)
    // Show the existing image as preview
    if (banner.image) {
      setImagePreview(
        banner.image.startsWith('http') ? banner.image : `${MEDIA_URL}${banner.image}`
      )
    } else {
      setImagePreview(null)
    }
    reset({
      title: banner.title,
      link_url: banner.link_url || '',
      placement: banner.placement,
      is_active: banner.is_active,
      active_from: banner.active_from ? banner.active_from.slice(0, 16) : '',
      active_to: banner.active_to ? banner.active_to.slice(0, 16) : '',
      track_clicks: banner.track_clicks,
      sort_order: banner.sort_order,
      popup_frequency_days: banner.popup_frequency_days || 1,
    })
    setShowForm(true)
  }

  const getStatus = (banner) => {
    if (!banner.is_active) return { label: 'Inactive', className: 'badge-gray' }
    if (banner.active_from && isBefore(now, new Date(banner.active_from)))
      return { label: 'Scheduled', className: 'badge-yellow' }
    if (banner.active_to && isAfter(now, new Date(banner.active_to)))
      return { label: 'Expired', className: 'badge-red' }
    return { label: 'Active', className: 'badge-green' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Banner Scheduler</h1>
          <p className="text-gray-500 text-sm mt-1">Create, schedule, and manage advert banners</p>
        </div>
        <button
          onClick={() => { if (showForm) { handleClose() } else { reset(); setEditingId(null); setShowForm(true) } }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Close' : 'New Banner'}
        </button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{editingId ? 'Edit Banner' : 'Create New Banner'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input {...register('title', { required: true })} className="input-field" placeholder="Summer Sale Banner" />
            </div>
            <div>
              <label className="label">Placement</label>
              <select {...register('placement')} className="input-field">
                {PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              {/* Description of where this placement appears */}
              <p className="text-xs text-gray-400 mt-1">
                {PLACEMENTS.find(p => p.value === watchedPlacement)?.desc}
              </p>
            </div>
            <div>
              <label className="label">Link URL (optional)</label>
              <input {...register('link_url')} className="input-field" placeholder="https://…" />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input type="number" {...register('sort_order')} className="input-field" defaultValue={0} />
            </div>
            {watchedPlacement === 'popup' && (
              <div>
                <label className="label">Show popup every (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  {...register('popup_frequency_days')}
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Each visitor sees this popup at most once every <strong>{watchedFrequency || 1}</strong> day{watchedFrequency !== 1 ? 's' : ''}.
                  Set to 1 for daily, 7 for weekly, 30 for monthly.
                </p>
              </div>
            )}
            <div>
              <label className="label">Active From</label>
              <input type="datetime-local" {...register('active_from')} className="input-field" />
            </div>
            <div>
              <label className="label">Active To</label>
              <input type="datetime-local" {...register('active_to')} className="input-field" />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="label">Banner Image {!editingId && <span className="text-red-500">*</span>}</label>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 rounded-lg border border-gray-200 object-cover"
                />
              ) : (
                <div className="h-16 w-28 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                  No image
                </div>
              )}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="btn-ghost text-sm flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                {imagePreview ? 'Change image' : 'Upload image'}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            {!editingId && !imageFile && (
              <p className="text-xs text-gray-400 mt-1">An image is required for new banners.</p>
            )}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register('is_active')} className="rounded text-primary-600" /> Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register('track_clicks')} className="rounded text-primary-600" /> Track Clicks
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || (!editingId && !imageFile)}
              className="btn-primary"
            >
              {isSubmitting || createMutation.isPending
                ? 'Saving…'
                : editingId ? 'Update Banner' : 'Create Banner'}
            </button>
            <button type="button" onClick={handleClose} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Banner list */}
      {isLoading ? (
        <LoadingPage />
      ) : banners.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-gray-500">No banners yet. Click "New Banner" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => {
            const status = getStatus(banner)
            return (
              <div key={banner.id} className="card p-4 flex items-center gap-4">
                {/* Preview */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {banner.image ? (
                    <img
                      src={banner.image.startsWith('http') ? banner.image : `${MEDIA_URL}${banner.image}`}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🖼️</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{banner.title}</h3>
                    <span className={status.className}>{status.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>{PLACEMENTS.find(p => p.value === banner.placement)?.label || banner.placement}</span>
                    {banner.active_from && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(banner.active_from), 'MMM d, yyyy')}
                      </span>
                    )}
                    {banner.active_to && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(banner.active_to), 'MMM d, yyyy')}
                      </span>
                    )}
                    <span>Clicks: {banner.click_count}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleMutation.mutate({ id: banner.id, isActive: banner.is_active })}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    aria-label={banner.is_active ? 'Deactivate banner' : 'Activate banner'}
                    title={banner.is_active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {banner.is_active
                      ? <ToggleRight className="w-7 h-7 text-primary-600" />
                      : <ToggleLeft className="w-7 h-7" />}
                  </button>
                  <button onClick={() => handleEdit(banner)} className="text-gray-400 hover:text-blue-600 transition-colors text-sm px-2">
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this banner?')) deleteMutation.mutate(banner.id) }}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}