# GreenPulse Technical Specifications

## Overview

This document provides comprehensive technical specifications for the GreenPulse ecological intelligence system, including detailed requirements, interfaces, data models, and performance characteristics.

## System Requirements

### Functional Requirements

#### FR-001: Park Management
- The system shall allow administrators to create, update, and delete park records
- Each park shall include: unique ID, name, geographic coordinates, area, tree count
- The system shall validate geographic coordinates within valid ranges
- The system shall prevent duplicate park IDs

#### FR-002: Sensor Data Collection
- The system shall accept sensor data from IoT nodes via REST API
- Supported sensor types: temperature, humidity, soil moisture, light intensity, pH, turbidity
- Each sensor reading shall include: sensor type, value, unit, timestamp
- The system shall validate sensor value ranges and reject invalid data
- The system shall store sensor data with node ID, park ID, and location metadata

#### FR-003: Health Score Calculation
- The system shall calculate a Green Space Health Index (GSHI) ranging from 0-10
- Health score components: tree health (30%), microclimate (25%), soil/water (20%), biodiversity (15%), infrastructure (10%)
- The system shall update health scores in real-time based on incoming sensor data
- The system shall provide historical health score trends and analysis

#### FR-004: Image Analysis
- The system shall accept and process images from IoT node cameras
- Image analysis types: vegetation health, infrastructure condition, biodiversity assessment
- The system shall extract numerical metrics from image analysis
- The system shall store image analysis results with metadata

#### FR-005: Real-time Monitoring
- The system shall provide WebSocket connections for real-time data updates
- The system shall broadcast sensor updates to subscribed clients
- The system shall broadcast health score updates to subscribed clients
- The system shall broadcast alerts to subscribed clients

#### FR-006: Analytics and Reporting
- The system shall provide historical data analysis capabilities
- The system shall generate trend reports for sensor data and health scores
- The system shall support park comparison analytics
- The system shall provide data export functionality

#### FR-007: Alert System
- The system shall generate alerts for anomalous sensor readings
- The system shall generate alerts for declining health scores
- The system shall support multiple alert severity levels
- The system shall provide alert notification mechanisms

#### FR-008: IoT Node Management
- The system shall register and manage IoT nodes
- The system shall monitor node connectivity status
- The system shall support node configuration updates
- The system shall provide node health monitoring

### Non-Functional Requirements

#### NFR-001: Performance
- API response time: <200ms for 95th percentile
- WebSocket message latency: <100ms
- Database query time: <500ms for standard queries
- System shall support 100 concurrent API connections
- System shall support 50 concurrent WebSocket connections

#### NFR-002: Availability
- System uptime: ≥99.5%
- Planned maintenance window: ≤4 hours per month
- Recovery time objective (RTO): 1 hour for critical systems
- Recovery point objective (RPO): 15 minutes for data loss

#### NFR-003: Scalability
- System shall support 1000 IoT nodes
- System shall handle 10,000 sensor readings per hour
- System shall store 1 year of historical data
- System shall support horizontal scaling of API servers

#### NFR-004: Security
- All API communications shall use HTTPS
- System shall implement API authentication
- System shall validate and sanitize all input data
- System shall implement rate limiting for API endpoints

#### NFR-005: Data Management
- System shall retain raw sensor data for 30 days
- System shall retain aggregated data for 1 year
- System shall implement automated backup procedures
- System shall provide data export in standard formats

## Technical Architecture

### System Components

#### API Layer
```python
# FastAPI Application Structure
app/
├── main.py                 # Application entry point
├── api/
│   ├── __init__.py
│   ├── sensor_data.py      # Sensor data endpoints
│   ├── parks.py           # Park management endpoints
│   ├── analytics.py       # Analytics endpoints
│   ├── websocket.py       # WebSocket handlers
│   └── heartbeat.py       # Node heartbeat endpoints
├── models.py              # Pydantic data models
├── database.py            # MongoDB connection management
├── scoring.py             # Health score algorithms
└── data_aggregation.py    # Background processing
```

#### Database Schema
```javascript
// Parks Collection
{
  _id: ObjectId,
  park_id: String (unique),
  name: String,
  location: {
    lat: Number,
    lon: Number
  },
  area: Number,
  tree_count: Number,
  description: String,
  created_at: ISODate,
  updated_at: ISODate
}

// Sensor Data Collection
{
  _id: ObjectId,
  node_id: String,
  park_id: String,
  location: {
    lat: Number,
    lon: Number
  },
  readings: [
    {
      sensor_type: String,
      value: Number,
      unit: String,
      timestamp: ISODate
    }
  ],
  timestamp: ISODate
}

// Health Scores Collection
{
  _id: ObjectId,
  park_id: String,
  overall_score: Number,
  tree_health_score: Number,
  microclimate_score: Number,
  soil_water_score: Number,
  biodiversity_score: Number,
  infrastructure_score: Number,
  factors: Object,
  timestamp: ISODate
}
```

### Data Models

#### Sensor Data Model
```python
class SensorReading(BaseModel):
    sensor_type: SensorType
    value: float
    unit: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SensorData(BaseModel):
    node_id: str
    park_id: str
    readings: List[SensorReading]
    location: Optional[Dict[str, float]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

#### Health Score Model
```python
class HealthScore(BaseModel):
    park_id: str
    overall_score: float = Field(ge=0, le=10)
    tree_health_score: float = Field(ge=0, le=10)
    microclimate_score: float = Field(ge=0, le=10)
    soil_water_score: float = Field(ge=0, le=10)
    biodiversity_score: float = Field(ge=0, le=10)
    infrastructure_score: float = Field(ge=0, le=10)
    factors: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

## API Specifications

### REST Endpoints

#### Parks Management
```http
POST   /api/parks              # Create park
GET    /api/parks              # List all parks
GET    /api/parks/{park_id}    # Get park details
PUT    /api/parks/{park_id}    # Update park
DELETE /api/parks/{park_id}    # Delete park
```

#### Sensor Data
```http
POST   /api/sensor-data                    # Ingest sensor data
GET    /api/parks/{park_id}/sensors/latest # Get latest readings
GET    /api/parks/{park_id}/sensors/realtime # Get real-time data
GET    /api/parks/{park_id}/sensors/statistics # Get statistics
```

#### Health Scores
```http
GET    /api/parks/{park_id}/health          # Get park health
GET    /api/parks/{park_id}/health/current  # Get current score
```

#### Analytics
```http
GET    /api/analytics/dashboard/overview      # Dashboard overview
GET    /api/analytics/parks/{park_id}/trends # Park trends
GET    /api/analytics/parks/compare           # Compare parks
GET    /api/analytics/alerts                  # Get alerts
```

#### System Management
```http
GET    /health                                # Health check
POST   /api/heartbeat                        # Node heartbeat
GET    /api/nodes/status                      # Node status
```

### WebSocket Endpoints

#### General Connection
```
ws://localhost:8000/ws/{client_id}
```

#### Park-specific Connection
```
ws://localhost:8000/ws/park/{park_id}
```

#### Message Types
```json
{
  "type": "sensor_update|health_update|alert",
  "timestamp": "ISO8601",
  "park_id": "string",
  "data": "object"
}
```

## IoT Node Specifications

### Hardware Requirements

#### Minimum Specifications
- **Processor**: Raspberry Pi 4 (Cortex-A72, 1.5GHz)
- **Memory**: 2GB RAM
- **Storage**: 32GB microSD card (Class 10)
- **Connectivity**: WiFi 802.11ac, Ethernet Gigabit
- **Power**: 5V/3A USB-C power supply

#### Sensor Specifications
```yaml
temperature_sensor:
  model: DHT22
  accuracy: ±0.5°C
  range: -40 to 80°C
  interface: GPIO (1-wire)

humidity_sensor:
  model: DHT22
  accuracy: ±2% RH
  range: 0 to 100% RH
  interface: GPIO (1-wire)

soil_moisture_sensor:
  type: Capacitive
  accuracy: ±3%
  range: 0 to 100%
  interface: ADC

light_sensor:
  type: LDR
  range: 0 to 100k lux
  interface: ADC

camera:
  model: Raspberry Pi Camera Module v2
  resolution: 3280x2464
  interface: CSI-2
```

### Software Requirements

#### Operating System
- **Distribution**: Raspberry Pi OS (Debian-based)
- **Kernel**: Linux 5.4+
- **Python**: 3.9+

#### Dependencies
```python
# Core dependencies
fastapi==0.104.1
requests==2.31.0
python-dotenv==1.0.0
schedule==1.2.0

# Hardware dependencies
RPi.GPIO==0.7.1
adafruit-circuitpython-dht==3.7.9
picamera==0.13.13

# Computer vision
opencv-python==4.8.1.78
numpy==1.24.3
pillow==10.1.0
```

### Node Configuration

#### Environment Variables
```bash
# API Configuration
API_BASE_URL=https://api.greenpulse.com
NODE_ID=node_001
PARK_ID=park_001

# Location Configuration
LOCATION_LAT=28.6139
LOCATION_LON=77.2090

# Timing Configuration
SENSOR_READ_INTERVAL=30      # seconds
IMAGE_CAPTURE_INTERVAL=300   # seconds
HEARTBEAT_INTERVAL=60        # seconds

# Hardware Configuration
DHT_PIN=4
SOIL_MOISTURE_PIN=0
LIGHT_SENSOR_PIN=1
CAMERA_RESOLUTION=1296x972
```

## Performance Specifications

### Response Time Requirements

#### API Endpoints
| Endpoint | 95th Percentile | 99th Percentile |
|----------|------------------|------------------|
| GET /health | 50ms | 100ms |
| GET /api/parks | 100ms | 200ms |
| POST /api/sensor-data | 150ms | 300ms |
| GET /api/parks/{id}/health | 200ms | 400ms |
| GET /api/analytics/* | 300ms | 600ms |

#### Database Queries
| Query Type | Average Time | Max Time |
|------------|--------------|-----------|
| Single document lookup | 10ms | 50ms |
| Indexed range query | 50ms | 200ms |
| Aggregation pipeline | 100ms | 500ms |
| Complex analytics | 300ms | 1000ms |

### Throughput Requirements

#### API Throughput
- **Concurrent connections**: 100
- **Requests per second**: 500
- **Peak load**: 1000 RPS for 5 minutes

#### Data Volume
- **Sensor readings per hour**: 10,000
- **Images per hour**: 100
- **Database writes per hour**: 10,100
- **Database reads per hour**: 50,000

### Storage Requirements

#### Data Retention
| Data Type | Retention Period | Storage per Day |
|-----------|------------------|----------------|
| Raw sensor data | 30 days | 100MB |
| Aggregated data | 1 year | 10MB |
| Images | 90 days | 500MB |
| Health scores | 1 year | 5MB |

#### Total Storage Estimates
- **Monthly storage**: 18GB
- **Annual storage**: 200GB
- **Backup storage**: 400GB (2x redundancy)

## Security Specifications

### Authentication and Authorization

#### API Authentication
```python
# JWT Token Structure
{
  "sub": "user_id",
  "role": "admin|operator|viewer",
  "park_access": ["park_001", "park_002"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

#### Role-Based Access Control
| Role | Permissions |
|------|-------------|
| Admin | Full system access |
| Operator | Park management, sensor data |
| Viewer | Read-only access |
| System | Automated processes only |

### Data Security

#### Encryption Requirements
- **In transit**: TLS 1.3
- **At rest**: MongoDB encryption
- **API keys**: AES-256 encryption

#### Input Validation
```python
# Sensor Data Validation
def validate_sensor_reading(reading):
    if reading.sensor_type not in VALID_SENSOR_TYPES:
        raise ValueError("Invalid sensor type")
    
    if not is_valid_range(reading.value, reading.sensor_type):
        raise ValueError("Value out of range")
    
    if reading.unit != get_expected_unit(reading.sensor_type):
        raise ValueError("Invalid unit")
```

### Network Security

#### Firewall Configuration
```bash
# Allowed ports
80/tcp    # HTTP (redirect to HTTPS)
443/tcp   # HTTPS
8000/tcp  # API (internal only)
27017/tcp # MongoDB (internal only)
```

#### Rate Limiting
| Endpoint | Rate Limit | Burst |
|----------|-------------|-------|
| POST /api/sensor-data | 100/minute | 200 |
| GET /api/parks | 1000/minute | 2000 |
| WebSocket connections | 50/minute | 100 |

## Integration Specifications

### External System Interfaces

#### Weather API Integration
```python
# Weather data enrichment
async def enrich_with_weather(park_location):
    weather_api_key = os.getenv("WEATHER_API_KEY")
    url = f"https://api.weather.com/v1/weather?lat={park_location.lat}&lon={park_location.lon}"
    
    async with httpx.Client() as client:
        response = await client.get(url, headers={"X-API-Key": weather_api_key})
        return response.json()
```

#### GIS Integration
```python
# Geographic information system
def get_park_boundary(park_id):
    gis_api_url = f"https://gis.city.gov/api/parks/{park_id}/boundary"
    response = requests.get(gis_api_url)
    return response.json()
```

### Data Exchange Formats

#### Sensor Data Format
```json
{
  "node_id": "node_001",
  "park_id": "park_001",
  "location": {
    "lat": 28.6139,
    "lon": 77.2090
  },
  "readings": [
    {
      "sensor_type": "temperature",
      "value": 25.5,
      "unit": "°C",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z",
  "metadata": {
    "firmware_version": "1.0.0",
    "battery_level": 85,
    "signal_strength": -45
  }
}
```

#### Health Score Format
```json
{
  "park_id": "park_001",
  "overall_score": 8.2,
  "components": {
    "tree_health": 8.5,
    "microclimate": 7.8,
    "soil_water": 8.0,
    "biodiversity": 7.5,
    "infrastructure": 9.0
  },
  "factors": {
    "weights": {
      "tree_health": 0.30,
      "microclimate": 0.25,
      "soil_water": 0.20,
      "biodiversity": 0.15,
      "infrastructure": 0.10
    }
  },
  "trend": "improving",
  "recommendations": [
    "Tree health is excellent - maintain current practices"
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Testing Specifications

### Unit Testing Requirements

#### Coverage Requirements
- **Backend code coverage**: ≥80%
- **Frontend code coverage**: ≥75%
- **IoT node code coverage**: ≥70%

#### Test Categories
```python
# Backend test structure
tests/
├── unit/
│   ├── test_api.py
│   ├── test_scoring.py
│   └── test_database.py
├── integration/
│   ├── test_endpoints.py
│   └── test_workflows.py
└── performance/
    ├── test_load.py
    └── test_stress.py
```

### Integration Testing

#### API Integration Tests
```python
@pytest.mark.asyncio
async def test_sensor_data_workflow():
    # Create test park
    park_response = await client.post("/api/parks", json=test_park)
    assert park_response.status_code == 200
    
    # Send sensor data
    sensor_response = await client.post("/api/sensor-data", json=test_sensor_data)
    assert sensor_response.status_code == 200
    
    # Verify health score calculation
    health_response = await client.get("/api/parks/test_park/health/current")
    assert health_response.status_code == 200
    assert "overall_score" in health_response.json()
```

### Performance Testing

#### Load Testing Scenarios
- **Normal load**: 100 concurrent users, 100 RPS
- **Peak load**: 500 concurrent users, 500 RPS
- **Stress test**: 1000 concurrent users, 1000 RPS

#### Performance Metrics
| Metric | Target | Threshold |
|--------|--------|-----------|
| Response time (95th) | <200ms | <500ms |
| Error rate | <0.1% | <1% |
| CPU utilization | <70% | <90% |
| Memory usage | <80% | <95% |

## Deployment Specifications

### Environment Requirements

#### Development Environment
```yaml
services:
  mongodb:
    image: mongo:5.0
    ports: ["27017:27017"]
  
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - ENVIRONMENT=development
  
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
```

#### Production Environment
```yaml
services:
  load_balancer:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
  
  backend:
    image: greenpulse/api:latest
    replicas: 3
    environment:
      - ENVIRONMENT=production
  
  mongodb:
    image: mongo:5.0
    replicas: 3
    config: replica-set
```

### Monitoring Specifications

#### Metrics Collection
```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, Gauge

api_requests_total = Counter('api_requests_total', 'Total API requests')
api_request_duration = Histogram('api_request_duration_seconds', 'API request duration')
active_connections = Gauge('active_connections', 'Active WebSocket connections')
```

#### Health Checks
```python
# Health check endpoints
@app.get("/health")
async def health_check():
    checks = {
        "database": await check_database(),
        "redis": await check_redis(),
        "disk_space": check_disk_space(),
        "memory": check_memory()
    }
    
    status = "healthy" if all(checks.values()) else "unhealthy"
    return {"status": status, "checks": checks}
```

This comprehensive technical specifications document provides detailed requirements and specifications for all aspects of the GreenPulse system, ensuring clarity for development, testing, and deployment teams.
