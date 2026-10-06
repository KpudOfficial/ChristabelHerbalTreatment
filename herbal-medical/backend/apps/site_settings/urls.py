from django.urls import path
from .views import SiteSettingsView

urlpatterns = [
    # Public read
    path('site-settings/', SiteSettingsView.as_view(), name='site-settings'),
    # Admin write (same view, permission enforced inside)
    path('admin/site-settings/', SiteSettingsView.as_view(), name='admin-site-settings'),
]
