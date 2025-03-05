from rest_framework import serializers

from radiocms.models.library import LibraryItem
from radiocms.models.playlist import Playlist
from radiocms.models.playlistitem import PlaylistItem

from ..models import  Wall, Station, Format, Podcast, Category

# class LibrarySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Library
#         fields = '__all__'

class WallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wall
        fields = '__all__'

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class FormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Format
        fields = ['id', 'name', 'description', 'color', 'created_at', 'updated_at']

class PodcastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Podcast
        fields = '__all__'

class libraryitemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryItem
        fields = '__all__'

class libraryitemlistSerializer(serializers.ModelSerializer):
    rotation = serializers.SerializerMethodField()

    class Meta:
        model = LibraryItem
        fields = '__all__'

    def get_rotation(self, obj):
        return PlaylistItem.objects.filter(library_item=obj).first().rotation

class PlaylistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistItem
        fields = '__all__'

class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = '__all__'