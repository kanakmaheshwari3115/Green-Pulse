import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  BeakerIcon, 
  SignalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { analyticsService, parkService } from '../services/api';
import { DashboardOverview, Park, HealthScore, Alert } from '../types';

export const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [parks, setParks] = useState<Park[]>([]);
  const [healthScores, setHealthScores] = useState<Record<string, HealthScore>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, parksData, alertsData] = await Promise.all([
          analyticsService.getDashboardOverview(),
          parkService.getAllParks(),
          analyticsService.getAlerts(undefined, 'high', 24)
        ]);

        setOverview(overviewData);
        setParks(parksData);
        setAlerts(alertsData.alerts);

        const healthPromises = parksData.map(async (park) => {
          try {
            const healthData = await parkService.getCurrentHealthScore(park.park_id);
            return { parkId: park.park_id, health: healthData };
          } catch {
            return null;
          }
        });

        const healthResults = await Promise.all(healthPromises);
        const healthMap: Record<string, HealthScore> = {};
        
        healthResults.forEach((result) => {
          if (result) {
            healthMap[result.parkId] = result.health;
          }
        });

        setHealthScores(healthMap);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    if (score >= 4) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor urban green spaces in real-time</p>
        </div>
      </div>

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <MapPinIcon className="h-6 w-6 text-green-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Parks</p>
                <p className="text-2xl font-bold text-gray-900">{overview.total_parks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <SignalIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Nodes</p>
                <p className="text-2xl font-bold text-gray-900">{overview.active_nodes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <BeakerIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Health Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.average_health_score.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Park Health Scores</h2>
            <div className="space-y-3">
              {parks.map((park) => {
                const healthScore = healthScores[park.park_id];
                return (
                  <Link
                    key={park.park_id}
                    to={`/park/${park.park_id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{park.name}</h3>
                        <p className="text-sm text-gray-500">{park.area} m²</p>
                      </div>
                      {healthScore && (
                        <div className={`px-3 py-1 rounded-full ${getScoreBgColor(healthScore.overall_score)}`}>
                          <span className={`text-sm font-medium ${getScoreColor(healthScore.overall_score)}`}>
                            {healthScore.overall_score.toFixed(1)}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active alerts</p>
              ) : (
                alerts.slice(0, 5).map((alert) => (
                  <div key={alert.alert_id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
