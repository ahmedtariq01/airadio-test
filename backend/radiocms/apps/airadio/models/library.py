from django.db import models
from django.utils.translation import gettext_lazy as _

# class Library(models.Model):
#     title = models.CharField(_("Title"), max_length=255)
#     artist = models.CharField(_("Artist"), max_length=255)
#     duration = models.IntegerField(_("Duration"), default=0)
#     media_url = models.URLField(_("Media URL"))
#     cover_art = models.URLField(_("Cover Art URL"), blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     formats = models.ManyToManyField(
#         'Format',
#         related_name='library_items',
#         blank=True
#     )
#
#     class Meta:
#         app_label = 'airadio'
#         db_table = 'library'
#         verbose_name = 'Library'
#         verbose_name_plural = 'Library'
#
#     def __str__(self):
#         return f"{self.artist} - {self.title}"

class Wall(models.Model):
    title = models.CharField(_("Title"), max_length=255)
    content_type = models.CharField(_("Content Type"), max_length=50)
    media_url = models.URLField(_("Media URL"))
    cover_art = models.URLField(_("Cover Art URL"), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'airadio'
        db_table = 'wall'
        verbose_name = 'Wall'
        verbose_name_plural = 'Wall'

    def __str__(self):
        return self.title 