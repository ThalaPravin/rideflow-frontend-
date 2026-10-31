# RideFlow Frontend 🚗⚡

RideFlow Frontend is a modern, dark-mode, map-centric web application engineered to complement the **RideFlow Distributed Ride-Hailing Platform**.

## 🎨 Visual Identity & Inspiration
- **Theme**: Dark obsidian glassmorphism (`#0A0D14`, `#111622`, `#1E2638`) with vibrant emerald/mint neon accents (`#00E599`).
- **Typography**: `Plus Jakarta Sans` for geometric display branding, `Inter` for clean micro-copy, and `Geist Mono` for telemetries, prices, and Kafka event envelopes.
- **Inspiration**: Umoto & Uber Dark design systems with floating booking panels, dynamic vehicle tier carousels, animated road routing, live driver telemetry, and an integrated system architecture HUD.

## 🚀 Key Features
- **Interactive Vector Map**: Powered by MapLibre GL with Carto Dark Matter styling, animated gradient road polylines, pulsing pickup/destination markers, and live vehicle pins.
- **Floating Journey Drawer**: Quick-preset routes (Palo Alto, Mountain View, Boston, San Francisco), road distance calculation, and vehicle class selector (Eco, Comfort / Passat, SUV / CR-V, Luxury / Audi A6).
- **Dynamic Pricing Engine**: Automated fare estimation based on actual route distance and vehicle multiplier.
- **End-to-End Trip State Machine**: `IDLE` ➔ `SEARCHING` (radar search) ➔ `ASSIGNED` (live driver card with ETA) ➔ `ON_TRIP` (smooth vehicle movement) ➔ `COMPLETED` (itemized fare receipt & payment confirmation).
- **Driver Telemetry Simulator**: Allows toggling into Driver Mode to emit real-time GPS coordinates directly to the Go API Gateway / Redis Geospatial index.
- **Distributed System HUD ("The Resume Flex")**: Real-time inspector streaming simulated or live Kafka event logs (`trip.requested`, `trip.matched`, `trip.completed`, `payment.processed`), Redis cache state, and Go microservice latency.

## 🛠️ Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Glassmorphism
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Map Engine**: MapLibre GL
