# TravelMate AI – Technical Architecture & Design Document

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph ClientLayer ["Client Presentation Layer"]
        FlutterApp["Flutter Android Native App (Dart)"]
        WebPWA["Real-Time Mobile Web / PWA Client"]
        Sensors["Device Compass, Camera & GPS Sensors"]
        TTS["Web Speech / Flutter TTS Engine"]
    end

    subgraph APILayer ["FastAPI Gateway & Router Layer"]
        FastAPIServer["Uvicorn ASGI Server (:8000)"]
        RouterPlanner["/api/planner (Itinerary & Delay Engine)"]
        RouterPlaces["/api/places (Spatial Search & Nearby)"]
        RouterGuide["/api/guide (Monument Audio & Q&A)"]
        RouterBudget["/api/budget (Cost Tracker & Alternatives)"]
        RouterSafety["/api/safety (SOS & Emergency Helplines)"]
        RouterCommunity["/api/community (Feed, Reviews, Buddies)"]
    end

    subgraph ServiceEngine ["Intelligent Logic Services"]
        PlannerService["TSP Nearest-Neighbor Route Optimizer"]
        GeminiService["Gemini 3.8 Flash SDK Client"]
        PlacesService["Haversine Geolocation Engine"]
        BudgetService["Spending Threshold Alert System"]
        SafetyService["Emergency Broadcast Dispatcher"]
    end

    subgraph StorageLayer ["Persistence & External Services"]
        HydData[(Curated Hyderabad Places & Heritage DB)]
        LocalCache[(LocalStorage / SQLite Offline Cache)]
        GeminiCloud["Google GenAI Cloud API"]
        MapPlatform["Google Maps Platform / Leaflet Tiles"]
    end

    FlutterApp --> FastAPIServer
    WebPWA --> FastAPIServer
    Sensors --> WebPWA
    TTS --> WebPWA

    FastAPIServer --> RouterPlanner
    FastAPIServer --> RouterPlaces
    FastAPIServer --> RouterGuide
    FastAPIServer --> RouterBudget
    FastAPIServer --> RouterSafety
    FastAPIServer --> RouterCommunity

    RouterPlanner --> PlannerService
    RouterPlaces --> PlacesService
    RouterGuide --> GeminiService
    RouterBudget --> BudgetService
    RouterSafety --> SafetyService

    PlannerService --> HydData
    PlacesService --> HydData
    SafetyService --> HydData
    GeminiService --> GeminiCloud
    WebPWA -.-> LocalCache
    WebPWA --> MapPlatform
```

---

## 2. Dynamic Delay Recalculation Flowchart

When a tourist gets delayed at an attraction (e.g. long queues or lingering for photography), TravelMate AI dynamically recalculates their remaining itinerary:

```mermaid
sequenceDiagram
    autonumber
    actor Tourist as Tourist
    participant UI as TravelMate Mobile UI
    participant Backend as FastAPI /api/planner/recalculate
    participant DB as Hyderabad Curated DB

    Tourist->>UI: Taps "Running Late? Recalculate" (+90 min)
    UI->>Backend: POST /api/planner/recalculate {delay: 90, completed: ["hyd-charminar"]}
    Backend->>DB: Query monument operating hours (e.g. 17:30 close)
    Note over Backend: Shift arrival times forward by 90 minutes
    Note over Backend: Validate each stop against closing time
    alt Stop arrives after closing time
        Backend->>Backend: Flag warning badge & recommend evening alternative (e.g. Tank Bund)
    end
    Backend-->>UI: Return updated sequence & recalculated timestamps
    UI-->>Tourist: Render refreshed timeline with live adjustments
```

---

## 3. AR Navigation Mathematics (Spherical Trigonometry)

The AR engine computes bearing angle $\theta$ and great-circle distance $d$ from user coordinates $(\phi_1, \lambda_1)$ to target $(\phi_2, \lambda_2)$:

### Bearing Calculation:
$$\Delta\lambda = \lambda_2 - \lambda_1$$
$$y = \sin(\Delta\lambda) \cdot \cos(\phi_2)$$
$$x = \cos(\phi_1) \cdot \sin(\phi_2) - \sin(\phi_1) \cdot \cos(\phi_2) \cdot \cos(\Delta\lambda)$$
$$\theta = \text{atan2}(y, x) \pmod{360^\circ}$$

### Distance (Haversine Formula):
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$d = 2 \cdot R \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})$$
where $R = 6,371\text{ km}$.
