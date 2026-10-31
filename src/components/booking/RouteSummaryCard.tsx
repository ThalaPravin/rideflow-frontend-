'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Home, MapPin, Car, X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RouteSummaryCard: React.FC = () => {
  const { pickup, destination, selectedVehicle, activeRoute, status } = useTripStore();
  const [isMinimized, setIsMinimized] = useState(false);

  // Show when route is selected and not in receipt mode
  if (status === 'COMPLETED') return null;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none hidden md:block">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel-elevated rounded-2xl p-4 shadow-glass pointer-events-auto border border-slate-700/80 min-w-[580px] max-w-[90vw]"
      >
        {/* Card Header matching Image 2 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-tight">
              Route - {activeRoute.distanceKm.toFixed(1).replace('.', ',')} Kilometers
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan font-semibold border border-neon-cyan/25">
              ~{activeRoute.durationMin} min
            </span>
          </div>
          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            className="w-6 h-6 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 3 Columns matching Image 2 */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-3 gap-4 text-xs"
            >
              {/* Col 1: Your Location */}
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-obsidian-950 text-neon-emerald border border-slate-800 flex-shrink-0 mt-0.5">
                  <Home className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                    Your Location
                  </span>
                  <p className="text-white font-medium truncate mt-0.5" title={pickup.address}>
                    {pickup.address}
                  </p>
                </div>
              </div>

              {/* Col 2: Destination */}
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-obsidian-950 text-neon-cyan border border-slate-800 flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                    Destination
                  </span>
                  <p className="text-white font-medium truncate mt-0.5" title={destination.address}>
                    {destination.address}
                  </p>
                </div>
              </div>

              {/* Col 3: Car Model */}
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-obsidian-950 text-amber-400 border border-slate-800 flex-shrink-0 mt-0.5">
                  <Car className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                    Car Model
                  </span>
                  <p className="text-white font-medium truncate mt-0.5">
                    {selectedVehicle.brand} {selectedVehicle.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
