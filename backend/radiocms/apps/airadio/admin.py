from django.contrib import admin
from .models import  Wall, Station, Format

# @admin.register(Library)
# class LibraryAdmin(admin.ModelAdmin):
#     list_display = ('title', 'artist', 'duration', 'created_at')
#     search_fields = ('title', 'artist')
#     list_filter = ('created_at',)

@admin.register(Wall)
class WallAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'created_at')
    search_fields = ('title',)
    list_filter = ('content_type', 'created_at')

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)


@admin.register(Format)
class StationAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)