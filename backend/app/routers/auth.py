from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from app.db.database import get_db_connection

router = APIRouter(prefix="/api/auth", tags=["User Authentication & Profile"])

class RegisterRequest(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    email: str
    password: str
    preferred_language: Optional[str] = "en"
    travel_style: Optional[str] = "Budget"

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    user_id: str
    full_name: str
    preferred_language: str
    travel_style: str

@router.post("/register")
def register_user(req: RegisterRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    name = req.full_name or req.name or req.email.split('@')[0]
    try:
        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO users (id, full_name, email, password_hash, preferred_language, travel_style)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, name, req.email.lower().strip(), req.password, req.preferred_language, req.travel_style))
        conn.commit()
        return {
            "status": "success",
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "full_name": name,
                "name": name,
                "email": req.email.lower().strip(),
                "preferred_language": req.preferred_language,
                "travel_style": req.travel_style
            }
        }
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("/login")
def login_user(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, full_name, email, password_hash, preferred_language, travel_style
    FROM users WHERE email = ?
    """, (req.email.lower().strip(),))
    user = cursor.fetchone()
    conn.close()

    if not user or user["password_hash"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "status": "success",
        "message": "Logged in successfully",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "name": user["full_name"],
            "email": user["email"],
            "preferred_language": user["preferred_language"],
            "travel_style": user["travel_style"]
        }
    }

@router.post("/profile")
def update_profile(req: ProfileUpdateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE users SET full_name = ?, preferred_language = ?, travel_style = ?
    WHERE id = ?
    """, (req.full_name, req.preferred_language, req.travel_style, req.user_id))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Profile updated successfully"}
