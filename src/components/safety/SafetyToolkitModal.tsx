'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { sounds } from '@/utils/sound';
import {
  ShieldCheck,
  X,
  Share2,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  PhoneCall,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SafetyToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyToolkitModal: React.FC<SafetyToolkitModalProps> = ({ isOpen, onClose }) => {
  const { safetyPin, activeDriver, carPosition, tripId } = useTripStore();
  const [copied, setCopied] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);

  if (!isOpen) return null;

  const trackingUrl = `https://rideflow.app/track/${tripId || 'trip_sv_99182'}`;

  const handleCopyLink = () => {
    sounds.playClick();
    navigator.clipboard?.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerSOS = () => {
    sounds.playClick();
    setSosDispatched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-[#141720] border border-[#272D3D] rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2EE59D]/20 text-[#2EE59D] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Ride Safety Toolkit</h3>
              <p className="text-xs text-slate-400">Identity verification & emergency assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Safety PIN Verification Box */}
        <div className="p-4 rounded-2xl bg-[#1B1F2A] border border-[#272D3D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2EE59D]/10 text-[#2EE59D] border border-[#2EE59D]/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Your 4-Digit Ride PIN</p>
              <p className="text-2xl font-black font-mono tracking-widest text-[#2EE59D]">
                {safetyPin}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 max-w-[180px] text-right font-sans">
            Give this PIN to {activeDriver?.name || 'Driver'} before boarding.
          </p>
        </div>

        {/* 2. Share Live ETA Link */}
        <div className="p-4 rounded-2xl bg-[#1B1F2A] border border-[#272D3D] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs text-white">Share Live Trip Status</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Friends & Family</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Share real-time GPS tracking, vehicle specs, and estimated arrival time.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              readOnly
              value={trackingUrl}
              className="flex-1 bg-[#141720] border border-[#272D3D] rounded-xl px-3 py-2 text-xs font-mono text-slate-300 outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE59D]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Driver Safety & Background Clearance */}
        <div className="p-4 rounded-2xl bg-[#1B1F2A] border border-[#272D3D] flex flex-col gap-2.5">
          <span className="font-bold text-xs text-white">Driver Verification Credentials</span>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
            <div className="p-2 rounded-xl bg-[#141720] border border-slate-800 flex flex-col items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE59D]" />
              <span className="text-slate-300">DMV License</span>
              <span className="text-[#2EE59D] font-bold">Verified</span>
            </div>
            <div className="p-2 rounded-xl bg-[#141720] border border-slate-800 flex flex-col items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE59D]" />
              <span className="text-slate-300">Background</span>
              <span className="text-[#2EE59D] font-bold">Cleared</span>
            </div>
            <div className="p-2 rounded-xl bg-[#141720] border border-slate-800 flex flex-col items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE59D]" />
              <span className="text-slate-300">150-Pt Check</span>
              <span className="text-[#2EE59D] font-bold">Passed</span>
            </div>
          </div>
        </div>

        {/* 4. Emergency SOS Assistance */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Emergency Assistance (911 Dispatch)
            </span>
            <span className="text-[10px] font-mono text-rose-400">GPS Broadcast</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Instantly alerts emergency authorities with your live coordinates ({carPosition[1].toFixed(4)}° N, {carPosition[0].toFixed(4)}° W), driver license ({activeDriver?.vehicleNumber}), and journey path.
          </p>

          {sosDispatched ? (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-xs font-mono text-rose-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Simulated Emergency SOS Broadcast Activated. Authorities Notified.</span>
            </div>
          ) : (
            <button
              onClick={handleTriggerSOS}
              className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(244,63,94,0.35)]"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 911 Emergency Assistance</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
