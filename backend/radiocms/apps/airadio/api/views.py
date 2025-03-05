from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from radiocms.models.library import LibraryItem
from radiocms.models.playlist import Playlist
from radiocms.models.playlistitem import PlaylistItem

from ..models import  Wall, Station, Format, Podcast, Category
from .serializers import ( WallSerializer, StationSerializer, FormatSerializer, PodcastSerializer, \
                          PlaylistSerializer, PlaylistItemSerializer, libraryitemSerializer, libraryitemlistSerializer,
                          CategorySerializer)
from rest_framework.response import Response

from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework import status

# class LibraryViewSet(viewsets.ModelViewSet):
#     queryset = Library.objects.all()
#     serializer_class = LibrarySerializer

class WallViewSet(viewsets.ModelViewSet):
    queryset = Wall.objects.all()
    serializer_class = WallSerializer

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class FormatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Format.objects.all()
    serializer_class = FormatSerializer

class PodcastViewSet(viewsets.ModelViewSet):
    queryset = Podcast.objects.all()
    serializer_class = PodcastSerializer


class libraryitemViewSet(viewsets.ModelViewSet):
    queryset = LibraryItem.objects.all()
    serializer_class = libraryitemSerializer
    permission_classes = [AllowAny]
    

class PlaylistViewSet(viewsets.ModelViewSet):
    """
    API endpoint to manage playlists.
    """
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Filters playlists by station name if 'station_name' is passed as a query parameter.
        """
        queryset = super().get_queryset()
        station_name = self.request.query_params.get('station_name')

        if station_name:
            queryset = queryset.filter(station__name__icontains=station_name)

        return queryset

    @action(detail=False, methods=['get'])
    def by_station(self, request):
        """
        Retrieves playlists filtered by station ID.
        Usage: /api/playlists/by_station/?station_id=<station_id>
        """
        station_id = request.query_params.get('station_id')
        if not station_id:
            return Response({"error": "station_id is required"}, status=400)

        station = get_object_or_404(Station, id=station_id)
        playlists = Playlist.objects.filter(station=station)
        serializer = self.get_serializer(playlists, many=True)
        return Response(serializer.data)

class PlaylistItemViewSet(viewsets.ModelViewSet):
    queryset = PlaylistItem.objects.all()
    serializer_class = PlaylistItemSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Adds a song to a specific playlist for a station.
        If no playlist is provided, it creates/uses a 'Default Station Playlist'.
        """
        playlist_id = request.data.get("playlist")
        library_item_id = request.data.get("library_item")
        station_id = request.data.get("station_id")  # Allow adding by station directly

        if not library_item_id:
            return Response({"error": "LibraryItem (song) is required"}, status=400)

        # Retrieve the song
        library_item = get_object_or_404(LibraryItem, id=library_item_id)

        if playlist_id:
            # Add song to the specified playlist
            playlist = get_object_or_404(Playlist, id=playlist_id)
        elif station_id:
            # If station_id is provided but no playlist, find/create a default playlist
            station = get_object_or_404(Station, id=station_id)
            playlist, created = Playlist.objects.get_or_create(
                station=station,
                name="Default Station Playlist",
                defaults={"description": f"Auto-generated for {station.name}"}
            )
        else:
            return Response({"error": "Either playlist or station_id is required"}, status=400)

        # Check if the song is already in the playlist
        if PlaylistItem.objects.filter(playlist=playlist, library_item=library_item).exists():
            return Response({"message": "Song already exists in this playlist"}, status=200)

        # Add the song to the playlist
        playlist_item = PlaylistItem.objects.create(
            playlist=playlist,
            library_item=library_item,
            added_by=request.user,
            position=PlaylistItem.objects.filter(playlist=playlist).count() + 1  # Auto-increment position
        )

        return Response(PlaylistItemSerializer(playlist_item).data, status=201)

    @action(detail=False, methods=['get'])
    def songs_by_station(self, request):
        """
        Fetch all unique songs for a given station including the playlist item id.
        Usage: /api/playlist-items/songs_by_station/?station_id=<station_id>
        """
        station_id = request.query_params.get("station_id")
        if not station_id:
            return Response({"error": "station_id is required"}, status=400)

        # Get the station
        station = get_object_or_404(Station, id=station_id)

        # Get all playlists belonging to this station
        playlists = Playlist.objects.filter(station=station)

        # Get all playlist items linked to these playlists, with the related library_item pre-fetched
        playlist_items = PlaylistItem.objects.filter(playlist__in=playlists).select_related("library_item")

        # Build a list of unique songs, including the playlist item id
        unique_songs = []
        seen_library_item_ids = set()
        for item in playlist_items:
            # Only add the song if it hasn't been added already
            if item.library_item.id not in seen_library_item_ids:
                seen_library_item_ids.add(item.library_item.id)
                # Serialize the library item data
                song_data = libraryitemlistSerializer(item.library_item).data
                # Include the playlist item id so it can be used for deletion
                song_data["playlist_item_id"] = item.id
                unique_songs.append(song_data)

        return Response(unique_songs)

    def destroy(self, request, *args, **kwargs):
        """
        Deletes a PlaylistItem and then updates the positions of the remaining items
        in the same playlist.
        """
        instance = self.get_object()
        playlist = instance.playlist
        # Delete the playlist item
        self.perform_destroy(instance)

        # Reorder the remaining items in the playlist
        remaining_items = PlaylistItem.objects.filter(playlist=playlist).order_by('position')
        for index, item in enumerate(remaining_items, start=1):
            if item.position != index:
                item.position = index
                item.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class UpdatePlaylistItemRotation(APIView):

    def patch(self, request, pk):
        playlist_item = get_object_or_404(PlaylistItem, id=pk)
        serializer = PlaylistItemSerializer(playlist_item, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Rotation updated successfully", "data": serializer.data})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
