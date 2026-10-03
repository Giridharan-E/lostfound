from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.item import FoundItem, LostItem
from backend.app.models.enums import FoundItemStatus, LostItemStatus
from backend.app.schemas.item import (
    FoundItemCreate, FoundItemUpdate, FoundItemStatusUpdate, FoundItemResponse, LostItemResponse
)
from backend.app.services.matcher import find_matches_for_found_item

router = APIRouter(prefix="/api/found-items", tags=["Found Items"])

# Allowed status transitions for Found Items:
# available -> possible match -> claimed -> returned
VALID_FOUND_TRANSITIONS = {
    FoundItemStatus.AVAILABLE.value: [
        FoundItemStatus.POSSIBLE_MATCH.value,
        FoundItemStatus.CLAIMED.value,
        FoundItemStatus.RETURNED.value,
    ],
    FoundItemStatus.POSSIBLE_MATCH.value: [
        FoundItemStatus.AVAILABLE.value,
        FoundItemStatus.CLAIMED.value,
        FoundItemStatus.RETURNED.value,
    ],
    FoundItemStatus.CLAIMED.value: [
        FoundItemStatus.AVAILABLE.value,
        FoundItemStatus.RETURNED.value,
    ],
    FoundItemStatus.RETURNED.value: [
        FoundItemStatus.AVAILABLE.value # reopen if returned wrongly
    ],
}

@router.get("", response_model=List[FoundItemResponse])
def get_found_items(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FoundItem)
    if status_filter:
        query = query.filter(FoundItem.status == status_filter)
    if category and category != "All":
        query = query.filter(FoundItem.category == category)
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            (FoundItem.title.ilike(search_pattern)) |
            (FoundItem.description.ilike(search_pattern)) |
            (FoundItem.campus_location.ilike(search_pattern)) |
            (FoundItem.storage_location.ilike(search_pattern))
        )
    return query.order_by(FoundItem.created_at.desc()).all()


@router.post("", response_model=FoundItemResponse, status_code=status.HTTP_201_CREATED)
def create_found_item(payload: FoundItemCreate, db: Session = Depends(get_db)):
    data = payload.dict()
    if not data.get("date_found"):
        data["date_found"] = datetime.utcnow()

    # Found items default to "available" status
    data["status"] = FoundItemStatus.AVAILABLE.value

    found_item = FoundItem(**data)
    db.add(found_item)
    db.commit()
    db.refresh(found_item)

    # Automatically check for high confidence matches (score >= 60%)
    matches = find_matches_for_found_item(db, found_item, min_score=60.0)
    if matches:
        found_item.status = FoundItemStatus.POSSIBLE_MATCH.value
        # Also mark the top matching lost item as possible match if searching
        top_lost = matches[0]["lost_item"]
        if top_lost.status == LostItemStatus.SEARCHING.value:
            top_lost.status = LostItemStatus.POSSIBLE_MATCH.value
        db.commit()
        db.refresh(found_item)

    return found_item


@router.get("/{item_id}", response_model=FoundItemResponse)
def get_found_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    return item


@router.patch("/{item_id}/status", response_model=FoundItemResponse)
def update_found_item_status(item_id: int, payload: FoundItemStatusUpdate, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")

    new_status = payload.status.lower()
    valid_statuses = [s.value for s in FoundItemStatus]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Allowed values: {valid_statuses}"
        )

    # Verify flow transition
    allowed = VALID_FOUND_TRANSITIONS.get(item.status, [])
    if new_status != item.status and new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition status from '{item.status}' to '{new_status}'. Allowed next states: {allowed}"
        )

    item.status = new_status
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=FoundItemResponse)
def update_found_item(item_id: int, payload: FoundItemUpdate, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")

    update_data = payload.dict(exclude_unset=True)
    if "status" in update_data and update_data["status"]:
        new_status = update_data["status"].lower()
        if new_status not in [s.value for s in FoundItemStatus]:
            raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'")
        item.status = new_status

    for key, value in update_data.items():
        if key != "status":
            setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_found_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    db.delete(item)
    db.commit()
    return None


@router.get("/{item_id}/matches")
def get_found_item_matches(item_id: int, min_score: float = 35.0, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")

    raw_matches = find_matches_for_found_item(db, item, min_score=min_score)
    result = []
    for m in raw_matches:
        result.append({
            "found_item_id": item.id,
            "lost_item_id": m["lost_item"].id,
            "match_score": m["score"],
            "reasons": m["reasons"],
            "lost_item": LostItemResponse.from_orm(m["lost_item"])
        })
    return result
