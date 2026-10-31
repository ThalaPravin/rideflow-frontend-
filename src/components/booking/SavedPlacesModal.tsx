'use client';

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { POPULAR_PLACES } from '@/data/mockData';
import { sounds } from '@/utils/sound';
import {
  Bookmark,
  X,
  Home,
  Briefcase,
  Plane,
  Dumbbell,
  Coffee,
  MapPin,
  Plus,
  Check,
  Navigation,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SavedPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedItem {
  id: string;
  label: string;
  category: 'home' | 'work' | 'airport' | 'gym' | 'cafe' | 'custom';
  name: string;
  address: string;
  lat: number;
  lon: number;
}

export const SavedPlacesModal: React.FC<SavedPlacesModalProps> = ({ isOpen, onClose }) => {
  const { activeRoute, setPickup, setDestination, status } = useTripStore();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'city_hotspots'>('bookmarks');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [savedItems, setSavedItems] = useState<SavedItem[]>([
    {
      id: 'fav-home',
      label: 'Home',
      category: 'home',
      name: 'Residences at Palo Verde',
      address: '3412 Ross Rd, Palo Alto, CA 94303',
      lat: 37.4362,
      lon: -122.1198,
    },
    {
      id: 'fav-work',
      label: 'Office / HQ',
      category: 'work',
      name: 'Googleplex Bldg 43',
      address: '1600 Amphitheatre Pkwy, Mountain View, CA',
      lat: 37.422,
      lon: -122.0841,
    },
    {
      id: 'fav-airport',
      label: 'Airport',
      category: 'airport',
      name: 'San Jose Mineta International (SJC)',
      address: '1701 Airport Blvd, San Jose, CA',
      lat: 37.3639,
      lon: -121.9289,
    },
    {
      id: 'fav-gym',
      label: 'Fitness & Gym',
      category: 'gym',
      name: 'Equinox Palo Alto',
      address: '440 Portage Ave, Palo Alto, CA',
      lat: 37.4258,
      lon: -122.1382,
    },
    {
      id: 'fav-cafe',
      label: 'Morning Espresso',
      category: 'cafe',
      name: 'Blue Bottle Coffee',
      address: '456 University Ave, Palo Alto, CA',
      lat: 37.4475,
      lon: -122.1585,
    },
  ]);

  if (!isOpen) return null;

  const cityPlaces = POPULAR_PLACES[activeRoute.id] || POPULAR_PLACES['silicon_valley'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'home':
        return <Home className="w-4 h-4 text-[#2EE59D]" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-cyan-400" />;
      case 'airport':
        return <Plane className="w-4 h-4 text-amber-400" />;
      case 'gym':
        return <Dumbbell className="w-4 h-4 text-purple-400" />;
      case 'cafe':
        return <Coffee className="w-4 h-4 text-emerald-300" />;
      default:
        return <Bookmark className="w-4 h-4 text-[#2EE59D]" />;
    }
  };

  const handleApplyPlace = (
    place: { name: string; address: string; lat: number; lon: number },
    target: 'pickup' | 'destination'
  ) => {
    sounds.playClick();
    if (target === 'pickup') {
      setPickup(place);
      setSuccessToast(`Set "${place.name}" as Pickup`);
    } else {
      setDestination(place);
      setSuccessToast(`Set "${place.name}" as Destination`);
    }
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-[#141720] border border-[#272D3D] rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[88vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2EE59D]/20 text-[#2EE59D] flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Saved Places & Bookmarks</h3>
              <p className="text-xs text-slate-400">One-tap origin and destination presets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-[#1B1F2A] rounded-2xl border border-[#272D3D]">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'bookmarks'
                ? 'bg-[#2EE59D] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Bookmarks ({savedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('city_hotspots')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'city_hotspots'
                ? 'bg-[#2EE59D] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            City Hotspots ({cityPlaces.length})
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-3 rounded-2xl bg-[#2EE59D]/20 border border-[#2EE59D]/40 text-[#2EE59D] text-xs font-semibold flex items-center gap-2 animate-pulse">
            <Check className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Places List */}
        <div className="flex flex-col gap-2.5">
          {activeTab === 'bookmarks' ? (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#1B1F2A] border border-[#272D3D] hover:border-slate-600 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#232836] border border-slate-700/80 flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{item.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({item.name})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.address}</p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    disabled={status !== 'IDLE'}
                    onClick={() => handleApplyPlace(item, 'pickup')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-[#2EE59D] hover:text-black text-[11px] font-mono text-slate-300 transition disabled:opacity-50"
                    title="Set as Pickup"
                  >
                    From
                  </button>
                  <button
                    disabled={status !== 'IDLE'}
                    onClick={() => handleApplyPlace(item, 'destination')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-400 hover:text-black text-[11px] font-mono text-slate-300 transition disabled:opacity-50"
                    title="Set as Dropoff"
                  >
                    To
                  </button>
                </div>
              </div>
            ))
          ) : (
            cityPlaces.map((place, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#1B1F2A] border border-[#272D3D] hover:border-slate-600 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#232836] border border-slate-700/80 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{place.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{place.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    disabled={status !== 'IDLE'}
                    onClick={() => handleApplyPlace(place, 'pickup')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-[#2EE59D] hover:text-black text-[11px] font-mono text-slate-300 transition disabled:opacity-50"
                    title="Set as Pickup"
                  >
                    From
                  </button>
                  <button
                    disabled={status !== 'IDLE'}
                    onClick={() => handleApplyPlace(place, 'destination')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-400 hover:text-black text-[11px] font-mono text-slate-300 transition disabled:opacity-50"
                    title="Set as Dropoff"
                  >
                    To
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Active City: {activeRoute.city}</span>
          <span>{status === 'IDLE' ? 'Ready to Route' : 'Ride in Progress'}</span>
        </div>
      </motion.div>
    </div>
  );
};
