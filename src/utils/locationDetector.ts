import { DetectedLocationResult } from '../types';
import { 
  findNearestZone, 
  isCoordinatesInJamaica, 
  ALL_ZONES_GEO, 
  JAMAICA_DEMO_LOCATIONS,
  calculateDistanceKm
} from '../data/geoData';

// Map zone name to Parish
export function getParishForZone(zoneName: string): string {
  const zone = ALL_ZONES_GEO[zoneName];
  if (zone?.parish) return zone.parish;

  if (zoneName.includes('Portmore') || zoneName.includes('Spanish Town') || zoneName.includes('Catherine')) {
    return 'St. Catherine';
  }
  return 'Kingston & St. Andrew';
}

// Generate friendly Jamaican address hint from zone
export function getAddressHintForZone(zoneName: string): string {
  const hints: Record<string, string> = {
    'New Kingston': 'Trafalgar Road / Knutsford Blvd, Kingston 5',
    'Barbican & Liguanea': 'Hope Road / Sovereign Centre, Kingston 6',
    'Half-Way Tree': 'Constant Spring Road, Kingston 10',
    'Mona & Papine': 'University Hospital / Mona Road, Kingston 7',
    'Constant Spring & Manor Park': 'Manor Park Plaza, Kingston 8',
    'Stony Hill': 'Stony Hill Main Road, St. Andrew',
    'Red Hills': 'Belvedere / Red Hills Square, St. Andrew',
    'Portmore - Portmore Pines & Caribbean Estate': 'Portmore Pines Plaza, Portmore',
    'Portmore - Greater Portmore & Braeton': 'Braeton Parkway, Portmore',
    'Portmore - Waterford & Independence City': 'Waterford Parkway, Portmore',
    'Spanish Town - Town Centre & Cathedral': 'Burke Road, Spanish Town',
    'Spanish Town - Ensom City & Eltham': 'Ensom City Boulevard, Spanish Town',
    'Spanish Town - Brunswick & St Jago Heights': 'St Jago Heights, Spanish Town',
    'Spanish Town - Innswood & Willowdene': 'Innswood Estate, Spanish Town'
  };

  return hints[zoneName] || `${zoneName}, Jamaica`;
}

// Format coordinates to standard GPS string
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export interface AutoDetectLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  forceSimulatedDemo?: boolean;
}

/**
 * Auto-detect user's live physical location using the browser Geolocation API
 * Resolves to the nearest Jamaican community zone and parish
 */
export function autoDetectLocation(
  options: AutoDetectLocationOptions = {}
): Promise<DetectedLocationResult> {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 30000,
    forceSimulatedDemo = false
  } = options;

  return new Promise((resolve, reject) => {
    // If demo requested
    if (forceSimulatedDemo) {
      const demoLoc = JAMAICA_DEMO_LOCATIONS[1]; // New Kingston
      const nearest = findNearestZone(demoLoc.lat, demoLoc.lng);
      resolve({
        lat: demoLoc.lat,
        lng: demoLoc.lng,
        accuracy: 12,
        nearestZone: nearest.zone.name,
        distanceKm: nearest.distanceKm,
        parish: getParishForZone(nearest.zone.name),
        formattedAddress: getAddressHintForZone(nearest.zone.name),
        isSimulated: true,
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const inJamaica = isCoordinatesInJamaica(latitude, longitude);

        if (inJamaica) {
          const nearest = findNearestZone(latitude, longitude);
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy),
            nearestZone: nearest.zone.name,
            distanceKm: Number(nearest.distanceKm.toFixed(2)),
            parish: getParishForZone(nearest.zone.name),
            formattedAddress: getAddressHintForZone(nearest.zone.name),
            isSimulated: false,
            timestamp: new Date(position.timestamp).toISOString()
          });
        } else {
          // Tester is outside Jamaica: Find nearest zone and calibrate gracefully
          const nearest = findNearestZone(latitude, longitude);
          // Default to New Kingston center for best in-island experience
          resolve({
            lat: 18.0074,
            lng: -76.7836,
            accuracy: Math.round(accuracy) || 25,
            nearestZone: 'New Kingston',
            distanceKm: 0.2,
            parish: 'Kingston & St. Andrew',
            formattedAddress: 'Trafalgar Road / Knutsford Blvd, New Kingston',
            isSimulated: true,
            timestamp: new Date().toISOString()
          });
        }
      },
      (error) => {
        let message = 'Unable to auto-detect your location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable on this network/device.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location detection timed out. Please try again or select your zone manually.';
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );
  });
}
