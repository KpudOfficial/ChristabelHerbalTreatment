"""Products admin."""
from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, Service


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'product_count']
    list_filter = ['is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}

    def product_count(self, obj):
        return obj.products.filter(is_active=True).count()
    product_count.short_description = 'Active Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'stock_status',
                    'is_active', 'is_featured', 'created_at']
    list_filter = ['is_active', 'is_featured', 'category']
    search_fields = ['name', 'description', 'ingredients']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['price', 'stock', 'is_active', 'is_featured']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'slug', 'category', 'short_description', 'description')}),
        ('Pricing & Stock', {'fields': ('price', 'stock', 'low_stock_threshold')}),
        ('Media', {'fields': ('image', 'image_alt')}),
        ('Details', {'fields': ('ingredients', 'usage_instructions', 'weight_grams')}),
        ('Status', {'fields': ('is_active', 'is_featured')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def stock_status(self, obj):
        if obj.stock == 0:
            return format_html('<span style="color:red;">Out of Stock</span>')
        elif obj.is_low_stock:
            return format_html('<span style="color:orange;">Low Stock ({})</span>', obj.stock)
        return format_html('<span style="color:green;">In Stock ({})</span>', obj.stock)
    stock_status.short_description = 'Stock Status'


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'duration_minutes', 'is_active', 'is_featured']
    list_filter = ['is_active', 'is_featured']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['price', 'duration_minutes', 'is_active', 'is_featured']
