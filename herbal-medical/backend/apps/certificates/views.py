from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Certificate
from .serializers import CertificateSerializer


class CertificateListView(generics.ListAPIView):
    queryset = Certificate.objects.filter(is_active=True)
    serializer_class = CertificateSerializer
    permission_classes = [AllowAny]
