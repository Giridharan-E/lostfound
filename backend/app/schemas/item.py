from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from backend.app.models.enums import LostItemStatus, FoundItemStatus, ItemCategory, ClaimStatus

# ----------------- Lost Item Schemas ----------------- #
class LostItemBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    category: str = Field(default=ItemCategory.OTHER.value)
    description: str = Field(..., min_length=5)
    campus_location: str = Field(..., min_length=2, max_length=255)
    date_lost: Optional[datetime] = None
    image_url: Optional[str] = None
    reporter_name: str = Field(..., min_length=2, max_length=100)
    reporter_email: str = Field(..., min_length=3, max_length=150)
    reporter_phone: Optional[str] = None
    student_id: Optional[str] = None
    secret_details: Optional[str] = None

class LostItemCreate(LostItemBase):
    pass

class LostItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    campus_location: Optional[str] = None
    date_lost: Optional[datetime] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_email: Optional[str] = None
    reporter_phone: Optional[str] = None
    student_id: Optional[str] = None
    secret_details: Optional[str] = None

class LostItemStatusUpdate(BaseModel):
    status: str = Field(..., description="Must be one of: searching, possible match, claimed, returned, lost")

class LostItemResponse(LostItemBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ----------------- Found Item Schemas ----------------- #
class FoundItemBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    category: str = Field(default=ItemCategory.OTHER.value)
    description: str = Field(..., min_length=5)
    campus_location: str = Field(..., min_length=2, max_length=255)
    storage_location: Optional[str] = "Campus Security / Lost & Found Office"
    date_found: Optional[datetime] = None
    image_url: Optional[str] = None
    finder_name: str = Field(..., min_length=2, max_length=100)
    finder_email: str = Field(..., min_length=3, max_length=150)
    finder_phone: Optional[str] = None

class FoundItemCreate(FoundItemBase):
    pass

class FoundItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    campus_location: Optional[str] = None
    storage_location: Optional[str] = None
    date_found: Optional[datetime] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    finder_name: Optional[str] = None
    finder_email: Optional[str] = None
    finder_phone: Optional[str] = None

class FoundItemStatusUpdate(BaseModel):
    status: str = Field(..., description="Must be one of: available, possible match, claimed, returned")

class FoundItemResponse(FoundItemBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ----------------- Claim Schemas ----------------- #
class ClaimCreate(BaseModel):
    found_item_id: int
    lost_item_id: Optional[int] = None
    claimant_name: str = Field(..., min_length=2, max_length=100)
    claimant_email: str = Field(..., min_length=3, max_length=150)
    claimant_phone: Optional[str] = None
    student_id: Optional[str] = None
    proof_description: str = Field(..., min_length=10, description="Provide verifiable proof of ownership")

class ClaimResponse(BaseModel):
    id: int
    found_item_id: int
    lost_item_id: Optional[int]
    claimant_name: str
    claimant_email: str
    claimant_phone: Optional[str]
    student_id: Optional[str]
    proof_description: str
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime]
    review_notes: Optional[str]

    class Config:
        from_attributes = True
