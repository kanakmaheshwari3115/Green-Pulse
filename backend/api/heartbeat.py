from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from datetime import datetime, timedelta
from database import get_collection

router = APIRouter()

@router.post("/heartbeat", response_model=dict)
async def receive_heartbeat(
    heartbeat_data: Dict[str, Any],
    collection=Depends(lambda: get_collection("heartbeats"))
):
    try:
        heartbeat_data["timestamp"] = datetime.utcnow()
        heartbeat_data["_id"] = f"{heartbeat_data['node_id']}_{heartbeat_data['timestamp'].isoformat()}"
        
        await collection.insert_one(heartbeat_data)
        
        return {"status": "success", "message": "Heartbeat received"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process heartbeat: {str(e)}")

@router.get("/nodes/status")
async def get_node_status(
    hours: int = 1,
    collection=Depends(lambda: get_collection("heartbeats"))
):
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        pipeline = [
            {"$match": {"timestamp": {"$gte": cutoff_time}}},
            {"$sort": {"timestamp": -1}},
            {"$group": {
                "_id": "$node_id",
                "latest_heartbeat": {"$first": "$timestamp"},
                "status": {"$first": "$status"},
                "park_id": {"$first": "$park_id"},
                "heartbeat_count": {"$sum": 1}
            }}
        ]
        
        cursor = collection.aggregate(pipeline)
        results = await cursor.to_list(length=100)
        
        node_status = []
        for result in results:
            time_since_heartbeat = datetime.utcnow() - result["latest_heartbeat"]
            is_online = time_since_heartbeat.total_seconds() < 300  # 5 minutes
            
            node_status.append({
                "node_id": result["_id"],
                "park_id": result["park_id"],
                "status": "online" if is_online else "offline",
                "last_heartbeat": result["latest_heartbeat"],
                "heartbeat_count": result["heartbeat_count"]
            })
        
        return {"nodes": node_status, "total_nodes": len(node_status)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get node status: {str(e)}")
