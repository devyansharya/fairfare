declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class DistanceMatrixService {
      getDistanceMatrix(
        request: google.maps.DistanceMatrixRequest,
        callback: (response: google.maps.DistanceMatrixResponse | null, status: google.maps.DistanceMatrixStatus) => void
      ): void;
    }

    interface DistanceMatrixRequest {
      origins: google.maps.LatLngLiteral[];
      destinations: google.maps.LatLngLiteral[];
      travelMode: google.maps.TravelMode;
      unitSystem: google.maps.UnitSystem;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
    }

    interface DistanceMatrixResponse {
      rows: google.maps.DistanceMatrixResponseRow[];
    }

    interface DistanceMatrixResponseRow {
      elements: google.maps.DistanceMatrixResponseElement[];
    }

    interface DistanceMatrixResponseElement {
      status: string;
      distance?: {
        text: string;
        value: number;
      };
      duration?: {
        text: string;
        value: number;
      };
    }

    enum DistanceMatrixStatus {
      OK = 'OK',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    enum UnitSystem {
      METRIC = 0,
      IMPERIAL = 1
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: google.maps.places.AutocompletionRequest,
          callback: (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLDivElement);
        getDetails(
          request: google.maps.places.PlaceDetailsRequest,
          callback: (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => void
        ): void;
      }

      interface AutocompletionRequest {
        input: string;
        componentRestrictions?: { country: string };
        types?: string[];
      }

      interface AutocompletePrediction {
        description: string;
        place_id: string;
        structured_formatting: {
          main_text: string;
          secondary_text: string;
        };
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields: string[];
      }

      interface PlaceResult {
        formatted_address?: string;
        geometry?: {
          location?: {
            lat(): number;
            lng(): number;
          };
        };
        place_id?: string;
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        ZERO_RESULTS = 'ZERO_RESULTS',
        NOT_FOUND = 'NOT_FOUND'
      }
    }
  }
}

export {};