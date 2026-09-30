# GreenPulse Agri-DPG Technical Architecture

## Overview
GreenPulse Agri-DPG is an open Digital Public Good (DPG) prototype for climate-resilient agriculture, rule-based crop disease screening, regenerative farming advisories, and inter-state open data exchange.

```
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│     IoT Field Nodes     │ ────▶│     FastAPI Backend     │ ────▶│    React + TS Web UI    │
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
- **Advisory & Screening Core (`agri_ai.py`)**: OpenCV color masking & lesion density analysis for rule-based disease screening; NPK/pH heuristic matrix for climate-resilient companion crop rotation; modelled NDVI/NDWI vegetation indices combined with live 7-day weather forecasting via Open-Meteo API.
- **Database Layer (`database.py`)**: MongoDB integration with automated seed script for Indian agro-zones demonstration data (Punjab, Maharashtra, Karnataka, Madhya Pradesh, Tamil Nadu).
- **APIs (`api/agri.py`, `api/farms.py`)**: REST endpoints for crop disease screening, regenerative recommendations, weather & vegetation indices, farm telemetry, and AgriStack/IDEA-mappable JSON schema export.

### 2. React TypeScript Frontend (`frontend/`)
- **Stack**: React, TypeScript, Tailwind CSS.
- **Views**:
  - `AgriPortal.tsx`: Segmented portal for crop disease screening, regenerative companion recommendations, and live 7-day weather with vegetation indices.
  - `InterStateDPGView.tsx`: National Inter-State DPG Exchange demonstrating open models, climate consortia, state resilience scores, and schema export.
  - `Dashboard.tsx` & `ParkDetail.tsx`: Multi-station field telemetry and node monitoring.

### 3. IoT Edge Telemetry Node (`iot-node/`)
- **Sensors**: DHT22 (temperature, humidity), capacitive soil moisture, LDR light intensity, and camera image capture. (Soil pH/EC probe is planned in hardware roadmap).
- **Sender & Buffer (`data_sender.py`)**: REST telemetry dispatcher with in-memory failover buffering (up to 100 items) and exponential back-off retries every 5 minutes.

