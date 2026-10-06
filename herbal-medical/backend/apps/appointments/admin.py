"""Appointments admin."""
from django.contrib import admin
from .models import Appointment, Availability, BlockedDate


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ['day_of_week', 'start_time', 'end_time', 'max_appointments', 'is_active']
    list_editable = ['start_time', 'end_time', 'max_appointments', 'is_active']


@admin.register(BlockedDate)
class BlockedDateAdmin(admin.ModelAdmin):
    list_display = ['date', 'reason', 'created_at']
    date_hierarchy = 'date'


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'service', 'date', 'time', 'status', 'created_at']
    list_filter = ['status', 'date', 'service']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    date_hierarchy = 'date'
    readonly_fields = ['created_at', 'updated_at', 'payment_reference']
    list_editable = ['status']
    fieldsets = (
        ('Appointment', {'fields': ('user', 'service', 'date', 'time', 'notes')}),
        ('Status', {'fields': ('status', 'cancellation_reason', 'payment_reference')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
