from django.contrib import admin
from radiocms.models.library import LibraryItem
from radiocms.models.playlist import Playlist
from radiocms.models.playlistitem import PlaylistItem
from radiocms.apps.airadio.models.settings import Station

@admin.register(LibraryItem)
class LibraryItemAdmin(admin.ModelAdmin):
    list_display = ("title", "artist", "genre", "rotation", "allow_skip", "is_clean", "created_at")
    search_fields = ("title", "artist", "genre")
    list_filter = ("rotation", "is_clean", "allow_skip")
    ordering = ("-created_at",)

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ("name", "station")
    search_fields = ("name", "station__name")
    list_filter = ("station",)
    ordering = ("-created_at",)

@admin.register(PlaylistItem)
class PlaylistItemAdmin(admin.ModelAdmin):
    list_display = ("library_item", "playlist", "position", "added_by")
    search_fields = ("library_item__title", "playlist__name")
    list_filter = ("playlist__station",)
    ordering = ("playlist", "position")
