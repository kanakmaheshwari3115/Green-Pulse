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

const fallbackOverview: DashboardOverview = {
  total_parks: 3,
  active_nodes: 12,
  average_health_score: 8.1,
  parks_with_data: 3,
  active_node_ids: ["node_pb_01", "node_mh_02", "node_ka_03"]
};

const fallbackParks: Park[] = [
  {
    park_id: "farm_pb_01",
    name: "Ludhiana Agro-Ecological Field Station",
    location: { lat: 30.9010, lon: 75.8573 },
    area: 50585,
    tree_count: 120,
    description: "Punjab Trans-Gangetic Field Station",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    park_id: "farm_mh_02",
    name: "Nashik Climate-Resilient Cluster",
    location: { lat: 19.9975, lon: 73.7898 },
    area: 32374,
    tree_count: 85,
    description: "Maharashtra Vertisol Cotton-Soybean Cluster",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    park_id: "farm_ka_03",
    name: "Mandya Millet & Polyculture Haven",
    location: { lat: 12.5244, lon: 76.8958 },
    area: 26304,
    tree_count: 60,
    description: "Karnataka Red Sandy Loam Millet Station",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

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
          analyticsService.getDashboardOverview().catch(() => null),
          parkService.getAllParks().catch(() => null),
          analyticsService.getAlerts(undefined, 'high', 24).catch(() => ({ alerts: [] }))
        ]);

        setOverview(overviewData || fallbackOverview);
        setParks(parksData && parksData.length > 0 ? parksData : fallbackParks);
        setAlerts(alertsData?.alerts || []);

        const targetParks = parksData && parksData.length > 0 ? parksData : fallbackParks;

        const healthPromises = targetParks.map(async (park) => {
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
        console.error('Failed to fetch dashboard data, using fallback:', error);
        setOverview(fallbackOverview);
        setParks(fallbackParks);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeOverview = overview || fallbackOverview;
  const activeParks = parks.length > 0 ? parks : fallbackParks;

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-700 text-white mb-4 animate-pulse">
          <SignalIcon className="h-6 w-6" />
        </div>
        <p className="text-xl font-bold text-slate-700">Connecting to Agro-Station Grid…</p>
        <p className="text-sm text-slate-400 mt-1">Fetching live telemetry across field nodes</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Multi-Station Field Telemetry Grid
          </h1>
          <p className="text-base text-slate-500 mt-1 font-medium">
            Real-time agro-climatic monitoring across regional field stations
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-sm font-bold text-emerald-900">{activeParks.length} Stations Online</span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50/60 to-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-700 text-white rounded-2xl">
              <MapPinIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Agro-Stations</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">{activeOverview.total_parks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-sky-200 shadow-sm bg-gradient-to-br from-sky-50/60 to-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-sky-600 text-white rounded-2xl">
              <SignalIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Field Nodes</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">{activeOverview.active_nodes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm bg-gradient-to-br from-amber-50/60 to-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-600 text-white rounded-2xl">
              <BeakerIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Resilience Index</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">
                {activeOverview.average_health_score.toFixed(1)}/10
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-sm bg-gradient-to-br from-rose-50/60 to-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-600 text-white rounded-2xl">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Agro Alerts</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">{alerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Station List + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Station List */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-xl font-black text-slate-900">Regional Agro-Ecological Stations</h2>
          <div className="space-y-4">
            {activeParks.map((park) => {
              const healthScore = healthScores[park.park_id];
              const score = healthScore ? healthScore.overall_score : 8.0;
              return (
                <Link
                  key={park.park_id}
                  to={`/farm/${park.park_id}`}
                  className="block p-5 border-2 border-slate-100 hover:border-emerald-400 rounded-2xl bg-slate-50/50 hover:bg-emerald-50/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {park.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium">
                        {park.description || 'Regional Field Telemetry Hub'} • {(park.area / 4046.86).toFixed(1)} Acres
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-sm font-black">
                      {score.toFixed(1)}/10
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-xl font-black text-slate-900">Agro-Meteorological Alert Feed</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center text-emerald-900 text-sm font-semibold">
                ✅ All stations operating within optimal agro-climatic parameters.
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div key={alert.alert_id} className="p-4 border-2 border-slate-200 rounded-2xl bg-white space-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{alert.message}</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-black rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
