'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { sounds } from '@/utils/sound';
import {
  CreditCard,
  X,
  Wallet,
  Plus,
  Check,
  Tag,
  ShieldCheck,
  Zap,
  Banknote,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({ isOpen, onClose }) => {
  const {
    walletBalance,
    topUpWallet,
    paymentMethods,
    selectedPaymentMethod,
    selectPaymentMethod,
    appliedPromo,
    applyPromoCode,
    removePromo,
    calculateFare,
  } = useTripStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [topUpSuccess, setTopUpSuccess] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleTopUp = (amount: number) => {
    topUpWallet(amount);
    setTopUpSuccess(amount);
    setTimeout(() => setTopUpSuccess(null), 2500);
  };

  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput.trim());
    setPromoFeedback(res);
    if (res.success) {
      setPromoInput('');
    }
  };

  const handleQuickPromo = (code: string) => {
    const res = applyPromoCode(code);
    setPromoFeedback(res);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'wallet':
        return <Zap className="w-4 h-4 text-[#2EE59D]" />;
      case 'apple_pay':
        return <span className="text-xs font-bold font-sans">Pay</span>;
      case 'card':
        return <CreditCard className="w-4 h-4 text-cyan-400" />;
      case 'cash':
        return <Banknote className="w-4 h-4 text-amber-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Payment & Digital Wallet</h3>
              <p className="text-xs text-slate-400">Zero-fee settlement with Apache Kafka</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Digital Wallet Virtual Card */}
        <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-[#1A2234] via-[#121622] to-[#0D1017] border border-[#2EE59D]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          {/* Neon Glow Corner */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#2EE59D]/15 blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2EE59D] animate-ping" />
              <span className="text-[11px] font-mono tracking-widest text-[#2EE59D] uppercase font-bold">
                RIDEFLOW WALLET
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">TIER 1 INSTANT</span>
          </div>

          <div className="mt-4">
            <p className="text-xs text-slate-400 font-medium">Available Balance</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                ${walletBalance.toFixed(2)}
              </span>
              <span className="text-[11px] text-[#2EE59D] font-mono">USD</span>
            </div>
          </div>

          {/* Quick Top-Up Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Quick Top-Up:</span>
            <div className="flex items-center gap-2">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleTopUp(amt)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-[#2EE59D] hover:text-black border border-slate-700 hover:border-[#2EE59D] text-xs font-mono font-semibold text-slate-300 transition"
                >
                  +${amt}
                </button>
              ))}
            </div>
          </div>

          {topUpSuccess && (
            <div className="mt-2.5 py-1 px-3 rounded-xl bg-[#2EE59D]/15 border border-[#2EE59D]/30 text-[#2EE59D] text-[11px] font-mono flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Added +${topUpSuccess}.00 to RideFlow Wallet!</span>
            </div>
          )}
        </div>

        {/* 2. Select Payment Method for Active Ride */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Ride Payment Method</span>
            <span className="text-[11px] font-normal text-slate-500">Current Trip Fare: ${calculateFare()}</span>
          </label>

          <div className="flex flex-col gap-2">
            {paymentMethods.map((pm) => {
              const isSelected = selectedPaymentMethod.id === pm.id;
              return (
                <div
                  key={pm.id}
                  onClick={() => selectPaymentMethod(pm.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1B2232] border-[#2EE59D] shadow-[0_0_15px_rgba(46,229,157,0.15)]'
                      : 'bg-[#181B24] border-[#272D3D] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#2EE59D]/10 border-[#2EE59D]/40 text-[#2EE59D]'
                          : 'bg-[#202430] border-slate-700/80 text-slate-400'
                      }`}
                    >
                      {getPaymentIcon(pm.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{pm.title}</span>
                        {pm.last4 && (
                          <span className="text-[11px] font-mono text-slate-400">•••• {pm.last4}</span>
                        )}
                        {pm.type === 'wallet' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2EE59D]/20 text-[#2EE59D] font-mono">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{pm.subtitle}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#2EE59D] bg-[#2EE59D] text-black'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Promo Codes & Vouchers */}
        <div className="p-4 rounded-2xl bg-[#181B24] border border-[#272D3D] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Promos & Vouchers</span>
            </div>
            {appliedPromo && (
              <span className="text-[10px] font-mono text-[#2EE59D] bg-[#2EE59D]/10 px-2 py-0.5 rounded-full border border-[#2EE59D]/30">
                ACTIVE
              </span>
            )}
          </div>

          {appliedPromo ? (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-purple-200">{appliedPromo.code}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    {appliedPromo.percentage ? `${appliedPromo.percentage}% OFF` : `$${appliedPromo.amountOff} OFF`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{appliedPromo.description}</p>
              </div>
              <button
                onClick={removePromo}
                className="text-xs font-mono text-rose-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code (e.g. NEON20)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#202533] border border-[#272D3D] text-xs text-white placeholder-slate-500 outline-none uppercase font-mono tracking-wider focus:border-[#2EE59D]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#2EE59D] hover:bg-[#26c788] text-black text-xs font-bold transition shadow-sm"
              >
                Apply
              </button>
            </form>
          )}

          {promoFeedback && (
            <p
              className={`text-[11px] font-medium ${
                promoFeedback.success ? 'text-[#2EE59D]' : 'text-rose-400'
              }`}
            >
              {promoFeedback.message}
            </p>
          )}

          {/* Quick Promo Chips */}
          {!appliedPromo && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[10px] text-slate-500 font-mono">Suggested:</span>
              <button
                onClick={() => handleQuickPromo('NEON20')}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/60 border border-slate-700 text-[10px] font-mono text-purple-300 transition"
              >
                NEON20 (-20%)
              </button>
              <button
                onClick={() => handleQuickPromo('FIRST10')}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/60 border border-slate-700 text-[10px] font-mono text-purple-300 transition"
              >
                FIRST10 (-$10)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2EE59D]" />
            <span>256-bit TLS Encrypted</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2EE59D] text-black text-xs font-bold hover:bg-[#28c98a] transition"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
