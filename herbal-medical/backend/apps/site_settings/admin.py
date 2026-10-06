"""Site Settings Django admin — displays as a singleton edit page."""
from django.contrib import admin
from django.utils.html import format_html
from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    # Never show "Add" — only ever edit the single row
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    fieldsets = (
        ('Branding', {
            'fields': ('site_name', 'tagline', 'logo', 'logo_preview',
                       'logo_dark', 'logo_dark_preview', 'favicon', 'favicon_preview'),
        }),
        ('Contact', {
            'fields': ('contact_email', 'contact_phone', 'contact_phone_2', 'whatsapp_number'),
        }),
        ('Location', {
            'fields': ('address_line_1', 'address_line_2', 'city', 'region', 'country',
                       'opening_hours', 'google_maps_link', 'google_maps_embed_url'),
        }),
        ('Social Media', {
            'fields': ('facebook_url', 'instagram_url', 'twitter_url',
                       'youtube_url', 'tiktok_url', 'linkedin_url'),
        }),
        ('Dashboard Icons', {
            'fields': ('dashboard_icon_revenue', 'dashboard_icon_orders',
                       'dashboard_icon_bookings', 'dashboard_icon_pending'),
        }),
        ('Metadata', {
            'fields': ('updated_at',),
        }),
    )

    readonly_fields = ['updated_at', 'logo_preview', 'logo_dark_preview', 'favicon_preview']

    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="height:60px;" />', obj.logo.url)
        return '—'
    logo_preview.short_description = 'Current logo'

    def logo_dark_preview(self, obj):
        if obj.logo_dark:
            return format_html(
                '<img src="{}" style="height:60px; background:#1a1a1a; padding:4px;" />',
                obj.logo_dark.url,
            )
        return '—'
    logo_dark_preview.short_description = 'Dark logo preview'

    def favicon_preview(self, obj):
        if obj.favicon:
            return format_html('<img src="{}" style="height:32px;" />', obj.favicon.url)
        return '—'
    favicon_preview.short_description = 'Favicon preview'

    def changelist_view(self, request, extra_context=None):
        """Redirect list view straight to the edit page."""
        from django.shortcuts import redirect
        obj, _ = SiteSettings.objects.get_or_create(pk=1)
        return redirect(f'/admin/site_settings/sitesettings/{obj.pk}/change/')
