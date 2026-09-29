# GreenPulse Technical Architecture Documentation

## Executive Summary

GreenPulse is a comprehensive ecological intelligence system designed for monitoring urban green spaces through IoT sensors, computer vision, and AI-driven analytics. This document provides detailed technical explanations of system architecture, data flows, and operational workflows.

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IoT Nodes     │───▶│   Backend API   │───▶│   Frontend      │
│  (Raspberry Pi) │    │  (FastAPI)      │    │  (React)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Sensors       │    │   MongoDB       │    │   WebSocket     │
│   + Camera      │    │   Database      │    │   Connections   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Interactions
1. **IoT Nodes** collect environmental data and transmit to Backend API
2. **Backend API** processes data, calculates scores, stores in MongoDB
3. **Frontend** consumes API data via REST and WebSocket connections
4. **WebSocket** provides real-time updates to connected clients

## Backend Architecture

### Core Components

#### 1. API Layer (FastAPI)
```python
# Main application structure
app/
├── main.py              # Application entry point
├── api/
│   ├── sensor_data.py   # Sensor data endpoints
│   ├── parks.py         # Park management
│   ├── analytics.py     # Analytics endpoints
│   ├── websocket.py     # WebSocket handlers
│   └── heartbeat.py     # Node heartbeat
├── models.py            # Pydantic data models
├── database.py          # MongoDB connection
├── scoring.py           # AI scoring algorithms
└── data_aggregation.py  # Background processing
```

**Key Design Patterns:**
- **AsyncIO**: Non-blocking I/O for high concurrency
- **Dependency Injection**: Clean component separation
- **Pydantic Models**: Type-safe data validation
- **Background Tasks**: Async processing for scoring

#### 2. Database Layer (MongoDB)

**Collection Schema:**
```javascript
// Parks Collection
{
  _id: "park_001",
  park_id: "park_001",
  name: "Central Park",
  location: {lat: 28.6139, lon: 77.2090},
  area: 25000,
  tree_count: 500,
  created_at: ISODate,
  updated_at: ISODate
}

// Sensor Data Collection
{
  _id: "node_001_park_001_2024-01-01T12:00:00Z",
  node_id: "node_001",
  park_id: "park_001",
  location: {lat: 28.6139, lon: 77.2090},
  readings: [
    {
      sensor_type: "temperature",
      value: 25.5,
      unit: "°C",
      timestamp: ISODate
    }
  ],
  timestamp: ISODate
}

// Health Scores Collection
{
  _id: "park_001_2024-01-01",
  park_id: "park_001",
  overall_score: 8.2, # Main Indexing
  tree_health_score: 8.5,
  microclimate_score: 7.8,
  soil_water_score: 8.0, # When using pH sensor in future..
  biodiversity_score: 7.5, 
  infrastructure_score: 9.0,
  factors: {...},
  timestamp: ISODate
}
```

**Indexing Strategy:**
```javascript
// Performance-critical indexes
db.sensor_data.createIndex({"park_id": 1, "timestamp": -1})
db.sensor_data.createIndex({"node_id": 1, "timestamp": -1})
db.parks.createIndex({"park_id": 1}, {unique: true})
db.health_scores.createIndex({"park_id": 1, "timestamp": -1})
```

#### 3. AI Scoring Engine

**Scoring Algorithm Architecture:**
```python
class EcologicalScorer:
    def __init__(self):
        self.optimal_ranges = {
            SensorType.TEMPERATURE: {"min": 20, "max": 30},
            SensorType.HUMIDITY: {"min": 40, "max": 70},
            SensorType.SOIL_MOISTURE: {"min": 30, "max": 60},
            SensorType.LIGHT_INTENSITY: {"min": 20000, "max": 50000}
        }
        
        self.score_weights = {
            "tree_health": 0.30,
            "microclimate": 0.25,
            "soil_water": 0.20,
            "biodiversity": 0.15,
            "infrastructure": 0.10
        }
```

**Score Calculation Workflow:**
1. **Data Normalization**: Convert raw sensor values to 0-10 scale
2. **Component Scoring**: Calculate individual metric scores
3. **Weighted Aggregation**: Apply weights to compute overall score
4. **Trend Analysis**: Compare with historical data
5. **Recommendation Generation**: Provide actionable insights

#### 4. WebSocket Infrastructure

**Connection Management:**
```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.park_subscribers: Dict[str, List[WebSocket]] = {}
    
    async def broadcast_to_park_subscribers(self, park_id: str, message: dict):
        # Real-time updates to subscribed clients
```

**Message Types:**
- `sensor_update`: New sensor readings
- `health_update`: Updated health scores
- `alert`: System alerts and notifications

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── Dashboard.tsx      # Main dashboard
│   ├── ParkDetail.tsx    # Park-specific view
│   └── Header.tsx         # Navigation
├── services/
│   ├── api.ts            # API client
│   └── websocket.ts      # WebSocket client
├── types/
│   └── index.ts          # TypeScript definitions
└── App.tsx               # Application root
```

### State Management Strategy
- **React Hooks**: Local component state
- **Context API**: Global application state
- **WebSocket Integration**: Real-time data updates
- **API Client**: Centralized data fetching

### Data Flow Patterns
```typescript
// Real-time data flow
WebSocket Message → Custom Event → React State Update → UI Re-render

// API data flow
Component Mount → API Call → Data Processing → State Update → UI Render
```

## IoT Node Architecture

### Hardware Configuration
```
Raspberry Pi 4
├── DHT22 (GPIO 4)          - Temperature/Humidity
├── Soil Moisture (ADC)     - Soil moisture levels
├── LDR (ADC)               - Light intensity
└── Pi Camera               - Visual data capture
```

### Software Architecture
```python
# Core modules
iot-node/
├── main.py              # Application orchestrator
├── sensors.py           # Sensor interface layer
├── camera.py           # Computer vision processing
├── data_sender.py      # API communication
└── requirements.txt    # Dependencies
```

### Sensor Data Pipeline
```python
# Data collection workflow
1. Sensor Reading → Raw Value
2. Calibration → Physical Unit (°C, %, lux)
3. Validation → Range Checking
4. Packaging → JSON Format
5. Transmission → HTTP POST to API
6. Confirmation → Success/Failure Handling
7. Retry Logic → Failed Data Buffering
```

### Computer Vision Pipeline
```python
# Image processing workflow
1. Image Capture → Pi Camera
2. Preprocessing → Resize/Normalize
3. Analysis → OpenCV Processing
   - Vegetation Health → Color Analysis
   - Infrastructure → Edge Detection
   - Biodiversity → Color Distribution
4. Feature Extraction → Numerical Metrics
5. Transmission → API with Analysis Results
```

## Data Flow Architecture

### 1. Sensor Data Ingestion Flow
```
IoT Node → HTTP POST → API Validation → MongoDB Storage → 
Background Scoring → WebSocket Broadcast → Frontend Update
```

**Detailed Steps:**
1. **Data Collection**: Sensors read environmental parameters
2. **Data Packaging**: JSON format with metadata
3. **API Transmission**: HTTP POST to `/api/sensor-data`
4. **Validation**: Pydantic model validation
5. **Storage**: MongoDB with indexed collections
6. **Processing**: Background task for health scoring
7. **Broadcast**: Real-time WebSocket updates
8. **Frontend**: React components update via subscriptions

### 2. Health Score Calculation Flow
```
Sensor Data + Image Data → Feature Extraction → 
Component Scoring → Weighted Aggregation → 
Health Score → Trend Analysis → Recommendations
```

**Algorithm Details:**
```python
# Component score calculation
def calculate_sensor_score(sensor_type, value):
    optimal_range = self.optimal_ranges[sensor_type]
    if optimal_range["min"] <= value <= optimal_range["max"]:
        return 10.0
    elif value < optimal_range["min"]:
        distance = optimal_range["min"] - value
        return max(0, 10.0 - (distance / optimal_range["min"]) * 10)
    else:
        distance = value - optimal_range["max"]
        return max(0, 10.0 - (distance / optimal_range["max"]) * 10)

# Overall score aggregation
overall_score = (
    tree_health * 0.30 +
    microclimate * 0.25 +
    soil_water * 0.20 +
    biodiversity * 0.15 +
    infrastructure * 0.10
)
```

### 3. Real-time Update Flow
```
API Event → WebSocket Manager → Client Subscription → 
Message Broadcasting → Frontend Event Handler → UI Update
```

## Performance Optimization

### Database Optimization
1. **Indexing Strategy**
   - Compound indexes for common queries
   - Time-series indexes for temporal data
   - Sparse indexes for optional fields

2. **Query Optimization**
   - Projection to limit returned fields
   - Aggregation pipelines for analytics
   - Pagination for large datasets

3. **Data Management**
   - TTL indexes for automatic cleanup
   - Data aggregation for historical storage
   - Compression for large documents

### API Performance
1. **Async Processing**
   - Non-blocking I/O operations
   - Background task processing
   - Connection pooling

2. **Caching Strategy**
   - In-memory caching for frequent queries
   - HTTP caching headers
   - WebSocket for real-time data

3. **Rate Limiting**
   - Request throttling
   - Connection limits
   - Resource allocation

### Frontend Optimization
1. **Component Optimization**
   - React.memo for component memoization
   - useMemo for expensive calculations
   - useCallback for function references

2. **Data Management**
   - Lazy loading for large datasets
   - Virtual scrolling for long lists
   - Debounced API calls

3. **Bundle Optimization**
   - Code splitting by route
   - Tree shaking for unused code
   - Asset optimization

## Security Architecture

### API Security
1. **Input Validation**
   - Pydantic model validation
   - SQL injection prevention
   - XSS protection

2. **Authentication/Authorization**
   - API key management
   - JWT token validation
   - Role-based access control

3. **Network Security**
   - HTTPS enforcement
   - CORS configuration
   - Rate limiting

### IoT Node Security
1. **Device Security**
   - SSH key authentication
   - Firewall configuration
   - Regular security updates

2. **Data Security**
   - Encrypted data transmission
   - Certificate validation
   - Secure API endpoints

3. **Network Security**
   - VPN connectivity
   - Network segmentation
   - Monitoring and logging

## Monitoring and Observability

### Logging Strategy
```python
# Structured logging format
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "service": "greenpulse-api",
  "component": "sensor_data",
  "message": "Sensor data processed",
  "park_id": "park_001",
  "node_id": "node_001",
  "processing_time_ms": 150
}
```

### Metrics Collection
1. **Application Metrics**
   - Request latency
   - Error rates
   - Active connections

2. **Business Metrics**
   - Parks monitored
   - Nodes active
   - Data points collected

3. **Infrastructure Metrics**
   - CPU/Memory usage
   - Database performance
   - Network latency

### Alerting Strategy
1. **System Alerts**
   - Service downtime
   - High error rates
   - Resource exhaustion

2. **Business Alerts**
   - Node offline
   - Anomalous readings
   - Health score decline

## Deployment Architecture

### Production Deployment
```
Load Balancer (nginx)
├── API Server 1 (FastAPI)
├── API Server 2 (FastAPI)
└── Static Files (React)
         │
         ▼
MongoDB Replica Set
├── Primary Node
├── Secondary Node 1
└── Secondary Node 2
```

### Container Strategy
```dockerfile
# Multi-stage build
FROM python:3.9-slim as backend
FROM node:16-alpine as frontend
FROM nginx:alpine as production
```

### Environment Configuration
```bash
# Production environment variables
MONGODB_URL=mongodb://replica-set/production
SECRET_KEY=production-secret-key
ENVIRONMENT=production
LOG_LEVEL=INFO
```

## Scaling Strategy

### Horizontal Scaling
1. **API Layer**
   - Load balancer distribution
   - Stateless application design
   - Session affinity management

2. **Database Layer**
   - MongoDB replica sets
   - Read preference configuration
   - Sharding for large datasets

3. **IoT Layer**
   - Fleet management system
   - Over-the-air updates
   - Centralized monitoring

### Vertical Scaling
1. **Resource Allocation**
   - CPU scaling for API processing
   - Memory scaling for caching
   - Storage scaling for data retention

2. **Performance Tuning**
   - Database query optimization
   - Application code profiling
   - Infrastructure monitoring

## Disaster Recovery

### Backup Strategy
1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - Cross-region replication

2. **Application Backups**
   - Configuration backups
   - Code repository snapshots
   - Asset versioning

### Recovery Procedures
1. **Failover Process**
   - Automatic failover detection
   - Manual override capabilities
   - Service restoration steps

2. **Data Recovery**
   - Database restoration
   - Data validation
   - Service verification

## Development Workflow

### Code Organization
```
git-flow strategy
├── main (production)
├── develop (integration)
├── feature/* (features)
└── hotfix/* (emergency fixes)
```

### Testing Strategy
1. **Unit Tests**
   - Python: pytest
   - JavaScript: Jest
   - Coverage: >80%

2. **Integration Tests**
   - API endpoint testing
   - Database integration
   - WebSocket functionality

3. **End-to-End Tests**
   - User workflow testing
   - Cross-browser compatibility
   - Performance testing

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    - Run unit tests
    - Run integration tests
    - Code quality checks
  deploy:
    - Build Docker images
    - Deploy to staging
    - Run smoke tests
    - Deploy to production
```

## Maintenance Procedures

### Regular Maintenance
1. **Daily Tasks**
   - Monitor system health
   - Review error logs
   - Check backup status

2. **Weekly Tasks**
   - Performance analysis
   - Security updates
   - Capacity planning

3. **Monthly Tasks**
   - Database optimization
   - System updates
   - Documentation review

### Troubleshooting Guide
1. **Common Issues**
   - Database connection failures
   - Sensor data anomalies
   - WebSocket disconnections

2. **Diagnostic Tools**
   - Log analysis
   - Performance monitoring
   - Network diagnostics

3. **Resolution Procedures**
   - Issue identification
   - Impact assessment
   - Resolution implementation

## Future Enhancements

### Planned Features
1. **Advanced Analytics**
   - Machine learning predictions
   - Anomaly detection algorithms
   - Trend forecasting

2. **Enhanced IoT**
   - Additional sensor types
   - Edge computing capabilities
   - Mesh networking

3. **User Experience**
   - Mobile applications
   - Advanced visualizations
   - Custom dashboards

### Technology Roadmap
1. **Short Term (3 months)**
   - Enhanced alerting system
   - Performance optimizations
   - Security improvements

2. **Medium Term (6 months)**
   - Machine learning integration
   - Mobile app development
   - Advanced analytics

3. **Long Term (12 months)**
   - Smart city integration
   - Predictive maintenance
   - Autonomous monitoring

This technical architecture documentation provides a comprehensive understanding of the GreenPulse system's design, implementation, and operational procedures. It serves as a reference for developers, system administrators, and technical stakeholders involved in the project's development and maintenance.
