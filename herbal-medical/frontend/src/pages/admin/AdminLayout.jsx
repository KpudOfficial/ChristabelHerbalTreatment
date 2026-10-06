import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Image, Calendar, ExternalLink, Leaf, Settings, Package, Stethoscope, BookOpen, Info } from 'lucide-react'

export default function AdminLayout() {
  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/services', label: 'Services', icon: Stethoscope },
    { to: '/admin/blog', label: 'Blog Posts', icon: BookOpen },
    { to: '/admin/banners', label: 'Banner Scheduler', icon: Image },
    { to: '/admin/calendar', label: 'Booking Calendar', icon: Calendar },
    { to: '/admin/about', label: 'About Page', icon: Info },
    { to: '/admin/settings', label: 'Site Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-herbal-dark text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-herbal-mint" />
            <span className="font-heading font-bold">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
          <div className="pt-4 mt-4 border-t border-white/10">
            <a
              href="/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10"
            >
              <ExternalLink className="w-4 h-4" />
              Django Admin ↗
            </a>
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10">
              ← Back to Site
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between md:hidden">
          <Link to="/admin" className="flex items-center gap-2 text-herbal-dark font-bold">
            <Leaf className="w-5 h-5" /> Admin
          </Link>
          <select className="input-field w-auto text-sm" onChange={(e) => window.location.href = e.target.value}>
            <option value="/admin">Dashboard</option>
            <option value="/admin/products">Products</option>
            <option value="/admin/services">Services</option>
            <option value="/admin/blog">Blog Posts</option>
            <option value="/admin/banners">Banner Scheduler</option>
            <option value="/admin/calendar">Booking Calendar</option>
            <option value="/admin/about">About Page</option>
            <option value="/admin/settings">Site Settings</option>
          </select>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
