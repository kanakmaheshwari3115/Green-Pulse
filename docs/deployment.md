# GreenPulse Deployment Guide

## System Architecture Overview

GreenPulse consists of three main components:
1. **Backend API** - FastAPI server with MongoDB
2. **Frontend Dashboard** - React web application
3. **IoT Nodes** - Raspberry Pi sensor nodes

## Prerequisites

- Python 3.9+
- Node.js 16+
- MongoDB 5.0+
- Docker (optional)
- Raspberry Pi 4+ (for IoT nodes)

## Backend Deployment

### Option 1: Direct Installation

1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Set Environment Variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**
```bash
# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS (with Homebrew)
brew services start mongodb/brew/mongodb-community
```

4. **Run the API Server**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Option 2: Docker Deployment

1. **Build Docker Image**
```bash
cd backend
docker build -t greenpulse-api .
```

2. **Run with Docker Compose**
```bash
docker-compose up -d
```

## Frontend Deployment

### Development Mode

```bash
cd frontend
npm install
npm start
```

### Production Build

```bash
cd frontend
npm run build
```

Serve the build directory with nginx or Apache:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## IoT Node Deployment

### Hardware Requirements

- Raspberry Pi 4 (2GB RAM minimum)
- DHT22 Temperature/Humidity Sensor
- Soil Moisture Sensor
- LDR Light Sensor
- Pi Camera Module (optional)
- MicroSD Card (32GB minimum)

### Software Setup

1. **Install Raspberry Pi OS**
```bash
# Flash Raspberry Pi OS to SD card
# Enable SSH and camera interfaces
```

2. **Install Python Dependencies**
```bash
ssh pi@raspberry-pi-ip
cd iot-node
pip3 install -r requirements.txt
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with node-specific settings
```

4. **Set Up Systemd Service**
```bash
sudo nano /etc/systemd/system/greenpulse-node.service
```

```ini
[Unit]
Description=GreenPulse IoT Node
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/iot-node
ExecStart=/usr/bin/python3 /home/pi/iot-node/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable greenpulse-node
sudo systemctl start greenpulse-node
```

### Sensor Wiring

**DHT22 (Temperature/Humidity)**
- Pin 1 (3.3V) → 3.3V
- Pin 2 (Data) → GPIO 4
- Pin 3 → NC
- Pin 4 (GND) → GND

**Soil Moisture Sensor**
- VCC → 3.3V
- GND → GND
- A0 → GPIO 0 (with ADC converter)

**LDR (Light Sensor)**
- One leg → 3.3V
- Other leg → GPIO 1 (with ADC converter)
- 10kΩ resistor between GPIO and GND

## Database Configuration

### MongoDB Setup

1. **Create Database**
```javascript
use greenpulse
```

2. **Create Indexes**
```javascript
db.sensor_data.createIndex({"park_id": 1, "timestamp": -1})
db.sensor_data.createIndex({"node_id": 1, "timestamp": -1})
db.parks.createIndex({"park_id": 1}, {unique: true})
db.health_scores.createIndex({"park_id": 1, "timestamp": -1})
```

3. **Set Up Authentication** (optional)
```javascript
use admin
db.createUser({
  user: "greenpulse",
  pwd: "secure_password",
  roles: ["readWrite", "dbAdmin"]
})
```

## Monitoring and Maintenance

### Health Checks

- API Health: `GET /health`
- Node Status: `GET /api/nodes/status`
- Database Connection: Check MongoDB logs

### Log Management

```bash
# Backend logs
journalctl -u greenpulse-api -f

# IoT node logs
journalctl -u greenpulse-node -f

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Backup Strategy

```bash
# MongoDB backup
mongodump --db greenpulse --out /backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
mongodump --db greenpulse --out $BACKUP_DIR
find /backup -type d -mtime +7 -exec rm -rf {} \;
```

## Security Considerations

1. **Network Security**
   - Use HTTPS in production
   - Configure firewall rules
   - Use VPN for IoT node access

2. **API Security**
   - Implement API keys
   - Rate limiting
   - Input validation

3. **Database Security**
   - Enable authentication
   - Use strong passwords
   - Regular security updates

## Scaling Considerations

### Horizontal Scaling

- Load balancer for multiple API instances
- MongoDB replica set
- Redis for caching

### IoT Node Scaling

- Centralized node management
- Over-the-air updates
- Fleet monitoring dashboard

## Troubleshooting

### Common Issues

1. **API Not Responding**
   - Check MongoDB connection
   - Verify port availability
   - Review application logs

2. **IoT Node Offline**
   - Check network connectivity
   - Verify sensor connections
   - Review node logs

3. **Data Gaps**
   - Check sensor calibration
   - Verify data transmission
   - Review aggregation jobs

### Performance Optimization

1. **Database Optimization**
   - Index tuning
   - Query optimization
   - Connection pooling

2. **API Optimization**
   - Response caching
   - Pagination
   - Async processing

## Environment Variables

### Backend (.env)
```bash
MONGODB_URL=mongodb://localhost:27017/greenpulse
SECRET_KEY=your-secret-key
ENVIRONMENT=production
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com
```

### IoT Node (.env)
```bash
API_BASE_URL=https://api.yourdomain.com
NODE_ID=node_001
PARK_ID=park_001
SENSOR_READ_INTERVAL=30
IMAGE_CAPTURE_INTERVAL=300
```

## Support and Maintenance

For technical support:
1. Check logs for error messages
2. Verify network connectivity
3. Review system resources
4. Consult documentation

Regular maintenance tasks:
- Update dependencies
- Monitor storage usage
- Review security logs
- Backup configuration files
