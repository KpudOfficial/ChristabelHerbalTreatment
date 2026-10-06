"""
Site Settings — singleton model that stores branding, contact, and social config.
Only one row is ever created (pk=1). Use SiteSettings.load() everywhere.
"""
from django.db import models
from django.core.cache import cache


CACHE_KEY = 'site_settings'


class SiteSettings(models.Model):
    # ── Branding ──────────────────────────────────────────────────────────────
    site_name = models.CharField(max_length=100, default='Herbal Medical')
    tagline = models.CharField(max_length=200, blank=True)
    logo = models.ImageField(upload_to='site/', blank=True, null=True, help_text='Main logo (shown in header)')
    logo_dark = models.ImageField(upload_to='site/', blank=True, null=True, help_text='Logo variant for dark backgrounds')
    favicon = models.ImageField(upload_to='site/', blank=True, null=True, help_text='Browser tab icon (32×32 px)')

    # ── Contact ───────────────────────────────────────────────────────────────
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    contact_phone_2 = models.CharField(max_length=30, blank=True, verbose_name='Second phone')
    whatsapp_number = models.CharField(
        max_length=30, blank=True,
        help_text='International format, e.g. +237677000000',
    )

    # ── Location ──────────────────────────────────────────────────────────────
    address_line_1 = models.CharField(max_length=200, blank=True)
    address_line_2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True, default='Cameroon')
    google_maps_embed_url = models.URLField(blank=True, help_text='Paste the Google Maps embed src URL')
    google_maps_link = models.URLField(blank=True, help_text='Direct "View on Maps" link')

    # ── Opening Hours ─────────────────────────────────────────────────────────
    opening_hours = models.CharField(
        max_length=200, blank=True,
        help_text='e.g. Mon–Sat 8 AM – 6 PM',
    )

    # ── About Page Content ────────────────────────────────────────────────────
    about_hero_title = models.CharField(max_length=200, blank=True, default='About Us')
    about_hero_subtitle = models.TextField(max_length=400, blank=True)
    about_story = models.TextField(blank=True, help_text='Our Story section body text')
    about_doctor_name = models.CharField(max_length=150, blank=True)
    about_doctor_bio = models.TextField(blank=True, help_text='Doctor/founder bio paragraph')
    about_doctor_image = models.ImageField(upload_to='site/', blank=True, null=True)

    # ── Social Media ──────────────────────────────────────────────────────────
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True, verbose_name='X (Twitter) URL')
    youtube_url = models.URLField(blank=True)
    tiktok_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)

    # ── Dashboard icon choices ────────────────────────────────────────────────
    # Each stat card icon is stored as a Lucide icon name string.
    # The frontend maps these names to actual Lucide components.
    ICON_CHOICES = [
        ('DollarSign', 'Dollar Sign'),
        ('BadgeDollarSign', 'Badge Dollar Sign'),
        ('Coins', 'Coins'),
        ('CreditCard', 'Credit Card'),
        ('ShoppingBag', 'Shopping Bag'),
        ('ShoppingCart', 'Shopping Cart'),
        ('Package', 'Package'),
        ('Box', 'Box'),
        ('Calendar', 'Calendar'),
        ('CalendarCheck', 'Calendar Check'),
        ('CalendarDays', 'Calendar Days'),
        ('Clock', 'Clock'),
        ('Timer', 'Timer'),
        ('Hourglass', 'Hourglass'),
        ('TrendingUp', 'Trending Up'),
        ('BarChart2', 'Bar Chart'),
        ('Activity', 'Activity'),
        ('Users', 'Users'),
    ]

    dashboard_icon_revenue = models.CharField(
        max_length=40, choices=ICON_CHOICES, default='DollarSign',
        verbose_name="Revenue card icon",
    )
    dashboard_icon_orders = models.CharField(
        max_length=40, choices=ICON_CHOICES, default='ShoppingBag',
        verbose_name="Orders card icon",
    )
    dashboard_icon_bookings = models.CharField(
        max_length=40, choices=ICON_CHOICES, default='Calendar',
        verbose_name="Bookings card icon",
    )
    dashboard_icon_pending = models.CharField(
        max_length=40, choices=ICON_CHOICES, default='Clock',
        verbose_name="Pending orders card icon",
    )

    # ── Meta ──────────────────────────────────────────────────────────────────
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'site_settings'
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return f'Site Settings (last updated {self.updated_at:%Y-%m-%d %H:%M})'

    def save(self, *args, **kwargs):
        # Enforce singleton: always use pk=1
        self.pk = 1
        super().save(*args, **kwargs)
        cache.delete(CACHE_KEY)

    def delete(self, *args, **kwargs):
        # Prevent deletion; just reset fields instead
        pass

    @classmethod
    def load(cls):
        """Return the single settings instance, creating it with defaults if missing."""
        obj = cache.get(CACHE_KEY)
        if obj is None:
            obj, _ = cls.objects.get_or_create(pk=1)
            cache.set(CACHE_KEY, obj, timeout=3600)
        return obj
