"""Site Settings serializers."""
from rest_framework import serializers
from .models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    """Full serializer — used for both public read and admin read/write."""

    logo_url = serializers.SerializerMethodField()
    logo_dark_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()
    about_doctor_image_url = serializers.SerializerMethodField()
    icon_choices = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            # branding
            'site_name', 'tagline',
            'logo', 'logo_url',
            'logo_dark', 'logo_dark_url',
            'favicon', 'favicon_url',
            # contact
            'contact_email', 'contact_phone', 'contact_phone_2', 'whatsapp_number',
            # location
            'address_line_1', 'address_line_2', 'city', 'region', 'country',
            'google_maps_embed_url', 'google_maps_link', 'opening_hours',
            # social
            'facebook_url', 'instagram_url', 'twitter_url',
            'youtube_url', 'tiktok_url', 'linkedin_url',
            # dashboard icons
            'dashboard_icon_revenue', 'dashboard_icon_orders',
            'dashboard_icon_bookings', 'dashboard_icon_pending',
            'icon_choices',
            # about page
            'about_hero_title', 'about_hero_subtitle',
            'about_story', 'about_doctor_name', 'about_doctor_bio',
            'about_doctor_image', 'about_doctor_image_url',
            # meta
            'updated_at',
        ]
        read_only_fields = ['updated_at', 'icon_choices']
        extra_kwargs = {
            # make image fields optional on PATCH
            'logo': {'required': False, 'allow_null': True},
            'logo_dark': {'required': False, 'allow_null': True},
            'favicon': {'required': False, 'allow_null': True},
            'about_doctor_image': {'required': False, 'allow_null': True},
        }

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url

    def get_logo_dark_url(self, obj):
        if not obj.logo_dark:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.logo_dark.url) if request else obj.logo_dark.url

    def get_favicon_url(self, obj):
        if not obj.favicon:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.favicon.url) if request else obj.favicon.url

    def get_about_doctor_image_url(self, obj):
        if not obj.about_doctor_image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.about_doctor_image.url) if request else obj.about_doctor_image.url

    def get_icon_choices(self, obj):
        """Return the list of valid icon names so the frontend can render a picker."""
        return [{'value': v, 'label': l} for v, l in SiteSettings.ICON_CHOICES]
