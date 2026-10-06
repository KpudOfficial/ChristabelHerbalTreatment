from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['title', 'issuing_body', 'certificate_number', 'valid_from', 'valid_to',
                    'is_active', 'sort_order']
    list_editable = ['is_active', 'sort_order']
    search_fields = ['title', 'issuing_body', 'certificate_number']
