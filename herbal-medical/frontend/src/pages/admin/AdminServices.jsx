import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Pencil, Upload, X, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'
import LoadingPage from '../../components/ui/LoadingPage'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'
const imgSrc = (p) => p ? (p.startsWith('http') ? p : `${MEDIA_URL}${p}`) : null

function ImageUpload({ current, onChange }) {
  const ref = useRef(null)
  const [preview, setPreview] = useState(null)
  const display = preview || imgSrc(current)
  return (
    <div className="flex items-center gap-3">
      {display
        ? <img src={display} alt="" className="h-14 w-20 object-cover rounded-lg border border-gray-200" />
        : <div className="h-14 w-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">No image</div>}
      <button type="button" onClick={() => ref.current?.click()} className="btn-ghost text-sm flex items-center gap-1">
        <Upload className="w-3.5 h-3.5" /> Upload
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setPreview(URL.createObjectURL(f)); onChange(f) }} />
    </div>
  )
}

const EMPTY = { name: '', short_description: '', description: '', price: '', duration_minutes: 30, is_active: true, is_featured: false }

export default function AdminServices() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [imageFile, setImageFile] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['admin-services'], queryFn: adminAPI.getServices })
  const services = data?.data?.results || data?.data || []

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: EMPTY })

  function openNew() { reset(EMPTY); setEditing(null); setImageFile(null); setShowForm(true) }
  function openEdit(s) { setEditing(s); setImageFile(null); reset({ name: s.name, short_description: s.short_description || '', description: s.description, price: s.price, duration_minutes: s.duration_minutes, is_active: s.is_active, is_featured: s.is_featured }); setShowForm(true) }
  function close() { setShowForm(false); setEditing(null); setImageFile(null); reset(EMPTY) }

  const saveMutation = useMutation({
    mutationFn: (fd) => editing ? adminAPI.updateService(editing.id, fd) : adminAPI.createService(fd),
    onSuccess: () => { qc.invalidateQueries(['admin-services']); toast.success(editing ? 'Service updated!' : 'Service created!'); close() },
    onError: (e) => toast.error(Object.values(e?.response?.data || {}).flat().join(' ') || 'Failed to save.'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteService,
    onSuccess: () => { qc.invalidateQueries(['admin-services']); toast.success('Service deleted.') },
    onError: () => toast.error('Failed to delete.'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, val }) => { const fd = new FormData(); fd.append('is_active', val ? 'true' : 'false'); return adminAPI.updateService(id, fd) },
    onSuccess: () => qc.invalidateQueries(['admin-services']),
  })

  function onSubmit(v) {
    const fd = new FormData()
    Object.entries(v).forEach(([k, val]) => { if (val !== '' && val !== null && val !== undefined) fd.append(k, val) })
    if (imageFile) fd.append('image', imageFile)
    saveMutation.mutate(fd)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm mt-1">Manage consultation and treatment services</p>
        </div>
        <button onClick={showForm ? close : openNew} className="btn-primary text-sm">
          {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add Service</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{editing ? 'Edit Service' : 'New Service'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="label">Service Name *</label><input {...register('name', { required: true })} className="input-field" placeholder="General Consultation" /></div>
            <div><label className="label">Price (XAF) *</label><input type="number" step="0.01" {...register('price', { required: true })} className="input-field" /></div>
            <div><label className="label">Duration (minutes)</label><input type="number" {...register('duration_minutes')} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label">Short Description</label><input {...register('short_description')} className="input-field" placeholder="One-liner shown on cards" /></div>
            <div className="md:col-span-2"><label className="label">Full Description *</label><textarea rows={4} {...register('description', { required: true })} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label">Image</label><ImageUpload current={editing?.image} onChange={setImageFile} /></div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_active')} className="rounded text-primary-600" /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_featured')} className="rounded text-primary-600" /> Featured</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isSubmitting || saveMutation.isPending} className="btn-primary">{isSubmitting || saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? <LoadingPage /> : services.length === 0 ? (
        <div className="card p-12 text-center text-gray-400"><div className="text-4xl mb-3">🩺</div><p>No services yet.</p></div>
      ) : (
        <div className="space-y-2">
          {services.map(s => (
            <div key={s.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {s.image ? <img src={imgSrc(s.image)} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🩺</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">{s.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{Number(s.price).toLocaleString()} XAF · {s.duration_minutes} min</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleMutation.mutate({ id: s.id, val: !s.is_active })} className="text-gray-400 hover:text-primary-600">
                  {s.is_active ? <ToggleRight className="w-6 h-6 text-primary-600" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Delete this service?')) deleteMutation.mutate(s.id) }} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
