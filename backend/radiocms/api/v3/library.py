from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from typing import Optional
from radiocms.auth import get_current_user
import logging
import traceback

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = APIRouter()

@router.post("/items/")
async def create_library_item(
    audio: UploadFile = File(...),
    cover_art: Optional[UploadFile] = File(None),
    lyrics: Optional[UploadFile] = File(None),
    title: str = Form(...),
    artist: str = Form(...),
    genre: Optional[str] = Form(None),
    rotation: str = Form(...),
    markers: str = Form(...),
    allow_skip: bool = Form(False),
    is_clean: bool = Form(False),
    current_user = Depends(get_current_user)
):
    try:
        # Log request details
        logger.info("Received request with:")
        logger.info(f"Title: {title}")
        logger.info(f"Artist: {artist}")
        logger.info(f"Audio file: {audio.filename}")
        logger.info(f"Cover art: {cover_art.filename if cover_art else 'None'}")
        logger.info(f"Lyrics: {lyrics.filename if lyrics else 'None'}")
        logger.info(f"Markers: {markers}")
        logger.info(f"User: {current_user}")

        # Implement actual file handling and database operations here
        # For now, just return success
        return {"message": "Item created successfully"}

    except Exception as e:
        # Log the full traceback
        logger.error("Error in create_library_item:")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/test")
async def test_endpoint():
    return {"message": "FastAPI is working!"} 