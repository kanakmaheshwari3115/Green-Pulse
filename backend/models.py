from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class SensorType(str, Enum):
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    SOIL_MOISTURE = "soil_moisture"
    LIGHT_INTENSITY = "light_intensity"
    PH = "ph"
    TURBIDITY = "turbidity"

class SensorReading(BaseModel):
    sensor_type: SensorType
    value: float
    unit: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SensorData(BaseModel):
    node_id: str
    park_id: str
    readings: List[SensorReading]
    location: Optional[Dict[str, float]] = None  # {"lat": 28.123, "lon": 77.456}
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ImageData(BaseModel):
    node_id: str
    park_id: str
    image_path: str
    image_type: str  # "vegetation", "infrastructure", "water_body"
    analysis_results: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Park(BaseModel):
    park_id: str
    name: str
    location: Dict[str, float]  # {"lat": 28.123, "lon": 77.456}
    area: float  # in square meters
    tree_count: Optional[int] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class HealthScore(BaseModel):
    park_id: str
    overall_score: float = Field(ge=0, le=10)
    tree_health_score: float = Field(ge=0, le=10)
    microclimate_score: float = Field(ge=0, le=10)
    soil_water_score: float = Field(ge=0, le=10)
    biodiversity_score: float = Field(ge=0, le=10)
    infrastructure_score: float = Field(ge=0, le=10)
    factors: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Alert(BaseModel):
    alert_id: str
    park_id: str
    node_id: Optional[str] = None
    alert_type: str  # "sensor_anomaly", "health_decline", "maintenance_needed"
    severity: str  # "low", "medium", "high", "critical"
    message: str
    data: Dict[str, Any] = {}
    resolved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

class AnalyticsRequest(BaseModel):
    park_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    metrics: List[str] = []

class HealthScoreResponse(BaseModel):
    park_id: str
    current_score: HealthScore
    historical_scores: List[HealthScore] = []
    trend: str  # "improving", "declining", "stable"
    recommendations: List[str] = []

class SensorAnalytics(BaseModel):
    park_id: str
    sensor_type: SensorType
    current_value: float
    average_24h: float
    average_7d: float
    trend: str  # "increasing", "decreasing", "stable"
    status: str  # "optimal", "warning", "critical"
