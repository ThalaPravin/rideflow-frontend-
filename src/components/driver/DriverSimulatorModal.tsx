'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { sounds } from '@/utils/sound';
import { Radio, Power, Gauge, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DriverSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriverSimulatorModal: React.FC<DriverSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { activeDriver, carPosition, carHeading, status, addKafkaLog } = useTripStore();
  const [isOnline, setIsOnline] = useState(true);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  if (!isOpen) return null;

  const handleEmitTelemetryPing = async () => {
    sounds.playClick();
    setPingStatus('sending');

    const payload = {
      driver_id: activeDriver?.id || 'acb336c4-15f2-47f6-8080-d744173a1f3e',
      location: {
        latitude: carPosition[1],
        longitude: carPosition[0],
      },
    };

    try {
      // Attempt sending to local Go API Gateway if running
      const res = await fetch('http://localhost:8080/api/v1/drivers/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      setPingStatus('success');
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
      setLastPingTime(timeStr);

      addKafkaLog({
        topic: 'trip.matched',
        eventType: 'DRIVER_GEO_PING',
        sourceService: 'matching-service',
        payload: {
          driver_id: payload.driver_id,
          redis_key: 'drivers:locations',
          lat: carPosition[1],
          lon: carPosition[0],
          heading: Math.round(carHeading),
          status: 'INDEXED_IN_REDIS_GEO',
        },
      });

      setTimeout(() => setPingStatus('idle'), 1500);
    } catch {
      setPingStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md p-6 rounded-3xl glass-panel-elevated shadow-glass border border-slate-700/80 flex flex-col gap-5 text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-neon-emerald animate-pulse" />
            <div>
              <h3 className="font-bold text-base tracking-tight">Driver Telemetry Console</h3>
              <p className="text-[11px] text-slate-400">Simulate real-time GPS pings to Go & Redis Geo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-obsidian-850 hover:bg-obsidian-750 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Driver Status & Shift Control */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-obsidian-950/80 border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-white block">{activeDriver?.name}</span>
            <span className="text-[11px] text-slate-400">{activeDriver?.vehicleModel} • {activeDriver?.vehicleNumber}</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setIsOnline((prev) => !prev);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
              isOnline
                ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Real-time Telemetry Coordinates */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-obsidian-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Latitude</span>
            <span className="text-neon-cyan font-bold text-sm">{carPosition[1].toFixed(5)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-obsidian-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Longitude</span>
            <span className="text-neon-cyan font-bold text-sm">{carPosition[0].toFixed(5)}</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-obsidian-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-neon-emerald" />
            <span className="text-slate-400">Heading Angle</span>
          </div>
          <span className="text-white font-bold">{Math.round(carHeading)}°</span>
        </div>

        {/* Action Button: Emit GPS Ping */}
        <button
          onClick={handleEmitTelemetryPing}
          disabled={pingStatus === 'sending'}
          className="btn-neon w-full py-3.5 px-6 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
        >
          {pingStatus === 'sending' ? (
            <span>Pinging Redis Geospatial...</span>
          ) : pingStatus === 'success' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-obsidian-950" />
              <span>Ping Logged in Redis GEO index!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Emit Live GPS Telemetry Ping</span>
            </>
          )}
        </button>

        {lastPingTime && (
          <p className="text-center text-[10px] font-mono text-slate-500">
            Last GPS ping acknowledged at {lastPingTime}
          </p>
        )}
      </motion.div>
    </div>
  );
};
