import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Smartphone, Tag, CheckCircle } from 'lucide-react'
import { ordersAPI, paymentsAPI, couponsAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState('form') // 'form' | 'payment' | 'polling'
  const [orderId, setOrderId] = useState(null)
  const [paymentRef, setPaymentRef] = useState(null)
  const [coupon, setCoupon] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const phoneNumber = watch('phone_number')

  const subtotal = Number(cart.total)
  const discount = coupon ? Number(coupon.discount_amount) : 0
  const total = subtotal - discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await couponsAPI.validate(couponCode, subtotal)
      setCoupon(res.data)
      toast.success(`Coupon applied: ${res.data.description || couponCode}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon')
      setCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const onSubmit = async (formData) => {
    try {
      const orderPayload = {
        phone_number: formData.phone_number,
        delivery_address: formData.delivery_address || '',
        delivery_notes: formData.delivery_notes || '',
        coupon_code: coupon?.code || '',
      }
      const orderRes = await ordersAPI.createOrder(orderPayload)
      const order = orderRes.data
      setOrderId(order.id)
      setStep('payment')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order. Please try again.')
    }
  }

  const handleInitiatePayment = async () => {
    if (!orderId || !phoneNumber) return
    setPaymentLoading(true)
    setStep('polling')
    try {
      const res = await paymentsAPI.initiatePayment({
        order_id: orderId,
        phone_number: phoneNumber,
      })
      if (res.data.success) {
        setPaymentRef(res.data.reference)
        toast.success('USSD prompt sent to your phone. Approve the payment.')
        // Poll for status
        pollPaymentStatus(res.data.reference)
      } else {
        toast.error(res.data.error || 'Payment initiation failed.')
        setStep('payment')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed. Try again.')
      setStep('payment')
    } finally {
      setPaymentLoading(false)
    }
  }

  const pollPaymentStatus = async (reference) => {
    let attempts = 0
    const maxAttempts = 24 // 2 minutes
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await paymentsAPI.getPaymentStatus(reference)
        if (res.data.status === 'successful') {
          clearInterval(interval)
          clearCart()
          toast.success('Payment successful!')
          navigate(`/orders/${orderId}`)
        } else if (res.data.status === 'failed') {
          clearInterval(interval)
          toast.error('Payment failed. Please try again.')
          setStep('payment')
        }
      } catch (_) {}
      if (attempts >= maxAttempts) {
        clearInterval(interval)
        toast.error('Payment verification timed out. Check your order status in the dashboard.')
        navigate(`/orders/${orderId}`)
      }
    }, 5000)
  }

  if (cart.items.length === 0 && step === 'form') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Details', 'Payment', 'Confirm'].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              (step === 'form' && i === 0) ||
              (step === 'payment' && i === 1) ||
              (step === 'polling' && i === 2)
                ? 'text-primary-700'
                : i < (['form', 'payment', 'polling'].indexOf(step))
                ? 'text-green-600'
                : 'text-gray-400'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                (step === 'form' && i === 0) ||
                (step === 'payment' && i === 1) ||
                (step === 'polling' && i === 2)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {i + 1}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Order Details */}
          {step === 'form' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Phone Number (for payment)</label>
                    <input
                      {...register('phone_number', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^(\+?237)?[67]\d{8}$/,
                          message: 'Enter a valid Cameroon number (e.g. 677001234)',
                        }
                      })}
                      className="input-field"
                      placeholder="677001234"
                      type="tel"
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Delivery Address (optional)</label>
                    <textarea
                      {...register('delivery_address')}
                      className="input-field"
                      rows={2}
                      placeholder="Enter delivery address…"
                    />
                  </div>
                  <div>
                    <label className="label">Order Notes (optional)</label>
                    <textarea
                      {...register('delivery_notes')}
                      className="input-field"
                      rows={2}
                      placeholder="Any special instructions…"
                    />
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="card p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary-600" /> Discount Coupon
                </h3>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="input-field"
                    placeholder="Enter coupon code"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="btn-outline text-sm px-4 py-2 flex-shrink-0"
                  >
                    {couponLoading ? 'Checking…' : 'Apply'}
                  </button>
                </div>
                {coupon && (
                  <p className="text-primary-600 text-sm mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {coupon.description || coupon.code} — -{Number(coupon.discount_amount).toLocaleString()} XAF
                  </p>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
                {isSubmitting ? 'Processing…' : 'Continue to Payment'}
              </button>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <div className="card p-6 text-center">
              <Smartphone className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Mobile Money Payment</h2>
              <p className="text-gray-500 mb-6">
                You will receive a USSD prompt on your phone number <strong>{phoneNumber}</strong> to approve this payment.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="border-2 border-yellow-400 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">📱</div>
                  <div className="text-sm font-medium">MTN MoMo</div>
                </div>
                <div className="border-2 border-orange-400 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">📱</div>
                  <div className="text-sm font-medium">Orange Money</div>
                </div>
              </div>
              <button
                onClick={handleInitiatePayment}
                disabled={paymentLoading}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                {paymentLoading ? 'Sending prompt…' : `Pay ${total.toLocaleString()} XAF`}
              </button>
            </div>
          )}

          {/* Step 3: Waiting */}
          {step === 'polling' && (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 spinner border-4" />
              <h2 className="text-xl font-semibold mb-2">Waiting for Payment…</h2>
              <p className="text-gray-500 mb-4">
                Check your phone and approve the USSD prompt. This page will update automatically.
              </p>
              <p className="text-sm text-gray-400">Reference: <code className="text-xs bg-gray-100 px-2 py-1 rounded">{paymentRef}</code></p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600 truncate mr-2">
                    {item.product_detail?.name} × {item.quantity}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    {Number(item.subtotal || (item.product_detail?.price * item.quantity)).toLocaleString()} XAF
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{subtotal.toLocaleString()} XAF</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary-600">
                  <span>Discount</span>
                  <span>-{discount.toLocaleString()} XAF</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total</span>
                <span className="text-primary-700">{total.toLocaleString()} XAF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
