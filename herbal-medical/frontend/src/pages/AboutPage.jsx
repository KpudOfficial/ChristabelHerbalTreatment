import { useQuery } from '@tanstack/react-query'
import { Leaf, Heart, Award, Shield } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { certificatesAPI } from '../services/api'
import { useSiteSettings } from '../context/SiteSettingsContext'

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000'

export default function AboutPage() {
  const { settings } = useSiteSettings()
  const { data: certsData } = useQuery({
    queryKey: ['certificates'],
    queryFn: certificatesAPI.getCertificates,
  })

  const certificates = certsData?.data?.results || certsData?.data || []

  // Use react-markdown to render the story (supports **bold**, *italic*, lists, headings)
  const storyContent = settings.about_story || `${settings.site_name} was founded by Dr. Christabel, a certified herbal medicine practitioner with over 15 years of experience. Inspired by generations of traditional knowledge in Cameroon and trained in modern phytotherapy, Dr. Christabel established this practice to bridge the gap between traditional wisdom and contemporary healthcare.\n\nWe believe that nature provides powerful remedies for many common and chronic conditions. Our approach is holistic — we don't just treat symptoms, we address the root causes of illness while supporting your body's natural healing abilities.\n\nAll our herbal products are sourced from organic-certified farms and prepared under strict quality controls. We are proud to be approved by the Cameroon Ministry of Public Health.`

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-herbal-dark via-primary-800 to-primary-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Leaf className="w-12 h-12 text-herbal-mint mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            {settings.about_hero_title || `About ${settings.site_name}`}
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            {settings.about_hero_subtitle || 'Combining the wisdom of traditional African herbal medicine with modern evidence-based practice. Our mission is to provide safe, effective, and affordable natural healthcare to our community.'}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="section-heading mb-6">Our Story</h2>

        {/* Doctor / founder block — shown if name or bio is set */}
        {(settings.about_doctor_name || settings.about_doctor_bio || settings.about_doctor_image_url) && (
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 p-6 bg-primary-50 rounded-2xl">
            {settings.about_doctor_image_url && (
              <img
                src={settings.about_doctor_image_url}
                alt={settings.about_doctor_name || 'Doctor'}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
              />
            )}
            <div>
              {settings.about_doctor_name && (
                <h3 className="font-heading font-semibold text-herbal-dark text-lg mb-1">
                  {settings.about_doctor_name}
                </h3>
              )}
              {settings.about_doctor_bio && (
                <p className="text-gray-600 text-sm leading-relaxed">{settings.about_doctor_bio}</p>
              )}
            </div>
          </div>
        )}

        <div className="prose prose-lg max-w-none text-gray-600
          [&_h1]:font-heading [&_h1]:font-bold [&_h1]:text-gray-900
          [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-gray-900
          [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:text-gray-900
          [&_p]:leading-relaxed [&_p]:mb-4
          [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1
          [&_ol]:list-decimal [&_ol]:pl-6
          [&_strong]:font-semibold [&_strong]:text-gray-800
          [&_a]:text-primary-600 [&_a]:underline">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{storyContent}</ReactMarkdown>
        </div>
      </section>

      {/* Values */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="section-heading text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Patient-Centered Care', desc: 'Every treatment is personalized to your unique needs and health goals.' },
              { icon: Leaf, title: 'Natural & Safe', desc: 'We use only high-quality, organic herbal products with proven safety records.' },
              { icon: Shield, title: 'Evidence-Based', desc: 'Our treatments are grounded in both traditional knowledge and scientific research.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <Icon className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                <h3 className="font-heading font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      {certificates.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-16" id="certifications">
          <div className="text-center mb-10">
            <h2 className="section-heading">Our Certifications</h2>
            <p className="section-subheading">Accredited and compliant with national standards</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="card p-6">
                <div className="flex items-start gap-4">
                  {cert.image ? (
                    <img
                      src={cert.image.startsWith('http') ? cert.image : `${MEDIA_URL}${cert.image}`}
                      alt={cert.title}
                      className="w-14 h-14 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-7 h-7 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.title}</h3>
                    <p className="text-sm text-gray-500">{cert.issuing_body}</p>
                    {cert.certificate_number && (
                      <p className="text-xs text-gray-400 mt-1">#{cert.certificate_number}</p>
                    )}
                    {cert.valid_from && cert.valid_to && (
                      <p className="text-xs text-gray-400 mt-1">
                        Valid: {new Date(cert.valid_from).toLocaleDateString()} – {new Date(cert.valid_to).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
