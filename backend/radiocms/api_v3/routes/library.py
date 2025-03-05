import logging
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ...utils.storage import upload_to_s3

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_media(request):
    try:
        # Log request details
        logger.info(f"Received upload request with files: {request.FILES.keys()}")
        
        # Get the audio file
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({'error': 'No audio file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Log file details
        logger.info(f"Audio file details: name={audio_file.name}, size={audio_file.size}, content_type={audio_file.content_type}")

        # Upload audio to S3
        audio_url = upload_to_s3(audio_file, 'audio')
        if not audio_url:
            logger.error("Failed to upload audio file to S3")
            return Response({'error': 'Failed to upload audio file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Handle cover art if present
        cover_art_url = None
        if 'cover_art' in request.FILES:
            cover_art = request.FILES['cover_art']
            logger.info(f"Cover art details: name={cover_art.name}, size={cover_art.size}")
            cover_art_url = upload_to_s3(cover_art, 'covers')
            if not cover_art_url:
                logger.error("Failed to upload cover art to S3")

        # Handle lyrics file if present
        lyrics_url = None
        if 'lyrics' in request.FILES:
            lyrics_file = request.FILES['lyrics']
            logger.info(f"Lyrics file details: name={lyrics_file.name}, size={lyrics_file.size}")
            lyrics_url = upload_to_s3(lyrics_file, 'lyrics')
            if not lyrics_url:
                logger.error("Failed to upload lyrics file to S3")

        # Create response with URLs
        response_data = {
            'audio_url': audio_url,
            'cover_art_url': cover_art_url,
            'lyrics_url': lyrics_url
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in upload_media: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 