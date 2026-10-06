"""SEO views: robots.txt and sitemap."""
from django.http import HttpResponse
from django.conf import settings


def robots_txt(request):
    lines = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin/',
        'Disallow: /api/',
        f'Sitemap: {settings.FRONTEND_URL}/sitemap.xml',
    ]
    return HttpResponse('\n'.join(lines), content_type='text/plain')
