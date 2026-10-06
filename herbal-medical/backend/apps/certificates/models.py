"""Compliance certificate model."""
from django.db import models


class Certificate(models.Model):
    title = models.CharField(max_length=200)
    issuing_body = models.CharField(max_length=200)
    certificate_number = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='certificates/', null=True, blank=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'certificates'
        ordering = ['sort_order', 'title']

    def __str__(self):
        return self.title
