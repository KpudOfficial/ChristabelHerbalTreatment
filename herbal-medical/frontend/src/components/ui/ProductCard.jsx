import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { clsx } from 'clsx'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  const imageUrl = product.image
    ? (product.image.startsWith('http') ? product.image : `${MEDIA_URL}${product.image}`)
    : null

  return (
    <div className="card group hover:shadow-card-hover transition-shadow duration-200">
      {/* Image */}
      <Link to={`/shop/${product.slug}`} className="block overflow-hidden">
        <div className="relative h-48 bg-gray-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.image_alt || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">🌿</span>
            </div>
          )}
          {product.is_featured && (
            <span className="absolute top-2 left-2 badge-green text-xs">Featured</span>
          )}
          {!product.is_in_stock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
          {product.is_low_stock && product.is_in_stock && (
            <span className="absolute top-2 right-2 badge-yellow text-xs">Low Stock</span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {product.category_name && (
          <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
            {product.category_name}
          </p>
        )}
        <Link to={`/shop/${product.slug}`} className="hover:text-primary-600 transition-colors">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.short_description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.short_description}</p>
        )}

        {/* Rating */}
        {product.average_rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">{product.average_rating}</span>
          </div>
        )}

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-primary-700">
            {Number(product.price).toLocaleString()} <span className="text-xs font-normal text-gray-500">XAF</span>
          </span>
          <button
            onClick={() => addItem(product)}
            disabled={!product.is_in_stock}
            className={clsx(
              'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
              product.is_in_stock
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
