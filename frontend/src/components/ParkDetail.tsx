import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { parkService, sensorService, analyticsService } from '../services/api';
import { websocketService } from '../services/websocket';
import { Park, HealthScore } from '../types';

export const ParkDetail: React.FC = () => {
  const { parkId } = useParams<{ parkId: string }>();
  const [park, setPark] = useState<Park | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [healthTrends, setHealthTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parkId) return;

    const fetchParkData = async () => {
      try {
        const [parkData, healthData, sensorDataResponse, trendsResponse] = await Promise.all([
          parkService.getPark(parkId),
          parkService.getCurrentHealthScore(parkId),
          sensorService.getRealtimeSensorData(parkId),
          analyticsService.getHealthTrends(parkId, 7)
        ]);

        setPark(parkData);
        setHealthScore(healthData);
        setSensorData(sensorDataResponse.realtime_data || []);
        setHealthTrends(trendsResponse.trends);

        websocketService.subscribeToPark(parkId);
      } catch (error) {
        console.error('Failed to fetch park data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParkData();

    const handleWebSocketMessage = (event: CustomEvent) => {
      const message = event.detail;
      if (message.park_id === parkId) {
        if (message.type === 'sensor_update') {
          setSensorData(prev => {
            const newData = [...prev];
            message.data.readings.forEach((reading: any) => {
              const existingIndex = newData.findIndex(item => item.sensor_type === reading.sensor_type);
              if (existingIndex >= 0) {
                newData[existingIndex] = { ...reading, timestamp: message.data.timestamp };
              } else {
                newData.push({ ...reading, timestamp: message.data.timestamp });
              }
            });
            return newData;
          });
        } else if (message.type === 'health_update') {
          setHealthScore(message.data);
        }
      }
    };

    window.addEventListener('websocket_sensor_update', handleWebSocketMessage as EventListener);
    window.addEventListener('websocket_health_update', handleWebSocketMessage as EventListener);

    return () => {
      websocketService.unsubscribeFromPark(parkId);
      window.removeEventListener('websocket_sensor_update', handleWebSocketMessage as EventListener);
      window.removeEventListener('websocket_health_update', handleWebSocketMessage as EventListener);
    };
  }, [parkId]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary"></div>
      </div>
    );
  }

  if (!park || !healthScore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Park not found or no data available</p>
        <Link to="/" className="text-green-primary hover:text-green-secondary mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const chartData = healthTrends?.overall_score?.slice(-7).map((item: any) => ({
    date: new Date(item.timestamp).toLocaleDateString(),
    score: item.value
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{park.name}</h1>
          <div className="flex items-center space-x-4 text-gray-600 mt-1">
            <div className="flex items-center space-x-1">
              <MapPinIcon className="h-4 w-4" />
              <span>{park.area.toLocaleString()} m²</span>
            </div>
            {park.tree_count && (
              <div className="flex items-center space-x-1">
                <BeakerIcon className="h-4 w-4" />
                <span>{park.tree_count} trees</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Health Score</h3>
          <div className={`text-4xl font-bold ${getScoreColor(healthScore.overall_score)}`}>
            {healthScore.overall_score.toFixed(1)}/10
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(healthScore.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Scores</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tree Health</span>
              <span className={`font-medium ${getScoreColor(healthScore.tree_health_score)}`}>
                {healthScore.tree_health_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Microclimate</span>
              <span className={`font-medium ${getScoreColor(healthScore.microclimate_score)}`}>
                {healthScore.microclimate_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Soil & Water</span>
              <span className={`font-medium ${getScoreColor(healthScore.soil_water_score)}`}>
                {healthScore.soil_water_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Biodiversity</span>
              <span className={`font-medium ${getScoreColor(healthScore.biodiversity_score)}`}>
                {healthScore.biodiversity_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Infrastructure</span>
              <span className={`font-medium ${getScoreColor(healthScore.infrastructure_score)}`}>
                {healthScore.infrastructure_score.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Sensors</h3>
          <div className="space-y-3">
            {sensorData.map((sensor, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {sensor.sensor_type.replace('_', ' ')}
                </span>
                <span className="font-medium text-gray-900">
                  {sensor.value.toFixed(1)} {sensor.unit}
                </span>
              </div>
            ))}
            {sensorData.length === 0 && (
              <p className="text-gray-500 text-sm">No sensor data available</p>
            )}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Health Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
