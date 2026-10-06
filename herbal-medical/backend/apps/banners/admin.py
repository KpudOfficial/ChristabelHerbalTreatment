"""Banners admin."""
from django.contrib import admin
from django.utils.html import format_html
from .models import Banner


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'placement', 'is_active', 'active_from', 'active_to',
                    'click_count', 'impression_count', 'preview', 'sort_order']
    list_filter = ['placement', 'is_active']
    list_editable = ['is_active', 'sort_order', 'placement']
    readonly_fields = ['click_count', 'impression_count', 'created_at', 'updated_at', 'preview']
    search_fields = ['title']

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:40px; border-radius:4px;" />', obj.image.url)
        return '-'
    preview.short_description = 'Preview'
