import React from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart()
  const { isAuthenticated } = useAuth()

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-heading font-bold text-gray-700 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some herbal products to get started.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const product = item.product_detail || {}
            const imageUrl = product.image
              ? (product.image.startsWith('http') ? product.image : `${MEDIA_URL}${product.image}`)
              : null

            return (
              <div key={item.id} className="card p-4 flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {Number(product.price).toLocaleString()} XAF each
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="px-2 py-1.5 hover:bg-gray-50 text-gray-600"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="px-2 py-1.5 hover:bg-gray-50 text-gray-600"
                        aria-label="Increase quantity"
                        disabled={item.quantity >= (product.stock || 99)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-primary-700">
                        {Number(item.subtotal || (product.price * item.quantity)).toLocaleString()} XAF
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({cart.item_count} items)</span>
                <span className="font-medium">{Number(cart.total).toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="text-gray-500">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 mb-6">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary-700">{Number(cart.total).toLocaleString()} XAF</span>
              </div>
            </div>

            {isAuthenticated ? (
              <Link to="/checkout" className="btn-primary w-full justify-center">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="space-y-3">
                <Link to="/login?next=/checkout" className="btn-primary w-full justify-center">
                  Login to Checkout
                </Link>
                <Link to="/register?next=/checkout" className="btn-outline w-full justify-center">
                  Register
                </Link>
                <p className="text-xs text-center text-gray-400">You need an account to complete your order</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
