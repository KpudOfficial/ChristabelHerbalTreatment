from django.urls import path
from .views import InitiatePaymentView, PaymentStatusView, CampayWebhookView

urlpatterns = [
    path('payments/campay/collect/', InitiatePaymentView.as_view(), name='payment-collect'),
    path('payments/campay/status/<str:reference>/', PaymentStatusView.as_view(), name='payment-status'),
    path('payments/campay/webhook/', CampayWebhookView.as_view(), name='payment-webhook'),
]
