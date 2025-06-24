// Haversine formula to calculate distance between two coordinates
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Estimate travel time based on distance and average speed
export function estimateTravelTime(distanceKm: number): number {
  const averageSpeedKmh = 25; // Average city speed including traffic
  return (distanceKm / averageSpeedKmh) * 60; // Time in minutes
}

export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  distanceText: string;
  durationText: string;
}

export function calculateRoute(pickup: { lat: number; lng: number }, destination: { lat: number; lng: number }): RouteInfo {
  // Validate coordinates
  if (!pickup.lat || !pickup.lng || !destination.lat || !destination.lng) {
    throw new Error('Invalid coordinates provided');
  }
  
  const distance = calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng);
  
  // Validate distance calculation
  if (isNaN(distance) || distance <= 0) {
    throw new Error('Unable to calculate distance between locations');
  }
  
  const duration = estimateTravelTime(distance);
  
  return {
    distance: distance,
    duration: duration,
    distanceText: `${distance.toFixed(1)} km`,
    durationText: `${Math.round(duration)} min`
  };
}