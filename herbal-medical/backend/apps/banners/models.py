"""Banner / Advertisement model."""
from django.db import models
from django.utils import timezone


class Banner(models.Model):
    HERO = 'hero'
    SIDEBAR = 'sidebar'
    CATEGORY = 'category'
    POPUP = 'popup'

    PLACEMENT_CHOICES = [
        (HERO, 'Homepage Hero'),
        (SIDEBAR, 'Sidebar'),
        (CATEGORY, 'Category Pages'),
        (POPUP, 'Popup'),
    ]

    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='banners/')
    image_alt = models.CharField(max_length=200, blank=True)
    link_url = models.URLField(blank=True, help_text='Target URL when clicked')
    placement = models.CharField(max_length=20, choices=PLACEMENT_CHOICES, default=HERO)
    is_active = models.BooleanField(default=True)
    active_from = models.DateTimeField(null=True, blank=True)
    active_to = models.DateTimeField(null=True, blank=True)
    track_clicks = models.BooleanField(default=True)
    click_count = models.PositiveIntegerField(default=0)
    impression_count = models.PositiveIntegerField(default=0)
    sort_order = models.IntegerField(default=0)
    popup_frequency_days = models.PositiveIntegerField(
        default=1,
        help_text='Popup placement only: how many days between each time this popup is shown to the same visitor.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'banners'
        ordering = ['sort_order', '-created_at']
        indexes = [models.Index(fields=['placement', 'is_active'])]

    def __str__(self):
        return self.title

    @property
    def is_currently_active(self):
        if not self.is_active:
            return False
        now = timezone.now()
        if self.active_from and now < self.active_from:
            return False
        if self.active_to and now > self.active_to:
            return False
        return True
