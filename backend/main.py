from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from database import connect_to_mongo, close_mongo_connection
from api import sensor_data, parks, analytics, websocket_manager, heartbeat, agri

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="GreenPulse Agri-DPG API",
    description="Interoperable Digital Public Good for Climate-Resilient Agriculture, Regenerative Advisories & Crop Health Diagnostics",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agri.router, prefix="/api", tags=["agri-advisory"])
app.include_router(sensor_data.router, prefix="/api", tags=["sensor-data"])
app.include_router(parks.router, prefix="/api", tags=["farms"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(heartbeat.router, prefix="/api", tags=["heartbeat"])

@app.get("/")
async def root():
    return {"message": "GreenPulse API is running", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "greenpulse-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
