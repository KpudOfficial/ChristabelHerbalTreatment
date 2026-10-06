"""Order serializers."""
from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source='product', read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_detail', 'quantity', 'unit_price', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'user_email', 'status', 'subtotal', 'discount_amount',
            'total', 'coupon', 'delivery_address', 'delivery_notes',
            'payment_reference', 'phone_number', 'items', 'created_at', 'updated_at',
        )
        read_only_fields = ('user', 'status', 'payment_reference', 'created_at', 'updated_at')


class OrderCreateSerializer(serializers.Serializer):
    """Used at checkout to create an order from the user's cart."""
    phone_number = serializers.CharField(max_length=20)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    delivery_notes = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True)

    def validate_phone_number(self, value):
        # Basic Cameroon number validation
        import re
        cleaned = re.sub(r'\s+', '', value)
        if not re.match(r'^(\+?237)?[67]\d{8}$', cleaned):
            raise serializers.ValidationError(
                'Invalid Cameroon phone number. Use format: 6XXXXXXXX or +2376XXXXXXXX'
            )
        return cleaned
