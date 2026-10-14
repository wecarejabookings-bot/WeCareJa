/**
 * We Care Jamaica - Navigation & Device Maps Deep-Linking Engine
 * Generates accurate deep-link URLs and coordinates for mobile & desktop Maps apps
 * (Google Maps, Apple Maps, Waze, and native geo: URIs)
 */

export interface LocationCoordinates {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Standard GPS centroids for all We Care Jamaica service zones
 * in Kingston, St. Andrew, Portmore, and Spanish Town.
 */
export const JAMAICA_ZONE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Kingston & St. Andrew
  'New Kingston': { lat: 18.0074, lng: -76.7825 },
  'Liguanea & Mona': { lat: 18.0163, lng: -76.7584 },
  'Barbican & Cherry Gardens': { lat: 18.0350, lng: -76.7720 },
  'Half-Way-Tree': { lat: 18.0125, lng: -76.7990 },
  'Constant Spring & Manor Park': { lat: 18.0510, lng: -76.7930 },
  'Cross Roads & Vineyard Town': { lat: 17.9890, lng: -76.7830 },
  'Red Hills & Meadowbrook': { lat: 18.0580, lng: -76.8220 },
  'Stony Hill & Golden Spring': { lat: 18.0820, lng: -76.7890 },
  'Hope Pastures & Papine': { lat: 18.0180, lng: -76.7450 },
  'Downtown Kingston & Waterfront': { lat: 17.9690, lng: -76.7920 },

  // Portmore, St. Catherine
  'Portmore - Greater Portmore': { lat: 17.9620, lng: -76.8910 },
  'Portmore - Braeton & Hellshire': { lat: 17.9250, lng: -76.8920 },
  'Portmore - Bridgeport & Waterford': { lat: 17.9710, lng: -76.8620 },
  'Portmore - Edgewater & Bayside': { lat: 17.9540, lng: -76.8690 },
  'Portmore - Portmore Pines & Caribbean Estate': { lat: 17.9580, lng: -76.8780 },

  // Spanish Town, St. Catherine
  'Spanish Town - Town Centre & Cathedral': { lat: 17.9950, lng: -76.9550 },
  'Spanish Town - Ensom City & Eltham': { lat: 18.0080, lng: -76.9620 },
  'Spanish Town - Brunswick & St Jago Heights': { lat: 18.0150, lng: -76.9450 },
  'Spanish Town - Innswood & Willowdene': { lat: 17.9850, lng: -76.9820 }
};

/**
 * Resolve coordinates for a given address and zone
 */
export function resolveLocationCoordinates(
  address?: string,
  zone?: string,
  providedLat?: number,
  providedLng?: number
): { lat: number; lng: number; query: string } {
  if (providedLat && providedLng) {
    return {
      lat: providedLat,
      lng: providedLng,
      query: `${providedLat},${providedLng}`
    };
  }

  // Check matching zone centroid
  if (zone && JAMAICA_ZONE_COORDINATES[zone]) {
    const coords = JAMAICA_ZONE_COORDINATES[zone];
    return {
      lat: coords.lat,
      lng: coords.lng,
      query: address ? `${address}, ${zone}, Jamaica` : `${coords.lat},${coords.lng}`
    };
  }

  // Fallback to Kingston center
  const defaultCoords = { lat: 18.0179, lng: -76.8099 };
  return {
    lat: defaultCoords.lat,
    lng: defaultCoords.lng,
    query: address ? `${address}, Kingston, Jamaica` : `${defaultCoords.lat},${defaultCoords.lng}`
  };
}

/**
 * Generate Google Maps navigation URL with turn-by-turn routing
 */
export function getGoogleMapsUrl(
  address?: string,
  zone?: string,
  lat?: number,
  lng?: number
): string {
  const resolved = resolveLocationCoordinates(address, zone, lat, lng);
  const dest = encodeURIComponent(resolved.query);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

/**
 * Generate Apple Maps navigation URL (works seamlessly on iOS/iPadOS/macOS)
 */
export function getAppleMapsUrl(
  address?: string,
  zone?: string,
  lat?: number,
  lng?: number
): string {
  const resolved = resolveLocationCoordinates(address, zone, lat, lng);
  const query = encodeURIComponent(address ? `${address}, ${zone || 'Kingston'}, Jamaica` : `${resolved.lat},${resolved.lng}`);
  return `https://maps.apple.com/?daddr=${query}&dirflg=d`;
}

/**
 * Generate Waze navigation URL
 */
export function getWazeUrl(
  address?: string,
  zone?: string,
  lat?: number,
  lng?: number
): string {
  const resolved = resolveLocationCoordinates(address, zone, lat, lng);
  return `https://waze.com/ul?ll=${resolved.lat},${resolved.lng}&navigate=yes`;
}

/**
 * Generate Universal Geo URI for Android intent or native app handler
 */
export function getGeoUri(
  address?: string,
  zone?: string,
  lat?: number,
  lng?: number
): string {
  const resolved = resolveLocationCoordinates(address, zone, lat, lng);
  const label = encodeURIComponent(address || 'Patient Home Visit');
  return `geo:${resolved.lat},${resolved.lng}?q=${resolved.lat},${resolved.lng}(${label})`;
}

/**
 * Intelligently opens the best Maps app on the user's device
 */
export function openInDeviceMaps(
  address?: string,
  zone?: string,
  lat?: number,
  lng?: number
): void {
  const isAppleDevice = typeof navigator !== 'undefined' && 
    (/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent || '') && !(window as any).MSStream);

  const url = isAppleDevice 
    ? getAppleMapsUrl(address, zone, lat, lng)
    : getGoogleMapsUrl(address, zone, lat, lng);

  window.open(url, '_blank', 'noopener,noreferrer');
}
