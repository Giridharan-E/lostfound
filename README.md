# 🎓 Campus Lost & Found Platform (CampusTrace)

A modern full-stack web application designed for university campuses to streamline lost and found reporting, intelligent multi-factor matching, ownership verification, and physical custody tracking.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons | Responsive, glassmorphism UI with live metric counters & status workflows |
| **Backend** | Python 3.11, FastAPI, Pydantic v2 | High-performance RESTful API with automated matching and lifecycle enforcement |
| **Persistence** | PostgreSQL (Production/Docker) with SQLAlchemy 2.0 | Relational database schema for items, claims, matches, and status logs (automatic SQLite fallback in dev) |
| **File Storage** | FastAPI StaticFiles & Disk Storage (`backend/uploads/`) | Scalable file storage for user item photos |
| **Containers** | Docker Compose | One-command setup for PostgreSQL |

---

## 🔄 Status Lifecycles

### 1. Lost Item Flow
Every reported lost item progresses through the following verified states:
```
[ searching ] ───► [ possible match ] ───► [ claimed ] ───► [ returned ]
      │                                                           ▲
      └───────────────────────────────────────────────────────────┴───► [ lost ]
```
- **`searching`**: Initial state when an owner reports a lost item.
- **`possible match`**: Auto-flagged or proposed when candidate items are detected.
- **`claimed`**: A matching item is identified and ownership claim is under review.
- **`returned`**: Item successfully verified and returned to the owner.
- **`lost`**: Permanently closed/unrecovered (can be reopened if new leads appear).

### 2. Found Item Flow
Every item discovered on campus and secured at custody desks progresses through:
```
[ available ] ───► [ possible match ] ───► [ claimed ] ───► [ returned ]
```
- **`available`**: Item is logged and securely held at campus custody desk.
- **`possible match`**: Candidate lost report is correlated.
- **`claimed`**: Student submitted verifiable ownership proof; awaiting handover.
- **`returned`**: Physical custody released and verified to rightful owner.

---

## 📁 Repository Structure

```
lostfound/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy models (LostItem, FoundItem, ItemClaim, ItemMatch)
│   │   │   ├── enums.py      # Status definitions & allowed transitions
│   │   │   ├── item.py       # Lost & Found item entities
│   │   │   └── match.py      # Cross-item correlation records
│   │   ├── routers/          # FastAPI routers
│   │   │   ├── lost_items.py # CRUD & lifecycle endpoints for lost items
│   │   │   ├── found_items.py# CRUD & custody endpoints for found items
│   │   │   ├── matches.py    # Match proposals, AI correlations & claims
│   │   │   ├── uploads.py    # Multipart image upload handler
│   │   │   └── stats.py      # Live recovery rates & campus KPI analytics
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── matcher.py    # Smart correlation engine (category, location, keywords, time)
│   │   │   └── storage.py    # Local file storage for item photos
│   │   ├── config.py         # App configuration & environment variables
│   │   ├── database.py       # Engine creation with PostgreSQL & fallback handling
│   │   ├── seed_data.py      # Demo dataset populating realistic campus scenarios
│   │   └── main.py           # FastAPI entrypoint with CORS & StaticFiles
│   ├── uploads/              # Item photo storage directory
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── run.py                # Backend server runner
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Navbar, ItemCard, StatusBadge, Modals)
│   │   │   ├── Navbar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   ├── StatsOverview.tsx
│   │   │   ├── ReportLostModal.tsx
│   │   │   ├── ReportFoundModal.tsx
│   │   │   ├── ClaimModal.tsx
│   │   │   ├── MatchSuggestionsModal.tsx
│   │   │   └── ItemDetailModal.tsx
│   │   ├── pages/            # View tabs
│   │   │   ├── LostItemsPage.tsx
│   │   │   ├── FoundItemsPage.tsx
│   │   │   ├── MatchesPage.tsx
│   │   │   ├── ClaimsPage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript interfaces & enums
│   │   ├── index.css         # Tailwind CSS v4 design system
│   │   └── App.tsx           # Main application state and routing
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts        # Vite configuration with proxy to backend
│
├── docker-compose.yml        # PostgreSQL container configuration
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Database Setup (PostgreSQL)
Start the PostgreSQL container:
```bash
docker compose up -d
```
*(If Docker is not running, the application automatically uses a local SQLite fallback database `lostfound.db` so you can begin developing right away).*

### 2. Backend Setup (FastAPI)
Install Python dependencies and seed demo data:
```bash
pip install -r backend/requirements.txt
python -m backend.app.seed_data
```

Start the FastAPI backend server:
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at:
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- OpenAPI JSON: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

### 3. Frontend Setup (React + Tailwind)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.

---

## 🎯 Key Features

1. **Intelligent Match Radar**:
   - Compares lost and found items using multi-parameter scoring: category overlap (35%), keyword matching (35%), campus building proximity (15%), and event timestamp proximity (15%).
2. **Private Verification Anchors**:
   - When students report lost items, they can supply hidden identifiers (e.g. wallpaper description, engravings, serial number fragments) visible only to authorized custody desk staff.
3. **Ownership Claim Workflow**:
   - Anyone claiming an item must submit verifiable proof. Staff can approve (releasing the item to `returned`) or reject with audit notes.
4. **Campus Location & Custody Tracking**:
   - Clear custody records displaying which campus desk (Student Union, Main Library, Campus Safety, etc.) currently holds physical custody of the item.
5. **Real-time Analytics**:
   - Interactive recovery velocity, recovery percentage, and lifecycle stage distribution.
