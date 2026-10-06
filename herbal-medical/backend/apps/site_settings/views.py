"""Site Settings views."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from .models import SiteSettings
from .serializers import SiteSettingsSerializer


class SiteSettingsView(APIView):
    """
    GET  /api/site-settings/   — public, returns all site settings
    PATCH /api/admin/site-settings/ — admin only, partial update
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    # Support both JSON (text fields) and multipart (file uploads)
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        settings = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        settings = SiteSettings.load()
        serializer = SiteSettingsSerializer(
            settings,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
