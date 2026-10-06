import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, ArrowRight } from 'lucide-react'
import { productsAPI } from '../services/api'
import LoadingPage from '../components/ui/LoadingPage'
import BannerStrip from '../components/ui/BannerStrip'
import SwipeRow from '../components/ui/SwipeRow'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

export default function ServicesPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: productsAPI.getServices,
  })

  const services = data?.data?.results || data?.data || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="section-heading">Consultation Services</h1>
        <p className="section-subheading">Book expert herbal medicine consultations</p>
      </div>

      {/* Sidebar/promo banner for services page */}
      <BannerStrip placement="sidebar" />

      {isLoading ? (
        <LoadingPage />
      ) : (
        <SwipeRow gridCols="md:grid-cols-2 lg:grid-cols-3" cardWidth="min(82vw, 320px)">
          {services.map((svc) => {
            const imageUrl = svc.image
              ? (svc.image.startsWith('http') ? svc.image : `${MEDIA_URL}${svc.image}`)
              : null
            return (
              <div key={svc.id} className="card p-6 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-4 text-3xl flex-shrink-0">
                  🩺
                </div>
                <h2 className="font-heading font-bold text-lg text-gray-900 mb-2">{svc.name}</h2>
                <p className="text-sm text-gray-500 mb-4 flex-1">{svc.description}</p>
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" /> {svc.duration_minutes} min
                  </span>
                  <span className="font-bold text-primary-700">{Number(svc.price).toLocaleString()} XAF</span>
                </div>
                <button
                  onClick={() => navigate(`/book?service=${svc.id}`)}
                  className="btn-primary w-full justify-center text-sm mt-auto"
                >
                  Book Appointment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </SwipeRow>
      )}
    </div>
  )
}
