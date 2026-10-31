'use client';

import React from 'react';
import { useTripStore } from '@/store/useTripStore';
import { X, Receipt, CheckCircle2, Calendar, MapPin, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TripHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TripHistoryModal: React.FC<TripHistoryModalProps> = ({ isOpen, onClose }) => {
  const { activeRoute } = useTripStore();

  if (!isOpen) return null;

  const pastTrips = [
    {
      id: 'trip_sv_99182',
      date: 'Today, 4:45 PM',
      from: '3412 Ross Rd, Palo Alto, CA',
      to: '311A Moffett Blvd, Mountain View, CA',
      vehicle: 'Volkswagen Passat',
      driver: 'Jeromy Conway',
      fare: '$22.45',
      paymentMethod: 'Apple Pay •••• 4242',
      kafkaTopic: 'payment.processed',
      status: 'COMPLETED & PAID',
    },
    {
      id: 'trip_bos_82711',
      date: 'Yesterday, 8:15 PM',
      from: '3429 Beacon St, Boston, MA',
      to: '2374 State St, Boston, MA',
      vehicle: 'VW Passat',
      driver: 'Bill Harness',
      fare: '$22.00',
      paymentMethod: 'Visa •••• 8819',
      kafkaTopic: 'payment.processed',
      status: 'COMPLETED & PAID',
    },
    {
      id: 'trip_sf_41209',
      date: '28 Oct, 11:30 AM',
      from: '499 Dolores St, San Francisco, CA',
      to: '210 Lincoln Blvd, Presidio, CA',
      vehicle: 'Honda CR-V',
      driver: 'Goku Son',
      fare: '$28.00',
      paymentMethod: 'Mastercard •••• 1042',
      kafkaTopic: 'payment.processed',
      status: 'COMPLETED & PAID',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-[#141720] border border-[#272D3D] rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2EE59D]/20 text-[#2EE59D] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Trip History & Invoices</h3>
              <p className="text-xs text-slate-400">Kafka-verified transactions & ride logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trips List */}
        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
          {pastTrips.map((trip) => (
            <div
              key={trip.id}
              className="p-4 rounded-2xl bg-[#1B1F2A] border border-[#272D3D] hover:border-slate-600 transition flex flex-col gap-3"
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#2EE59D] px-2 py-0.5 rounded bg-[#2EE59D]/10 border border-[#2EE59D]/20">
                    {trip.id}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {trip.date}
                  </span>
                </div>
                <span className="text-base font-extrabold font-mono text-[#2EE59D]">{trip.fare}</span>
              </div>

              {/* Route */}
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#2EE59D]" />
                  <span className="truncate">{trip.from}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                  <span className="truncate">{trip.to}</span>
                </div>
              </div>

              {/* Bottom Specs & Verification Badge */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{trip.vehicle} • {trip.driver}</span>
                <span className="text-[10px] text-[#2EE59D] flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  {trip.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2EE59D]" />
            PostgreSQL Ledger & Kafka Audited
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
