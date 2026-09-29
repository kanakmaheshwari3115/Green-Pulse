from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from database import get_collection
from models import SensorAnalytics, AnalyticsRequest
from scoring import EcologicalScorer

router = APIRouter()

@router.get("/analytics/parks/{park_id}/sensor-trends")
async def get_sensor_trends(
    park_id: str,
    days: int = Query(7, ge=1, le=365),
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
                "_id": {
                    "sensor_type": "$readings.sensor_type",
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}}
                },
                "avg_value": {"$avg": "$readings.value"},
                "min_value": {"$min": "$readings.value"},
                "max_value": {"$max": "$readings.value"},
                "count": {"$sum": 1},
                "unit": {"$first": "$readings.unit"}
            }},
            {"$sort": {"_id.sensor_type": 1, "_id.date": 1}}
        ]
        
        cursor = sensor_collection.aggregate(pipeline)
        results = await cursor.to_list(length=1000)
        
        trends = {}
        for result in results:
            sensor_type = result["_id"]["sensor_type"]
            date = result["_id"]["date"]
            
            if sensor_type not in trends:
                trends[sensor_type] = {
                    "unit": result["unit"],
                    "data": []
                }
            
            trends[sensor_type]["data"].append({
                "date": date,
                "average": round(result["avg_value"], 2),
                "minimum": result["min_value"],
                "maximum": result["max_value"],
                "count": result["count"]
            })
        
        return {"park_id": park_id, "period_days": days, "trends": trends}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sensor trends: {str(e)}")

@router.get("/analytics/parks/{park_id}/health-trends")
async def get_health_trends(
    park_id: str,
    days: int = Query(30, ge=1, le=365),
    health_collection=Depends(lambda: get_collection("health_scores"))
):
    try:
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        cursor = health_collection.find({
            "park_id": park_id,
            "timestamp": {"$gte": cutoff_time}
        }).sort("timestamp", 1)
        
        scores = await cursor.to_list(length=500)
        
        if not scores:
            return {"park_id": park_id, "period_days": days, "trends": {}}
        
        trends = {
            "overall_score": [],
            "tree_health_score": [],
            "microclimate_score": [],
            "soil_water_score": [],
            "biodiversity_score": [],
            "infrastructure_score": []
        }
        
        for score in scores:
            timestamp = score["timestamp"]
            for metric in trends.keys():
                trends[metric].append({
                    "timestamp": timestamp,
                    "value": score[metric]
                })
        
        return {"park_id": park_id, "period_days": days, "trends": trends}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch health trends: {str(e)}")

@router.get("/analytics/parks/compare")
async def compare_parks(
    park_ids: List[str] = Query(...),
    metric: str = Query("overall_score"),
    days: int = Query(30, ge=1, le=365),
    health_collection=Depends(lambda: get_collection("health_scores"))
):
    try:
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        comparison = {}
        
        for park_id in park_ids:
            cursor = health_collection.find({
                "park_id": park_id,
                "timestamp": {"$gte": cutoff_time}
            }).sort("timestamp", -1).limit(1)
            
            latest_score = await cursor.to_list(length=1)
            
            if latest_score:
                comparison[park_id] = {
                    "current_value": latest_score[0].get(metric, 0),
                    "last_updated": latest_score[0]["timestamp"]
                }
            else:
                comparison[park_id] = {
                    "current_value": None,
                    "last_updated": None
                }
        
        return {"park_ids": park_ids, "metric": metric, "period_days": days, "comparison": comparison}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare parks: {str(e)}")

@router.get("/analytics/dashboard/overview")
async def get_dashboard_overview(
    parks_collection=Depends(lambda: get_collection("parks")),
    health_collection=Depends(lambda: get_collection("health_scores")),
    sensor_collection=Depends(lambda: get_collection("sensor_data"))
):
    try:
        total_parks = await parks_collection.count_documents({})
        
        cutoff_time_24h = datetime.utcnow() - timedelta(hours=24)
        active_nodes = await sensor_collection.distinct("node_id", {
            "timestamp": {"$gte": cutoff_time_24h}
        })
        
        pipeline = [
            {"$group": {
                "_id": "$park_id",
                "latest_score": {"$first": "$overall_score"},
                "timestamp": {"$first": "$timestamp"}
            }},
            {"$group": {
                "_id": None,
                "avg_health_score": {"$avg": "$latest_score"},
                "total_parks_with_data": {"$sum": 1}
            }}
        ]
        
        cursor = health_collection.aggregate(pipeline)
        health_stats = await cursor.to_list(length=1)
        
        overview = {
            "total_parks": total_parks,
            "active_nodes": len(active_nodes),
            "average_health_score": round(health_stats[0]["avg_health_score"], 2) if health_stats else 0,
            "parks_with_data": health_stats[0]["total_parks_with_data"] if health_stats else 0,
            "active_node_ids": active_nodes
        }
        
        return overview
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard overview: {str(e)}")

@router.get("/analytics/alerts")
async def get_alerts(
    park_id: Optional[str] = None,
    severity: Optional[str] = Query(None),
    hours: int = Query(24, ge=1, le=168),
    alerts_collection=Depends(lambda: get_collection("alerts"))
):
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        match_query = {
            "created_at": {"$gte": cutoff_time},
            "resolved": False
        }
        
        if park_id:
            match_query["park_id"] = park_id
        
        if severity:
            match_query["severity"] = severity
        
        cursor = alerts_collection.find(match_query).sort("created_at", -1)
        alerts = await cursor.to_list(length=100)
        
        return {"alerts": alerts, "count": len(alerts)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

@router.get("/analytics/parks/{park_id}/heatmap-data")
async def get_heatmap_data(
    park_id: str,
    sensor_type: str = Query("temperature"),
    hours: int = Query(1, ge=1, le=24),
    sensor_collection=Depends(lambda: get_collection("sensor_data"))
):
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        pipeline = [
            {"$match": {
                "park_id": park_id,
                "timestamp": {"$gte": cutoff_time},
                "readings.sensor_type": sensor_type
            }},
            {"$unwind": "$readings"},
            {"$match": {"readings.sensor_type": sensor_type}},
            {"$group": {
                "_id": "$location",
                "avg_value": {"$avg": "$readings.value"},
                "count": {"$sum": 1},
                "unit": {"$first": "$readings.unit"}
            }},
            {"$match": {"_id": {"$ne": None}}}
        ]
        
        cursor = sensor_collection.aggregate(pipeline)
        results = await cursor.to_list(length=50)
        
        heatmap_points = []
        for result in results:
            if result["_id"]:
                heatmap_points.append({
                    "location": result["_id"],
                    "value": round(result["avg_value"], 2),
                    "intensity": result["count"],
                    "unit": result["unit"]
                })
        
        return {"park_id": park_id, "sensor_type": sensor_type, "heatmap_points": heatmap_points}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch heatmap data: {str(e)}")

@router.get("/analytics/reports/summary")
async def generate_summary_report(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    parks_collection=Depends(lambda: get_collection("parks")),
    health_collection=Depends(lambda: get_collection("health_scores")),
    sensor_collection=Depends(lambda: get_collection("sensor_data"))
):
    try:
        pipeline = [
            {"$match": {
                "timestamp": {"$gte": start_date, "$lte": end_date}
            }},
            {"$group": {
                "_id": "$park_id",
                "avg_overall_score": {"$avg": "$overall_score"},
                "max_score": {"$max": "$overall_score"},
                "min_score": {"$min": "$overall_score"},
                "data_points": {"$sum": 1}
            }},
            {"$sort": {"avg_overall_score": -1}}
        ]
        
        cursor = health_collection.aggregate(pipeline)
        park_performance = await cursor.to_list(length=100)
        
        sensor_pipeline = [
            {"$match": {
                "timestamp": {"$gte": start_date, "$lte": end_date}
            }},
            {"$unwind": "$readings"},
            {"$group": {
                "_id": "$readings.sensor_type",
                "avg_value": {"$avg": "$readings.value"},
                "total_readings": {"$sum": 1}
            }}
        ]
        
        sensor_cursor = sensor_collection.aggregate(sensor_pipeline)
        sensor_summary = await sensor_cursor.to_list(length=10)
        
        report = {
            "period": {
                "start_date": start_date,
                "end_date": end_date,
                "days": (end_date - start_date).days
            },
            "park_performance": park_performance,
            "sensor_summary": sensor_summary,
            "generated_at": datetime.utcnow()
        }
        
        return report
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary report: {str(e)}")
