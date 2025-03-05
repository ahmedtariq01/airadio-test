from django.db import models
from django.utils.translation import gettext_lazy as _

class Station(models.Model):
    name = models.CharField(_("Name"), max_length=255)
    description = models.TextField(_("Description"), blank=True)
    logo_url = models.URLField(_("Logo URL"), blank=True)
    stream_url = models.URLField(_("Stream URL"), blank=True)
    is_retail = models.BooleanField(_("Is Retail"), default=False)
    is_streaming = models.BooleanField(_("Is Streaming"), default=False)
    retail = models.CharField(_("Retail"), max_length=255)
    location = models.CharField(_("Location"), max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'airadio'
        db_table = 'stations'
        verbose_name = 'Station'
        verbose_name_plural = 'Stations'

    def __str__(self):
        return self.name

class Format(models.Model):
    name = models.CharField(_("Name"), max_length=100)
    description = models.TextField(_("Description"), blank=True)
    color = models.CharField(_("Color"), max_length=7, default="#7ac5be")  # Hex color code
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'airadio'
        db_table = 'formats'
        verbose_name = 'Format'
        verbose_name_plural = 'Formats'
        ordering = ['name']

    def __str__(self):
        return self.name
