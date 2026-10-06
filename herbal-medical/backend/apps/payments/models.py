"""Payment model tracking Campay transactions."""
from django.db import models
from django.conf import settings


class Payment(models.Model):
    PENDING = 'pending'
    SUCCESSFUL = 'successful'
    FAILED = 'failed'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (SUCCESSFUL, 'Successful'),
        (FAILED, 'Failed'),
    ]

    TYPE_ORDER = 'order'
    TYPE_APPOINTMENT = 'appointment'
    PAYMENT_TYPE_CHOICES = [(TYPE_ORDER, 'Order'), (TYPE_APPOINTMENT, 'Appointment')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
                              related_name='payments')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default=TYPE_ORDER)
    order = models.OneToOneField(
        'orders.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='payment'
    )
    appointment = models.OneToOneField(
        'appointments.Appointment', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='payment'
    )
    campay_reference = models.CharField(max_length=200, unique=True, db_index=True)
    phone_number = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='XAF')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    operator = models.CharField(max_length=50, blank=True)  # MTN or Orange
    external_reference = models.CharField(max_length=200, blank=True)  # Campay external ref
    raw_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['campay_reference']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Payment {self.campay_reference} - {self.status}"
