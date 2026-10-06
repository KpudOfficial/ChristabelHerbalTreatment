"""Banner serializers."""
from rest_framework import serializers
from .models import Banner


class BannerSerializer(serializers.ModelSerializer):
    is_currently_active = serializers.ReadOnlyField()

    class Meta:
        model = Banner
        fields = (
            'id', 'title', 'image', 'image_alt', 'link_url', 'placement',
            'is_active', 'active_from', 'active_to', 'track_clicks',
            'click_count', 'impression_count', 'sort_order',
            'popup_frequency_days', 'is_currently_active', 'created_at',
        )


class BannerCreateUpdateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Banner
        fields = (
            'title', 'image', 'image_alt', 'link_url', 'placement',
            'is_active', 'active_from', 'active_to', 'track_clicks',
            'sort_order', 'popup_frequency_days',
        )
