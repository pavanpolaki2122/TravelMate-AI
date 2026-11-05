from fastapi import APIRouter
from app.models.schemas import CommunityPostCreate
from app.services.community_service import community_service

router = APIRouter(prefix="/api/community", tags=["Tourist Community"])

@router.get("/posts")
def get_community_posts():
    """Retrieve tourist community stories, tips, and photos."""
    return {"posts": community_service.get_all_posts()}

@router.post("/posts")
def create_community_post(post: CommunityPostCreate):
    """Post a travel experience or hidden spot discovery."""
    created = community_service.create_post(post)
    return {"message": "Post shared successfully", "post": created}

@router.post("/posts/{post_id}/like")
def like_community_post(post_id: str):
    """Like a tourist review or post."""
    updated = community_service.like_post(post_id)
    return {"post": updated}

@router.get("/buddies")
def get_travel_buddies():
    """Find compatible travel companions in Hyderabad."""
    return {"buddies": community_service.get_travel_buddies()}
