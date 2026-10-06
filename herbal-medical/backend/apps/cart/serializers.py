"""Cart serializers."""
from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source='product', read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_detail', 'quantity', 'subtotal', 'added_at')


class CartItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ('product', 'quantity')

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value

    def validate(self, attrs):
        product = attrs['product']
        quantity = attrs['quantity']
        if not product.is_active:
            raise serializers.ValidationError('This product is not available.')
        if quantity > product.stock:
            raise serializers.ValidationError(
                f'Only {product.stock} unit(s) available in stock.'
            )
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    item_count = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total', 'item_count', 'updated_at')


class MergeCartSerializer(serializers.Serializer):
    """For merging guest cart on login."""
    items = serializers.ListField(
        child=serializers.DictField()
    )
