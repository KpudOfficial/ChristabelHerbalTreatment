import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { ordersAPI } from '../services/api'
import LoadingPage from '../components/ui/LoadingPage'

const STATUS_MESSAGES = {
  pending: { icon: '⏳', label: 'Payment Pending', color: 'text-yellow-600' },
  paid: { icon: '✅', label: 'Payment Successful', color: 'text-green-600' },
  processing: { icon: '📦', label: 'Order Processing', color: 'text-blue-600' },
  delivered: { icon: '🎉', label: 'Order Delivered', color: 'text-green-600' },
  cancelled: { icon: '❌', label: 'Order Cancelled', color: 'text-red-600' },
}

export default function OrderConfirmationPage() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.getOrder(id),
    refetchInterval: (data) =>
      data?.data?.status === 'pending' ? 5000 : false,
  })

  const order = data?.data
  if (isLoading) return <LoadingPage />
  if (!order) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Order not found.</p>
    </div>
  )

  const statusInfo = STATUS_MESSAGES[order.status] || STATUS_MESSAGES.pending

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{statusInfo.icon}</div>
        <h1 className={`text-2xl font-heading font-bold mb-2 ${statusInfo.color}`}>
          {statusInfo.label}
        </h1>
        <p className="text-gray-500">Order #{order.id}</p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-3 mb-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.product_detail?.name} × {item.quantity}</span>
              <span className="font-medium">{Number(item.subtotal).toLocaleString()} XAF</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{Number(order.subtotal).toLocaleString()} XAF</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between text-primary-600">
              <span>Discount</span>
              <span>-{Number(order.discount_amount).toLocaleString()} XAF</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-1">
            <span>Total</span>
            <span className="text-primary-700">{Number(order.total).toLocaleString()} XAF</span>
          </div>
        </div>
      </div>

      {order.payment_reference && (
        <div className="card p-4 mb-6 text-sm text-gray-600">
          <span className="font-medium">Payment ref: </span>
          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{order.payment_reference}</code>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/shop" className="btn-outline flex-1 justify-center">
          Continue Shopping
        </Link>
        <Link to="/dashboard" className="btn-primary flex-1 justify-center">
          My Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
