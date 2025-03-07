# Generated by Django 5.1.6 on 2025-03-01 21:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('airadio', '0005_category_stationid'),
        ('radiocms', '0004_libraryitem_categories_playlistitem_categories'),
    ]

    operations = [
        migrations.AddField(
            model_name='libraryitem',
            name='formats',
            field=models.ManyToManyField(blank=True, related_name='radiocms_library_items', to='airadio.format'),
        ),
    ]
