import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, X, Ban } from 'lucide-react'
import { adminAPI, appointmentsAPI } from '../../services/api'
import {
  format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks,
  isToday, startOfDay,
} from 'date-fns'
import LoadingPage from '../../components/ui/LoadingPage'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  no_show: 'bg-red-100 text-red-800 border-red-200',
}

export default function AdminCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockDate, setBlockDate] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const queryClient = useQueryClient()

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Fetch all appointments
  const { data: apptData, isLoading } = useQuery({
    queryKey: ['admin-appointments', format(weekStart, 'yyyy-MM-dd')],
    queryFn: () => appointmentsAPI.getAppointments(),
  })

  // Fetch blocked dates
  const { data: blockedData } = useQuery({
    queryKey: ['admin-blocked-dates'],
    queryFn: adminAPI.getBlockedDates,
  })

  const appointments = apptData?.data?.results || apptData?.data || []
  const blockedDates = (blockedData?.data?.results || blockedData?.data || []).map(d => d.date)

  const blockMutation = useMutation({
    mutationFn: adminAPI.addBlockedDate,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blocked-dates'])
      queryClient.invalidateQueries(['admin-appointments'])
      toast.success('Date blocked.')
      setShowBlockModal(false)
      setBlockDate('')
      setBlockReason('')
    },
    onError: () => toast.error('Failed to block date.'),
  })

  const unblockMutation = useMutation({
    mutationFn: adminAPI.removeBlockedDate,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blocked-dates'])
      toast.success('Date unblocked.')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminAPI.updateAppointment(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments'])
      toast.success('Appointment updated.')
      setSelectedAppt(null)
    },
  })

  const getAppointmentsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return appointments.filter((a) => a.date === dayStr)
  }

  const isBlocked = (day) => {
    return blockedDates.includes(format(day, 'yyyy-MM-dd'))
  }

  const handleBlockSubmit = (e) => {
    e.preventDefault()
    if (!blockDate) return
    blockMutation.mutate({ date: blockDate, reason: blockReason })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Booking Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Manage appointments and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowBlockModal(true)} className="btn-outline text-sm">
            <Ban className="w-4 h-4" /> Block Date
          </button>
          <button onClick={() => setCurrentWeek(new Date())} className="btn-ghost text-sm">Today</button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="btn-ghost p-2" aria-label="Previous week">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-heading font-semibold text-gray-900">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
        </span>
        <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="btn-ghost p-2" aria-label="Next week">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <LoadingPage />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {days.map((day) => {
            const dayAppts = getAppointmentsForDay(day)
            const blocked = isBlocked(day)
            const isPast = day < startOfDay(new Date())

            return (
              <div
                key={day.toISOString()}
                className={`card overflow-hidden ${isToday(day) ? 'ring-2 ring-primary-400' : ''} ${blocked ? 'bg-red-50' : isPast ? 'opacity-60' : ''}`}
              >
                {/* Day header */}
                <div className={`px-3 py-2 text-center border-b ${isToday(day) ? 'bg-primary-600 text-white' : 'bg-gray-50'}`}>
                  <div className="text-xs font-medium uppercase">{format(day, 'EEE')}</div>
                  <div className="text-lg font-bold">{format(day, 'd')}</div>
                </div>

                {/* Blocked indicator */}
                {blocked && (() => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const allBlocked = blockedData?.data?.results || blockedData?.data || []
                  const blockedRec = allBlocked.find(d => d.date === dateStr)
                  return (
                    <div className="px-2 py-1 bg-red-100 text-red-700 text-xs text-center font-medium">
                      Blocked
                      {blockedRec && (
                        <button
                          onClick={() => unblockMutation.mutate(blockedRec.id)}
                          className="ml-1 underline hover:text-red-900"
                        >
                          Unblock
                        </button>
                      )}
                    </div>
                  )
                })()}

                {/* Appointments */}
                <div className="p-2 space-y-1.5 min-h-[120px]">
                  {dayAppts.length === 0 && !blocked && (
                    <div className="text-center text-xs text-gray-300 py-4">No bookings</div>
                  )}
                  {dayAppts.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedAppt(apt)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg border text-xs transition-colors hover:shadow-sm ${STATUS_COLORS[apt.status] || STATUS_COLORS.pending}`}
                    >
                      <div className="font-medium">{apt.time}</div>
                      <div className="truncate">{apt.user_name || apt.user_email}</div>
                      <div className="truncate text-[10px] opacity-75">{apt.service_detail?.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Appointment detail modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAppt(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold">Appointment Details</h2>
              <button onClick={() => setSelectedAppt(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <Info label="Patient" value={selectedAppt.user_name || selectedAppt.user_email} />
              <Info label="Service" value={selectedAppt.service_detail?.name} />
              <Info label="Date" value={`${selectedAppt.date} at ${selectedAppt.time}`} />
              <Info label="Duration" value={`${selectedAppt.service_detail?.duration_minutes} min`} />
              <Info label="Status" value={selectedAppt.status} />
              {selectedAppt.notes && <Info label="Notes" value={selectedAppt.notes} />}
            </div>
            <div className="flex gap-2 mt-6">
              {selectedAppt.status === 'pending' && (
                <button
                  onClick={() => updateStatusMutation.mutate({ id: selectedAppt.id, status: 'confirmed' })}
                  className="btn-primary flex-1 text-sm justify-center"
                >
                  Confirm
                </button>
              )}
              {selectedAppt.status === 'confirmed' && (
                <button
                  onClick={() => updateStatusMutation.mutate({ id: selectedAppt.id, status: 'completed' })}
                  className="btn-primary flex-1 text-sm justify-center"
                >
                  Mark Completed
                </button>
              )}
              {['pending', 'confirmed'].includes(selectedAppt.status) && (
                <button
                  onClick={() => updateStatusMutation.mutate({ id: selectedAppt.id, status: 'cancelled' })}
                  className="btn-outline text-red-600 border-red-200 hover:bg-red-50 text-sm flex-1 justify-center"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block date modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowBlockModal(false)}>
          <form onSubmit={handleBlockSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-500" /> Block a Date
              </h2>
              <button type="button" onClick={() => setShowBlockModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="label">Date to block</label>
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                required
                min={format(new Date(), 'yyyy-MM-dd')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Reason (optional)</label>
              <input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Holiday, conference, etc."
                className="input-field"
              />
            </div>
            <button type="submit" disabled={blockMutation.isPending} className="btn-primary w-full justify-center text-red-600 bg-red-50 border border-red-200 hover:bg-red-100">
              {blockMutation.isPending ? 'Blocking…' : 'Block This Date'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-20 flex-shrink-0">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
