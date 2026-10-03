import re
from datetime import datetime
from typing import List, Tuple
from sqlalchemy.orm import Session
from backend.app.models.item import LostItem, FoundItem
from backend.app.models.match import ItemMatch
from backend.app.models.enums import LostItemStatus, FoundItemStatus, MatchStatus

def tokenize(text: str) -> set[str]:
    """Tokenize text into lowercase words, skipping common short words."""
    words = re.findall(r'\b[a-zA-Z0-9]{3,}\b', text.lower())
    stop_words = {"the", "and", "with", "for", "near", "from", "that", "this", "item", "lost", "found"}
    return {w for w in words if w not in stop_words}

def compute_similarity(lost: LostItem, found: FoundItem) -> Tuple[float, List[str]]:
    """
    Computes match score (0-100) and human-readable explanation between a lost and found item.
    """
    score = 0.0
    reasons = []

    # 1. Category Match (35 pts)
    if lost.category.lower() == found.category.lower():
        score += 35.0
        reasons.append(f"Matching category: {lost.category}")
    
    # 2. Title & Description Keyword Overlap (35 pts)
    lost_words = tokenize(f"{lost.title} {lost.description}")
    found_words = tokenize(f"{found.title} {found.description}")
    
    overlap = lost_words.intersection(found_words)
    if overlap:
        # Title specific overlap
        title_overlap = tokenize(lost.title).intersection(tokenize(found.title))
        if title_overlap:
            score += 25.0
            reasons.append(f"Key title matches: {', '.join(list(title_overlap)[:3])}")
        else:
            score += 15.0
            reasons.append(f"Description keywords matched: {', '.join(list(overlap)[:3])}")
            
        # Extra points for high overlap ratio
        union_size = len(lost_words.union(found_words))
        if union_size > 0:
            jaccard = len(overlap) / union_size
            score += min(10.0, jaccard * 20.0)

    # 3. Location Similarity (15 pts)
    lost_loc = tokenize(lost.campus_location)
    found_loc = tokenize(found.campus_location)
    loc_overlap = lost_loc.intersection(found_loc)
    if loc_overlap:
        score += 15.0
        reasons.append(f"Same campus location: {', '.join(loc_overlap)}")
    elif lost.campus_location.strip().lower() == found.campus_location.strip().lower():
        score += 15.0
        reasons.append(f"Identical campus location")

    # 4. Date Proximity (15 pts)
    if lost.date_lost and found.date_found:
        # Found date should ideally be around or after lost date
        days_diff = abs((found.date_found - lost.date_lost).days)
        if days_diff <= 1:
            score += 15.0
            reasons.append("Reported within 24 hours of each other")
        elif days_diff <= 3:
            score += 10.0
            reasons.append(f"Reported within {days_diff} days of each other")
        elif days_diff <= 7:
            score += 5.0
            reasons.append("Reported within the same week")

    return min(100.0, round(score, 1)), reasons


def find_matches_for_lost_item(db: Session, lost_item: LostItem, min_score: float = 40.0):
    """Scan available found items and identify potential matches for a lost item."""
    candidate_found_items = db.query(FoundItem).filter(
        FoundItem.status.in_([FoundItemStatus.AVAILABLE.value, FoundItemStatus.POSSIBLE_MATCH.value])
    ).all()

    matches = []
    for found in candidate_found_items:
        score, reasons = compute_similarity(lost_item, found)
        if score >= min_score:
            matches.append({
                "found_item": found,
                "score": score,
                "reasons": reasons
            })

    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches


def find_matches_for_found_item(db: Session, found_item: FoundItem, min_score: float = 40.0):
    """Scan searching lost items and identify potential matches for a found item."""
    candidate_lost_items = db.query(LostItem).filter(
        LostItem.status.in_([LostItemStatus.SEARCHING.value, LostItemStatus.POSSIBLE_MATCH.value])
    ).all()

    matches = []
    for lost in candidate_lost_items:
        score, reasons = compute_similarity(lost, found_item)
        if score >= min_score:
            matches.append({
                "lost_item": lost,
                "score": score,
                "reasons": reasons
            })

    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches
