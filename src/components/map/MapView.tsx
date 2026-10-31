'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { useTripStore } from '@/store/useTripStore';
import { MOCK_DRIVERS } from '@/data/mockData';
import { Layers, ZoomIn, ZoomOut } from 'lucide-react';

const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pickupMarkerRef = useRef<Marker | null>(null);
  const dropoffMarkerRef = useRef<Marker | null>(null);
  const stopMarkerRef = useRef<Marker | null>(null);
  const carMarkerRef = useRef<Marker | null>(null);
  const ambientDriverMarkersRef = useRef<Marker[]>([]);

  const [is3DMode, setIs3DMode] = useState(true);

  const {
    activeRoute,
    intermediateStop,
    carPosition,
    carHeading,
    mapClickMode,
    setMapClickMode,
    handleMapClickLocation,
    uiTheme,
  } = useTripStore();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: CARTO_DARK_STYLE,
      center: [-122.1024, 37.4265], // Palo Alto / Mountain View default
      zoom: 13,
      pitch: 45, // Angled 3D view matching reference screenshots
      bearing: -20,
      attributionControl: false,
    });

    mapRef.current = map;

    // Handle map click
    map.on('click', (e) => {
      const { mapClickMode } = useTripStore.getState();
      if (mapClickMode !== 'none') {
        handleMapClickLocation(e.lngLat.lng, e.lngLat.lat);
      }
    });

    map.on('load', () => {
      // Add glowing Route Polyline Layer
      map.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: activeRoute.routeCoordinates,
          },
        },
      });

      // Neon Shadow / Glow Line (Dual mint green + cyan glow)
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#2EE59D',
          'line-width': 12,
          'line-opacity': 0.35,
          'line-blur': 6,
        },
      });

      // Sharp Neon Route Line
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#2EE59D',
          'line-width': 5,
          'line-opacity': 0.95,
        },
      });

      // Inner cyan highlight line
      map.addLayer({
        id: 'route-highlight',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#38BDF8',
          'line-width': 2,
          'line-opacity': 0.85,
        },
      });

      // Render ambient available cars on roads (matching Image 1 & 2)
      MOCK_DRIVERS.slice(1).forEach((driver) => {
        const el = document.createElement('div');
        el.className = 'ambient-driver opacity-75 hover:opacity-100 transition-opacity cursor-pointer';
        el.title = `${driver.name} • ${driver.vehicleModel} (Available)`;
        el.innerHTML = `
          <div style="transform: rotate(${driver.heading}deg);" class="transition-transform duration-500">
            <svg viewBox="0 0 28 54" class="w-6 h-11 drop-shadow-2xl">
              <!-- Metallic Dark Car Body -->
              <rect x="4" y="5" width="20" height="44" rx="9" fill="#1C212D" stroke="#384358" stroke-width="1.2"/>
              <!-- Windshield -->
              <path d="M 6 16 Q 14 13 22 16 L 20 23 Q 14 21 8 23 Z" fill="#0E131E" stroke="#2D3748" stroke-width="0.8"/>
              <!-- Roof -->
              <rect x="7.5" y="23" width="13" height="15" rx="2" fill="#0F1218"/>
              <!-- Rear Windshield -->
              <path d="M 8 38 Q 14 36 20 38 L 19 43 Q 14 42 9 43 Z" fill="#0E131E"/>
              <!-- Headlights -->
              <circle cx="8" cy="7" r="1.5" fill="#E2E8F0"/>
              <circle cx="20" cy="7" r="1.5" fill="#E2E8F0"/>
              <!-- Taillights -->
              <circle cx="8" cy="47" r="1.5" fill="#EF4444"/>
              <circle cx="20" cy="47" r="1.5" fill="#EF4444"/>
            </svg>
          </div>
        `;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([driver.currentLon, driver.currentLat])
          .addTo(map);
        ambientDriverMarkersRef.current.push(marker);
      });
    });

    return () => {
      ambientDriverMarkersRef.current.forEach((m) => m.remove());
      ambientDriverMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Route Line & Camera on Route or Waypoints Change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource('route-source') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: activeRoute.routeCoordinates,
        },
      });
    }

    // Fit map bounds to show complete route
    const coords = activeRoute.routeCoordinates;
    if (coords && coords.length > 0) {
      const bounds = coords.reduce(
        (acc, coord) => acc.extend(coord as [number, number]),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );

      map.fitBounds(bounds, {
        padding: { top: 120, bottom: 90, left: 450, right: 120 },
        duration: 1200,
        pitch: is3DMode ? 45 : 0,
      });
    }

    // Pickup Marker (matching PALO VERDE circle in Image 1)
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setLngLat([activeRoute.pickup.lon, activeRoute.pickup.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'pickup-marker flex flex-col items-center justify-center';
      el.innerHTML = `
        <div class="flex flex-col items-center">
          <span class="text-[10px] font-extrabold tracking-wider text-slate-200 uppercase mb-1 font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-[#13161F]/80 px-2 py-0.5 rounded-full border border-slate-700/60">
            ${activeRoute.pickup.name || 'PALO VERDE'}
          </span>
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-[#2EE59D] opacity-40 animate-ping"></div>
            <div class="w-6 h-6 rounded-full bg-[#13161F] border-2 border-[#2EE59D] flex items-center justify-center shadow-lg shadow-[#2EE59D]/50">
              <div class="w-2.5 h-2.5 rounded-full bg-[#2EE59D]"></div>
            </div>
          </div>
        </div>
      `;
      pickupMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([activeRoute.pickup.lon, activeRoute.pickup.lat])
        .addTo(map);
    }

    // Intermediate Stop Marker
    if (intermediateStop) {
      if (stopMarkerRef.current) {
        stopMarkerRef.current.setLngLat([intermediateStop.lon, intermediateStop.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'stop-marker flex flex-col items-center justify-center';
        el.innerHTML = `
          <div class="flex flex-col items-center">
            <span class="text-[9px] font-bold text-purple-300 uppercase mb-0.5 bg-purple-950/90 px-1.5 py-0.5 rounded border border-purple-500/40">
              WAYPOINT
            </span>
            <div class="relative flex items-center justify-center">
              <div class="absolute w-7 h-7 rounded-full bg-purple-500 opacity-40 animate-ping"></div>
              <div class="w-5 h-5 rounded-full bg-[#13161F] border-2 border-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <span class="text-[8px] font-bold text-purple-200">S</span>
              </div>
            </div>
          </div>
        `;
        stopMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([intermediateStop.lon, intermediateStop.lat])
          .addTo(map);
      }
    } else if (stopMarkerRef.current) {
      stopMarkerRef.current.remove();
      stopMarkerRef.current = null;
    }

    // Dropoff Marker (matching Googleplex node in Image 1)
    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.setLngLat([activeRoute.destination.lon, activeRoute.destination.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'dropoff-marker flex flex-col items-center justify-center';
      el.innerHTML = `
        <div class="flex flex-col items-center">
          <span class="text-[10px] font-extrabold tracking-wider text-slate-200 uppercase mb-1 font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-[#13161F]/80 px-2 py-0.5 rounded-full border border-slate-700/60">
            ${activeRoute.destination.name || 'Googleplex'}
          </span>
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-[#13161F] border-2 border-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#38BDF8]/50">
              <div class="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></div>
            </div>
          </div>
        </div>
      `;
      dropoffMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([activeRoute.destination.lon, activeRoute.destination.lat])
        .addTo(map);
    }
  }, [activeRoute, intermediateStop, is3DMode]);

  // Update Moving Vehicle Marker on road
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!carMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'car-marker relative cursor-pointer';
      // High-end metallic top-down car model with glowing headlights (Image 1 style)
      el.innerHTML = `
        <div class="car-body-wrapper transition-transform duration-700 ease-linear" style="transform: rotate(${carHeading}deg);">
          <div class="relative w-9 h-18 flex items-center justify-center">
            <!-- Headlights Glow Projection -->
            <div class="absolute -top-4 left-0.5 w-3 h-8 bg-cyan-200 opacity-70 blur-[3px] rounded-full transform -rotate-6"></div>
            <div class="absolute -top-4 right-0.5 w-3 h-8 bg-cyan-200 opacity-70 blur-[3px] rounded-full transform rotate-6"></div>
            
            <!-- Metallic Sedan Body -->
            <svg viewBox="0 0 40 82" class="w-full h-full drop-shadow-2xl">
              <!-- Body Base -->
              <rect x="5" y="7" width="30" height="68" rx="15" fill="#141923" stroke="#4A5568" stroke-width="2"/>
              <!-- Metallic Highlight -->
              <rect x="8" y="10" width="24" height="62" rx="12" fill="#1A202C"/>
              <!-- Windshield Front -->
              <path d="M 9 24 Q 20 20 31 24 L 29 35 Q 20 32 11 35 Z" fill="#0A0E17" stroke="#2D3748" stroke-width="1"/>
              <!-- Roof -->
              <rect x="10" y="35" width="20" height="24" rx="4" fill="#0F141F"/>
              <!-- Rear Windshield -->
              <path d="M 11 59 Q 20 57 29 59 L 28 66 Q 20 64 12 66 Z" fill="#0A0E17" stroke="#2D3748" stroke-width="1"/>
              <!-- Wheels -->
              <rect x="2" y="17" width="3.5" height="13" rx="1.5" fill="#000000"/>
              <rect x="34.5" y="17" width="3.5" height="13" rx="1.5" fill="#000000"/>
              <rect x="2" y="52" width="3.5" height="13" rx="1.5" fill="#000000"/>
              <rect x="34.5" y="52" width="3.5" height="13" rx="1.5" fill="#000000"/>
              <!-- Headlight LEDs -->
              <circle cx="10" cy="9" r="2" fill="#E2E8F0"/>
              <circle cx="30" cy="9" r="2" fill="#E2E8F0"/>
              <!-- Taillight LEDs -->
              <circle cx="10" cy="73" r="2" fill="#EF4444"/>
              <circle cx="30" cy="73" r="2" fill="#EF4444"/>
            </svg>
          </div>
        </div>
      `;

      carMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(carPosition)
        .addTo(map);
    } else {
      carMarkerRef.current.setLngLat(carPosition);

      const wrapper = carMarkerRef.current.getElement().querySelector('.car-body-wrapper') as HTMLElement | null;
      if (wrapper) {
        wrapper.style.transform = `rotate(${carHeading}deg)`;
      }
    }
  }, [carPosition, carHeading]);

  // Map Camera Controls
  const toggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    const newMode = !is3DMode;
    setIs3DMode(newMode);
    map.easeTo({
      pitch: newMode ? 45 : 0,
      bearing: newMode ? -20 : 0,
      duration: 800,
    });
  };

  const zoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const zoomOut = () => mapRef.current?.zoomOut({ duration: 300 });

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0B0D13]">
      {/* MapLibre Canvas Container */}
      <div
        ref={mapContainerRef}
        className={`absolute inset-0 w-full h-full ${
          mapClickMode !== 'none' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* Ambient Large Street / City Label on Canvas (Matching Image 1 bottom-right) */}
      <div className="absolute bottom-8 right-10 z-10 pointer-events-none select-none text-right hidden md:block">
        <h2 className="text-4xl lg:text-5xl font-black text-white/30 tracking-tight font-sans">
          {uiTheme === 'uber' ? 'Boston' : 'Mountain View'}
        </h2>
        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mt-1">
          {uiTheme === 'uber' ? 'Massachusetts • Historic Beacon Hill' : 'California • Silicon Valley'}
        </p>
      </div>

      {/* Mode Indicator Banner when user is in "Pin on Map" mode */}
      {mapClickMode !== 'none' && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
          <div className="px-5 py-2.5 rounded-2xl bg-[#13161F] border border-[#2EE59D] flex items-center gap-3 shadow-[0_0_25px_rgba(46,229,157,0.4)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2EE59D] animate-ping" />
            <span className="text-xs font-semibold text-white">
              {mapClickMode === 'pickup' && 'Click anywhere on the map to set Pickup location'}
              {mapClickMode === 'destination' && 'Click anywhere on the map to set Destination'}
              {mapClickMode === 'stop' && 'Click anywhere on the map to place Waypoint stop'}
            </span>
            <button
              onClick={() => setMapClickMode('none')}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Floating Map Controls on Top-Right */}
      <div className="absolute top-24 right-6 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={toggle3D}
          className={`w-10 h-10 rounded-2xl bg-[#13161F]/90 backdrop-blur-md border flex items-center justify-center transition-all ${
            is3DMode ? 'border-[#2EE59D] text-[#2EE59D] shadow-[0_0_15px_rgba(46,229,157,0.3)]' : 'border-[#242A38] text-slate-300 hover:text-white'
          }`}
          title="Toggle 3D Perspective Pitch"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={zoomIn}
          className="w-10 h-10 rounded-2xl bg-[#13161F]/90 backdrop-blur-md border border-[#242A38] flex items-center justify-center text-slate-300 hover:text-white transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={zoomOut}
          className="w-10 h-10 rounded-2xl bg-[#13161F]/90 backdrop-blur-md border border-[#242A38] flex items-center justify-center text-slate-300 hover:text-white transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
