"""
TravelMate AI - Automated Test Suite
Run with: python backend/test_api.py
"""

import sys
import os
import unittest

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import init_db

class TravelMateAITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(len(data["modules_active"]), 11)

    def test_auth_login_and_profile(self):
        # Test demo login
        res = self.client.post("/api/auth/login", json={"email": "tourist@travelmate.ai", "password": "demo123"})
        self.assertEqual(res.status_code, 200)
        user = res.json()["user"]
        self.assertEqual(user["email"], "tourist@travelmate.ai")

        # Test profile update
        prof_res = self.client.post("/api/auth/profile", json={
            "user_id": user["id"],
            "full_name": "Jayasree Expert Tourist",
            "preferred_language": "te",
            "travel_style": "Comfort"
        })
        self.assertEqual(prof_res.status_code, 200)

    def test_budget_persistent_crud(self):
        # 1. Get initial items
        get_res = self.client.get("/api/budget/items?user_id=demo_user")
        self.assertEqual(get_res.status_code, 200)

        # 2. Add an expense item
        add_res = self.client.post("/api/budget/items", json={
            "title": "Irani Chai at Cafe Niloufer",
            "category": "food",
            "amount": 40.0,
            "user_id": "demo_user"
        })
        self.assertEqual(add_res.status_code, 200)
        item_id = add_res.json()["item"]["id"]

        # 3. Delete the expense item
        del_res = self.client.delete(f"/api/budget/items/{item_id}")
        self.assertEqual(del_res.status_code, 200)

    def test_submit_hidden_gem(self):
        payload = {
            "name": "Paigah Palace Hidden Gardens",
            "lat": 17.4421,
            "lng": 78.4720,
            "short_desc": "Peaceful secluded royal garden in Begumpet.",
            "photo_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
            "submitted_by": "Jayasree"
        }
        res = self.client.post("/api/places/hidden/submit", json=payload)
        self.assertEqual(res.status_code, 200)
        self.assertIn("user-gem-", res.json()["place"]["id"])

    def test_get_all_places(self):
        response = self.client.get("/api/places/all")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data["places"]), 10)

    def test_hidden_gems(self):
        response = self.client.get("/api/places/hidden")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data["hidden_places"]), 2)

    def test_nearby_places(self):
        response = self.client.get("/api/places/nearby?lat=17.3616&lng=78.4747&category=all")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["count"], 0)

    def test_itinerary_planner(self):
        payload = {
            "destination": "Hyderabad",
            "days": 1,
            "budget": 2000,
            "interests": ["Heritage", "Food"],
            "start_time": "09:00",
            "travel_mode": "Affordable (Metro / Auto)",
            "companions": "Solo",
            "preferred_language": "en"
        }
        response = self.client.post("/api/planner/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["destination"], "Hyderabad")
        self.assertEqual(len(data["itinerary"]), 1)

    def test_monument_tour_guide(self):
        response = self.client.post("/api/guide/monument", json={"place_id": "hyd-charminar", "language": "en"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["place_name"], "Charminar")

    def test_budget_calculator_alerts(self):
        payload = {
            "total_budget": 2000,
            "transport_cost": 400,
            "entry_fees": 150,
            "food_cost": 1200,
            "stay_cost": 500,
            "shopping_cost": 200
        }
        response = self.client.post("/api/budget/calculate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["alert_level"], "DANGER")

    def test_emergency_safety_and_sos(self):
        contacts_res = self.client.get("/api/safety/emergency-contacts")
        self.assertEqual(contacts_res.status_code, 200)

        sos_payload = {
            "user_name": "Test Tourist",
            "lat": 17.3616,
            "lng": 78.4747,
            "battery_level": 85,
            "message": "Testing SOS trigger"
        }
        sos_res = self.client.post("/api/safety/sos-trigger", json=sos_payload)
        self.assertEqual(sos_res.status_code, 200)
        self.assertEqual(sos_res.json()["status"], "SOS_DISPATCHED")

if __name__ == "__main__":
    unittest.main()
