// Namma Yatri Open Source API Integration

export interface NammaYatriLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface NammaYatriEstimate {
  estimateId: string;
  vehicleVariant: string;
  totalFare: number;
  baseFare: number;
  pickupCharges: number;
  waitingCharges: number;
  rideDistance: number;
  rideDuration: number;
  nightShiftCharge: number;
  currency: string;
  descriptions: string[];
}

export interface NammaYatriQuoteResponse {
  estimates: NammaYatriEstimate[];
  searchId: string;
}

class NammaYatriAPI {
  private baseUrl = 'https://nammayatri.in/api';

  async getEstimates(
    pickup: NammaYatriLocation,
    destination: NammaYatriLocation
  ): Promise<NammaYatriQuoteResponse | null> {
    try {
      const searchResponse = await fetch(`${this.baseUrl}/rideSearch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          contents: {
            origin: {
              gps: { lat: pickup.lat, lon: pickup.lng },
              address: { fullAddress: pickup.address },
            },
            destination: {
              gps: { lat: destination.lat, lon: destination.lng },
              address: { fullAddress: destination.address },
            },
          },
        }),
      });

      if (!searchResponse.ok) return null;
      const searchData = await searchResponse.json();
      const searchId = searchData.searchId;
      if (!searchId) return null;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const estimatesResponse = await fetch(`${this.baseUrl}/estimates?searchId=${searchId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!estimatesResponse.ok) return null;
      const estimatesData = await estimatesResponse.json();

      return {
        estimates: estimatesData.estimates || [],
        searchId,
      };
    } catch (error) {
      console.error('Namma Yatri API error:', error);
      return null;
    }
  }

  async bookRide(estimateId: string, searchId: string): Promise<string> {
    const deepLink = `nammayatri://book?estimateId=${estimateId}&searchId=${searchId}`;
    try {
      window.location.href = deepLink;
      setTimeout(() => {
        window.open(`https://nammayatri.in/book?estimateId=${estimateId}&searchId=${searchId}`, '_blank');
      }, 1000);
      return deepLink;
    } catch {
      const webUrl = `https://nammayatri.in/book?estimateId=${estimateId}&searchId=${searchId}`;
      window.open(webUrl, '_blank');
      return webUrl;
    }
  }

  async getVehicleTypes(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicleTypes`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) return ['AUTO_RICKSHAW', 'CAB', 'BIKE'];
      const data = await response.json();
      return data.vehicleTypes || ['AUTO_RICKSHAW', 'CAB', 'BIKE'];
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      return ['AUTO_RICKSHAW', 'CAB', 'BIKE'];
    }
  }
}

export const nammaYatriAPI = new NammaYatriAPI();

export const convertToNammaYatriLocation = (location: {
  lat: number;
  lng: number;
  address: string;
}): NammaYatriLocation => ({
  lat: location.lat,
  lng: location.lng,
  address: location.address,
});

export const formatNammaYatriFare = (estimate: NammaYatriEstimate) => ({
  serviceId: 'namma-yatri',
  serviceName: 'Namma Yatri',
  vehicleType: estimate.vehicleVariant,
  price: estimate.totalFare,
  originalPrice: estimate.totalFare,
  rating: 4.2,
  reviews: 15000,
  estimatedTime: `${Math.ceil(estimate.rideDuration / 60)} min`,
  capacity: estimate.vehicleVariant === 'AUTO_RICKSHAW' ? 3 : 4,
  features: ['Open Source', 'No Surge Pricing', 'Driver Friendly', 'Transparent Pricing'],
  isRecommended: true,
  carType: estimate.vehicleVariant,
  fareBreakdown: {
    baseFare: estimate.baseFare,
    pickupCharges: estimate.pickupCharges,
    waitingCharges: estimate.waitingCharges,
    nightShiftCharge: estimate.nightShiftCharge,
    total: estimate.totalFare,
    currency: estimate.currency,
    distance: estimate.rideDistance,
    duration: estimate.rideDuration,
  },
  estimateId: estimate.estimateId,
});
