from enum import Enum

class LostItemStatus(str, Enum):
    SEARCHING = "searching"
    POSSIBLE_MATCH = "possible match"
    CLAIMED = "claimed"
    RETURNED = "returned"
    LOST = "lost"

class FoundItemStatus(str, Enum):
    AVAILABLE = "available"
    POSSIBLE_MATCH = "possible match"
    CLAIMED = "claimed"
    RETURNED = "returned"

class ItemCategory(str, Enum):
    ELECTRONICS = "Electronics"
    CARDS_IDS = "IDs & Cards"
    KEYS = "Keys"
    WALLETS_BAGS = "Wallets & Bags"
    BOOKS_SUPPLIES = "Books & Supplies"
    APPAREL = "Apparel & Accessories"
    OTHER = "Other"

class MatchStatus(str, Enum):
    SUGGESTED = "suggested"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"

class ClaimStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
