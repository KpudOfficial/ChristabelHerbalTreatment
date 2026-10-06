"""Orders admin with inline items."""
from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'unit_price', 'subtotal']

    def subtotal(self, obj):
        return obj.subtotal


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'subtotal', 'discount_amount', 'total',
                    'payment_reference', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'payment_reference', 'phone_number']
    readonly_fields = ['created_at', 'updated_at', 'subtotal', 'discount_amount', 'total']
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('items__product')
