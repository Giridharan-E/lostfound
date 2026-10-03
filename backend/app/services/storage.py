import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from backend.app.config import settings

def save_uploaded_image(file: UploadFile) -> str:
    """Save an uploaded image file and return the public URL path."""
    if not file.content_type or file.content_type.lower() not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )
    
    # Extract extension
    file_ext = Path(file.filename).suffix if file.filename else ".jpg"
    if not file_ext:
        file_ext = ".jpg"
        
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    destination = settings.UPLOAD_DIR / unique_filename

    try:
        with destination.open("wb") as buffer:
            # Read in chunks
            size = 0
            max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
            while chunk := file.file.read(1024 * 1024):
                size += len(chunk)
                if size > max_bytes:
                    if destination.exists():
                        destination.unlink()
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
                    )
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image: {str(e)}"
        )
    finally:
        file.file.close()

    return f"/uploads/{unique_filename}"
