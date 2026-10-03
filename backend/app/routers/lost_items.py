from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.item import LostItem
from backend.app.models.enums import LostItemStatus
from backend.app.schemas.item import (
    LostItemCreate, LostItemUpdate, LostItemStatusUpdate, LostItemResponse
)
from backend.app.schemas.match import MatchSuggestion
from backend.app.services.matcher import find_matches_for_lost_item

router = APIRouter(prefix="/api/lost-items", tags=["Lost Items"])

# Allowed status transitions for Lost Items:
# searching -> possible match -> claimed -> returned or lost
VALID_LOST_TRANSITIONS = {
    LostItemStatus.SEARCHING.value: [
        LostItemStatus.POSSIBLE_MATCH.value,
        LostItemStatus.CLAIMED.value,
        LostItemStatus.LOST.value,
    ],
    LostItemStatus.POSSIBLE_MATCH.value: [
        LostItemStatus.SEARCHING.value,
        LostItemStatus.CLAIMED.value,
        LostItemStatus.LOST.value,
    ],
    LostItemStatus.CLAIMED.value: [
        LostItemStatus.RETURNED.value,
        LostItemStatus.SEARCHING.value,
        LostItemStatus.LOST.value,
    ],
    LostItemStatus.RETURNED.value: [
        LostItemStatus.SEARCHING.value # reopen if mistake
    ],
    LostItemStatus.LOST.value: [
        LostItemStatus.SEARCHING.value # reopen if new leads
    ],
}

@router.get("", response_model=List[LostItemResponse])
def get_lost_items(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LostItem)
    if status_filter:
        query = query.filter(LostItem.status == status_filter)
    if category and category != "All":
        query = query.filter(LostItem.category == category)
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            (LostItem.title.ilike(search_pattern)) |
            (LostItem.description.ilike(search_pattern)) |
            (LostItem.campus_location.ilike(search_pattern))
        )
    return query.order_by(LostItem.created_at.desc()).all()


@router.post("", response_model=LostItemResponse, status_code=status.HTTP_201_CREATED)
def create_lost_item(payload: LostItemCreate, db: Session = Depends(get_db)):
    data = payload.dict()
    if not data.get("date_lost"):
        data["date_lost"] = datetime.utcnow()
    
    # Lost items default to "searching" status
    data["status"] = LostItemStatus.SEARCHING.value
    
    lost_item = LostItem(**data)
    db.add(lost_item)
    db.commit()
    db.refresh(lost_item)

    # Automatically check for high confidence matches (score >= 60%)
    matches = find_matches_for_lost_item(db, lost_item, min_score=60.0)
    if matches:
        lost_item.status = LostItemStatus.POSSIBLE_MATCH.value
        db.commit()
        db.refresh(lost_item)

    return lost_item


@router.get("/{item_id}", response_model=LostItemResponse)
def get_lost_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    return item


@router.patch("/{item_id}/status", response_model=LostItemResponse)
def update_lost_item_status(item_id: int, payload: LostItemStatusUpdate, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")

    new_status = payload.status.lower()
    valid_statuses = [s.value for s in LostItemStatus]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Allowed values: {valid_statuses}"
        )

    # Verify flow transition
    allowed = VALID_LOST_TRANSITIONS.get(item.status, [])
    if new_status != item.status and new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition status from '{item.status}' to '{new_status}'. Allowed next states: {allowed}"
        )

    item.status = new_status
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=LostItemResponse)
def update_lost_item(item_id: int, payload: LostItemUpdate, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")

    update_data = payload.dict(exclude_unset=True)
    if "status" in update_data and update_data["status"]:
        new_status = update_data["status"].lower()
        if new_status not in [s.value for s in LostItemStatus]:
            raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'")
        item.status = new_status

    for key, value in update_data.items():
        if key != "status":
            setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lost_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    db.delete(item)
    db.commit()
    return None


@router.get("/{item_id}/matches", response_model=List[MatchSuggestion])
def get_lost_item_matches(item_id: int, min_score: float = 35.0, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")

    raw_matches = find_matches_for_lost_item(db, item, min_score=min_score)
    suggestions = []
    for m in raw_matches:
        suggestions.append(MatchSuggestion(
            lost_item_id=item.id,
            found_item_id=m["found_item"].id,
            match_score=m["score"],
            reasons=m["reasons"],
            found_item=m["found_item"]
        ))
    return suggestions
