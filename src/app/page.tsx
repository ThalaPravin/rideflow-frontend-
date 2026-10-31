'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/common/Header';
import { BookingDrawer } from '@/components/booking/BookingDrawer';
import { DriverCard } from '@/components/booking/DriverCard';
import { TripReceiptModal } from '@/components/booking/TripReceiptModal';
import { ArchitectureHUD } from '@/components/hud/ArchitectureHUD';
import { RouteSummaryCard } from '@/components/booking/RouteSummaryCard';
import { DriverSimulatorModal } from '@/components/driver/DriverSimulatorModal';

// Dynamically import MapView to prevent SSR window issues with MapLibre GL
const MapView = dynamic(() => import('@/components/map/MapView').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-obsidian-950 flex items-center justify-center font-mono text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neon-emerald animate-ping" />
        <span>Loading Vector Map Engine...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [isHUDOpen, setIsHUDOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-obsidian-950">
      {/* 1. Header Navigation Bar */}
      <Header
        isHUDOpen={isHUDOpen}
        onToggleHUD={() => setIsHUDOpen((prev) => !prev)}
        onToggleDriverModal={() => setIsDriverModalOpen(true)}
      />

      {/* 2. Fullscreen Interactive Vector Map */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      {/* 3. Floating Booking Panel (Umoto / Uber Dark Style) */}
      <BookingDrawer />

      {/* 4. Bottom Floating Route Summary Card (Uber Style) */}
      <RouteSummaryCard />

      {/* 5. Floating Matched Driver HUD Card */}
      <DriverCard />

      {/* 6. Trip Completed Receipt & Confetti Modal */}
      <TripReceiptModal />

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
