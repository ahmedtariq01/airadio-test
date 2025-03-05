from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from ..utils.storage import upload_to_s3
import json
import logging
from radiocms.apps.airadio.api.serializers import libraryitemSerializer

from django.contrib.auth import get_user_model
from radiocms.apps.airadio.api.serializers import *
from rest_framework import viewsets

logger = logging.getLogger(__name__)

User = get_user_model()

@api_view(['POST', 'OPTIONS'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_library_item(request):
    if request.method == 'OPTIONS':
        return Response(status=status.HTTP_200_OK)

    try:
        logger.info("Received create_library_item request")
        logger.info(f"User: {request.user}")
        
        # Get files from request
        audio_file = request.FILES.get('audio')
        cover_art = request.FILES.get('cover_art')
        lyrics_file = request.FILES.get('lyrics')

        # Log file details
        logger.info(f"Files received:")
        if audio_file:
            logger.info(f"Audio file: name={audio_file.name}, size={audio_file.size}, type={audio_file.content_type}")
            logger.info(f"Audio file attributes: {dir(audio_file)}")
        else:
            logger.warning("No audio file received")

        # Validate required fields
        if not audio_file:
            return Response(
                {'message': 'Audio file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Upload files to S3
        try:
            logger.info("Attempting to upload audio file to S3...")
            audio_url = upload_to_s3(audio_file, 'audio')
            if not audio_url:
                logger.error("Failed to get URL from audio file upload")
                return Response(
                    {'message': 'Failed to upload audio file'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            logger.info(f"Audio file uploaded successfully: {audio_url}")

            # Handle optional files
            cover_art_url = ''
            if cover_art:
                logger.info("Attempting to upload cover art...")
                cover_art_url = upload_to_s3(cover_art, 'images') or ''
                logger.info(f"Cover art uploaded: {cover_art_url}")

            lyrics_url = ''
            if lyrics_file:
                logger.info("Attempting to upload lyrics file...")
                lyrics_url = upload_to_s3(lyrics_file, 'lyrics') or ''
                logger.info(f"Lyrics file uploaded: {lyrics_url}")

            # Create library item
            logger.info("Creating library item...")
            item = LibraryItem.objects.create(
                title=request.POST.get('title', ''),
                artist=request.POST.get('artist', ''),
                genre=request.POST.get('genre', ''),
                rotation=request.POST.get('rotation', 'medium'),
                audio_file=audio_url,
                cover_art=cover_art_url,
                lyrics_file=lyrics_url,
                intro_point=float(json.loads(request.POST.get('markers', '{}')).get('in', 0)),
                vocal_point=float(json.loads(request.POST.get('markers', '{}')).get('vox', 0)),
                aux_point=float(json.loads(request.POST.get('markers', '{}')).get('aux', 0)),
                allow_skip=request.POST.get('allow_skip', 'false').lower() == 'true',
                is_clean=request.POST.get('is_clean', 'false').lower() == 'true',
                created_by=request.user
            )

            # Handle formats
            # formats = json.loads(request.POST.get('formats', '[]'))
            # if formats:
            #     item.formats.set(formats)

            logger.info(f"Library item created successfully with ID: {item.id}")

            return Response({
                'message': 'Item created successfully',
                'id': str(item.id)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error processing files: {str(e)}", exc_info=True)
            return Response(
                {'message': f'Error processing files: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except Exception as e:
        logger.error(f"Error in create_library_item: {str(e)}", exc_info=True)
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def test_auth(request):
    try:
        # Log authentication details
        logger.info(f"Testing auth for user: {request.user}")
        logger.info(f"Auth header: {request.headers.get('Authorization', '')}")
        
        return Response({
            'message': 'Authentication successful',
            'user': str(request.user),
            'user_id': request.user.id
        })
    except Exception as e:
        logger.error(f"Auth test failed: {str(e)}", exc_info=True)
        return Response(
            {'message': str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )


class PlaylistItemViewSet(viewsets.ModelViewSet):
    queryset = PlaylistItem.objects.all()
    serializer_class = PlaylistItemSerializer

    def create(self, request, *args, **kwargs):
        """
        Adds a song to a specific playlist for a station.
        """
        playlist_id = request.data.get("playlist")
        library_item_id = request.data.get("library_item")

        if not playlist_id or not library_item_id:
            return Response({"error": "Playlist and LibraryItem are required"}, status=400)

        try:
            playlist = Playlist.objects.get(id=playlist_id)
            library_item = LibraryItem.objects.get(id=library_item_id)
        except (Playlist.DoesNotExist, LibraryItem.DoesNotExist):
            return Response({"error": "Playlist or LibraryItem not found"}, status=404)

        playlist_item = PlaylistItem.objects.create(
            playlist=playlist,
            library_item=library_item,
            added_by=request.user
        )

        return Response(PlaylistItemSerializer(playlist_item).data, status=201)

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
