from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.services.storage import save_uploaded_image

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])

@router.post("")
def upload_item_image(file: UploadFile = File(...)):
    """Upload an item photo for lost or found items."""
    try:
        image_url = save_uploaded_image(file)
        return {"url": image_url, "filename": file.filename}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
