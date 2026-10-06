import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, ArrowRight, CheckCircle } from 'lucide-react'
import { productsAPI } from '../services/api'
import LoadingPage from '../components/ui/LoadingPage'

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => productsAPI.getService(slug),
  })

  const service = data?.data

  if (isLoading) return <LoadingPage />
  if (error || !service) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Service not found.</p>
      <Link to="/services" className="btn-primary mt-4">All Services</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary-600">Home</Link> /{' '}
        <Link to="/services" className="hover:text-primary-600">Services</Link> /{' '}
        <span className="text-gray-900">{service.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="rounded-2xl bg-primary-50 flex items-center justify-center min-h-[300px]">
          {service.image ? (
            <img
              src={service.image.startsWith('http') ? service.image : `${import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'}${service.image}`}
              alt={service.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="text-8xl">🩺</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-3">{service.name}</h1>
          <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700">{service.duration_minutes} minutes</span>
            </div>
            <div className="text-2xl font-bold text-primary-700">
              {Number(service.price).toLocaleString()} XAF
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {['Personalized assessment', 'Expert herbal advice', 'Treatment plan included'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-primary-600" /> {item}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(`/book?service=${service.id}`)}
            className="btn-primary w-full justify-center py-3"
          >
            Book This Consultation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
