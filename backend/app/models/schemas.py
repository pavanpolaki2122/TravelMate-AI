from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Place(BaseModel):
    id: str
    name: str
    category: str
    sub_category: Optional[str] = None
    lat: float
    lng: float
    address: str
    description: str
    short_desc: Optional[str] = None
    entry_fee_inr: float = 0
    timings: str
    open_time_24h: Optional[str] = None
    close_time_24h: Optional[str] = None
    avg_duration_minutes: int = 60
    is_hidden_gem: bool = False
    rating: float = 4.5
    reviews_count: int = 0
    tags: List[str] = []
    audio_guide: Optional[Dict[str, str]] = None
    quick_facts: List[str] = []
    image_url: Optional[str] = None
    phone: Optional[str] = None
    emergency_number: Optional[str] = None
    distance_km: Optional[float] = None

class ItineraryRequest(BaseModel):
    destination: str = "Hyderabad"
    days: int = Field(default=1, ge=1, le=5)
    budget: float = Field(default=2000, ge=500)
    interests: List[str] = ["Heritage", "Food", "Photography"]
    start_time: str = "09:00"
    travel_mode: str = "Affordable (Metro / Auto)"
    companions: str = "Solo"
    preferred_language: str = "en"

class ItineraryStop(BaseModel):
    sequence: int
    place_id: str
    name: str
    category: str
    arrival_time: str
    departure_time: str
    duration_minutes: int
    entry_fee_inr: float
    estimated_travel_time_min: int
    travel_mode: str
    travel_cost_inr: float
    notes: str
    lat: float
    lng: float
    image_url: Optional[str] = None

class DayPlan(BaseModel):
    day: int
    title: str
    stops: List[ItineraryStop]
    total_day_budget: float
    total_travel_time_min: int
    tips: List[str]

class ItineraryResponse(BaseModel):
    destination: str
    days: int
    total_estimated_cost_inr: float
    remaining_budget_inr: float
    budget_status: str
    itinerary: List[DayPlan]
    summary: str

class RecalculateRequest(BaseModel):
    current_day: int = 1
    current_time: str = "12:00"
    delay_minutes: int = 60
    current_lat: Optional[float] = 17.3616
    current_lng: Optional[float] = 78.4747
    completed_stop_ids: List[str] = []
    original_stops: List[ItineraryStop]

class MonumentGuideRequest(BaseModel):
    place_id: Optional[str] = None
    monument_id: Optional[str] = None
    language: str = "en"

    @property
    def target_id(self) -> str:
        return self.place_id or self.monument_id or ""

class MonumentQuestionRequest(BaseModel):
    place_id: Optional[str] = None
    monument_id: Optional[str] = None
    question: str
    language: str = "en"

    @property
    def target_id(self) -> str:
        return self.place_id or self.monument_id or ""

class AssistantChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    language: str = "en"

class BudgetCalcRequest(BaseModel):
    total_budget: float
    transport_cost: float = 0
    entry_fees: float = 0
    food_cost: float = 0
    stay_cost: float = 0
    shopping_cost: float = 0

class BudgetAlertResponse(BaseModel):
    total_budget: float
    total_spent: float
    remaining: float
    percentage_spent: float
    alert_level: str  # "SAFE", "WARNING", "DANGER"
    alert_message: str
    cheaper_alternatives: List[str]

class SOSAlertRequest(BaseModel):
    user_name: str = "Tourist"
    lat: float
    lng: float
    battery_level: Optional[int] = None
    message: Optional[str] = "EMERGENCY: Tourist needs immediate assistance!"

class CommunityPostCreate(BaseModel):
    author: str
    location_name: str
    content: str
    tags: List[str] = []
    rating: int = 5
    image_url: Optional[str] = None
