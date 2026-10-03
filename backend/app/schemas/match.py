from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from backend.app.schemas.item import LostItemResponse, FoundItemResponse

class MatchCreate(BaseModel):
    lost_item_id: int
    found_item_id: int
    match_score: float
    match_reason: Optional[str] = None

class MatchStatusUpdate(BaseModel):
    status: str # suggested, confirmed, rejected

class MatchResponse(BaseModel):
    id: int
    lost_item_id: int
    found_item_id: int
    match_score: float
    match_reason: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    lost_item: Optional[LostItemResponse] = None
    found_item: Optional[FoundItemResponse] = None

    class Config:
        from_attributes = True

class MatchSuggestion(BaseModel):
    lost_item_id: int
    found_item_id: int
    match_score: float
    reasons: list[str]
    found_item: FoundItemResponse
