import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import Layout from './components/layout/Layout'
import RequireAuth from './components/auth/RequireAuth'
import RequireAdmin from './components/auth/RequireAdmin'

// Public pages
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Auth-required pages
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import BookingPage from './pages/BookingPage'
import DashboardPage from './pages/DashboardPage'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBanners from './pages/admin/AdminBanners'
import AdminCalendar from './pages/admin/AdminCalendar'
import AdminSettings from './pages/admin/AdminSettings'
import AdminProducts from './pages/admin/AdminProducts'
import AdminServices from './pages/admin/AdminServices'
import AdminBlog from './pages/admin/AdminBlog'
import AdminAbout from './pages/admin/AdminAbout'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SiteSettingsProvider>
          <Routes>
          {/* Public routes with shared layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:slug" element={<ProductDetailPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Auth-required */}
            <Route element={<RequireAuth />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders/:id" element={<OrderConfirmationPage />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* 404 inside the shared layout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin panel — separate layout */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="calendar" element={<AdminCalendar />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
        </SiteSettingsProvider>
      </CartProvider>
    </AuthProvider>
  )
}
