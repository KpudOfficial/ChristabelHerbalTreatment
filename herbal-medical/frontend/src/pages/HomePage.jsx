import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CheckCircle, Calendar, ShoppingBag, Leaf } from 'lucide-react'
import { bannersAPI, productsAPI, certificatesAPI, blogAPI } from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import LoadingPage from '../components/ui/LoadingPage'
import PopupBanner from '../components/ui/PopupBanner'
import AutoScrollRow from '../components/ui/AutoScrollRow'
import SwipeRow from '../components/ui/SwipeRow'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

export default function HomePage() {
  const { data: bannersData } = useQuery({
    queryKey: ['banners', 'hero'],
    queryFn: () => bannersAPI.getActiveBanners('hero'),
    staleTime: 1000 * 60 * 10,
  })
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', { featured: true }],
    queryFn: () => productsAPI.getProducts({ featured: true, page_size: 4 }),
  })
  const { data: certsData } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificatesAPI.getCertificates(),
  })
  const { data: blogData } = useQuery({
    queryKey: ['blog', { limit: 3 }],
    queryFn: () => blogAPI.getPosts({ page_size: 3 }),
  })

  const banners = bannersData?.data?.results || bannersData?.data || []
  const products = productsData?.data?.results || []
  const certificates = certsData?.data?.results || certsData?.data || []
  const blogPosts = blogData?.data?.results || []

  return (
    <div>
      {/* Popup banner — renders as a modal after 3s, once per session */}
      <PopupBanner />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-herbal-dark via-primary-800 to-primary-600 text-white overflow-hidden">
        {banners.length > 0 && banners[0].image ? (
          <div className="absolute inset-0">
            <img
              src={banners[0].image.startsWith('http') ? banners[0].image : `${MEDIA_URL}${banners[0].image}`}
              alt={banners[0].image_alt || banners[0].title}
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        ) : null}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-herbal-mint" />
              <span className="text-herbal-mint text-sm font-medium uppercase tracking-wider">
                Natural Healing · Expert Care
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight mb-6">
              Healing with Nature's <span className="text-herbal-mint">Best</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Discover premium herbal products and book consultations with our certified herbal medicine doctor. Traditional African healing meets modern care.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
                <ShoppingBag className="w-4 h-4" />
                Shop Products
              </Link>
              <Link to="/book" className="btn-outline border-white text-white hover:bg-white/10">
                <Calendar className="w-4 h-4" />
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }} />
      </section>

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🌿', label: '100% Natural', desc: 'No synthetic chemicals' },
            { icon: '🏥', label: 'Ministry Approved', desc: 'Certified practice' },
            { icon: '🚚', label: 'Fast Delivery', desc: 'Nationwide shipping' },
            { icon: '⭐', label: 'Expert Care', desc: 'Qualified herbalist' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="card p-4 text-center">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-semibold text-gray-900 text-sm">{label}</div>
              <div className="text-xs text-gray-500">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-heading">Featured Products</h2>
            <p className="section-subheading">Our most popular herbal remedies</p>
          </div>
          <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {productsLoading ? (
          <LoadingPage />
        ) : (
          <AutoScrollRow gridCols="md:grid-cols-4" cardWidth="min(72vw, 260px)">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AutoScrollRow>
        )}
      </section>

      {/* Services CTA */}
      <section className="bg-primary-50 py-16 mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="section-heading mb-4">Book a Consultation</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Meet with our certified herbal medicine doctor for a personalized assessment. We treat a wide range of conditions using traditional African and international herbal protocols.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'General health assessment',
                  'Chronic disease management',
                  'Personalized herbal treatment plans',
                  'Follow-up and monitoring',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/services" className="btn-primary">
                See All Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🩺</div>
                <h3 className="text-xl font-heading font-semibold text-herbal-dark">General Consultation</h3>
                <p className="text-gray-500 text-sm mt-1">30 minutes · 5,000 XAF</p>
              </div>
              <Link to="/book" className="btn-primary w-full justify-center">
                Book Now
              </Link>
              <p className="text-center text-xs text-gray-400 mt-3">
                No hidden fees · Cancel up to 24h before
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20" id="certifications">
          <div className="text-center mb-8">
            <h2 className="section-heading">Our Certifications</h2>
            <p className="section-subheading">Trusted, accredited, and compliant</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="card p-6 text-center hover:shadow-card-hover transition-shadow">
                {cert.image ? (
                  <img
                    src={cert.image.startsWith('http') ? cert.image : `${MEDIA_URL}${cert.image}`}
                    alt={cert.title}
                    className="w-16 h-16 object-contain mx-auto mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-primary-600" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 mb-1">{cert.title}</h3>
                <p className="text-sm text-gray-500">{cert.issuing_body}</p>
                {cert.certificate_number && (
                  <p className="text-xs text-gray-400 mt-1">#{cert.certificate_number}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Blog highlights */}
      {blogPosts.length > 0 && (
        <section className="bg-gray-50 py-16 mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-heading">Health & Wellness Blog</h2>
                <p className="section-subheading">Expert tips from our herbalist</p>
              </div>
              <Link to="/blog" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm">
                All posts <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <SwipeRow gridCols="md:grid-cols-3" cardWidth="min(80vw, 320px)">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="card group hover:shadow-card-hover transition-shadow">
                  <div className="h-40 bg-primary-50 overflow-hidden">
                    {post.image ? (
                      <img
                        src={post.image.startsWith('http') ? post.image : `${MEDIA_URL}${post.image}`}
                        alt={post.image_alt || post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                    <p className="text-xs text-gray-400 mt-3">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </SwipeRow>
          </div>
        </section>
      )}
    </div>
  )
}
