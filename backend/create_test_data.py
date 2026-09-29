#!/usr/bin/env python3
"""
Script to create test data for GreenPulse system
"""
import sys
import asyncio
import random
from datetime import datetime, timedelta
from database import connect_to_mongo, close_mongo_connection, get_collection

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

async def create_test_parks():
    """Create test parks"""
    parks_collection = get_collection("parks")
    
    parks = [
        {
            "park_id": "park_001",
            "name": "Ludhiana Agro-Ecological Field",
            "state": "Punjab",
            "district": "Ludhiana",
            "farmer_name": "Sardar Gurpreet Singh",
            "location": {"lat": 30.9010, "lon": 75.8573},
            "area": 25000,
            "area_acres": 6.2,
            "current_crop": "Wheat + Mustard Border",
            "soil_type": "Alluvial Loam",
            "tree_count": 120,
            "description": "Direct-seeded wheat cluster with Happy Seeder mulch management"
        },
        {
            "park_id": "park_002", 
            "name": "Nashik Climate-Resilient Cluster",
            "state": "Maharashtra",
            "district": "Nashik",
            "farmer_name": "Eknath Rao Patil",
            "location": {"lat": 19.9975, "lon": 73.7898},
            "area": 18000,
            "area_acres": 4.5,
            "current_crop": "Soybean + Arhar (Pigeonpea)",
            "soil_type": "Medium Black Soil",
            "tree_count": 85,
            "description": "Rainfed polyculture plot using broad bed furrow (BBF) conservation"
        },
        {
            "park_id": "park_003",
            "name": "Mandya Millet & Polyculture Haven",
            "state": "Karnataka",
            "district": "Mandya",
            "farmer_name": "Shivanna Gowda",
            "location": {"lat": 12.5244, "lon": 76.8958},
            "area": 35000,
            "area_acres": 8.6,
            "current_crop": "Finger Millet (Ragi) + Cowpea",
            "soil_type": "Red Sandy Loam",
            "tree_count": 190,
            "description": "Indigenous Navadhanya multi-crop model with drip fertigation"
        }
    ]
    
    for park in parks:
        park["_id"] = park["park_id"]
        park["created_at"] = datetime.utcnow()
        park["updated_at"] = datetime.utcnow()
        
        await parks_collection.replace_one(
            {"park_id": park["park_id"]},
            park,
            upsert=True
        )
    
    print(f"[OK] Created {len(parks)} test agro-clusters")

async def create_test_sensor_data():
    """Create historical sensor data"""
    sensor_collection = get_collection("sensor_data")
    
    sensor_types = [
        {"type": "temperature", "unit": "°C", "range": (20, 35)},
        {"type": "humidity", "unit": "%", "range": (40, 80)},
        {"type": "soil_moisture", "unit": "%", "range": (20, 70)},
        {"type": "light_intensity", "unit": "lux", "range": (10000, 60000)}
    ]
    
    parks = ["park_001", "park_002", "park_003"]
    nodes = ["node_001", "node_002", "node_003"]
    
    # Generate data for the last 7 days
    start_time = datetime.utcnow() - timedelta(days=7)
    
    for park_id in parks:
        for node_id in nodes:
            current_time = start_time
            
            while current_time < datetime.utcnow():
                readings = []
                
                for sensor in sensor_types:
                    value = random.uniform(*sensor["range"])
                    
                    # Add some realistic variation
                    if sensor["type"] == "temperature":
                        # Temperature varies with time of day
                        hour = current_time.hour
                        if 6 <= hour <= 18:
                            value += random.uniform(2, 8)
                        else:
                            value -= random.uniform(2, 5)
                    elif sensor["type"] == "light_intensity":
                        # Light intensity varies dramatically
                        hour = current_time.hour
                        if 6 <= hour <= 18:
                            value = random.uniform(30000, 60000)
                        else:
                            value = random.uniform(100, 5000)
                    elif sensor["type"] == "humidity":
                        # Humidity inversely related to temperature
                        value = 70 - (value - 20) * 0.5
                    
                    readings.append({
                        "sensor_type": sensor["type"],
                        "value": round(value, 1),
                        "unit": sensor["unit"],
                        "timestamp": current_time.isoformat()
                    })
                
                sensor_data = {
                    "_id": f"{node_id}_{park_id}_{current_time.isoformat()}",
                    "node_id": node_id,
                    "park_id": park_id,
                    "location": {
                        "lat": random.uniform(28.6000, 28.6300),
                        "lon": random.uniform(77.1900, 77.2300)
                    },
                    "readings": readings,
                    "timestamp": current_time
                }
                
                await sensor_collection.insert_one(sensor_data)
                
                # Move to next reading (every 30 minutes)
                current_time += timedelta(minutes=30)
    
    print("[OK] Created test sensor data for last 7 days")

async def create_test_health_scores():
    """Create test health scores"""
    health_collection = get_collection("health_scores")
    
    parks = ["park_001", "park_002", "park_003"]
    
    # Generate health scores for the last 30 days
    start_time = datetime.utcnow() - timedelta(days=30)
    
    for park_id in parks:
        current_time = start_time
        
        while current_time < datetime.utcnow():
            # Generate realistic health scores with some variation
            base_score = random.uniform(6.5, 8.5)
            
            # Add trend
            days_elapsed = (current_time - start_time).days
            trend_factor = days_elapsed * 0.01  # Slight improvement over time
            
            overall_score = min(10, max(0, base_score + trend_factor + random.uniform(-0.5, 0.5)))
            
            health_score = {
                "_id": f"{park_id}_{current_time.date().isoformat()}",
                "park_id": park_id,
                "overall_score": round(overall_score, 2),
                "tree_health_score": round(overall_score + random.uniform(-0.3, 0.3), 2),
                "microclimate_score": round(overall_score + random.uniform(-0.5, 0.5), 2),
                "soil_water_score": round(overall_score + random.uniform(-0.4, 0.4), 2),
                "biodiversity_score": round(overall_score + random.uniform(-0.6, 0.6), 2),
                "infrastructure_score": round(overall_score + random.uniform(-0.2, 0.2), 2),
                "factors": {
                    "tree_health_score": round(overall_score + random.uniform(-0.3, 0.3), 2),
                    "microclimate_score": round(overall_score + random.uniform(-0.5, 0.5), 2),
                    "soil_water_score": round(overall_score + random.uniform(-0.4, 0.4), 2),
                    "biodiversity_score": round(overall_score + random.uniform(-0.6, 0.6), 2),
                    "infrastructure_score": round(overall_score + random.uniform(-0.2, 0.2), 2),
                    "weights": {
                        "tree_health": 0.30,
                        "microclimate": 0.25,
                        "soil_water": 0.20,
                        "biodiversity": 0.15,
                        "infrastructure": 0.10
                    }
                },
                "timestamp": current_time
            }
            
            await health_collection.insert_one(health_score)
            
            # Move to next day
            current_time += timedelta(days=1)
    
    print("[OK] Created test health scores for last 30 days")

async def create_test_alerts():
    """Create test alerts"""
    alerts_collection = get_collection("alerts")
    
    alert_types = [
        {"type": "sensor_anomaly", "severity": "medium", "message": "Temperature above optimal range"},
        {"type": "sensor_anomaly", "severity": "low", "message": "Soil moisture slightly low"},
        {"type": "health_decline", "severity": "high", "message": "Park health score declining"},
        {"type": "maintenance_needed", "severity": "medium", "message": "Infrastructure maintenance required"}
    ]
    
    parks = ["park_001", "park_002", "park_003"]
    nodes = ["node_001", "node_002", "node_003"]
    
    for _ in range(10):  # Create 10 random alerts
        alert_template = random.choice(alert_types)
        park_id = random.choice(parks)
        node_id = random.choice(nodes)
        
        alert = {
            "_id": f"alert_{datetime.utcnow().isoformat()}_{random.randint(1000, 9999)}",
            "alert_id": f"alert_{random.randint(1000, 9999)}",
            "park_id": park_id,
            "node_id": node_id,
            "alert_type": alert_template["type"],
            "severity": alert_template["severity"],
            "message": alert_template["message"],
            "data": {
                "sensor_type": random.choice(["temperature", "humidity", "soil_moisture"]),
                "current_value": random.uniform(20, 40),
                "threshold": random.uniform(25, 35)
            },
            "resolved": random.choice([True, False]),
            "created_at": datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
            "resolved_at": datetime.utcnow() if random.choice([True, False]) else None
        }
        
        await alerts_collection.insert_one(alert)
    
    print("[OK] Created test alerts")

async def main():
    """Main function to create all test data"""
    print("[INFO] Creating GreenPulse Agri-DPG test data...")
    
    try:
        await connect_to_mongo()
        
        await create_test_parks()
        await create_test_sensor_data()
        await create_test_health_scores()
        await create_test_alerts()
        
        print("\n[OK] Test data creation completed!")
        print("  - Agro-Clusters: 3 (Punjab, Maharashtra, Karnataka)")
        print("  - Sensor telemetry: Last 7 days")
        print("  - Health scores: Last 30 days")
        print("  - Field alerts: 10 sample alerts")
        
        print("\nAccess endpoints:")
        print("   API: http://localhost:8000")
        print("   Dashboard: http://localhost:3000")
        print("   API Docs: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"[ERROR] Error creating test data: {e}")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
