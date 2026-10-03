from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base
from backend.app.models.enums import LostItemStatus, FoundItemStatus, ItemCategory, ClaimStatus

class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    category = Column(String(50), nullable=False, default=ItemCategory.OTHER.value)
    description = Column(Text, nullable=False)
    campus_location = Column(String(255), nullable=False)
    date_lost = Column(DateTime, default=datetime.utcnow, nullable=False)
    image_url = Column(String(500), nullable=True)
    
    # Status follows: searching -> possible match -> claimed -> returned or lost
    status = Column(
        String(50),
        default=LostItemStatus.SEARCHING.value,
        nullable=False,
        index=True
    )
    
    # Contact info for the owner
    reporter_name = Column(String(100), nullable=False)
    reporter_email = Column(String(150), nullable=False)
    reporter_phone = Column(String(50), nullable=True)
    student_id = Column(String(50), nullable=True)
    
    # Distinctive markers used for verification
    secret_details = Column(Text, nullable=True)  # e.g. wallpaper, serial digits, inside engraving
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    matches = relationship("ItemMatch", back_populates="lost_item", cascade="all, delete-orphan")
    claims = relationship("ItemClaim", back_populates="lost_item", cascade="all, delete-orphan")


class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    category = Column(String(50), nullable=False, default=ItemCategory.OTHER.value)
    description = Column(Text, nullable=False)
    campus_location = Column(String(255), nullable=False)
    date_found = Column(DateTime, default=datetime.utcnow, nullable=False)
    image_url = Column(String(500), nullable=True)
    
    # Status follows: available -> possible match -> claimed -> returned
    status = Column(
        String(50),
        default=FoundItemStatus.AVAILABLE.value,
        nullable=False,
        index=True
    )
    
    # Where the physical item is currently stored for safe custody
    storage_location = Column(String(255), nullable=True, default="Campus Security Desk / Lost & Found Office")
    
    # Finder info
    finder_name = Column(String(100), nullable=False)
    finder_email = Column(String(150), nullable=False)
    finder_phone = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    matches = relationship("ItemMatch", back_populates="found_item", cascade="all, delete-orphan")
    claims = relationship("ItemClaim", back_populates="found_item", cascade="all, delete-orphan")


class ItemClaim(Base):
    __tablename__ = "item_claims"

    id = Column(Integer, primary_key=True, index=True)
    found_item_id = Column(Integer, ForeignKey("found_items.id"), nullable=False)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"), nullable=True)
    
    claimant_name = Column(String(100), nullable=False)
    claimant_email = Column(String(150), nullable=False)
    claimant_phone = Column(String(50), nullable=True)
    student_id = Column(String(50), nullable=True)
    proof_description = Column(Text, nullable=False)
    status = Column(String(50), default=ClaimStatus.PENDING.value, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)

    # Relationships
    found_item = relationship("FoundItem", back_populates="claims")
    lost_item = relationship("LostItem", back_populates="claims")
