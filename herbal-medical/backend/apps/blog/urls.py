from django.urls import path
from .views import (
    BlogPostListView, BlogPostDetailView,
    AdminBlogPostListCreateView, AdminBlogPostDetailView,
)

urlpatterns = [
    # Public
    path('blog/', BlogPostListView.as_view(), name='blog-list'),
    path('blog/<slug:slug>/', BlogPostDetailView.as_view(), name='blog-detail'),
    # Admin CRUD
    path('admin/blog/', AdminBlogPostListCreateView.as_view(), name='admin-blog-list'),
    path('admin/blog/<int:pk>/', AdminBlogPostDetailView.as_view(), name='admin-blog-detail'),
]
