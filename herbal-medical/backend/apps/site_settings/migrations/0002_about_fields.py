"""Add about page content fields to SiteSettings."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('site_settings', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='about_hero_title',
            field=models.CharField(blank=True, default='About Us', max_length=200),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='about_hero_subtitle',
            field=models.TextField(blank=True, max_length=400),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='about_story',
            field=models.TextField(blank=True, help_text='Our Story section body text'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='about_doctor_name',
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='about_doctor_bio',
            field=models.TextField(blank=True, help_text='Doctor/founder bio paragraph'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='about_doctor_image',
            field=models.ImageField(blank=True, null=True, upload_to='site/'),
        ),
    ]
