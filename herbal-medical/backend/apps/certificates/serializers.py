from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ('id', 'title', 'issuing_body', 'certificate_number', 'description',
                  'image', 'valid_from', 'valid_to', 'is_active', 'sort_order')
