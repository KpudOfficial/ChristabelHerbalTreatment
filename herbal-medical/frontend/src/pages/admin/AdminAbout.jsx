import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Upload, CheckCircle2, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { siteSettingsAPI } from '../../services/api'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import LoadingPage from '../../components/ui/LoadingPage'

function ImageUpload({ label, hint, currentUrl, onChange }) {
  const ref = useRef(null)
  const [preview, setPreview] = useState(null)
  const display = preview || currentUrl
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <div className="flex items-center gap-3">
        {display
          ? <img src={display} alt={label} className="h-16 w-16 object-cover rounded-full border border-gray-200" />
          : <div className="h-16 w-16 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">Photo</div>}
        <button type="button" onClick={() => ref.current?.click()} className="btn-ghost text-sm flex items-center gap-1">
          <Upload className="w-3.5 h-3.5" /> Upload
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setPreview(URL.createObjectURL(f)); onChange(f) }} />
      </div>
    </div>
  )
}

export default function AdminAbout() {
  const qc = useQueryClient()
  const { settings, isLoading } = useSiteSettings()
  const [doctorImageFile, setDoctorImageFile] = useState(null)

  const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm()

  useEffect(() => {
    if (!settings) return
    reset({
      about_hero_title: settings.about_hero_title || '',
      about_hero_subtitle: settings.about_hero_subtitle || '',
      about_story: settings.about_story || '',
      about_doctor_name: settings.about_doctor_name || '',
      about_doctor_bio: settings.about_doctor_bio || '',
    })
  }, [settings, reset])

  const mutation = useMutation({
    mutationFn: (fd) => siteSettingsAPI.update(fd),
    onSuccess: () => {
      qc.invalidateQueries(['site-settings'])
      setDoctorImageFile(null)
      toast.success('About page updated!')
    },
    onError: (e) => toast.error(Object.values(e?.response?.data || {}).flat().join(' ') || 'Failed to save.'),
  })

  function onSubmit(values) {
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
    if (doctorImageFile) fd.append('about_doctor_image', doctorImageFile)
    mutation.mutate(fd)
  }

  if (isLoading) return <LoadingPage />

  const hasChanges = isDirty || !!doctorImageFile

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">About Page</h1>
          <p className="text-gray-500 text-sm mt-1">Edit the hero text, story, and doctor bio shown on the About page</p>
        </div>
        <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary text-sm flex items-center gap-2">
          {isSubmitting || mutation.isPending ? 'Saving…' : <><CheckCircle2 className="w-4 h-4" />Save Changes</>}
        </button>
      </div>

      {/* Hero section */}
      <div className="card p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-heading font-semibold text-gray-900 text-base">
          <BookOpen className="w-4 h-4 text-primary-600" /> Hero Section
        </h2>
        <div>
          <label className="label">Hero Heading</label>
          <input {...register('about_hero_title')} className="input-field" placeholder="About HerbalMedical" />
        </div>
        <div>
          <label className="label">Hero Subtitle</label>
          <textarea rows={3} {...register('about_hero_subtitle')} className="input-field" placeholder="Combining the wisdom of traditional African herbal medicine with modern evidence-based practice…" />
        </div>
      </div>

      {/* Story */}
      <div className="card p-6 space-y-4">
        <h2 className="font-heading font-semibold text-gray-900 text-base">Our Story</h2>
        <div>
          <label className="label">Story Text</label>
          <textarea
            rows={10}
            {...register('about_story')}
            className="input-field font-mono text-sm"
            placeholder={'Write your practice\'s origin story here.\n\nSeparate paragraphs with a blank line.\n\nSupports **bold**, *italic*, - bullet lists, and # Headings (Markdown).'}
          />
          <p className="text-xs text-gray-400 mt-1">
            Supports Markdown: <code>**bold**</code>, <code>*italic*</code>, <code># Heading</code>, <code>- list item</code>. Blank lines create new paragraphs.
          </p>
        </div>
      </div>

      {/* Doctor / founder */}
      <div className="card p-6 space-y-4">
        <h2 className="font-heading font-semibold text-gray-900 text-base">Doctor / Founder</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <input {...register('about_doctor_name')} className="input-field" placeholder="Dr. Christabel" />
          </div>
          <div>
            <ImageUpload
              label="Photo"
              hint="Shown as a circular avatar"
              currentUrl={settings?.about_doctor_image_url}
              onChange={setDoctorImageFile}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Bio</label>
            <textarea rows={5} {...register('about_doctor_bio')} className="input-field" placeholder="Dr. Christabel is a certified herbal medicine practitioner with over 15 years of experience…" />
          </div>
        </div>
      </div>

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
