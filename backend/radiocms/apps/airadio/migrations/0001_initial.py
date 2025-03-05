from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Library',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Title')),
                ('artist', models.CharField(max_length=255, verbose_name='Artist')),
                ('duration', models.IntegerField(default=0, verbose_name='Duration')),
                ('media_url', models.URLField(verbose_name='Media URL')),
                ('cover_art', models.URLField(blank=True, null=True, verbose_name='Cover Art URL')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Library',
                'verbose_name_plural': 'Library',
                'db_table': 'library',
            },
        ),
        migrations.CreateModel(
            name='Wall',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Title')),
                ('content_type', models.CharField(max_length=50, verbose_name='Content Type')),
                ('media_url', models.URLField(verbose_name='Media URL')),
                ('cover_art', models.URLField(blank=True, null=True, verbose_name='Cover Art URL')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Wall',
                'verbose_name_plural': 'Wall',
                'db_table': 'wall',
            },
        ),
        migrations.CreateModel(
            name='Station',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
                ('logo_url', models.URLField(blank=True, verbose_name='Logo URL')),
                ('stream_url', models.URLField(blank=True, verbose_name='Stream URL')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Station',
                'verbose_name_plural': 'Stations',
                'db_table': 'stations',
            },
        ),
    ] 