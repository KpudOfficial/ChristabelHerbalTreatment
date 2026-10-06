import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp, ShoppingBag, Calendar, Clock, DollarSign,
  BadgeDollarSign, Coins, CreditCard, ShoppingCart, Package, Box,
  CalendarCheck, CalendarDays, Timer, Hourglass, BarChart2, Activity, Users,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { adminAPI } from '../../services/api'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { format } from 'date-fns'
import LoadingPage from '../../components/ui/LoadingPage'

// Map icon name → Lucide component
const ICON_MAP = {
  DollarSign, BadgeDollarSign, Coins, CreditCard,
  ShoppingBag, ShoppingCart, Package, Box,
  Calendar, CalendarCheck, CalendarDays, Clock,
  Timer, Hourglass, TrendingUp, BarChart2, Activity, Users,
}

function resolveIcon(name, fallback) {
  return ICON_MAP[name] || fallback
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminAPI.getDashboard,
    refetchInterval: 30000,
  })

  // Load site settings to get configurable dashboard icons (shared context — no extra fetch)
  const { settings: s } = useSiteSettings()

  if (isLoading) return <LoadingPage />

  const stats = data?.data

  // Resolve icons from settings, falling back to defaults
  const RevenueIcon  = resolveIcon(s?.dashboard_icon_revenue,  DollarSign)
  const OrdersIcon   = resolveIcon(s?.dashboard_icon_orders,   ShoppingBag)
  const BookingsIcon = resolveIcon(s?.dashboard_icon_bookings, Calendar)
  const PendingIcon  = resolveIcon(s?.dashboard_icon_pending,  Clock)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Sales & Booking Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of today's performance and trends</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={RevenueIcon}  label="Today's Revenue"  value={`${Number(stats?.today?.revenue || 0).toLocaleString()} XAF`} color="primary" />
        <StatCard icon={OrdersIcon}   label="Today's Orders"   value={stats?.today?.orders || 0}         color="blue" />
        <StatCard icon={BookingsIcon} label="Today's Bookings" value={stats?.today?.bookings || 0}       color="purple" />
        <StatCard icon={PendingIcon}  label="Pending Orders"   value={stats?.today?.pending_orders || 0} color="yellow" />
      </div>

      {/* Weekly chart */}
      <div className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 mb-4">Weekly Revenue</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats?.weekly_chart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tickFormatter={(d) => format(new Date(d), 'EEE d')}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} XAF`, 'Revenue']}
              labelFormatter={(label) => format(new Date(label), 'EEEE, MMM d')}
            />
            <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly trend */}
      <div className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 mb-4">Monthly Revenue & Orders</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats?.monthly_chart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tickFormatter={(d) => format(new Date(d), 'MMM')}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip
              labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')}
              formatter={(value, name) => name === 'revenue' ? [`${Number(value).toLocaleString()} XAF`, 'Revenue'] : [value, 'Orders']}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent orders + appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-2">
            {(stats?.recent_orders || []).slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                  <span className="text-xs text-gray-400 ml-2">{order.user_email}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary-700">{Number(order.total).toLocaleString()} XAF</div>
                  <div className={`text-xs ${order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.status}</div>
                </div>
              </div>
            ))}
            {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
              <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-gray-900 mb-4">Recent Appointments</h2>
          <div className="space-y-2">
            {(stats?.recent_appointments || []).slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900">{apt.user_name || apt.user_email}</span>
                  <span className="text-xs text-gray-400 ml-2">{apt.service_detail?.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-700">{apt.date} {apt.time}</div>
                  <div className={`text-xs ${apt.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>{apt.status}</div>
                </div>
              </div>
            ))}
            {(!stats?.recent_appointments || stats.recent_appointments.length === 0) && (
              <p className="text-sm text-gray-400 py-4 text-center">No appointments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  }
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color] || colors.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 ml-13">{value}</p>
    </div>
  )
}
