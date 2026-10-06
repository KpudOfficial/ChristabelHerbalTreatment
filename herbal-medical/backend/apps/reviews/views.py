"""Review views: create (verified purchase only)."""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Review
from .serializers import ReviewSerializer
from apps.orders.models import Order, OrderItem


class CreateReviewView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        user = self.request.user

        # Prevent duplicate reviews
        if Review.objects.filter(user=user, product=product).exists():
            raise ValidationError({'detail': 'You have already reviewed this product.'})

        # Only allow verified purchasers to leave reviews
        is_verified = OrderItem.objects.filter(
            order__user=user,
            order__status__in=[Order.PAID, Order.DELIVERED],
            product=product,
        ).exists()

        if not is_verified:
            raise PermissionDenied('You can only review products you have purchased and paid for.')

        serializer.save(user=user, is_verified_purchase=True)
