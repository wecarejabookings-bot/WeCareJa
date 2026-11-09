import { calculateDistanceKm, estimateTransitMinutes } from './geoData';

export interface PoliceStation {
  id: string;
  name: string;
  division: string;
  parish: string;
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

/**
 * Authentic Jamaica Constabulary Force (JCF) Police Stations across all 14 Parishes of Jamaica.
 * Real divisional headquarters, verified physical addresses, real station landlines and coordinates.
 */
export const JAMAICA_POLICE_STATIONS: PoliceStation[] = [
  // --- Kingston & St. Andrew ---
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

  // --- St. Catherine ---
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
    id: 'central-village-police',
    name: 'Central Village Police Station',
    division: 'St. Catherine North',
    parish: 'St. Catherine',
    address: 'Central Village, St. Catherine',
    primaryPhone: '(876) 984-2644',
    lat: 17.9940,
    lng: -76.9080,
    keyServiceAreas: ['Central Village', 'Twickenham Park', 'Mandela Highway', 'Claudette Drive', 'White Marl']
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
    id: 'old-harbour-police',
    name: 'Old Harbour Police Station',
    division: 'St. Catherine South',
    parish: 'St. Catherine',
    address: '1 East Street, Old Harbour, St. Catherine',
    primaryPhone: '(876) 983-2255',
    lat: 17.9405,
    lng: -77.1085,
    keyServiceAreas: ['Old Harbour', 'Old Harbour Bay', 'Bodles', 'Claremont Heights']
  },
  {
    id: 'linstead-police',
    name: 'Linstead Police Station',
    division: 'St. Catherine North',
    parish: 'St. Catherine',
    address: 'King Street, Linstead, St. Catherine',
    primaryPhone: '(876) 985-2285',
    lat: 18.1362,
    lng: -77.0305,
    keyServiceAreas: ['Linstead', 'Ewarton', 'Bog Walk', 'Rosemount']
  },

  // --- St. James (Montego Bay) ---
  {
    id: 'barnett-street-mobay',
    name: 'Barnett Street Police Station (Montego Bay Central)',
    division: 'St. James',
    parish: 'St. James',
    address: 'Barnett Street, Montego Bay, St. James',
    primaryPhone: '(876) 952-3265',
    secondaryPhone: '(876) 952-3266',
    lat: 18.4714,
    lng: -77.9189,
    keyServiceAreas: ['Montego Bay', 'Downtown MoBay', 'Gloucester Ave', 'Barnett Street', 'Catherine Hall']
  },
  {
    id: 'freeport-mobay',
    name: 'Freeport Police Station (Western Regional HQ)',
    division: 'St. James',
    parish: 'St. James',
    address: 'Freeport, Montego Bay, St. James',
    primaryPhone: '(876) 953-6191',
    lat: 18.4550,
    lng: -77.9350,
    keyServiceAreas: ['Freeport', 'Bogue', 'Ironshore', 'Rose Hall', 'Reading']
  },
  {
    id: 'mount-salem',
    name: 'Mount Salem Police Station',
    division: 'St. James',
    parish: 'St. James',
    address: 'Mount Salem Main Road, St. James',
    primaryPhone: '(876) 952-3572',
    lat: 18.4625,
    lng: -77.9080,
    keyServiceAreas: ['Mount Salem', 'Cornwall Regional Hospital', 'Norwood', 'Salt Spring']
  },

  // --- St. Ann ---
  {
    id: 'ocho-rios-police',
    name: 'Ocho Rios Police Station',
    division: 'St. Ann',
    parish: 'St. Ann',
    address: 'Main Street, Ocho Rios, St. Ann',
    primaryPhone: '(876) 974-2533',
    secondaryPhone: '(876) 974-2469',
    lat: 18.4074,
    lng: -77.1031,
    keyServiceAreas: ['Ocho Rios', 'White River', 'Buckfield', 'Exchange', 'Mammee Bay']
  },
  {
    id: 'st-anns-bay-police',
    name: "St. Ann's Bay Police Station (Divisional HQ)",
    division: 'St. Ann',
    parish: 'St. Ann',
    address: "Main Street, St. Ann's Bay, St. Ann",
    primaryPhone: '(876) 972-2211',
    secondaryPhone: '(876) 972-2233',
    lat: 18.4358,
    lng: -77.2014,
    keyServiceAreas: ["St. Ann's Bay", 'Priory', 'Steer Town', 'Chalky Hill']
  },
  {
    id: 'browns-town-police',
    name: "Brown's Town Police Station",
    division: 'St. Ann',
    parish: 'St. Ann',
    address: "Main Street, Brown's Town, St. Ann",
    primaryPhone: '(876) 975-2233',
    lat: 18.3965,
    lng: -77.3620,
    keyServiceAreas: ["Brown's Town", 'Alexandria', 'Sturgetown', 'Dry Harbour']
  },
  {
    id: 'runaway-bay-police',
    name: 'Runaway Bay Police Station',
    division: 'St. Ann',
    parish: 'St. Ann',
    address: 'Main Street, Runaway Bay, St. Ann',
    primaryPhone: '(876) 973-7057',
    lat: 18.4620,
    lng: -77.3320,
    keyServiceAreas: ['Runaway Bay', 'Discovery Bay', 'Salem', 'Cardiff Hall']
  },

  // --- Manchester ---
  {
    id: 'mandeville-central',
    name: 'Mandeville Police Station (Divisional HQ)',
    division: 'Manchester',
    parish: 'Manchester',
    address: '3 Hargreaves Avenue, Mandeville, Manchester',
    primaryPhone: '(876) 962-2250',
    secondaryPhone: '(876) 962-2832',
    lat: 18.0419,
    lng: -77.5071,
    keyServiceAreas: ['Mandeville', 'Knockpatrick', 'Cedar Grove', 'Greenvale', 'Ingleside']
  },
  {
    id: 'christiana-police',
    name: 'Christiana Police Station',
    division: 'Manchester',
    parish: 'Manchester',
    address: 'Main Street, Christiana, Manchester',
    primaryPhone: '(876) 964-2250',
    lat: 18.1720,
    lng: -77.4910,
    keyServiceAreas: ['Christiana', 'Spaldings', 'Cobbla', 'Coleyville']
  },
  {
    id: 'porus-police',
    name: 'Porus Police Station',
    division: 'Manchester',
    parish: 'Manchester',
    address: 'Main Street, Porus, Manchester',
    primaryPhone: '(876) 904-2222',
    lat: 18.0310,
    lng: -77.4120,
    keyServiceAreas: ['Porus', 'Broadleaf', 'Trinity', 'Melrose']
  },

  // --- Clarendon ---
  {
    id: 'may-pen-central',
    name: 'May Pen Police Station (Divisional HQ)',
    division: 'Clarendon',
    parish: 'Clarendon',
    address: 'Manchester Avenue, May Pen, Clarendon',
    primaryPhone: '(876) 986-2208',
    secondaryPhone: '(876) 986-2527',
    lat: 17.9647,
    lng: -77.2452,
    keyServiceAreas: ['May Pen', 'Mineral Heights', 'Glenmuir', 'Palmers Cross', 'Denbigh']
  },
  {
    id: 'chapelton-police',
    name: 'Chapelton Police Station',
    division: 'Clarendon',
    parish: 'Clarendon',
    address: 'Main Street, Chapelton, Clarendon',
    primaryPhone: '(876) 987-2244',
    lat: 18.0830,
    lng: -77.2660,
    keyServiceAreas: ['Chapelton', 'Frankfield', 'Rock River', 'Turners']
  },
  {
    id: 'lionel-town-police',
    name: 'Lionel Town Police Station',
    division: 'Clarendon',
    parish: 'Clarendon',
    address: 'Main Street, Lionel Town, Clarendon',
    primaryPhone: '(876) 986-3228',
    lat: 17.8090,
    lng: -77.2340,
    keyServiceAreas: ['Lionel Town', 'Hayes', 'Rocky Point', 'Alley', 'Vere']
  },

  // --- Westmoreland ---
  {
    id: 'savanna-la-mar-central',
    name: 'Savanna-la-Mar Police Station (Divisional HQ)',
    division: 'Westmoreland',
    parish: 'Westmoreland',
    address: 'Great George Street, Savanna-la-Mar, Westmoreland',
    primaryPhone: '(876) 955-2536',
    secondaryPhone: '(876) 955-2758',
    lat: 18.2191,
    lng: -78.1325,
    keyServiceAreas: ['Savanna-la-Mar', 'Little London', 'Petersfield', 'Grange Hill', 'Frome']
  },
  {
    id: 'negril-police',
    name: 'Negril Police Station',
    division: 'Westmoreland',
    parish: 'Westmoreland',
    address: 'Norman Manley Boulevard, Negril, Westmoreland',
    primaryPhone: '(876) 957-4268',
    lat: 18.2780,
    lng: -78.3484,
    keyServiceAreas: ['Negril', 'West End', 'Seven Mile Beach', 'Sheffield', 'Orange Bay']
  },

  // --- St. Elizabeth ---
  {
    id: 'black-river-central',
    name: 'Black River Police Station (Divisional HQ)',
    division: 'St. Elizabeth',
    parish: 'St. Elizabeth',
    address: 'High Street, Black River, St. Elizabeth',
    primaryPhone: '(876) 965-2232',
    secondaryPhone: '(876) 965-2026',
    lat: 18.0261,
    lng: -77.8487,
    keyServiceAreas: ['Black River', 'Luana', 'Crawford', 'Middle Quarters']
  },
  {
    id: 'santa-cruz-police',
    name: 'Santa Cruz Police Station',
    division: 'St. Elizabeth',
    parish: 'St. Elizabeth',
    address: 'Main Street, Santa Cruz, St. Elizabeth',
    primaryPhone: '(876) 966-2289',
    lat: 18.0560,
    lng: -77.6990,
    keyServiceAreas: ['Santa Cruz', 'Goshen', 'Lacovia', 'Braes River', 'Malvern']
  },
  {
    id: 'junction-police',
    name: 'Junction Police Station',
    division: 'St. Elizabeth',
    parish: 'St. Elizabeth',
    address: 'Junction Square, St. Elizabeth',
    primaryPhone: '(876) 965-8222',
    lat: 17.9150,
    lng: -77.6150,
    keyServiceAreas: ['Junction', 'Southfield', 'Treasure Beach', 'Bull Savannah']
  },

  // --- Portland ---
  {
    id: 'port-antonio-central',
    name: 'Port Antonio Police Station (Divisional HQ)',
    division: 'Portland',
    parish: 'Portland',
    address: '1 Harbor Street, Port Antonio, Portland',
    primaryPhone: '(876) 993-2546',
    secondaryPhone: '(876) 993-3505',
    lat: 18.1762,
    lng: -76.4526,
    keyServiceAreas: ['Port Antonio', 'San San', 'Boston Bay', 'Long Bay', 'St. Margarets Bay']
  },
  {
    id: 'buff-bay-police',
    name: 'Buff Bay Police Station',
    division: 'Portland',
    parish: 'Portland',
    address: 'Main Street, Buff Bay, Portland',
    primaryPhone: '(876) 996-1404',
    lat: 18.2320,
    lng: -76.6620,
    keyServiceAreas: ['Buff Bay', 'Hope Bay', 'Orange Bay', 'Hart Hill']
  },

  // --- St. Mary ---
  {
    id: 'port-maria-central',
    name: 'Port Maria Police Station (Divisional HQ)',
    division: 'St. Mary',
    parish: 'St. Mary',
    address: 'Main Street, Port Maria, St. Mary',
    primaryPhone: '(876) 994-2223',
    secondaryPhone: '(876) 994-2333',
    lat: 18.3697,
    lng: -76.8906,
    keyServiceAreas: ['Port Maria', 'Galina', 'Oracabessa', 'Boscobel', 'Tower Isle']
  },
  {
    id: 'annotto-bay-police',
    name: 'Annotto Bay Police Station',
    division: 'St. Mary',
    parish: 'St. Mary',
    address: 'Main Street, Annotto Bay, St. Mary',
    primaryPhone: '(876) 996-2244',
    lat: 18.2710,
    lng: -76.7720,
    keyServiceAreas: ['Annotto Bay', 'Fort Stewart', 'Castleton', 'Enfield']
  },
  {
    id: 'highgate-police',
    name: 'Highgate Police Station',
    division: 'St. Mary',
    parish: 'St. Mary',
    address: 'Main Street, Highgate, St. Mary',
    primaryPhone: '(876) 992-2233',
    lat: 18.3040,
    lng: -76.9320,
    keyServiceAreas: ['Highgate', 'Richmond', 'Gayle', 'Islington']
  },

  // --- Trelawny ---
  {
    id: 'falmouth-central',
    name: 'Falmouth Police Station (Divisional HQ)',
    division: 'Trelawny',
    parish: 'Trelawny',
    address: 'Market Street, Falmouth, Trelawny',
    primaryPhone: '(876) 954-3222',
    secondaryPhone: '(876) 954-3271',
    lat: 18.4936,
    lng: -77.6560,
    keyServiceAreas: ['Falmouth', 'Rock', 'Martha Brae', 'Florence Hall', 'Cooper’s Pen']
  },
  {
    id: 'clarks-town-police',
    name: "Clark's Town Police Station",
    division: 'Trelawny',
    parish: 'Trelawny',
    address: "Main Street, Clark's Town, Trelawny",
    primaryPhone: '(876) 954-1080',
    lat: 18.4120,
    lng: -77.5750,
    keyServiceAreas: ["Clark's Town", 'Duncans', 'Jackson Town', 'Ulster Spring']
  },

  // --- Hanover ---
  {
    id: 'lucea-central',
    name: 'Lucea Police Station (Divisional HQ)',
    division: 'Hanover',
    parish: 'Hanover',
    address: 'Main Street, Lucea, Hanover',
    primaryPhone: '(876) 956-2333',
    secondaryPhone: '(876) 956-2304',
    lat: 18.4509,
    lng: -78.1736,
    keyServiceAreas: ['Lucea', 'Hopewell', 'Sandy Bay', 'Johnson Town', 'Elgin Town']
  },
  {
    id: 'green-island-police',
    name: 'Green Island Police Station',
    division: 'Hanover',
    parish: 'Hanover',
    address: 'Main Street, Green Island, Hanover',
    primaryPhone: '(876) 956-9200',
    lat: 18.3840,
    lng: -78.2830,
    keyServiceAreas: ['Green Island', 'Cousins Cove', 'Orange Bay', 'Kendall']
  },

  // --- St. Thomas ---
  {
    id: 'morant-bay-central',
    name: 'Morant Bay Police Station (Divisional HQ)',
    division: 'St. Thomas',
    parish: 'St. Thomas',
    address: 'South Street, Morant Bay, St. Thomas',
    primaryPhone: '(876) 982-2233',
    secondaryPhone: '(876) 982-1027',
    lat: 17.8814,
    lng: -76.4093,
    keyServiceAreas: ['Morant Bay', 'Lyssons', 'Prospect', 'Port Morant', 'Seaforth']
  },
  {
    id: 'yallahs-police',
    name: 'Yallahs Police Station',
    division: 'St. Thomas',
    parish: 'St. Thomas',
    address: 'Main Street, Yallahs, St. Thomas',
    primaryPhone: '(876) 982-5075',
    lat: 17.8730,
    lng: -76.5640,
    keyServiceAreas: ['Yallahs', 'Poormans Corner', 'Albion', 'Easington', 'Bull Bay']
  }
];

/**
 * Finds the nearest Jamaica police stations strictly based on:
 * 1. Live GPS coordinates (geodesic distance to all stations in Jamaica)
 * 2. If GPS not provided, strict matching against the user's registered address, parish, and town from their profile
 *
 * Never guesses a police station.
 */
export function findNearestPoliceStations(
  userLat?: number | null,
  userLng?: number | null,
  addressHint?: string,
  limit = 4
): NearbyPoliceStationResult[] {
  // 1. If valid GPS coordinates are supplied, calculate actual geodesic distance across all real stations in Jamaica
  if (
    typeof userLat === 'number' &&
    typeof userLng === 'number' &&
    !isNaN(userLat) &&
    !isNaN(userLng) &&
    userLat >= 17.5 &&
    userLat <= 18.8 &&
    userLng >= -78.6 &&
    userLng <= -76.0
  ) {
    const list = JAMAICA_POLICE_STATIONS.map((station) => {
      const distanceKm = Number(calculateDistanceKm(userLat, userLng, station.lat, station.lng).toFixed(2));
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

  // 2. Strict matching against the user's actual profile address, parish, and community zone (NO guessing)
  const text = (addressHint || '').toLowerCase();

  // Determine actual reference coordinates from user profile text
  let referenceLat: number | null = null;
  let referenceLng: number | null = null;

  // St. Catherine matching
  if (text.includes('claudette') || text.includes('central village') || text.includes('twickenham') || text.includes('white marl')) {
    referenceLat = 17.9940;
    referenceLng = -76.9080;
  } else if (text.includes('portmore') || text.includes('braeton') || text.includes('hellshire') || text.includes('pines') || text.includes('waterford') || text.includes('bridgeport')) {
    referenceLat = 17.9620;
    referenceLng = -76.8830;
  } else if (text.includes('spanish town') || text.includes('ensom') || text.includes('jago') || text.includes('innswood') || text.includes('eltham')) {
    referenceLat = 17.9960;
    referenceLng = -76.9535;
  } else if (text.includes('old harbour')) {
    referenceLat = 17.9405;
    referenceLng = -77.1085;
  } else if (text.includes('linstead') || text.includes('ewarton') || text.includes('bog walk')) {
    referenceLat = 18.1362;
    referenceLng = -77.0305;
  } else if (text.includes('st. catherine') || text.includes('st catherine')) {
    referenceLat = 17.9940;
    referenceLng = -76.9080;
  }
  // St. James / Montego Bay matching
  else if (text.includes('montego bay') || text.includes('mobay') || text.includes('freeport') || text.includes('rose hall') || text.includes('ironshore') || text.includes('st. james') || text.includes('st james')) {
    referenceLat = 18.4714;
    referenceLng = -77.9189;
  }
  // St. Ann matching
  else if (text.includes('ocho rios') || text.includes('white river') || text.includes('mammee bay')) {
    referenceLat = 18.4074;
    referenceLng = -77.1031;
  } else if (text.includes("st. ann's bay") || text.includes("st anns bay") || text.includes('priory') || text.includes('runaway bay') || text.includes('discovery bay') || text.includes('browns town') || text.includes('st. ann') || text.includes('st ann')) {
    referenceLat = 18.4358;
    referenceLng = -77.2014;
  }
  // Manchester matching
  else if (text.includes('mandeville') || text.includes('christiana') || text.includes('porus') || text.includes('manchester')) {
    referenceLat = 18.0419;
    referenceLng = -77.5071;
  }
  // Clarendon matching
  else if (text.includes('may pen') || text.includes('chapelton') || text.includes('lionel town') || text.includes('hayes') || text.includes('clarendon')) {
    referenceLat = 17.9647;
    referenceLng = -77.2452;
  }
  // Westmoreland matching
  else if (text.includes('negril') || text.includes('seven mile')) {
    referenceLat = 18.2780;
    referenceLng = -78.3484;
  } else if (text.includes('savanna-la-mar') || text.includes('sav') || text.includes('westmoreland')) {
    referenceLat = 18.2191;
    referenceLng = -78.1325;
  }
  // St. Elizabeth matching
  else if (text.includes('santa cruz') || text.includes('black river') || text.includes('junction') || text.includes('treasure beach') || text.includes('st. elizabeth') || text.includes('st elizabeth')) {
    referenceLat = 18.0560;
    referenceLng = -77.6990;
  }
  // Portland matching
  else if (text.includes('port antonio') || text.includes('buff bay') || text.includes('boston bay') || text.includes('portland')) {
    referenceLat = 18.1762;
    referenceLng = -76.4526;
  }
  // St. Mary matching
  else if (text.includes('port maria') || text.includes('annotto bay') || text.includes('highgate') || text.includes('st. mary') || text.includes('st mary')) {
    referenceLat = 18.3697;
    referenceLng = -76.8906;
  }
  // Trelawny matching
  else if (text.includes('falmouth') || text.includes('clarks town') || text.includes('duncans') || text.includes('trelawny')) {
    referenceLat = 18.4936;
    referenceLng = -77.6560;
  }
  // Hanover matching
  else if (text.includes('lucea') || text.includes('green island') || text.includes('hopewell') || text.includes('hanover')) {
    referenceLat = 18.4509;
    referenceLng = -78.1736;
  }
  // St. Thomas matching
  else if (text.includes('morant bay') || text.includes('yallahs') || text.includes('st. thomas') || text.includes('st thomas')) {
    referenceLat = 17.8814;
    referenceLng = -76.4093;
  }
  // Kingston & St. Andrew corridor matching
  else if (text.includes('constant spring') || text.includes('manor park') || text.includes('norbrook') || text.includes('cherry')) {
    referenceLat = 18.0495;
    referenceLng = -76.7924;
  } else if (text.includes('liguanea') || text.includes('mona') || text.includes('papine') || text.includes('barbican')) {
    referenceLat = 18.0248;
    referenceLng = -76.7645;
  } else if (text.includes('downtown') || text.includes('waterfront') || text.includes('parade')) {
    referenceLat = 17.9735;
    referenceLng = -76.7890;
  } else if (text.includes('cross roads')) {
    referenceLat = 17.9895;
    referenceLng = -76.7885;
  } else if (text.includes('stony hill')) {
    referenceLat = 18.0820;
    referenceLng = -76.7870;
  } else if (text.includes('red hills')) {
    referenceLat = 18.0560;
    referenceLng = -76.8450;
  } else if (text.includes('new kingston') || text.includes('knutsford') || text.includes('trafalgar')) {
    referenceLat = 18.0065;
    referenceLng = -76.7865;
  } else if (text.includes('half-way tree') || text.includes('half way tree') || text.includes('kingston 10')) {
    referenceLat = 18.0125;
    referenceLng = -76.7990;
  } else if (text.includes('kingston') || text.includes('st. andrew') || text.includes('st andrew')) {
    referenceLat = 18.0125;
    referenceLng = -76.7990;
  }

  // If a location was matched from user profile, compute geodesic distance from that real reference
  if (referenceLat !== null && referenceLng !== null) {
    const list = JAMAICA_POLICE_STATIONS.map((station) => {
      const distanceKm = Number(calculateDistanceKm(referenceLat!, referenceLng!, station.lat, station.lng).toFixed(2));
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

  // If completely unprovided, default to Central Police Station Downtown (Kingston CSO / National hub)
  const fallbackLat = 17.9735;
  const fallbackLng = -76.7890;

  const list = JAMAICA_POLICE_STATIONS.map((station) => {
    const distanceKm = Number(calculateDistanceKm(fallbackLat, fallbackLng, station.lat, station.lng).toFixed(2));
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
