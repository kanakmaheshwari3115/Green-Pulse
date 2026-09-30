export interface SensorReading {
  sensor_type: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface SensorData {
  node_id: string;
  park_id: string;
  readings: SensorReading[];
  location?: {
    lat: number;
    lon: number;
  };
  timestamp: string;
}

export interface Park {
  park_id: string;
  name: string;
  location: {
    lat: number;
    lon: number;
  };
  area: number;
  tree_count?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthScore {
  park_id: string;
  overall_score: number;
  tree_health_score: number;
  microclimate_score: number;
  soil_water_score: number;
  biodiversity_score: number;
  infrastructure_score: number;
  factors: Record<string, any>;
  timestamp: string;
}

export interface HealthScoreResponse {
  park_id: string;
  current_score: HealthScore;
  historical_scores: HealthScore[];
  trend: string;
  recommendations: string[];
}

export interface Alert {
  alert_id: string;
  park_id: string;
  node_id?: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: Record<string, any>;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface DashboardOverview {
  total_parks: number;
  active_nodes: number;
  average_health_score: number;
  parks_with_data: number;
  active_node_ids: string[];
}

export interface SensorTrend {
  sensor_type: string;
  unit: string;
  data: Array<{
    date: string;
    average: number;
    minimum: number;
    maximum: number;
    count: number;
  }>;
}

export interface WebSocketMessage {
  type: string;
  timestamp: string;
  data: any;
  park_id?: string;
}

export interface Farm extends Park {
  farm_id?: string;
  state?: string;
  district?: string;
  farmer_name?: string;
  area_acres?: number;
  current_crop?: string;
  soil_type?: string;
}

export interface DiseaseDiagnosisResult {
  crop_type: string;
  disease_name: string;
  severity: string;
  confidence_score: number;
  symptoms_identified: string;
  visual_metrics: {
    chlorosis_percentage: number;
    necrotic_lesion_density: number;
  };
  organic_remedies: string[];
  chemical_remedies: string[];
  preventive_practices: string[];
  advisory_generated_at: string;
}

export interface RegenerativeAdvisoryResult {
  state: string;
  agro_climatic_zone: string;
  season: string;
  soil_type: string;
  primary_recommended_crop: string;
  regenerative_companion_crop: string;
  soil_conservation_plan: string[];
  companion_crop_options: string[];
  water_savings_percentage_indicative: number;
  water_savings_basis: string;
  soil_carbon_sequestration_rating: string;
  state_proven_practices: string[];
  advisory_summary: string;
}

export interface SatelliteWeatherResult {
  satellite_intelligence: {
    source: string;
    resolution: string;
    ndvi: number;
    ndvi_status: string;
    ndwi_water_index: number;
    chlorophyll_absorption_ratio: number;
    soil_moisture_stress_index: string;
  };
  weather_intelligence: {
    current_temperature: number;
    current_humidity: number;
    forecast_7_days: Array<{
      date: string;
      day_name: string;
      temp_max: number;
      temp_min: number;
      humidity: number;
      rain_probability: number;
      precipitation_mm: number;
      condition: string;
    }>;
    agro_weather_advisory: string;
  };
}

export interface StateDPGModelResult {
  dpg_specification: string;
  version: string;
  cross_state_collaborations: Array<{
    partnership: string;
    focus: string;
    impact: string;
  }>;
  states_participating: Array<{
    state_code: string;
    state_name: string;
    agro_climatic_zone: string;
    primary_soil: string;
    resilience_score: number;
    shared_models_count: number;
    active_farmer_nodes: number;
    key_regenerative_practices: string[];
    interoperability_standard: string;
  }>;
}
