import { RouteData, LocationData } from './googleMaps';
import {
  nammaYatriAPI,
  convertToNammaYatriLocation,
  formatNammaYatriFare,
  NammaYatriEstimate,
} from './nammaYatriApi';

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  platformFee: number;
  taxes: number;
  total: number;
}

export interface CabFareData {
  serviceId: string;
  serviceName: string;
  vehicleType: string;
  fare: FareBreakdown;
  estimatedTime: string;
  features: string[];
  deepLink?: string;
  estimateId?: string;
  searchId?: string;
}

export class FareCalculator {
  private static getSurgeMultiplier(): number {
    const hour = new Date().getHours();
    if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
      return 1.2 + Math.random() * 0.3;
    }
    if (hour >= 23 || hour <= 5) {
      return 1.1 + Math.random() * 0.2;
    }
    return 1.0 + Math.random() * 0.1;
  }

  static calculateOlaFare(route: RouteData): CabFareData {
    const distanceKm = route.distance / 1000;
    const durationMin = route.duration / 60;
    const surge = this.getSurgeMultiplier();

    const mini = {
      baseFare: 25,
      perKm: 11,
      perMin: 1.5,
      platformFee: 5,
    };

    const prime = {
      baseFare: 40,
      perKm: 15,
      perMin: 2,
      platformFee: 8,
    };

    const usePrime = distanceKm > 10;
    const fare = usePrime ? prime : mini;

    const distanceFare = Math.max(0, distanceKm - 2) * fare.perKm;
    const timeFare = durationMin * fare.perMin;
    const subtotal = (fare.baseFare + distanceFare + timeFare) * surge;
    const taxes = subtotal * 0.05;
    const total = subtotal + fare.platformFee + taxes;

    return {
      serviceId: 'ola',
      serviceName: 'Ola',
      vehicleType: usePrime ? 'Prime' : 'Mini',
      fare: {
        baseFare: fare.baseFare,
        distanceFare,
        timeFare,
        surgeMultiplier: surge,
        platformFee: fare.platformFee,
        taxes,
        total,
      },
      estimatedTime: route.durationText,
      features: ['AC', 'Music', 'GPS Tracking'],
      deepLink: `https://book.olacabs.com/?serviceType=${usePrime ? 'prime' : 'mini'}&utm_source=farefair`,
    };
  }

  static calculateUberFare(route: RouteData): CabFareData {
    const distanceKm = route.distance / 1000;
    const durationMin = route.duration / 60;
    const surge = this.getSurgeMultiplier();

    const go = {
      baseFare: 30,
      perKm: 12,
      perMin: 1.8,
      platformFee: 6,
    };

    const premier = {
      baseFare: 50,
      perKm: 18,
      perMin: 2.5,
      platformFee: 10,
    };

    const usePremier = distanceKm > 8;
    const fare = usePremier ? premier : go;

    const distanceFare = distanceKm * fare.perKm;
    const timeFare = durationMin * fare.perMin;
    const subtotal = (fare.baseFare + distanceFare + timeFare) * surge;
    const taxes = subtotal * 0.05;
    const total = subtotal + fare.platformFee + taxes;

    return {
      serviceId: 'uber',
      serviceName: 'Uber',
      vehicleType: usePremier ? 'Premier' : 'Go',
      fare: {
        baseFare: fare.baseFare,
        distanceFare,
        timeFare,
        surgeMultiplier: surge,
        platformFee: fare.platformFee,
        taxes,
        total,
      },
      estimatedTime: route.durationText,
      features: ['AC', 'Wi-Fi', 'Uber Safety'],
      deepLink: `https://m.uber.com/looking?utm_source=farefair`,
    };
  }

static async getNammaYatriFares(pickup: LocationData, destination: LocationData): Promise<CabFareData[]> {
  const isChandigarh =
    pickup.address.toLowerCase().includes("chandigarh") ||
    (
      pickup.lat >= 30.6 &&
      pickup.lat <= 30.8 &&
      pickup.lng >= 76.7 &&
      pickup.lng <= 76.9
    );

  if (isChandigarh) {
    return []; // Silently skip Namma Yatri
  }

  try {
    const nammaPickup = convertToNammaYatriLocation(pickup);
    const nammaDestination = convertToNammaYatriLocation(destination);

    const response = await nammaYatriAPI.getEstimates(nammaPickup, nammaDestination);

    if (!response || !response.estimates.length) {
      return [];
    }

    return response.estimates.map((estimate) => ({
      serviceId: "namma-yatri",
      serviceName: "Namma Yatri",
      vehicleType: estimate.vehicleVariant,
      fare: {
        baseFare: estimate.baseFare,
        distanceFare: estimate.totalFare - estimate.baseFare - estimate.pickupCharges,
        timeFare: 0,
        surgeMultiplier: 1.0,
        platformFee: estimate.pickupCharges,
        taxes: 0,
        total: estimate.totalFare,
      },
      estimatedTime: `${Math.ceil(estimate.rideDuration / 60)} min`,
      features: ["Open Source", "No Surge Pricing", "Driver Friendly", "Transparent Pricing"],
      estimateId: estimate.estimateId,
      searchId: response.searchId,
    }));
  } catch (error) {
    return [];
  }
}


  static async calculateAllFares(
    route: RouteData,
    pickup: LocationData,
    destination: LocationData
  ): Promise<CabFareData[]> {
    const ola = this.calculateOlaFare(route);
    const uber = this.calculateUberFare(route);
    const namma = await this.getNammaYatriFares(pickup, destination);

    const all = [ola, uber, ...namma];
    return all.sort((a, b) => a.fare.total - b.fare.total);
  }
}

// Redirect to cab booking apps
export const redirectToApp = (service: CabFareData, pickup: string, destination: string) => {
  const { serviceId, deepLink } = service;

  let finalUrl = deepLink || '';

  switch (serviceId) {
    case 'ola':
      finalUrl = `https://book.olacabs.com/?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(
        destination
      )}&utm_source=farefair`;
      break;
    case 'uber':
      finalUrl = `https://m.uber.com/looking?pickup_latitude=&pickup_longitude=&dropoff_latitude=&dropoff_longitude=&utm_source=farefair`;
      break;
    case 'namma-yatri':
      finalUrl = `nammayatri://book?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`;
      setTimeout(() => {
        window.open('https://nammayatri.in/', '_blank');
      }, 1000);
      break;
  }

  window.open(finalUrl, '_blank');
};
