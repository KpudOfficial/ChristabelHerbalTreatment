"""Add popup_frequency_days to Banner."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('banners', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='banner',
            name='popup_frequency_days',
            field=models.PositiveIntegerField(
                default=1,
                help_text='Popup placement only: how many days between each time this popup is shown to the same visitor.',
            ),
        ),
    ]
