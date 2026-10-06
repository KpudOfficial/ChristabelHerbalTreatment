"""Appointment serializers."""
from rest_framework import serializers
from datetime import date
from .models import Appointment, Availability, BlockedDate
from apps.products.serializers import ServiceSerializer


class AvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Availability
        fields = ('id', 'day_of_week', 'day_name', 'start_time', 'end_time',
                  'max_appointments', 'is_active')


class BlockedDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedDate
        fields = ('id', 'date', 'reason')


class AppointmentSerializer(serializers.ModelSerializer):
    service_detail = ServiceSerializer(source='service', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = (
            'id', 'user', 'user_email', 'user_name', 'service', 'service_detail',
            'date', 'time', 'status', 'notes', 'payment_reference',
            'cancellation_reason', 'created_at', 'updated_at',
        )
        read_only_fields = ('user', 'status', 'payment_reference', 'created_at', 'updated_at')


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ('service', 'date', 'time', 'notes')

    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError('Cannot book an appointment in the past.')
        return value


class AvailableSlotsSerializer(serializers.Serializer):
    date = serializers.DateField()
    service_id = serializers.IntegerField(required=False)
