import React, { useState, useCallback, useEffect } from 'react';
import { 
  SparklesIcon, 
  BeakerIcon, 
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { agriService } from '../services/api';
import { RegenerativeAdvisoryResult } from '../types';

export const RegenerativeRecommender: React.FC = () => {
  const [stateCode, setStateCode] = useState<string>('MH');
  const [season, setSeason] = useState<string>('Kharif');
  const [nitrogen, setNitrogen] = useState<number>(180);
  const [phosphorus, setPhosphorus] = useState<number>(24);
  const [potassium, setPotassium] = useState<number>(210);
  const [ph, setPh] = useState<number>(6.8);
  const [moisture, setMoisture] = useState<number>(45);
  const [waterAvailability, setWaterAvailability] = useState<string>('medium');
  const [loading, setLoading] = useState<boolean>(false);
  const [advisory, setAdvisory] = useState<RegenerativeAdvisoryResult | null>(null);

  const fetchAdvisory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agriService.getRegenerativeAdvisory({
        nitrogen,
        phosphorus,
        potassium,
        ph,
        moisture,
        state_code: stateCode,
        season,
        water_availability: waterAvailability
      });
      setAdvisory(res);
    } catch (err) {
      console.error('Failed to get regenerative advisory:', err);
    } finally {
      setLoading(false);
    }
  }, [nitrogen, phosphorus, potassium, ph, moisture, stateCode, season, waterAvailability]);

  useEffect(() => {
    fetchAdvisory();
  }, [fetchAdvisory]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Refined Header - Rich Contrast & Clear Typography */}
      <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/50 to-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
            <SparklesIcon className="h-6 w-6 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Regenerative Crop & Soil Advisory Engine
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5">
              Multi-crop companion planting, soil carbon regeneration, and climate-resilient water budgeting
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300">
            Soil-Biota Model Active
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Context Controls - Taller, Clearer Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              Agro-Zone State
            </label>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 text-slate-900 text-sm sm:text-base font-bold rounded-xl px-4 py-3 focus:border-emerald-600 focus:outline-none shadow-2xs"
            >
              <option value="MH">Maharashtra (Western Plateau / Vertisol)</option>
              <option value="PB">Punjab (Trans-Gangetic Alluvial Loam)</option>
              <option value="KA">Karnataka (Southern Red Laterite Loam)</option>
              <option value="MP">Madhya Pradesh (Central Black Soil)</option>
              <option value="TN">Tamil Nadu (East Coastal Plains)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              Cropping Season
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 text-slate-900 text-sm sm:text-base font-bold rounded-xl px-4 py-3 focus:border-emerald-600 focus:outline-none shadow-2xs"
            >
              <option value="Kharif">Kharif (Monsoon Sowing: Jun–Oct)</option>
              <option value="Rabi">Rabi (Winter Sowing: Oct–Mar)</option>
              <option value="Zaid">Zaid (Summer Sowing: Mar–Jun)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              Water Availability
            </label>
            <select
              value={waterAvailability}
              onChange={(e) => setWaterAvailability(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 text-slate-900 text-sm sm:text-base font-bold rounded-xl px-4 py-3 focus:border-emerald-600 focus:outline-none shadow-2xs"
            >
              <option value="medium">Canal / Borewell (Moderate Supply)</option>
              <option value="low">Rainfed / Dryland (Water Constrained)</option>
              <option value="high">Assured Micro-Irrigation / Drip Network</option>
            </select>
          </div>
        </div>

        {/* Soil Health Sliders - Larger, Highly Visible */}
        <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-800 flex items-center space-x-2">
              <BeakerIcon className="h-5 w-5 text-emerald-700" />
              <span>Real-Time Soil Chemistry & Moisture Parameters</span>
            </span>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">Adjust sliders to dynamically recalculate rotation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-semibold">
                <span>Nitrogen (N)</span>
                <span className="font-black text-emerald-800 text-base bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{nitrogen}</span>
              </div>
              <input
                type="range"
                min="80"
                max="400"
                value={nitrogen}
                onChange={(e) => setNitrogen(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Low (80)</span>
                <span>kg/ha</span>
                <span>High (400)</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-semibold">
                <span>Phosphorus (P)</span>
                <span className="font-black text-emerald-800 text-base bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{phosphorus}</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={phosphorus}
                onChange={(e) => setPhosphorus(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Low (10)</span>
                <span>kg/ha</span>
                <span>High (80)</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-semibold">
                <span>Potassium (K)</span>
                <span className="font-black text-emerald-800 text-base bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{potassium}</span>
              </div>
              <input
                type="range"
                min="80"
                max="450"
                value={potassium}
                onChange={(e) => setPotassium(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Low (80)</span>
                <span>kg/ha</span>
                <span>High (450)</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-semibold">
                <span>Reaction (pH)</span>
                <span className="font-black text-blue-900 text-base bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{ph}</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="9.0"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Acidic (5.0)</span>
                <span>pH scale</span>
                <span>Alkaline (9.0)</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-semibold">
                <span>Soil Moisture</span>
                <span className="font-black text-teal-800 text-base bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{moisture}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
                className="w-full accent-teal-600 h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Dry (10%)</span>
                <span>volumetric</span>
                <span>Wet (90%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Presentation */}
        {loading ? (
          <div className="flex items-center justify-center p-12 text-emerald-800 space-x-3 text-base font-semibold">
            <ArrowPathIcon className="h-6 w-6 animate-spin text-emerald-600" />
            <span>Recalculating companion crop pairings, soil carbon, & water savings...</span>
          </div>
        ) : advisory ? (
          <div className="space-y-6">
            {/* Primary vs Companion Split Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-white border-2 border-emerald-300 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-emerald-800 uppercase tracking-widest">
                    Recommended Primary Cash Crop
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/80 text-emerald-900 border border-emerald-400">
                    High Climate Tolerance
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  {advisory.primary_recommended_crop}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Engineered for the <strong className="text-slate-800">{advisory.agro_climatic_zone}</strong> during <strong className="text-slate-800">{advisory.season}</strong> sowing.
                </p>
                <div className="pt-4 border-t border-emerald-100 flex items-center justify-between text-sm sm:text-base">
                  <span className="text-slate-500 font-medium">Water Conservation:</span>
                  <span className="font-black text-emerald-800 text-lg">+{advisory.water_savings_percentage}% saved vs monoculture</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-50/90 via-white to-white border-2 border-teal-300 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-teal-800 uppercase tracking-widest">
                    Nitrogen-Fixing Companion Crop
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-200/80 text-teal-900 border border-teal-400">
                    Bio-Soil Enrichment
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  {advisory.regenerative_companion_crop}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Intercropped to naturally synthesize atmospheric nitrogen, reduce synthetic urea by 30%, and maintain living root cover.
                </p>
                <div className="pt-4 border-t border-teal-100 flex items-center justify-between text-sm sm:text-base">
                  <span className="text-slate-500 font-medium">Soil Carbon Sequestration:</span>
                  <span className="font-black text-teal-800 text-lg">{advisory.soil_carbon_sequestration_rating}</span>
                </div>
              </div>
            </div>

            {/* Immediate Soil Conservation Actions */}
            {advisory.soil_conservation_plan.length > 0 && (
              <div className="p-6 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-xs space-y-3">
                <div className="flex items-center space-x-2.5 text-amber-950 font-bold text-sm sm:text-base">
                  <ShieldCheckIcon className="h-6 w-6 text-amber-700" />
                  <span>Immediate Biological Soil Health Priorities</span>
                </div>
                <ul className="space-y-2 text-sm sm:text-base text-slate-800">
                  {advisory.soil_conservation_plan.map((action, i) => (
                    <li key={i} className="flex items-start space-x-2.5">
                      <span className="text-amber-700 font-black text-lg leading-none">•</span>
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* State-proven practices */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm sm:text-base font-bold text-slate-800 flex items-center space-x-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-700" />
                <span>Consortium practices shared in {advisory.state}:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {advisory.state_proven_practices.map((practice, idx) => (
                  <span key={idx} className="bg-white border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm px-3.5 py-1.5 rounded-full font-bold shadow-2xs">
                    {practice}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
