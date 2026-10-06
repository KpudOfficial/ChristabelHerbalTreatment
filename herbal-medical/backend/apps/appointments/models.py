"""Appointment models: Appointment, Availability, BlockedDate."""
from django.db import models
from django.conf import settings


class Availability(models.Model):
    """Doctor's weekly availability schedule."""
    DAYS = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'),
        (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]
    day_of_week = models.IntegerField(choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    max_appointments = models.PositiveIntegerField(default=8)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'availability'
        ordering = ['day_of_week', 'start_time']
        unique_together = ('day_of_week',)

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class BlockedDate(models.Model):
    """Dates when the doctor is unavailable."""
    date = models.DateField(unique=True, db_index=True)
    reason = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'blocked_dates'
        ordering = ['date']

    def __str__(self):
        return str(self.date)


class Appointment(models.Model):
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    NO_SHOW = 'no_show'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (CONFIRMED, 'Confirmed'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
        (NO_SHOW, 'No Show'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='appointments'
    )
    service = models.ForeignKey(
        'products.Service', on_delete=models.PROTECT, related_name='appointments'
    )
    date = models.DateField(db_index=True)
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    notes = models.TextField(blank=True)
    payment_reference = models.CharField(max_length=200, blank=True, db_index=True)
    cancellation_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['-date', '-time']
        indexes = [
            models.Index(fields=['date', 'time']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.service.name} @ {self.date} {self.time}"
