'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { VEHICLE_OPTIONS } from '@/data/mockData';
import {
  Car,
  Package,
  MapPin,
  Plus,
  X,
  Users,
  Briefcase,
  Snowflake,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Navigation,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GoCabsDashboard: React.FC = () => {
  const {
    pickup,
    destination,
    selectedVehicle,
    selectVehicle,
    calculateFare,
    status,
    requestRide,
    cancelRide,
    activeRoute,
    tripProgress,
    setUITheme,
  } = useTripStore();

  const [bookingType, setBookingType] = useState<'ride' | 'courier'>('ride');

  // GoCabs specific cars
  const goCabsCars = [
    {
      ...VEHICLE_OPTIONS.find((v) => v.id === 'camry_white') || VEHICLE_OPTIONS[0],
      name: 'White Camry',
      specs: '4 Seats • AC • 2 Luggage',
      price: '$18.50',
    },
    {
      ...VEHICLE_OPTIONS.find((v) => v.id === 'mustang_gt') || VEHICLE_OPTIONS[1],
      name: 'Mustang Shelby GT',
      specs: '2 Seats • Sports Edition • V8',
      price: '$35.00',
    },
    {
      ...VEHICLE_OPTIONS.find((v) => v.id === 'crv_suv') || VEHICLE_OPTIONS[2],
      name: 'Honda CR-V',
      specs: '6 Seats • Spacious SUV • AC',
      price: '$28.00',
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
      {/* 1. GoCabs Top Navbar matching Image 3 (Bottom-Right Laptop) */}
      <header className="w-full bg-[#1A1814]/95 backdrop-blur-md border-b border-[#2D2A24] px-8 py-3.5 flex items-center justify-between pointer-events-auto shadow-xl">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F59E0B] flex items-center justify-center text-black font-black text-base shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              🚕
            </div>
            <span className="font-black text-xl tracking-tight text-[#F59E0B] flex items-center gap-1 font-sans">
              GOCABS
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button className="text-[#F59E0B] hover:text-[#FBBF24] transition">Ride</button>
            <button className="hover:text-white transition">Drive</button>
            <button className="hover:text-white transition">Help</button>
            <button className="hover:text-white transition">About</button>
          </nav>
        </div>

        {/* View Switchers & Auth Buttons */}
        <div className="flex items-center gap-3">
          {/* Switcher back to Umoto / Uber */}
          <div className="flex items-center gap-1 bg-[#25221B] p-1 rounded-xl border border-[#3A352B] text-xs">
            <button
              onClick={() => setUITheme('umoto')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition font-medium"
            >
              Umoto Dark
            </button>
            <button
              onClick={() => setUITheme('uber')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition font-medium"
            >
              Uber View
            </button>
          </div>

          <button className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition">
            Log In
          </button>
          <button className="text-xs font-bold bg-[#F59E0B] hover:bg-[#FBBF24] text-black px-4 py-2 rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            Sign Up
          </button>
        </div>
      </header>

      {/* 2. Floating Left Booking Card matching Image 3 Laptop Screen */}
      <div className="p-6 pointer-events-none flex-1 flex flex-col justify-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="w-[430px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-6rem)] overflow-y-auto bg-[#1C1A16]/95 backdrop-blur-xl border border-[#363228] rounded-3xl p-6 pointer-events-auto shadow-2xl flex flex-col gap-5 text-white"
        >
          {/* Title */}
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">Book Your Ride</h2>
            <p className="text-xs text-slate-400 mt-0.5">Reliable city commute across Silicon Valley</p>
          </div>

          {/* Ride / Courier Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#28241E] rounded-2xl border border-[#3A352A] text-xs font-semibold">
            <button
              onClick={() => setBookingType('ride')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl transition ${
                bookingType === 'ride'
                  ? 'bg-[#F59E0B] text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Ride</span>
            </button>
            <button
              onClick={() => setBookingType('courier')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl transition ${
                bookingType === 'courier'
                  ? 'bg-[#F59E0B] text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Courier</span>
            </button>
          </div>

          {/* Inputs (Pick-up & Drop-off) */}
          <div className="flex flex-col gap-2.5">
            {/* Pick-up */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#28241E] border border-[#3D372B] text-xs">
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                <MapPin className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={pickup.address}
                  className="bg-transparent text-white font-medium outline-none w-full truncate"
                />
              </div>
              <button className="text-slate-400 hover:text-white">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Drop-off */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#28241E] border border-[#3D372B] text-xs">
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                <Navigation className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={destination.address}
                  className="bg-transparent text-white font-medium outline-none w-full truncate"
                />
              </div>
              <button className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Available Cars For Ride */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Available cars for ride</h3>
              <span className="text-xs font-mono text-slate-400">10 cars found</span>
            </div>

            {/* Cars List */}
            <div className="flex flex-col gap-2.5">
              {goCabsCars.map((car) => {
                const isSelected = selectedVehicle.id === car.id;
                return (
                  <div
                    key={car.id}
                    onClick={() => selectVehicle(car.id)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#2E2920] border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'bg-[#25211B] border-[#383327] hover:border-[#F59E0B]/50'
                    }`}
                  >
                    {/* Left: Car Title & Specs */}
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white tracking-tight">{car.name}</h4>
                        <span className="text-[10px] font-mono font-bold text-[#F59E0B] px-1.5 py-0.5 rounded bg-[#F59E0B]/10">
                          {car.price}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{car.specs}</p>

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#F59E0B]" /> {car.capacity} Seats
                        </span>
                        <span className="flex items-center gap-1">
                          <Snowflake className="w-3 h-3 text-cyan-400" /> AC
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-amber-400" /> Luggage
                        </span>
                      </div>
                    </div>

                    {/* Right: Car Thumbnail & Book Button */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="w-24 h-14 rounded-xl overflow-hidden bg-black/40 border border-[#3E382C]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={car.image}
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectVehicle(car.id);
                          requestRide();
                        }}
                        disabled={status !== 'IDLE'}
                        className="text-xs font-bold bg-[#F59E0B] hover:bg-[#FBBF24] text-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1"
                      >
                        <span>Book Ride</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Trip Telemetry Status */}
          <AnimatePresence>
            {status !== 'IDLE' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-2xl bg-[#2A251E] border border-[#F59E0B]/40 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#F59E0B] flex items-center gap-1.5 font-bold">
                    {status === 'SEARCHING' && (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dispatching GoCab Driver...
                      </>
                    )}
                    {status === 'ASSIGNED' && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B]" /> Driver Matched
                      </>
                    )}
                    {status === 'ON_TRIP' && (
                      <>
                        <Navigation className="w-3.5 h-3.5 animate-pulse text-[#F59E0B]" /> En Route
                      </>
                    )}
                  </span>
                  <span className="font-mono text-slate-400 font-bold">{tripProgress}%</span>
                </div>

                <div className="w-full bg-[#1A1814] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#F59E0B] h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${tripProgress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          {status !== 'IDLE' && (
            <button
              onClick={cancelRide}
              className="w-full py-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/20 transition"
            >
              Cancel GoCab Request
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};
