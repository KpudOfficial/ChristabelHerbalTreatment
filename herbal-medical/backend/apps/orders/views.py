"""Order views: create from cart, list orders."""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from decimal import Decimal

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from apps.cart.models import Cart
from apps.coupons.models import Coupon


class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Get user cart
        try:
            cart = Cart.objects.prefetch_related('items__product').get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.all()
        if not cart_items.exists():
            return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate stock and calculate totals
        subtotal = Decimal('0')
        order_items_data = []
        for item in cart_items:
            if item.product.stock < item.quantity:
                return Response(
                    {'error': f'Insufficient stock for {item.product.name}. Only {item.product.stock} left.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            subtotal += item.product.price * item.quantity
            order_items_data.append(item)

        # Apply coupon
        coupon = None
        discount = Decimal('0')
        coupon_code = (data.get('coupon_code') or '').strip().upper()
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if coupon.is_valid and subtotal >= coupon.min_order_amount:
                    discount = coupon.calculate_discount(subtotal)
                else:
                    return Response(
                        {'error': 'Coupon is not valid or minimum order amount not met.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except Coupon.DoesNotExist:
                return Response({'error': 'Invalid coupon code.'}, status=status.HTTP_400_BAD_REQUEST)

        total = subtotal - discount

        # Create order
        order = Order.objects.create(
            user=request.user,
            subtotal=subtotal,
            discount_amount=discount,
            total=total,
            coupon=coupon,
            phone_number=data['phone_number'],
            delivery_address=data.get('delivery_address', ''),
            delivery_notes=data.get('delivery_notes', ''),
            status=Order.PENDING,
        )

        # Create order items
        for item in order_items_data:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                unit_price=item.product.price,
            )

        # Don't decrement stock until payment confirmed
        # (handled in payment webhook)

        # Update coupon usage if applied
        if coupon:
            coupon.used_count += 1
            coupon.save()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().prefetch_related('items__product')
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)
