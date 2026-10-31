import { VehicleOption, DriverProfile, PresetCityRoute, PaymentMethod, PromoDiscount } from '@/types/trip';

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'passat',
    name: 'Passat',
    brand: 'Volkswagen',
    category: 'comfort',
    basePrice: 5.0,
    perKm: 2.1,
    capacity: 4,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
    etaMinutes: 4,
    tag: 'Popular',
  },
  {
    id: 'audi_a6',
    name: 'A6',
    brand: 'Audi',
    category: 'luxury',
    basePrice: 8.5,
    perKm: 3.2,
    capacity: 4,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=600&q=80',
    etaMinutes: 6,
    tag: 'Premium',
  },
  {
    id: 'crv_suv',
    name: 'CR-V',
    brand: 'Honda',
    category: 'suv',
    basePrice: 6.5,
    perKm: 2.6,
    capacity: 6,
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    etaMinutes: 3,
    tag: '6 Seats',
  },
  {
    id: 'datsun_eco',
    name: 'Go',
    brand: 'Datsun',
    category: 'eco',
    basePrice: 3.5,
    perKm: 1.6,
    capacity: 4,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    etaMinutes: 7,
    tag: 'Best Value',
  },
  {
    id: 'camry_white',
    name: 'White Camry',
    brand: 'Toyota',
    category: 'comfort',
    basePrice: 4.5,
    perKm: 1.9,
    capacity: 4,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80',
    etaMinutes: 5,
    tag: 'GoCabs Choice',
  },
  {
    id: 'mustang_gt',
    name: 'Mustang Shelby GT',
    brand: 'Ford',
    category: 'luxury',
    basePrice: 9.0,
    perKm: 3.5,
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=600&q=80',
    etaMinutes: 4,
    tag: 'Sports Edition',
  },
];

export const MOCK_DRIVERS: DriverProfile[] = [
  {
    id: 'acb336c4-15f2-47f6-8080-d744173a1f3e',
    name: 'Jeromy Conway',
    initials: 'JC',
    phone: '+1 (650) 492-3810',
    rating: 4.95,
    tripsCount: 1480,
    vehicleModel: 'Volkswagen Passat',
    vehicleNumber: 'CA 7XKP912',
    vehicleCategory: 'comfort',
    currentLat: 37.4255,
    currentLon: -122.1020,
    heading: 135,
  },
  {
    id: '82bdbe64-3d32-43a0-a707-e206c0af5bba',
    name: 'Bill Harness',
    initials: 'BH',
    phone: '+1 (617) 832-4091',
    rating: 4.92,
    tripsCount: 2130,
    vehicleModel: 'VW Passat',
    vehicleNumber: 'MA 3B-4921',
    vehicleCategory: 'comfort',
    currentLat: 37.4180,
    currentLon: -122.0950,
    heading: 45,
  },
  {
    id: '388de7d9-e7f1-4338-89e7-2792cf2a4f5f',
    name: 'Goku Son',
    initials: 'GS',
    phone: '+1 (415) 777-1122',
    rating: 4.98,
    tripsCount: 3820,
    vehicleModel: 'Honda CR-V',
    vehicleNumber: 'MH 01A B 4321',
    vehicleCategory: 'suv',
    currentLat: 37.4320,
    currentLon: -122.1150,
    heading: 90,
  },
  {
    id: 'db1eaa9b-753e-4631-84d4-0388b24839bd',
    name: 'Vegeta Briefs',
    initials: 'VB',
    phone: '+1 (415) 777-2233',
    rating: 4.91,
    tripsCount: 940,
    vehicleModel: 'Audi A6',
    vehicleNumber: 'MH 01A B 4322',
    vehicleCategory: 'luxury',
    currentLat: 37.4110,
    currentLon: -122.0820,
    heading: 270,
  },
];

export const PRESET_ROUTES: PresetCityRoute[] = [
  {
    id: 'silicon_valley',
    city: 'Silicon Valley (Palo Alto ➔ Mountain View)',
    pickup: {
      name: 'Palo Verde',
      address: '3412 Ross Rd, Palo Alto, CA 94303',
      lat: 37.4362,
      lon: -122.1198,
    },
    destination: {
      name: 'Googleplex / Mountain View',
      address: '311A Moffett Blvd, Mountain View, CA 94043',
      lat: 37.3986,
      lon: -122.0784,
    },
    distanceKm: 8.4,
    durationMin: 14,
    routeCoordinates: [
      [-122.1198, 37.4362],
      [-122.1154, 37.4385],
      [-122.1082, 37.4320],
      [-122.1024, 37.4265],
      [-122.0950, 37.4180],
      [-122.0880, 37.4125],
      [-122.0825, 37.4060],
      [-122.0784, 37.3986],
    ],
  },
  {
    id: 'boston_downtown',
    city: 'Boston (Beacon Hill ➔ Financial District)',
    pickup: {
      name: 'Beacon Hill',
      address: '3429 Beacon St, Boston, MA 02108',
      lat: 42.3588,
      lon: -71.0707,
    },
    destination: {
      name: 'Financial District',
      address: '2374 State St, Boston, MA 02109',
      lat: 42.3582,
      lon: -71.0538,
    },
    distanceKm: 2.5,
    durationMin: 9,
    routeCoordinates: [
      [-71.0707, 42.3588],
      [-71.0665, 42.3575],
      [-71.0620, 42.3562],
      [-71.0575, 42.3590],
      [-71.0538, 42.3582],
    ],
  },
  {
    id: 'sf_tech',
    city: 'San Francisco (Mission ➔ Presidio)',
    pickup: {
      name: 'Mission Dolores',
      address: '499 Dolores St, San Francisco, CA 94110',
      lat: 37.7602,
      lon: -122.4265,
    },
    destination: {
      name: 'Presidio Tunnel Tops',
      address: '210 Lincoln Blvd, San Francisco, CA 94129',
      lat: 37.8015,
      lon: -122.4608,
    },
    distanceKm: 7.2,
    durationMin: 18,
    routeCoordinates: [
      [-122.4265, 37.7602],
      [-122.4290, 37.7710],
      [-122.4350, 37.7820],
      [-122.4480, 37.7940],
      [-122.4608, 37.8015],
    ],
  },
];

export const POPULAR_PLACES: Record<string, { name: string; address: string; lat: number; lon: number }[]> = {
  silicon_valley: [
    { name: 'Palo Alto Caltrain', address: '95 University Ave, Palo Alto, CA', lat: 37.4431, lon: -122.1649 },
    { name: 'Stanford Shopping Center', address: '660 Stanford Shopping Ctr, Palo Alto, CA', lat: 37.4445, lon: -122.1715 },
    { name: 'Googleplex Bldg 43', address: '1600 Amphitheatre Pkwy, Mountain View, CA', lat: 37.4220, lon: -122.0841 },
    { name: 'Apple Park Spaceship', address: '1 Apple Park Way, Cupertino, CA', lat: 37.3349, lon: -122.0090 },
    { name: 'San Jose Airport (SJC)', address: '1701 Airport Blvd, San Jose, CA', lat: 37.3639, lon: -121.9289 },
    { name: 'Santana Row Premier', address: '377 Santana Row, San Jose, CA', lat: 37.3216, lon: -121.9478 },
  ],
  boston_downtown: [
    { name: 'Beacon Hill Historic', address: '3429 Beacon St, Boston, MA', lat: 42.3588, lon: -71.0707 },
    { name: 'Financial District State St', address: '2374 State St, Boston, MA', lat: 42.3582, lon: -71.0538 },
    { name: 'MIT Stata Center', address: '32 Vassar St, Cambridge, MA', lat: 42.3615, lon: -71.0906 },
    { name: 'Harvard Yard Gate', address: 'Massachusetts Ave, Cambridge, MA', lat: 42.3736, lon: -71.1189 },
    { name: 'Boston Logan Airport (BOS)', address: '1 Harborside Dr, Boston, MA', lat: 42.3656, lon: -71.0096 },
  ],
  sf_tech: [
    { name: 'Mission Dolores Park', address: '499 Dolores St, San Francisco, CA', lat: 37.7602, lon: -122.4265 },
    { name: 'Salesforce Tower', address: '415 Mission St, San Francisco, CA', lat: 37.7897, lon: -122.3972 },
    { name: 'Ferry Building Market', address: '1 Ferry Building, San Francisco, CA', lat: 37.7955, lon: -122.3937 },
    { name: 'Presidio Tunnel Tops', address: '210 Lincoln Blvd, San Francisco, CA', lat: 37.8015, lon: -122.4608 },
    { name: 'SFO International Airport', address: 'San Francisco, CA 94128', lat: 37.6213, lon: -122.3790 },
  ],
};

export function calculateDistanceKm(
  p1: { lat: number; lon: number },
  p2: { lat: number; lon: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.max(1.2, parseFloat(dist.toFixed(1)));
}

export function generateRouteCoordinates(
  pickup: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  intermediateStop?: { lat: number; lon: number } | null
): [number, number][] {
  const points: [number, number][] = [];
  const segments: [{ lat: number; lon: number }, { lat: number; lon: number }][] = intermediateStop
    ? [
        [pickup, intermediateStop],
        [intermediateStop, destination],
      ]
    : [[pickup, destination]];

  segments.forEach(([start, end], segIdx) => {
    const steps = 7;
    const startStep = segIdx === 0 ? 0 : 1;
    for (let i = startStep; i <= steps; i++) {
      const t = i / steps;
      const lon = start.lon + (end.lon - start.lon) * t;
      const lat = start.lat + (end.lat - start.lat) * t;
      const curve = Math.sin(t * Math.PI) * 0.0025;
      points.push([parseFloat((lon + curve * 0.8).toFixed(6)), parseFloat((lat + curve).toFixed(6))]);
    }
  });

  return points;
}

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_wallet',
    type: 'wallet',
    title: 'RideFlow Wallet',
    subtitle: 'Zero fee • Instant Kafka settlement',
    isDefault: true,
  },
  {
    id: 'pm_apple_pay',
    type: 'apple_pay',
    title: 'Apple Pay',
    subtitle: 'One-touch biometric auth',
    isDefault: false,
  },
  {
    id: 'pm_visa',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    title: 'Visa Signature',
    subtitle: 'Expires 12/28',
    isDefault: false,
  },
  {
    id: 'pm_mastercard',
    type: 'card',
    brand: 'Mastercard',
    last4: '8819',
    title: 'Mastercard World Elite',
    subtitle: 'Expires 09/29',
    isDefault: false,
  },
  {
    id: 'pm_cash',
    type: 'cash',
    title: 'Cash on Arrival',
    subtitle: 'Pay driver directly at dropoff',
    isDefault: false,
  },
];

export const VALID_PROMOS: PromoDiscount[] = [
  {
    code: 'NEON20',
    percentage: 20,
    description: '20% off your ride across Silicon Valley & Boston',
  },
  {
    code: 'FIRST10',
    amountOff: 10,
    description: '$10 off your ride for new passengers',
  },
  {
    code: 'GOCABS50',
    percentage: 50,
    description: '50% special discount on GoCabs bookings',
  },
];

