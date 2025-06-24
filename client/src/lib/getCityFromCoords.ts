export async function getCityFromCoords(lat: number, lng: number): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
  );

  const data = await response.json();

  if (data.status === "OK") {
    const components = data.results[0].address_components;
    const cityComponent = components.find((comp: any) =>
      comp.types.includes("locality") || comp.types.includes("administrative_area_level_2")
    );
    return cityComponent?.long_name || null;
  }

  return null;
}
