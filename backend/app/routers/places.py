from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import uuid
from app.services.places_service import places_service
from app.db.database import get_db_connection

router = APIRouter(prefix="/api/places", tags=["Places & Discovery"])

class SubmitHiddenPlaceRequest(BaseModel):
    name: str
    lat: float
    lng: float
    short_desc: str
    photo_url: Optional[str] = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"
    submitted_by: Optional[str] = "Verified Local"

@router.get("/all")
def get_all_places():
    """Return all curated places in Hyderabad including user-submitted hidden gems."""
    curated = places_service.get_all_places()

    # Merge user-submitted hidden places from SQLite
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_hidden_places ORDER BY created_at DESC")
        user_places = [dict(r) for r in cursor.fetchall()]
        conn.close()

        # Format user places
        formatted_user_places = []
        for p in user_places:
            formatted_user_places.append({
                "id": p["id"],
                "name": p["name"],
                "category": "attraction",
                "sub_category": "hidden_gem",
                "lat": p["lat"],
                "lng": p["lng"],
                "address": "Hyderabad, Telangana",
                "description": p["short_desc"],
                "short_desc": p["short_desc"],
                "entry_fee_inr": 0,
                "timings": "06:00 AM - 07:00 PM",
                "is_hidden_gem": True,
                "rating": p.get("rating", 4.8),
                "reviews_count": 12,
                "tags": ["Hidden Gem", "Community Added", "Free"],
                "image_url": p.get("photo_url")
            })
        return {"places": curated + formatted_user_places}
    except Exception:
        return {"places": curated}

@router.get("/hidden")
def get_hidden_gems():
    """Return verified offbeat and hidden spots."""
    curated = places_service.get_hidden_gems()

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_hidden_places ORDER BY created_at DESC")
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        for r in rows:
            curated.append({
                "id": r["id"],
                "name": r["name"],
                "category": "attraction",
                "sub_category": "hidden_gem",
                "lat": r["lat"],
                "lng": r["lng"],
                "address": "Hyderabad, Telangana",
                "description": r["short_desc"],
                "short_desc": r["short_desc"],
                "entry_fee_inr": 0,
                "timings": "06:00 AM - 07:00 PM",
                "is_hidden_gem": True,
                "rating": r.get("rating", 4.9),
                "reviews_count": 15,
                "tags": ["Hidden Gem", "Community Added"],
                "image_url": r.get("photo_url")
            })
    except Exception:
        pass

    return {"hidden_places": curated}

@router.post("/hidden/submit")
def submit_hidden_gem(req: SubmitHiddenPlaceRequest):
    """Allow locals and verified tourists to submit a newly discovered hidden attraction."""
    new_id = f"user-gem-{uuid.uuid4().hex[:6]}"
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO user_hidden_places (id, name, lat, lng, short_desc, photo_url, submitted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (new_id, req.name, req.lat, req.lng, req.short_desc, req.photo_url, req.submitted_by))
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": f"'{req.name}' successfully added to verified hidden places database!",
        "place": {
            "id": new_id,
            "name": req.name,
            "lat": req.lat,
            "lng": req.lng,
            "short_desc": req.short_desc,
            "is_hidden_gem": True,
            "photo_url": req.photo_url
        }
    }

@router.get("/nearby")
def get_nearby_places(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    category: Optional[str] = Query("all", description="Category filter (attraction, food, hospital, police, etc.)"),
    radius_km: float = Query(25.0, description="Search radius in kilometers")
):
    """Find nearby attractions, food, hotels, or facilities sorted by distance."""
    results = places_service.get_nearby_places(user_lat=lat, user_lng=lng, category=category, max_radius_km=radius_km)
    return {
        "user_location": {"lat": lat, "lng": lng},
        "count": len(results),
        "places": results
    }

@router.get("/search")
def search_places(q: str = Query(..., min_length=1)):
    """Search places by keyword, tag, or description."""
    results = places_service.search_places(q)
    return {"query": q, "results": results}

@router.get("/{place_id}")
def get_place_detail(place_id: str):
    """Get full details of a specific place."""
    place = places_service.get_place_by_id(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place
