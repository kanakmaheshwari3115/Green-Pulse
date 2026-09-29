# GreenPulse Agri-DPG — Frontend Application

Modern React 19 + TypeScript web application for the GreenPulse Digital Public Good (DPG) interoperable agriculture network.

---

## 🌾 Page & View Architecture

The frontend is organized into 3 primary routes and views:

### 1. Farmer & Field Advisory Portal (`/`)
The primary interface for farmers and field agronomists. Integrates three real-time AI tools:
* **Agro-Cluster Selector & Telemetry Strip**: View field microclimate status (Soil moisture, pH, temperature, ecological health) across registered Indian agro-zones (Punjab, Maharashtra, Karnataka).
* **🛰️ Satellite Earth Observation & Climate Engine** (`SatelliteWeatherCard.tsx`):
  * Displays Sentinel-2 multispectral vegetation indices: **NDVI** (canopy vigor) and **NDWI** (moisture stress).
  * 7-day agro-meteorological forecast with localized precipitation and spray recommendations.
* **🔬 AI Crop Disease Diagnostic Scanner** (`CropDiseaseScanner.tsx`):
  * Upload leaf photos or select field test specimens (Rice, Wheat, Tomato, Cotton).
  * Backend AI CV engine evaluates necrotic lesions, chlorosis, and pathogen signature.
  * Prescribes immediate bio-organic remedies (e.g. *Jeevamrutha*, *Trichoderma*) alongside emergency chemical containment.
* **🌱 Regenerative Crop & Companion Recommender** (`RegenerativeRecommender.tsx`):
  * Interactive sliders for Nitrogen (N), Phosphorus (P), Potassium (K), pH, and moisture.
  * Computes climate-resilient primary crop + nitrogen-fixing cover/companion crop pairings (e.g. Pearl Millet + Cowpea in 4:2 intercropping).
  * Displays projected water savings %, soil carbon benefits, and biological soil amendments.

### 2. National Inter-State DPG Hub (`/dpg`)
The national public infrastructure coordination view:
* **Cross-State Consortia**: Collaborative initiatives (e.g., Punjab-Haryana Groundwater Consortium, Maharashtra-Karnataka Dryland Corridor).
* **State Agriculture Nodes**: Live directory of participating state data models, crop algorithms, and resilience indices.
* **Interoperability Schema Exporter**: One-click download of the machine-readable JSON schema aligned with the **India Digital Ecosystem for Agriculture (AgriStack / IDEA)** open standard.

### 3. Regional Overview & Agro-Cluster Detail (`/legacy-dashboard`, `/farm/:parkId`)
* High-level health score rankings across all registered agricultural stations.
* Sensor historical trend graphs (temperature, humidity, soil moisture) rendered via Recharts.
* Automated threshold alert feed.

---

## 🔌 Data Flow: Dynamic vs. Presets

* **Dynamic REST API Endpoints**:
  * `agriService.getFarms()`: Fetches agro-stations dynamically from backend MongoDB.
  * `agriService.getSatelliteAndWeather()`: Real-time Sentinel-2 indices and weather bulletin.
  * `agriService.diagnoseCrop()`: Live CV diagnostic payload to FastAPI AI core.
  * `agriService.getRegenerativeAdvisory()`: Real-time companion cropping calculations on parameter change.
  * `agriService.getStateDPGModels()` & `exportDPGSchema()`: Inter-state model registry and downloadable JSON.
  * `analyticsService` & `sensorService`: Time-series sensor data and historical charts.
* **Presets & Quick Demos**:
  * Quick-select leaf samples (Tomato Early Blight, Rice Blast, Wheat Yellow Rust, Cotton Leaf Curl) generate test SVG leaf images so judges or farmers can test the diagnostic engine without uploading a photo.
  * Soil nutrient sliders default to regional averages and recalculate dynamically upon interaction.

---

## 🛠️ Tech Stack

* **Framework**: React 19 + TypeScript
* **Styling**: Tailwind CSS v3 (`@tailwindcss/forms` compatible)
* **Icons**: `@heroicons/react` v2
* **Charts**: `recharts`
* **HTTP Client**: `axios`
* **Routing**: `react-router-dom` v7

---

## 🚀 Running Locally

```bash
# 1. Install dependencies (Tailwind v3 compatible)
npm install --legacy-peer-deps

# 2. Start development server (Port 3000)
npm start

# 3. Build for production
npm run build
```
