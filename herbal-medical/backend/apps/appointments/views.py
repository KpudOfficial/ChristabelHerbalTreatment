"""Appointment views: book, list, cancel, availability."""
from datetime import datetime, timedelta, date as date_type
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser

from .models import Appointment, Availability, BlockedDate
from .serializers import (
    AppointmentSerializer, AppointmentCreateSerializer,
    AvailabilitySerializer, BlockedDateSerializer,
)


class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Appointment.objects.all().select_related('user', 'service')
        return Appointment.objects.filter(user=self.request.user).select_related('service')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        appt_date = data['date']
        appt_time = data['time']

        # Check if date is blocked
        if BlockedDate.objects.filter(date=appt_date).exists():
            return Response({'error': 'This date is not available.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check availability for that day
        day_of_week = appt_date.weekday()
        try:
            availability = Availability.objects.get(day_of_week=day_of_week, is_active=True)
        except Availability.DoesNotExist:
            return Response({'error': 'Doctor is not available on this day.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check slot is within hours
        if not (availability.start_time <= appt_time <= availability.end_time):
            return Response({'error': 'Selected time is outside available hours.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check max bookings
        existing_count = Appointment.objects.filter(
            date=appt_date,
            status__in=[Appointment.PENDING, Appointment.CONFIRMED]
        ).count()
        if existing_count >= availability.max_appointments:
            return Response({'error': 'No slots available for this day.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for time collision (buffer included)
        buffer = timedelta(minutes=settings.BOOKING_BUFFER_MINUTES)
        service = data['service']
        appt_datetime = datetime.combine(appt_date, appt_time)
        appt_end = appt_datetime + timedelta(minutes=service.duration_minutes) + buffer

        conflicting = Appointment.objects.filter(
            date=appt_date,
            status__in=[Appointment.PENDING, Appointment.CONFIRMED],
        )
        for apt in conflicting:
            existing_start = datetime.combine(apt.date, apt.time)
            existing_end = existing_start + timedelta(minutes=apt.service.duration_minutes) + buffer
            if not (appt_end <= existing_start or appt_datetime >= existing_end):
                return Response({'error': 'This time slot is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check advance booking limit
        max_advance = date_type.today() + timedelta(days=settings.BOOKING_MAX_ADVANCE_DAYS)
        if appt_date > max_advance:
            return Response(
                {'error': f'Cannot book more than {settings.BOOKING_MAX_ADVANCE_DAYS} days in advance.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment = serializer.save(user=request.user)
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class AppointmentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Appointment.objects.all()
        return Appointment.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        appointment = self.get_object()

        # Check cancellation policy
        appt_datetime = datetime.combine(appointment.date, appointment.time)
        deadline = appt_datetime - timedelta(hours=settings.BOOKING_CANCELLATION_HOURS)

        if datetime.now() > deadline:
            return Response(
                {'error': f'Appointments cannot be cancelled within {settings.BOOKING_CANCELLATION_HOURS} hours.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if appointment.status in [Appointment.COMPLETED, Appointment.CANCELLED]:
            return Response({'error': 'Cannot cancel this appointment.'}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = Appointment.CANCELLED
        appointment.cancellation_reason = request.data.get('reason', '')
        appointment.save()
        return Response({'message': 'Appointment cancelled.'}, status=status.HTTP_200_OK)


class AvailabilityView(generics.ListAPIView):
    """Public endpoint to see doctor's working hours."""
    queryset = Availability.objects.filter(is_active=True)
    serializer_class = AvailabilitySerializer
    permission_classes = [AllowAny]


class AvailableSlotsView(APIView):
    """
    GET /api/appointments/slots/?date=YYYY-MM-DD&service_id=X
    Returns available time slots for a given date and service.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        date_str = request.query_params.get('date')
        service_id = request.query_params.get('service_id')

        if not date_str:
            return Response({'error': 'date parameter required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            appt_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        if appt_date < date_type.today():
            return Response({'slots': [], 'message': 'Date is in the past.'})

        if BlockedDate.objects.filter(date=appt_date).exists():
            return Response({'slots': [], 'message': 'This date is not available.'})

        day_of_week = appt_date.weekday()
        try:
            availability = Availability.objects.get(day_of_week=day_of_week, is_active=True)
        except Availability.DoesNotExist:
            return Response({'slots': [], 'message': 'No availability on this day.'})

        # Determine service duration
        service_duration = settings.BOOKING_SLOT_DURATION_MINUTES
        if service_id:
            from apps.products.models import Service
            try:
                svc = Service.objects.get(id=service_id, is_active=True)
                service_duration = svc.duration_minutes
            except Service.DoesNotExist:
                pass

        buffer = settings.BOOKING_BUFFER_MINUTES
        slot_duration = service_duration + buffer

        # Generate all possible slots
        slots = []
        current = datetime.combine(appt_date, availability.start_time)
        end_limit = datetime.combine(appt_date, availability.end_time)

        existing_appointments = Appointment.objects.filter(
            date=appt_date,
            status__in=[Appointment.PENDING, Appointment.CONFIRMED]
        ).select_related('service')

        while current + timedelta(minutes=service_duration) <= end_limit:
            slot_end = current + timedelta(minutes=service_duration) + timedelta(minutes=buffer)
            # Check for conflicts
            is_available = True
            for apt in existing_appointments:
                existing_start = datetime.combine(apt.date, apt.time)
                existing_end = existing_start + timedelta(minutes=apt.service.duration_minutes + buffer)
                if not (slot_end <= existing_start or current >= existing_end):
                    is_available = False
                    break

            slots.append({
                'time': current.strftime('%H:%M'),
                'available': is_available,
            })
            current += timedelta(minutes=slot_duration)

        return Response({'date': date_str, 'slots': slots})


class BlockedDateListView(generics.ListAPIView):
    """Public endpoint to see blocked dates."""
    queryset = BlockedDate.objects.filter(date__gte=date_type.today())
    serializer_class = BlockedDateSerializer
    permission_classes = [AllowAny]


class AdminAvailabilityView(generics.ListCreateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAdminUser]


class AdminBlockedDateView(generics.ListCreateAPIView):
    queryset = BlockedDate.objects.all()
    serializer_class = BlockedDateSerializer
    permission_classes = [IsAdminUser]


class AdminBlockedDateDetailView(generics.RetrieveDestroyAPIView):
    queryset = BlockedDate.objects.all()
    serializer_class = BlockedDateSerializer
    permission_classes = [IsAdminUser]


class AdminAppointmentView(generics.RetrieveUpdateAPIView):
    """Admin can update appointment status."""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAdminUser]
