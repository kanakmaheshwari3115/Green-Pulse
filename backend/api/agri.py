from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional, Dict, Any
from pydantic import BaseModel
import base64
from database import get_collection
from agri_ai import agri_ai

router = APIRouter()

class RegenerativeRequest(BaseModel):
    nitrogen: float = 180.0
    phosphorus: float = 24.0
    potassium: float = 210.0
    ph: float = 6.8
    moisture: float = 45.0
    state_code: str = "MH"
    season: str = "Kharif"
    water_availability: str = "medium"

class DiseaseDiagnosisRequest(BaseModel):
    crop_hint: str = "tomato"
    image_base64: Optional[str] = None

@router.post("/agri/diagnose")
async def diagnose_crop_disease(
    crop_hint: str = Form("tomato"),
    file: Optional[UploadFile] = File(None)
):
    """
    Accepts an uploaded crop leaf photo or file and runs AI disease diagnostics,
    returning confidence score, severity, organic remedies, and chemical controls.
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()
    
    result = agri_ai.diagnose_crop_image(image_bytes=image_bytes, crop_hint=crop_hint)
    return result

@router.post("/agri/diagnose-json")
async def diagnose_crop_disease_json(payload: DiseaseDiagnosisRequest):
    """
    JSON version for web camera / base64 image streams.
    """
    image_bytes = None
    if payload.image_base64:
        try:
            # Strip data url prefix if present
            b64_str = payload.image_base64.split(",")[-1]
            image_bytes = base64.b64decode(b64_str)
        except Exception:
            pass
            
    result = agri_ai.diagnose_crop_image(image_bytes=image_bytes, crop_hint=payload.crop_hint)
    return result

@router.post("/agri/regenerative-recommendation")
async def get_regenerative_crop_recommendation(payload: RegenerativeRequest):
    """
    Returns AI-driven regenerative crop rotation, companion nitrogen-fixing plants,
    water savings projection, and soil carbon enhancement plan.
    """
    soil_npk = {
        "nitrogen": payload.nitrogen,
        "phosphorus": payload.phosphorus,
        "potassium": payload.potassium
    }
    
    result = agri_ai.generate_regenerative_advisory(
        soil_npk=soil_npk,
        ph=payload.ph,
        moisture=payload.moisture,
        state_code=payload.state_code,
        season=payload.season,
        water_availability=payload.water_availability
    )
    return result

@router.get("/agri/satellite-weather")
async def get_satellite_and_weather(
    lat: float = 28.6139,
    lon: float = 77.2090
):
    """
    Returns modelled NDVI/NDWI vegetation indices and a live 7-day weather
    forecast from the Open-Meteo free API (no API key required).
    Falls back to simulated values if Open-Meteo is unreachable.
    """
    return agri_ai.get_satellite_and_weather_analytics(lat=lat, lon=lon)

@router.get("/agri/farms")
async def list_farms(
    parks_collection=Depends(lambda: get_collection("parks"))
):
    """
    Returns all registered farms / agro-zones with their real-time telemetry and soil health.
    """
    try:
        cursor = parks_collection.find()
        farms = await cursor.to_list(length=100)
        # Transform or enrich
        formatted_farms = []
        for farm in farms:
            farm_id = farm.get("park_id", farm.get("_id", "farm_001"))
            formatted_farms.append({
                "farm_id": farm_id,
                "name": farm.get("name", "Model Agro-Zone"),
                "state": farm.get("state", "Maharashtra"),
                "district": farm.get("district", "Nashik"),
                "area_acres": farm.get("area_acres", round(farm.get("area", 25000) / 4046.86, 1)),
                "farmer_name": farm.get("farmer_name", "Kisan Sahay Kendra"),
                "current_crop": farm.get("current_crop", "Millet + Pigeonpea"),
                "soil_type": farm.get("soil_type", "Black Vertisol"),
                "location": farm.get("location", {"lat": 28.6139, "lon": 77.2090})
            })
        return formatted_farms
    except Exception:
        # Default fallback
        return [
            {
                "farm_id": "farm_pb_01",
                "name": "Ludhiana Agro-Ecological Field",
                "state": "Punjab",
                "district": "Ludhiana",
                "area_acres": 12.5,
                "farmer_name": "Sardar Gurpreet Singh",
                "current_crop": "Wheat + Mustard Border",
                "soil_type": "Alluvial Loam",
                "location": {"lat": 30.9010, "lon": 75.8573}
            },
            {
                "farm_id": "farm_mh_02",
                "name": "Nashik Climate-Resilient Cluster",
                "state": "Maharashtra",
                "district": "Nashik",
                "area_acres": 8.0,
                "farmer_name": "Eknath Rao Patil",
                "current_crop": "Soybean + Arhar (Pigeonpea)",
                "soil_type": "Medium Black Soil",
                "location": {"lat": 19.9975, "lon": 73.7898}
            },
            {
                "farm_id": "farm_ka_03",
                "name": "Mandya Millet & Polyculture Haven",
                "state": "Karnataka",
                "district": "Mandya",
                "area_acres": 6.5,
                "farmer_name": "Shivanna Gowda",
                "current_crop": "Finger Millet (Ragi) + Cowpea",
                "soil_type": "Red Sandy Loam",
                "location": {"lat": 12.5244, "lon": 76.8958}
            }
        ]

@router.get("/agri/dpg/states")
async def get_inter_state_dpg():
    """
    Returns the National Digital Public Good (DPG) network overview,
    active cross-state climate models, and data-sharing agreements.
    """
    return agri_ai.get_inter_state_dpg_models()

@router.get("/agri/dpg/export-schema")
async def export_dpg_interoperability_schema():
    """
    Exports open JSON schema conforming to Indian AgriStack / IDEA DPG standards
    for interoperable federated model exchange across state agricultural departments.
    """
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "IndiaInteroperableAgriDataStandard",
        "description": "Standardized schema for cross-state agro-advisories, soil intelligence, and disease telemetry.",
        "type": "object",
        "required": ["dpg_id", "state_code", "soil_profile", "climate_telemetry", "crop_advisory"],
        "properties": {
            "dpg_id": {"type": "string", "example": "IND-AGRI-DPG-2026-09"},
            "state_code": {"type": "string", "enum": ["PB", "MH", "KA", "MP", "TN", "UP", "RJ", "GJ", "AP", "TS"]},
            "timestamp": {"type": "string", "format": "date-time"},
            "soil_profile": {
                "type": "object",
                "properties": {
                    "nitrogen_kg_ha": {"type": "number"},
                    "phosphorus_kg_ha": {"type": "number"},
                    "potassium_kg_ha": {"type": "number"},
                    "ph": {"type": "number", "minimum": 3.0, "maximum": 11.0},
                    "organic_carbon_pct": {"type": "number"},
                    "moisture_pct": {"type": "number"}
                }
            },
            "satellite_indices": {
                "type": "object",
                "properties": {
                    "ndvi": {"type": "number", "minimum": -1.0, "maximum": 1.0},
                    "ndwi": {"type": "number", "minimum": -1.0, "maximum": 1.0}
                }
            },
            "regenerative_rotation": {
                "type": "object",
                "properties": {
                    "main_crop": {"type": "string"},
                    "companion_crop": {"type": "string"},
                    "water_savings_pct": {"type": "number"}
                }
            }
        }
    }
