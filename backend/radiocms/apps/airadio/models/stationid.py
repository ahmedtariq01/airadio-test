import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _

class StationID(models.Model):
    """
    Stores station branding elements like jingles, voice-overs, and branding audio.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    station = models.ForeignKey("Station", on_delete=models.CASCADE, related_name="station_ids")
    media_url = models.URLField(max_length=200)  # Audio file URL
    played_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "station_ids"

    def __str__(self):
        return f"{self.title} - {self.station.name}"