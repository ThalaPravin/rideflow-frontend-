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

  const { uiTheme } = useTripStore();

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

          <DriverCard />
        </div>
      ) : (
        /* CASE B: Umoto Dark (Image 1) & Uber Dark (Image 2) */
        <>
          {/* 1. Left Docked Sidebar */}
          <BookingDrawer />

          {/* 2. Fullscreen Right Map Canvas */}
          <div className="flex-1 h-screen relative overflow-hidden">
            {/* Top Floating Control Bar */}
            <Header
              isHUDOpen={isHUDOpen}
              onToggleHUD={() => setIsHUDOpen((prev) => !prev)}
              onToggleDriverModal={() => setIsDriverModalOpen(true)}
              onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
            />

            {/* Vector Map */}
            <div className="absolute inset-0 z-0">
              <MapView />
            </div>

            {/* Saved Places Bookmark Badge (From Image 3 top-right) */}
            <div className="absolute top-24 right-20 z-20 pointer-events-auto hidden lg:block">
              <button
                className="w-11 h-11 rounded-2xl bg-[#13161F]/90 backdrop-blur-md border border-[#272D3D] hover:border-[#2EE59D] flex items-center justify-center text-slate-300 hover:text-white transition shadow-xl"
                title="Saved Locations & Bookmarks"
              >
                <Bookmark className="w-4 h-4 text-[#2EE59D]" />
              </button>
            </div>

            {/* 3. Driver Tooltip Card floating on Map (Jeromy Conway • VW Passat • 10 min) */}
            <DriverCard />

            {/* 4. Bottom Floating Route Summary Card */}
            <RouteSummaryCard />
          </div>
        </>
      )}

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

      {/* 8. Architecture & Kafka DevTools HUD */}
      <ArchitectureHUD isOpen={isHUDOpen} onToggle={() => setIsHUDOpen((prev) => !prev)} />
    </main>
  );
}
