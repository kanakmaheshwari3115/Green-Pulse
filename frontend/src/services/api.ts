import axios from 'axios';
import { Park, HealthScore, SensorData, HealthScoreResponse, DashboardOverview, Alert } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const parkService = {
  getAllParks: async (): Promise<Park[]> => {
    const response = await api.get('/api/parks');
    return response.data;
  },

  getPark: async (parkId: string): Promise<Park> => {
    const response = await api.get(`/api/parks/${parkId}`);
    return response.data;
  },

  createPark: async (park: Park): Promise<void> => {
    await api.post('/api/parks', park);
  },

  updatePark: async (parkId: string, updates: Partial<Park>): Promise<void> => {
    await api.put(`/api/parks/${parkId}`, updates);
  },

  deletePark: async (parkId: string): Promise<void> => {
    await api.delete(`/api/parks/${parkId}`);
  },

  getParkHealth: async (parkId: string, days: number = 30): Promise<HealthScoreResponse> => {
    const response = await api.get(`/api/parks/${parkId}/health?days=${days}`);
    return response.data;
  },

  getCurrentHealthScore: async (parkId: string): Promise<HealthScore> => {
    const response = await api.get(`/api/parks/${parkId}/health/current`);
    return response.data;
  },

  getParkSummary: async (parkId: string): Promise<any> => {
    const response = await api.get(`/api/parks/${parkId}/summary`);
    return response.data;
  },
};

export const sensorService = {
  ingestSensorData: async (sensorData: SensorData): Promise<void> => {
    await api.post('/api/sensor-data', sensorData);
  },

  getLatestSensorData: async (
    parkId: string,
    sensorType?: string,
    hours: number = 24
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (sensorType) params.append('sensor_type', sensorType);
    params.append('hours', hours.toString());

    const response = await api.get(`/api/parks/${parkId}/sensors/latest?${params}`);
    return response.data;
  },

  getRealtimeSensorData: async (parkId: string): Promise<any> => {
    const response = await api.get(`/api/parks/${parkId}/sensors/realtime`);
    return response.data;
  },

  getSensorStatistics: async (parkId: string, days: number = 7): Promise<any> => {
    const response = await api.get(`/api/parks/${parkId}/sensors/statistics?days=${days}`);
    return response.data;
  },
};

export const analyticsService = {
  getSensorTrends: async (parkId: string, days: number = 7): Promise<any> => {
    const response = await api.get(`/api/analytics/parks/${parkId}/sensor-trends?days=${days}`);
    return response.data;
  },

  getHealthTrends: async (parkId: string, days: number = 30): Promise<any> => {
    const response = await api.get(`/api/analytics/parks/${parkId}/health-trends?days=${days}`);
    return response.data;
  },

  compareParks: async (parkIds: string[], metric: string = 'overall_score', days: number = 30): Promise<any> => {
    const params = new URLSearchParams();
    parkIds.forEach(id => params.append('park_ids', id));
    params.append('metric', metric);
    params.append('days', days.toString());

    const response = await api.get(`/api/analytics/parks/compare?${params}`);
    return response.data;
  },

  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get('/api/analytics/dashboard/overview');
    return response.data;
  },

  getAlerts: async (parkId?: string, severity?: string, hours: number = 24): Promise<{ alerts: Alert[]; count: number }> => {
    const params = new URLSearchParams();
    if (parkId) params.append('park_id', parkId);
    if (severity) params.append('severity', severity);
    params.append('hours', hours.toString());

    const response = await api.get(`/api/analytics/alerts?${params}`);
    return response.data;
  },

  getHeatmapData: async (parkId: string, sensorType: string = 'temperature', hours: number = 1): Promise<any> => {
    const response = await api.get(`/api/analytics/parks/${parkId}/heatmap-data?sensor_type=${sensorType}&hours=${hours}`);
    return response.data;
  },
};


export const agriService = {
  diagnoseCrop: async (cropHint: string, imageBase64?: string): Promise<any> => {
    const response = await api.post('/api/agri/diagnose-json', {
      crop_hint: cropHint,
      image_base64: imageBase64 || null
    });
    return response.data;
  },

  getRegenerativeAdvisory: async (params: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    moisture: number;
    state_code: string;
    season: string;
    water_availability: string;
  }): Promise<any> => {
    const response = await api.post('/api/agri/regenerative-recommendation', params);
    return response.data;
  },

  getSatelliteAndWeather: async (lat: number = 28.6139, lon: number = 77.2090): Promise<any> => {
    const response = await api.get(`/api/agri/satellite-weather?lat=${lat}&lon=${lon}`);
    return response.data;
  },

  getFarms: async (): Promise<any[]> => {
    const response = await api.get('/api/agri/farms');
    return response.data;
  },

  getStateDPGModels: async (): Promise<any> => {
    const response = await api.get('/api/agri/dpg/states');
    return response.data;
  },

  exportDPGSchema: async (): Promise<any> => {
    const response = await api.get('/api/agri/dpg/export-schema');
    return response.data;
  }
};
