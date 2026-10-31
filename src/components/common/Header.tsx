'use client';

import React, { useEffect } from 'react';
import { PRESET_ROUTES } from '@/data/mockData';
import { useTripStore } from '@/store/useTripStore';
import { Activity, MapPin, Terminal, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  onToggleHUD: () => void;
  isHUDOpen: boolean;
  onToggleDriverModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleHUD, isHUDOpen, onToggleDriverModal }) => {
  const {
    activeRoute,
    selectPresetRoute,
    status,
    isAudioMuted,
    toggleAudioMute,
    isBackendConnected,
    backendLatencyMs,
    checkBackendHealth,
  } = useTripStore();

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(() => {
      checkBackendHealth();
    }, 12000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  return (
    <header className="absolute top-5 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
      {/* Brand Logo & Route Preset Selector */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-panel shadow-glass">
          <div className="w-8 h-8 rounded-xl bg-neon-emerald flex items-center justify-center font-extrabold text-obsidian-950 text-lg shadow-neonSmall">
            R
          </div>
          <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            Ride<span className="text-neon-emerald">Flow</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/20 font-semibold ml-1">
            Distributed
          </span>
        </div>

        {/* City Route Quick Selector */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-panel text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-neon-emerald" />
          <span className="text-slate-400 font-medium">City:</span>
          <select
            value={activeRoute.id}
            onChange={(e) => selectPresetRoute(e.target.value)}
            disabled={status !== 'IDLE'}
            className="bg-transparent text-white font-semibold cursor-pointer outline-none border-none py-1 pr-1"
          >
            {PRESET_ROUTES.map((route) => (
              <option key={route.id} value={route.id} className="bg-obsidian-900 text-slate-200">
                {route.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Backend Status, Audio, & DevTools Trigger */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Backend Connectivity Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl glass-panel text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBackendConnected ? 'bg-neon-emerald' : 'bg-neon-cyan'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isBackendConnected ? 'bg-neon-emerald' : 'bg-neon-cyan'
              }`}
            />
          </span>
          <span className="text-slate-300 font-medium">
            {isBackendConnected ? 'Go Gateway Live' : 'Go Architecture'}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border ${
              isBackendConnected
                ? 'bg-emerald-950/80 text-neon-emerald border-emerald-500/30'
                : 'bg-slate-800 text-neon-cyan border-slate-700'
            }`}
          >
            {isBackendConnected ? `${backendLatencyMs}ms` : 'Simulator Mode'}
          </span>
        </div>

        {/* Audio Mute/Unmute Button */}
        <button
          onClick={toggleAudioMute}
          className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-slate-300 hover:text-white transition"
          title={isAudioMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {isAudioMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-neon-emerald" />
          )}
        </button>

        {/* Driver Console Button */}
        <button
          onClick={onToggleDriverModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl glass-panel text-xs font-medium text-slate-300 hover:text-white hover:border-slate-500 transition"
          title="Open live GPS telemetry and driver shift controls"
        >
          <Activity className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="hidden sm:inline">Driver Console</span>
        </button>

        {/* DevTools HUD Toggle Button */}
        <button
          onClick={onToggleHUD}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-panel text-xs font-medium transition-all ${
            isHUDOpen
              ? 'border-neon-emerald text-neon-emerald shadow-neonSmall'
              : 'text-slate-300 hover:text-white hover:border-slate-500'
          }`}
          title="Inspect live Kafka events, Redis Geo cache and Go backend telemetry"
        >
          <Terminal className="w-3.5 h-3.5 text-neon-emerald" />
          <span className="hidden sm:inline">System HUD</span>
        </button>
      </div>
    </header>
  );
};
