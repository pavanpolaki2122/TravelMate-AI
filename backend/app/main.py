import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.db.database import init_db
from app.routers import auth, places, planner, guide, budget, safety, community

app = FastAPI(
    title="TravelMate AI API",
    description="Intelligent personal travel companion platform for smart tourism, navigation, and assistance.",
    version="1.1.0"
)

# Initialize SQLite database tables on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Enable CORS for Flutter mobile apps and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(places.router)
app.include_router(planner.router)
app.include_router(guide.router)
app.include_router(budget.router)
app.include_router(safety.router)
app.include_router(community.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "TravelMate AI",
        "version": "1.1.0",
        "destination_scope": "Hyderabad, Telangana, India",
        "modules_active": [
            "AI Smart Trip Planner",
            "Hidden Places Discovery",
            "AR Navigation Engine",
            "AI Tour Guide & TTS",
            "All-in-One Nearby Explorer",
            "Smart Budget Calculator",
            "Live Tourist Assistant",
            "Offline Tourist Assistant",
            "Tourist Safety & SOS System",
            "Tourist Community & Buddy Finder",
            "Smart Personalized Recommendations"
        ]
    }

# Mount frontend static files
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "frontend"))
if os.path.exists(frontend_dir):
    css_dir = os.path.join(frontend_dir, "css")
    js_dir = os.path.join(frontend_dir, "js")
    icons_dir = os.path.join(frontend_dir, "icons")
    if os.path.exists(css_dir):
        app.mount("/css", StaticFiles(directory=css_dir), name="css")
    if os.path.exists(js_dir):
        app.mount("/js", StaticFiles(directory=js_dir), name="js")
    if os.path.exists(icons_dir):
        app.mount("/icons", StaticFiles(directory=icons_dir), name="icons")
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/")
    def serve_frontend_root():
        index_file = os.path.join(frontend_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "TravelMate AI backend running. Frontend index.html not found."}

    @app.get("/manifest.json")
    def serve_manifest():
        m_file = os.path.join(frontend_dir, "manifest.json")
        if os.path.exists(m_file):
            return FileResponse(m_file, media_type="application/manifest+json")
        return {}

    @app.get("/sw.js")
    def serve_service_worker():
        sw_file = os.path.join(frontend_dir, "sw.js")
        if os.path.exists(sw_file):
            return FileResponse(
                sw_file,
                media_type="application/javascript",
                headers={"Service-Worker-Allowed": "/"}
            )
        return {"error": "sw.js not found"}

    @app.get("/favicon.ico", include_in_schema=False)
    def favicon():
        from fastapi.responses import Response
        return Response(status_code=204)
