'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { useTripStore } from '@/store/useTripStore';

const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pickupMarkerRef = useRef<Marker | null>(null);
  const dropoffMarkerRef = useRef<Marker | null>(null);
  const carMarkerRef = useRef<Marker | null>(null);

  const { activeRoute, carPosition, carHeading, status, activeDriver, driverEta } = useTripStore();

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
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Route Line & Camera on Preset Route Change
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
    if (coords.length > 0) {
      const bounds = coords.reduce(
        (acc, coord) => acc.extend(coord as [number, number]),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );

      map.fitBounds(bounds, {
        padding: { top: 120, bottom: 80, left: 400, right: 100 },
        duration: 1200,
        pitch: 45,
      });
    }

    // Create / Update Pickup Marker
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

    // Create / Update Dropoff Marker
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
  }, [activeRoute]);

  // Update Moving Vehicle Marker on road
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!carMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'car-marker relative cursor-pointer';
      // SVG top-down dark car render with glowing headlights matching Image 1
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

      // Rotate car heading
      const wrapper = carMarkerRef.current.getElement().querySelector('.car-body-wrapper') as HTMLElement | null;
      if (wrapper) {
        wrapper.style.transform = `rotate(${carHeading}deg)`;
      }
    }
  }, [carPosition, carHeading]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-obsidian-950">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
