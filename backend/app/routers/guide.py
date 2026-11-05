from typing import Optional
from fastapi import APIRouter, Query
from app.models.schemas import MonumentGuideRequest, MonumentQuestionRequest, AssistantChatRequest
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/guide", tags=["AI Tour Guide & Live Assistant"])

@router.get("/monument")
def get_monument_tour_guide_get(id: Optional[str] = Query(None), place_id: Optional[str] = Query(None), language: str = Query("en")):
    target = id or place_id or ""
    return gemini_service.explain_monument(place_id=target, language=language)

@router.post("/monument")
def get_monument_tour_guide(req: MonumentGuideRequest):
    """
    Get deep historical insights, audio guide text, and verified trivia
    for a monument in English, Telugu, or Hindi.
    """
    return gemini_service.explain_monument(place_id=req.target_id, language=req.language)

@router.post("/ask")
def ask_monument_question(req: MonumentQuestionRequest):
    """
    Ask a contextual question about a monument being visited.
    """
    answer = gemini_service.answer_monument_question(
        place_id=req.target_id,
        question=req.question,
        language=req.language
    )
    return {"place_id": req.target_id, "question": req.question, "answer": answer}

@router.post("/assistant/chat")
def live_tourist_assistant(req: AssistantChatRequest):
    """
    Real-time interactive chat with the Gemini-powered Live Tourist Assistant.
    """
    response = gemini_service.generate_assistant_response(
        prompt=req.message,
        user_lat=req.user_lat,
        user_lng=req.user_lng,
        language=req.language
    )
    return {
        "reply": response,
        "language": req.language
    }
