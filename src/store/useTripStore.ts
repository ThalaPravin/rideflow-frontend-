import { create } from 'zustand';
import {
  VehicleOption,
  DriverProfile,
  LocationPoint,
  TripLifecycleStatus,
  KafkaLogEntry,
  PresetCityRoute,
  MapClickTarget,
  PaymentMethod,
  PromoDiscount,
} from '@/types/trip';
import {
  VEHICLE_OPTIONS,
  MOCK_DRIVERS,
  PRESET_ROUTES,
  MOCK_PAYMENT_METHODS,
  VALID_PROMOS,
  calculateDistanceKm,
  generateRouteCoordinates,
} from '@/data/mockData';
import { sounds } from '@/utils/sound';
import { api } from '@/services/api';

interface TripStore {
  // Routes & Location
  activeRoute: PresetCityRoute;
  pickup: LocationPoint;
  destination: LocationPoint;
  intermediateStop: LocationPoint | null;
  mapClickMode: MapClickTarget;
  setMapClickMode: (mode: MapClickTarget) => void;
  setPickup: (loc: LocationPoint) => void;
  setDestination: (loc: LocationPoint) => void;
  setIntermediateStop: (loc: LocationPoint | null) => void;
  removeIntermediateStop: () => void;
  selectPresetRoute: (routeId: string) => void;
  handleMapClickLocation: (lon: number, lat: number) => void;

  // UI Theme Mode (Umoto / Uber Dark / GoCabs from reference designs)
  uiTheme: UIThemeMode;
  setUITheme: (theme: UIThemeMode) => void;

  // Mobile Viewport Switcher
  mobileTab: 'booking' | 'map';
  setMobileTab: (tab: 'booking' | 'map') => void;

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
  speedKmH: number; // live simulated speedometer

  // Safety & PIN Verification
  safetyPin: string;

  // In-App Messenger with Driver
  chatMessages: ChatMessage[];
  isDriverTyping: boolean;
  sendChatMessage: (text: string) => void;

  // Vehicle Camera Tracking
  isFollowCamera: boolean;
  toggleFollowCamera: () => void;

  // Audio FX
  isAudioMuted: boolean;
  toggleAudioMute: () => void;

  // Kafka & Architecture DevTools
  kafkaLogs: KafkaLogEntry[];
  isBackendConnected: boolean;
  backendLatencyMs: number;
  isSimulatorMode: boolean;
  setSimulatorMode: (val: boolean) => void;
  checkBackendHealth: () => Promise<void>;
  addKafkaLog: (log: Omit<KafkaLogEntry, 'id' | 'timestamp'>) => void;

  // Payments & Digital Wallet
  walletBalance: number;
  topUpWallet: (amount: number) => void;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod;
  selectPaymentMethod: (id: string) => void;

  // Promo Discounts
  appliedPromo: PromoDiscount | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromo: () => void;

  // Ride Scheduling
  scheduledTime: string | null;
  setScheduledTime: (time: string | null) => void;

  // Post-Trip Rating, Tipping & Compliments
  tripRating: number;
  setTripRating: (rating: number) => void;
  driverTip: number;
  setDriverTip: (tip: number) => void;
  selectedCompliments: string[];
  toggleCompliment: (compliment: string) => void;

  // Actions
  requestRide: () => void;
  acceptRideByDriver: () => void;
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
  intermediateStop: null,
  mapClickMode: 'none',
  uiTheme: 'umoto',
  mobileTab: 'booking',
  setMobileTab: (tab) => set({ mobileTab: tab }),
  selectedVehicle: VEHICLE_OPTIONS[0], // Passat
  status: 'IDLE',
  tripId: null,
  activeDriver: MOCK_DRIVERS[0], // Jeromy Conway
  carPosition: DEFAULT_ROUTE.routeCoordinates[2],
  carHeading: 135,
  tripProgress: 0,
  driverEta: 10,
  speedKmH: 0,
  safetyPin: '8492',
  isFollowCamera: false,
  isDriverTyping: false,
  chatMessages: [
    {
      id: 'msg_0',
      sender: 'driver',
      text: 'Hi there! I am heading toward your pickup location now in the Passat.',
      timestamp: 'Just now',
    },
  ],
  isAudioMuted: false,
  kafkaLogs: [],
  isBackendConnected: false,
  backendLatencyMs: 0,
  isSimulatorMode: true,

  // Payments & Digital Wallet
  walletBalance: 142.50,
  topUpWallet: (amount: number) => {
    sounds.playClick();
    set((state) => ({ walletBalance: parseFloat((state.walletBalance + amount).toFixed(2)) }));
  },
  paymentMethods: MOCK_PAYMENT_METHODS,
  selectedPaymentMethod: MOCK_PAYMENT_METHODS[0],
  selectPaymentMethod: (id: string) => {
    sounds.playClick();
    const pm = get().paymentMethods.find((p) => p.id === id);
    if (pm) set({ selectedPaymentMethod: pm });
  },

  // Promo Engine
  appliedPromo: null,
  applyPromoCode: (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = VALID_PROMOS.find((p) => p.code === trimmed);
    if (found) {
      sounds.playDriverMatched();
      set({ appliedPromo: found });
      return { success: true, message: `Promo code "${found.code}" applied! ${found.description}` };
    }
    return { success: false, message: 'Invalid promo code. Try NEON20, FIRST10 or GOCABS50.' };
  },
  removePromo: () => {
    sounds.playClick();
    set({ appliedPromo: null });
  },

  // Ride Scheduling
  scheduledTime: null,
  setScheduledTime: (time: string | null) => {
    sounds.playClick();
    set({ scheduledTime: time });
  },

  // Ratings, Tips & Compliments
  tripRating: 5,
  setTripRating: (rating: number) => {
    sounds.playClick();
    set({ tripRating: rating });
  },
  driverTip: 0,
  setDriverTip: (tip: number) => {
    sounds.playClick();
    set({ driverTip: tip });
  },
  selectedCompliments: ['🌟 Clean Car'],
  toggleCompliment: (comp: string) => {
    sounds.playClick();
    set((state) => {
      const exists = state.selectedCompliments.includes(comp);
      return {
        selectedCompliments: exists
          ? state.selectedCompliments.filter((c) => c !== comp)
          : [...state.selectedCompliments, comp],
      };
    });
  },

  toggleFollowCamera: () => set((state) => ({ isFollowCamera: !state.isFollowCamera })),

  sendChatMessage: (text: string) => {
    sounds.playClick();
    const riderMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 8),
      sender: 'rider',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, riderMsg],
      isDriverTyping: true,
    }));

    setTimeout(() => {
      const driverReplies = [
        'Got it! Pulling up right now.',
        'Sounds good, I see you at the corner 👍',
        'Thanks for letting me know, traffic is smooth.',
        'On my way, hazard lights are on!',
      ];
      const randomReply = driverReplies[Math.floor(Math.random() * driverReplies.length)];

      const driverMsg: ChatMessage = {
        id: 'msg_' + Math.random().toString(36).substring(2, 8),
        sender: 'driver',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };

      sounds.playDriverMatched();
      set((state) => ({
        chatMessages: [...state.chatMessages, driverMsg],
        isDriverTyping: false,
      }));
    }, 1800);
  },

  setUITheme: (theme) => {
    sounds.playClick();
    if (theme === 'umoto') {
      const r = PRESET_ROUTES[0];
      set({
        uiTheme: 'umoto',
        activeRoute: r,
        pickup: r.pickup,
        destination: r.destination,
        intermediateStop: null,
        selectedVehicle: VEHICLE_OPTIONS[0],
        activeDriver: MOCK_DRIVERS[0],
        carPosition: r.routeCoordinates[2] || r.routeCoordinates[0],
        driverEta: 10,
        status: 'IDLE',
      });
    } else if (theme === 'uber') {
      const r = PRESET_ROUTES[1];
      set({
        uiTheme: 'uber',
        activeRoute: r,
        pickup: r.pickup,
        destination: r.destination,
        intermediateStop: null,
        selectedVehicle: VEHICLE_OPTIONS[0],
        activeDriver: MOCK_DRIVERS[1],
        carPosition: r.routeCoordinates[1] || r.routeCoordinates[0],
        driverEta: 5,
        status: 'IDLE',
      });
    } else {
      set({ uiTheme: theme });
    }
  },

  setMapClickMode: (mode) => set({ mapClickMode: mode }),

  toggleAudioMute: () => {
    const isMuted = sounds.toggleMute();
    set({ isAudioMuted: isMuted });
  },

  checkBackendHealth: async () => {
    const res = await api.checkHealth();
    set({
      isBackendConnected: res.online,
      backendLatencyMs: res.latencyMs,
    });
  },

  setPickup: (loc) => {
    const { destination, intermediateStop, activeRoute } = get();
    const newCoords = generateRouteCoordinates(loc, destination, intermediateStop);
    const dist1 = calculateDistanceKm(loc, intermediateStop || destination);
    const dist2 = intermediateStop ? calculateDistanceKm(intermediateStop, destination) : 0;
    const totalDist = parseFloat((dist1 + dist2).toFixed(1));

    set({
      pickup: loc,
      activeRoute: {
        ...activeRoute,
        pickup: loc,
        distanceKm: totalDist,
        durationMin: Math.max(4, Math.round(totalDist * 1.6)),
        routeCoordinates: newCoords,
      },
      mapClickMode: 'none',
    });
  },

  setDestination: (loc) => {
    const { pickup, intermediateStop, activeRoute } = get();
    const newCoords = generateRouteCoordinates(pickup, loc, intermediateStop);
    const dist1 = calculateDistanceKm(pickup, intermediateStop || loc);
    const dist2 = intermediateStop ? calculateDistanceKm(intermediateStop, loc) : 0;
    const totalDist = parseFloat((dist1 + dist2).toFixed(1));

    set({
      destination: loc,
      activeRoute: {
        ...activeRoute,
        destination: loc,
        distanceKm: totalDist,
        durationMin: Math.max(4, Math.round(totalDist * 1.6)),
        routeCoordinates: newCoords,
      },
      mapClickMode: 'none',
    });
  },

  setIntermediateStop: (loc) => {
    const { pickup, destination, activeRoute } = get();
    if (!loc) {
      get().removeIntermediateStop();
      return;
    }
    const newCoords = generateRouteCoordinates(pickup, destination, loc);
    const dist1 = calculateDistanceKm(pickup, loc);
    const dist2 = calculateDistanceKm(loc, destination);
    const totalDist = parseFloat((dist1 + dist2).toFixed(1));

    set({
      intermediateStop: loc,
      activeRoute: {
        ...activeRoute,
        intermediateStop: loc,
        distanceKm: totalDist,
        durationMin: Math.max(5, Math.round(totalDist * 1.7)),
        routeCoordinates: newCoords,
      },
      mapClickMode: 'none',
    });
  },

  removeIntermediateStop: () => {
    const { pickup, destination, activeRoute } = get();
    const newCoords = generateRouteCoordinates(pickup, destination, null);
    const totalDist = calculateDistanceKm(pickup, destination);

    set({
      intermediateStop: null,
      activeRoute: {
        ...activeRoute,
        intermediateStop: null,
        distanceKm: totalDist,
        durationMin: Math.max(4, Math.round(totalDist * 1.6)),
        routeCoordinates: newCoords,
      },
    });
  },

  handleMapClickLocation: (lon: number, lat: number) => {
    const { mapClickMode } = get();
    if (mapClickMode === 'none') return;

    sounds.playClick();
    const formattedAddress = `${lat.toFixed(4)}°N, ${Math.abs(lon).toFixed(4)}°W (Pinned)`;

    if (mapClickMode === 'pickup') {
      get().setPickup({
        name: 'Custom Pickup Pin',
        address: formattedAddress,
        lat,
        lon,
      });
    } else if (mapClickMode === 'destination') {
      get().setDestination({
        name: 'Custom Destination Pin',
        address: formattedAddress,
        lat,
        lon,
      });
    } else if (mapClickMode === 'stop') {
      get().setIntermediateStop({
        name: 'Custom Intermediate Stop',
        address: formattedAddress,
        lat,
        lon,
      });
    }
  },

  selectPresetRoute: (routeId) => {
    const route = PRESET_ROUTES.find((r) => r.id === routeId) || DEFAULT_ROUTE;
    set({
      activeRoute: route,
      pickup: route.pickup,
      destination: route.destination,
      intermediateStop: null,
      carPosition: route.routeCoordinates[2] || route.routeCoordinates[0],
      tripProgress: 0,
      status: 'IDLE',
      speedKmH: 0,
    });
  },

  selectVehicle: (vehicleId) => {
    const v = VEHICLE_OPTIONS.find((opt) => opt.id === vehicleId);
    if (v) {
      set({ selectedVehicle: v });
    }
  },

  calculateFare: () => {
    const { activeRoute, selectedVehicle, intermediateStop, appliedPromo } = get();
    // Stop fee of $2.50 if an extra waypoint is added
    const stopFee = intermediateStop ? 2.5 : 0;
    let fare = selectedVehicle.basePrice + activeRoute.distanceKm * selectedVehicle.perKm + stopFee;

    if (appliedPromo) {
      if (appliedPromo.percentage) {
        fare = fare * (1 - appliedPromo.percentage / 100);
      } else if (appliedPromo.amountOff) {
        fare = Math.max(2.5, fare - appliedPromo.amountOff);
      }
    }

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
    const { pickup, destination, intermediateStop, selectedVehicle, addKafkaLog, isBackendConnected } = get();

    set({ status: 'SEARCHING', tripId, tripProgress: 0, speedKmH: 0 });

    // Emit Kafka event: trip.requested
    addKafkaLog({
      topic: 'trip.requested',
      eventType: 'TRIP_REQUESTED',
      sourceService: 'trip-service',
      payload: {
        trip_id: tripId,
        pickup: pickup.name,
        destination: destination.name,
        intermediate_stop: intermediateStop ? intermediateStop.name : null,
        vehicle_type: selectedVehicle.name,
        amount: fare,
        is_live_backend: isBackendConnected,
      },
    });

    // If live backend is available, trigger API request
    if (isBackendConnected) {
      api.bookRide({
        riderId: 'rider_usr_99182',
        pickupLat: pickup.lat,
        pickupLon: pickup.lon,
        destinationLat: destination.lat,
        destinationLon: destination.lon,
        vehicleCategory: selectedVehicle.category,
      });
    }

    // Simulate backend Redis Geo matching search latency (~1.8s)
    setTimeout(() => {
      const assignedDriver = MOCK_DRIVERS[0]; // Jeromy Conway
      sounds.playDriverMatched();
      set({
        status: 'ASSIGNED',
        activeDriver: assignedDriver,
        driverEta: 3,
        speedKmH: 24,
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

            // Natural speed fluctuation between 38 and 54 km/h
            const simulatedSpeed = Math.floor(38 + Math.random() * 16);

            set({
              carPosition: currentPos,
              carHeading: heading,
              tripProgress: Math.round((step / totalSteps) * 100),
              speedKmH: simulatedSpeed,
            });
          } else {
            clearInterval(interval);
            get().completeRide();
          }
        }, 1800);
      }, 2500);
    }, 1800);
  },

  acceptRideByDriver: () => {
    const { status, tripId, addKafkaLog } = get();
    if (status !== 'SEARCHING') return;

    const assignedDriver = MOCK_DRIVERS[0];
    sounds.playDriverMatched();
    set({
      status: 'ASSIGNED',
      activeDriver: assignedDriver,
      driverEta: 2,
      speedKmH: 28,
    });

    addKafkaLog({
      topic: 'trip.matched',
      eventType: 'DRIVER_ACCEPTED_DISPATCH',
      sourceService: 'driver-service',
      payload: {
        trip_id: tripId,
        driver_id: assignedDriver.id,
        driver_name: assignedDriver.name,
        action: 'MANUALLY_ACCEPTED_BY_DRIVER',
      },
    });

    setTimeout(() => {
      set({ status: 'ON_TRIP' });
      const routeCoords = get().activeRoute.routeCoordinates;
      let step = 0;
      const totalSteps = routeCoords.length;

      const interval = setInterval(() => {
        step++;
        if (step < totalSteps) {
          const currentPos = routeCoords[step];
          const prevPos = routeCoords[step - 1];
          const dLon = currentPos[0] - prevPos[0];
          const dLat = currentPos[1] - prevPos[1];
          const heading = (Math.atan2(dLon, dLat) * 180) / Math.PI;
          const simulatedSpeed = Math.floor(38 + Math.random() * 16);

          set({
            carPosition: currentPos,
            carHeading: heading,
            tripProgress: Math.round((step / totalSteps) * 100),
            speedKmH: simulatedSpeed,
          });
        } else {
          clearInterval(interval);
          get().completeRide();
        }
      }, 1800);
    }, 1800);
  },

  completeRide: () => {
    const { tripId, calculateFare, addKafkaLog, activeDriver } = get();
    sounds.playTripCompleted();
    set({ status: 'COMPLETED', tripProgress: 100, speedKmH: 0 });

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
    set({ status: 'IDLE', tripId: null, tripProgress: 0, speedKmH: 0 });
  },

  resetRide: () => {
    set({ status: 'IDLE', tripId: null, tripProgress: 0, speedKmH: 0 });
  },

  updateDriverPosition: (pos, heading = 0) => {
    set({ carPosition: pos, carHeading: heading });
  },
}));
