"""Campay payment service layer."""
import logging
from decimal import Decimal

from django.conf import settings
from django.db import transaction

logger = logging.getLogger(__name__)


class CampayService:
    """Wrapper around the Campay Python SDK."""

    def __init__(self):
        self.app_username = settings.CAMPAY_APP_USERNAME
        self.app_password = settings.CAMPAY_APP_PASSWORD
        self.environment = settings.CAMPAY_ENVIRONMENT

    def _get_client(self):
        try:
            from campay.sdk import Client
            return Client({
                "app_username": self.app_username,
                "app_password": self.app_password,
                "environment": self.environment,
            })
        except ImportError:
            logger.error("campay package not installed.")
            return None

    def initiate_collection(self, request, order_id=None, appointment_id=None, phone_number=None):
        from .models import Payment
        from apps.orders.models import Order
        from apps.appointments.models import Appointment

        # Resolve target object
        obj = None
        payment_type = None
        amount = None

        if order_id:
            try:
                obj = Order.objects.get(id=order_id, user=request.user, status=Order.PENDING)
                payment_type = Payment.TYPE_ORDER
                amount = obj.total
            except Order.DoesNotExist:
                return {'success': False, 'error': 'Order not found or already processed.'}

        elif appointment_id:
            try:
                obj = Appointment.objects.get(id=appointment_id, user=request.user,
                                               status=Appointment.PENDING)
                payment_type = Payment.TYPE_APPOINTMENT
                amount = obj.service.price
            except Appointment.DoesNotExist:
                return {'success': False, 'error': 'Appointment not found or already processed.'}
        else:
            return {'success': False, 'error': 'Provide order_id or appointment_id.'}

        client = self._get_client()
        if not client:
            return {'success': False, 'error': 'Payment service unavailable.'}

        try:
            collect_result = client.collect({
                "amount": str(int(amount)),
                "currency": "XAF",
                "from": phone_number,
                "description": f"Payment for {'Order' if payment_type == Payment.TYPE_ORDER else 'Appointment'} #{obj.id}",
                "external_reference": f"{'ord' if payment_type == Payment.TYPE_ORDER else 'apt'}-{obj.id}",
            })
        except Exception as exc:
            logger.exception(f"Campay collect error: {exc}")
            return {'success': False, 'error': 'Payment initiation failed. Please try again.'}

        campay_ref = collect_result.get('reference', '')
        if not campay_ref:
            return {'success': False, 'error': 'No reference returned from payment provider.'}

        # Create Payment record
        payment_kwargs = {
            'user': request.user,
            'payment_type': payment_type,
            'campay_reference': campay_ref,
            'phone_number': phone_number,
            'amount': amount,
            'status': Payment.PENDING,
            'raw_response': collect_result,
        }
        if payment_type == Payment.TYPE_ORDER:
            payment_kwargs['order'] = obj
        else:
            payment_kwargs['appointment'] = obj

        payment = Payment.objects.create(**payment_kwargs)

        # Update order/appointment with reference
        obj.payment_reference = campay_ref
        obj.save(update_fields=['payment_reference'])

        return {
            'success': True,
            'reference': campay_ref,
            'payment_id': payment.id,
            'status': Payment.PENDING,
            'message': 'USSD prompt sent to your phone. Approve to complete payment.',
        }

    def get_transaction_status(self, reference):
        client = self._get_client()
        if not client:
            return None
        try:
            return client.get_transaction_status(reference)
        except Exception as exc:
            logger.exception(f"Campay status check error: {exc}")
            return None

    @transaction.atomic
    def update_payment_status(self, payment, payload):
        from apps.orders.models import Order
        from apps.appointments.models import Appointment

        campay_status = payload.get('status', '').lower()

        if campay_status in ('successful', 'success'):
            payment.status = Payment.SUCCESSFUL
            payment.operator = payload.get('operator', '')
            payment.external_reference = payload.get('external_reference', '')
            payment.raw_response = payload
            payment.save()

            # Update order
            if payment.order:
                order = payment.order
                order.status = Order.PAID
                order.save(update_fields=['status'])

                # Decrement stock
                for item in order.items.select_related('product').all():
                    item.product.stock -= item.quantity
                    item.product.save(update_fields=['stock'])

                # Clear cart
                try:
                    from apps.cart.models import Cart
                    Cart.objects.filter(user=order.user).delete()
                except Exception:
                    pass

                # Send email
                try:
                    send_order_confirmation_email(order)
                except Exception as e:
                    logger.warning(f"Failed to send order email: {e}")

            # Update appointment
            if payment.appointment:
                appt = payment.appointment
                appt.status = Appointment.CONFIRMED
                appt.save(update_fields=['status'])

                try:
                    send_appointment_confirmation_email(appt)
                except Exception as e:
                    logger.warning(f"Failed to send appointment email: {e}")

        elif campay_status == 'failed':
            payment.status = Payment.FAILED
            payment.raw_response = payload
            payment.save()

        return payment


def send_order_confirmation_email(order):
    """Send order confirmation email to customer."""
    from django.core.mail import send_mail
    from django.conf import settings

    subject = f"Order Confirmed - #{order.id} | Herbal Medical"
    message = (
        f"Dear {order.user.full_name},\n\n"
        f"Thank you for your order!\n\n"
        f"Order ID: #{order.id}\n"
        f"Status: {order.get_status_display()}\n"
        f"Total: {order.total} XAF\n\n"
        f"You can track your order at: {settings.FRONTEND_URL}/orders/{order.id}\n\n"
        f"Best regards,\nHerbal Medical Team"
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.user.email],
        fail_silently=True,
    )


def send_appointment_confirmation_email(appointment):
    """Send appointment confirmation email."""
    from django.core.mail import send_mail
    from django.conf import settings

    subject = f"Appointment Confirmed - {appointment.date} | Herbal Medical"
    message = (
        f"Dear {appointment.user.full_name},\n\n"
        f"Your appointment has been confirmed!\n\n"
        f"Service: {appointment.service.name}\n"
        f"Date: {appointment.date}\n"
        f"Time: {appointment.time}\n"
        f"Duration: {appointment.service.duration_minutes} minutes\n\n"
        f"Location: Herbal Medical Clinic\n\n"
        f"Please arrive 10 minutes early.\n\n"
        f"Best regards,\nHerbal Medical Team"
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[appointment.user.email],
        fail_silently=True,
    )
