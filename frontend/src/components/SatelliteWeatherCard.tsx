import React, { useState, useEffect } from 'react';
import { 
  CloudIcon, 
  GlobeAltIcon, 
  ExclamationCircleIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { agriService } from '../services/api';
import { SatelliteWeatherResult } from '../types';

export const SatelliteWeatherCard: React.FC = () => {
  const [data, setData] = useState<SatelliteWeatherResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSatelliteAndWeatherData = async () => {
      try {
        const res = await agriService.getSatelliteAndWeather();
        setData(res);
      } catch (err) {
        console.error('Failed to fetch satellite and weather data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSatelliteAndWeatherData();
  }, []);

  if (loading || !data) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-sm font-semibold text-slate-500">
        Fetching weather forecast & computing vegetation indices...
      </div>
    );
  }

  const sat = data.satellite_intelligence;
  const weather = data.weather_intelligence;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-50/50 to-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-700 text-white flex items-center justify-center shadow-sm">
            <GlobeAltIcon className="h-6 w-6 text-sky-200" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Satellite Earth Observation & Climate Forecast
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5">
              Modelled NDVI/NDWI vegetation indices & live 7-day forecast via Open-Meteo
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm font-bold text-sky-900 bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-300">
            Weather: Open-Meteo API
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Top Metric Cards: NDVI, NDWI, Ambient */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-white border-2 border-emerald-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-600 uppercase tracking-wider">Canopy NDVI Index</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                {sat.ndvi_status}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-emerald-900">{sat.ndvi}</span>
              <span className="text-sm text-slate-400 font-bold">/ 1.00</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-2.5 rounded-full transition-all" 
                style={{ width: `${Math.min(100, Math.max(0, sat.ndvi * 100))}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Modelled index (Sentinel-2 NDVI approach) — satellite API integration planned</p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-50/80 via-white to-white border-2 border-sky-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-600 uppercase tracking-wider">NDWI Moisture Index</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300">
                {sat.soil_moisture_stress_index}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-sky-900">{sat.ndwi_water_index}</span>
              <span className="text-sm text-slate-400 font-bold">/ 1.00</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-sky-600 h-2.5 rounded-full transition-all" 
                style={{ width: `${Math.min(100, Math.max(0, (sat.ndwi_water_index + 0.5) * 100))}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Detects leaf hydraulic stress & subsurface irrigation deficit</p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-white border-2 border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-600 uppercase tracking-wider">Ambient Microclimate</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">Node + Open-Meteo Blend</span>
            </div>
            <div className="flex items-baseline space-x-4">
              <span className="text-4xl sm:text-5xl font-black text-amber-900">{weather.current_temperature}°C</span>
              <span className="text-base sm:text-lg font-bold text-slate-600">RH {weather.current_humidity}%</span>
            </div>
            <div className="pt-2 text-xs sm:text-sm text-slate-600 font-medium">
              Transpiration rate nominal • Solar flux 740 W/m²
            </div>
          </div>
        </div>

        {/* Actionable Agro-Weather Advisory Banner */}
        <div className="p-6 rounded-3xl bg-amber-50/90 border-2 border-amber-300 flex items-start space-x-4 shadow-2xs">
          <ExclamationCircleIcon className="h-7 w-7 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-widest">
              Agro-Meteorological Actionable Alert
            </h4>
            <p className="text-sm sm:text-base text-slate-800 font-bold leading-relaxed">
              {weather.agro_weather_advisory}
            </p>
          </div>
        </div>

        {/* 7-Day Outlook Strip */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-slate-800">7-Day Rainfall & Temperature Forecast</span>
            <span className="text-xs text-slate-500 font-semibold">
              Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="text-sky-700 underline hover:text-sky-900">Open-Meteo.com</a> (CC BY 4.0)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {weather.forecast_7_days.map((day, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  day.rain_probability >= 70
                    ? 'bg-sky-50 border-sky-400 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <p className="text-sm font-black text-slate-900">{day.day_name}</p>
                <p className="text-xs text-slate-500 font-semibold">{day.date.slice(5)}</p>
                <div className="my-2 flex justify-center">
                  {day.rain_probability >= 50 ? (
                    <CloudIcon className="h-8 w-8 text-sky-600" />
                  ) : (
                    <SunIcon className="h-8 w-8 text-amber-500" />
                  )}
                </div>
                <p className="text-sm sm:text-base font-black text-slate-900">{day.temp_max}° / {day.temp_min}°</p>
                <p className={`text-xs font-bold mt-1 ${
                  day.rain_probability >= 50 ? 'text-sky-800' : 'text-slate-500'
                }`}>
                  🌧 {day.rain_probability}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
