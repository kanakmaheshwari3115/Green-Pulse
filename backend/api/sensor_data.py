from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from datetime import datetime, timedelta
from database import get_collection
from models import SensorData, ImageData, HealthScore
from scoring import EcologicalScorer
import asyncio

router = APIRouter()

@router.post("/sensor-data", response_model=dict)
async def ingest_sensor_data(
    sensor_data: SensorData,
    background_tasks: BackgroundTasks,
    collection=Depends(lambda: get_collection("sensor_data"))
):
    try:
        data_dict = sensor_data.dict()
        data_dict["_id"] = f"{sensor_data.node_id}_{sensor_data.timestamp.isoformat()}"
        
        await collection.insert_one(data_dict)
        
        background_tasks.add_task(process_health_score, sensor_data.park_id)
        
        return {"status": "success", "message": "Sensor data ingested successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest sensor data: {str(e)}")

@router.post("/image-data", response_model=dict)
async def ingest_image_data(
    image_data: ImageData,
    background_tasks: BackgroundTasks,
    collection=Depends(lambda: get_collection("image_data"))
):
    try:
        data_dict = image_data.dict()
        data_dict["_id"] = f"{image_data.node_id}_image_{image_data.timestamp.isoformat()}"
        
        await collection.insert_one(data_dict)
        
        background_tasks.add_task(process_health_score, image_data.park_id)
        
        return {"status": "success", "message": "Image data ingested successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest image data: {str(e)}")

@router.get("/parks/{park_id}/sensors/latest")
async def get_latest_sensor_data(
    park_id: str,
    sensor_type: Optional[str] = None,
    hours: int = 24,
    sensor_collection=Depends(lambda: get_collection("sensor_data"))
):
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        match_query = {
            "park_id": park_id,
            "timestamp": {"$gte": cutoff_time}
        }
        
        if sensor_type:
            match_query["readings.sensor_type"] = sensor_type
        
        pipeline = [
            {"$match": match_query},
            {"$sort": {"timestamp": -1}},
            {"$limit": 100},
            {"$unwind": "$readings"},
            {"$sort": {"timestamp": -1}}
        ]
        
        if sensor_type:
            pipeline.insert(3, {"$match": {"readings.sensor_type": sensor_type}})
        
        cursor = sensor_collection.aggregate(pipeline)
        results = await cursor.to_list(length=100)
        
        return {"park_id": park_id, "data": results, "count": len(results)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sensor data: {str(e)}")

@router.get("/parks/{park_id}/sensors/realtime")
async def get_realtime_sensor_data(
    park_id: str,
    sensor_collection=Depends(lambda: get_collection("sensor_data"))
):
    try:
        cutoff_time = datetime.utcnow() - timedelta(minutes=5)
        
        pipeline = [
            {"$match": {
                "park_id": park_id,
                "timestamp": {"$gte": cutoff_time}
            }},
            {"$sort": {"timestamp": -1}},
            {"$limit": 10},
            {"$unwind": "$readings"},
            {"$group": {
                "_id": "$readings.sensor_type",
                "latest_value": {"$first": "$readings.value"},
                "latest_timestamp": {"$first": "$timestamp"},
                "unit": {"$first": "$readings.unit"}
            }}
        ]
        
        cursor = sensor_collection.aggregate(pipeline)
        results = await cursor.to_list(length=10)
        
        formatted_results = []
        for result in results:
            formatted_results.append({
                "sensor_type": result["_id"],
                "value": result["latest_value"],
                "unit": result["unit"],
                "timestamp": result["latest_timestamp"]
            })
        
        return {"park_id": park_id, "realtime_data": formatted_results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch realtime data: {str(e)}")

async def process_health_score(park_id: str):
    try:
        sensor_collection = get_collection("sensor_data")
        image_collection = get_collection("image_data")
        health_collection = get_collection("health_scores")
        parks_collection = get_collection("parks")
        
        cutoff_time = datetime.utcnow() - timedelta(hours=1)
        
        sensor_cursor = sensor_collection.find({
            "park_id": park_id,
            "timestamp": {"$gte": cutoff_time}
        })
        sensor_data = await sensor_cursor.to_list(length=100)
        
        image_cursor = image_collection.find({
            "park_id": park_id,
            "timestamp": {"$gte": cutoff_time}
        })
        image_data = await image_cursor.to_list(length=10)
        
        park_doc = await parks_collection.find_one({"park_id": park_id})
        tree_count = park_doc.get("tree_count") if park_doc else None
        
        scorer = EcologicalScorer()
        
        sensor_objects = []
        for data in sensor_data:
            sensor_objects.append(SensorData(**data))
        
        image_analysis = None
        if image_data:
            latest_image = max(image_data, key=lambda x: x["timestamp"])
            image_analysis = latest_image.get("analysis_results")
        
        health_score = scorer.calculate_overall_score(
            sensor_objects, image_analysis, tree_count
        )
        
        health_dict = health_score.dict()
        health_dict["_id"] = f"{park_id}_{health_score.timestamp.isoformat()}"
        
        await health_collection.insert_one(health_dict)
        
        recommendations = scorer.generate_recommendations(health_score)
        
        print(f"âœ… Health score calculated for {park_id}: {health_score.overall_score}/10")
        
    except Exception as e:
        print(f"âŒ Failed to process health score for {park_id}: {str(e)}")

@router.get("/parks/{park_id}/sensors/statistics")
async def get_sensor_statistics(
    park_id: str,
    days: int = 7,
    sensor_collection=Depends(lambda: get_collection("sensor_data"))
):
    try:
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        pipeline = [
            {"$match": {
                "park_id": park_id,
                "timestamp": {"$gte": cutoff_time}
            }},
            {"$unwind": "$readings"},
            {"$group": {
                "_id": "$readings.sensor_type",
                "avg_value": {"$avg": "$readings.value"},
                "min_value": {"$min": "$readings.value"},
                "max_value": {"$max": "$readings.value"},
                "count": {"$sum": 1},
                "unit": {"$first": "$readings.unit"}
            }}
        ]
        
        cursor = sensor_collection.aggregate(pipeline)
        results = await cursor.to_list(length=10)
        
        formatted_results = []
        for result in results:
            formatted_results.append({
                "sensor_type": result["_id"],
                "average": round(result["avg_value"], 2),
                "minimum": result["min_value"],
                "maximum": result["max_value"],
                "count": result["count"],
                "unit": result["unit"]
            })
        
        return {"park_id": park_id, "period_days": days, "statistics": formatted_results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sensor statistics: {str(e)}")

