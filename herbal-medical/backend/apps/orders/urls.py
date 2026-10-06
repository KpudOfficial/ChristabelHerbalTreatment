from django.urls import path
from .views import OrderCreateView, OrderListView, OrderDetailView
from .dashboard import DashboardView

urlpatterns = [
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('admin/dashboard/', DashboardView.as_view(), name='admin-dashboard'),
]
