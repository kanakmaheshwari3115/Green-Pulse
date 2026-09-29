from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from api.websocket_manager import manager
import json
import uuid

router = APIRouter()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "subscribe_park":
                park_id = message.get("park_id")
                if park_id:
                    await manager.subscribe_to_park(websocket, park_id)
                    await manager.send_personal_message(
                        json.dumps({"type": "subscription_confirmed", "park_id": park_id}),
                        websocket
                    )
            
            elif message_type == "unsubscribe_park":
                park_id = message.get("park_id")
                if park_id:
                    await manager.unsubscribe_from_park(websocket, park_id)
                    await manager.send_personal_message(
                        json.dumps({"type": "unsubscription_confirmed", "park_id": park_id}),
                        websocket
                    )
            
            elif message_type == "ping":
                await manager.send_personal_message(
                    json.dumps({"type": "pong", "timestamp": message.get("timestamp")}),
                    websocket
                )
            
            else:
                await manager.send_personal_message(
                    json.dumps({"type": "error", "message": "Unknown message type"}),
                    websocket
                )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)

@router.websocket("/ws/park/{park_id}")
async def park_websocket_endpoint(websocket: WebSocket, park_id: str):
    client_id = f"park_{park_id}_{uuid.uuid4().hex[:8]}"
    await manager.connect(websocket, client_id)
    await manager.subscribe_to_park(websocket, park_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await manager.send_personal_message(
                    json.dumps({
                        "type": "pong", 
                        "timestamp": message.get("timestamp"),
                        "park_id": park_id
                    }),
                    websocket
                )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
