import React, { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  SparklesIcon,
  GlobeAltIcon,
  CameraIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { agriService } from '../services/api';
import { Farm } from '../types';
import { CropDiseaseScanner } from './CropDiseaseScanner';
import { RegenerativeRecommender } from './RegenerativeRecommender';
import { SatelliteWeatherCard } from './SatelliteWeatherCard';

type ActiveTab = 'regenerative' | 'disease' | 'satellite' | 'all';

export const AgriPortal: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('park_001');
  const [activeTab, setActiveTab] = useState<ActiveTab>('regenerative');

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const farmList = await agriService.getFarms();
        setFarms(farmList);
        if (farmList.length > 0) {
          setSelectedFarmId(farmList[0].farm_id || 'park_001');
        }
      } catch (err) {
        console.error('Failed to load farms:', err);
      }
    };
    loadFarms();
  }, []);

  const selectedFarm = farms.find(f => (f.farm_id || f.park_id) === selectedFarmId) || farms[0];

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Station Context Card - Wide, High Contrast & Crisp */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Telemetry Station Active
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              {selectedFarm?.name || 'Ludhiana Agro-Ecological Field'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 flex flex-wrap items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-emerald-600 inline shrink-0" />
              <span className="font-semibold text-slate-800">
                {selectedFarm?.district || 'Ludhiana'}, {selectedFarm?.state || 'Punjab'}
              </span>
              <span className="text-slate-300">•</span>
              <span>Farmer: <strong className="text-slate-900 font-bold">{selectedFarm?.farmer_name || 'Sardar Gurpreet Singh'}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Current Rotation: <strong className="text-emerald-800 font-bold">{selectedFarm?.current_crop || 'Wheat + Mustard'}</strong></span>
            </p>
          </div>

          {/* Cluster Switcher */}
          <div className="flex items-center space-x-3 self-start lg:self-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <span className="text-sm text-slate-600 font-bold pl-2 whitespace-nowrap">Agro-Cluster:</span>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="bg-white border-2 border-slate-200 text-slate-900 text-sm sm:text-base font-bold rounded-xl px-4 py-2.5 focus:border-emerald-600 focus:outline-none shadow-2xs"
            >
              {farms.map((f) => (
                <option key={f.farm_id || f.park_id} value={f.farm_id || f.park_id}>
                  {f.name} ({f.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Telemetry Metric Cards - Vibrant Colors & Big Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-white border-2 border-emerald-200 shadow-xs flex flex-col justify-between space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">IoT Soil Moisture</span>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-800 tracking-tight">
              {selectedFarm?.state === 'Punjab' ? '42.0%' : selectedFarm?.state === 'Karnataka' ? '36.8%' : '46.5%'}
            </p>
            <div>
              <span className="text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-100/90 px-3 py-1 rounded-full inline-block border border-emerald-300">
                {selectedFarm?.state === 'Karnataka' ? 'Moderate Moisture' : 'Optimal Root Zone'}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-white border-2 border-blue-200 shadow-xs flex flex-col justify-between space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Soil Reaction (pH)</span>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-900 tracking-tight">
              {selectedFarm?.state === 'Punjab' ? '7.20 pH' : selectedFarm?.state === 'Karnataka' ? '6.45 pH' : '6.85 pH'}
            </p>
            <div>
              <span className="text-xs sm:text-sm font-bold text-blue-900 bg-blue-100/90 px-3 py-1 rounded-full inline-block border border-blue-300">
                {selectedFarm?.state === 'Punjab' ? 'Alluvial Loam' : selectedFarm?.state === 'Karnataka' ? 'Red Laterite Loam' : 'Neutral Vertisol'}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-white border-2 border-amber-200 shadow-xs flex flex-col justify-between space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Canopy Temperature</span>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-900 tracking-tight">
              {selectedFarm?.state === 'Punjab' ? '23.8°C' : selectedFarm?.state === 'Karnataka' ? '30.2°C' : '27.4°C'}
            </p>
            <div>
              <span className="text-xs sm:text-sm font-bold text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full inline-block border border-amber-300">
                {selectedFarm?.state === 'Punjab' ? 'Cool Vegetative' : selectedFarm?.state === 'Karnataka' ? 'Warm Dryland' : 'Moderate'}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-white border-2 border-teal-200 shadow-xs flex flex-col justify-between space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Climate Resilience</span>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-teal-800 tracking-tight">
              {selectedFarm?.state === 'Punjab' ? '8.8 / 10' : selectedFarm?.state === 'Karnataka' ? '8.2 / 10' : '8.6 / 10'}
            </p>
            <div>
              <span className="text-xs sm:text-sm font-bold text-teal-900 bg-teal-100/90 px-3 py-1 rounded-full inline-block border border-teal-300">
                High Buffer Capacity
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation - Larger, Tactile, High-Contrast */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300 text-sm sm:text-base font-bold space-x-1.5">
          <button
            onClick={() => setActiveTab('regenerative')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl transition-all ${
              activeTab === 'regenerative'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <SparklesIcon className="h-5 w-5" />
            <span>Regenerative Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab('disease')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl transition-all ${
              activeTab === 'disease'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CameraIcon className="h-5 w-5" />
            <span>Leaf Disease Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('satellite')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl transition-all ${
              activeTab === 'satellite'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <GlobeAltIcon className="h-5 w-5" />
            <span>Satellite & Weather</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`hidden lg:flex items-center space-x-2 px-5 py-3 rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5" />
            <span>Overview (All)</span>
          </button>
        </div>

        <div className="text-sm font-semibold text-slate-500 hidden sm:block">
          Active Mode: <strong className="text-slate-800">{activeTab === 'regenerative' ? 'Crop Rotation & Soil Budget' : activeTab === 'disease' ? 'Foliage Pathology Analysis' : activeTab === 'satellite' ? 'Sentinel-2 Earth Observation' : 'Full Suite'}</strong>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="space-y-8">
        {(activeTab === 'regenerative' || activeTab === 'all') && (
          <section className="transition-all animate-fadeIn">
            <RegenerativeRecommender />
          </section>
        )}

        {(activeTab === 'disease' || activeTab === 'all') && (
          <section className="transition-all animate-fadeIn">
            <CropDiseaseScanner />
          </section>
        )}

        {(activeTab === 'satellite' || activeTab === 'all') && (
          <section className="transition-all animate-fadeIn">
            <SatelliteWeatherCard />
          </section>
        )}
      </div>
    </div>
  );
};
