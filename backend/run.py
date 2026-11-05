"""
TravelMate AI - Server Launcher
Run with: python backend/run.py
"""

import sys
import os

# Set UTF-8 encoding for Windows standard output
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(backend_dir, ".env"))
    print("[TravelMate AI] .env loaded successfully")
except ImportError:
    # Fallback: manually parse .env
    env_path = os.path.join(backend_dir, ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())
        print("[TravelMate AI] .env loaded (manual fallback)")

import uvicorn

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print("=" * 60)
    print("[TravelMate AI] Starting Backend & Web Platform...")
    print("[TravelMate AI] Target Scope: Hyderabad, Telangana, India")
    print(f"[TravelMate AI] Web App Local URL: http://127.0.0.1:{port}")
    print(f"[TravelMate AI] Mobile Wi-Fi URL:  http://10.121.200.212:{port}")
    print(f"[TravelMate AI] API Docs (Swagger): http://127.0.0.1:{port}/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
