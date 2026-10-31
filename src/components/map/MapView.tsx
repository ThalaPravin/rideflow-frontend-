'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { useTripStore } from '@/store/useTripStore';
import { MOCK_DRIVERS } from '@/data/mockData';
import { Layers, Plus, Compass, ZoomIn, ZoomOut, MapPin } from 'lucide-react';

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

      // Neon Shadow / Glow Line
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#00E599',
          'line-width': 10,
          'line-opacity': 0.28,
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
          'line-color': '#00E599',
          'line-width': 4.5,
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
          'line-color': '#E0F2FE',
          'line-width': 1.8,
          'line-opacity': 0.8,
        },
      });

      // Render ambient available drivers on the map (Fleet in Redis GEO)
      MOCK_DRIVERS.slice(1).forEach((driver) => {
        const el = document.createElement('div');
        el.className = 'ambient-driver opacity-60 hover:opacity-100 transition-opacity cursor-pointer';
        el.title = `${driver.name} • ${driver.vehicleModel} (Available)`;
        el.innerHTML = `
          <div style="transform: rotate(${driver.heading}deg);" class="transition-transform duration-500">
            <svg viewBox="0 0 28 50" class="w-5 h-9 drop-shadow-md">
              <rect x="4" y="6" width="20" height="38" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1"/>
              <rect x="7" y="18" width="14" height="15" rx="2" fill="#0A0D14"/>
              <circle cx="9" cy="42" r="1.5" fill="#EF4444"/>
              <circle cx="19" cy="42" r="1.5" fill="#EF4444"/>
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
        padding: { top: 120, bottom: 90, left: 420, right: 120 },
        duration: 1200,
        pitch: is3DMode ? 45 : 0,
      });
    }

    // Pickup Marker
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setLngLat([activeRoute.pickup.lon, activeRoute.pickup.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'pickup-marker flex items-center justify-center';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-400 opacity-40 animate-ping"></div>
          <div class="w-6 h-6 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/50">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
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
        el.className = 'stop-marker flex items-center justify-center';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-purple-500 opacity-40 animate-ping"></div>
            <div class="w-6 h-6 rounded-full bg-purple-950 border-2 border-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <span class="text-[10px] font-bold text-purple-200">S</span>
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

    // Dropoff Marker
    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.setLngLat([activeRoute.destination.lon, activeRoute.destination.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'dropoff-marker flex items-center justify-center';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <div class="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
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
      // SVG top-down dark car render with glowing headlights
      el.innerHTML = `
        <div class="car-body-wrapper transition-transform duration-700 ease-linear" style="transform: rotate(${carHeading}deg);">
          <div class="relative w-8 h-16 flex items-center justify-center">
            <!-- Headlights Glow -->
            <div class="absolute -top-3 left-1 w-2.5 h-7 bg-cyan-300 opacity-60 blur-[3px] rounded-full transform -rotate-6"></div>
            <div class="absolute -top-3 right-1 w-2.5 h-7 bg-cyan-300 opacity-60 blur-[3px] rounded-full transform rotate-6"></div>
            
            <!-- Car Silhouette -->
            <svg viewBox="0 0 40 80" class="w-full h-full drop-shadow-2xl">
              <!-- Body -->
              <rect x="6" y="8" width="28" height="64" rx="14" fill="#0E131E" stroke="#334155" stroke-width="1.8"/>
              <!-- Windshield Front -->
              <path d="M 10 24 Q 20 20 30 24 L 28 34 Q 20 32 12 34 Z" fill="#1E293B" stroke="#475569" stroke-width="0.8"/>
              <!-- Roof -->
              <rect x="11" y="34" width="18" height="22" rx="3" fill="#0A0D14"/>
              <!-- Windshield Rear -->
              <path d="M 12 56 Q 20 54 28 56 L 27 63 Q 20 62 13 63 Z" fill="#1E293B" stroke="#475569" stroke-width="0.8"/>
              <!-- Wheels -->
              <rect x="3" y="18" width="3" height="12" rx="1.5" fill="#020617"/>
              <rect x="34" y="18" width="3" height="12" rx="1.5" fill="#020617"/>
              <rect x="3" y="50" width="3" height="12" rx="1.5" fill="#020617"/>
              <rect x="34" y="50" width="3" height="12" rx="1.5" fill="#020617"/>
              <!-- Taillights -->
              <circle cx="11" cy="71" r="1.5" fill="#EF4444"/>
              <circle cx="29" cy="71" r="1.5" fill="#EF4444"/>
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
    <div className="relative w-full h-full overflow-hidden bg-obsidian-950">
      {/* MapLibre Canvas Container */}
      <div
        ref={mapContainerRef}
        className={`absolute inset-0 w-full h-full ${
          mapClickMode !== 'none' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* Mode Indicator Banner when user is in "Pin on Map" mode */}
      {mapClickMode !== 'none' && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
          <div className="px-5 py-2.5 rounded-2xl glass-panel-elevated border border-neon-emerald flex items-center gap-3 shadow-neon">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-emerald animate-ping" />
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

      {/* Floating Map Controls (3D, Zoom, Layer) on Top-Right */}
      <div className="absolute top-24 right-6 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={toggle3D}
          className={`w-10 h-10 rounded-2xl glass-panel flex items-center justify-center transition-all ${
            is3DMode ? 'border-neon-emerald text-neon-emerald shadow-neonSmall' : 'text-slate-300 hover:text-white'
          }`}
          title="Toggle 3D Perspective Pitch"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={zoomIn}
          className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-slate-300 hover:text-white transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={zoomOut}
          className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-slate-300 hover:text-white transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
