"""Serializers for products and services."""
from rest_framework import serializers
from .models import Category, Product, Service


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'image', 'product_count')

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'short_description', 'price', 'stock',
            'image', 'image_alt', 'category', 'category_name',
            'average_rating', 'is_in_stock', 'is_low_stock',
            'is_featured', 'created_at',
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    average_rating = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'stock', 'image', 'image_alt', 'category',
            'average_rating', 'is_in_stock', 'is_low_stock', 'is_featured',
            'ingredients', 'usage_instructions', 'weight_grams',
            'created_at', 'updated_at', 'reviews',
        )

    def get_reviews(self, obj):
        from apps.reviews.serializers import ReviewSerializer
        approved = obj.reviews.filter(is_approved=True).order_by('-created_at')[:10]
        return ReviewSerializer(approved, many=True).data


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = (
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'duration_minutes', 'image', 'is_featured', 'is_active', 'created_at',
        )


class ProductWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = (
            'name', 'category', 'description', 'short_description',
            'price', 'stock', 'image', 'image_alt',
            'is_active', 'is_featured', 'ingredients',
            'usage_instructions', 'weight_grams',
        )


class ServiceWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Service
        fields = (
            'name', 'description', 'short_description',
            'price', 'duration_minutes', 'image',
            'is_active', 'is_featured',
        )
