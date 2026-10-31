'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { VEHICLE_OPTIONS, POPULAR_PLACES } from '@/data/mockData';
import { LocationPoint } from '@/types/trip';
import {
  ArrowLeftRight,
  Crosshair,
  MapPin,
  Home,
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
  Settings,
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
    uiTheme,
    setUITheme,
    mobileTab,
  } = useTripStore();

  const [searchTarget, setSearchTarget] = useState<'pickup' | 'destination' | 'stop' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassTier, setSelectedClassTier] = useState<'business' | 'standart' | 'premium'>('standart');

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

  const handlePinOnMap = () => {
    if (searchTarget) {
      setMapClickMode(searchTarget);
      setSearchTarget(null);
    }
  };

  const cityPlaces = POPULAR_PLACES[activeRoute.id] || POPULAR_PLACES['silicon_valley'];
  const filteredPlaces = cityPlaces.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -------------------------------------------------------------
  // RENDER: UBER THEME (From Image 2 & 3)
  // -------------------------------------------------------------
  if (uiTheme === 'uber') {
    return (
      <aside
        className={`w-full md:w-[360px] max-w-full md:max-w-[90vw] h-screen bg-[#111215] border-r border-[#1E2028] z-20 flex flex-col justify-between p-6 select-none shadow-2xl relative ${
          mobileTab === 'map' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Top Header: Uber Brand & Theme Switcher */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00E599] flex items-center justify-center font-bold text-black text-xs">
                U
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Uber</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUITheme('umoto')}
                className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                title="Switch to Umoto design"
              >
                Umoto View
              </button>
              <button className="text-slate-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">Route Details</h2>

          {/* Route Inputs (Uber Style with Home & Pin icons) */}
          <div className="flex flex-col gap-2.5 relative">
            {/* Dotted indicator line */}
            <div className="absolute left-[-14px] top-4 bottom-4 flex flex-col items-center justify-between pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#00E599]" />
              <span className="w-[1px] h-7 border-l border-dashed border-[#00E599]/60" />
              <span className="w-2 h-2 bg-[#00E599]" />
            </div>

            {/* FROM */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#18191E] border border-[#242730] text-xs">
              <input
                type="text"
                readOnly
                value={pickup.address}
                className="bg-transparent text-white font-medium outline-none w-full truncate"
              />
              <Home className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
            </div>

            {/* TO with + stop on right */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#18191E] border border-[#242730] text-xs">
              <input
                type="text"
                readOnly
                value={destination.address}
                className="bg-transparent text-white font-medium outline-none w-full truncate"
              />
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <button
                  onClick={() => setSearchTarget('stop')}
                  className="w-4 h-4 text-[#00E599] hover:scale-110 transition"
                  title="Add stop"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Choose Class (Business, Standart, Premium) */}
          <div className="flex flex-col gap-3 mt-4">
            <h3 className="text-base font-bold text-white tracking-tight">Choose Class</h3>
            <div className="flex flex-col gap-2">
              {[
                { id: 'business', label: 'Business', price: '$15' },
                { id: 'standart', label: 'Standart', price: '$22' },
                { id: 'premium', label: 'Premium', price: '$30' },
              ].map((tier) => {
                const isSelected = selectedClassTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedClassTier(tier.id as any)}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all ${
                      isSelected
                        ? 'bg-[#22252C] border border-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-[#18191E]'
                    }`}
                  >
                    <span className="text-sm font-medium">{tier.label}</span>
                    <span className="text-sm font-mono">{tier.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <button
            onClick={requestRide}
            className="w-full py-4 rounded-2xl bg-[#00E599] hover:bg-[#2EE59D] text-black font-extrabold text-sm transition shadow-[0_0_25px_rgba(0,229,153,0.35)]"
          >
            Confirm Order
          </button>
          <button
            onClick={cancelRide}
            className="text-xs text-slate-500 hover:text-slate-300 font-medium py-1"
          >
            Cancel
          </button>
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // RENDER: UMOTO DARK THEME (From Image 1 & Left of Image 3)
  // -------------------------------------------------------------
  return (
    <aside
      className={`w-full md:w-[390px] lg:w-[420px] max-w-full md:max-w-[90vw] h-screen bg-[#13161F] border-r border-[#1F2432] z-20 flex flex-col justify-between p-6 lg:p-7 select-none shadow-2xl relative overflow-hidden ${
        mobileTab === 'map' ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* Top Header: Brand & View Toggle */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-black tracking-tight text-[#2EE59D] lowercase font-sans flex items-center">
              umoto
              <span className="w-1.5 h-1.5 rounded-full bg-[#2EE59D] ml-0.5 mt-2" />
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setUITheme('uber')}
              className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#1B1F2A] border border-[#272D3D] text-slate-400 hover:text-white hover:border-[#2EE59D] transition"
              title="Switch to Uber layout"
            >
              Uber View
            </button>
            <button
              onClick={handleSwap}
              disabled={status !== 'IDLE'}
              className="text-slate-400 hover:text-white transition p-1"
              title="Swap pickup and destination"
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Section: Trip Details */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white">Trip Details</h2>
            <span className="text-xs font-mono text-slate-400">
              {activeRoute.distanceKm} km • ~{activeRoute.durationMin}m
            </span>
          </div>

          {/* Dotted Journey Inputs */}
          <div className="flex flex-col gap-2 relative">
            {/* Left Dotted Line with 3 Circles */}
            <div className="absolute left-[8px] top-[34px] bottom-[30px] flex flex-col items-center justify-between pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full border border-[#2EE59D] bg-[#13161F]" />
              <span className="w-[1px] h-10 border-l border-dotted border-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full border border-slate-500 bg-[#13161F]" />
              <span className="w-[1px] h-7 border-l border-dotted border-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full border border-slate-600 bg-[#13161F]" />
            </div>

            {/* FROM */}
            <div className="flex flex-col gap-1 pl-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                FROM
              </span>
              <button
                type="button"
                onClick={() => {
                  if (status === 'IDLE') setSearchTarget('pickup');
                }}
                disabled={status !== 'IDLE'}
                className="flex items-center justify-between px-3.5 py-3 rounded-2xl bg-[#1B1F2A] hover:bg-[#202533] border border-[#272D3D] text-left transition w-full"
              >
                <span className="text-xs font-medium text-white truncate max-w-[240px]">
                  {pickup.address}
                </span>
                <Crosshair className="w-4 h-4 text-[#2EE59D] flex-shrink-0" />
              </button>
            </div>

            {/* TO */}
            <div className="flex flex-col gap-1 pl-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                TO
              </span>
              <button
                type="button"
                onClick={() => {
                  if (status === 'IDLE') setSearchTarget('destination');
                }}
                disabled={status !== 'IDLE'}
                className="flex items-center justify-between px-3.5 py-3 rounded-2xl bg-[#1B1F2A] hover:bg-[#202533] border border-[#272D3D] text-left transition w-full"
              >
                <span className="text-xs font-medium text-white truncate max-w-[240px]">
                  {destination.address}
                </span>
                <Crosshair className="w-4 h-4 text-[#2EE59D] flex-shrink-0" />
              </button>
            </div>

            {/* Intermediate Stop or + Pill */}
            <div className="pl-6 pt-1">
              {intermediateStop ? (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#201830] border border-purple-500/40 text-xs text-purple-200">
                  <span className="truncate max-w-[220px]">{intermediateStop.name}</span>
                  <button
                    onClick={removeIntermediateStop}
                    className="text-rose-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchTarget('stop')}
                  disabled={status !== 'IDLE'}
                  className="w-full h-11 rounded-2xl border border-dashed border-[#272D3D] bg-[#161922] hover:border-[#2EE59D] hover:bg-[#1B1F2A] flex items-center justify-center text-slate-400 hover:text-white transition"
                  title="Add stop"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section: Select Car (Image 1 Style with Mint Selected Card) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold tracking-tight text-white">Select Car</h3>
            <span className="text-xs font-mono text-slate-400">10 Cars</span>
          </div>

          {/* Horizontal Vehicle Cards */}
          <div className="grid grid-cols-2 gap-3">
            {VEHICLE_OPTIONS.slice(0, 2).map((car) => {
              const isSelected = selectedVehicle.id === car.id;
              const carFare = (car.basePrice + activeRoute.distanceKm * car.perKm).toFixed(2);

              return (
                <button
                  key={car.id}
                  onClick={() => selectVehicle(car.id)}
                  disabled={status !== 'IDLE'}
                  className={`text-left p-4 rounded-2xl transition-all relative flex flex-col justify-between h-[155px] overflow-hidden ${
                    isSelected
                      ? 'bg-[#2EE59D] text-black shadow-[0_8px_30px_rgba(46,229,157,0.35)]'
                      : 'bg-[#1B1F2A] border border-[#272D3D] text-white hover:border-slate-600'
                  }`}
                >
                  {/* Top Text Info */}
                  <div className="z-10">
                    <h4
                      className={`font-extrabold text-base tracking-tight ${
                        isSelected ? 'text-black' : 'text-white'
                      }`}
                    >
                      {car.name}
                    </h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isSelected ? 'text-black/80 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {car.brand}
                    </p>
                  </div>

                  {/* Front-Facing Car Cutout Image */}
                  <div className="absolute right-[-15px] bottom-[-5px] w-36 h-24 pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover filter drop-shadow-xl"
                    />
                  </div>

                  {/* Bottom Stats */}
                  <div
                    className={`z-10 flex items-center gap-2 text-[10px] font-mono ${
                      isSelected ? 'text-black/90 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <span>${carFare}</span>
                    <span>• {car.etaMinutes}m</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scroll Track Indicator (Matching Image 1) */}
          <div className="w-full h-1 bg-[#232836] rounded-full mt-1 flex items-center">
            <div className="w-12 h-1 bg-[#2EE59D] rounded-full" />
          </div>
        </div>
      </div>

      {/* Trip Status / Progress Bar (When Active) */}
      <AnimatePresence>
        {status !== 'IDLE' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#1B1F2A] border border-slate-700 my-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#2EE59D] flex items-center gap-1.5 font-semibold">
                {status === 'SEARCHING' && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Matching Driver...
                  </>
                )}
                {status === 'ASSIGNED' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE59D]" /> Jeromy Conway Dispatched
                  </>
                )}
                {status === 'ON_TRIP' && (
                  <>
                    <Navigation className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> Heading to Destination
                  </>
                )}
              </span>
              <span className="font-mono text-slate-400 font-semibold">{tripProgress}%</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#2EE59D] h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${tripProgress}%` }}
              />
            </div>

            {status === 'ON_TRIP' && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-[#2EE59D] font-bold">{speedKmH || 42} km/h</span>
                <span>ETA {Math.max(1, Math.round(activeRoute.durationMin * (1 - tripProgress / 100)))}m remaining</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CTA Button: Confirm Order • $22.45 */}
      <div className="pt-4 relative">
        {status === 'IDLE' ? (
          <button
            onClick={requestRide}
            className="w-full h-14 rounded-full bg-[#2EE59D] hover:bg-[#34F5A8] text-black font-extrabold text-base flex items-center justify-between px-7 shadow-[0_0_35px_rgba(46,229,157,0.45)] transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Confirm Order</span>
            <span className="font-mono text-lg font-black">${fare.toFixed(2)}</span>
          </button>
        ) : (
          <button
            onClick={cancelRide}
            className="w-full py-3.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Ride</span>
          </button>
        )}
      </div>

      {/* Decorative Green Accent Shape (Matching bottom-left of Image 1 & 3) */}
      <div className="absolute -bottom-8 -left-8 w-28 h-14 bg-[#2EE59D] transform -rotate-12 rounded-3xl opacity-80 pointer-events-none -z-0" />

      {/* Search Modal */}
      <AnimatePresence>
        {searchTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-30 bg-[#13161F] p-6 flex flex-col gap-4 select-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">
                {searchTarget === 'pickup' && 'Set Pickup Address'}
                {searchTarget === 'destination' && 'Set Destination'}
                {searchTarget === 'stop' && 'Add Intermediate Stop'}
              </h3>
              <button
                onClick={() => setSearchTarget(null)}
                className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#1B1F2A] border border-[#272D3D]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search addresses or landmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
              />
            </div>

            <button
              onClick={handlePinOnMap}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#2EE59D]/10 hover:bg-[#2EE59D]/20 border border-[#2EE59D]/30 text-left transition"
            >
              <MapPin className="w-4 h-4 text-[#2EE59D]" />
              <div>
                <p className="text-xs font-bold text-[#2EE59D]">Click point on Map</p>
                <p className="text-[10px] text-slate-400">Click anywhere on vector canvas</p>
              </div>
            </button>

            <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
              {filteredPlaces.map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPlace(place)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1B1F2A] text-left transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2EE59D] flex-shrink-0" />
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
    </aside>
  );
};
