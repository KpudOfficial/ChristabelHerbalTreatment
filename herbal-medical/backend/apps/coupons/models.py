"""Coupon model for percentage and fixed-amount discounts."""
from django.db import models
from django.utils import timezone


class Coupon(models.Model):
    PERCENTAGE = 'percentage'
    FIXED = 'fixed'
    DISCOUNT_TYPE_CHOICES = [(PERCENTAGE, 'Percentage'), (FIXED, 'Fixed Amount')]

    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.CharField(max_length=200, blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default=PERCENTAGE)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    max_uses = models.PositiveIntegerField(null=True, blank=True, help_text='Leave blank for unlimited')
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'coupons'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['code', 'is_active'])]

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.valid_from or now > self.valid_to:
            return False
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False
        return True

    def calculate_discount(self, order_total):
        from decimal import Decimal
        total = Decimal(str(order_total))
        if self.discount_type == self.PERCENTAGE:
            return round(total * self.value / Decimal('100'), 2)
        return min(self.value, total)
