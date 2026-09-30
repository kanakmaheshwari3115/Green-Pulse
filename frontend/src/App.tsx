import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AgriPortal } from './components/AgriPortal';
import { InterStateDPGView } from './components/InterStateDPGView';
import { Dashboard } from './components/Dashboard';
import { ParkDetail } from './components/ParkDetail';
import { Header } from './components/Header';
import { websocketService } from './services/websocket';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const clientId = `farmer_portal_${Date.now()}`;
    
    websocketService.connect(clientId)
      .then(() => {
        setIsConnected(true);
        console.log('Agri-DPG WebSocket connected successfully');
      })
      .catch((error) => {
        console.error('WebSocket connection offline (falling back to REST polling):', error);
        setIsConnected(false);
      });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#f1f5f9] text-slate-900 selection:bg-emerald-600 selection:text-white">
        <Header isConnected={isConnected} />
        <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <Routes>
            {/* Primary Farmer Advisory, Disease Diagnostics, & Satellite View */}
            <Route path="/" element={<AgriPortal />} />
            
            {/* National Inter-State DPG Exchange & Open Models */}
            <Route path="/dpg" element={<InterStateDPGView />} />
            
            {/* Multi-Station Field Telemetry Grid */}
            <Route path="/stations" element={<Dashboard />} />
            <Route path="/legacy-dashboard" element={<Navigate to="/stations" replace />} />
            
            {/* Station / Farm Deep-Dive View */}
            <Route path="/park/:parkId" element={<ParkDetail />} />
            <Route path="/farm/:parkId" element={<ParkDetail />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
