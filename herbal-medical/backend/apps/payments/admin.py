"""Payments admin."""
from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['campay_reference', 'user', 'payment_type', 'amount', 'status',
                    'operator', 'created_at']
    list_filter = ['status', 'payment_type', 'operator']
    search_fields = ['campay_reference', 'user__email', 'phone_number']
    readonly_fields = ['campay_reference', 'user', 'payment_type', 'amount', 'currency',
                       'operator', 'external_reference', 'raw_response', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
