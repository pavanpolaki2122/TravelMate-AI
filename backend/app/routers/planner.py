from fastapi import APIRouter
from typing import List
from app.models.schemas import ItineraryRequest, ItineraryResponse, RecalculateRequest, ItineraryStop
from app.services.ai_planner import planner_service

router = APIRouter(prefix="/api/planner", tags=["AI Smart Trip Planner"])

@router.post("/generate", response_model=ItineraryResponse)
def generate_trip_itinerary(req: ItineraryRequest):
    """
    Generate an AI-optimized, sequence-ordered itinerary considering
    interests, opening hours, budget, and geographic proximity.
    """
    return planner_service.generate_itinerary(req)

@router.post("/recalculate", response_model=List[ItineraryStop])
def recalculate_delayed_itinerary(req: RecalculateRequest):
    """
    Recalculate remaining stops dynamically when a tourist experiences delays,
    adjusting arrival/departure times and warning if monuments are closing.
    """
    return planner_service.recalculate_itinerary(req)
