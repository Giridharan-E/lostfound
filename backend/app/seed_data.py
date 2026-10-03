from datetime import datetime, timedelta
from backend.app.database import SessionLocal, engine, Base
from backend.app.models.item import LostItem, FoundItem, ItemClaim
from backend.app.models.match import ItemMatch
from backend.app.models.enums import LostItemStatus, FoundItemStatus, ItemCategory, MatchStatus, ClaimStatus

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Only seed if empty
    if db.query(LostItem).count() > 0 or db.query(FoundItem).count() > 0:
        print("Database already has records. Skipping seed.")
        db.close()
        return

    now = datetime.utcnow()

    # 1. Lost Items
    lost_items = [
        LostItem(
            title="Space Gray MacBook Air M2",
            category=ItemCategory.ELECTRONICS.value,
            description="13-inch MacBook Air with a GitHub sticker and National Parks sticker on the lid. Left near window seats.",
            campus_location="Main Library - 3rd Floor Quiet Study",
            date_lost=now - timedelta(hours=8),
            status=LostItemStatus.SEARCHING.value,
            reporter_name="David Chen",
            reporter_email="david.chen@campus.edu",
            reporter_phone="555-0142",
            student_id="STU89421",
            secret_details="Has an orange keyboard cover and small scratch near USB-C port.",
            image_url=None
        ),
        LostItem(
            title="AirPods Pro (2nd Gen) in Black Case",
            category=ItemCategory.ELECTRONICS.value,
            description="White AirPods Pro inside a rugged black Spigen case with a carabiner attached.",
            campus_location="Engineering Hall - Room 204",
            date_lost=now - timedelta(days=1),
            status=LostItemStatus.POSSIBLE_MATCH.value,
            reporter_name="Elena Rostova",
            reporter_email="elena.r@campus.edu",
            reporter_phone="555-0188",
            student_id="STU77219",
            secret_details="Named 'Elena's Pods' via Bluetooth, left ear tip is size Small.",
            image_url=None
        ),
        LostItem(
            title="Navy Blue Hydro Flask 32oz",
            category=ItemCategory.OTHER.value,
            description="Navy blue wide mouth Hydro Flask with flex straw lid. Dent on bottom rim.",
            campus_location="Recreation & Wellness Gym - Basketball Courts",
            date_lost=now - timedelta(days=2),
            status=LostItemStatus.SEARCHING.value,
            reporter_name="Marcus Vance",
            reporter_email="mvance@campus.edu",
            reporter_phone="555-0291",
            student_id="STU66311",
            secret_details="Initial 'MV' engraved faintly on the metal neck.",
            image_url=None
        ),
        LostItem(
            title="TI-84 Plus CE Graphing Calculator",
            category=ItemCategory.BOOKS_SUPPLIES.value,
            description="Black graphing calculator with yellow sliding cover.",
            campus_location="Mathematics & Science Complex - Hallway 102",
            date_lost=now - timedelta(days=3),
            status=LostItemStatus.CLAIMED.value,
            reporter_name="Sarah Jenkins",
            reporter_email="sjenkins@campus.edu",
            reporter_phone="555-0377",
            student_id="STU55401",
            secret_details="Contains custom Python scripts titled 'Calc3_Helpers'.",
            image_url=None
        ),
        LostItem(
            title="Campus Access Key Card & Red Lanyard",
            category=ItemCategory.CARDS_IDS.value,
            description="Student ID card for Alex Morgan with red Campus Housing lanyard and room brass key.",
            campus_location="Student Union Dining Center",
            date_lost=now - timedelta(days=5),
            status=LostItemStatus.RETURNED.value,
            reporter_name="Alex Morgan",
            reporter_email="amorgan@campus.edu",
            reporter_phone="555-0455",
            student_id="STU44122",
            secret_details="Key has number '214-B' stamped on the back.",
            image_url=None
        ),
        LostItem(
            title="Brown Leather Bifold Wallet",
            category=ItemCategory.WALLETS_BAGS.value,
            description="Timberland dark brown bifold leather wallet lost during finals prep.",
            campus_location="Campus Shuttle Bus Route B",
            date_lost=now - timedelta(days=20),
            status=LostItemStatus.LOST.value,
            reporter_name="Kevin Patel",
            reporter_email="kpatel@campus.edu",
            reporter_phone="555-0512",
            student_id="STU33902",
            secret_details="Expired driver license and transit card inside.",
            image_url=None
        ),
    ]

    for item in lost_items:
        db.add(item)
    db.commit()

    # 2. Found Items
    found_items = [
        FoundItem(
            title="AirPods Pro with Spigen Rugged Armor Case",
            category=ItemCategory.ELECTRONICS.value,
            description="Found under lecture chair row 4. Case is matte black with small carabiner.",
            campus_location="Engineering Hall - Room 204",
            date_found=now - timedelta(hours=22),
            status=FoundItemStatus.POSSIBLE_MATCH.value,
            storage_location="Engineering Dean's Office Front Desk (Rm 100)",
            finder_name="Prof. Harrison",
            finder_email="jharrison@campus.edu",
            finder_phone="555-0100",
            image_url=None
        ),
        FoundItem(
            title="Black Texas Instruments Graphing Calculator",
            category=ItemCategory.BOOKS_SUPPLIES.value,
            description="TI-84 CE calculator left on desk in hallway near Math 102.",
            campus_location="Mathematics & Science Complex - Hallway 102",
            date_found=now - timedelta(days=2, hours=20),
            status=FoundItemStatus.CLAIMED.value,
            storage_location="Campus Lost & Found Office - Bin B-14",
            finder_name="Campus Facilities Staff",
            finder_email="facilities@campus.edu",
            finder_phone="555-0999",
            image_url=None
        ),
        FoundItem(
            title="Red Campus Housing Lanyard with Student Card & Key",
            category=ItemCategory.CARDS_IDS.value,
            description="Lanyard found on dining table. Returned to student successfully.",
            campus_location="Student Union Dining Center",
            date_found=now - timedelta(days=5),
            status=FoundItemStatus.RETURNED.value,
            storage_location="Returned to Alex Morgan (Verified via Student ID)",
            finder_name="Dining Staff Supervisor",
            finder_email="dining.desk@campus.edu",
            finder_phone="555-0811",
            image_url=None
        ),
        FoundItem(
            title="Patagonia Torrentshell Rain Jacket (M, Forest Green)",
            category=ItemCategory.APPAREL.value,
            description="Men's medium green waterproof jacket draped over chair in the lounge.",
            campus_location="Student Center - 2nd Floor Hearth Lounge",
            date_found=now - timedelta(hours=5),
            status=FoundItemStatus.AVAILABLE.value,
            storage_location="Student Center Information Desk",
            finder_name="Chloe Ramirez",
            finder_email="cramirez@campus.edu",
            finder_phone="555-0672",
            image_url=None
        ),
        FoundItem(
            title="Car Key Fob with Toyota Logo & Mini Flashlight",
            category=ItemCategory.KEYS.value,
            description="Toyota electronic smart key on silver keyring with small black Nitecore torch.",
            campus_location="North Campus Parking Structure Level 2",
            date_found=now - timedelta(hours=14),
            status=FoundItemStatus.AVAILABLE.value,
            storage_location="Campus Safety Office (Building 5)",
            finder_name="Officer Martinez",
            finder_email="martinez@campus.police.edu",
            finder_phone="555-0911",
            image_url=None
        ),
    ]

    for item in found_items:
        db.add(item)
    db.commit()

    # 3. Create Sample Match and Claim
    # Match for AirPods
    airpods_lost = db.query(LostItem).filter(LostItem.title.like("%AirPods%")).first()
    airpods_found = db.query(FoundItem).filter(FoundItem.title.like("%AirPods%")).first()
    if airpods_lost and airpods_found:
        match1 = ItemMatch(
            lost_item_id=airpods_lost.id,
            found_item_id=airpods_found.id,
            match_score=92.5,
            match_reason="Identical location (Engineering Hall 204), matching category (Electronics), high keyword overlap (AirPods Pro, Spigen case).",
            status=MatchStatus.SUGGESTED.value
        )
        db.add(match1)

    # Claim for Calculator
    calc_lost = db.query(LostItem).filter(LostItem.title.like("%Calculator%")).first()
    calc_found = db.query(FoundItem).filter(FoundItem.title.like("%Calculator%")).first()
    if calc_lost and calc_found:
        claim1 = ItemClaim(
            found_item_id=calc_found.id,
            lost_item_id=calc_lost.id,
            claimant_name="Sarah Jenkins",
            claimant_email="sjenkins@campus.edu",
            claimant_phone="555-0377",
            student_id="STU55401",
            proof_description="Yellow slide cover with my initials inside battery compartment and custom python script 'Calc3_Helpers'.",
            status=ClaimStatus.PENDING.value
        )
        db.add(claim1)

    db.commit()
    print("Database seeded successfully with campus lost and found test records.")
    db.close()

if __name__ == "__main__":
    seed()
