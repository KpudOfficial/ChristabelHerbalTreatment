"""Payment serializers."""
from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id', 'payment_type', 'campay_reference', 'phone_number',
            'amount', 'currency', 'status', 'operator', 'created_at',
        )
        read_only_fields = fields
