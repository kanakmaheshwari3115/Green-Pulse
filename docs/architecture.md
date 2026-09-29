# GreenPulse Agri-DPG Technical Architecture

## Overview
GreenPulse Agri-DPG is an open Digital Public Good (DPG) platform for climate-resilient agriculture, computer vision crop disease diagnostics, regenerative farming advisories, and inter-state open data exchange.

```
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│     IoT Field Nodes     │ ────▶│     FastAPI Backend     │ ────▶│  React Wide-Screen UI   │
│ (Soil, Weather, Camera) │      │  (Python AI Engine)     │      │ (AgriPortal & DPG Hub)  │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
                                              │
                                              ▼
                                 ┌─────────────────────────┐
                                 │     MongoDB Atlas       │
                                 │  (Telemetry & Models)   │
                                 └─────────────────────────┘
```

---

## Component Specifications

### 1. Python FastAPI Backend (`backend/`)
- **AI Engine (`agri_ai.py`)**: OpenCV color masking & lesion density analysis for plant pathogen detection; NPK/pH heuristic matrix for climate-resilient crop rotation; Sentinel-2 simulated NDVI & 7-day weather forecasting.
- **Database Layer (`database.py`)**: MongoDB integration with automatic fallback to seed Indian agro-zones (Punjab, Maharashtra, Karnataka, Madhya Pradesh, Tamil Nadu).
- **APIs (`api/agri.py`)**: REST endpoints for crop diagnostics, regenerative recommendations, satellite weather, farm telemetry, and AgriStack/IDEA JSON schema export.

### 2. React Wide-Screen Frontend (`frontend/`)
- **UI Framework**: React 19, TypeScript, Tailwind CSS v3 (using `max-w-[1720px]` container, vibrant emerald/sky/teal/amber color schemes).
- **Views**:
  - `AgriPortal.tsx`: Segmented tab portal for disease scanner, regenerative recommendations, satellite NDVI & 7-day weather forecast.
  - `InterStateDPGView.tsx`: National Inter-State DPG Exchange showing open AI models, climate consortia, state resilience scores, and schema modal export.
  - `Dashboard.tsx` & `ParkDetail.tsx`: Multi-station field telemetry and deep-dive node monitoring.

### 3. IoT Edge Telemetry Node (`iot-node/`)
- **Sensors**: Soil moisture, temperature, humidity, light intensity, and camera image capture.
- **Sender (`data_sender.py`)**: Automated REST/WebSocket telemetry ingestion with local failover data buffering.
