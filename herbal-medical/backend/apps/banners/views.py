"""Banner views."""
from django.db.models import Q, F
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Banner
from .serializers import BannerSerializer, BannerCreateUpdateSerializer


class ActiveBannerListView(generics.ListAPIView):
    """Public endpoint for active banners, filtered by date and placement."""
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        now = timezone.now()
        qs = Banner.objects.filter(is_active=True).filter(
            Q(active_from__isnull=True) | Q(active_from__lte=now)
        ).filter(
            Q(active_to__isnull=True) | Q(active_to__gte=now)
        )
        placement = self.request.query_params.get('placement')
        if placement:
            qs = qs.filter(placement=placement)
        return qs


class AdminBannerListCreateView(generics.ListCreateAPIView):
    queryset = Banner.objects.all()
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BannerCreateUpdateSerializer
        return BannerSerializer


class AdminBannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Banner.objects.all()
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BannerCreateUpdateSerializer
        return BannerSerializer


class BannerClickView(APIView):
    """Track banner click and return link URL."""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            banner = Banner.objects.get(pk=pk, is_active=True)
            if banner.track_clicks:
                Banner.objects.filter(pk=pk).update(click_count=F('click_count') + 1)
            return Response({'link_url': banner.link_url})
        except Banner.DoesNotExist:
            return Response({'error': 'Banner not found.'}, status=status.HTTP_404_NOT_FOUND)
