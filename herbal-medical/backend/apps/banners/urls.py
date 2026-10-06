from django.urls import path
from .views import (
    ActiveBannerListView, AdminBannerListCreateView,
    AdminBannerDetailView, BannerClickView,
)

urlpatterns = [
    path('banners/active/', ActiveBannerListView.as_view(), name='banner-active'),
    path('banners/click/<int:pk>/', BannerClickView.as_view(), name='banner-click'),
    path('admin/banners/', AdminBannerListCreateView.as_view(), name='admin-banner-list'),
    path('admin/banners/<int:pk>/', AdminBannerDetailView.as_view(), name='admin-banner-detail'),
]
