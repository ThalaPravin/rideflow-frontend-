import { create } from 'zustand';
import {
  VehicleOption,
  DriverProfile,
  LocationPoint,
  TripLifecycleStatus,
  KafkaLogEntry,
  PresetCityRoute,
} from '@/types/trip';
import { VEHICLE_OPTIONS, MOCK_DRIVERS, PRESET_ROUTES } from '@/data/mockData';

interface TripStore {
  // Routes & Location
  activeRoute: PresetCityRoute;
  pickup: LocationPoint;
  destination: LocationPoint;
  setPickup: (loc: LocationPoint) => void;
  setDestination: (loc: LocationPoint) => void;
  selectPresetRoute: (routeId: string) => void;

  // Vehicles & Pricing
  selectedVehicle: VehicleOption;
  selectVehicle: (vehicleId: string) => void;
  calculateFare: () => number;

  // Trip Lifecycle
  status: TripLifecycleStatus;
  tripId: string | null;
  activeDriver: DriverProfile | null;
  carPosition: [number, number]; // [lon, lat]
  carHeading: number;
  tripProgress: number; // 0 to 100%
  driverEta: number; // in minutes

  // Kafka & Architecture DevTools
  kafkaLogs: KafkaLogEntry[];
  isBackendConnected: boolean;
  isSimulatorMode: boolean;
  setSimulatorMode: (val: boolean) => void;
  addKafkaLog: (log: Omit<KafkaLogEntry, 'id' | 'timestamp'>) => void;

  // Actions
  requestRide: () => void;
  cancelRide: () => void;
  completeRide: () => void;
  resetRide: () => void;
  updateDriverPosition: (pos: [number, number], heading?: number) => void;
}

const DEFAULT_ROUTE = PRESET_ROUTES[0]; // Silicon Valley (Umoto style)

export const useTripStore = create<TripStore>((set, get) => ({
  activeRoute: DEFAULT_ROUTE,
  pickup: DEFAULT_ROUTE.pickup,
  destination: DEFAULT_ROUTE.destination,
  selectedVehicle: VEHICLE_OPTIONS[0], // Passat
  status: 'IDLE',
  tripId: null,
  activeDriver: MOCK_DRIVERS[0], // Jeromy Conway
  carPosition: DEFAULT_ROUTE.routeCoordinates[2],
  carHeading: 135,
  tripProgress: 0,
  driverEta: 4,
  kafkaLogs: [],
  isBackendConnected: false,
  isSimulatorMode: true,

  setPickup: (loc) => set({ pickup: loc }),
  setDestination: (loc) => set({ destination: loc }),

  selectPresetRoute: (routeId) => {
    const route = PRESET_ROUTES.find((r) => r.id === routeId) || DEFAULT_ROUTE;
    set({
      activeRoute: route,
      pickup: route.pickup,
      destination: route.destination,
      carPosition: route.routeCoordinates[2],
      tripProgress: 0,
      status: 'IDLE',
    });
  },

  selectVehicle: (vehicleId) => {
    const v = VEHICLE_OPTIONS.find((opt) => opt.id === vehicleId);
    if (v) {
      set({ selectedVehicle: v });
    }
  },

  calculateFare: () => {
    const { activeRoute, selectedVehicle } = get();
    const fare = selectedVehicle.basePrice + activeRoute.distanceKm * selectedVehicle.perKm;
    return parseFloat(fare.toFixed(2));
  },

  setSimulatorMode: (val) => set({ isSimulatorMode: val }),

  addKafkaLog: (log) => {
    const newEntry: KafkaLogEntry = {
      ...log,
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };
    set((state) => ({ kafkaLogs: [newEntry, ...state.kafkaLogs.slice(0, 19)] }));
  },

  requestRide: () => {
    const tripId = 'trip_' + Math.random().toString(36).substring(2, 10);
    const fare = get().calculateFare();
    const { pickup, destination, selectedVehicle, addKafkaLog } = get();

    set({ status: 'SEARCHING', tripId, tripProgress: 0 });

    // Emit Kafka event: trip.requested
    addKafkaLog({
      topic: 'trip.requested',
      eventType: 'TRIP_REQUESTED',
      sourceService: 'trip-service',
      payload: {
        trip_id: tripId,
        pickup: pickup.name,
        destination: destination.name,
        vehicle_type: selectedVehicle.name,
        amount: fare,
      },
    });

    // Simulate backend Redis Geo matching search latency (~1.8s)
    setTimeout(() => {
      const assignedDriver = MOCK_DRIVERS[0]; // Jeromy Conway
      set({
        status: 'ASSIGNED',
        activeDriver: assignedDriver,
        driverEta: 3,
      });

      // Emit Kafka event: trip.matched
      addKafkaLog({
        topic: 'trip.matched',
        eventType: 'TRIP_MATCHED',
        sourceService: 'matching-service',
        payload: {
          trip_id: tripId,
          driver_id: assignedDriver.id,
          driver_name: assignedDriver.name,
          vehicle: assignedDriver.vehicleModel,
          redis_geosearch_radius: '5.0km',
        },
      });

      // After 2.5s, driver arrives and starts journey
      setTimeout(() => {
        set({ status: 'ON_TRIP' });

        // Animate vehicle traversing the route polyline
        const routeCoords = get().activeRoute.routeCoordinates;
        let step = 0;
        const totalSteps = routeCoords.length;

        const interval = setInterval(() => {
          step++;
          if (step < totalSteps) {
            const currentPos = routeCoords[step];
            const prevPos = routeCoords[step - 1];
            // Calculate approximate heading angle
            const dLon = currentPos[0] - prevPos[0];
            const dLat = currentPos[1] - prevPos[1];
            const heading = (Math.atan2(dLon, dLat) * 180) / Math.PI;

            set({
              carPosition: currentPos,
              carHeading: heading,
              tripProgress: Math.round((step / totalSteps) * 100),
            });
          } else {
            clearInterval(interval);
            get().completeRide();
          }
        }, 1800);
      }, 2500);
    }, 1800);
  },

  completeRide: () => {
    const { tripId, calculateFare, addKafkaLog, activeDriver } = get();
    set({ status: 'COMPLETED', tripProgress: 100 });

    // Emit Kafka event: trip.completed
    addKafkaLog({
      topic: 'trip.completed',
      eventType: 'TRIP_COMPLETED',
      sourceService: 'trip-service',
      payload: {
        trip_id: tripId,
        driver_id: activeDriver?.id,
        status: 'DROPPED_OFF',
      },
    });

    // Emit Kafka event: payment.processed
    setTimeout(() => {
      addKafkaLog({
        topic: 'payment.processed',
        eventType: 'PAYMENT_PROCESSED',
        sourceService: 'payment-service',
        payload: {
          trip_id: tripId,
          amount: calculateFare(),
          status: 'SUCCESS',
          payment_method: 'Apple Pay / Card ending •••• 4242',
        },
      });
    }, 600);
  },

  cancelRide: () => {
    set({ status: 'IDLE', tripId: null, tripProgress: 0 });
  },

  resetRide: () => {
    set({ status: 'IDLE', tripId: null, tripProgress: 0 });
  },

  updateDriverPosition: (pos, heading = 0) => {
    set({ carPosition: pos, carHeading: heading });
  },
}));
