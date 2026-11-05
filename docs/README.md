# TravelMate AI – Setup & Beginner's Guide

Welcome to **TravelMate AI**! This project was engineered specifically for beginner college students participating in innovation competitions and hackathons. It contains a complete working Android mobile application and high-performance Python FastAPI backend.

---

## 🌟 Quick Overview
TravelMate AI unites 11 intelligent tourism modules into one unified platform:
1. **AI Smart Trip Planner** – Multi-day itineraries with opening hours and sequence optimization.
2. **Hidden Places Discovery** – Unexplored gems with verification badges (Paigah Tombs, Moula Ali Hill, Khajaguda Rocks).
3. **AR Navigation** – Live camera HUD with rotating directional arrow, distance ticker, and compass bearing.
4. **AI Tour Guide** – Multilingual voice narration in English, Telugu (తెలుగు), and Hindi (हिंदी) with Gemini Q&A.
5. **All-in-One Nearby Explorer** – Real-world interactive map with category filters (Attractions, Food, Hospitals, Police, ATMs).
6. **Smart Budget Calculator** – Live expense tracking with dynamic budget threshold alerts (>80%, >100%).
7. **Live Tourist Assistant** – Interactive AI travel chat with Gemini 3.8 Flash and voice speech-to-text.
8. **Offline Tourist Assistant** – Downloadable city pack, cached offline guide, and sync indicator.
9. **Tourist Safety System** – Emergency SOS siren, speed-dial for 112/100/108, and WhatsApp live location broadcast.
10. **Tourist Community** – Traveler stories, reviews, and travel buddy matching.
11. **Smart Personalized Recommendations** – Match-scoring algorithm for custom interests.

---

## 🛠️ Step 1: Running the Live Web & Mobile Application (Immediate Demo)

You do **NOT** need Android Studio or heavy tools to test and demonstrate TravelMate AI right now! The backend serves a real-time mobile application with live camera AR, GPS, speech synthesis, and maps directly.

### 1. Open Terminal or PowerShell in the project directory:
```bash
cd c:\Users\ADMIN\Desktop\jayasreee
```

### 2. Install Required Python Packages:
```bash
python -m pip install fastapi uvicorn pydantic requests google-genai httpx
```

### 3. Start the Server:
```bash
python backend/run.py
```

### 4. Access the Platform:
- **Interactive Mobile Web App:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger API Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Open on Your Phone:** Connect your mobile phone to the same Wi-Fi, find your computer's IP (e.g., `192.168.1.5`), and open `http://<YOUR_IP>:8000` in Chrome on your Android phone!

---

## 📱 Step 2: Compiling the Native Flutter Android APK

The `travelmate_flutter/` folder contains the native Flutter Android codebase.

### 1. Prerequisites:
- Download and install **Flutter SDK** from [https://docs.flutter.dev](https://docs.flutter.dev)
- Download and install **Android Studio**

### 2. Running the Flutter App:
```bash
cd travelmate_flutter
flutter pub get
flutter run
```

### 3. Building Release APK:
```bash
flutter build apk --release
```
Your compiled APK will be generated at `travelmate_flutter/build/app/outputs/flutter-apk/app-release.apk`.

---

## 🔑 Step 3: Setting Up API Keys (Optional)

1. **Gemini AI API Key:**
   - Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com).
   - In PowerShell, run:
     ```powershell
     $env:GEMINI_API_KEY="your_api_key_here"
     python backend/run.py
     ```
   - *Note: TravelMate AI includes a verified offline reasoning fallback, so the application functions even without an active key!*

2. **Google Maps Platform Key:**
   - To use a Google Maps key, obtain a key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials) or use the free Maps Demo Key.
   - Insert it into `travelmate_flutter/android/app/src/main/AndroidManifest.xml`.
   - The web app already includes Leaflet/CartoDB real-world tiles out of the box with zero setup required.

---

## 🧪 Step 4: Running Automated Tests

Run the built-in test suite to verify all backend modules:
```bash
python backend/test_api.py
```
All 10 test suites should return `OK`.
