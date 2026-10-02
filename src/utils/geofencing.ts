import { NurseProfile } from '../types';
import { calculateDistanceKm, estimateTransitMinutes, ALL_ZONES_GEO } from '../data/geoData';

export interface GeofenceEvaluation {
  isWithinGeofence: boolean;
  distanceKm: number;
  geofenceRadiusKm: number;
  excessKm: number;
  coverageStatus: 'within_geofence' | 'boundary_zone' | 'outside_geofence';
  transitMinutes: number;
  anchorName: string;
}

/**
 * Evaluates whether a client's location falls inside the nurse's active geofence boundary.
 */
export function checkNurseGeofence(
  nurse: NurseProfile,
  clientLat: number,
  clientLng: number
): GeofenceEvaluation {
  // Nurse's anchor coordinates or fallback to first assigned zone
  const firstZone = nurse.zones?.[0] || 'New Kingston';
  const defaultZoneGeo = ALL_ZONES_GEO[firstZone] || ALL_ZONES_GEO['New Kingston'];
  const nurseLat = nurse.currentLat || defaultZoneGeo.lat;
  const nurseLng = nurse.currentLng || defaultZoneGeo.lng;

  const distanceKm = calculateDistanceKm(clientLat, clientLng, nurseLat, nurseLng);
  const geofenceRadiusKm = nurse.geofenceRadiusKm || 15;
  const isWithinGeofence = distanceKm <= geofenceRadiusKm;
  const excessKm = isWithinGeofence ? 0 : Math.round((distanceKm - geofenceRadiusKm) * 10) / 10;

  let coverageStatus: 'within_geofence' | 'boundary_zone' | 'outside_geofence' = 'within_geofence';
  if (!isWithinGeofence) {
    coverageStatus = 'outside_geofence';
  } else if (distanceKm > geofenceRadiusKm * 0.85) {
    coverageStatus = 'boundary_zone';
  }

  const transitMinutes = estimateTransitMinutes(distanceKm);
  const anchorName = nurse.geofenceAnchorName || nurse.zones?.[0] || 'Kingston & St. Andrew';

  return {
    isWithinGeofence,
    distanceKm,
    geofenceRadiusKm,
    excessKm,
    coverageStatus,
    transitMinutes,
    anchorName
  };
}

/**
 * Returns human-readable corridor coverage label based on kilometer radius
 */
export function getGeofenceRadiusLabel(radiusKm: number): string {
  if (radiusKm <= 6) return 'Immediate Community / Ward (5-6 km)';
  if (radiusKm <= 12) return 'Kingston & St. Andrew Urban Core (10-12 km)';
  if (radiusKm <= 18) return 'Greater Metropolitan Area (15-18 km)';
  if (radiusKm <= 26) return 'Kingston, Portmore & Highway Corridor (20-25 km)';
  return 'Tri-Parish Extended Service Area (30-35 km)';
}

/**
 * Checks if nurse is currently On-Call and available for dispatch
 */
export function isNurseOnCall(nurse: NurseProfile): boolean {
  return nurse.availabilityStatus !== 'offline';
}
