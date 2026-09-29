import React, { useState, useEffect } from 'react';
import { 
  CameraIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  BeakerIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { agriService } from '../services/api';
import { DiseaseDiagnosisResult } from '../types';

export const CropDiseaseScanner: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>('tomato');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosisResult | null>(null);

  const demoPresets = [
    { label: 'Tomato Early Blight', crop: 'tomato', icon: '🍅' },
    { label: 'Rice Blast', crop: 'rice', icon: '🌾' },
    { label: 'Wheat Yellow Rust', crop: 'wheat', icon: '🌿' },
    { label: 'Cotton Leaf Curl', crop: 'cotton', icon: '☁️' },
  ];

  // Run initial diagnosis on mount so report card is immediately visible
  useEffect(() => {
    runDiagnosis('tomato');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        runDiagnosis(selectedCrop, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runDiagnosis = async (cropHint: string, base64Img?: string) => {
    setLoading(true);
    try {
      const res = await agriService.diagnoseCrop(cropHint, base64Img || imagePreview || undefined);
      setDiagnosis(res);
    } catch (err) {
      console.error('Failed to run crop diagnosis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (crop: string) => {
    setSelectedCrop(crop);
    setImagePreview(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f0fdf4"/><circle cx="150" cy="100" r="55" fill="%2316a34a"/><circle cx="132" cy="88" r="14" fill="%2392400e"/><circle cx="168" cy="115" r="11" fill="%2392400e"/><text x="50%" y="90%" font-size="13" font-weight="bold" fill="%2314532d" text-anchor="middle">${crop.toUpperCase()} LEAF SPECIMEN</text></svg>`);
    runDiagnosis(crop);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/50 to-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
            <CameraIcon className="h-6 w-6 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              AI Crop Disease Diagnostic Scanner
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5">
              Computer vision foliage pathology & regenerative organic treatment protocols
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border-2 border-slate-200">
          <span className="text-xs sm:text-sm text-slate-600 font-bold pl-2">Target Crop:</span>
          <select
            value={selectedCrop}
            onChange={(e) => {
              setSelectedCrop(e.target.value);
              runDiagnosis(e.target.value);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="tomato">Tomato (Solanum lycopersicum)</option>
            <option value="rice">Rice / Paddy (Oryza sativa)</option>
            <option value="wheat">Wheat (Triticum aestivum)</option>
            <option value="cotton">Cotton (Gossypium hirsutum)</option>
            <option value="general">General Cash Crop</option>
          </select>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Quick Test Demo Specimen Chips */}
        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
            Instant Demo Specimens (Click to analyze):
          </p>
          <div className="flex flex-wrap gap-3">
            {demoPresets.map((preset) => (
              <button
                key={preset.crop}
                onClick={() => handleSelectPreset(preset.crop)}
                className={`inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  selectedCrop === preset.crop
                    ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-500 scale-102'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                <span className="text-lg">{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone & Pathologist Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5">
            <label className="flex flex-col items-center justify-center border-3 border-dashed border-emerald-300 hover:border-emerald-600 rounded-3xl p-6 bg-emerald-50/40 hover:bg-emerald-50/70 cursor-pointer transition-all min-h-[220px] text-center">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Leaf specimen"
                    className="max-h-36 rounded-xl object-contain mx-auto shadow-md"
                  />
                  <p className="text-xs sm:text-sm text-emerald-800 font-bold">Click to replace leaf photo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <ArrowUpTrayIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-slate-900">Upload or snap a leaf photo</p>
                    <p className="text-xs text-slate-500 mt-0.5">Supports JPG, PNG, WEBP (Max 10MB)</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="md:col-span-7 space-y-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5 text-emerald-700" />
                <span>On-Field Foliage Pathologist</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Computer vision checks necrotic lesions, edge discoloration, and chlorosis ratio against localized disease models, delivering dual-action bio-organic remedies and emergency chemical controls.
              </p>
            </div>

            <button
              onClick={() => runDiagnosis(selectedCrop)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-3 px-6 py-4 bg-emerald-700 hover:bg-emerald-800 text-white text-base font-bold rounded-2xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  <span>Scanning Leaf Specimen...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 text-emerald-300" />
                  <span>Run AI Disease Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagnosis Report Card */}
        {diagnosis ? (
          <div className="border-2 border-slate-200 rounded-3xl bg-white p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Pathology Identified
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {diagnosis.disease_name}
                </h3>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-black border ${
                  diagnosis.severity === 'high' 
                    ? 'bg-rose-100 text-rose-900 border-rose-300' 
                    : diagnosis.severity === 'medium' 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  Severity: {diagnosis.severity.toUpperCase()}
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-black bg-slate-100 text-slate-900 border border-slate-300">
                  Confidence: {diagnosis.confidence_score}%
                </span>
              </div>
            </div>

            {/* Visual Pathology Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chlorosis Ratio</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
                  {diagnosis.visual_metrics.chlorosis_percentage}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Necrotic Spot Density</span>
                <p className="text-2xl sm:text-3xl font-black text-rose-900 mt-1">
                  {diagnosis.visual_metrics.necrotic_lesion_density}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Symptoms</span>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1">
                  {diagnosis.symptoms_identified}
                </p>
              </div>
            </div>

            {/* Remedies Split View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organic Remedies */}
              <div className="p-6 rounded-3xl bg-emerald-50/90 border-2 border-emerald-300 space-y-3">
                <div className="flex items-center space-x-2.5 text-emerald-950 font-black text-sm sm:text-base">
                  <ShieldCheckIcon className="h-6 w-6 text-emerald-700" />
                  <span>Regenerative Bio-Organic Remedies</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                  {diagnosis.organic_remedies.map((remedy, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-700 font-black text-base leading-none">•</span>
                      <span className="leading-relaxed font-medium">{remedy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chemical Remedies */}
              <div className="p-6 rounded-3xl bg-amber-50/90 border-2 border-amber-300 space-y-3">
                <div className="flex items-center space-x-2.5 text-amber-950 font-black text-sm sm:text-base">
                  <BeakerIcon className="h-6 w-6 text-amber-700" />
                  <span>Targeted Chemical Controls (Threshold Emergency)</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                  {diagnosis.chemical_remedies.map((remedy, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-amber-700 font-black text-base leading-none">•</span>
                      <span className="leading-relaxed font-medium">{remedy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Preventive Practices */}
            {diagnosis.preventive_practices && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Preventive agronomy: </strong>
                  <span>{diagnosis.preventive_practices.join(' • ')}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-200">
            <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <p className="text-sm font-bold text-slate-700">Loading AI Pathology Diagnosis...</p>
          </div>
        )}
      </div>
    </div>
  );
};
