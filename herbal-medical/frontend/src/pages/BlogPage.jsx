import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight } from 'lucide-react'
import { blogAPI } from '../services/api'
import LoadingPage from '../components/ui/LoadingPage'
import BannerStrip from '../components/ui/BannerStrip'
import SwipeRow from '../components/ui/SwipeRow'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

export default function BlogPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['blog', { search, page }],
    queryFn: () => blogAPI.getPosts({ search, page, page_size: 9 }),
    keepPreviousData: true,
  })

  const posts = data?.data?.results || []
  const hasNext = !!data?.data?.next
  const hasPrev = !!data?.data?.previous

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="section-heading">Health & Wellness Blog</h1>
        <p className="section-subheading">Expert insights on herbal medicine and natural healing</p>
      </div>

      <div className="relative max-w-md mx-auto mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search articles…"
          className="input-field pl-10"
          aria-label="Search blog posts"
        />
      </div>

      {/* Sidebar banner strip for blog page */}
      <BannerStrip placement="sidebar" />

      {isLoading ? (
        <LoadingPage />
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-500">No articles found.</p>
        </div>
      ) : (
        <SwipeRow gridCols="md:grid-cols-2 lg:grid-cols-3" cardWidth="min(82vw, 320px)">
          {posts.map((post) => {
            const imageUrl = post.image
              ? (post.image.startsWith('http') ? post.image : `${MEDIA_URL}${post.image}`)
              : null
            return (
              <Link key={post.id} to={`/blog/${post.slug}`} className="card group hover:shadow-card-hover transition-shadow">
                <div className="h-44 bg-primary-50 overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={post.image_alt || post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
                  )}
                </div>
                <div className="p-4">
                  {post.tag_list?.length > 0 && (
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {post.tag_list.slice(0, 2).map((tag) => (
                        <span key={tag} className="badge-green text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                  <h2 className="font-heading font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
                    <span className="flex items-center gap-1 text-primary-600 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </SwipeRow>
      )}

      {(hasPrev || hasNext) && (
        <div className="flex justify-center gap-3 mt-10">
          <button onClick={() => setPage(p => p - 1)} disabled={!hasPrev} className="btn-outline disabled:opacity-50">← Previous</button>
          <span className="flex items-center text-sm text-gray-600">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!hasNext} className="btn-outline disabled:opacity-50">Next →</button>
        </div>
      )}
    </div>
  )
}
