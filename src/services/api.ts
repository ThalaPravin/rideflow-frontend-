/**
 * RideFlow API Service
 * Handles communication with Go microservices API Gateway (:8080)
 * Seamlessly fails over to realistic simulation mode when Go backend is not running.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface HealthCheckResponse {
  status: string;
  uptime?: string;
  services?: Record<string, string>;
}

export interface BookRideRequest {
  riderId: string;
  pickupLat: number;
  pickupLon: number;
  destinationLat: number;
  destinationLon: number;
  vehicleCategory: string;
}

export interface BookRideResponse {
  tripId: string;
  status: string;
  driverId?: string;
  estimatedFare: number;
  currency: string;
  matchedRadiusKm?: number;
}

export interface DriverLocationPing {
  driverId: string;
  lat: number;
  lon: number;
  heading: number;
}

class RideFlowApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Ping API Gateway /healthz to check if Go microservices are running
   */
  async checkHealth(): Promise<{ online: boolean; latencyMs: number; data?: HealthCheckResponse }> {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/healthz`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json().catch(() => ({ status: 'healthy' }));
        return { online: true, latencyMs, data };
      }
      return { online: false, latencyMs };
    } catch {
      const latencyMs = Math.round(performance.now() - startTime);
      return { online: false, latencyMs };
    }
  }

  /**
   * Book a ride via POST /api/v1/trips/book
   */
  async bookRide(req: BookRideRequest): Promise<BookRideResponse | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${this.baseUrl}/api/v1/trips/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.warn('API Gateway unavailable, using simulator mode:', err);
      return null;
    }
  }

  /**
   * Send driver location update to Redis GEO index via POST /api/v1/drivers/location
   */
  async updateDriverLocation(ping: DriverLocationPing): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/api/v1/drivers/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ping),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const api = new RideFlowApiClient();
