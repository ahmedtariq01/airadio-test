from django.db import models
from django.utils.translation import gettext_lazy as _

class Podcast(models.Model):
    title = models.CharField(_("Title"), max_length=255)
    description = models.TextField(_("Description"))
    cover_art = models.URLField(_("Cover Art URL"), blank=True, null=True)
    media_url = models.URLField(_("Media URL"))
    published_at = models.DateTimeField(_("Published At"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'airadio'
        db_table = 'podcasts'
        ordering = ['-published_at']

    def __str__(self):
        return self.title 