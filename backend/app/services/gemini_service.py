import os
from typing import Dict, Any, Optional
from app.data.hyderabad_data import HYDERABAD_PLACES

# Load .env at import time (safe even if already loaded)
try:
    from dotenv import load_dotenv as _load_dotenv
    import pathlib as _pathlib
    _env_path = _pathlib.Path(__file__).resolve().parents[3] / "backend" / ".env"
    if not _env_path.exists():
        # Try relative to backend root
        _env_path = _pathlib.Path(__file__).resolve().parents[2] / ".env"
    _load_dotenv(_env_path, override=False)
except Exception:
    pass

class GeminiService:
    def __init__(self):
        self.client = None
        self._init_client()

    def _init_client(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print(f"[GeminiService] ✅ Gemini AI client initialized (key: ...{self.api_key[-6:]})")
            except Exception as e:
                print(f"[GeminiService] Warning: Could not initialize Google GenAI client: {e}")
        else:
            print("[GeminiService] ⚠️  No GEMINI_API_KEY found — using offline fallback responses")

    def _call_gemini(self, prompt: str) -> Optional[str]:
        if not self.client:
            self._init_client()
        if not self.client:
            return None

        # Try gemini-2.5-flash (primary, fast, current)
        for model_name in ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"]:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"[GeminiService] Model {model_name} attempt error: {e}")
                continue
        return None

    def generate_assistant_response(self, prompt: str, user_lat: Optional[float] = None, user_lng: Optional[float] = None, language: str = "en") -> str:
        """
        Uses Gemini 2.5 Flash to answer travel queries with contextual awareness
        of tourist location, or falls back to an intelligent local reasoning engine.
        """
        system_context = (
            "You are TravelMate AI, an expert, enthusiastic, and highly knowledgeable personal tourist guide "
            "specializing in Hyderabad and Telangana tourism. Provide friendly, accurate, and culturally rich advice. "
            "Suggest optimal visit timings, budget tips, authentic local dishes (like Hyderabadi Dum Biryani, Irani Chai with Osmania biscuits, Double ka Meetha), "
            "and safety reminders. Keep answers concise, actionable, and structured with bullet points where appropriate."
        )

        full_prompt = f"{system_context}\n\nTourist Query: {prompt}"
        if user_lat and user_lng:
            full_prompt += f"\nUser Current GPS Coordinates: {user_lat}, {user_lng} (Hyderabad area)"

        if language == "te":
            full_prompt += "\nPlease reply in Telugu (తెలుగు) language."
        elif language == "hi":
            full_prompt += "\nPlease reply in Hindi (हिंदी) language."

        # Call live Gemini API
        ai_reply = self._call_gemini(full_prompt)
        if ai_reply:
            return ai_reply

        # High quality offline / fallback response generator
        return self._fallback_assistant_response(prompt, language)

    def explain_monument(self, place_id: str, language: str = "en") -> Dict[str, Any]:
        """
        Retrieves curated audio guide and historical explanation for a monument.
        """
        place = next((p for p in HYDERABAD_PLACES if p["id"] == place_id), None)
        if not place:
            return {
                "place_name": "Unknown Monument",
                "explanation": "Monument details not found in database.",
                "audio_script": "",
                "quick_facts": []
            }

        audio_script = place.get("audio_guide", {}).get(language) or place.get("audio_guide", {}).get("en", "")

        return {
            "place_name": place["name"],
            "category": place.get("category"),
            "description": place.get("description"),
            "audio_script": audio_script,
            "quick_facts": place.get("quick_facts", []),
            "entry_fee_inr": place.get("entry_fee_inr", 0),
            "timings": place.get("timings", ""),
            "image_url": place.get("image_url")
        }

    def answer_monument_question(self, place_id: str, question: str, language: str = "en") -> str:
        """
        Answers a specific contextual question about a monument using Gemini.
        """
        place = next((p for p in HYDERABAD_PLACES if p["id"] == place_id), None)
        place_name = place["name"] if place else "the monument"
        place_desc = place["description"] if place else ""

        prompt = (
            f"You are the AI Tour Guide at {place_name} in Hyderabad.\n"
            f"Background Information: {place_desc}\n"
            f"Tourist Question: {question}\n"
            f"Provide an engaging, historically accurate 2-3 sentence answer suitable for audio narration."
        )
        if language == "te":
            prompt += "\nPlease reply in Telugu (తెలుగు) language."
        elif language == "hi":
            prompt += "\nPlease reply in Hindi (हिंदी) language."

        ai_reply = self._call_gemini(prompt)
        if ai_reply:
            return ai_reply

        # Fallback contextual answer
        if "acoustic" in question.lower() or "clap" in question.lower():
            return "At Golconda Fort, the Fateh Darwaza portico was engineered with acoustic arches so a clap at the entrance reverberates 1 km up to the Bala Hissar royal pavilion, acting as a military early warning system."
        if "minaret" in question.lower() or "why 4" in question.lower():
            return "The 4 minarets of Charminar stand 48.7 meters tall, symbolizing the first four caliphs of Islam and serving as architectural anchors for the city's four cardinal crossroads."
        return f"{place_name} is one of Hyderabad's grandest landmarks with rich cultural heritage dating back centuries. Visiting during morning or golden hour reveals the most stunning architectural details!"

    def _fallback_assistant_response(self, prompt: str, language: str) -> str:
        p = prompt.lower()
        if "food" in p or "biryani" in p or "eat" in p:
            if language == "te":
                return "హైదరాబాద్ లో అత్యుత్తమ దమ్ బిర్యానీ కొరకు చార్మినార్ సమీపంలోని హోటల్ షాదాబ్ లేదా సికింద్రాబాద్ లోని ప్యారడైజ్ ను సందర్శించండి! ఉదయం పూట కేఫ్ నిలోఫర్ లో వేడి ఇరానీ చాయ్ మరియు ఉస్మానియా బిస్కెట్లు తప్పక ఆస్వాదించండి."
            return (
                "Here are top authentic food spots in Hyderabad:\n"
                "• **Hotel Shadab (Charminar)**: World-famous for authentic Mutton Dum Biryani and Haleem (₹250-₹400).\n"
                "• **Cafe Niloufer (Lakdikapul)**: Benchmark for rich Irani Chai & Osmania Biscuits (₹40).\n"
                "• **Nimrah Cafe (Opposite Charminar)**: Enjoy steaming hot chai with an iconic view of Charminar arches."
            )
        if "hidden" in p or "secret" in p or "offbeat" in p:
            return (
                "Unexplored gems in Hyderabad worth visiting:\n"
                "• **Paigah Tombs**: Aristocratic marble latticework (jaali) where every screen pattern is unique. (Free entry)\n"
                "• **Moula Ali Hill**: 484 carved stone steps leading to an ancient hilltop with panoramic 360° sunset views.\n"
                "• **Khajaguda Heritage Rocks**: 2.5-billion-year-old natural balancing boulders and peaceful caves near the IT corridor."
            )
        if "budget" in p or "cost" in p:
            return (
                "Smart Hyderabad Budget Advice:\n"
                "• Use the Hyderabad Metro for rapid transit between MGBS, Ameerpet, and Hitec City (₹20-₹60).\n"
                "• State heritage monuments (Charminar, Golconda) have very modest entry fees (₹20-₹25).\n"
                "• A full day of royal sightseeing and legendary biryani can be comfortably achieved within ₹800 - ₹1,500!"
            )
        return (
            "Welcome to Hyderabad! I am your TravelMate AI Companion.\n"
            "I can help you:\n"
            "• Generate an optimized 1-to-3 day itinerary fitted to your budget.\n"
            "• Discover hidden gems like Paigah Tombs and Moula Ali Hill.\n"
            "• Listen to multilingual voice tour guide explanations.\n"
            "• Find emergency assistance and nearby verified tourist facilities.\n\n"
            "What would you like to explore today?"
        )

gemini_service = GeminiService()
