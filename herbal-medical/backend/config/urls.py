"""URL configuration for Herbal Medical platform."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .seo import robots_txt

urlpatterns = [
    path('admin/', admin.site.urls),
    # SEO
    path('robots.txt', robots_txt, name='robots-txt'),
    # API Schema / Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # Auth
    path('api/auth/', include('apps.users.urls')),
    # All feature endpoints
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/', include('apps.cart.urls')),
    path('api/', include('apps.appointments.urls')),
    path('api/', include('apps.payments.urls')),
    path('api/', include('apps.blog.urls')),
    path('api/', include('apps.banners.urls')),
    path('api/', include('apps.certificates.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/', include('apps.coupons.urls')),
    path('api/', include('apps.site_settings.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin UI customisation
admin.site.site_header = 'Herbal Medical Administration'
admin.site.site_title = 'Herbal Medical Admin'
admin.site.index_title = 'Welcome to Herbal Medical Admin Portal'
