from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.park_subscribers: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        self.active_connections[client_id].append(websocket)
        print(f"Client {client_id} connected")

    def disconnect(self, websocket: WebSocket, client_id: str):
        if client_id in self.active_connections:
            self.active_connections[client_id].remove(websocket)
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]
        
        for park_id, subscribers in self.park_subscribers.items():
            if websocket in subscribers:
                subscribers.remove(websocket)
        
        print(f"Client {client_id} disconnected")

    async def subscribe_to_park(self, websocket: WebSocket, park_id: str):
        if park_id not in self.park_subscribers:
            self.park_subscribers[park_id] = []
        self.park_subscribers[park_id].append(websocket)

    async def unsubscribe_from_park(self, websocket: WebSocket, park_id: str):
        if park_id in self.park_subscribers:
            if websocket in self.park_subscribers[park_id]:
                self.park_subscribers[park_id].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            pass

    async def broadcast_to_all(self, message: dict):
        message_str = json.dumps(message)
        disconnected_clients = []
        
        for client_id, connections in self.active_connections.items():
            for connection in connections[:]:
                try:
                    await connection.send_text(message_str)
                except:
                    connections.remove(connection)

    async def broadcast_to_park_subscribers(self, park_id: str, message: dict):
        if park_id not in self.park_subscribers:
            return
        
        message_str = json.dumps(message)
        message["park_id"] = park_id
        
        for connection in self.park_subscribers[park_id][:]:
            try:
                await connection.send_text(message_str)
            except:
                self.park_subscribers[park_id].remove(connection)

    async def send_sensor_update(self, park_id: str, sensor_data: dict):
        message = {
            "type": "sensor_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": sensor_data
        }
        await self.broadcast_to_park_subscribers(park_id, message)

    async def send_health_update(self, park_id: str, health_score: dict):
        message = {
            "type": "health_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": health_score
        }
        await self.broadcast_to_park_subscribers(park_id, message)

    async def send_alert(self, park_id: str, alert: dict):
        message = {
            "type": "alert",
            "timestamp": datetime.utcnow().isoformat(),
            "data": alert
        }
        await self.broadcast_to_park_subscribers(park_id, message)

manager = ConnectionManager()
