from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models.item import LostItem, FoundItem, ItemClaim
from backend.app.models.match import ItemMatch
from backend.app.models.enums import LostItemStatus, FoundItemStatus

router = APIRouter(prefix="/api/stats", tags=["Statistics & Metrics"])

@router.get("")
def get_campus_stats(db: Session = Depends(get_db)):
    total_lost = db.query(LostItem).count()
    total_found = db.query(FoundItem).count()
    
    # Lost statuses
    searching_count = db.query(LostItem).filter(LostItem.status == LostItemStatus.SEARCHING.value).count()
    lost_possible_matches = db.query(LostItem).filter(LostItem.status == LostItemStatus.POSSIBLE_MATCH.value).count()
    lost_claimed = db.query(LostItem).filter(LostItem.status == LostItemStatus.CLAIMED.value).count()
    lost_returned = db.query(LostItem).filter(LostItem.status == LostItemStatus.RETURNED.value).count()
    permanently_lost = db.query(LostItem).filter(LostItem.status == LostItemStatus.LOST.value).count()
    
    # Found statuses
    available_found = db.query(FoundItem).filter(FoundItem.status == FoundItemStatus.AVAILABLE.value).count()
    found_possible_matches = db.query(FoundItem).filter(FoundItem.status == FoundItemStatus.POSSIBLE_MATCH.value).count()
    found_claimed = db.query(FoundItem).filter(FoundItem.status == FoundItemStatus.CLAIMED.value).count()
    found_returned = db.query(FoundItem).filter(FoundItem.status == FoundItemStatus.RETURNED.value).count()

    total_claims = db.query(ItemClaim).count()
    total_matches = db.query(ItemMatch).count()

    # Recovery rate
    total_closed = lost_returned + permanently_lost
    recovery_rate = round((lost_returned / total_closed * 100) if total_closed > 0 else (found_returned / (total_found or 1) * 100), 1)

    return {
        "summary": {
            "total_lost": total_lost,
            "total_found": total_found,
            "actively_searching": searching_count,
            "available_at_desks": available_found,
            "pending_claims": lost_claimed + found_claimed,
            "successfully_returned": max(lost_returned, found_returned),
            "permanently_lost": permanently_lost,
            "recovery_rate_percent": recovery_rate,
            "total_claims": total_claims,
            "total_matches": total_matches
        },
        "lost_breakdown": {
            LostItemStatus.SEARCHING.value: searching_count,
            LostItemStatus.POSSIBLE_MATCH.value: lost_possible_matches,
            LostItemStatus.CLAIMED.value: lost_claimed,
            LostItemStatus.RETURNED.value: lost_returned,
            LostItemStatus.LOST.value: permanently_lost,
        },
        "found_breakdown": {
            FoundItemStatus.AVAILABLE.value: available_found,
            FoundItemStatus.POSSIBLE_MATCH.value: found_possible_matches,
            FoundItemStatus.CLAIMED.value: found_claimed,
            FoundItemStatus.RETURNED.value: found_returned,
        }
    }
