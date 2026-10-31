'use client';

import React, { useEffect } from 'react';
import { PRESET_ROUTES } from '@/data/mockData';
import { useTripStore } from '@/store/useTripStore';
import { Activity, MapPin, Terminal, Volume2, VolumeX, Receipt } from 'lucide-react';

interface HeaderProps {
  onToggleHUD: () => void;
  isHUDOpen: boolean;
  onToggleDriverModal: () => void;
  onOpenHistoryModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleHUD,
  isHUDOpen,
  onToggleDriverModal,
  onOpenHistoryModal,
}) => {
  const {
    activeRoute,
    selectPresetRoute,
    status,
    isAudioMuted,
    toggleAudioMute,
    isBackendConnected,
    backendLatencyMs,
    checkBackendHealth,
    uiTheme,
    setUITheme,
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
      {/* Theme View Switcher & City Selector */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Design View Switcher: Umoto / Uber / GoCabs (All 3 reference designs from Image 3) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#13161F]/90 backdrop-blur-xl border border-[#242A38] shadow-2xl">
          <button
            onClick={() => setUITheme('umoto')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              uiTheme === 'umoto'
                ? 'bg-[#2EE59D] text-black shadow-[0_0_15px_rgba(46,229,157,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Umoto
          </button>
          <button
            onClick={() => setUITheme('uber')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              uiTheme === 'uber'
                ? 'bg-[#00E599] text-black shadow-[0_0_15px_rgba(0,229,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Uber
          </button>
          <button
            onClick={() => setUITheme('gocabs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              uiTheme === 'gocabs'
                ? 'bg-[#F59E0B] text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            GoCabs
          </button>
        </div>

        {/* City Selector */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#13161F]/80 backdrop-blur-md border border-[#242A38] text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-[#2EE59D]" />
          <span className="text-slate-500 font-medium">City:</span>
          <select
            value={activeRoute.id}
            onChange={(e) => selectPresetRoute(e.target.value)}
            disabled={status !== 'IDLE'}
            className="bg-transparent text-white font-semibold cursor-pointer outline-none border-none pr-1"
          >
            {PRESET_ROUTES.map((route) => (
              <option key={route.id} value={route.id} className="bg-[#13161F] text-slate-200">
                {route.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Backend Status, Audio, & DevTools Trigger */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Trips History Modal Trigger */}
        <button
          onClick={onOpenHistoryModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#13161F]/80 backdrop-blur-md border border-[#242A38] text-xs font-medium text-slate-300 hover:text-white hover:border-slate-500 transition"
          title="View past completed trips & Kafka verified receipts"
        >
          <Receipt className="w-3.5 h-3.5 text-[#2EE59D]" />
          <span className="hidden md:inline">Trips</span>
        </button>

        {/* Go Backend Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#13161F]/80 backdrop-blur-md border border-[#242A38] text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBackendConnected ? 'bg-[#2EE59D]' : 'bg-cyan-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isBackendConnected ? 'bg-[#2EE59D]' : 'bg-cyan-400'
              }`}
            />
          </span>
          <span className="text-slate-300 font-medium">
            {isBackendConnected ? 'Go Gateway Live' : 'Go Architecture'}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border ${
              isBackendConnected
                ? 'bg-emerald-950/80 text-[#2EE59D] border-emerald-500/30'
                : 'bg-slate-800 text-cyan-400 border-slate-700'
            }`}
          >
            {isBackendConnected ? `${backendLatencyMs}ms` : 'Simulator Ready'}
          </span>
        </div>

        {/* Audio Mute/Unmute Button */}
        <button
          onClick={toggleAudioMute}
          className="w-9 h-9 rounded-2xl bg-[#13161F]/80 backdrop-blur-md border border-[#242A38] flex items-center justify-center text-slate-300 hover:text-white transition"
          title={isAudioMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {isAudioMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#2EE59D]" />
          )}
        </button>

        {/* Driver Console Button */}
        <button
          onClick={onToggleDriverModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#13161F]/80 backdrop-blur-md border border-[#242A38] text-xs font-medium text-slate-300 hover:text-white hover:border-slate-500 transition"
          title="Open live GPS telemetry and driver shift controls"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Driver Console</span>
        </button>

        {/* DevTools HUD Toggle Button */}
        <button
          onClick={onToggleHUD}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#13161F]/80 backdrop-blur-md border text-xs font-medium transition-all ${
            isHUDOpen
              ? 'border-[#2EE59D] text-[#2EE59D] shadow-[0_0_15px_rgba(46,229,157,0.3)]'
              : 'border-[#242A38] text-slate-300 hover:text-white hover:border-slate-500'
          }`}
          title="Inspect live Kafka events, Redis Geo cache and Go backend telemetry"
        >
          <Terminal className="w-3.5 h-3.5 text-[#2EE59D]" />
          <span className="hidden md:inline">System HUD</span>
        </button>
      </div>
    </header>
  );
};
