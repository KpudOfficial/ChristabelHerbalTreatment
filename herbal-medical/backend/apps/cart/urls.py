"""Cart URL patterns."""
from django.urls import path
from .views import CartView, CartItemView, MergeCartView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart-detail'),
    path('cart/items/', CartItemView.as_view(), name='cart-item-add'),
    path('cart/items/<int:item_id>/', CartItemView.as_view(), name='cart-item-detail'),
    path('cart/merge/', MergeCartView.as_view(), name='cart-merge'),
]
