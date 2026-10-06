/**
 * Axios API client with JWT auth, token refresh, and error handling.
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// Request interceptor: attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: auto-refresh on 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        })
        const { access } = response.data
        localStorage.setItem('access_token', access)
        api.defaults.headers.common.Authorization = `Bearer ${access}`
        processQueue(null, access)
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
}

// Products
export const productsAPI = {
  getCategories: () => api.get('/categories/'),
  getProducts: (params) => api.get('/products/', { params }),
  getProduct: (slug) => api.get(`/products/${slug}/`),
  getServices: () => api.get('/services/'),
  getService: (slug) => api.get(`/services/${slug}/`),
}

// Cart
export const cartAPI = {
  getCart: () => api.get('/cart/'),
  addItem: (data) => api.post('/cart/items/', data),
  updateItem: (id, quantity) => api.patch(`/cart/items/${id}/`, { quantity }),
  removeItem: (id) => api.delete(`/cart/items/${id}/`),
  mergeCart: (items) => api.post('/cart/merge/', { items }),
}

// Orders
export const ordersAPI = {
  createOrder: (data) => api.post('/orders/create/', data),
  getOrders: () => api.get('/orders/'),
  getOrder: (id) => api.get(`/orders/${id}/`),
}

// Payments
export const paymentsAPI = {
  initiatePayment: (data) => api.post('/payments/campay/collect/', data),
  getPaymentStatus: (reference) => api.get(`/payments/campay/status/${reference}/`),
}

// Appointments
export const appointmentsAPI = {
  getAvailability: () => api.get('/availability/'),
  getAvailableSlots: (date, serviceId) =>
    api.get('/appointments/slots/', { params: { date, service_id: serviceId } }),
  getBlockedDates: () => api.get('/availability/blocked/'),
  createAppointment: (data) => api.post('/appointments/', data),
  getAppointments: () => api.get('/appointments/'),
  cancelAppointment: (id, reason) => api.delete(`/appointments/${id}/`, { data: { reason } }),
}

// Blog
export const blogAPI = {
  getPosts: (params) => api.get('/blog/', { params }),
  getPost: (slug) => api.get(`/blog/${slug}/`),
}

// Banners
export const bannersAPI = {
  getActiveBanners: (placement) =>
    api.get('/banners/active/', { params: placement ? { placement } : {} }),
  trackClick: (id) => api.post(`/banners/click/${id}/`),
}

// Certificates
export const certificatesAPI = {
  getCertificates: () => api.get('/certificates/'),
}

// Coupons
export const couponsAPI = {
  validate: (code, orderTotal) =>
    api.post('/coupons/validate/', { code, order_total: orderTotal }),
}

// Reviews
export const reviewsAPI = {
  create: (data) => api.post('/reviews/', data),
}

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard/'),
  // Banners
  getBanners: () => api.get('/admin/banners/'),
  createBanner: (data) => api.post('/admin/banners/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateBanner: (id, data) => {
    const isFormData = data instanceof FormData
    return api.patch(`/admin/banners/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
  },
  deleteBanner: (id) => api.delete(`/admin/banners/${id}/`),
  // Appointments / availability
  getAppointments: () => api.get('/appointments/'),
  updateAppointment: (id, data) => api.patch(`/admin/appointments/${id}/`, data),
  getAvailability: () => api.get('/admin/availability/'),
  updateAvailability: (data) => api.post('/admin/availability/', data),
  getBlockedDates: () => api.get('/admin/blocked-dates/'),
  addBlockedDate: (data) => api.post('/admin/blocked-dates/', data),
  removeBlockedDate: (id) => api.delete(`/admin/blocked-dates/${id}/`),
  // Categories
  getCategories: () => api.get('/admin/categories/'),
  createCategory: (data) => api.post('/admin/categories/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateCategory: (id, data) => api.patch(`/admin/categories/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}/`),
  // Products
  getProducts: () => api.get('/admin/products/'),
  createProduct: (data) => api.post('/admin/products/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, data) => api.patch(`/admin/products/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}/`),
  // Services
  getServices: () => api.get('/admin/services/'),
  createService: (data) => api.post('/admin/services/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateService: (id, data) => api.patch(`/admin/services/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteService: (id) => api.delete(`/admin/services/${id}/`),
  // Blog
  getBlogPosts: () => api.get('/admin/blog/'),
  createBlogPost: (data) => api.post('/admin/blog/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateBlogPost: (id, data) => api.patch(`/admin/blog/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteBlogPost: (id) => api.delete(`/admin/blog/${id}/`),
}

// Site Settings
export const siteSettingsAPI = {
  get: () => api.get('/site-settings/'),
  update: (formData) =>
    api.patch('/admin/site-settings/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
