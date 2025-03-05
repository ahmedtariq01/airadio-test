from django.db import models
from .library import LibraryItem  # Import the song model
from .playlist import Playlist  # Import the Playlist model
import uuid
from django.contrib.auth import get_user_model


User = get_user_model()

class PlaylistItem(models.Model):
    """
    Links songs (LibraryItem) to a playlist.
    """

    ROTATION_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="items")
    library_item = models.ForeignKey(LibraryItem, on_delete=models.CASCADE, related_name="playlists")
    position = models.PositiveIntegerField(default=0)  # Song order in the playlist
    rotation = models.CharField(max_length=10, choices=ROTATION_CHOICES, default='medium')
    added_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="added_songs")

    categories = models.ManyToManyField("airadio.Category", related_name="playlist_items", blank=True)


    class Meta:
        app_label = "radiocms"
        db_table = "playlist_items"
        unique_together = ('playlist', 'library_item')  # Avoid duplicate songs in a playlist
        ordering = ['position']

    def __str__(self):
        return f"{self.library_item.title} in {self.playlist.name}"