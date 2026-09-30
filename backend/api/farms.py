from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from database import get_collection
from models import Park, HealthScoreResponse, HealthScore
from scoring import EcologicalScorer
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/parks", response_model=dict)
async def create_park(
    park: Park,
    collection=Depends(lambda: get_collection("parks"))
):
    try:
        park_dict = park.dict()
        park_dict["_id"] = park.park_id
        
        existing = await collection.find_one({"park_id": park.park_id})
        if existing:
            raise HTTPException(status_code=400, detail="Park already exists")
        
        await collection.insert_one(park_dict)
        
        return {"status": "success", "message": "Park created successfully", "park_id": park.park_id}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create park: {str(e)}")

@router.get("/parks", response_model=List[Park])
async def get_all_parks(
    collection=Depends(lambda: get_collection("parks"))
):
    try:
        cursor = collection.find({})
        parks = await cursor.to_list(length=100)
        return [Park(**park) for park in parks]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch parks: {str(e)}")

@router.get("/parks/{park_id}", response_model=Park)
async def get_park(
    park_id: str,
    collection=Depends(lambda: get_collection("parks"))
):
    try:
        park_doc = await collection.find_one({"park_id": park_id})
        if not park_doc:
            raise HTTPException(status_code=404, detail="Park not found")
        
        return Park(**park_doc)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch park: {str(e)}")

@router.put("/parks/{park_id}", response_model=dict)
async def update_park(
    park_id: str,
    park_update: dict,
    collection=Depends(lambda: get_collection("parks"))
):
    try:
        park_update["updated_at"] = datetime.utcnow()
        
        result = await collection.update_one(
            {"park_id": park_id},
            {"$set": park_update}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Park not found")
        
        return {"status": "success", "message": "Park updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update park: {str(e)}")

@router.delete("/parks/{park_id}", response_model=dict)
async def delete_park(
    park_id: str,
    parks_collection=Depends(lambda: get_collection("parks")),
    sensor_collection=Depends(lambda: get_collection("sensor_data")),
    health_collection=Depends(lambda: get_collection("health_scores"))
):
    try:
        await parks_collection.delete_one({"park_id": park_id})
        await sensor_collection.delete_many({"park_id": park_id})
        await health_collection.delete_many({"park_id": park_id})
        
        return {"status": "success", "message": "Park and all associated data deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete park: {str(e)}")

@router.get("/parks/{park_id}/health", response_model=HealthScoreResponse)
async def get_park_health(
    park_id: str,
    days: int = 30,
    health_collection=Depends(lambda: get_collection("health_scores")),
    parks_collection=Depends(lambda: get_collection("parks"))
):
    try:
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        cursor = health_collection.find({
            "park_id": park_id,
            "timestamp": {"$gte": cutoff_time}
        }).sort("timestamp", -1)
        
        health_scores = await cursor.to_list(length=100)
        
        if not health_scores:
            raise HTTPException(status_code=404, detail="No health data found for this park")
        
        current_score = HealthScore(**health_scores[0])
        
        historical_scores = [HealthScore(**score) for score in health_scores[1:]]
        
        trend = calculate_trend([score.overall_score for score in health_scores])
        
        scorer = EcologicalScorer()
        recommendations = scorer.generate_recommendations(current_score)
        
        return HealthScoreResponse(
            park_id=park_id,
            current_score=current_score,
            historical_scores=historical_scores,
            trend=trend,
            recommendations=recommendations
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch park health: {str(e)}")

@router.get("/parks/{park_id}/health/current")
async def get_current_health_score(
    park_id: str,
    health_collection=Depends(lambda: get_collection("health_scores"))
):
    try:
        cursor = health_collection.find({"park_id": park_id}).sort("timestamp", -1).limit(1)
        results = await cursor.to_list(length=1)
        
        if not results:
            raise HTTPException(status_code=404, detail="No health data found for this park")
        
        return HealthScore(**results[0])
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch current health score: {str(e)}")

@router.get("/parks/{park_id}/summary")
async def get_park_summary(
    park_id: str,
    parks_collection=Depends(lambda: get_collection("parks")),
    sensor_collection=Depends(lambda: get_collection("sensor_data")),
    health_collection=Depends(lambda: get_collection("health_scores"))
):
    try:
        park_doc = await parks_collection.find_one({"park_id": park_id})
        if not park_doc:
            raise HTTPException(status_code=404, detail="Park not found")
        
        cutoff_time_24h = datetime.utcnow() - timedelta(hours=24)
        
        sensor_count = await sensor_collection.count_documents({
            "park_id": park_id,
            "timestamp": {"$gte": cutoff_time_24h}
        })
        
        latest_health_cursor = health_collection.find({"park_id": park_id}).sort("timestamp", -1).limit(1)
        latest_health = await latest_health_cursor.to_list(length=1)
        
        summary = {
            "park_id": park_id,
            "name": park_doc["name"],
            "location": park_doc["location"],
            "area": park_doc["area"],
            "tree_count": park_doc.get("tree_count"),
            "sensor_readings_24h": sensor_count,
            "current_health_score": latest_health[0]["overall_score"] if latest_health else None,
            "last_updated": latest_health[0]["timestamp"] if latest_health else None
        }
        
        return summary
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch park summary: {str(e)}")

def calculate_trend(scores: List[float]) -> str:
    if len(scores) < 2:
        return "stable"
    
    recent_scores = scores[:min(7, len(scores))]
    older_scores = scores[min(7, len(scores)):min(14, len(scores))]
    
    if not older_scores:
        return "stable"
    
    recent_avg = sum(recent_scores) / len(recent_scores)
    older_avg = sum(older_scores) / len(older_scores)
    
    difference = recent_avg - older_avg
    
    if difference > 0.5:
        return "improving"
    elif difference < -0.5:
        return "declining"
    else:
        return "stable"
