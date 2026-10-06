import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <Leaf className="w-16 h-16 text-primary-200 mx-auto mb-4" />
        <h1 className="text-7xl font-heading font-bold text-primary-600 mb-2">404</h1>
        <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/shop" className="btn-outline">Browse Shop</Link>
        </div>
      </div>
    </div>
  )
}
