import math
from typing import List, Optional, Dict
from app.data.hyderabad_data import HYDERABAD_PLACES, EMERGENCY_CONTACTS

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees). Returns kilometers.
    """
    r = 6371.0  # Earth's radius in kilometers
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)

class PlacesService:
    def __init__(self):
        self.places = HYDERABAD_PLACES
        self.emergency_contacts = EMERGENCY_CONTACTS

    def get_all_places(self) -> List[Dict]:
        return self.places

    def get_place_by_id(self, place_id: str) -> Optional[Dict]:
        for place in self.places:
            if place["id"] == place_id:
                return place
        return None

    def get_hidden_gems(self) -> List[Dict]:
        return [p for p in self.places if p.get("is_hidden_gem", False)]

    def get_nearby_places(self, user_lat: float, user_lng: float, category: Optional[str] = None, max_radius_km: float = 25.0) -> List[Dict]:
        results = []
        for p in self.places:
            if category and category.lower() != "all" and p.get("category") != category.lower():
                continue
            dist = calculate_haversine_distance(user_lat, user_lng, p["lat"], p["lng"])
            if dist <= max_radius_km:
                item = dict(p)
                item["distance_km"] = dist
                results.append(item)
        
        # Sort by proximity
        results.sort(key=lambda x: x["distance_km"])
        return results

    def search_places(self, query: str) -> List[Dict]:
        q = query.lower()
        results = []
        for p in self.places:
            if (q in p["name"].lower() or 
                q in p["description"].lower() or 
                any(q in tag.lower() for tag in p.get("tags", []))):
                results.append(p)
        return results

    def get_emergency_services_nearby(self, user_lat: float, user_lng: float) -> Dict:
        hospitals = self.get_nearby_places(user_lat, user_lng, category="hospital", max_radius_km=30.0)
        police = self.get_nearby_places(user_lat, user_lng, category="police", max_radius_km=30.0)
        return {
            "emergency_numbers": self.emergency_contacts,
            "nearest_hospitals": hospitals[:3],
            "nearest_police": police[:3]
        }

places_service = PlacesService()
