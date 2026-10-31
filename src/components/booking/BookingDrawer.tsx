'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { VEHICLE_OPTIONS, POPULAR_PLACES } from '@/data/mockData';
import { LocationPoint } from '@/types/trip';
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
  Search,
  X,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BookingDrawer: React.FC = () => {
  const {
    pickup,
    destination,
    intermediateStop,
    setPickup,
    setDestination,
    setIntermediateStop,
    removeIntermediateStop,
    selectedVehicle,
    selectVehicle,
    calculateFare,
    status,
    requestRide,
    cancelRide,
    tripProgress,
    activeRoute,
    speedKmH,
    setMapClickMode,
  } = useTripStore();

  const [searchTarget, setSearchTarget] = useState<'pickup' | 'destination' | 'stop' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fare = calculateFare();

  // Swap Pickup and Destination
  const handleSwap = () => {
    if (status !== 'IDLE') return;
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  // Select place from autocomplete
  const handleSelectPlace = (place: { name: string; address: string; lat: number; lon: number }) => {
    const loc: LocationPoint = {
      name: place.name,
      address: place.address,
      lat: place.lat,
      lon: place.lon,
    };

    if (searchTarget === 'pickup') {
      setPickup(loc);
    } else if (searchTarget === 'destination') {
      setDestination(loc);
    } else if (searchTarget === 'stop') {
      setIntermediateStop(loc);
    }

    setSearchTarget(null);
    setSearchQuery('');
  };

  // Handle Map Pinning
  const handlePinOnMap = () => {
    if (searchTarget) {
      setMapClickMode(searchTarget);
      setSearchTarget(null);
    }
  };

  // Filtered popular places for active city
  const cityPlaces = POPULAR_PLACES[activeRoute.id] || POPULAR_PLACES['silicon_valley'];
  const filteredPlaces = cityPlaces.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute top-20 left-6 bottom-6 z-10 w-[390px] max-w-[calc(100vw-3rem)] pointer-events-none flex flex-col justify-between">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel p-6 rounded-3xl pointer-events-auto flex flex-col gap-5 max-h-full overflow-y-auto"
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
            onClick={handleSwap}
            disabled={status !== 'IDLE'}
            className="w-8 h-8 rounded-full bg-obsidian-800 hover:bg-obsidian-700 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition disabled:opacity-50"
            title="Swap pickup and destination"
          >
            <ArrowUpDown className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Route Details (FROM, OPTIONAL STOP, & TO) */}
        <div className="flex flex-col gap-2.5 relative">
          {/* FROM Input */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between pl-8 pr-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                FROM
              </span>
              <span className="text-[10px] text-neon-emerald font-mono">Pickup</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (status === 'IDLE') setSearchTarget('pickup');
              }}
              disabled={status !== 'IDLE'}
              className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-obsidian-800/80 hover:bg-obsidian-750 border border-slate-700/60 focus:border-neon-emerald/60 text-left transition w-full"
            >
              <Circle className="w-3.5 h-3.5 text-neon-emerald flex-shrink-0 fill-neon-emerald/30" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{pickup.name || 'Set Pickup'}</p>
                <p className="text-[11px] text-slate-400 truncate">{pickup.address}</p>
              </div>
              <MapPin className="w-4 h-4 text-neon-emerald flex-shrink-0" />
            </button>
          </div>

          {/* Intermediate Stop (If Added) */}
          {intermediateStop && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between pl-8 pr-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
                  WAYPOINT STOP
                </span>
                <button
                  onClick={removeIntermediateStop}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-purple-950/30 border border-purple-500/40 text-left transition w-full">
                <div className="w-3.5 h-3.5 rounded-full bg-purple-500/30 border border-purple-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] font-bold text-purple-200">S</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-purple-100 truncate">{intermediateStop.name}</p>
                  <p className="text-[11px] text-purple-300/70 truncate">{intermediateStop.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* TO Input */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between pl-8 pr-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                TO
              </span>
              <span className="text-[10px] text-neon-cyan font-mono">Dropoff</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (status === 'IDLE') setSearchTarget('destination');
              }}
              disabled={status !== 'IDLE'}
              className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-obsidian-800/80 hover:bg-obsidian-750 border border-slate-700/60 focus:border-neon-emerald/60 text-left transition w-full"
            >
              <MapPin className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0 fill-neon-cyan/20" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{destination.name || 'Set Destination'}</p>
                <p className="text-[11px] text-slate-400 truncate">{destination.address}</p>
              </div>
              <Navigation className="w-4 h-4 text-neon-cyan flex-shrink-0" />
            </button>
          </div>

          {/* Add Stop Button (If no intermediate stop yet) */}
          {!intermediateStop && status === 'IDLE' && (
            <button
              onClick={() => setSearchTarget('stop')}
              className="flex items-center justify-center gap-2 py-2 rounded-2xl border border-dashed border-slate-700/60 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-500 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add intermediate stop</span>
            </button>
          )}
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
              const stopFee = intermediateStop ? 2.5 : 0;
              const carFare = (car.basePrice + activeRoute.distanceKm * car.perKm + stopFee).toFixed(2);

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

        {/* Trip Status & Live Speed Telemetry (When Active) */}
        <AnimatePresence>
          {status !== 'IDLE' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-obsidian-850/90 border border-slate-700"
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

              {/* Live Telemetry Speedometer during ON_TRIP */}
              {status === 'ON_TRIP' && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1 text-neon-cyan font-semibold">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>{speedKmH} km/h</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span>ETA ~{Math.max(1, Math.round(activeRoute.durationMin * (1 - tripProgress / 100)))}m remaining</span>
                  </div>
                </div>
              )}
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

      {/* Location Picker / Search Modal */}
      <AnimatePresence>
        {searchTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-30 glass-panel-elevated p-5 rounded-3xl flex flex-col gap-4 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  {searchTarget === 'pickup' && 'Select Pickup Location'}
                  {searchTarget === 'destination' && 'Select Destination'}
                  {searchTarget === 'stop' && 'Add Intermediate Stop'}
                </h3>
                <p className="text-xs text-slate-400">Choose a landmark or pin on map</p>
              </div>
              <button
                onClick={() => setSearchTarget(null)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-obsidian-850 border border-slate-700">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search addresses, landmarks, airports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
              />
            </div>

            {/* Action 1: Pin Directly on Map */}
            <button
              onClick={handlePinOnMap}
              className="flex items-center gap-3 p-3 rounded-2xl bg-neon-emerald/10 hover:bg-neon-emerald/20 border border-neon-emerald/30 text-left transition"
            >
              <div className="w-8 h-8 rounded-xl bg-neon-emerald/20 flex items-center justify-center text-neon-emerald">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-neon-emerald">Set custom point on Map</p>
                <p className="text-[11px] text-slate-400">Click anywhere on vector canvas to place pin</p>
              </div>
            </button>

            {/* Popular Landmarks List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Popular Locations in {activeRoute.city.split(' ')[0]}
              </span>
              {filteredPlaces.map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPlace(place)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 text-left transition"
                >
                  <Sparkles className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{place.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{place.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
