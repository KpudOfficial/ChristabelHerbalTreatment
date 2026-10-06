import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react'
import { blogAPI } from '../services/api'
import LoadingPage from '../components/ui/LoadingPage'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

export default function BlogPostPage() {
  const { slug } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogAPI.getPost(slug),
  })

  const post = data?.data

  if (isLoading) return <LoadingPage />
  if (error || !post) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Article not found.</p>
      <Link to="/blog" className="btn-primary mt-4">All Articles</Link>
    </div>
  )

  const imageUrl = post.image
    ? (post.image.startsWith('http') ? post.image : `${MEDIA_URL}${post.image}`)
    : null

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      {post.tag_list?.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {post.tag_list.map((tag) => (
            <span key={tag} className="badge-green">{tag}</span>
          ))}
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        {post.author_name && (
          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author_name}</span>
        )}
        {post.published_at && (
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(post.published_at).toLocaleDateString()}</span>
        )}
        <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.view_count} views</span>
      </div>

      {imageUrl && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-video bg-gray-50">
          <img src={imageUrl} alt={post.image_alt || post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed
          [&_h2]:text-2xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:text-xl [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:mb-4 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-1
          [&_a]:text-primary-600 [&_a]:underline
          [&_em]:italic [&_em]:text-gray-500"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />
    </article>
  )
}
