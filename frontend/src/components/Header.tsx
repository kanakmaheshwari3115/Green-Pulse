import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BuildingLibraryIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isConnected }) => {
  const location = useLocation();
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3.5">
            <Link to="/" className="group flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 border border-emerald-300 flex items-center justify-center p-1.5 shadow-sm group-hover:border-emerald-500 group-hover:bg-emerald-800/20 transition-all">
                <img 
                  src="/logo_flower.png" 
                  alt="GreenPulse Flower Logo" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">GreenPulse</span>
                  <span className="text-xs font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Agri-DPG
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">Digital Public Good • Agriculture Intelligence Network</p>
              </div>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <nav className="hidden md:flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-sm font-semibold">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                  isActive('/') 
                    ? 'bg-white text-emerald-800 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>🌾</span>
                <span>Farmer Advisory & AI</span>
              </Link>
              <Link 
                to="/dpg" 
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                  isActive('/dpg') 
                    ? 'bg-white text-emerald-800 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <BuildingLibraryIcon className="h-4 w-4" />
                <span>Inter-State DPG</span>
              </Link>
              <Link 
                to="/stations" 
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                  isActive('/stations') 
                    ? 'bg-white text-emerald-800 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ChartBarIcon className="h-4 w-4" />
                <span>Station Grid</span>
              </Link>
            </nav>
            
            {/* Live Connection & Language Pill */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                <span className="text-slate-400 pl-1">🌐</span>
                <button 
                  type="button"
                  onClick={() => setLang('EN')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${lang === 'EN' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  EN
                </button>
                <span className="text-slate-300">|</span>
                <button 
                  type="button"
                  onClick={() => setLang('HI')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${lang === 'HI' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  हिन्दी
                </button>
              </div>

              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-bold bg-emerald-50 border-emerald-300 shadow-2xs">
                {isConnected ? (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="text-emerald-900 font-bold">IoT Live</span>
                  </>
                ) : (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-800 font-bold">Live Simulation</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
