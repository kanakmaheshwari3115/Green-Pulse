# GreenPulse Agri-DPG — Interoperable Digital Agriculture Network & Agro-Advisories

GreenPulse Agri-DPG is an open, interoperable **Digital Public Good (DPG)** designed to empower small and marginal farmers across India with real-time, data-driven agricultural intelligence. 

By unifying **satellite earth observation**, **on-farm IoT soil analytics**, **hyperlocal climate forecasting**, and **computer vision-based crop disease diagnostics**, the platform delivers localized agro-advisories and **regenerative crop recommendations**. Furthermore, it serves as a shared digital public infrastructure enabling Indian state agricultural departments to exchange predictive models, regional pest outbreaks, and climate-resilient practices.

---

## The Problem & The Solution

* **The Problem**: Smallholder farmers frequently face crop failure and yield volatility due to reliance on traditional guesswork rather than actionable soil health, satellite, and meteorological data. Meanwhile, siloed state datasets prevent coordinated responses to climate emergencies.
* **The Solution**: An open digital public good architecture delivering:
  1. **AI Crop Disease Pathology Tool**: Rapid leaf image analysis detecting infections, estimating severity, and prescribing immediate bio-organic remedies alongside emergency chemical controls.
  2. **Regenerative Crop Recommender**: Multi-crop companion planting plans (e.g. Millets + Nitrogen-fixing pulses) customized to soil NPK levels, moisture status, and seasonal rainfall projections to cut synthetic fertilizer dependency and conserve water.
  3. **Satellite & Climate Weather Engine**: Harmonized Sentinel-2 NDVI canopy vigor mapping, NDWI soil moisture stress analysis, and 7-day agro-meteorological advisories.
  4. **Inter-State DPG Federation Hub**: Open standardized schema (AgriStack / IDEA compatible) allowing states (Punjab, Maharashtra, Karnataka, Madhya Pradesh, etc.) to share agricultural models and cross-state climate resilience datasets.

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

### 1. AI Crop Disease Diagnostic Scanner
* Accepts captured leaf images or live smartphone camera snapshots.
* Inspects necrotic spot density, leaf edge deformation, and chlorosis ratio.
* Identifies prevalent pathogens (e.g. *Rice Blast*, *Wheat Yellow Rust*, *Tomato Early Blight*, *Cotton Leaf Curl Virus*).
* Generates dual-tier treatment protocols:
  * **Regenerative Bio-Remedies**: *Pseudomonas fluorescens*, fermented *Jeevamrutha*, *Trichoderma*, and cold-pressed neem formulations.
  * **Targeted Chemical Controls**: Exact dosage specifications reserved for critical economic threshold containment.

### 2. Regenerative Crop Recommendation Engine
* Integrates soil nutrient profiles (Nitrogen, Phosphorus, Potassium in kg/ha), pH, and moisture with seasonal water availability.
* Prescribes climate-resilient primary crops coupled with nitrogen-fixing cover/companion crops (e.g., Pearl Millet intercropped with Cowpea/Pigeonpea in a 4:2 ratio).
* Evaluates projected water conservation percentages and soil organic carbon sequestration benefits.

### 3. Satellite Earth Observation & Climate Engine
* Computes normalized vegetation indices:
  * **NDVI (Normalized Difference Vegetation Index)**: Measures photosynthetic activity and canopy vigor.
  * **NDWI (Normalized Difference Water Index)**: Detects early water stress and canopy wilting.
* Generates localized agro-meteorological advisories (e.g. "Heavy rainfall predicted within 48h; clear field drainage and suspend fertilizer application").

### 4. Inter-State Digital Public Good (DPG) Federation
* Formats data models in accordance with the **India Digital Ecosystem for Agriculture (AgriStack / IDEA)** open standard.
* Enables states to participate in cross-border climate consortia:
  * *Punjab-Haryana Groundwater Consortium* (Direct Seeded Rice & in-situ mulching algorithms).
  * *Maharashtra-Karnataka Dryland Corridor* (Millet polyculture and drought resilience).
  * *MP-Rajasthan Soil Organic Carbon Initiative*.
* Provides a downloadable, machine-readable JSON schema for federated model exchange.

---

## Edge IoT Hardware Specifications

For real-time on-field soil and microclimate telemetry:

| Hardware Component | Functionality | Interface |
| :--- | :--- | :--- |
| **Raspberry Pi 4 / 3B+** | Edge compute, local vision preprocessing, networking | Microprocessor Core |
| **DHT22 (AM2302)** | Ambient field temperature & relative humidity | GPIO Digital Pin 4 |
| **Capacitive Soil Sensor v1.2**| Soil volumetric water content (corrosion resistant) | Analog via MCP3008 ADC |
| **LDR Light Sensor** | Incident sunlight and canopy shading index | Analog Channel 1 |
| **Soil pH / EC Probe** | Soil acidity and electrical conductivity | RS485 / ADC Bus |
| **Raspberry Pi Camera v2** | On-station foliage disease inspection | CSI Ribbon Cable |

> **Development Mode**: If physical sensors or camera modules are not detected, the software (`iot-node/main.py`) automatically switches to simulation mode, generating synthetic telemetry and test foliage specimens without throwing errors.

---

## Repository Structure

```
greenpulse/
├── backend/
│   ├── api/
│   │   ├── agri.py              # AI Crop Diagnosis, Regenerative Advisory & DPG endpoints
│   │   ├── sensor_data.py       # Ingests IoT soil and microclimate telemetry
│   │   ├── parks.py             # Farm and field cluster registry
│   │   ├── analytics.py         # Historical trends and anomaly alert triggers
│   │   └── websocket.py         # Real-time WebSocket broadcasting
│   ├── agri_ai.py               # Pathogen CV classifier, regenerative crop model, satellite NDVI
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
│   │   │   ├── CropDiseaseScanner.tsx      # Leaf disease pathology tool with remedies
│   │   │   ├── RegenerativeRecommender.tsx # Companion crop & soil conservation planner
│   │   │   ├── SatelliteWeatherCard.tsx    # Sentinel-2 NDVI & 7-day agro-weather bulletin
│   │   │   ├── InterStateDPGView.tsx       # National DPG exchange & open schema exporter
│   │   │   └── Header.tsx                  # Navigation bar & language switcher
│   │   ├── services/
│   │   │   ├── api.ts                      # Axios REST client with agriService methods
│   │   │   └── websocket.ts                # WebSocket auto-reconnect client
│   │   └── types/index.ts                  # TypeScript interfaces for agricultural domain
│   └── package.json
│
├── iot-node/
│   ├── main.py                  # Node runner with failover SQLite caching buffer
│   ├── sensors.py               # Sensor drivers (DHT22, Soil Moisture, LDR) with mock mode
│   ├── camera.py                # OpenCV leaf inspection driver
│   ├── data_sender.py           # REST dispatcher with offline resilience
│   └── requirements.txt
│
└── QUICK_START.md               # Hands-on developer execution runbook
```

---

## Quick Setup

Prerequisites: **Python 3.9+**, **Node.js 16+**, and **MongoDB 5.0+**.

For the complete terminal runbook, operating system guides, and troubleshooting:

👉 **[Developer Quick Start Runbook (QUICK_START.md)](QUICK_START.md)**

```bash
# 1. Start MongoDB (Native or Docker)
docker run -d -p 27017:27017 --name greenpulse-mongo mongo:latest

# 2. Start Backend API (Port 8000)
cd backend
pip install -r requirements.txt
python create_test_data.py
uvicorn main:app --reload --port 8000

# 3. Start Frontend Portal (Port 3000)
cd frontend
npm install
npm start

# 4. Start IoT Field Node (Simulation or Physical Pi)
cd iot-node
python main.py
```

---

## Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/agri/diagnose` | Upload crop leaf photo for AI pathogen classification & remedies |
| `POST` | `/api/agri/diagnose-json` | Base64 image diagnosis endpoint for web camera feeds |
| `POST` | `/api/agri/regenerative-recommendation`| Computes companion crops, water savings, and soil conservation steps |
| `GET` | `/api/agri/satellite-weather` | Fetches Sentinel-2 NDVI indices and 7-day localized precipitation forecast |
| `GET` | `/api/agri/farms` | Lists registered agro-ecological field stations and soil profiles |
| `GET` | `/api/agri/dpg/states` | Retrieves participating state nodes, open models, and climate consortia |
| `GET` | `/api/agri/dpg/export-schema` | Exports AgriStack / IDEA-compliant interoperability JSON schema |
| `POST` | `/api/sensor-data` | Telemetry ingestion endpoint for on-farm IoT soil/weather nodes |
| `WS` | `/ws/{client_id}` | WebSocket stream for instantaneous field telemetry & critical alerts |

---

## License

Published as an open Digital Public Good (DPG) infrastructure with models and schemas released under the [Open Data Commons Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).
