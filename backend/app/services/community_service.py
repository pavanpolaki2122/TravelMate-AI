from typing import List, Dict, Optional
from datetime import datetime
from app.models.schemas import CommunityPostCreate

INITIAL_COMMUNITY_POSTS = [
    {
        "id": "post-1",
        "author": "Ananya Sharma",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        "location_name": "Paigah Tombs",
        "content": "Stumbled upon Paigah Tombs yesterday thanks to TravelMate AI's hidden gems filter! The delicate marble jaali work is mesmerizing and there was literally no crowd. Perfect for quiet photography.",
        "tags": ["Hidden Gem", "Photography", "Tranquil"],
        "rating": 5,
        "likes": 42,
        "created_at": "2 hours ago",
        "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "post-2",
        "author": "Vikram Reddy",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        "location_name": "Hotel Shadab",
        "content": "Pro-tip for first-timers: Order the Mutton Dum Biryani along with Double ka Meetha at Shadab. Go around 1:00 PM for the freshest piping hot batch straight from the handi!",
        "tags": ["Food", "Biryani", "Travel Tip"],
        "rating": 5,
        "likes": 88,
        "created_at": "5 hours ago",
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "post-3",
        "author": "David Miller",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        "location_name": "Moula Ali Hilltop",
        "content": "Climbed the 484 steps for sunset yesterday. The breeze and the 360-degree twilight view over Hyderabad are unbeatable. Don't forget to bring drinking water!",
        "tags": ["Sunset", "Trek", "Viewpoint"],
        "rating": 5,
        "likes": 35,
        "created_at": "1 day ago",
        "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    }
]

TRAVEL_BUDDIES = [
    {
        "id": "buddy-1",
        "name": "Karthik Verma",
        "travel_dates": "This Weekend",
        "interests": ["Heritage Photography", "Golconda Fort Trek"],
        "languages": ["English", "Telugu", "Hindi"],
        "destination": "Old City & Forts",
        "verified": True
    },
    {
        "id": "buddy-2",
        "name": "Sneha Roy",
        "travel_dates": "Next 3 Days",
        "interests": ["Food Tour", "Irani Chai Trail", "Museums"],
        "languages": ["English", "Hindi", "Bengali"],
        "destination": "Charminar & Salar Jung",
        "verified": True
    }
]

class CommunityService:
    def __init__(self):
        self.posts = list(INITIAL_COMMUNITY_POSTS)
        self.buddies = list(TRAVEL_BUDDIES)

    def get_all_posts(self) -> List[Dict]:
        return self.posts

    def create_post(self, post_in: CommunityPostCreate) -> Dict:
        new_post = {
            "id": f"post-{len(self.posts) + 1}",
            "author": post_in.author,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            "location_name": post_in.location_name,
            "content": post_in.content,
            "tags": post_in.tags or ["Travel Experience"],
            "rating": post_in.rating,
            "likes": 0,
            "created_at": "Just now",
            "image_url": post_in.image_url or "https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=600&q=80"
        }
        self.posts.insert(0, new_post)
        return new_post

    def like_post(self, post_id: str) -> Optional[Dict]:
        for post in self.posts:
            if post["id"] == post_id:
                post["likes"] += 1
                return post
        return None

    def get_travel_buddies(self) -> List[Dict]:
        return self.buddies

community_service = CommunityService()
