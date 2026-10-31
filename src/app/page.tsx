'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/common/Header';
import { BookingDrawer } from '@/components/booking/BookingDrawer';
import { GoCabsDashboard } from '@/components/booking/GoCabsDashboard';
import { DriverCard } from '@/components/booking/DriverCard';
import { TripReceiptModal } from '@/components/booking/TripReceiptModal';
import { TripHistoryModal } from '@/components/booking/TripHistoryModal';
import { ArchitectureHUD } from '@/components/hud/ArchitectureHUD';
import { RouteSummaryCard } from '@/components/booking/RouteSummaryCard';
import { DriverSimulatorModal } from '@/components/driver/DriverSimulatorModal';
import { DriverChatModal } from '@/components/chat/DriverChatModal';
import { SafetyToolkitModal } from '@/components/safety/SafetyToolkitModal';
import { SavedPlacesModal } from '@/components/booking/SavedPlacesModal';
import { PaymentMethodsModal } from '@/components/booking/PaymentMethodsModal';
import { Bookmark } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';

// Dynamically import MapView to prevent SSR window issues with MapLibre GL
const MapView = dynamic(() => import('@/components/map/MapView').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0B0D13] flex items-center justify-center font-mono text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2EE59D] animate-ping" />
        <span className="text-slate-300 font-semibold">Initializing Vector Map Engine...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [isHUDOpen, setIsHUDOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isSavedPlacesOpen, setIsSavedPlacesOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { uiTheme, mobileTab, setMobileTab } = useTripStore();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0B0D13] flex">
      {/* CASE A: GoCabs Dashboard (Reference Image 3 bottom-right) */}
      {uiTheme === 'gocabs' ? (
        <div className="w-full h-full relative">
          {/* GoCabs Top Navbar & Left Floating Card */}
          <GoCabsDashboard />

          {/* Fullscreen Map under GoCabs */}
          <div className="absolute inset-0 z-0">
            <MapView />
          </div>

          <DriverCard
            onOpenChat={() => setIsChatOpen(true)}
            onOpenSafety={() => setIsSafetyOpen(true)}
          />
        </div>
      ) : (
        /* CASE B: Umoto Dark (Image 1) & Uber Dark (Image 2) */
        <>
          {/* 1. Left Docked Sidebar */}
          <BookingDrawer onOpenPaymentModal={() => setIsPaymentModalOpen(true)} />

          {/* 2. Fullscreen Right Map Canvas */}
          <div
            className={`flex-1 h-screen relative overflow-hidden ${
              mobileTab === 'booking' ? 'hidden md:block' : 'block'
            }`}
          >
            {/* Top Floating Control Bar */}
            <Header
              isHUDOpen={isHUDOpen}
              onToggleHUD={() => setIsHUDOpen((prev) => !prev)}
              onToggleDriverModal={() => setIsDriverModalOpen(true)}
              onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            />

            {/* Vector Map */}
            <div className="absolute inset-0 z-0">
              <MapView />
            </div>

            {/* Saved Places Bookmark Badge (From Image 3 top-right) */}
            <div className="absolute top-24 right-20 z-20 pointer-events-auto hidden sm:block">
              <button
                onClick={() => setIsSavedPlacesOpen(true)}
                className="w-11 h-11 rounded-2xl bg-[#13161F]/90 backdrop-blur-md border border-[#272D3D] hover:border-[#2EE59D] flex items-center justify-center text-slate-300 hover:text-white transition shadow-xl"
                title="Saved Locations & Bookmarks"
              >
                <Bookmark className="w-4 h-4 text-[#2EE59D]" />
              </button>
            </div>

            {/* 3. Driver Tooltip Card floating on Map (Jeromy Conway • VW Passat • 10 min) */}
            <DriverCard
              onOpenChat={() => setIsChatOpen(true)}
              onOpenSafety={() => setIsSafetyOpen(true)}
            />

            {/* 4. Bottom Floating Route Summary Card */}
            <RouteSummaryCard />
          </div>
        </>
      )}

      {/* Mobile Bottom Switcher Pill */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden flex items-center gap-1 p-1 rounded-full bg-[#13161F]/95 backdrop-blur-md border border-[#2EE59D]/40 shadow-2xl">
        <button
          onClick={() => setMobileTab('booking')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            mobileTab === 'booking' ? 'bg-[#2EE59D] text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🚖</span>
          <span>Booking</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            mobileTab === 'map' ? 'bg-[#2EE59D] text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🗺️</span>
          <span>Map</span>
        </button>
      </div>

      {/* 5. Trip Completed Receipt & Confetti Modal */}
      <TripReceiptModal />

      {/* 6. Past Trips History & Invoices Modal */}
      <TripHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* 7. Driver Telemetry & Redis Geo Simulator Modal */}
      <DriverSimulatorModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
      />

      {/* 8. Driver In-App Chat Modal */}
      <DriverChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* 9. Safety Toolkit & Emergency SOS Modal */}
      <SafetyToolkitModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />

      {/* 10. Saved Places & Bookmarks Modal */}
      <SavedPlacesModal
        isOpen={isSavedPlacesOpen}
        onClose={() => setIsSavedPlacesOpen(false)}
      />

      {/* 11. Payment Methods & Digital Wallet Modal */}
      <PaymentMethodsModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* 12. Architecture & Kafka DevTools HUD */}
      <ArchitectureHUD isOpen={isHUDOpen} onToggle={() => setIsHUDOpen((prev) => !prev)} />
    </main>
  );
}
