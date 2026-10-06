import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import { format, startOfDay } from 'date-fns'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { appointmentsAPI, productsAPI, paymentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingPage from '../components/ui/LoadingPage'
import toast from 'react-hot-toast'

export default function BookingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || '')
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState(1)
  const [appointment, setAppointment] = useState(null)
  const [paymentRef, setPaymentRef] = useState(null)
  const [isBooking, setIsBooking] = useState(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: productsAPI.getServices,
    staleTime: Infinity,
  })

  const { data: blockedData } = useQuery({
    queryKey: ['blocked-dates'],
    queryFn: appointmentsAPI.getBlockedDates,
    staleTime: 1000 * 60 * 5,
  })

  const { data: availabilityData } = useQuery({
    queryKey: ['availability'],
    queryFn: appointmentsAPI.getAvailability,
    staleTime: Infinity,
  })

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', selectedDate, selectedService],
    queryFn: () => appointmentsAPI.getAvailableSlots(
      format(selectedDate, 'yyyy-MM-dd'),
      selectedService
    ),
    enabled: !!selectedDate,
  })

  const services = servicesData?.data?.results || servicesData?.data || []
  const blockedDates = (blockedData?.data?.results || blockedData?.data || []).map((d) => d.date)
  const availability = availabilityData?.data?.results || availabilityData?.data || []
  const availabilityLoaded = !!availabilityData
  // If no schedule configured, fall back to Mon–Sat (0–5) as open days
  const activeDays = availability.length > 0
    ? availability.filter(a => a.is_active !== false).map((a) => a.day_of_week)
    : [0, 1, 2, 3, 4, 5]
  const slots = slotsData?.data?.slots || []
  const service = services.find((s) => String(s.id) === String(selectedService))
  const today = startOfDay(new Date())

  // Determines if a date is bookable.
  // While availability data is still loading, allow all future non-past dates
  // so the calendar shows green instead of a wall of grey.
  const isDateAvailable = (date) => {
    if (date < today) return false
    if (!availabilityLoaded) return true  // still loading — optimistically show as available
    const dow = date.getDay() === 0 ? 6 : date.getDay() - 1  // JS Sun=0 → Mon=0 system
    if (!activeDays.includes(dow)) return false
    const dateStr = format(date, 'yyyy-MM-dd')
    if (blockedDates.includes(dateStr)) return false
    return true
  }

  // react-calendar tile disabling
  const tileDisabled = ({ date, view }) => view === 'month' && !isDateAvailable(date)

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setStep(3)
  }

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedSlot || !selectedService) return
    setIsBooking(true)
    try {
      const res = await appointmentsAPI.createAppointment({
        service: selectedService,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedSlot,
        notes,
      })
      setAppointment(res.data)
      setStep(5)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  const handleInitiatePayment = async () => {
    if (!appointment || !user?.phone) {
      toast.error('Please update your phone number in your profile first.')
      return
    }
    setIsPaymentLoading(true)
    try {
      const res = await paymentsAPI.initiatePayment({
        appointment_id: appointment.id,
        phone_number: user.phone,
      })
      if (res.data.success) {
        setPaymentRef(res.data.reference)
        toast.success('USSD prompt sent. Approve payment on your phone.')
        pollForPayment(res.data.reference)
      } else {
        toast.error(res.data.error || 'Payment initiation failed.')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed.')
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const pollForPayment = (reference) => {
    let attempts = 0
    const timer = setInterval(async () => {
      attempts++
      try {
        const res = await paymentsAPI.getPaymentStatus(reference)
        if (res.data.status === 'successful') {
          clearInterval(timer)
          toast.success('Appointment confirmed and paid!')
          navigate('/dashboard')
        } else if (res.data.status === 'failed') {
          clearInterval(timer)
          toast.error('Payment failed. The appointment is still reserved — try paying again.')
        }
      } catch (_) {}
      if (attempts >= 24) { clearInterval(timer); navigate('/dashboard') }
    }, 5000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Book an Appointment</h1>
      <p className="text-gray-500 mb-8">Choose a service, pick a date, and confirm your booking.</p>

      {/* Step 1 — Service */}
      {step >= 1 && (
        <div className="card p-5 sm:p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <StepBadge n={1} done={!!selectedService} />
            Select Service
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => { setSelectedService(String(svc.id)); if (step < 2) setStep(2) }}
                className={`text-left p-4 rounded-xl border-2 transition-colors min-h-[64px] ${
                  String(selectedService) === String(svc.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-200'
                }`}
              >
                <div className="font-medium text-gray-900">{svc.name}</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {svc.duration_minutes} min · {Number(svc.price).toLocaleString()} XAF
                </div>
                {svc.short_description && (
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2">{svc.short_description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Calendar date picker */}
      {step >= 2 && selectedService && (
        <div className="card p-5 sm:p-6 mb-4" style={{ overflow: 'visible' }}>
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <StepBadge n={2} done={!!selectedDate} />
            Select Date
          </h2>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary-600 inline-block" /> Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary-100 border border-primary-300 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-gray-100 inline-block" /> Unavailable
            </span>
          </div>

          <div className="booking-calendar">
            <Calendar
              onChange={handleDateSelect}
              value={selectedDate}
              minDate={today}
              tileDisabled={tileDisabled}
              tileContent={({ date, view }) => {
                if (view !== 'month') return null
                const available = isDateAvailable(date)
                const isSelected = selectedDate &&
                  format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                return (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: available ? '600' : '400',
                      background: isSelected
                        ? '#16a34a'
                        : available
                        ? '#dcfce7'
                        : 'transparent',
                      color: isSelected
                        ? '#ffffff'
                        : available
                        ? '#15803d'
                        : '#d1d5db',
                      border: isSelected ? '2px solid #16a34a' : available ? '1px solid #86efac' : 'none',
                      cursor: available ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s',
                    }}
                  >
                    {format(date, 'd')}
                  </div>
                )
              }}
              showNavigation
              locale="en-GB"
              formatShortWeekday={(_, date) => {
                const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
                return days[date.getDay() === 0 ? 6 : date.getDay() - 1]
              }}
              // Hide default tile numbers since we render them in tileContent
              formatDay={() => ''}
            />
          </div>

          {selectedDate && (
            <div className="mt-4 flex items-center gap-2 bg-primary-50 rounded-xl px-4 py-3">
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {format(selectedDate, 'd')}
              </span>
              <div>
                <p className="text-sm font-semibold text-primary-800">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-xs text-primary-600">Select a time slot below</p>
              </div>
            </div>
          )}

          {/* Time slots — rendered inside this card so no page scroll occurs */}
          {selectedDate && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <StepBadge n={3} done={!!selectedSlot} />
                Available Times
              </h3>
              {slotsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 spinner border-2" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-gray-500 text-sm">No slots available for this date. Try another day.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(({ time, available }) => (
                    <button
                      key={time}
                      onClick={() => { if (available) { setSelectedSlot(time); setStep(4) } }}
                      disabled={!available}
                      className={`py-3 px-2 text-sm rounded-lg border transition-colors min-h-[44px] ${
                        selectedSlot === time
                          ? 'bg-primary-600 text-white border-primary-600'
                          : available
                          ? 'border-gray-200 hover:border-primary-400 text-gray-700'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3 card removed — time slots now live inside the calendar card above */}

      {/* Step 4 — Confirm */}
      {step >= 4 && selectedSlot && (
        <div className="card p-5 sm:p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <StepBadge n={4} done={false} />
            Confirm Booking
          </h2>
          <div className="bg-primary-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <SummaryRow label="Service" value={service?.name} />
            <SummaryRow label="Date" value={format(selectedDate, 'EEEE, MMMM d, yyyy')} />
            <SummaryRow label="Time" value={selectedSlot} />
            <SummaryRow label="Duration" value={`${service?.duration_minutes} minutes`} />
            <SummaryRow label="Fee" value={`${Number(service?.price).toLocaleString()} XAF`} bold />
          </div>
          <div className="mb-4">
            <label className="label" htmlFor="notes">Notes for the doctor (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Describe your symptoms or concerns…"
            />
          </div>
          <button onClick={handleConfirmBooking} disabled={isBooking} className="btn-primary w-full">
            {isBooking ? 'Booking…' : 'Confirm Appointment'}
          </button>
        </div>
      )}

      {/* Step 5 — Payment */}
      {step === 5 && appointment && (
        <div className="card p-8 text-center">
          <CheckCircle className="w-14 h-14 text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Appointment Created!</h2>
          <p className="text-gray-500 mb-6">
            Your appointment is <strong>pending</strong>. Complete payment to confirm it.
          </p>
          {!paymentRef ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Payment will be sent to: <strong>{user?.phone || 'your registered phone'}</strong>
              </p>
              {!user?.phone && (
                <p className="text-orange-600 text-sm mb-4">
                  ⚠️ Please add a phone number to your profile to complete payment.
                </p>
              )}
              <button
                onClick={handleInitiatePayment}
                disabled={isPaymentLoading || !user?.phone}
                className="btn-primary w-full"
              >
                {isPaymentLoading ? 'Sending prompt…' : `Pay ${Number(service?.price).toLocaleString()} XAF`}
              </button>
            </>
          ) : (
            <div>
              <div className="w-12 h-12 mx-auto mb-3 spinner border-4" />
              <p className="text-gray-600">Waiting for payment approval…</p>
            </div>
          )}
          <button onClick={() => navigate('/dashboard')} className="btn-ghost w-full mt-3 text-sm">
            Pay later from Dashboard
          </button>
        </div>
      )}
    </div>
  )
}

function StepBadge({ n, done }) {
  return (
    <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : 'bg-primary-600'}`}>
      {done ? '✓' : n}
    </span>
  )
}

function SummaryRow({ label, value, bold }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-right ${bold ? 'font-bold text-primary-700' : 'font-medium'}`}>{value}</span>
    </div>
  )
}
