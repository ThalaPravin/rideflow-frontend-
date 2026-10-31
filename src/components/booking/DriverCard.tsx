'use client';

import React from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Star, ShieldCheck, Phone, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DriverCard: React.FC = () => {
  const { activeDriver, status, driverEta } = useTripStore();

  if (!activeDriver || status === 'IDLE' || status === 'SEARCHING') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-24 right-8 z-10 glass-panel-elevated p-4 rounded-2xl shadow-glass flex items-center gap-4 border border-slate-700/80 min-w-[280px]"
      >
        {/* Driver Initials Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-obsidian-950 border border-slate-700 flex items-center justify-center font-bold text-white text-base font-mono shadow-inner">
            {activeDriver.initials}
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-neon-emerald flex items-center justify-center text-[9px] text-obsidian-950 font-bold border-2 border-obsidian-900">
            ✓
          </span>
        </div>

        {/* Driver Name & Vehicle Specs */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-sm text-white truncate tracking-tight">{activeDriver.name}</h4>
            <div className="flex items-center text-[11px] font-mono font-semibold text-amber-400">
              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
              <span>{activeDriver.rating}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
            <Car className="w-3 h-3 text-slate-500" />
            <span>{activeDriver.vehicleModel}</span>
          </p>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
            {activeDriver.vehicleNumber}
          </p>
        </div>

        {/* ETA Badge (matching reference Image 1) */}
        <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-obsidian-950/80 border border-slate-700/60 font-mono">
          <span className="text-base font-extrabold text-neon-emerald leading-tight">{driverEta}</span>
          <span className="text-[9px] text-slate-400 uppercase tracking-wider">min</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
