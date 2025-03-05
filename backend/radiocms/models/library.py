from django.db import models
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()

class LibraryItem(models.Model):
    class Meta:
        app_label = 'radiocms'

    ROTATION_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    genre = models.CharField(max_length=100, blank=True)
    rotation = models.CharField(max_length=10, choices=ROTATION_CHOICES, default='medium')
    
    # File URLs
    audio_file = models.URLField(max_length=500)
    cover_art = models.URLField(max_length=500, blank=True)
    lyrics_file = models.URLField(max_length=500, blank=True)
    
    # Markers
    intro_point = models.FloatField(default=0)
    vocal_point = models.FloatField(default=0)
    aux_point = models.FloatField(default=0)
    
    # Flags
    allow_skip = models.BooleanField(default=False)
    is_clean = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    categories = models.ManyToManyField("airadio.Category", related_name="library_items", blank=True)
    formats = models.ManyToManyField("airadio.Format", related_name="radiocms_library_items", blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.artist}"
