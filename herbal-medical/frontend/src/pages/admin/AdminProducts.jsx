import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Pencil, Upload, X, ToggleLeft, ToggleRight, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { adminAPI } from '../../services/api'
import LoadingPage from '../../components/ui/LoadingPage'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
}
const QUILL_FORMATS = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link']

function imgSrc(path) {
  if (!path) return null
  return path.startsWith('http') ? path : `${MEDIA_URL}${path}`
}

function ImageUpload({ current, onChange }) {
  const ref = useRef(null)
  const [preview, setPreview] = useState(null)
  function pick(e) {
    const f = e.target.files[0]
    if (!f) return
    setPreview(URL.createObjectURL(f))
    onChange(f)
  }
  const display = preview || imgSrc(current)
  return (
    <div className="flex items-center gap-3">
      {display
        ? <img src={display} alt="" className="h-14 w-20 object-cover rounded-lg border border-gray-200" />
        : <div className="h-14 w-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">No image</div>}
      <button type="button" onClick={() => ref.current?.click()} className="btn-ghost text-sm flex items-center gap-1">
        <Upload className="w-3.5 h-3.5" /> Upload
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  )
}

const EMPTY = { name: '', short_description: '', price: '', stock: '', category: '', is_active: true, is_featured: false, ingredients: '', usage_instructions: '', weight_grams: '', image_alt: '' }

export default function AdminProducts() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [description, setDescription] = useState('')

  const { data: pData, isLoading } = useQuery({ queryKey: ['admin-products'], queryFn: adminAPI.getProducts })
  const { data: cData } = useQuery({ queryKey: ['admin-categories'], queryFn: adminAPI.getCategories })
  const products = pData?.data?.results || pData?.data || []
  const categories = cData?.data?.results || cData?.data || []

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: EMPTY })

  function openNew() { reset(EMPTY); setEditing(null); setImageFile(null); setDescription(''); setShowForm(true) }
  function openEdit(p) {
    setEditing(p)
    setImageFile(null)
    setDescription(p.description || '')
    reset({ name: p.name, short_description: p.short_description || '', price: p.price, stock: p.stock, category: p.category || '', is_active: p.is_active, is_featured: p.is_featured, ingredients: p.ingredients || '', usage_instructions: p.usage_instructions || '', weight_grams: p.weight_grams || '', image_alt: p.image_alt || '' })
    setShowForm(true)
  }
  function close() { setShowForm(false); setEditing(null); setImageFile(null); setDescription(''); reset(EMPTY) }

  const saveMutation = useMutation({
    mutationFn: (fd) => editing ? adminAPI.updateProduct(editing.id, fd) : adminAPI.createProduct(fd),
    onSuccess: () => { qc.invalidateQueries(['admin-products']); toast.success(editing ? 'Product updated!' : 'Product created!'); close() },
    onError: (e) => toast.error(Object.values(e?.response?.data || {}).flat().join(' ') || 'Failed to save.'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteProduct,
    onSuccess: () => { qc.invalidateQueries(['admin-products']); toast.success('Product deleted.') },
    onError: () => toast.error('Failed to delete.'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, val }) => { const fd = new FormData(); fd.append('is_active', val ? 'true' : 'false'); return adminAPI.updateProduct(id, fd) },
    onSuccess: () => qc.invalidateQueries(['admin-products']),
  })

  function onSubmit(values) {
    if (!description || description === '<p><br></p>') {
      toast.error('Product description cannot be empty.')
      return
    }
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) fd.append(k, v) })
    fd.append('description', description)
    if (imageFile) fd.append('image', imageFile)
    saveMutation.mutate(fd)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your herbal product catalogue</p>
        </div>
        <button onClick={showForm ? close : openNew} className="btn-primary text-sm">
          {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add Product</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{editing ? 'Edit Product' : 'New Product'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="label">Product Name *</label><input {...register('name', { required: true })} className="input-field" placeholder="Moringa Leaf Capsules" /></div>
            <div><label className="label">Category</label>
              <select {...register('category')} className="input-field">
                <option value="">— Select category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Price (XAF) *</label><input type="number" step="0.01" {...register('price', { required: true })} className="input-field" placeholder="5000" /></div>
            <div><label className="label">Stock (units) *</label><input type="number" {...register('stock', { required: true })} className="input-field" placeholder="50" /></div>
            <div><label className="label">Weight (grams)</label><input type="number" {...register('weight_grams')} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label">Short Description</label><input {...register('short_description')} className="input-field" placeholder="Brief one-liner shown in product cards" /></div>
            <div className="md:col-span-2">
              <label className="label">Full Description *</label>
              <p className="text-xs text-gray-400 mb-1">Supports headings, bold, italic, bullet lists and links.</p>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={setDescription}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  style={{ minHeight: '200px' }}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">Ingredients</label>
              <p className="text-xs text-gray-400 mb-1">Plain text — line breaks are preserved.</p>
              <textarea rows={3} {...register('ingredients')} className="input-field font-mono text-sm whitespace-pre-wrap" placeholder={"Moringa oleifera leaf extract 500mg\nVitamin C 50mg\n..."} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Usage Instructions</label>
              <textarea rows={3} {...register('usage_instructions')} className="input-field font-mono text-sm whitespace-pre-wrap" placeholder={"Take 2 capsules daily with water.\nBest taken in the morning."} /></div>
            <div className="md:col-span-2">
              <label className="label">Image</label>
              <ImageUpload current={editing?.image} onChange={setImageFile} />
              <input {...register('image_alt')} className="input-field mt-2" placeholder="Image alt text" />
            </div>
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

      {isLoading ? <LoadingPage /> : products.length === 0 ? (
        <div className="card p-12 text-center text-gray-400"><div className="text-4xl mb-3">📦</div><p>No products yet.</p></div>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {p.image ? <img src={imgSrc(p.image)} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">{p.name}</span>
                  {p.is_featured && <Star className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{Number(p.price).toLocaleString()} XAF · Stock: {p.stock} · {p.category_name || 'No category'}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleMutation.mutate({ id: p.id, val: !p.is_active })} className="text-gray-400 hover:text-primary-600">
                  {p.is_active ? <ToggleRight className="w-6 h-6 text-primary-600" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id) }} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}