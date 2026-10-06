"""Initial migration for site_settings singleton model."""
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                # Branding
                ('site_name', models.CharField(default='Herbal Medical', max_length=100)),
                ('tagline', models.CharField(blank=True, max_length=200)),
                ('logo', models.ImageField(blank=True, help_text='Main logo (shown in header)', null=True, upload_to='site/')),
                ('logo_dark', models.ImageField(blank=True, help_text='Logo variant for dark backgrounds', null=True, upload_to='site/')),
                ('favicon', models.ImageField(blank=True, help_text='Browser tab icon (32×32 px)', null=True, upload_to='site/')),
                # Contact
                ('contact_email', models.EmailField(blank=True, max_length=254)),
                ('contact_phone', models.CharField(blank=True, max_length=30)),
                ('contact_phone_2', models.CharField(blank=True, max_length=30, verbose_name='Second phone')),
                ('whatsapp_number', models.CharField(blank=True, help_text='International format, e.g. +237677000000', max_length=30)),
                # Location
                ('address_line_1', models.CharField(blank=True, max_length=200)),
                ('address_line_2', models.CharField(blank=True, max_length=200)),
                ('city', models.CharField(blank=True, max_length=100)),
                ('region', models.CharField(blank=True, max_length=100)),
                ('country', models.CharField(blank=True, default='Cameroon', max_length=100)),
                ('google_maps_embed_url', models.URLField(blank=True, help_text='Paste the Google Maps embed src URL')),
                ('google_maps_link', models.URLField(blank=True, help_text='Direct "View on Maps" link')),
                ('opening_hours', models.CharField(blank=True, help_text='e.g. Mon–Sat 8 AM – 6 PM', max_length=200)),
                # Social
                ('facebook_url', models.URLField(blank=True)),
                ('instagram_url', models.URLField(blank=True)),
                ('twitter_url', models.URLField(blank=True, verbose_name='X (Twitter) URL')),
                ('youtube_url', models.URLField(blank=True)),
                ('tiktok_url', models.URLField(blank=True)),
                ('linkedin_url', models.URLField(blank=True)),
                # Dashboard icons
                ('dashboard_icon_revenue', models.CharField(
                    choices=[
                        ('DollarSign', 'Dollar Sign'), ('BadgeDollarSign', 'Badge Dollar Sign'),
                        ('Coins', 'Coins'), ('CreditCard', 'Credit Card'),
                        ('ShoppingBag', 'Shopping Bag'), ('ShoppingCart', 'Shopping Cart'),
                        ('Package', 'Package'), ('Box', 'Box'),
                        ('Calendar', 'Calendar'), ('CalendarCheck', 'Calendar Check'),
                        ('CalendarDays', 'Calendar Days'), ('Clock', 'Clock'),
                        ('Timer', 'Timer'), ('Hourglass', 'Hourglass'),
                        ('TrendingUp', 'Trending Up'), ('BarChart2', 'Bar Chart'),
                        ('Activity', 'Activity'), ('Users', 'Users'),
                    ],
                    default='DollarSign', max_length=40, verbose_name='Revenue card icon',
                )),
                ('dashboard_icon_orders', models.CharField(
                    choices=[
                        ('DollarSign', 'Dollar Sign'), ('BadgeDollarSign', 'Badge Dollar Sign'),
                        ('Coins', 'Coins'), ('CreditCard', 'Credit Card'),
                        ('ShoppingBag', 'Shopping Bag'), ('ShoppingCart', 'Shopping Cart'),
                        ('Package', 'Package'), ('Box', 'Box'),
                        ('Calendar', 'Calendar'), ('CalendarCheck', 'Calendar Check'),
                        ('CalendarDays', 'Calendar Days'), ('Clock', 'Clock'),
                        ('Timer', 'Timer'), ('Hourglass', 'Hourglass'),
                        ('TrendingUp', 'Trending Up'), ('BarChart2', 'Bar Chart'),
                        ('Activity', 'Activity'), ('Users', 'Users'),
                    ],
                    default='ShoppingBag', max_length=40, verbose_name='Orders card icon',
                )),
                ('dashboard_icon_bookings', models.CharField(
                    choices=[
                        ('DollarSign', 'Dollar Sign'), ('BadgeDollarSign', 'Badge Dollar Sign'),
                        ('Coins', 'Coins'), ('CreditCard', 'Credit Card'),
                        ('ShoppingBag', 'Shopping Bag'), ('ShoppingCart', 'Shopping Cart'),
                        ('Package', 'Package'), ('Box', 'Box'),
                        ('Calendar', 'Calendar'), ('CalendarCheck', 'Calendar Check'),
                        ('CalendarDays', 'Calendar Days'), ('Clock', 'Clock'),
                        ('Timer', 'Timer'), ('Hourglass', 'Hourglass'),
                        ('TrendingUp', 'Trending Up'), ('BarChart2', 'Bar Chart'),
                        ('Activity', 'Activity'), ('Users', 'Users'),
                    ],
                    default='Calendar', max_length=40, verbose_name='Bookings card icon',
                )),
                ('dashboard_icon_pending', models.CharField(
                    choices=[
                        ('DollarSign', 'Dollar Sign'), ('BadgeDollarSign', 'Badge Dollar Sign'),
                        ('Coins', 'Coins'), ('CreditCard', 'Credit Card'),
                        ('ShoppingBag', 'Shopping Bag'), ('ShoppingCart', 'Shopping Cart'),
                        ('Package', 'Package'), ('Box', 'Box'),
                        ('Calendar', 'Calendar'), ('CalendarCheck', 'Calendar Check'),
                        ('CalendarDays', 'Calendar Days'), ('Clock', 'Clock'),
                        ('Timer', 'Timer'), ('Hourglass', 'Hourglass'),
                        ('TrendingUp', 'Trending Up'), ('BarChart2', 'Bar Chart'),
                        ('Activity', 'Activity'), ('Users', 'Users'),
                    ],
                    default='Clock', max_length=40, verbose_name='Pending orders card icon',
                )),
                # Meta
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Site Settings',
                'verbose_name_plural': 'Site Settings',
                'db_table': 'site_settings',
            },
        ),
    ]
