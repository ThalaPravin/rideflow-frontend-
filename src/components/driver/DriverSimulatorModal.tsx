'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { sounds } from '@/utils/sound';
import {
  Radio,
  Power,
  Gauge,
  Send,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Star,
  MapPin,
  Clock,
  Car,
  BellRing,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DriverSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriverSimulatorModal: React.FC<DriverSimulatorModalProps> = ({ isOpen, onClose }) => {
  const {
    activeDriver,
    carPosition,
    carHeading,
    status,
    addKafkaLog,
    pickup,
    destination,
    calculateFare,
    acceptRideByDriver,
    cancelRide,
  } = useTripStore();

  const [isOnline, setIsOnline] = useState(true);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  if (!isOpen) return null;

  const fare = calculateFare();

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
      await fetch('http://localhost:8080/api/v1/drivers/location', {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg p-6 rounded-3xl bg-[#141720] border border-[#272D3D] shadow-2xl flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-[#2EE59D] animate-pulse" />
            <div>
              <h3 className="font-bold text-base tracking-tight">Driver Shift Console</h3>
              <p className="text-[11px] text-slate-400">Live GPS telemetry & Redis GEO Index sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* INCOMING RIDE REQUEST ALERT (When Rider Books) */}
        <AnimatePresence>
          {status === 'SEARCHING' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <BellRing className="w-4 h-4 animate-bounce" />
                  Incoming Ride Dispatch
                </span>
                <span className="text-base font-extrabold font-mono text-[#2EE59D]">${fare}</span>
              </div>

              {/* Passenger & Route */}
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-white">Passenger: Alex Rivera</span>
                  <span className="text-amber-400 font-mono flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400" /> 4.94
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 text-[11px] truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#2EE59D] flex-shrink-0" />
                  <span className="truncate">{pickup.address}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    acceptRideByDriver();
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#2EE59D] hover:bg-[#34F5A8] text-black font-extrabold text-xs transition shadow-[0_0_20px_rgba(46,229,157,0.4)]"
                >
                  Accept Ride (${fare})
                </button>
                <button
                  onClick={cancelRide}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Driver Profile & Shift Status */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1B1F2A] border border-[#272D3D]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#252A38] border border-slate-700 flex items-center justify-center font-bold text-white text-sm font-mono">
              {activeDriver?.initials}
            </div>
            <div>
              <span className="text-sm font-bold text-white block">{activeDriver?.name}</span>
              <span className="text-xs text-slate-400">{activeDriver?.vehicleModel} • {activeDriver?.vehicleNumber}</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setIsOnline((prev) => !prev);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
              isOnline
                ? 'bg-[#2EE59D]/20 text-[#2EE59D] border border-[#2EE59D]/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Shift Stats (Earnings, Trips, Rating) */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
          <div className="p-3 rounded-2xl bg-[#1B1F2A] border border-[#272D3D]">
            <span className="text-slate-400 text-[10px] uppercase block">Today Earnings</span>
            <span className="text-[#2EE59D] font-extrabold text-base">$164.50</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#1B1F2A] border border-[#272D3D]">
            <span className="text-slate-400 text-[10px] uppercase block">Trips Today</span>
            <span className="text-white font-extrabold text-base">7 Trips</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#1B1F2A] border border-[#272D3D]">
            <span className="text-slate-400 text-[10px] uppercase block">Rating</span>
            <span className="text-amber-400 font-extrabold text-base flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {activeDriver?.rating}
            </span>
          </div>
        </div>

        {/* Real-time Telemetry Coordinates */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-[#1B1F2A] border border-[#272D3D]">
            <span className="text-slate-400 text-[10px] uppercase block">GPS Latitude</span>
            <span className="text-cyan-400 font-bold text-sm">{carPosition[1].toFixed(5)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#1B1F2A] border border-[#272D3D]">
            <span className="text-slate-400 text-[10px] uppercase block">GPS Longitude</span>
            <span className="text-cyan-400 font-bold text-sm">{carPosition[0].toFixed(5)}</span>
          </div>
        </div>

        {/* Heading & Vehicle Speed */}
        <div className="p-3 rounded-2xl bg-[#1B1F2A] border border-[#272D3D] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#2EE59D]" />
            <span className="text-slate-400">Road Heading Angle</span>
          </div>
          <span className="text-white font-bold">{Math.round(carHeading)}°</span>
        </div>

        {/* Action Button: Emit GPS Ping */}
        <button
          onClick={handleEmitTelemetryPing}
          disabled={pingStatus === 'sending'}
          className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold bg-[#2EE59D] hover:bg-[#34F5A8] text-black flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(46,229,157,0.35)] transition"
        >
          {pingStatus === 'sending' ? (
            <span>Updating Redis Geospatial...</span>
          ) : pingStatus === 'success' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Ping Logged in Redis GEO index!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Emit Live GPS Telemetry Ping to Redis</span>
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
