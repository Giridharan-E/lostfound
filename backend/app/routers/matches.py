from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.item import LostItem, FoundItem, ItemClaim
from backend.app.models.match import ItemMatch
from backend.app.models.enums import LostItemStatus, FoundItemStatus, MatchStatus, ClaimStatus
from backend.app.schemas.item import ClaimCreate, ClaimResponse
from backend.app.schemas.match import MatchCreate, MatchStatusUpdate, MatchResponse

router = APIRouter(prefix="/api", tags=["Matches & Claims"])

# ---------------- Match Proposals ---------------- #

@router.get("/matches", response_model=List[MatchResponse])
def get_all_matches(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ItemMatch)
    if status_filter:
        query = query.filter(ItemMatch.status == status_filter)
    return query.order_by(ItemMatch.match_score.desc()).all()


@router.post("/matches", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
def create_match_record(payload: MatchCreate, db: Session = Depends(get_db)):
    lost = db.query(LostItem).filter(LostItem.id == payload.lost_item_id).first()
    found = db.query(FoundItem).filter(FoundItem.id == payload.found_item_id).first()
    if not lost or not found:
        raise HTTPException(status_code=404, detail="Lost or found item not found")

    existing = db.query(ItemMatch).filter(
        ItemMatch.lost_item_id == lost.id,
        ItemMatch.found_item_id == found.id
    ).first()

    if existing:
        existing.match_score = payload.match_score
        existing.match_reason = payload.match_reason
        db.commit()
        db.refresh(existing)
        return existing

    match_record = ItemMatch(
        lost_item_id=lost.id,
        found_item_id=found.id,
        match_score=payload.match_score,
        match_reason=payload.match_reason,
        status=MatchStatus.SUGGESTED.value
    )
    db.add(match_record)

    # Transition to possible match if in initial status
    if lost.status == LostItemStatus.SEARCHING.value:
        lost.status = LostItemStatus.POSSIBLE_MATCH.value
    if found.status == FoundItemStatus.AVAILABLE.value:
        found.status = FoundItemStatus.POSSIBLE_MATCH.value

    db.commit()
    db.refresh(match_record)
    return match_record


@router.patch("/matches/{match_id}/status", response_model=MatchResponse)
def update_match_status(match_id: int, payload: MatchStatusUpdate, db: Session = Depends(get_db)):
    match = db.query(ItemMatch).filter(ItemMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    new_status = payload.status.lower()
    if new_status not in [s.value for s in MatchStatus]:
        raise HTTPException(status_code=400, detail="Invalid match status")

    match.status = new_status

    if new_status == MatchStatus.CONFIRMED.value:
        # Move items into claimed status pending pickup
        if match.lost_item:
            match.lost_item.status = LostItemStatus.CLAIMED.value
        if match.found_item:
            match.found_item.status = FoundItemStatus.CLAIMED.value
    elif new_status == MatchStatus.REJECTED.value:
        # If neither has other active matches, reset
        if match.lost_item and match.lost_item.status == LostItemStatus.POSSIBLE_MATCH.value:
            match.lost_item.status = LostItemStatus.SEARCHING.value
        if match.found_item and match.found_item.status == FoundItemStatus.POSSIBLE_MATCH.value:
            match.found_item.status = FoundItemStatus.AVAILABLE.value

    db.commit()
    db.refresh(match)
    return match


# ---------------- Claims & Verification ---------------- #

@router.get("/claims", response_model=List[ClaimResponse])
def get_claims(db: Session = Depends(get_db)):
    return db.query(ItemClaim).order_by(ItemClaim.created_at.desc()).all()


@router.post("/claims", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def submit_claim(payload: ClaimCreate, db: Session = Depends(get_db)):
    found_item = db.query(FoundItem).filter(FoundItem.id == payload.found_item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Found item not found")

    claim = ItemClaim(**payload.dict())
    claim.status = ClaimStatus.PENDING.value
    db.add(claim)

    # Put found item into 'claimed' (in process)
    found_item.status = FoundItemStatus.CLAIMED.value

    # If linked to a lost item, also update lost item to 'claimed'
    if payload.lost_item_id:
        lost_item = db.query(LostItem).filter(LostItem.id == payload.lost_item_id).first()
        if lost_item:
            lost_item.status = LostItemStatus.CLAIMED.value

    db.commit()
    db.refresh(claim)
    return claim


@router.patch("/claims/{claim_id}/review", response_model=ClaimResponse)
def review_claim(claim_id: int, approved: bool, review_notes: Optional[str] = None, db: Session = Depends(get_db)):
    claim = db.query(ItemClaim).filter(ItemClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = ClaimStatus.APPROVED.value if approved else ClaimStatus.REJECTED.value
    claim.reviewed_at = datetime.utcnow()
    claim.review_notes = review_notes

    if approved:
        # Successful recovery! Status moves to 'returned'
        if claim.found_item:
            claim.found_item.status = FoundItemStatus.RETURNED.value
        if claim.lost_item:
            claim.lost_item.status = LostItemStatus.RETURNED.value
    else:
        # Revert status
        if claim.found_item:
            claim.found_item.status = FoundItemStatus.AVAILABLE.value
        if claim.lost_item:
            claim.lost_item.status = LostItemStatus.SEARCHING.value

    db.commit()
    db.refresh(claim)
    return claim
