import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, Calendar, User } from 'lucide-react'
import { ordersAPI, appointmentsAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import LoadingPage from '../components/ui/LoadingPage'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_COLORS = {
  pending: 'badge-yellow',
  paid: 'badge-green',
  processing: 'badge-green',
  shipped: 'badge-green',
  delivered: 'badge-green',
  cancelled: 'badge-red',
  confirmed: 'badge-green',
  completed: 'badge-gray',
  no_show: 'badge-red',
}

export default function DashboardPage() {
  const [tab, setTab] = useState('orders')
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersAPI.getOrders,
    enabled: tab === 'orders',
  })

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: appointmentsAPI.getAppointments,
    enabled: tab === 'appointments',
  })

  const orders = ordersData?.data?.results || ordersData?.data || []
  const appointments = appointmentsData?.data?.results || appointmentsData?.data || []

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    }
  })

  const handleProfileUpdate = async (data) => {
    try {
      const res = await authAPI.updateProfile(data)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error('Failed to update profile.')
    }
  }

  const handleCancelAppointment = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await appointmentsAPI.cancelAppointment(id, 'Cancelled by patient')
      queryClient.invalidateQueries(['my-appointments'])
      toast.success('Appointment cancelled.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel this appointment.')
    }
  }

  const tabs = [
    { key: 'orders', label: 'Orders', icon: Package },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">My Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user?.first_name || user?.email}</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-8" role="tablist">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div>
          {ordersLoading ? (
            <LoadingPage />
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No orders yet.</p>
              <Link to="/shop" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">Order #{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </div>
                    <span className={STATUS_COLORS[order.status] || 'badge-gray'}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {order.items?.slice(0,3).map((item) => (
                      <span key={item.id} className="mr-2">
                        {item.product_detail?.name} ×{item.quantity}
                      </span>
                    ))}
                    {order.items?.length > 3 && <span className="text-gray-400">+{order.items.length - 3} more</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-700">{Number(order.total).toLocaleString()} XAF</span>
                    <Link to={`/orders/${order.id}`}
                      className="text-sm text-primary-600 hover:underline px-2 py-1.5 rounded hover:bg-primary-50 transition-colors min-h-[36px] inline-flex items-center">
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {tab === 'appointments' && (
        <div>
          {appointmentsLoading ? (
            <LoadingPage />
          ) : appointments.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No appointments yet.</p>
              <Link to="/book" className="btn-primary">Book a Consultation</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{apt.service_detail?.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {apt.date} at {apt.time}
                      </div>
                      {apt.notes && <p className="text-sm text-gray-600 mt-1">{apt.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={STATUS_COLORS[apt.status] || 'badge-gray'}>{apt.status}</span>
                      {['pending', 'confirmed'].includes(apt.status) && (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5 rounded hover:bg-red-50 transition-colors min-h-[36px]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSubmit(handleProfileUpdate)} className="max-w-lg space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First name</label>
              <input {...register('first_name')} className="input-field" />
            </div>
            <div>
              <label className="label">Last name</label>
              <input {...register('last_name')} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email} disabled className="input-field bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="label">Phone number</label>
            <input {...register('phone')} className="input-field" placeholder="677001234" />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea {...register('address')} className="input-field" rows={3} placeholder="Your address…" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  )
}
