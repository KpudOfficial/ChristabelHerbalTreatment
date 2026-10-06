from django.urls import path
from .views import (
    AppointmentListCreateView, AppointmentDetailView,
    AvailabilityView, AvailableSlotsView, BlockedDateListView,
    AdminAvailabilityView, AdminBlockedDateView, AdminBlockedDateDetailView,
    AdminAppointmentView,
)

urlpatterns = [
    # Slots must come BEFORE <int:pk> to avoid Django trying to cast "slots" as int
    path('appointments/slots/', AvailableSlotsView.as_view(), name='appointment-slots'),
    path('appointments/', AppointmentListCreateView.as_view(), name='appointment-list'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    # Availability
    path('availability/', AvailabilityView.as_view(), name='availability-list'),
    path('availability/blocked/', BlockedDateListView.as_view(), name='blocked-dates'),
    # Admin endpoints
    path('admin/availability/', AdminAvailabilityView.as_view(), name='admin-availability'),
    path('admin/blocked-dates/', AdminBlockedDateView.as_view(), name='admin-blocked-dates'),
    path('admin/blocked-dates/<int:pk>/', AdminBlockedDateDetailView.as_view(), name='admin-blocked-date-detail'),
    path('admin/appointments/<int:pk>/', AdminAppointmentView.as_view(), name='admin-appointment-detail'),
]
