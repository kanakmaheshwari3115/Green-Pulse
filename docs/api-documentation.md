# GreenPulse API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
Currently, the API does not require authentication. In production, implement API keys or JWT tokens.

## Response Format
All responses are in JSON format. Error responses include:
```json
{
  "detail": "Error message"
}
```

## Parks Management

### Create Park
```http
POST /api/parks
Content-Type: application/json

{
  "park_id": "park_001",
  "name": "Central Park",
  "location": {"lat": 28.1234, "lon": 77.4567},
  "area": 10000,
  "tree_count": 150,
  "description": "Main city park"
}
```

### Get All Parks
```http
GET /api/parks
```

**Response:**
```json
[
  {
    "park_id": "park_001",
    "name": "Central Park",
    "location": {"lat": 28.1234, "lon": 77.4567},
    "area": 10000,
    "tree_count": 150,
    "description": "Main city park",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Park by ID
```http
GET /api/parks/{park_id}
```

### Update Park
```http
PUT /api/parks/{park_id}
Content-Type: application/json

{
  "name": "Updated Park Name",
  "tree_count": 200
}
```

### Delete Park
```http
DELETE /api/parks/{park_id}
```

## Sensor Data

### Ingest Sensor Data
```http
POST /api/sensor-data
Content-Type: application/json

{
  "node_id": "node_001",
  "park_id": "park_001",
  "location": {"lat": 28.1234, "lon": 77.4567},
  "readings": [
    {
      "sensor_type": "temperature",
      "value": 25.5,
      "unit": "°C",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    {
      "sensor_type": "humidity",
      "value": 65.0,
      "unit": "%",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Latest Sensor Data
```http
GET /api/parks/{park_id}/sensors/latest?sensor_type=temperature&hours=24
```

**Query Parameters:**
- `sensor_type` (optional): Filter by sensor type
- `hours` (optional): Time window in hours (default: 24)

### Get Real-time Sensor Data
```http
GET /api/parks/{park_id}/sensors/realtime
```

**Response:**
```json
{
  "park_id": "park_001",
  "realtime_data": [
    {
      "sensor_type": "temperature",
      "value": 25.5,
      "unit": "°C",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Get Sensor Statistics
```http
GET /api/parks/{park_id}/sensors/statistics?days=7
```

## Image Data

### Ingest Image Data
```http
POST /api/image-data
Content-Type: application/json

{
  "node_id": "node_001",
  "park_id": "park_001",
  "image_path": "/images/vegetation_001.jpg",
  "image_type": "vegetation",
  "analysis_results": {
    "vegetation_health": 0.85,
    "green_coverage": 0.75
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Health Scores

### Get Park Health
```http
GET /api/parks/{park_id}/health?days=30
```

**Response:**
```json
{
  "park_id": "park_001",
  "current_score": {
    "park_id": "park_001",
    "overall_score": 8.2,
    "tree_health_score": 8.5,
    "microclimate_score": 7.8,
    "soil_water_score": 8.0,
    "biodiversity_score": 7.5,
    "infrastructure_score": 9.0,
    "factors": {},
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "historical_scores": [],
  "trend": "improving",
  "recommendations": [
    "Tree health is good - maintain current practices"
  ]
}
```

### Get Current Health Score
```http
GET /api/parks/{park_id}/health/current
```

## Analytics

### Get Sensor Trends
```http
GET /api/analytics/parks/{park_id}/sensor-trends?days=7
```

**Response:**
```json
{
  "park_id": "park_001",
  "period_days": 7,
  "trends": {
    "temperature": {
      "unit": "°C",
      "data": [
        {
          "date": "2024-01-01",
          "average": 25.5,
          "minimum": 20.0,
          "maximum": 30.0,
          "count": 144
        }
      ]
    }
  }
}
```

### Get Health Trends
```http
GET /api/analytics/parks/{park_id}/health-trends?days=30
```

### Compare Parks
```http
GET /api/analytics/parks/compare?park_ids=park_001&park_ids=park_002&metric=overall_score&days=30
```

### Get Dashboard Overview
```http
GET /api/analytics/dashboard/overview
```

**Response:**
```json
{
  "total_parks": 5,
  "active_nodes": 8,
  "average_health_score": 7.8,
  "parks_with_data": 5,
  "active_node_ids": ["node_001", "node_002"]
}
```

### Get Alerts
```http
GET /api/analytics/alerts?park_id=park_001&severity=high&hours=24
```

### Get Heatmap Data
```http
GET /api/analytics/parks/{park_id}/heatmap-data?sensor_type=temperature&hours=1
```

## System Health

### API Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "greenpulse-api"
}
```

### Node Heartbeat
```http
POST /api/heartbeat
Content-Type: application/json

{
  "node_id": "node_001",
  "park_id": "park_001",
  "status": "active",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Node Status
```http
GET /api/nodes/status?hours=1
```

**Response:**
```json
{
  "nodes": [
    {
      "node_id": "node_001",
      "park_id": "park_001",
      "status": "online",
      "last_heartbeat": "2024-01-01T12:00:00Z",
      "heartbeat_count": 60
    }
  ],
  "total_nodes": 1
}
```

## WebSocket Connections

### General WebSocket
```
ws://localhost:8000/ws/{client_id}
```

### Park-specific WebSocket
```
ws://localhost:8000/ws/park/{park_id}
```

**WebSocket Messages:**

**Subscribe to Park Updates:**
```json
{
  "type": "subscribe_park",
  "park_id": "park_001"
}
```

**Sensor Update Message:**
```json
{
  "type": "sensor_update",
  "timestamp": "2024-01-01T12:00:00Z",
  "park_id": "park_001",
  "data": {
    "node_id": "node_001",
    "readings": [...]
  }
}
```

**Health Update Message:**
```json
{
  "type": "health_update",
  "timestamp": "2024-01-01T12:00:00Z",
  "park_id": "park_001",
  "data": {
    "overall_score": 8.2,
    "tree_health_score": 8.5
  }
}
```

**Alert Message:**
```json
{
  "type": "alert",
  "timestamp": "2024-01-01T12:00:00Z",
  "park_id": "park_001",
  "data": {
    "alert_id": "alert_001",
    "severity": "high",
    "message": "Temperature above optimal range"
  }
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing:
- 100 requests per minute per IP
- 1000 requests per minute per API key

## Data Models

### Sensor Types
- `temperature`: Temperature in Celsius
- `humidity`: Relative humidity in percentage
- `soil_moisture`: Soil moisture in percentage
- `light_intensity`: Light intensity in lux
- `ph`: pH level
- `turbidity`: Water turbidity in NTU

### Health Score Components
- `tree_health_score`: Tree and vegetation health (0-10)
- `microclimate_score`: Temperature and humidity conditions (0-10)
- `soil_water_score`: Soil and water quality (0-10)
- `biodiversity_score`: Biodiversity indicator (0-10)
- `infrastructure_score`: Infrastructure condition (0-10)

### Alert Severity Levels
- `low`: Minor issues
- `medium`: Attention required
- `high`: Immediate attention needed
- `critical`: Emergency situation

## Example Usage

### Python Example
```python
import requests

# Get all parks
response = requests.get('http://localhost:8000/api/parks')
parks = response.json()

# Send sensor data
sensor_data = {
    "node_id": "node_001",
    "park_id": "park_001",
    "readings": [
        {"sensor_type": "temperature", "value": 25.5, "unit": "°C"}
    ]
}
response = requests.post('http://localhost:8000/api/sensor-data', json=sensor_data)
```

### JavaScript Example
```javascript
// Get park health
fetch('http://localhost:8000/api/parks/park_001/health')
  .then(response => response.json())
  .then(data => console.log(data));

// WebSocket connection
const ws = new WebSocket('ws://localhost:8000/ws/dashboard_001');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```
