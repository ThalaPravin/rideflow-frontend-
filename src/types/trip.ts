export type VehicleCategory = 'eco' | 'comfort' | 'suv' | 'luxury';

export interface LocationPoint {
  name: string;
  address: string;
  lat: number;
  lon: number;
}

export interface VehicleOption {
  id: string;
  name: string;
  brand: string;
  category: VehicleCategory;
  basePrice: number;
  perKm: number;
  capacity: number;
  image: string;
  etaMinutes: number;
  tag?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  initials: string;
  phone: string;
  rating: number;
  tripsCount: number;
  vehicleModel: string;
  vehicleNumber: string;
  vehicleCategory: VehicleCategory;
  currentLat: number;
  currentLon: number;
  heading: number;
}

export type TripLifecycleStatus =
  | 'IDLE'        // Setting up pickup & destination
  | 'SEARCHING'   // Pulsing radar, querying Redis GEO for 5km drivers
  | 'ASSIGNED'    // Driver matched, en route to pickup
  | 'ARRIVED'     // Driver has arrived at pickup location
  | 'ON_TRIP'     // Passenger onboard, driving towards destination
  | 'COMPLETED'   // Dropped off, payment processed
  | 'CANCELED';

export interface KafkaLogEntry {
  id: string;
  topic: 'trip.requested' | 'trip.matched' | 'trip.completed' | 'payment.processed';
  eventType: string;
  timestamp: string;
  sourceService: 'trip-service' | 'matching-service' | 'payment-service';
  payload: Record<string, any>;
  durationMs?: number;
}

export interface PresetCityRoute {
  id: string;
  city: string;
  pickup: LocationPoint;
  destination: LocationPoint;
  distanceKm: number;
  durationMin: number;
  routeCoordinates: [number, number][]; // [lon, lat] for MapLibre
}
