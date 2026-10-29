import { calculateDistanceKm, estimateTransitMinutes } from './geoData';

export interface PoliceStation {
  id: string;
  name: string;
  division: string;
  parish: 'Kingston & St. Andrew' | 'St. Catherine';
  address: string;
  primaryPhone: string;
  secondaryPhone?: string;
  lat: number;
  lng: number;
  keyServiceAreas: string[];
}

export interface NearbyPoliceStationResult extends PoliceStation {
  distanceKm: number;
  estimatedDriveMinutes: number;
}

export const JAMAICA_POLICE_STATIONS: PoliceStation[] = [
  {
    id: 'half-way-tree',
    name: 'Half-Way Tree Police Station',
    division: 'St. Andrew Central',
    parish: 'Kingston & St. Andrew',
    address: '100 Hope Road, Kingston 10',
    primaryPhone: '(876) 926-8184',
    secondaryPhone: '(876) 926-8185',
    lat: 18.0125,
    lng: -76.7990,
    keyServiceAreas: ['Half-Way Tree', 'New Kingston', 'Trafalgar', 'Hope Road', 'Kingston 10']
  },
  {
    id: 'new-kingston-post',
    name: 'New Kingston Police Post',
    division: 'St. Andrew Central',
    parish: 'Kingston & St. Andrew',
    address: 'Knutsford Boulevard, Kingston 5',
    primaryPhone: '(876) 926-3508',
    lat: 18.0065,
    lng: -76.7865,
    keyServiceAreas: ['New Kingston', 'Knutsford Boulevard', 'Trafalgar Road', 'Oxford Road', 'Kingston 5']
  },
  {
    id: 'matildas-corner',
    name: "Matilda's Corner Police Station",
    division: 'St. Andrew Central',
    parish: 'Kingston & St. Andrew',
    address: '15 Northside Drive, Kingston 6',
    primaryPhone: '(876) 978-6003',
    secondaryPhone: '(876) 927-4437',
    lat: 18.0248,
    lng: -76.7645,
    keyServiceAreas: ['Liguanea', 'Mona', 'Barbican', 'Hope Pastures', 'Cherry Gardens', 'Kingston 6']
  },
  {
    id: 'constant-spring',
    name: 'Constant Spring Police Station',
    division: 'St. Andrew North',
    parish: 'Kingston & St. Andrew',
    address: '120 Constant Spring Road, Kingston 8',
    primaryPhone: '(876) 924-1421',
    secondaryPhone: '(876) 924-1435',
    lat: 18.0495,
    lng: -76.7924,
    keyServiceAreas: ['Constant Spring', 'Manor Park', 'Norbrook', 'Cassia Park', 'Kingston 8']
  },
  {
    id: 'cross-roads',
    name: 'Cross Roads Police Station',
    division: 'Kingston Central',
    parish: 'Kingston & St. Andrew',
    address: 'Cross Roads, Kingston 5',
    primaryPhone: '(876) 926-6657',
    lat: 17.9895,
    lng: -76.7885,
    keyServiceAreas: ['Cross Roads', 'Vineyard Town', 'Allman Town', 'Kingston 5']
  },
  {
    id: 'central-police',
    name: 'Central Police Station (Downtown)',
    division: 'Kingston Central',
    parish: 'Kingston & St. Andrew',
    address: 'East Queen Street, Downtown Kingston',
    primaryPhone: '(876) 922-0308',
    secondaryPhone: '(876) 922-5408',
    lat: 17.9735,
    lng: -76.7890,
    keyServiceAreas: ['Downtown Kingston', 'Waterfront', 'Orange Street', 'Parade', 'Kingston CSO']
  },
  {
    id: 'papine-police',
    name: 'Papine Police Station',
    division: 'St. Andrew Central',
    parish: 'Kingston & St. Andrew',
    address: 'Papine Square, Kingston 7',
    primaryPhone: '(876) 927-2047',
    lat: 18.0090,
    lng: -76.7460,
    keyServiceAreas: ['Papine', 'Mona', 'UWI Mona', 'UTech', 'Kintyre', 'Kingston 7']
  },
  {
    id: 'duhaney-park',
    name: 'Duhaney Park Police Station',
    division: 'St. Andrew South',
    parish: 'Kingston & St. Andrew',
    address: '82 Washington Boulevard, Kingston 20',
    primaryPhone: '(876) 933-4280',
    secondaryPhone: '(876) 933-2871',
    lat: 18.0260,
    lng: -76.8335,
    keyServiceAreas: ['Duhaney Park', 'Washington Boulevard', 'Pembroke Hall', 'Patrick City', 'Kingston 20']
  },
  {
    id: 'hunts-bay',
    name: 'Hunts Bay Police Station',
    division: 'St. Andrew South',
    parish: 'Kingston & St. Andrew',
    address: '136 Marcus Garvey Drive, Kingston 11',
    primaryPhone: '(876) 923-7111',
    secondaryPhone: '(876) 923-6197',
    lat: 17.9940,
    lng: -76.8220,
    keyServiceAreas: ['Marcus Garvey Drive', 'Three Miles', 'Olympic Gardens', 'Tower Hill', 'Kingston 11']
  },
  {
    id: 'stony-hill',
    name: 'Stony Hill Police Station',
    division: 'St. Andrew North',
    parish: 'Kingston & St. Andrew',
    address: 'Stony Hill Square, St. Andrew',
    primaryPhone: '(876) 942-2223',
    lat: 18.0820,
    lng: -76.7870,
    keyServiceAreas: ['Stony Hill', 'Golden Spring', 'Hermitage', 'Jacks Hill']
  },
  {
    id: 'red-hills',
    name: 'Red Hills Police Station',
    division: 'St. Andrew North',
    parish: 'Kingston & St. Andrew',
    address: 'Red Hills Square, St. Andrew',
    primaryPhone: '(876) 944-1594',
    lat: 18.0560,
    lng: -76.8450,
    keyServiceAreas: ['Red Hills', 'Belvedere', 'Rock Hall', 'Forest Hills']
  },
  {
    id: 'portmore-hundred-man',
    name: 'Portmore Police Station (Hundred Man)',
    division: 'St. Catherine South',
    parish: 'St. Catherine',
    address: 'Portmore Parkway, Portmore, St. Catherine',
    primaryPhone: '(876) 949-8422',
    secondaryPhone: '(876) 988-7505',
    lat: 17.9620,
    lng: -76.8830,
    keyServiceAreas: ['Portmore Pines', 'Naggo Head', 'Edgewater', 'Bridgeport', 'Caribbean Estate', 'Portmore']
  },
  {
    id: 'greater-portmore',
    name: 'Greater Portmore Police Station',
    division: 'St. Catherine South',
    parish: 'St. Catherine',
    address: '5 West, Greater Portmore, St. Catherine',
    primaryPhone: '(876) 989-0823',
    secondaryPhone: '(876) 989-8431',
    lat: 17.9540,
    lng: -76.9140,
    keyServiceAreas: ['Greater Portmore', 'Braeton', 'Hellshire', 'Westmeade', 'Portmore Country Club']
  },
  {
    id: 'waterford-police',
    name: 'Waterford Police Station',
    division: 'St. Catherine South',
    parish: 'St. Catherine',
    address: 'Waterford Parkway, Portmore, St. Catherine',
    primaryPhone: '(876) 988-1108',
    lat: 17.9810,
    lng: -76.8670,
    keyServiceAreas: ['Waterford', 'Independence City', 'Portsmouth', 'Caymanas']
  },
  {
    id: 'bridgeport-police',
    name: 'Bridgeport Police Station',
    division: 'St. Catherine South',
    parish: 'St. Catherine',
    address: 'Bridgeport, Portmore, St. Catherine',
    primaryPhone: '(876) 988-2697',
    lat: 17.9430,
    lng: -76.8680,
    keyServiceAreas: ['Bridgeport', 'Passagefort', 'West Cumberland', 'Garveymeade']
  },
  {
    id: 'spanish-town-central',
    name: 'Spanish Town Police Station',
    division: 'St. Catherine North',
    parish: 'St. Catherine',
    address: 'Burke Road, Spanish Town, St. Catherine',
    primaryPhone: '(876) 984-2305',
    secondaryPhone: '(876) 984-3158',
    lat: 17.9960,
    lng: -76.9535,
    keyServiceAreas: ['Spanish Town', 'Ensom City', 'Brunswick', 'St. Jago Heights', 'Eltham', 'Innswood']
  },
  {
    id: 'central-village-police',
    name: 'Central Village Police Station',
    division: 'St. Catherine North',
    parish: 'St. Catherine',
    address: 'Central Village, St. Catherine',
    primaryPhone: '(876) 984-2644',
    lat: 17.9940,
    lng: -76.9080,
    keyServiceAreas: ['Central Village', 'Twickenham Park', 'Mandela Highway', 'White Marl']
  }
];

/**
 * Finds the nearest Jamaica police stations to a given GPS coordinate or text address
 */
export function findNearestPoliceStations(
  userLat?: number | null,
  userLng?: number | null,
  addressHint?: string,
  limit = 4
): NearbyPoliceStationResult[] {
  // 1. If valid GPS coordinates are supplied, calculate actual geodesic distance
  if (userLat && userLng && userLat > 17 && userLat < 19 && userLng < -76 && userLng > -79) {
    const list = JAMAICA_POLICE_STATIONS.map((station) => {
      const distanceKm = calculateDistanceKm(userLat, userLng, station.lat, station.lng);
      const estimatedDriveMinutes = estimateTransitMinutes(distanceKm);
      return {
        ...station,
        distanceKm,
        estimatedDriveMinutes
      };
    });

    list.sort((a, b) => a.distanceKm - b.distanceKm);
    return list.slice(0, limit);
  }

  // 2. Keyword matching fallback based on location text
  const text = (addressHint || '').toLowerCase();
  
  let referenceLat = 18.0125; // Default Half-Way Tree / New Kingston
  let referenceLng = -76.7990;

  if (text.includes('portmore') || text.includes('braeton') || text.includes('hellshire') || text.includes('pines')) {
    referenceLat = 17.9620;
    referenceLng = -76.8830;
  } else if (text.includes('spanish town') || text.includes('ensom') || text.includes('jago') || text.includes('innswood')) {
    referenceLat = 17.9960;
    referenceLng = -76.9535;
  } else if (text.includes('constant spring') || text.includes('manor park') || text.includes('norbrook') || text.includes('cherry')) {
    referenceLat = 18.0495;
    referenceLng = -76.7924;
  } else if (text.includes('liguanea') || text.includes('mona') || text.includes('papine') || text.includes('barbican')) {
    referenceLat = 18.0248;
    referenceLng = -76.7645;
  } else if (text.includes('downtown') || text.includes('waterfront') || text.includes('cross roads')) {
    referenceLat = 17.9895;
    referenceLng = -76.7885;
  }

  const list = JAMAICA_POLICE_STATIONS.map((station) => {
    const distanceKm = calculateDistanceKm(referenceLat, referenceLng, station.lat, station.lng);
    const estimatedDriveMinutes = estimateTransitMinutes(distanceKm);
    return {
      ...station,
      distanceKm,
      estimatedDriveMinutes
    };
  });

  list.sort((a, b) => a.distanceKm - b.distanceKm);
  return list.slice(0, limit);
}
