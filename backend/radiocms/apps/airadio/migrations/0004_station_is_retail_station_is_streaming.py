# Generated by Django 5.1.6 on 2025-02-22 12:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('airadio', '0003_station_location_station_retail'),
    ]

    operations = [
        migrations.AddField(
            model_name='station',
            name='is_retail',
            field=models.BooleanField(default=False, verbose_name='Is Retail'),
        ),
        migrations.AddField(
            model_name='station',
            name='is_streaming',
            field=models.BooleanField(default=False, verbose_name='Is Streaming'),
        ),
    ]
