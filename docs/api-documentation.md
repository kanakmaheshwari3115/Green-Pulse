# GreenPulse Agri-DPG API Documentation

## Overview
The GreenPulse Agri-DPG backend is a FastAPI application serving AI-driven agricultural intelligence, crop disease diagnostics, regenerative farming recommendations, satellite/weather telemetry, and Inter-State Digital Public Good (DPG) data exchange models.

Base URL: `http://localhost:8000`

---

## 1. Agricultural Advisory & Diagnostic Endpoints (`/api/agri/*`)

### AI Crop Disease Diagnosis (File Upload)
```http
POST /api/agri/diagnose
Content-Type: multipart/form-data

crop_hint: "tomato"
file: [binary image file]
```
**Response:**
```json
{
  "crop_type": "Tomato",
  "disease_name": "Early Blight (Alternaria solani)",
  "severity": "medium",
  "confidence_score": 94.5,
  "symptoms_identified": "Concentric rings producing target board spots on older foliage.",
  "visual_metrics": {
    "chlorosis_percentage": 18.2,
    "necrotic_lesion_density": 12.4
  },
  "organic_remedies": [
    "Spray cold-pressed Neem oil (3ml/L) with mild organic soap emulsifier."
  ],
  "chemical_remedies": [
    "Mancozeb 75 WP @ 2.5 g/L or Chlorothalonil @ 2 g/L."
  ],
  "preventive_practices": [
    "Drip irrigate at root zone; avoid overhead sprinkler wetting."
  ]
}
```

### AI Crop Disease Diagnosis (Base64 JSON)
```http
POST /api/agri/diagnose-json
Content-Type: application/json

{
  "crop_hint": "tomato",
  "image_base64": "data:image/jpeg;base64,..."
}
```

### Regenerative Crop Recommendation
```http
POST /api/agri/regenerative-recommendation
Content-Type: application/json

{
  "nitrogen": 180.0,
  "phosphorus": 24.0,
  "potassium": 210.0,
  "ph": 6.8,
  "moisture": 45.0,
  "state_code": "MH",
  "season": "Kharif",
  "water_availability": "medium"
}
```

### Satellite NDVI & 7-Day Weather Analytics
```http
GET /api/agri/satellite-weather?lat=28.6139&lon=77.2090
```

### Registered Agro-Ecological Farms
```http
GET /api/agri/farms
```

### Inter-State DPG Exchange Models
```http
GET /api/agri/dpg/states
```

### Export AgriStack / IDEA DPG Schema
```http
GET /api/agri/dpg/export-schema
```

---

## 2. IoT Telemetry & Farm Management (`/api/*`)

### Ingest Soil & Weather Sensor Telemetry
```http
POST /api/sensor-data
Content-Type: application/json

{
  "node_id": "node_mh_01",
  "park_id": "farm_mh_02",
  "readings": [
    {
      "sensor_type": "temperature",
      "value": 28.5,
      "unit": "°C",
      "timestamp": "2026-09-30T00:00:00Z"
    },
    {
      "sensor_type": "soil_moisture",
      "value": 42.0,
      "unit": "%",
      "timestamp": "2026-09-30T00:00:00Z"
    }
  ]
}
```

### WebSocket Real-time Stream
```ws
ws://localhost:8000/ws/{client_id}
```
Subscribes client portals to real-time farm sensor feeds and agro-climatic advisories.
