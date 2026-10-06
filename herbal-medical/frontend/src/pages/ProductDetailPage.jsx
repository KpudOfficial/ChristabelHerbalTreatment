import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Star, ArrowLeft, Plus, Minus, CheckCircle } from 'lucide-react'
import { productsAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import LoadingPage from '../components/ui/LoadingPage'
import ReviewForm from '../components/ui/ReviewForm'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsAPI.getProduct(slug),
  })

  const product = data?.data

  if (isLoading) return <LoadingPage />
  if (error || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Product not found.</p>
      <Link to="/shop" className="btn-primary mt-4">Back to Shop</Link>
    </div>
  )

  const imageUrl = product.image
    ? (product.image.startsWith('http') ? product.image : `${MEDIA_URL}${product.image}`)
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary-600">Shop</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-gray-50 aspect-square flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.image_alt || product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-8xl">🌿</div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category && (
            <Link
              to={`/shop?category=${product.category.slug}`}
              className="text-sm text-primary-600 font-medium uppercase tracking-wide hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-3xl font-heading font-bold text-gray-900 mt-2 mb-3">{product.name}</h1>

          {/* Rating */}
          {product.average_rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(product.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.average_rating})</span>
            </div>
          )}

          <div className="text-3xl font-bold text-primary-700 mb-6">
            {Number(product.price).toLocaleString()} <span className="text-lg font-normal text-gray-500">XAF</span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.is_in_stock ? (
              <>
                <CheckCircle className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {product.is_low_stock ? `Low stock - only ${product.stock} left` : 'In Stock'}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          {product.is_in_stock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => addItem(product, quantity)}
                className="btn-primary flex-1 justify-center"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          )}

          {/* Meta details */}
          {(product.ingredients || product.usage_instructions || product.weight_grams) && (
            <div className="border-t border-gray-100 pt-6 space-y-4">
              {product.ingredients && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Ingredients</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{product.ingredients}</p>
                </div>
              )}
              {product.usage_instructions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">How to Use</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{product.usage_instructions}</p>
                </div>
              )}
              {product.weight_grams && (
                <p className="text-sm text-gray-500">Net weight: {product.weight_grams}g</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-gray-100 pt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Customer Reviews</h2>
        {product.reviews?.length > 0 ? (
          <div className="space-y-4 mb-8">
            {product.reviews.map((review) => (
              <div key={review.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{review.user_name}</span>
                  {review.is_verified_purchase && (
                    <span className="badge-green text-xs">Verified Purchase</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-6">No reviews yet. Be the first to review this product.</p>
        )}
        <ReviewForm productId={product.id} onSuccess={() => window.location.reload()} />
      </div>
    </div>
  )
}
