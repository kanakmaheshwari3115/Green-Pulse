# GreenPulse Data Workflows Documentation

## Overview

This document details all data workflows within the GreenPulse system, from sensor data collection to final analytics presentation. Each workflow includes step-by-step processes, data transformations, and system interactions.

## 1. Sensor Data Collection Workflow

### 1.1 Hardware Data Acquisition
```
Physical Sensors → Analog/Digital Conversion → Raw Values
```

**Detailed Process:**
1. **Temperature/Humidity (DHT22)**
   - GPIO pin 4 reads digital signal
   - One-wire protocol communication
   - Calibration offset applied
   - Output: Temperature (°C), Humidity (%)

2. **Soil Moisture (Analog Sensor)**
   - ADC converts analog voltage (0-3.3V)
   - Voltage mapped to moisture percentage
   - Temperature compensation applied
   - Output: Soil moisture (%)

3. **Light Intensity (LDR)**
   - Voltage divider circuit with LDR
   - ADC reads voltage level
   - Voltage converted to lux using calibration curve
   - Output: Light intensity (lux)

### 1.2 Data Validation and Processing
```python
# Sensor data validation workflow
def process_sensor_reading(raw_value, sensor_type):
    # Step 1: Range validation
    if not is_valid_range(raw_value, sensor_type):
        raise ValueError(f"Invalid {sensor_type} reading: {raw_value}")
    
    # Step 2: Calibration
    calibrated_value = apply_calibration(raw_value, sensor_type)
    
    # Step 3: Unit conversion
    final_value = convert_units(calibrated_value, sensor_type)
    
    # Step 4: Quality check
    quality_score = calculate_data_quality(final_value, sensor_type)
    
    return {
        "value": final_value,
        "unit": get_unit(sensor_type),
        "quality": quality_score,
        "timestamp": datetime.utcnow()
    }
```

### 1.3 Data Packaging and Transmission
```python
# Sensor data packaging workflow
def package_sensor_data(readings, node_id, park_id):
    sensor_package = {
        "node_id": node_id,
        "park_id": park_id,
        "location": get_node_location(node_id),
        "readings": readings,
        "timestamp": datetime.utcnow(),
        "metadata": {
            "firmware_version": get_firmware_version(),
            "battery_level": get_battery_level(),
            "signal_strength": get_signal_strength()
        }
    }
    
    # Data validation before transmission
    validate_sensor_package(sensor_package)
    
    return sensor_package
```

## 2. Data Ingestion Workflow

### 2.1 API Endpoint Processing
```python
# Sensor data ingestion workflow
@router.post("/api/sensor-data")
async def ingest_sensor_data(sensor_data: SensorData):
    # Step 1: Request validation
    validated_data = validate_sensor_input(sensor_data)
    
    # Step 2: Data enrichment
    enriched_data = enrich_sensor_data(validated_data)
    
    # Step 3: Database storage
    store_sensor_data(enriched_data)
    
    # Step 4: Trigger background processing
    trigger_health_score_calculation(sensor_data.park_id)
    
    # Step 5: Real-time broadcasting
    await broadcast_sensor_update(sensor_data)
    
    return {"status": "success", "message": "Data ingested"}
```

### 2.2 Data Enrichment Process
```python
def enrich_sensor_data(sensor_data):
    # Add geographic context
    enriched = add_geographic_context(sensor_data)
    
    # Add weather context (if available)
    enriched = add_weather_context(enriched)
    
    # Add historical context
    enriched = add_historical_context(enriched)
    
    # Add quality metrics
    enriched = add_quality_metrics(enriched)
    
    return enriched
```

### 2.3 Data Storage Strategy
```python
# Multi-level storage approach
def store_sensor_data(sensor_data):
    # Level 1: Raw data storage (immediate access)
    store_in_collection("sensor_data", sensor_data)
    
    # Level 2: Aggregated data (hourly)
    update_hourly_aggregates(sensor_data)
    
    # Level 3: Long-term storage (daily)
    update_daily_aggregates(sensor_data)
    
    # Level 4: Archive (monthly)
    archive_old_data(sensor_data)
```

## 3. Health Score Calculation Workflow

### 3.1 Data Collection and Preparation
```python
def prepare_scoring_data(park_id, time_window=timedelta(hours=1)):
    # Step 1: Collect recent sensor data
    sensor_data = get_recent_sensor_data(park_id, time_window)
    
    # Step 2: Collect recent image analysis
    image_data = get_recent_image_analysis(park_id, time_window)
    
    # Step 3: Collect park metadata
    park_info = get_park_info(park_id)
    
    # Step 4: Data validation and cleaning
    cleaned_data = clean_and_validate_data(sensor_data, image_data)
    
    return cleaned_data, park_info
```

### 3.2 Component Score Calculation
```python
def calculate_component_scores(data, park_info):
    scores = {}
    
    # Tree Health Score (30% weight)
    scores["tree_health"] = calculate_tree_health_score(
        data["temperature"],
        data["humidity"],
        data["soil_moisture"],
        data.get("vegetation_analysis")
    )
    
    # Microclimate Score (25% weight)
    scores["microclimate"] = calculate_microclimate_score(
        data["temperature"],
        data["humidity"],
        data["light_intensity"]
    )
    
    # Soil and Water Score (20% weight)
    scores["soil_water"] = calculate_soil_water_score(
        data["soil_moisture"],
        data.get("ph"),
        data.get("turbidity")
    )
    
    # Biodiversity Score (15% weight)
    scores["biodiversity"] = calculate_biodiversity_score(
        data.get("image_analysis"),
        park_info.get("tree_count")
    )
    
    # Infrastructure Score (10% weight)
    scores["infrastructure"] = calculate_infrastructure_score(
        data.get("infrastructure_analysis")
    )
    
    return scores
```

### 3.3 Overall Score Aggregation
```python
def calculate_overall_score(component_scores):
    weights = {
        "tree_health": 0.30,
        "microclimate": 0.25,
        "soil_water": 0.20,
        "biodiversity": 0.15,
        "infrastructure": 0.10
    }
    
    overall_score = sum(
        component_scores[component] * weights[component]
        for component in weights
    )
    
    # Apply trend adjustment
    trend_adjustment = calculate_trend_adjustment(component_scores)
    final_score = overall_score + trend_adjustment
    
    return {
        "overall_score": max(0, min(10, final_score)),
        "component_scores": component_scores,
        "weights": weights,
        "trend_adjustment": trend_adjustment
    }
```

### 3.4 Trend Analysis
```python
def calculate_trend_analysis(park_id, current_score):
    # Get historical scores
    historical_scores = get_historical_scores(park_id, days=30)
    
    if len(historical_scores) < 7:
        return "insufficient_data"
    
    # Calculate trend
    recent_scores = historical_scores[:7]
    older_scores = historical_scores[7:14]
    
    recent_avg = sum(s.overall_score for s in recent_scores) / len(recent_scores)
    older_avg = sum(s.overall_score for s in older_scores) / len(older_scores)
    
    difference = recent_avg - older_avg
    
    if difference > 0.5:
        return "improving"
    elif difference < -0.5:
        return "declining"
    else:
        return "stable"
```

## 4. Image Analysis Workflow

### 4.1 Image Capture and Preprocessing
```python
def capture_and_preprocess_image(image_type):
    # Step 1: Image capture
    raw_image = camera.capture_image()
    
    # Step 2: Basic preprocessing
    processed_image = preprocess_image(raw_image)
    
    # Step 3: Quality assessment
    quality_score = assess_image_quality(processed_image)
    
    if quality_score < 0.5:
        return None  # Retry capture
    
    # Step 4: Store image
    image_path = store_image(processed_image, image_type)
    
    return image_path
```

### 4.2 Vegetation Health Analysis
```python
def analyze_vegetation_health(image_path):
    # Load image
    image = cv2.imread(image_path)
    
    # Convert to HSV for better color analysis
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Define green color range
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    
    # Create green mask
    green_mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # Calculate metrics
    green_percentage = np.sum(green_mask > 0) / (image.shape[0] * image.shape[1]) * 100
    
    # Edge detection for vegetation density
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (image.shape[0] * image.shape[1]) * 100
    
    # Calculate vegetation health score
    vegetation_health = min(100, (green_percentage * 0.7 + edge_density * 0.3))
    
    return {
        "vegetation_health": vegetation_health / 100,
        "green_coverage": green_percentage / 100,
        "edge_density": edge_density / 100,
        "analysis_timestamp": datetime.utcnow()
    }
```

### 4.3 Biodiversity Analysis
```python
def analyze_biodiversity(image_path):
    # Load image
    image = cv2.imread(image_path)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Define color ranges for different vegetation types
    color_ranges = [
        ([35, 40, 40], [85, 255, 255]),   # Green
        ([0, 40, 40], [10, 255, 255]),    # Red/Brown
        ([20, 40, 40], [30, 255, 255]),   # Yellow
        ([90, 40, 40], [130, 255, 255])  # Blue (water)
    ]
    
    # Calculate color distribution
    color_distributions = []
    for lower, upper in color_ranges:
        mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
        percentage = np.sum(mask > 0) / (image.shape[0] * image.shape[1]) * 100
        color_distributions.append(percentage)
    
    # Calculate biodiversity index (Simpson's diversity index)
    total_pixels = sum(color_distributions)
    if total_pixels == 0:
        biodiversity_index = 0
    else:
        proportions = [p/total_pixels for p in color_distributions if p > 0]
        biodiversity_index = 1 - sum(p**2 for p in proportions)
    
    return {
        "biodiversity_index": biodiversity_index,
        "color_distribution": color_distributions,
        "dominant_color": color_ranges[np.argmax(color_distributions)][0],
        "analysis_timestamp": datetime.utcnow()
    }
```

## 5. Real-time Data Broadcasting Workflow

### 5.1 WebSocket Connection Management
```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.park_subscribers: Dict[str, List[WebSocket]] = {}
    
    async def handle_connection(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
        # Send initial connection message
        await self.send_message(websocket, {
            "type": "connection_established",
            "client_id": client_id,
            "timestamp": datetime.utcnow()
        })
```

### 5.2 Message Broadcasting Workflow
```python
async def broadcast_sensor_update(park_id: str, sensor_data: dict):
    # Step 1: Prepare message
    message = {
        "type": "sensor_update",
        "park_id": park_id,
        "timestamp": datetime.utcnow(),
        "data": {
            "node_id": sensor_data["node_id"],
            "readings": sensor_data["readings"]
        }
    }
    
    # Step 2: Get subscribed connections
    subscribers = self.park_subscribers.get(park_id, [])
    
    # Step 3: Broadcast to all subscribers
    disconnected_connections = []
    for connection in subscribers:
        try:
            await connection.send_text(json.dumps(message))
        except:
            disconnected_connections.append(connection)
    
    # Step 4: Clean up disconnected connections
    for connection in disconnected_connections:
        self.remove_connection(connection)
```

### 5.3 Client-Side Message Handling
```typescript
// Frontend WebSocket message handling
const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
        case 'sensor_update':
            updateSensorData(message.data);
            break;
        case 'health_update':
            updateHealthScore(message.data);
            break;
        case 'alert':
            showAlert(message.data);
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
};
```

## 6. Data Aggregation Workflow

### 6.1 Hourly Aggregation Process
```python
async def aggregate_hourly_data():
    # Step 1: Define time window
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=1)
    
    # Step 2: Query raw data
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_time, "$lt": end_time}}},
        {"$unwind": "$readings"},
        {"$group": {
            "_id": {
                "park_id": "$park_id",
                "sensor_type": "$readings.sensor_type",
                "hour": {"$dateTrunc": {"date": "$timestamp", "unit": "hour"}}
            },
            "avg_value": {"$avg": "$readings.value"},
            "min_value": {"$min": "$readings.value"},
            "max_value": {"$max": "$readings.value"},
            "count": {"$sum": 1},
            "unit": {"$first": "$readings.unit"}
        }}
    ]
    
    # Step 3: Process aggregation results
    hourly_data = await sensor_collection.aggregate(pipeline).to_list(1000)
    
    # Step 4: Store aggregated data
    for record in hourly_data:
        await hourly_collection.replace_one(
            {"_id": f"{record['_id']['park_id']}_{record['_id']['sensor_type']}_{record['_id']['hour']}"},
            record,
            upsert=True
        )
```

### 6.2 Daily Aggregation Process
```python
async def aggregate_daily_data():
    # Step 1: Aggregate hourly data to daily
    pipeline = [
        {"$match": {"hour": {"$gte": start_time, "$lt": end_time}}},
        {"$group": {
            "_id": {
                "park_id": "$park_id",
                "sensor_type": "$sensor_type",
                "day": {"$dateTrunc": {"date": "$hour", "unit": "day"}}
            },
            "avg_value": {"$avg": "$avg_value"},
            "min_value": {"$min": "$min_value"},
            "max_value": {"$max": "$max_value"},
            "total_count": {"$sum": "$count"},
            "unit": {"$first": "$unit"}
        }}
    ]
    
    # Step 2: Process and store
    daily_data = await hourly_collection.aggregate(pipeline).to_list(500)
    
    for record in daily_data:
        await daily_collection.replace_one(
            {"_id": f"{record['_id']['park_id']}_{record['_id']['sensor_type']}_{record['_id']['day']}"},
            record,
            upsert=True
        )
```

### 6.3 Health Score Aggregation
```python
async def aggregate_daily_health_scores():
    parks = await parks_collection.find({}).to_list(100)
    
    for park in parks:
        park_id = park["park_id"]
        
        # Get health scores for the day
        scores = await health_collection.find({
            "park_id": park_id,
            "timestamp": {"$gte": start_time, "$lt": end_time}
        }).to_list(100)
        
        if scores:
            # Calculate daily averages
            daily_score = {
                "park_id": park_id,
                "date": start_time.date(),
                "avg_overall_score": sum(s.overall_score for s in scores) / len(scores),
                "avg_tree_health": sum(s.tree_health_score for s in scores) / len(scores),
                "avg_microclimate": sum(s.microclimate_score for s in scores) / len(scores),
                "avg_soil_water": sum(s.soil_water_score for s in scores) / len(scores),
                "avg_biodiversity": sum(s.biodiversity_score for s in scores) / len(scores),
                "avg_infrastructure": sum(s.infrastructure_score for s in scores) / len(scores),
                "score_count": len(scores)
            }
            
            await daily_health_collection.replace_one(
                {"_id": f"{park_id}_{start_time.date()}"},
                daily_score,
                upsert=True
            )
```

## 7. Alert Generation Workflow

### 7.1 Anomaly Detection
```python
def detect_sensor_anomalies(sensor_reading, historical_data):
    # Step 1: Calculate statistical parameters
    values = [reading["value"] for reading in historical_data]
    mean = np.mean(values)
    std_dev = np.std(values)
    
    # Step 2: Calculate z-score
    z_score = abs(sensor_reading["value"] - mean) / std_dev
    
    # Step 3: Determine anomaly level
    if z_score > 3:
        return "critical", f"Value {sensor_reading['value']} is {z_score:.1f} standard deviations from normal"
    elif z_score > 2:
        return "high", f"Value {sensor_reading['value']} is significantly unusual"
    elif z_score > 1.5:
        return "medium", f"Value {sensor_reading['value']} is somewhat unusual"
    else:
        return None, None
```

### 7.2 Health Score Decline Detection
```python
def detect_health_decline(park_id, current_score):
    # Get recent scores
    recent_scores = get_recent_health_scores(park_id, days=7)
    
    if len(recent_scores) < 3:
        return None
    
    # Calculate trend
    scores = [s.overall_score for s in recent_scores]
    trend = np.polyfit(range(len(scores)), scores, 1)[0]
    
    # Determine alert level
    if trend < -0.5 and current_score < 5:
        return "critical", "Rapid health score decline detected"
    elif trend < -0.3:
        return "high", "Health score declining"
    elif trend < -0.1:
        return "medium", "Health score trending downward"
    else:
        return None
```

### 7.3 Alert Generation and Distribution
```python
async def generate_alert(park_id, alert_type, severity, message, data):
    alert = {
        "alert_id": f"alert_{uuid.uuid4().hex[:8]}",
        "park_id": park_id,
        "alert_type": alert_type,
        "severity": severity,
        "message": message,
        "data": data,
        "created_at": datetime.utcnow(),
        "resolved": False
    }
    
    # Store alert
    await alerts_collection.insert_one(alert)
    
    # Broadcast alert
    await broadcast_alert(park_id, alert)
    
    # Send notifications (if configured)
    await send_notifications(alert)
```

## 8. Data Quality Assurance Workflow

### 8.1 Input Validation
```python
def validate_sensor_data(sensor_data):
    # Structural validation
    required_fields = ["node_id", "park_id", "readings", "timestamp"]
    for field in required_fields:
        if field not in sensor_data:
            raise ValueError(f"Missing required field: {field}")
    
    # Reading validation
    for reading in sensor_data["readings"]:
        if not validate_reading(reading):
            raise ValueError(f"Invalid reading: {reading}")
    
    # Range validation
    for reading in sensor_data["readings"]:
        if not is_valid_range(reading["value"], reading["sensor_type"]):
            raise ValueError(f"Value out of range: {reading}")
    
    return True
```

### 8.2 Data Cleaning
```python
def clean_sensor_data(raw_data):
    cleaned_data = []
    
    for reading in raw_data:
        # Remove outliers
        if is_outlier(reading):
            continue
        
        # Apply calibration
        calibrated_reading = apply_calibration(reading)
        
        # Smooth data (moving average)
        smoothed_reading = apply_smoothing(calibrated_reading)
        
        cleaned_data.append(smoothed_reading)
    
    return cleaned_data
```

### 8.3 Quality Metrics
```python
def calculate_data_quality(sensor_data):
    metrics = {
        "completeness": calculate_completeness(sensor_data),
        "accuracy": calculate_accuracy(sensor_data),
        "consistency": calculate_consistency(sensor_data),
        "timeliness": calculate_timeliness(sensor_data),
        "validity": calculate_validity(sensor_data)
    }
    
    overall_quality = sum(metrics.values()) / len(metrics)
    
    return {
        "overall_quality": overall_quality,
        "metrics": metrics,
        "timestamp": datetime.utcnow()
    }
```

## 9. Backup and Recovery Workflow

### 9.1 Automated Backup Process
```python
async def create_backup():
    # Step 1: Create database snapshot
    backup_timestamp = datetime.utcnow()
    backup_name = f"greenpulse_backup_{backup_timestamp.strftime('%Y%m%d_%H%M%S')}"
    
    # Step 2: Export collections
    collections = ["parks", "sensor_data", "health_scores", "alerts"]
    
    for collection_name in collections:
        collection = db[collection_name]
        cursor = collection.find({})
        data = await cursor.to_list(length=None)
        
        # Save to backup file
        backup_file = f"/backups/{backup_name}/{collection_name}.json"
        with open(backup_file, 'w') as f:
            json.dump(data, f, default=str)
    
    # Step 3: Create backup metadata
    metadata = {
        "backup_name": backup_name,
        "timestamp": backup_timestamp,
        "collections": collections,
        "record_counts": {col: await db[col].count_documents({}) for col in collections}
    }
    
    with open(f"/backups/{backup_name}/metadata.json", 'w') as f:
        json.dump(metadata, f, default=str)
    
    return backup_name
```

### 9.2 Data Recovery Process
```python
async def restore_backup(backup_name):
    # Step 1: Load backup metadata
    with open(f"/backups/{backup_name}/metadata.json", 'r') as f:
        metadata = json.load(f)
    
    # Step 2: Restore collections
    for collection_name in metadata["collections"]:
        backup_file = f"/backups/{backup_name}/{collection_name}.json"
        
        with open(backup_file, 'r') as f:
            data = json.load(f)
        
        # Clear existing data
        await db[collection_name].delete_many({})
        
        # Restore data
        if data:
            await db[collection_name].insert_many(data)
    
    # Step 3: Rebuild indexes
    await rebuild_indexes()
    
    return metadata
```

## 10. Performance Monitoring Workflow

### 10.1 System Metrics Collection
```python
async def collect_system_metrics():
    metrics = {
        "timestamp": datetime.utcnow(),
        "api": {
            "request_count": get_request_count(),
            "average_response_time": get_average_response_time(),
            "error_rate": get_error_rate(),
            "active_connections": get_active_connections()
        },
        "database": {
            "connection_count": get_db_connection_count(),
            "query_performance": get_query_performance(),
            "storage_usage": get_storage_usage()
        },
        "iot_nodes": {
            "total_nodes": get_total_nodes(),
            "active_nodes": get_active_nodes(),
            "data_points_per_hour": get_data_points_rate()
        }
    }
    
    await metrics_collection.insert_one(metrics)
    return metrics
```

### 10.2 Performance Analysis
```python
def analyze_performance_trends(metrics, time_window=timedelta(hours=24)):
    # Analyze API performance
    api_trends = analyze_api_trends(metrics, time_window)
    
    # Analyze database performance
    db_trends = analyze_db_trends(metrics, time_window)
    
    # Analyze IoT node performance
    iot_trends = analyze_iot_trends(metrics, time_window)
    
    # Generate recommendations
    recommendations = generate_performance_recommendations(
        api_trends, db_trends, iot_trends
    )
    
    return {
        "api_trends": api_trends,
        "database_trends": db_trends,
        "iot_trends": iot_trends,
        "recommendations": recommendations,
        "analysis_timestamp": datetime.utcnow()
    }
```

This comprehensive data workflows documentation provides detailed insights into how data flows through the GreenPulse system, from initial sensor readings to final analytics presentation. Each workflow includes specific implementation details, error handling, and optimization strategies to ensure reliable and efficient data processing.
