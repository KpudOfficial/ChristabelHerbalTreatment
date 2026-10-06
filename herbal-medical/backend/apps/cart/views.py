"""Cart views: get, add items, update, delete, merge guest cart."""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import (
    CartSerializer, CartItemCreateSerializer, CartItemSerializer, MergeCartSerializer
)
from apps.products.models import Product


def get_or_create_cart(request):
    """Get or create a cart for authenticated user or session."""
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
    else:
        if not request.session.session_key:
            request.session.create()
        cart, _ = Cart.objects.get_or_create(session_key=request.session.session_key)
    return cart


class CartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """Add item to cart or update quantity if already exists."""
        serializer = CartItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_cart(request)
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            new_qty = item.quantity + quantity
            if new_qty > product.stock:
                return Response(
                    {'error': f'Only {product.stock} unit(s) available.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity = new_qty
            item.save()

        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    def patch(self, request, item_id):
        """Update quantity of a cart item."""
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        quantity = request.data.get('quantity')
        if not quantity or int(quantity) < 1:
            return Response({'error': 'Invalid quantity.'}, status=status.HTTP_400_BAD_REQUEST)
        quantity = int(quantity)
        if quantity > item.product.stock:
            return Response(
                {'error': f'Only {item.product.stock} unit(s) available.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        item.quantity = quantity
        item.save()
        cart.refresh_from_db()
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        """Remove item from cart."""
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        cart.refresh_from_db()
        return Response(CartSerializer(cart).data)


class MergeCartView(APIView):
    """Merge guest localStorage cart into user cart on login."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MergeCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data['items']

        user_cart, _ = Cart.objects.get_or_create(user=request.user)

        for item_data in items:
            try:
                product = Product.objects.get(id=item_data['product_id'], is_active=True)
                quantity = int(item_data.get('quantity', 1))
                if quantity < 1:
                    continue
                existing, created = CartItem.objects.get_or_create(
                    cart=user_cart, product=product,
                    defaults={'quantity': min(quantity, product.stock)}
                )
                if not created:
                    new_qty = min(existing.quantity + quantity, product.stock)
                    existing.quantity = new_qty
                    existing.save()
            except (Product.DoesNotExist, KeyError, ValueError, TypeError):
                continue

        return Response(CartSerializer(user_cart).data)
