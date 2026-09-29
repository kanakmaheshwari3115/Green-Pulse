# GreenPulse Implementation Guide

## Overview

This comprehensive implementation guide provides step-by-step instructions for deploying, configuring, and maintaining the GreenPulse ecological intelligence system. It covers all aspects from initial setup to ongoing operations.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Guide](#installation-guide)
3. [Configuration](#configuration)
4. [Deployment Procedures](#deployment-procedures)
5. [Testing and Validation](#testing-and-validation)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Scaling and Optimization](#scaling-and-optimization)

## System Requirements

### Minimum Requirements

#### Backend Server
- **CPU**: 2 cores (Intel i5 or AMD Ryzen 5)
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+

#### Database Server
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Software**: MongoDB 5.0+

#### Frontend (Development)
- **CPU**: 2 cores
- **RAM**: 4GB
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+

#### IoT Node
- **Hardware**: Raspberry Pi 4 (2GB RAM minimum)
- **Storage**: 32GB microSD card (Class 10)
- **Sensors**: DHT22, Soil Moisture, LDR, Pi Camera

### Recommended Production Requirements

#### Backend Server
- **CPU**: 4 cores (Intel i7 or AMD Ryzen 7)
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1Gbps connection
- **Load Balancer**: nginx or HAProxy

#### Database Server
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD with backup
- **Configuration**: Replica set with 3 nodes

#### IoT Fleet
- **Nodes**: Multiple Raspberry Pi 4 units
- **Network**: WiFi or Ethernet with failover
- **Power**: UPS backup for critical nodes
- **Monitoring**: Central fleet management

## Installation Guide

### 1. Backend Installation

#### Step 1: System Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.9 python3.9-venv python3.9-dev -y
sudo apt install build-essential -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Step 2: Application Setup
```bash
# Clone repository
git clone https://github.com/your-org/greenpulse.git
cd greenpulse/backend

# Create virtual environment
python3.9 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Set up environment
cp .env.example .env
nano .env  # Edit configuration
```

#### Step 3: Database Configuration
```bash
# Create MongoDB user
mongo
> use greenpulse
> db.createUser({
    user: "greenpulse",
    pwd: "secure_password",
    roles: ["readWrite", "dbAdmin"]
  })
> exit

# Create indexes
python -c "
from database import connect_to_mongo
import asyncio
asyncio.run(connect_to_mongo())
print('Database connected and indexed')
"
```

#### Step 4: Service Configuration
```bash
# Create systemd service
sudo nano /etc/systemd/system/greenpulse-api.service
```

```ini
[Unit]
Description=GreenPulse API Server
After=network.target mongod.service

[Service]
Type=simple
User=greenpulse
Group=greenpulse
WorkingDirectory=/opt/greenpulse/backend
Environment=PATH=/opt/greenpulse/backend/venv/bin
ExecStart=/opt/greenpulse/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable greenpulse-api
sudo systemctl start greenpulse-api
```

### 2. Frontend Installation

#### Step 1: Node.js Setup
```bash
# Install Node.js 16.x
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 2: Application Setup
```bash
# Navigate to frontend directory
cd greenpulse/frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env  # Edit configuration
```

#### Step 3: Build and Deploy
```bash
# Development mode
npm start

# Production build
npm run build

# Deploy to nginx
sudo cp -r build/* /var/www/html/
```

#### Step 4: Web Server Configuration
```bash
# Install nginx
sudo apt install nginx -y

# Configure nginx
sudo nano /etc/nginx/sites-available/greenpulse
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/greenpulse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. IoT Node Installation

#### Step 1: Raspberry Pi Setup
```bash
# Flash Raspberry Pi OS
# Enable SSH and camera interfaces
# Set up WiFi configuration

# SSH into Raspberry Pi
ssh pi@raspberry-pi-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python dependencies
sudo apt install python3-pip python3-venv -y
pip3 install --upgrade pip
```

#### Step 2: Hardware Setup
```bash
# Clone repository
git clone https://github.com/your-org/greenpulse.git
cd greenpulse/iot-node

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip3 install -r requirements.txt

# Set up environment
cp .env.example .env
nano .env  # Edit configuration
```

#### Step 3: Sensor Configuration
```bash
# Test sensor connections
python3 sensors.py

# Test camera
python3 camera.py

# Test data transmission
python3 data_sender.py
```

#### Step 4: Service Setup
```bash
# Create systemd service
sudo nano /etc/systemd/system/greenpulse-node.service
```

```ini
[Unit]
Description=GreenPulse IoT Node
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/greenpulse/iot-node
ExecStart=/home/pi/greenpulse/iot-node/venv/bin/python3 /home/pi/greenpulse/iot-node/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable greenpulse-node
sudo systemctl start greenpulse-node
```

## Configuration

### 1. Backend Configuration (.env)
```bash
# Database Configuration
MONGODB_URL=mongodb://greenpulse:password@localhost:27017/greenpulse
DATABASE_NAME=greenpulse

# API Configuration
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production

# CORS Configuration
ALLOWED_ORIGINS=["https://your-domain.com", "http://localhost:3000"]

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=/var/log/greenpulse/api.log

# Performance Configuration
MAX_CONNECTIONS=100
CONNECTION_TIMEOUT=30
```

### 2. Frontend Configuration (.env)
```bash
# API Configuration
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_WS_URL=wss://api.your-domain.com

# Application Configuration
REACT_APP_TITLE=GreenPulse
REACT_APP_VERSION=1.0.0

# Map Configuration
REACT_APP_MAP_API_KEY=your-map-api-key
REACT_APP_DEFAULT_LAT=28.6139
REACT_APP_DEFAULT_LON=77.2090

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ALERTS=true
```

### 3. IoT Node Configuration (.env)
```bash
# API Configuration
API_BASE_URL=https://api.your-domain.com
NODE_ID=node_001
PARK_ID=park_001

# Location Configuration
LOCATION_LAT=28.6139
LOCATION_LON=77.2090

# Sensor Configuration
SENSOR_READ_INTERVAL=30
IMAGE_CAPTURE_INTERVAL=300
SENSOR_CALIBRATION_ENABLED=true

# Hardware Configuration
DHT_PIN=4
SOIL_MOISTURE_PIN=0
LIGHT_SENSOR_PIN=1
CAMERA_RESOLUTION=1296x972

# Data Management
DATA_BUFFER_SIZE=100
RETRY_ATTEMPTS=3
RETRY_DELAY=5
```

## Deployment Procedures

### 1. Development Deployment

#### Local Development Setup
```bash
# Backend Development
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend Development
cd frontend
npm start

# IoT Node Testing
cd iot-node
source venv/bin/activate
python3 main.py
```

### 2. Production Deployment

#### Docker Deployment
```dockerfile
# Dockerfile.backend
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Dockerfile.frontend
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    environment:
      MONGODB_URL: mongodb://admin:password@mongodb:27017/greenpulse
    depends_on:
      - mongodb
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### Kubernetes Deployment
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: greenpulse
---
# k8s/mongodb.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: greenpulse
spec:
  serviceName: mongodb
  replicas: 3
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:5.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: "admin"
        - name: MONGO_INITDB_ROOT_PASSWORD
          value: "password"
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: mongodb-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

### 3. Database Migration

#### Data Migration Script
```python
# scripts/migrate_data.py
import asyncio
from database import connect_to_mongo, close_mongo_connection

async def migrate_database():
    await connect_to_mongo()
    
    # Create indexes
    await create_indexes()
    
    # Migrate data if needed
    await migrate_legacy_data()
    
    # Validate migration
    await validate_migration()
    
    await close_mongo_connection()
    print("Migration completed successfully")

if __name__ == "__main__":
    asyncio.run(migrate_database())
```

## Testing and Validation

### 1. Unit Testing

#### Backend Tests
```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_park():
    park_data = {
        "park_id": "test_park",
        "name": "Test Park",
        "location": {"lat": 28.6139, "lon": 77.2090},
        "area": 10000
    }
    response = client.post("/api/parks", json=park_data)
    assert response.status_code == 200

def test_sensor_data_ingestion():
    sensor_data = {
        "node_id": "test_node",
        "park_id": "test_park",
        "readings": [
            {"sensor_type": "temperature", "value": 25.5, "unit": "°C"}
        ]
    }
    response = client.post("/api/sensor-data", json=sensor_data)
    assert response.status_code == 200
```

#### Frontend Tests
```javascript
// src/components/__tests__/Dashboard.test.js
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

test('renders dashboard with park information', () => {
  render(<Dashboard />);
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});

test('displays park health scores', () => {
  render(<Dashboard />);
  expect(screen.getByText(/Health Score/i)).toBeInTheDocument();
});
```

### 2. Integration Testing

#### API Integration Tests
```python
# tests/test_integration.py
import pytest
import asyncio
from database import get_database

@pytest.mark.asyncio
async def test_end_to_end_sensor_flow():
    # Step 1: Create test park
    park_response = client.post("/api/parks", json=test_park_data)
    assert park_response.status_code == 200
    
    # Step 2: Send sensor data
    sensor_response = client.post("/api/sensor-data", json=test_sensor_data)
    assert sensor_response.status_code == 200
    
    # Step 3: Verify data storage
    db = get_database()
    stored_data = await db.sensor_data.find_one({"park_id": "test_park"})
    assert stored_data is not None
    
    # Step 4: Verify health score calculation
    health_response = client.get("/api/parks/test_park/health/current")
    assert health_response.status_code == 200
    assert "overall_score" in health_response.json()
```

### 3. Performance Testing

#### Load Testing Script
```python
# scripts/load_test.py
import asyncio
import aiohttp
import time

async def send_sensor_data(session, node_id, park_id):
    sensor_data = {
        "node_id": node_id,
        "park_id": park_id,
        "readings": [
            {"sensor_type": "temperature", "value": 25.5, "unit": "°C"},
            {"sensor_type": "humidity", "value": 65.0, "unit": "%"}
        ]
    }
    
    async with session.post("http://localhost:8000/api/sensor-data", json=sensor_data) as response:
        return response.status

async def load_test(num_requests=1000, concurrent=50):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(num_requests):
            task = send_sensor_data(session, f"node_{i}", "test_park")
            tasks.append(task)
            
            if len(tasks) >= concurrent:
                results = await asyncio.gather(*tasks)
                tasks = []
        
        if tasks:
            await asyncio.gather(*tasks)

if __name__ == "__main__":
    start_time = time.time()
    asyncio.run(load_test())
    end_time = time.time()
    print(f"Load test completed in {end_time - start_time:.2f} seconds")
```

## Monitoring and Maintenance

### 1. System Monitoring

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'greenpulse-api'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    
  - job_name: 'mongodb'
    static_configs:
      - targets: ['localhost:9216']
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "GreenPulse Monitoring",
    "panels": [
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "singlestat",
        "targets": [
          {
            "expr": "mongodb_connections_current"
          }
        ]
      }
    ]
  }
}
```

### 2. Log Management

#### Log Configuration
```python
# logging_config.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create file handler
    file_handler = RotatingFileHandler(
        '/var/log/greenpulse/api.log',
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
```

### 3. Backup Procedures

#### Automated Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="greenpulse_backup_$DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# Backup MongoDB
mongodump --db greenpulse --out "$BACKUP_DIR/$BACKUP_NAME/mongodb"

# Backup configuration files
cp /etc/greenpulse/*.env "$BACKUP_DIR/$BACKUP_NAME/config/"

# Create backup metadata
echo "Backup created: $DATE" > "$BACKUP_DIR/$BACKUP_NAME/metadata.txt"

# Compress backup
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
rm -rf "$BACKUP_DIR/$BACKUP_NAME"

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
```

#### Cron Job Configuration
```bash
# Add to crontab
0 2 * * * /opt/greenpulse/scripts/backup.sh >> /var/log/greenpulse/backup.log 2>&1
```

## Troubleshooting

### 1. Common Issues

#### API Not Starting
```bash
# Check logs
sudo journalctl -u greenpulse-api -f

# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"

# Check port availability
sudo netstat -tlnp | grep :8000

# Check configuration
cat /etc/greenpulse/.env
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo greenpulse --eval "db.parks.count()"

# Check indexes
mongo greenpulse --eval "db.parks.getIndexes()"
```

#### IoT Node Issues
```bash
# Check node status
sudo systemctl status greenpulse-node

# Check sensor connections
python3 -c "
from sensors import SensorManager
sm = SensorManager()
print(sm.get_all_readings())
"

# Check network connectivity
ping api.your-domain.com

# Check data transmission
python3 -c "
from data_sender import DataSender
ds = DataSender()
print(ds.test_connection())
"
```

### 2. Performance Issues

#### Slow API Response
```bash
# Check system resources
top
htop
iotop

# Check database performance
mongo greenpulse --eval "
db.runCommand({serverStatus: 1}).connections
db.runCommand({dbStats: 1})
"

# Check slow queries
mongo greenpulse --eval "
db.setProfilingLevel(2)
db.system.profile.find().limit(5).sort({ts:-1}).pretty()
"
```

#### High Memory Usage
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Check MongoDB memory
mongo greenpulse --eval "
db.runCommand({serverStatus: 1}).mem
"

# Restart services if needed
sudo systemctl restart greenpulse-api
sudo systemctl restart mongod
```

### 3. Data Issues

#### Missing Sensor Data
```bash
# Check recent data
mongo greenpulse --eval "
db.sensor_data.find().sort({timestamp:-1}).limit(5).pretty()
"

# Check node status
curl http://localhost:8000/api/nodes/status

# Manually insert test data
python3 create_test_data.py
```

#### Incorrect Health Scores
```bash
# Check scoring configuration
python3 -c "
from scoring import EcologicalScorer
scorer = EcologicalScorer()
print(scorer.optimal_ranges)
print(scorer.score_weights)
"

# Recalculate scores
python3 -c "
from data_aggregation import DataAggregator
import asyncio
asyncio.run(DataAggregator().calculate_daily_health_scores())
"
```

## Scaling and Optimization

### 1. Horizontal Scaling

#### Load Balancer Configuration
```nginx
# nginx.conf
upstream greenpulse_api {
    server 10.0.1.10:8000;
    server 10.0.1.11:8000;
    server 10.0.1.12:8000;
}

server {
    listen 80;
    location /api {
        proxy_pass http://greenpulse_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Database Replication
```javascript
// MongoDB replica set configuration
rs.initiate({
  _id: "greenpulse-replica",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
})
```

### 2. Performance Optimization

#### Database Optimization
```javascript
// Create compound indexes
db.sensor_data.createIndex({"park_id": 1, "sensor_type": 1, "timestamp": -1})

// Enable query optimization
db.setProfilingLevel(1, {slowms: 100})

// Monitor performance
db.runCommand({collStats: "sensor_data"})
```

#### Caching Strategy
```python
# redis_cache.py
import redis
import json

class RedisCache:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
    
    def get_park_health(self, park_id):
        cached_data = self.redis_client.get(f"park_health:{park_id}")
        if cached_data:
            return json.loads(cached_data)
        return None
    
    def set_park_health(self, park_id, health_data, ttl=300):
        self.redis_client.setex(
            f"park_health:{park_id}",
            ttl,
            json.dumps(health_data)
        )
```

### 3. Resource Optimization

#### Memory Management
```python
# memory_optimization.py
import gc
import psutil

def optimize_memory():
    # Force garbage collection
    gc.collect()
    
    # Monitor memory usage
    process = psutil.Process()
    memory_info = process.memory_info()
    
    if memory_info.rss > 1024 * 1024 * 1024:  # 1GB
        # Implement memory optimization strategies
        pass
```

#### Connection Pooling
```python
# connection_pool.py
from motor.motor_asyncio import AsyncIOMotorClient

class DatabasePool:
    def __init__(self, mongodb_url):
        self.client = AsyncIOMotorClient(
            mongodb_url,
            maxPoolSize=50,
            minPoolSize=10,
            maxIdleTimeMS=30000
        )
    
    def get_database(self):
        return self.client.greenpulse
```

This comprehensive implementation guide provides all necessary information for successfully deploying, configuring, and maintaining the GreenPulse system in various environments from development to production.
