export interface ZoneGeo {
  name: string;
  region: 'Kingston & St Andrew' | 'Portmore' | 'Spanish Town';
  lat: number;
  lng: number;
  parish: string;
  landmark: string;
  majorRoads: string[];
}

export interface RegionInfo {
  id: string;
  name: string;
  parish: string;
  description: string;
  badge: string;
  color: string;
  center: { lat: number; lng: number };
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  zones: string[];
}

export const REGIONS: Record<string, RegionInfo> = {
  'all': {
    id: 'all',
    name: 'All Service Corridors',
    parish: 'Kingston, St Andrew & St Catherine',
    description: 'Greater Metropolitan Corridor (Kingston, Portmore & Spanish Town)',
    badge: 'Greater Metro',
    color: '#7209B7',
    center: { lat: 18.0050, lng: -76.8400 },
    bounds: { minLat: 17.910, maxLat: 18.100, minLng: -77.010, maxLng: -76.720 },
    zones: []
  },
  'kingston': {
    id: 'kingston',
    name: 'Kingston & St Andrew',
    parish: 'Kingston / St Andrew',
    description: 'Corporate Area & Urban Kingston Foothills',
    badge: 'Capital Metro',
    color: '#7209B7',
    center: { lat: 18.0179, lng: -76.7845 },
    bounds: { minLat: 17.955, maxLat: 18.095, minLng: -76.850, maxLng: -76.730 },
    zones: [
      'New Kingston',
      'Liguanea & Mona',
      'Barbican & Cherry Gardens',
      'Half-Way-Tree',
      'Constant Spring & Manor Park',
      'Cross Roads & Vineyard Town',
      'Red Hills & Meadowbrook',
      'Stony Hill & Golden Spring',
      'Hope Pastures & Papine',
      'Downtown Kingston & Waterfront'
    ]
  },
  'portmore': {
    id: 'portmore',
    name: 'Portmore',
    parish: 'St Catherine',
    description: 'Sunshine City Residential & Coastal Communities',
    badge: 'St Catherine South',
    color: '#0EA5E9',
    center: { lat: 17.9580, lng: -76.8780 },
    bounds: { minLat: 17.915, maxLat: 17.985, minLng: -76.920, maxLng: -76.835 },
    zones: [
      'Portmore - Greater Portmore',
      'Portmore - Braeton & Hellshire',
      'Portmore - Bridgeport & Waterford',
      'Portmore - Edgewater & Bayside',
      'Portmore - Portmore Pines & Caribbean Estate'
    ]
  },
  'spanish_town': {
    id: 'spanish_town',
    name: 'Spanish Town',
    parish: 'St Catherine',
    description: 'Historic Capital, Residential Belts & Highway Access',
    badge: 'St Catherine Central',
    color: '#10B981',
    center: { lat: 18.0010, lng: -76.9600 },
    bounds: { minLat: 17.970, maxLat: 18.045, minLng: -77.010, maxLng: -76.920 },
    zones: [
      'Spanish Town - Town Centre & Cathedral',
      'Spanish Town - Ensom City & Eltham',
      'Spanish Town - Brunswick & St Jago Heights',
      'Spanish Town - Innswood & Willowdene'
    ]
  }
};

export const ALL_ZONES_GEO: Record<string, ZoneGeo> = {
  // --- Kingston & St Andrew ---
  'New Kingston': {
    name: 'New Kingston',
    region: 'Kingston & St Andrew',
    lat: 18.0074,
    lng: -76.7836,
    parish: 'St Andrew',
    landmark: 'Trafalgar Rd & Knutsford Blvd',
    majorRoads: ['Trafalgar Road', 'Knutsford Boulevard', 'Oxford Road']
  },
  'Liguanea & Mona': {
    name: 'Liguanea & Mona',
    region: 'Kingston & St Andrew',
    lat: 18.0163,
    lng: -76.7584,
    parish: 'St Andrew',
    landmark: 'Sovereign Centre / UHWI Hospital',
    majorRoads: ['Hope Road', 'Old Hope Road', 'Mona Road']
  },
  'Barbican & Cherry Gardens': {
    name: 'Barbican & Cherry Gardens',
    region: 'Kingston & St Andrew',
    lat: 18.0381,
    lng: -76.7794,
    parish: 'St Andrew',
    landmark: 'Barbican Square & Millsborough',
    majorRoads: ['Barbican Road', 'East Kings House Road', 'Millsborough Ave']
  },
  'Half-Way-Tree': {
    name: 'Half-Way-Tree',
    region: 'Kingston & St Andrew',
    lat: 18.0125,
    lng: -76.7978,
    parish: 'St Andrew',
    landmark: 'Clock Tower & Transport Centre',
    majorRoads: ['Constant Spring Road', 'Half-Way-Tree Road', 'Hagley Park Road']
  },
  'Constant Spring & Manor Park': {
    name: 'Constant Spring & Manor Park',
    region: 'Kingston & St Andrew',
    lat: 18.0532,
    lng: -76.7915,
    parish: 'St Andrew',
    landmark: 'Manor Park Plaza & Constant Spring Golf Club',
    majorRoads: ['Constant Spring Road', 'Manor Centre Drive', 'Shortwood Road']
  },
  'Cross Roads & Vineyard Town': {
    name: 'Cross Roads & Vineyard Town',
    region: 'Kingston & St Andrew',
    lat: 17.9892,
    lng: -76.7865,
    parish: 'Kingston / St Andrew',
    landmark: 'Carib 5 & Nuttall Memorial Hospital',
    majorRoads: ['Old Hope Road', 'Slipe Road', 'Caledonia Avenue']
  },
  'Red Hills & Meadowbrook': {
    name: 'Red Hills & Meadowbrook',
    region: 'Kingston & St Andrew',
    lat: 18.0468,
    lng: -76.8241,
    parish: 'St Andrew',
    landmark: 'Red Hills Road & Calabar High',
    majorRoads: ['Red Hills Road', 'Meadowbrook Main', 'Chancery Hall']
  },
  'Stony Hill & Golden Spring': {
    name: 'Stony Hill & Golden Spring',
    region: 'Kingston & St Andrew',
    lat: 18.0815,
    lng: -76.7876,
    parish: 'St Andrew',
    landmark: 'Stony Hill Square & Hermitage Dam Rd',
    majorRoads: ['Junction Road', 'Stony Hill Main', 'Airlie Road']
  },
  'Hope Pastures & Papine': {
    name: 'Hope Pastures & Papine',
    region: 'Kingston & St Andrew',
    lat: 18.0205,
    lng: -76.7455,
    parish: 'St Andrew',
    landmark: 'Papine Square & UTech Campus',
    majorRoads: ['Gordon Town Road', 'Hope Road', 'Widcombe Road']
  },
  'Downtown Kingston & Waterfront': {
    name: 'Downtown Kingston & Waterfront',
    region: 'Kingston & St Andrew',
    lat: 17.9692,
    lng: -76.7938,
    parish: 'Kingston',
    landmark: 'Ocean Boulevard & Bank of Jamaica',
    majorRoads: ['Ocean Boulevard', 'King Street', 'Marcus Garvey Drive']
  },

  // --- Portmore (St Catherine) ---
  'Portmore - Greater Portmore': {
    name: 'Portmore - Greater Portmore',
    region: 'Portmore',
    lat: 17.9525,
    lng: -76.8850,
    parish: 'St Catherine',
    landmark: 'Greater Portmore Shopping Centre & Ascot High',
    majorRoads: ['Portmore Parkway', 'Dyke Road', 'Hellshire Main']
  },
  'Portmore - Braeton & Hellshire': {
    name: 'Portmore - Braeton & Hellshire',
    region: 'Portmore',
    lat: 17.9312,
    lng: -76.8970,
    parish: 'St Catherine',
    landmark: 'Braeton Parkway & Hellshire Beach Access',
    majorRoads: ['Hellshire Main Road', 'Braeton Boulevard', 'Sandhills Way']
  },
  'Portmore - Bridgeport & Waterford': {
    name: 'Portmore - Bridgeport & Waterford',
    region: 'Portmore',
    lat: 17.9620,
    lng: -76.8620,
    parish: 'St Catherine',
    landmark: 'Bridgeport Post Office & Waterford High',
    majorRoads: ['Waterford Main Road', 'Municipal Boulevard', 'Bridgeport Ave']
  },
  'Portmore - Edgewater & Bayside': {
    name: 'Portmore - Edgewater & Bayside',
    region: 'Portmore',
    lat: 17.9710,
    lng: -76.8520,
    parish: 'St Catherine',
    landmark: 'Portmore Mall & Bayside Roundabout',
    majorRoads: ['Portmore Municipal Blvd', 'Naggo Head Main', 'Causeway Link']
  },
  'Portmore - Portmore Pines & Caribbean Estate': {
    name: 'Portmore - Portmore Pines & Caribbean Estate',
    region: 'Portmore',
    lat: 17.9580,
    lng: -76.8780,
    parish: 'St Catherine',
    landmark: 'Portmore Pines Plaza & Caribbean Estate Security Gate',
    majorRoads: ['Portmore Parkway', 'Pines Boulevard', 'Braeton Link']
  },

  // --- Spanish Town (St Catherine) ---
  'Spanish Town - Town Centre & Cathedral': {
    name: 'Spanish Town - Town Centre & Cathedral',
    region: 'Spanish Town',
    lat: 17.9915,
    lng: -76.9530,
    parish: 'St Catherine',
    landmark: 'Spanish Town Square / St Jago Cathedral / Spanish Town Hospital',
    majorRoads: ['Burke Road', 'Young Street', 'King Street', 'Wellington Street']
  },
  'Spanish Town - Ensom City & Eltham': {
    name: 'Spanish Town - Ensom City & Eltham',
    region: 'Spanish Town',
    lat: 18.0110,
    lng: -76.9610,
    parish: 'St Catherine',
    landmark: 'Ensom City Community / Eltham High & G.C. Foster Link',
    majorRoads: ['Brunswick Avenue', 'Jobs Lane', 'Eltham Main Road']
  },
  'Spanish Town - Brunswick & St Jago Heights': {
    name: 'Spanish Town - Brunswick & St Jago Heights',
    region: 'Spanish Town',
    lat: 18.0220,
    lng: -76.9450,
    parish: 'St Catherine',
    landmark: 'St Jago Heights Lookout & Horizon Park Entrance',
    majorRoads: ['St Jago Heights Road', 'Barrett Street', 'Sligoville Road']
  },
  'Spanish Town - Innswood & Willowdene': {
    name: 'Spanish Town - Innswood & Willowdene',
    region: 'Spanish Town',
    lat: 17.9850,
    lng: -76.9820,
    parish: 'St Catherine',
    landmark: 'Innswood High / Willowdene Church & School',
    majorRoads: ['Old Harbour Road', 'Willowdene Parkway', 'High Pasture Drive']
  }
};

// Backward-compatible alias for existing imports
export const KINGSTON_ZONE_GEO = ALL_ZONES_GEO;

// Default center for Kingston Metropolitan area
export const KINGSTON_METRO_CENTER = {
  lat: 18.0050,
  lng: -76.8400,
  zoom: 11
};

// Great-circle Haversine Distance in Kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

// Estimates driving time in Kingston/St Catherine urban traffic conditions
export function estimateTransitMinutes(distanceKm: number): number {
  // Average traffic speed ~ 25 km/h across urban corridors (Mandela Hwy, Portmore Causeway, Hope Rd) + 4 minutes dispatch/parking buffer
  const trafficSpeedKmH = 25;
  const transitMinutes = Math.round((distanceKm / trafficSpeedKmH) * 60) + 4;
  return Math.max(5, transitMinutes);
}

// Convert Lat/Lng to normalized 0-100 SVG coordinate percentages for the full corridor or custom bounds
export function geoToSvgCoords(
  lat: number,
  lng: number,
  bounds = {
    minLat: 17.910,
    maxLat: 18.100,
    minLng: -77.010,
    maxLng: -76.720
  }
): { x: number; y: number } {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  // Invert Y because SVG coordinates go top to bottom, but Latitude goes South to North
  const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    x: Math.max(4, Math.min(96, x)),
    y: Math.max(4, Math.min(96, y))
  };
}

// Find closest registered Jamaican community zone from given latitude and longitude
export function findNearestZone(
  lat: number,
  lng: number
): { zone: ZoneGeo; distanceKm: number } {
  let nearestZone: ZoneGeo = ALL_ZONES_GEO['New Kingston'];
  let minDistance = Infinity;

  for (const key of Object.keys(ALL_ZONES_GEO)) {
    const zone = ALL_ZONES_GEO[key];
    const dist = calculateDistanceKm(lat, lng, zone.lat, zone.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestZone = zone;
    }
  }

  return {
    zone: nearestZone,
    distanceKm: minDistance
  };
}

// Check whether given coordinates fall roughly within the island of Jamaica
export function isCoordinatesInJamaica(lat: number, lng: number): boolean {
  return lat >= 17.5 && lat <= 18.7 && lng >= -78.6 && lng <= -76.0;
}

// Default fallback sample GPS for Kingston testing
export const JAMAICA_DEMO_LOCATIONS = [
  { name: 'Half-Way-Tree Clock Tower (Kingston 10)', lat: 18.0125, lng: -76.7978 },
  { name: 'New Kingston Business District (Kingston 5)', lat: 18.0074, lng: -76.7836 },
  { name: 'Liguanea Sovereign Centre (St Andrew)', lat: 18.0163, lng: -76.7584 },
  { name: 'Portmore Pines Plaza (St Catherine)', lat: 17.9580, lng: -76.8780 },
  { name: 'Spanish Town Hospital / Square (St Catherine)', lat: 17.9915, lng: -76.9530 }
];

