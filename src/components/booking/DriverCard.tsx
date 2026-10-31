'use client';

import React from 'react';
import { useTripStore } from '@/store/useTripStore';
import { X, MessageSquare, ShieldCheck, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DriverCardProps {
  onOpenChat?: () => void;
  onOpenSafety?: () => void;
}

export const DriverCard: React.FC<DriverCardProps> = ({ onOpenChat, onOpenSafety }) => {
  const { activeDriver, status, driverEta, uiTheme } = useTripStore();

  if (!activeDriver || status === 'COMPLETED') {
    return null;
  }

  // Render Uber style driver card (from Image 2)
  if (uiTheme === 'uber') {
    return (
      <div className="absolute top-[32%] left-[45%] z-20 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#18191E] border border-[#272A34] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[240px]"
        >
          <div className="w-10 h-10 rounded-full bg-[#272B35] flex items-center justify-center font-bold text-white text-xs font-mono">
            {activeDriver.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-white truncate">{activeDriver.name}</h4>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{activeDriver.vehicleModel}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-[#2EE59D] hover:text-black text-slate-300 flex items-center justify-center transition"
                title="Message Driver"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}
            {onOpenSafety && (
              <button
                onClick={onOpenSafety}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-[#2EE59D] hover:text-black text-slate-300 flex items-center justify-center transition"
                title="Safety Toolkit"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Umoto style driver tooltip (from Image 1 & 3)
  return (
    <div className="absolute top-[42%] right-[16%] lg:right-[20%] z-20 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#151821] border border-[#262B3A] p-3 px-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-3.5 min-w-[280px]"
      >
        {/* Circular Avatar Initials */}
        <div className="w-10 h-10 rounded-full bg-[#242A38] border border-slate-700/60 flex items-center justify-center font-bold text-white text-xs font-mono shadow-inner">
          {activeDriver.initials}
        </div>

        {/* Driver Name & Car Model */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-xs text-white truncate tracking-tight">{activeDriver.name}</h4>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{activeDriver.vehicleModel}</p>
        </div>

        {/* Quick Action Icons (Chat & Safety) */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2.5">
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="w-7 h-7 rounded-xl bg-[#1E2330] hover:bg-[#2EE59D] hover:text-black text-slate-300 flex items-center justify-center transition"
              title="Message Driver"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
          {onOpenSafety && (
            <button
              onClick={onOpenSafety}
              className="w-7 h-7 rounded-xl bg-[#1E2330] hover:bg-[#2EE59D] hover:text-black text-slate-300 flex items-center justify-center transition"
              title="Safety PIN & 911 SOS"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 10 min ETA Badge (matching Image 1) */}
        <div className="flex flex-col items-center justify-center pl-2.5 border-l border-slate-800">
          <span className="text-lg font-black text-white leading-none font-mono">{driverEta}</span>
          <span className="text-[9px] text-slate-500 font-medium lowercase mt-0.5">min</span>
        </div>
      </motion.div>
    </div>
  );
};
