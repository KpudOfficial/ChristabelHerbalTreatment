import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search } from 'lucide-react'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import LoadingPage from '../components/ui/LoadingPage'
import BannerStrip from '../components/ui/BannerStrip'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)

  const currentCategory = searchParams.get('category') || ''
  const currentMin = searchParams.get('min_price') || ''
  const currentMax = searchParams.get('max_price') || ''
  const currentOrdering = searchParams.get('ordering') || '-created_at'
  const page = parseInt(searchParams.get('page') || '1')

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: productsAPI.getCategories,
    staleTime: Infinity,
  })

  const params = {
    search: search || undefined,
    category: currentCategory || undefined,
    min_price: currentMin || undefined,
    max_price: currentMax || undefined,
    ordering: currentOrdering,
    page,
  }

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productsAPI.getProducts(params),
    keepPreviousData: true,
  })

  const categories = categoriesData?.data?.results || categoriesData?.data || []
  const products = productsData?.data?.results || []
  const totalCount = productsData?.data?.count || 0
  const hasNext = !!productsData?.data?.next
  const hasPrev = !!productsData?.data?.previous

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)
    newParams.delete('page')
    setSearchParams(newParams)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParam('search', search)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-heading">Herbal Shop</h1>
        <p className="section-subheading">Natural products for your health</p>
      </div>

      {/* Search + filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input-field pl-10"
              aria-label="Search products"
            />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>
        <select
          value={currentOrdering}
          onChange={(e) => updateParam('ordering', e.target.value)}
          className="input-field w-auto"
          aria-label="Sort products"
        >
          <option value="-created_at">Newest First</option>
          <option value="created_at">Oldest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="name">Name A-Z</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline gap-2"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                value={currentCategory}
                onChange={(e) => updateParam('category', e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Min Price (XAF)</label>
              <input
                type="number"
                value={currentMin}
                onChange={(e) => updateParam('min_price', e.target.value)}
                placeholder="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Max Price (XAF)</label>
              <input
                type="number"
                value={currentMax}
                onChange={(e) => updateParam('max_price', e.target.value)}
                placeholder="Any"
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Category banner — shown when filtering by category, or as a general shop promo */}
      <BannerStrip placement="category" />

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => updateParam('category', '')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !currentCategory ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParam('category', cat.slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentCategory === cat.slug
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-500 mb-4">{totalCount} product{totalCount !== 1 ? 's' : ''} found</p>
      )}

      {/* Products grid */}
      {isLoading ? (
        <LoadingPage />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌿</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasPrev || hasNext) && (
        <div className="flex justify-center gap-3 mt-10">
          <button
            onClick={() => updateParam('page', String(page - 1))}
            disabled={!hasPrev}
            className="btn-outline disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="flex items-center text-sm text-gray-600">Page {page}</span>
          <button
            onClick={() => updateParam('page', String(page + 1))}
            disabled={!hasNext}
            className="btn-outline disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
