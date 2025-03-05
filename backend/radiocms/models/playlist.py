from django.db import models
from radiocms.apps.airadio.models.settings import Station
import uuid

class Playlist(models.Model):
    """
    A playlist belongs to a station and contains multiple songs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="playlists")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "radiocms"
        db_table = "playlists"

    def __str__(self):
        return f"{self.name} ({self.station.name})"
