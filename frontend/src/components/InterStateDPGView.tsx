import React, { useState, useEffect } from 'react';
import { 
  BuildingLibraryIcon, 
  ArrowDownTrayIcon, 
  ShareIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { agriService } from '../services/api';
import { StateDPGModelResult } from '../types';

export const InterStateDPGView: React.FC = () => {
  const [dpgData, setDpgData] = useState<StateDPGModelResult | null>(null);
  const [schemaJson, setSchemaJson] = useState<any | null>(null);
  const [showSchemaModal, setShowSchemaModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [models, schema] = await Promise.all([
          agriService.getStateDPGModels(),
          agriService.exportDPGSchema()
        ]);
        setDpgData(models);
        setSchemaJson(schema);
      } catch (err) {
        console.error('Failed to fetch DPG state network data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const downloadSchemaFile = () => {
    if (!schemaJson) return;
    const blob = new Blob([JSON.stringify(schemaJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greenpulse_agristack_dpg_schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !dpgData) {
    return (
      <div className="w-full bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-700 text-white mb-6">
          <BuildingLibraryIcon className="h-8 w-8" />
        </div>
        <p className="text-xl font-bold text-slate-700">Connecting to National DPG Registry…</p>
        <p className="text-base text-slate-400 mt-2">Fetching federated state network data</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-16">

      {/* ── Hero Header ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Gradient banner */}
        <div className="bg-gradient-to-r from-emerald-50/80 to-sky-50/40 px-8 pt-8 pb-7 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start space-x-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <BuildingLibraryIcon className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-full text-xs text-emerald-800 font-semibold">
                  <CheckBadgeIcon className="h-4 w-4" />
                  <span>Certified Digital Public Good (DPG) • Open Public Infrastructure</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Inter-State Digital Agriculture Exchange Network
                </h1>
                <p className="text-base text-slate-500 leading-relaxed max-w-3xl">
                  Enabling state agricultural departments, ICAR universities, and farmer collectives to federate open soil health models, pest surveillance vectors, and climate-resilient cropping algorithms.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 self-start md:flex-col">
              <button
                onClick={() => setShowSchemaModal(true)}
                className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-sm rounded-2xl transition-all shadow-sm"
              >
                <ArrowsRightLeftIcon className="h-4 w-4 text-slate-600" />
                <span>View Schema</span>
              </button>
              <button
                onClick={downloadSchemaFile}
                className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export DPG Schema (JSON)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Participating States</p>
            <p className="text-3xl sm:text-4xl font-black text-emerald-700">{dpgData.states_participating.length}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">States</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-sky-50 to-white">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Open AI Models Shared</p>
            <p className="text-3xl sm:text-4xl font-black text-sky-600">104</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">Models</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-teal-50 to-white">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Open Standard</p>
            <p className="text-2xl sm:text-3xl font-black text-teal-700">AgriStack</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">/ IDEA Protocol</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-amber-50 to-white">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Data Access</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-700">Open Access</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">Public Good Network</p>
          </div>
        </div>
      </div>

      {/* ── Cross-State Consortia ── */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
            <ShareIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Active Cross-State Climate Consortia</h2>
            <p className="text-sm text-slate-400 font-medium">Collaborative research and data-sharing initiatives</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dpgData.cross_state_collaborations.map((collab, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border-2 border-emerald-200 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">{collab.partnership}</h3>
                <p className="text-sm text-emerald-700 font-semibold mt-2">Focus: {collab.focus}</p>
              </div>
              <div className="pt-4 border-t border-emerald-100 text-sm text-slate-600 flex items-start space-x-2">
                <span className="text-emerald-600 font-black text-base leading-none mt-0.5">•</span>
                <span>{collab.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Participating States Grid ── */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <BuildingLibraryIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Federated State Agriculture Nodes</h2>
              <p className="text-sm text-slate-400 font-medium">Synchronized via AgriStack interoperability layer</p>
            </div>
          </div>
          <span className="hidden sm:block text-sm text-slate-400 font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
            {dpgData.states_participating.length} Active Nodes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dpgData.states_participating.map((st) => (
            <div
              key={st.state_code}
              className="p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/20 transition-all group cursor-default flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg sm:text-xl font-black text-slate-900">{st.state_name}</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-black rounded-full border border-emerald-200">
                    {st.resilience_score}/10
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium">{st.agro_climatic_zone} • {st.primary_soil}</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-sky-700">{st.shared_models_count}</p>
                    <p className="text-xs text-sky-600 font-semibold mt-0.5">AI Models</p>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-teal-700">{st.active_farmer_nodes}</p>
                    <p className="text-xs text-teal-600 font-semibold mt-0.5">Field Nodes</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Contributed Practices
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {st.key_regenerative_practices.map((prac, i) => (
                      <span key={i} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">
                        {prac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>{st.interoperability_standard}</span>
                </span>
                <span className="flex items-center space-x-1.5 text-emerald-600 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Schema Modal ── */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-slate-200 overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 to-white flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">AgriStack / IDEA Open Interoperability Schema</h3>
                <p className="text-sm text-slate-500 mt-1">Standardized JSON contract for federated state model exchange</p>
              </div>
              <button 
                onClick={() => setShowSchemaModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-black px-2 mt-0.5"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-auto bg-slate-950 font-mono text-sm text-emerald-400 flex-1">
              <pre>{JSON.stringify(schemaJson, null, 2)}</pre>
            </div>
            <div className="px-7 py-5 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setShowSchemaModal(false)}
                className="px-5 py-3 bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-2xl transition-all"
              >
                Close
              </button>
              <button
                onClick={downloadSchemaFile}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl shadow-md transition-all"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
