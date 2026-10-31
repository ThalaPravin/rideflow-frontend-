'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Home, MapPin, Car, X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RouteSummaryCard: React.FC = () => {
  const { pickup, destination, intermediateStop, selectedVehicle, activeRoute, status, uiTheme } = useTripStore();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || status === 'COMPLETED') return null;

  const isUberWhite = uiTheme === 'uber';

  return (
    <div className="absolute bottom-6 left-[440px] right-8 z-20 pointer-events-none hidden md:flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-2xl p-4.5 shadow-2xl pointer-events-auto w-full max-w-[700px] border transition-colors ${
          isUberWhite
            ? 'bg-white text-black border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.3)]'
            : 'bg-[#151923]/95 backdrop-blur-xl border-[#252B3B] text-white'
        }`}
      >
        {/* Card Header matching Image 2 */}
        <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
          isUberWhite ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm tracking-tight ${isUberWhite ? 'text-slate-900' : 'text-white'}`}>
              Route - {activeRoute.distanceKm.toFixed(1).replace('.', ',')} Kilometers
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2EE59D]/20 text-[#00A86B] font-bold">
              ~{activeRoute.durationMin} min
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
              isUberWhite ? 'hover:bg-slate-100 text-slate-400 hover:text-black' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Columns matching Image 2 */}
        <div className="grid grid-cols-3 gap-4 text-xs">
          {/* Col 1: Your Location */}
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
              isUberWhite ? 'bg-slate-100 text-black' : 'bg-[#1D2230] text-[#2EE59D]'
            }`}>
              <Home className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-mono uppercase font-semibold block ${
                isUberWhite ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Your Location
              </span>
              <p className={`font-semibold truncate mt-0.5 ${isUberWhite ? 'text-slate-900' : 'text-white'}`} title={pickup.address}>
                {pickup.address}
              </p>
            </div>
          </div>

          {/* Col 2: Destination */}
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
              isUberWhite ? 'bg-slate-100 text-black' : 'bg-[#1D2230] text-[#38BDF8]'
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-mono uppercase font-semibold block ${
                isUberWhite ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Destination
              </span>
              <p className={`font-semibold truncate mt-0.5 ${isUberWhite ? 'text-slate-900' : 'text-white'}`} title={destination.address}>
                {destination.address}
              </p>
            </div>
          </div>

          {/* Col 3: Car Model */}
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
              isUberWhite ? 'bg-slate-100 text-black' : 'bg-[#1D2230] text-amber-400'
            }`}>
              <Car className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-mono uppercase font-semibold block ${
                isUberWhite ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Car Model
              </span>
              <p className={`font-semibold truncate mt-0.5 ${isUberWhite ? 'text-slate-900' : 'text-white'}`}>
                {selectedVehicle.brand} {selectedVehicle.name}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
