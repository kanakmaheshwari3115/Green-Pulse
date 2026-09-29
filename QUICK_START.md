# GreenPulse Agri-DPG — Developer Quick Start Runbook

This runbook provides the exact, copy-pasteable commands to get the entire GreenPulse stack running locally: **MongoDB**, **FastAPI Agri-AI Core**, **React Farmer Advisory Portal**, and the **IoT Edge Field Node** (with automated simulation fallback).

For system architecture, data models, and DPG interoperability specifications, refer to [README.md](README.md).

---

## 1. Prerequisites Check

Verify your development environment:

| Component | Minimum Version | Check Command |
| :--- | :--- | :--- |
| **Python** | 3.9 – 3.14+ | `python --version` (or `python3 --version`) |
| **Node.js** | 18.x – 24.x (npm 8+) | `node -v` and `npm -v` |
| **MongoDB** | 5.0+ | `mongod --version` (or native Windows service) |

---

## 2. Step-by-Step Local Startup

### Step 1: Start MongoDB (Port 27017)

MongoDB must be running before launching the FastAPI backend.

- **Option A: Native Windows Service (Recommended if Docker is not installed)**
  ```powershell
  # Check if MongoDB service is running
  Get-Service -Name "*mongo*"

  # Start the service (if stopped)
  net start MongoDB
  ```

- **Option B: Linux / macOS Service**
  ```bash
  # Linux (systemd)
  sudo systemctl start mongod

  # macOS (Homebrew)
  brew services start mongodb-community
  ```

- **Option C: Docker Container**
  ```bash
  docker run -d -p 27017:27017 --name greenpulse-mongo mongo:latest
  ```

---

### Step 2: Configure & Start the Backend API (Port 8000)

Open your **first terminal window**:

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **(Optional) Create and activate a Python virtual environment:**
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   > **Note**: If you are on Windows or a headless environment without GUI libraries, `opencv-python-headless` is included in `requirements.txt` to guarantee clean installation.

4. **Initialize environment file:**
   - **Windows:**
     ```powershell
     if (-not (Test-Path .env)) { copy .env.example .env }
     ```
   - **Linux / macOS:**
     ```bash
     cp -n .env.example .env
     ```

5. **Seed Indian Agro-Zone Demo Data:**
   ```bash
   python create_test_data.py
   ```
   *Seeds field stations across Punjab (Ludhiana wheat cluster), Maharashtra (Nashik organic soybean), and Karnataka (Mandya dryland ragi) along with baseline soil NPK and microclimate readings.*

6. **Start the FastAPI server:**
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

**Backend Health Checks:**
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Probe: [http://localhost:8000/health](http://localhost:8000/health)
- Agro-Stations API: [http://localhost:8000/api/agri/farms](http://localhost:8000/api/agri/farms)

---

### Step 3: Configure & Start the React Frontend (Port 3000)

Open your **second terminal window**:

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Launch the development server:**
   ```bash
   npm start
   ```

The web application will open automatically at **[http://localhost:3000](http://localhost:3000)**:
- **🌾 Farmer & Field Portal (`/`)**: Real-time soil telemetry, AI crop disease scanner, companion crop rotation planner, and Sentinel-2 satellite weather card.
- **🏛 National DPG Hub (`/dpg`)**: Federated state agriculture nodes, cross-state consortia, and downloadable IDEA / AgriStack-compliant JSON schema.
- **📊 Regional Overview (`/legacy-dashboard`)**: Multi-zone ecological monitoring and threshold alerts.

---

### Step 4: Run the IoT Edge Node (Field Simulation or Physical Hardware)

Open your **third terminal window**:

#### Mode A: Workstation Simulation (No physical Raspberry Pi needed)
The node automatically detects missing GPIO/CSI camera hardware and falls back to realistic synthetic soil moisture, temperature, and leaf pathology feeds:

1. **Navigate to the IoT node directory:**
   ```bash
   cd iot-node
   ```

2. **Install workstation-compatible packages:**
   ```bash
   pip install requests opencv-python-headless numpy pillow python-dotenv schedule
   ```

3. **Initialize environment file:**
   - **Windows:** `if (-not (Test-Path .env)) { copy .env.example .env }`
   - **Linux / macOS:** `cp -n .env.example .env`

4. **Run the telemetry agent:**
   ```bash
   python main.py
   ```
   *Dispatches live telemetry payloads to `http://localhost:8000/api/sensor-data` every 30 seconds.*

#### Mode B: Physical Raspberry Pi Deployment
When mounting on a field station with DHT22, MCP3008 capacitive soil probe, and Raspberry Pi Camera:

```bash
cd iot-node
pip3 install -r requirements.txt
cp .env.example .env
python3 main.py
```

---

## 3. Quick Verification via cURL

### 1. Test Regenerative Crop Advisory
Computes optimal companion intercropping, projected water conservation %, and biological soil remediation:

```bash
curl -X POST http://localhost:8000/api/agri/regenerative-recommendation ^
  -H "Content-Type: application/json" ^
  -d "{\"nitrogen\": 180, \"phosphorus\": 24, \"potassium\": 210, \"ph\": 6.8, \"moisture\": 45, \"state_code\": \"MH\", \"season\": \"Kharif\", \"water_availability\": \"medium\"}"
```

*(On Linux / macOS bash, replace `^` with `\`)*

### 2. Test Satellite Earth Observation & Climate Forecast
Retrieves Sentinel-2 NDVI canopy vigor, NDWI moisture stress, and 7-day IMD-modeled weather bulletin:

```bash
curl http://localhost:8000/api/agri/satellite-weather?lat=19.9975&lon=73.7898
```

### 3. Test Crop Disease Scanner (JSON Mode)
```bash
curl -X POST http://localhost:8000/api/agri/diagnose-json ^
  -H "Content-Type: application/json" ^
  -d "{\"crop_hint\": \"Rice\"}"
```

### 4. Test Inter-State DPG Federation
```bash
curl http://localhost:8000/api/agri/dpg/states
curl http://localhost:8000/api/agri/dpg/export-schema
```

---

## 4. Troubleshooting & FAQ

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `'docker' is not recognized as the name of a cmdlet` | Docker Desktop is not installed on Windows host | Use the native Windows MongoDB service. Run `net start MongoDB` or verify port `27017` in Services (`services.msc`). |
| `ModuleNotFoundError: No module named 'cv2'` | OpenCV not installed in the active Python environment | Run `pip install opencv-python-headless`. `agri_ai.py` also features graceful fallback if cv2 is absent. |
| `Error: It looks like you're trying to use tailwindcss directly as a PostCSS plugin` | Tailwind CSS v4 was installed in a Create React App project | React Scripts requires Tailwind v3. Run: `npm install tailwindcss@^3.4.0 --save-dev --legacy-peer-deps`. |
| `ConnectionFailure: [Errno 111] Connection refused` | MongoDB daemon is offline | Start MongoDB on `localhost:27017` before running `uvicorn`. |
| Port `8000` or `3000` is already in use | Stale process running in the background | Windows: `Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess \| Stop-Process -Force`. Linux/macOS: `kill -9 $(lsof -t -i:8000)`. |
| Header badge shows "Offline Mode" | Browser WebSocket client cannot reach socket.io endpoint | The REST API handles all interactive features, advisories, and model exports normally. Live telemetry continues to poll via REST. |
