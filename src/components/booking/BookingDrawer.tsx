'use client';

import React from 'react';
import { useTripStore } from '@/store/useTripStore';
import { VEHICLE_OPTIONS } from '@/data/mockData';
import {
  ArrowUpDown,
  Circle,
  MapPin,
  Plus,
  Loader2,
  Navigation,
  CheckCircle2,
  XCircle,
  Users,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BookingDrawer: React.FC = () => {
  const {
    pickup,
    destination,
    selectedVehicle,
    selectVehicle,
    calculateFare,
    status,
    requestRide,
    cancelRide,
    tripProgress,
    activeRoute,
  } = useTripStore();

  const fare = calculateFare();

  return (
    <div className="absolute top-20 left-6 bottom-6 z-10 w-[380px] max-w-[calc(100vw-3rem)] pointer-events-none flex flex-col justify-between">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel p-6 rounded-3xl pointer-events-auto flex flex-col gap-6 max-h-full overflow-y-auto"
      >
        {/* Header Title & Swap Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Trip Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeRoute.distanceKm} km • ~{activeRoute.durationMin} mins journey
            </p>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-obsidian-800 hover:bg-obsidian-700 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition"
            title="Swap locations"
          >
            <ArrowUpDown className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Route Details (FROM & TO) */}
        <div className="flex flex-col gap-3 relative">
          {/* FROM Input */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold pl-8">
              FROM
            </span>
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-obsidian-800/80 border border-slate-700/60 focus-within:border-neon-emerald/60 transition">
              <Circle className="w-3.5 h-3.5 text-neon-emerald flex-shrink-0 fill-neon-emerald/30" />
              <input
                type="text"
                readOnly
                value={pickup.address}
                className="bg-transparent text-sm font-medium text-white outline-none w-full truncate"
              />
              <MapPin className="w-4 h-4 text-neon-emerald flex-shrink-0" />
            </div>
          </div>

          {/* Dotted Step Line */}
          <div className="absolute left-[20px] top-[40px] bottom-[42px] w-[1px] border-l-2 border-dotted border-slate-600/60 pointer-events-none" />

          {/* TO Input */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold pl-8">
              TO
            </span>
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-obsidian-800/80 border border-slate-700/60 focus-within:border-neon-emerald/60 transition">
              <MapPin className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0 fill-neon-cyan/20" />
              <input
                type="text"
                readOnly
                value={destination.address}
                className="bg-transparent text-sm font-medium text-white outline-none w-full truncate"
              />
              <Navigation className="w-4 h-4 text-neon-cyan flex-shrink-0" />
            </div>
          </div>

          {/* Add Stop Button */}
          <button className="flex items-center justify-center gap-2 py-2 rounded-2xl border border-dashed border-slate-700/60 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-500 transition">
            <Plus className="w-3.5 h-3.5" />
            <span>Add stop</span>
          </button>
        </div>

        {/* Vehicle Selection Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-white">Select Car</h3>
            <span className="text-xs font-mono text-slate-400">4 available</span>
          </div>

          {/* Horizontal Vehicle Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {VEHICLE_OPTIONS.map((car) => {
              const isSelected = selectedVehicle.id === car.id;
              const carFare = (car.basePrice + activeRoute.distanceKm * car.perKm).toFixed(2);

              return (
                <button
                  key={car.id}
                  onClick={() => selectVehicle(car.id)}
                  disabled={status !== 'IDLE'}
                  className={`text-left p-3 rounded-2xl transition-all relative flex flex-col justify-between h-[125px] overflow-hidden ${
                    isSelected ? 'glass-card-active' : 'glass-card'
                  }`}
                >
                  {/* Top info */}
                  <div className="z-10">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white tracking-tight">{car.name}</h4>
                      <span className="text-[11px] font-mono font-bold text-neon-emerald">${carFare}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{car.brand}</p>
                  </div>

                  {/* Car Image render */}
                  <div className="absolute right-[-10px] bottom-[-5px] w-28 h-16 pointer-events-none opacity-85">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover rounded-lg filter drop-shadow-lg"
                    />
                  </div>

                  {/* Bottom badges */}
                  <div className="z-10 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-neon-cyan" /> {car.etaMinutes}m
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Users className="w-3 h-3 text-slate-400" /> {car.capacity}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trip Status / Progress Bar (When Active) */}
        <AnimatePresence>
          {status !== 'IDLE' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2 p-3.5 rounded-2xl bg-obsidian-850/90 border border-slate-700"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-neon-emerald flex items-center gap-1.5 font-semibold">
                  {status === 'SEARCHING' && (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying Redis Geo...
                    </>
                  )}
                  {status === 'ASSIGNED' && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-neon-emerald" /> Driver Dispatched
                    </>
                  )}
                  {status === 'ON_TRIP' && (
                    <>
                      <Navigation className="w-3.5 h-3.5 animate-pulse text-neon-cyan" /> In Transit
                    </>
                  )}
                </span>
                <span className="font-mono text-slate-400 font-semibold">{tripProgress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-neon-emerald h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${tripProgress}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button Actions */}
        <div>
          {status === 'IDLE' ? (
            <button
              onClick={requestRide}
              className="btn-neon w-full py-3.5 px-6 rounded-2xl text-base flex items-center justify-between"
            >
              <span>Confirm Order</span>
              <span className="font-mono text-lg font-extrabold">${fare}</span>
            </button>
          ) : (
            <button
              onClick={cancelRide}
              className="w-full py-3 px-4 rounded-2xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Ride Request</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
