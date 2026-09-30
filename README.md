# GreenPulse Agri-DPG — Interoperable Digital Agriculture Network & Agro-Advisories

GreenPulse Agri-DPG is an open, interoperable **Digital Public Good (DPG)** designed to empower small and marginal farmers across India with data-driven agricultural intelligence. (Small and marginal farm holdings make up approximately 86% of India's farm holdings — Agriculture Census 2015-16.)

By unifying **on-farm IoT soil analytics**, **modelled vegetation indices**, **live weather forecasting**, and **rule-based crop disease screening**, the platform delivers localized agro-advisories and **regenerative crop recommendations**. It also serves as a shared digital public infrastructure enabling Indian state agricultural departments to exchange predictive models, regional pest outbreak data, and climate-resilient practices — with a schema designed to be extensible to other countries.

---

## The Problem & The Solution

* **The Problem**: Smallholder farmers frequently face crop failure and yield volatility due to reliance on traditional guesswork rather than actionable soil health, satellite, and meteorological data. Meanwhile, siloed state datasets prevent coordinated responses to climate emergencies.
* **The Solution**: An open digital public good architecture delivering:
  1. **Crop Disease Screening Tool**: Leaf image analysis using HSV colour masking to screen for 4 disease patterns per crop, producing dual-tier remedies — bio-organic (Jeevamrutha, Pseudomonas, Trichoderma) and targeted chemical controls. This is a rule-based screening aid, not a substitute for an agronomist.
  2. **Regenerative Crop Recommender**: Multi-crop companion planting plans (e.g. Millets + Nitrogen-fixing pulses) customised to soil NPK, moisture, and seasonal water outlook. Indicative water-savings estimates (based on crop-type heuristics) guide input reduction.
  3. **Vegetation Indices & Weather Engine**: Modelled NDVI/NDWI canopy vigour indices and live 7-day weather forecast via Open-Meteo (free, no API key required). Direct satellite API integration is the planned next step.
  4. **Inter-State DPG Federation Hub**: Open JSON schema designed to be mappable to the AgriStack / IDEA approach, enabling states to exchange agricultural models and climate-resilience datasets. Current state nodes are demonstration zones with seeded sample data.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION & INTELLIGENCE SOURCES                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
          │                                 │                                │
          ▼                                 ▼                                ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌────────────────────────┐
│  On-Farm IoT Nodes    │       │  Satellite Telemetry  │       │ Climate Forecast (IMD) │
│ (Raspberry Pi, Soil   │       │ (Sentinel-2 10m NDVI, │       │ (7-Day Precipitation,  │
│  Moisture, pH, Temp)  │       │  NDWI Moisture Stress)│       │  Temperature, Humidity)│
└───────────┬───────────┘       └───────────┬───────────┘       └───────────┬────────────┘
            │                               │                               │
            └───────────────────────┬───────┴───────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI UNIFIED AGRI-AI CORE (BACKEND)                          │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ • AI Crop Disease Vision Engine   │ • Regenerative Cropping & Companion Plan Engine    │
│ • Soil Health Analytics (NPK, pH) │ • Inter-State DPG Schema & Model Federation Hub    │
└───────────────────────────────────┴────────────────────────────────────────────────────┘
                                    │
                                    ├──────────────────────────┐
                                    ▼                          ▼
                        ┌───────────────────────┐  ┌───────────────────────┐
                        │   MongoDB Persistence │  │ Real-Time WebSockets  │
                        │(Telemetry, Soil Tests,│  │(Live Sensor Telemetry │
                        │ Advisories, DPG Data) │  │  & Urgent Warnings)   │
                        └───────────────────────┘  └───────────┬───────────┘
                                                               │
                                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          OPERATOR & FARMER WEB APPLICATION                             │
├─────────────────────────────────────────────────┬──────────────────────────────────────┤
│ 🌾 FARMER & FIELD ADVISORY PORTAL               │ 🏛 NATIONAL INTER-STATE DPG HUB       │
│ • Live Soil Telemetry & Microclimate            │ • Federated Cross-State Consortia    │
│ • AI Crop Leaf Disease Scanner (Photo Diagnosis)│ • State Resilience Indices           │
│ • Regenerative Rotation & Bio-Fertilizer Advice │ • One-Click DPG JSON Schema Export   │
│ • 7-Day Rainfall Forecast & Spray Advisories    │ • AgriStack / IDEA Standard Models   │
└─────────────────────────────────────────────────┴──────────────────────────────────────┘
```

---

## Key Modules

### 1. Crop Disease Screening Tool
* Accepts uploaded leaf images or smartphone snapshots.
* Analyses HSV colour channels: yellow chlorosis mask + necrotic brown-spot mask (OpenCV).
* Selects from a knowledge base of 4 crop-specific disease entries per crop (Rice, Wheat, Tomato, Cotton) plus a general fallback.
* Generates dual-tier treatment protocols:
  * **Bio-Organic Remedies**: *Pseudomonas fluorescens*, fermented *Jeevamrutha*, *Trichoderma*, and cold-pressed neem formulations.
  * **Targeted Chemical Controls**: Exact dosage specifications for critical economic threshold situations.
* **Note**: This is a rule-based colour-analysis screening aid, not a trained neural network. It has not been validated against a held-out image set. Treat outputs as preliminary guidance, not a professional agronomist diagnosis.

### 2. Regenerative Crop Recommendation Engine
* Integrates soil nutrient profiles (Nitrogen, Phosphorus, Potassium in kg/ha), pH, and moisture with seasonal water availability.
* Prescribes climate-resilient primary crops coupled with nitrogen-fixing companion crops (e.g., Pearl Millet intercropped with Cowpea/Pigeonpea in a 4:2 ratio).
* Water-savings estimates are indicative, derived from crop-type heuristics based on published agronomy literature — not field-measured results.

### 3. Vegetation Indices & Weather Engine
* Computes modelled vegetation indices (Sentinel-2 NDVI/NDWI approach):
  * **NDVI (Normalized Difference Vegetation Index)**: Estimates photosynthetic activity and canopy vigour.
  * **NDWI (Normalized Difference Water Index)**: Estimates leaf hydraulic stress.
* Fetches live 7-day weather forecast from **[Open-Meteo](https://open-meteo.com/)** (free, no API key, falls back to simulation if offline).
* Generates actionable agro-meteorological advisories (e.g. "Heavy rainfall predicted within 48h; clear field drainage and suspend fertilizer application").
* **Planned next step**: Direct Sentinel-2 satellite API integration via Copernicus Data Space or Microsoft Planetary Computer.

### 4. Inter-State Digital Public Good (DPG) Federation
* Provides an open JSON schema designed to be mappable to the **India Digital Ecosystem for Agriculture (AgriStack / IDEA)** approach (not independently certified).
* Enables states to share models via cross-state consortia:
  * *Punjab-Haryana Groundwater Consortium* (Direct Seeded Rice & in-situ mulching algorithms).
  * *Maharashtra-Karnataka Dryland Corridor* (Millet polyculture and drought resilience).
  * *MP-Rajasthan Soil Organic Carbon Initiative*.
* Provides a downloadable, machine-readable JSON schema export for federated model exchange.
* **State nodes (Punjab, Maharashtra, Karnataka, Madhya Pradesh, Tamil Nadu) are demonstration zones seeded with sample data.** No state government has formally joined this prototype.

### 5. IoT Field Node (Raspberry Pi)
* **Physical sensors implemented** (with mock/simulation fallback when hardware is absent):
  * DHT22 — ambient temperature and relative humidity (GPIO Pin 4)
  * Capacitive soil moisture sensor — volumetric water content (Analog via MCP3008 ADC)
  * LDR light sensor — incident sunlight index (Analog Channel 1)
* **Offline resilience**: sends data to backend via REST; on network failure, buffers up to 100 readings in-memory and retries with exponential back-off every 5 minutes.
* **pH/EC probe**: listed in hardware spec as planned; not yet implemented in `sensors.py`.

---

## Edge IoT Hardware Specifications

| Hardware Component | Functionality | Status |
| :--- | :--- | :--- |
| **Raspberry Pi 4 / 3B+** | Edge compute, local vision preprocessing, networking | Supported |
| **DHT22 (AM2302)** | Ambient temperature & relative humidity | Implemented |
| **Capacitive Soil Sensor v1.2** | Soil volumetric water content | Implemented |
| **LDR Light Sensor** | Incident sunlight index | Implemented |
| **Soil pH / EC Probe** | Soil acidity and electrical conductivity | Planned |
| **Raspberry Pi Camera v2** | On-station leaf disease inspection | Implemented |

> **Development Mode**: If physical sensors or camera are not detected, `sensors.py` automatically falls back to synthetic mock data, so the node runs without hardware.

---

## Repository Structure

```
greenpulse/
├── backend/
│   ├── api/
│   │   ├── agri.py              # Crop screening, regenerative advisory & DPG endpoints
│   │   ├── sensor_data.py       # Ingests IoT soil and microclimate telemetry
│   │   ├── farms.py             # Farm and field cluster registry (CRUD + health)
│   │   ├── analytics.py         # Historical trends and anomaly alert triggers
│   │   └── websocket.py         # Real-time WebSocket broadcasting
│   ├── main.py                  # FastAPI application entrypoint & routing
│   ├── agri_ai.py               # Disease knowledge base, advisory engine, NDVI model, Open-Meteo weather
│   ├── database.py              # Motor async MongoDB client & indexing
│   ├── models.py                # Pydantic data contracts (Farms, Soil, Disease, DPG)
│   ├── scoring.py               # Ecological health & soil resilience scoring engine
│   ├── create_test_data.py      # Seeds Indian agro-zones (Punjab, Maharashtra, Karnataka)
│   └── requirements.txt         # FastAPI, Motor, OpenCV, NumPy dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgriPortal.tsx              # Farmer advisory portal with live soil telemetry
│   │   │   ├── CropDiseaseScanner.tsx      # Leaf disease screening tool with remedies
│   │   │   ├── RegenerativeRecommender.tsx # Companion crop & soil conservation planner
│   │   │   ├── SatelliteWeatherCard.tsx    # Modelled NDVI & Open-Meteo 7-day forecast
│   │   │   ├── InterStateDPGView.tsx       # National DPG exchange & open schema exporter
│   │   │   └── Header.tsx                  # Navigation bar
│   │   ├── services/
│   │   │   ├── api.ts                      # Axios REST client with agriService methods
│   │   │   └── websocket.ts                # WebSocket auto-reconnect client
│   │   └── types/index.ts                  # TypeScript interfaces for agricultural domain
│   └── package.json
│
├── iot-node/
│   ├── main.py                  # Node runner with in-memory offline buffer & retry
│   ├── sensors.py               # Sensor drivers (DHT22, Soil Moisture, LDR) with mock mode
│   ├── camera.py                # OpenCV leaf inspection driver
│   ├── data_sender.py           # REST dispatcher with offline resilience (up to 100 readings)
│   └── requirements.txt
│
├── docs/                        # Architecture, API documentation, deployment guide
├── LICENSE                      # Open-source MIT License
└── QUICK_START.md               # Developer execution runbook
```

---

## Quick Setup

Prerequisites: **Python 3.9+**, **Node.js 16+**, and **MongoDB** (native service or Docker).

For the complete terminal runbook, operating system guides, and troubleshooting:

👉 **[Developer Quick Start Runbook (QUICK_START.md)](QUICK_START.md)**

```bash
# 1. Start MongoDB
# Option A: Native (if MongoDB is installed as a system service)
# net start MongoDB   ← Windows
# sudo systemctl start mongod   ← Linux

# Option B: Docker
# docker run -d -p 27017:27017 --name greenpulse-mongo mongo:latest

# 2. Start Backend API (Port 8000)
cd backend
pip install -r requirements.txt
python create_test_data.py      # seed sample farm data
uvicorn main:app --reload --port 8000

# 3. Start Frontend Portal (Port 3000)
cd frontend
npm install
npm start

# 4. (Optional) Start IoT Field Node — runs in mock mode without hardware
cd iot-node
python main.py
```

---

## Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/agri/diagnose` | Upload crop leaf photo for rule-based disease screening & remedies |
| `POST` | `/api/agri/diagnose-json` | Base64 image screening endpoint for web camera feeds |
| `POST` | `/api/agri/regenerative-recommendation`| Companion crop plan, indicative water savings, soil conservation steps |
| `GET` | `/api/agri/satellite-weather` | Modelled NDVI/NDWI indices + live 7-day Open-Meteo forecast |
| `GET` | `/api/agri/farms` | Lists registered agro-ecological field stations and soil profiles |
| `GET` | `/api/agri/dpg/states` | Retrieves demonstration state nodes, open models, and climate consortia |
| `GET` | `/api/agri/dpg/export-schema` | Exports AgriStack / IDEA-mappable interoperability JSON schema |
| `POST` | `/api/sensor-data` | Telemetry ingestion endpoint for on-farm IoT soil/weather nodes |
| `WS` | `/ws/{client_id}` | WebSocket stream for live field telemetry & urgent alerts |

