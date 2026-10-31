'use client';

import React, { useEffect } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { CheckCircle2, Star, MapPin, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const TripReceiptModal: React.FC = () => {
  const { status, calculateFare, resetRide, pickup, destination, activeDriver, selectedVehicle, activeRoute } =
    useTripStore();

  useEffect(() => {
    if (status === 'COMPLETED') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00E599', '#38BDF8', '#F8FAFC'],
      });
    }
  }, [status]);

  if (status !== 'COMPLETED') return null;

  const fare = calculateFare();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md p-6 rounded-3xl glass-panel-elevated shadow-glass border border-slate-700/80 flex flex-col gap-5 text-white"
      >
        {/* Success Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-full bg-neon-emerald/20 border border-neon-emerald/40 flex items-center justify-center text-neon-emerald shadow-neonSmall">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">Trip Completed!</h3>
          <p className="text-xs text-slate-400">Payment automatically processed via Kafka & Payment Service</p>
        </div>

        {/* Fare Card */}
        <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-neon-emerald">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Paid</p>
              <p className="text-xl font-extrabold font-mono text-neon-emerald">${fare}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/30 font-semibold">
            SUCCESS (PAID)
          </span>
        </div>

        {/* Route Summary */}
        <div className="flex flex-col gap-2.5 text-xs text-slate-300 p-3.5 rounded-2xl bg-obsidian-900/60 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-emerald" />
            <span className="truncate">{pickup.name} ({pickup.address})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-cyan" />
            <span className="truncate">{destination.name} ({destination.address})</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400 font-mono text-[11px]">
            <span>{activeRoute.distanceKm} km</span>
            <span>{selectedVehicle.name} • {activeDriver?.name}</span>
          </div>
        </div>

        {/* Driver Rating Widget */}
        <div className="flex flex-col items-center gap-1.5 py-1">
          <p className="text-xs text-slate-400">Rate your driver ({activeDriver?.name})</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} className="text-amber-400 hover:scale-125 transition">
                <Star className="w-5 h-5 fill-amber-400" />
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={resetRide}
          className="btn-neon w-full py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
        >
          <span>Book Another Ride</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
