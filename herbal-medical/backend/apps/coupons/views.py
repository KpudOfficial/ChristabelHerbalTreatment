"""Coupon validation view."""
from decimal import Decimal, InvalidOperation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Coupon


class ValidateCouponView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        raw_total = request.data.get('order_total', 0)

        try:
            order_total = Decimal(str(raw_total))
        except (InvalidOperation, ValueError):
            return Response(
                {'valid': False, 'error': 'Invalid order total.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid coupon code.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not coupon.is_valid:
            return Response(
                {'valid': False, 'error': 'This coupon has expired or is no longer active.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order_total < coupon.min_order_amount:
            return Response(
                {
                    'valid': False,
                    'error': f'Minimum order amount for this coupon is {coupon.min_order_amount} XAF.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        discount = coupon.calculate_discount(order_total)
        return Response({
            'valid': True,
            'coupon_id': coupon.id,
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'value': str(coupon.value),
            'discount_amount': str(discount),
            'description': coupon.description,
        })
