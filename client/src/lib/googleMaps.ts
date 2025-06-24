// Google Maps integration for location services
export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

export interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  distanceText: string;
  durationText: string;
}

let isGoogleMapsLoaded = false;
let googleMapsPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Maps can only be loaded in browser environment'));
      return;
    }

    if (window.google && window.google.maps) {
      isGoogleMapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export const getPlacePredictions = async (input: string): Promise<google.maps.places.AutocompletePrediction[]> => {
  await loadGoogleMaps();
  
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.places) {
      reject(new Error('Google Places service not available'));
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'IN' }, // Restrict to India
        types: ['establishment', 'geocode']
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          resolve([]);
        }
      }
    );
  });
};

export const getPlaceDetails = async (placeId: string): Promise<LocationData> => {
  await loadGoogleMaps();
  
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.places) {
      reject(new Error('Google Places service not available'));
      return;
    }

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );
    
    service.getDetails(
      {
        placeId,
        fields: ['formatted_address', 'geometry', 'place_id']
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve({
            address: place.formatted_address || '',
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            placeId: place.place_id || placeId
          });
        } else {
          reject(new Error('Failed to get place details'));
        }
      }
    );
  });
};

export const calculateRoute = async (origin: LocationData, destination: LocationData): Promise<RouteData> => {
  await loadGoogleMaps();
  
  return new Promise((resolve, reject) => {
    if (!window.google?.maps) {
      reject(new Error('Google Maps service not available'));
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix(
      {
        origins: [{ lat: origin.lat, lng: origin.lng }],
        destinations: [{ lat: destination.lat, lng: destination.lng }],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      },
      (response, status) => {
        if (status === window.google.maps.DistanceMatrixStatus.OK && response) {
          const result = response.rows[0]?.elements[0];
          
          if (result?.status === 'OK') {
            resolve({
              distance: result.distance?.value || 0,
              duration: result.duration?.value || 0,
              distanceText: result.distance?.text || '',
              durationText: result.duration?.text || ''
            });
          } else {
            reject(new Error('No route found between locations'));
          }
        } else {
          reject(new Error('Failed to calculate route'));
        }
      }
    );
  });
};