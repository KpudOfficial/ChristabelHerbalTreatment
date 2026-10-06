"""Coupon serializers."""
from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.ReadOnlyField()

    class Meta:
        model = Coupon
        fields = ('id', 'code', 'description', 'discount_type', 'value',
                  'min_order_amount', 'valid_from', 'valid_to',
                  'max_uses', 'used_count', 'is_active', 'is_valid')
