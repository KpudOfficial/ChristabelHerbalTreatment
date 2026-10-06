"""Coupons admin."""
from django.contrib import admin
from .models import Coupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'value', 'valid_from', 'valid_to',
                    'max_uses', 'used_count', 'is_active', 'is_valid']
    list_filter = ['discount_type', 'is_active']
    search_fields = ['code', 'description']
    list_editable = ['is_active']
    readonly_fields = ['used_count', 'created_at']
