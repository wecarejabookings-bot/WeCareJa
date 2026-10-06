import { NurseProfile, ClientZoneAvailabilityAlertSettings, ZoneAlertHistoryItem } from '../types';
import { KINGSTON_ZONES } from '../data/mockData';

export interface ParishZoneMeta {
  name: string;
  parish: 'Kingston' | 'St. Andrew';
  code: string; // e.g., "Kingston 6", "Kingston 8", "Kingston 5"
  landmarks: string;
  avgStandardWaitMins: number; // Dispatched cross-city
  avgLocalWaitMins: number;    // When nurse is already in zone
  trafficHotspot: string;
}

export const CORPORATE_AREA_PARISH_ZONES: ParishZoneMeta[] = [
  {
    name: 'New Kingston',
    parish: 'Kingston',
    code: 'Kingston 5',
    landmarks: 'Trafalgar Rd, Knutsford Blvd, Emancipation Park',
    avgStandardWaitMins: 70,
    avgLocalWaitMins: 12,
    trafficHotspot: 'Trafalgar Road & Oxford Road corridor'
  },
  {
    name: 'Liguanea & Mona',
    parish: 'St. Andrew',
    code: 'Kingston 6',
    landmarks: 'UWI Mona Hospital, Sovereign Centre, Old Hope Rd',
    avgStandardWaitMins: 80,
    avgLocalWaitMins: 14,
    trafficHotspot: 'Hope Road / Matilda\'s Corner junction'
  },
  {
    name: 'Barbican & Cherry Gardens',
    parish: 'St. Andrew',
    code: 'Kingston 8',
    landmarks: 'Barbican Square, Millsborough, Russell Heights',
    avgStandardWaitMins: 75,
    avgLocalWaitMins: 15,
    trafficHotspot: 'East Kings House Road & Barbican Road'
  },
  {
    name: 'Half-Way-Tree',
    parish: 'St. Andrew',
    code: 'Kingston 10',
    landmarks: 'HWT Transport Centre, Clock Tower, Eastwood Park Rd',
    avgStandardWaitMins: 85,
    avgLocalWaitMins: 15,
    trafficHotspot: 'Half-Way-Tree Clock Tower intersection'
  },
  {
    name: 'Constant Spring & Manor Park',
    parish: 'St. Andrew',
    code: 'Kingston 8',
    landmarks: 'Manor Park Plaza, Constant Spring Golf Club, Norbrook',
    avgStandardWaitMins: 85,
    avgLocalWaitMins: 18,
    trafficHotspot: 'Constant Spring Road outbound choke point'
  },
  {
    name: 'Cross Roads & Vineyard Town',
    parish: 'Kingston',
    code: 'Kingston 4 & 5',
    landmarks: 'Cross Roads Carib 5, Deanery Rd, Nuttall Memorial',
    avgStandardWaitMins: 70,
    avgLocalWaitMins: 14,
    trafficHotspot: 'Cross Roads multi-way transit junction'
  },
  {
    name: 'Red Hills & Meadowbrook',
    parish: 'St. Andrew',
    code: 'Kingston 19',
    landmarks: 'Red Hills Mall, Belvedere, Chancery Hall Foothills',
    avgStandardWaitMins: 90,
    avgLocalWaitMins: 20,
    trafficHotspot: 'Red Hills Road & Perkins Boulevard'
  },
  {
    name: 'Stony Hill & Golden Spring',
    parish: 'St. Andrew',
    code: 'St. Andrew North',
    landmarks: 'Stony Hill Square, Hermitage Dam Rd, Brooks Level',
    avgStandardWaitMins: 95,
    avgLocalWaitMins: 22,
    trafficHotspot: 'Stony Hill winding hill pass'
  },
  {
    name: 'Hope Pastures & Papine',
    parish: 'St. Andrew',
    code: 'Kingston 6 & 7',
    landmarks: 'UTech Jamaica Campus, Papine Square, Gordon Town Rd',
    avgStandardWaitMins: 85,
    avgLocalWaitMins: 16,
    trafficHotspot: 'Papine Square market roundabout'
  },
  {
    name: 'Downtown Kingston & Waterfront',
    parish: 'Kingston',
    code: 'Kingston Downtown',
    landmarks: 'Kingston Waterfront, Ocean Blvd, Kingston Public Hospital (KPH)',
    avgStandardWaitMins: 75,
    avgLocalWaitMins: 14,
    trafficHotspot: 'Marcus Garvey Drive & Pechon Street'
  }
];

const STORAGE_KEY = 'wecare_client_zone_alerts_config';

export function getDefaultZoneAlertSettings(currentUserZone?: string): ClientZoneAvailabilityAlertSettings {
  const matchingZone = CORPORATE_AREA_PARISH_ZONES.find(
    z => z.name.toLowerCase() === (currentUserZone || '').toLowerCase()
  );

  const initialWatched = matchingZone 
    ? [matchingZone.name] 
    : ['Liguanea & Mona', 'New Kingston', 'Barbican & Cherry Gardens'];

  return {
    enabled: true,
    watchedZones: initialWatched,
    selectedParish: 'all',
    careLevelPreference: 'all',
    channels: {
      inAppAudio: true,
      inAppBanner: true,
      browserPush: true,
      smsWhatsapp: true
    },
    maxWaitTimeMinutes: 25,
    autoFastTrack: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:30',
    history: []
  };
}

export function loadZoneAlertSettings(currentUserZone?: string): ClientZoneAvailabilityAlertSettings {
  if (typeof window === 'undefined') return getDefaultZoneAlertSettings(currentUserZone);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultZoneAlertSettings(currentUserZone);
      saveZoneAlertSettings(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultZoneAlertSettings(currentUserZone),
      ...parsed,
      channels: {
        ...getDefaultZoneAlertSettings(currentUserZone).channels,
        ...(parsed.channels || {})
      }
    };
  } catch {
    return getDefaultZoneAlertSettings(currentUserZone);
  }
}

export function saveZoneAlertSettings(settings: ClientZoneAvailabilityAlertSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to persist zone alert settings:', err);
  }
}

/**
 * Calculates estimated wait time and time saved for a nurse matched in a Kingston/St. Andrew zone
 */
export function calculateZoneWaitTimeReduction(matchedZone: string): {
  estWaitMinutes: number;
  standardWaitMinutes: number;
  savedWaitMinutes: number;
  percentageFaster: number;
  meta: ParishZoneMeta;
} {
  const meta = CORPORATE_AREA_PARISH_ZONES.find(
    z => z.name.toLowerCase() === matchedZone.toLowerCase()
  ) || CORPORATE_AREA_PARISH_ZONES[0];

  const estWaitMinutes = meta.avgLocalWaitMins;
  const standardWaitMinutes = meta.avgStandardWaitMins;
  const savedWaitMinutes = Math.max(15, standardWaitMinutes - estWaitMinutes);
  const percentageFaster = Math.round((savedWaitMinutes / standardWaitMinutes) * 100);

  return {
    estWaitMinutes,
    standardWaitMinutes,
    savedWaitMinutes,
    percentageFaster,
    meta
  };
}

/**
 * Evaluates whether a nurse matches the client's proactive zone alert settings
 */
export function evaluateNurseForZoneAlert(
  nurse: NurseProfile,
  settings: ClientZoneAvailabilityAlertSettings
): {
  isMatch: boolean;
  matchedZone?: string;
  parish?: 'Kingston' | 'St. Andrew';
  estWaitMinutes: number;
  savedWaitMinutes: number;
} {
  if (!settings.enabled) {
    return { isMatch: false, estWaitMinutes: 75, savedWaitMinutes: 0 };
  }

  // Check on-call status
  if (nurse.availabilityStatus === 'offline' || nurse.status !== 'approved') {
    return { isMatch: false, estWaitMinutes: 75, savedWaitMinutes: 0 };
  }

  // Check care level filter
  if (settings.careLevelPreference !== 'all' && nurse.careLevel !== settings.careLevelPreference) {
    return { isMatch: false, estWaitMinutes: 75, savedWaitMinutes: 0 };
  }

  // Check if nurse covers any of the client's watched zones
  const matchedZone = settings.watchedZones.find(wz => 
    nurse.zones.some(nz => nz.toLowerCase() === wz.toLowerCase())
  );

  if (!matchedZone) {
    return { isMatch: false, estWaitMinutes: 75, savedWaitMinutes: 0 };
  }

  const { estWaitMinutes, savedWaitMinutes, meta } = calculateZoneWaitTimeReduction(matchedZone);

  // Check max wait time threshold
  if (estWaitMinutes > settings.maxWaitTimeMinutes) {
    return { isMatch: false, estWaitMinutes, savedWaitMinutes };
  }

  // Check parish filter
  if (settings.selectedParish !== 'all') {
    if (settings.selectedParish === 'Kingston' && meta.parish !== 'Kingston') {
      return { isMatch: false, estWaitMinutes, savedWaitMinutes };
    }
    if (settings.selectedParish === 'St. Andrew' && meta.parish !== 'St. Andrew') {
      return { isMatch: false, estWaitMinutes, savedWaitMinutes };
    }
  }

  return {
    isMatch: true,
    matchedZone,
    parish: meta.parish,
    estWaitMinutes,
    savedWaitMinutes
  };
}
