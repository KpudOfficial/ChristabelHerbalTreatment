"""Product URL patterns."""
from django.urls import path
from .views import (
    CategoryListView, ProductListView, ProductDetailView,
    ServiceListView, ServiceDetailView,
    AdminCategoryListCreateView, AdminCategoryDetailView,
    AdminProductListCreateView, AdminProductDetailView,
    AdminServiceListCreateView, AdminServiceDetailView,
)

urlpatterns = [
    # Public
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('services/<slug:slug>/', ServiceDetailView.as_view(), name='service-detail'),
    # Admin CRUD
    path('admin/categories/', AdminCategoryListCreateView.as_view(), name='admin-category-list'),
    path('admin/categories/<int:pk>/', AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    path('admin/products/', AdminProductListCreateView.as_view(), name='admin-product-list'),
    path('admin/products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('admin/services/', AdminServiceListCreateView.as_view(), name='admin-service-list'),
    path('admin/services/<int:pk>/', AdminServiceDetailView.as_view(), name='admin-service-detail'),
]
