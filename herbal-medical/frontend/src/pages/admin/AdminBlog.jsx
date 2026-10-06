import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Pencil, Upload, X, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { adminAPI } from '../../services/api'
import LoadingPage from '../../components/ui/LoadingPage'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'
const imgSrc = (p) => p ? (p.startsWith('http') ? p : `${MEDIA_URL}${p}`) : null

// Quill toolbar config
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
}
const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent', 'blockquote', 'code-block', 'link',
]

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
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files[0]; if (!f) return; setPreview(URL.createObjectURL(f)); onChange(f) }} />
    </div>
  )
}

const EMPTY = { title: '', excerpt: '', tags: '', is_published: false, published_at: '', image_alt: '' }

export default function AdminBlog() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  // body is managed outside react-hook-form because Quill isn't a native input
  const [body, setBody] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['admin-blog'], queryFn: adminAPI.getBlogPosts })
  const posts = data?.data?.results || data?.data || []

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: EMPTY })

  function openNew() {
    reset(EMPTY); setEditing(null); setImageFile(null); setBody(''); setShowForm(true)
  }
  function openEdit(p) {
    setEditing(p); setImageFile(null); setBody(p.body || '')
    reset({
      title: p.title, excerpt: p.excerpt || '', tags: p.tags || '',
      is_published: p.is_published,
      published_at: p.published_at ? p.published_at.slice(0, 16) : '',
      image_alt: p.image_alt || '',
    })
    setShowForm(true)
  }
  function close() { setShowForm(false); setEditing(null); setImageFile(null); setBody(''); reset(EMPTY) }

  const saveMutation = useMutation({
    mutationFn: (fd) => editing ? adminAPI.updateBlogPost(editing.id, fd) : adminAPI.createBlogPost(fd),
    onSuccess: () => { qc.invalidateQueries(['admin-blog']); toast.success(editing ? 'Post updated!' : 'Post created!'); close() },
    onError: (e) => toast.error(Object.values(e?.response?.data || {}).flat().join(' ') || 'Failed to save.'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteBlogPost,
    onSuccess: () => { qc.invalidateQueries(['admin-blog']); toast.success('Post deleted.') },
    onError: () => toast.error('Failed to delete.'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, val }) => {
      const fd = new FormData()
      fd.append('is_published', val ? 'true' : 'false')
      if (val) fd.append('published_at', new Date().toISOString())
      return adminAPI.updateBlogPost(id, fd)
    },
    onSuccess: () => qc.invalidateQueries(['admin-blog']),
  })

  function onSubmit(v) {
    if (!body || body === '<p><br></p>') {
      toast.error('Post body cannot be empty.')
      return
    }
    const fd = new FormData()
    Object.entries(v).forEach(([k, val]) => {
      if (val !== '' && val !== null && val !== undefined) fd.append(k, val)
    })
    fd.append('body', body)
    if (imageFile) fd.append('image', imageFile)
    saveMutation.mutate(fd)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage health & wellness articles</p>
        </div>
        <button onClick={showForm ? close : openNew} className="btn-primary text-sm">
          {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> New Post</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{editing ? 'Edit Post' : 'New Blog Post'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Title */}
            <div className="md:col-span-2">
              <label className="label">Title *</label>
              <input {...register('title', { required: true })} className="input-field"
                placeholder="5 Herbal Remedies for Better Sleep" />
            </div>

            {/* Excerpt */}
            <div className="md:col-span-2">
              <label className="label">Excerpt</label>
              <textarea rows={2} {...register('excerpt')} className="input-field"
                placeholder="Brief summary shown in blog listing…" />
            </div>

            {/* Body — rich text editor */}
            <div className="md:col-span-2">
              <label className="label">Body *</label>
              <p className="text-xs text-gray-400 mb-1">
                Supports headings, bold, italic, lists, links, and code blocks.
              </p>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={body}
                  onChange={setBody}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  style={{ minHeight: '320px' }}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="label">Tags</label>
              <input {...register('tags')} className="input-field" placeholder="herbal, sleep, wellness" />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>

            {/* Publish date */}
            <div>
              <label className="label">Publish Date</label>
              <input type="datetime-local" {...register('published_at')} className="input-field" />
            </div>

            {/* Cover image */}
            <div className="md:col-span-2">
              <label className="label">Cover Image</label>
              <ImageUpload current={editing?.image} onChange={setImageFile} />
              <input {...register('image_alt')} className="input-field mt-2" placeholder="Image alt text" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_published')} className="rounded text-primary-600" />
            Published
          </label>

          <div className="flex gap-3">
            <button type="submit" disabled={isSubmitting || saveMutation.isPending} className="btn-primary">
              {isSubmitting || saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Publish'}
            </button>
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? <LoadingPage /> : posts.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">📝</div>
          <p>No blog posts yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {p.image
                  ? <img src={imgSrc(p.image)} alt={p.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">📝</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">{p.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {p.published_at ? format(new Date(p.published_at), 'MMM d, yyyy') : 'No date'} · {p.view_count} views
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleMutation.mutate({ id: p.id, val: !p.is_published })}
                  title={p.is_published ? 'Unpublish' : 'Publish'} className="text-gray-400 hover:text-primary-600">
                  {p.is_published ? <Eye className="w-4 h-4 text-primary-600" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-blue-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate(p.id) }}
                  className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
