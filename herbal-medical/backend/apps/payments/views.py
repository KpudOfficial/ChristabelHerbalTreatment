"""Campay payment views: collect, status check, webhook."""
import json
import logging

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .services import CampayService

logger = logging.getLogger(__name__)


class InitiatePaymentView(APIView):
    """
    Initiates a Campay Mobile Money collection.
    POST /api/payments/campay/collect/
    Body: { order_id | appointment_id, phone_number }
    """
    permission_classes = [IsAuthenticated]
    throttle_scope = 'payment'

    def post(self, request):
        order_id = request.data.get('order_id')
        appointment_id = request.data.get('appointment_id')
        phone_number = str(request.data.get('phone_number', '')).strip()

        if not phone_number:
            return Response(
                {'error': 'Phone number is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = CampayService()
        result = service.initiate_collection(
            request=request,
            order_id=order_id,
            appointment_id=appointment_id,
            phone_number=phone_number,
        )
        if result.get('success'):
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


class PaymentStatusView(APIView):
    """
    Check status of a payment by Campay reference.
    GET /api/payments/campay/status/<reference>/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, reference):
        try:
            payment = Payment.objects.get(campay_reference=reference, user=request.user)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # If still pending, poll Campay for latest status
        if payment.status == Payment.PENDING:
            campay_service = CampayService()
            campay_status = campay_service.get_transaction_status(reference)
            if campay_status:
                campay_service.update_payment_status(payment, campay_status)
                payment.refresh_from_db()

        return Response({
            'reference': payment.campay_reference,
            'status': payment.status,
            'amount': str(payment.amount),
            'payment_type': payment.payment_type,
            'created_at': payment.created_at,
        })


class CampayWebhookView(APIView):
    """
    Webhook endpoint for Campay payment notifications.
    POST /api/payments/campay/webhook/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            payload = json.loads(request.body) if isinstance(request.body, bytes) else request.data
        except (json.JSONDecodeError, Exception):
            return HttpResponse(status=400)

        reference = payload.get('reference') or payload.get('external_reference', '')
        if not reference:
            return HttpResponse(status=400)

        try:
            payment = Payment.objects.get(campay_reference=reference)
        except Payment.DoesNotExist:
            logger.warning('Webhook: unknown payment reference %s', reference)
            return HttpResponse(status=200)  # Acknowledge so Campay stops retrying

        CampayService().update_payment_status(payment, payload)
        return HttpResponse(status=200)
