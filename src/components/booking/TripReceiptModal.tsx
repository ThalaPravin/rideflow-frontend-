'use client';

import React, { useEffect, useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { sounds } from '@/utils/sound';
import {
  CheckCircle2,
  Star,
  Receipt,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Heart,
  Sparkles,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const TripReceiptModal: React.FC = () => {
  const {
    status,
    calculateFare,
    resetRide,
    pickup,
    destination,
    activeDriver,
    selectedVehicle,
    activeRoute,
    intermediateStop,
    selectedPaymentMethod,
    appliedPromo,
    tripRating,
    setTripRating,
    driverTip,
    setDriverTip,
    selectedCompliments,
    toggleCompliment,
  } = useTripStore();

  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'COMPLETED') {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2EE59D', '#38BDF8', '#F59E0B', '#FFFFFF'],
      });
    }
  }, [status]);

  if (status !== 'COMPLETED') return null;

  const fare = calculateFare();
  const totalCharged = parseFloat((fare + driverTip).toFixed(2));

  const ratingDescriptions: Record<number, string> = {
    1: 'Poor Experience',
    2: 'Below Average',
    3: 'Satisfactory',
    4: 'Very Good',
    5: 'Outstanding Service!',
  };

  const complimentOptions = [
    '🌟 Clean Car',
    '🎵 Great Music',
    '⚡ Safe Driving',
    '💬 Friendly Conversation',
    '⏱️ On-Time Arrival',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-lg bg-[#141720] border border-[#272D3D] rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[92vh] overflow-y-auto"
      >
        {/* Success Header */}
        <div className="flex flex-col items-center text-center gap-1.5 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#2EE59D]/20 border border-[#2EE59D]/40 flex items-center justify-center text-[#2EE59D] shadow-[0_0_25px_rgba(46,229,157,0.4)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white mt-1">Trip Completed!</h3>
          <p className="text-xs text-slate-400">
            Payment auto-settled via Kafka Payment Service with {selectedPaymentMethod.title}
          </p>
        </div>

        {/* Itemized Fare Card */}
        <div className="p-4 rounded-2xl bg-[#181B24] border border-[#272D3D] flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 text-[#2EE59D]">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Paid</p>
                <p className="text-2xl font-black font-mono text-[#2EE59D] tracking-tight">
                  ${totalCharged.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2EE59D]/10 text-[#2EE59D] border border-[#2EE59D]/30 font-bold uppercase">
                PAID VIA {selectedPaymentMethod.type.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {selectedPaymentMethod.last4 ? `•••• ${selectedPaymentMethod.last4}` : selectedPaymentMethod.title}
              </span>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-400 pt-1">
            <div className="flex justify-between">
              <span>Ride Fare ({selectedVehicle.name} • {activeRoute.distanceKm} km)</span>
              <span className="text-slate-200">${fare.toFixed(2)}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-purple-300">
                <span>Promo Voucher ({appliedPromo.code})</span>
                <span>Applied Discount</span>
              </div>
            )}
            {driverTip > 0 && (
              <div className="flex justify-between text-[#2EE59D]">
                <span>Driver Tip</span>
                <span>+${driverTip.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Driver Rating */}
        <div className="p-4 rounded-2xl bg-[#181B24] border border-[#272D3D] flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#242A38] text-white flex items-center justify-center font-bold text-[10px] font-mono">
              {activeDriver?.initials || 'JC'}
            </div>
            <p className="text-xs text-slate-300 font-medium">Rate {activeDriver?.name || 'Driver'}</p>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => setTripRating(star)}
                className="p-1 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= (hoverRating ?? tripRating)
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <p className="text-[11px] font-mono text-amber-400">
            {ratingDescriptions[hoverRating ?? tripRating]}
          </p>
        </div>

        {/* Compliment Badges */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-slate-400 font-medium">Give a Compliment:</p>
          <div className="flex flex-wrap gap-1.5">
            {complimentOptions.map((comp) => {
              const active = selectedCompliments.includes(comp);
              return (
                <button
                  key={comp}
                  onClick={() => toggleCompliment(comp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    active
                      ? 'bg-[#2EE59D]/15 text-[#2EE59D] border-[#2EE59D]/40'
                      : 'bg-[#181B24] text-slate-400 border-[#272D3D] hover:text-white'
                  }`}
                >
                  {comp}
                </button>
              );
            })}
          </div>
        </div>

        {/* Driver Tipping Buttons */}
        <div className="p-3.5 rounded-2xl bg-[#181B24] border border-[#272D3D] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Add a Tip for {activeDriver?.name?.split(' ')[0] || 'Driver'}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">100% goes to driver</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0, 2, 5, 10].map((tipAmt) => {
              const isSelected = driverTip === tipAmt;
              return (
                <button
                  key={tipAmt}
                  onClick={() => setDriverTip(tipAmt)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                    isSelected
                      ? 'bg-[#2EE59D] text-black border-[#2EE59D] shadow-md'
                      : 'bg-[#202533] text-slate-300 border-[#272D3D] hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {tipAmt === 0 ? 'No Tip' : `+$${tipAmt}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={resetRide}
          className="w-full py-4 rounded-2xl bg-[#2EE59D] hover:bg-[#28c98a] text-black font-extrabold text-sm transition shadow-[0_0_25px_rgba(46,229,157,0.35)] flex items-center justify-center gap-2 mt-1"
        >
          <span>Book Another Ride</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
