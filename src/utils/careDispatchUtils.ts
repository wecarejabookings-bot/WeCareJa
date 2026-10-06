import { NurseProfile } from '../types';

export interface DispatchTierOption {
  id: 'standard' | 'comfort' | 'urgent' | 'assist';
  name: string;
  subtitle: string;
  basePriceJMD: number;
  etaMinutes: number;
  badge: string;
  iconName: 'heart' | 'stethoscope' | 'zap' | 'users';
  color: string;
  suitableCareLevel: string;
  description: string;
}

export const DISPATCH_TIERS: DispatchTierOption[] = [
  {
    id: 'standard',
    name: 'WeCare Standard',
    subtitle: 'Everyday Caregiver & Practical Nurse Aide',
    basePriceJMD: 4500,
    etaMinutes: 9,
    badge: 'Most Affordable',
    iconName: 'heart',
    color: '#3B82F6',
    suitableCareLevel: 'practical_nurse_aide',
    description: 'Assistance with vital checks, routine medication administration, hygiene, companionship, and mobility.'
  },
  {
    id: 'comfort',
    name: 'WeCare Comfort',
    subtitle: 'NCJ Licensed Registered Nurse (RN)',
    basePriceJMD: 7500,
    etaMinutes: 7,
    badge: 'Popular • Clinical Grade',
    iconName: 'stethoscope',
    color: '#10B981',
    suitableCareLevel: 'registered_nurse',
    description: 'Sterile surgical wound debridement, IV infusions, injections, catheter care, and doctor-ordered clinical care.'
  },
  {
    id: 'urgent',
    name: 'WeCare Priority / Urgent',
    subtitle: 'Rapid Response Emergency & ICU Nurse',
    basePriceJMD: 11000,
    etaMinutes: 4,
    badge: '⚡ Under 10 Mins',
    iconName: 'zap',
    color: '#F59E0B',
    suitableCareLevel: 'nurse_practitioner',
    description: 'Immediate clinical triage dispatch with acute stabilization gear, emergency vital monitoring, and rapid protocol.'
  },
  {
    id: 'assist',
    name: 'WeCare Assist',
    subtitle: 'Dual-Caregiver Transfer & Bariatric Team',
    basePriceJMD: 9800,
    etaMinutes: 12,
    badge: '2-Caregiver Team',
    iconName: 'users',
    color: '#8B5CF6',
    suitableCareLevel: 'geriatric_caregiver',
    description: 'Two synchronized caregivers dispatched for safe bedbound patient turning, fall prevention, and wheelchair transfers.'
  }
];

export interface SavedLocationPreset {
  id: string;
  label: string;
  address: string;
  zone: string;
  lat: number;
  lng: number;
  tag: 'home' | 'family' | 'work';
}

export const SAVED_LOCATIONS: SavedLocationPreset[] = [
  {
    id: 'loc-home',
    label: 'Home',
    address: '14 Trafalgar Road, New Kingston, Kingston 5',
    zone: 'New Kingston',
    lat: 18.0074,
    lng: -76.7836,
    tag: 'home'
  },
  {
    id: 'loc-mom',
    label: "Mom's Residence",
    address: '22 Hopefield Avenue, Barbican, Kingston 6',
    zone: 'Barbican & Cherry Gardens',
    lat: 18.0261,
    lng: -76.7681,
    tag: 'family'
  },
  {
    id: 'loc-office',
    label: 'Office',
    address: '8 Knutsford Boulevard, New Kingston, Kingston 5',
    zone: 'New Kingston',
    lat: 18.0051,
    lng: -76.7850,
    tag: 'work'
  },
  {
    id: 'loc-mona',
    label: 'Mona Family House',
    address: '18 Mona Road, Liguanea, Kingston 7',
    zone: 'Liguanea & Mona',
    lat: 18.0163,
    lng: -76.7554,
    tag: 'family'
  }
];

export function generateSafetyPin(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return digits.toString();
}

const FAVORITES_STORAGE_KEY = 'wecare_favorite_nurses';

export function getFavoriteNurseIds(): string[] {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse favorite nurses', e);
  }
  // Default favorites (clean launch)
  return [];
}

export function toggleFavoriteNurse(nurseId: string): boolean {
  const favorites = getFavoriteNurseIds();
  const exists = favorites.includes(nurseId);
  const updated = exists ? favorites.filter(id => id !== nurseId) : [...favorites, nurseId];
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save favorite nurses', e);
  }
  return !exists;
}

export function isNurseFavorite(nurseId: string): boolean {
  return getFavoriteNurseIds().includes(nurseId);
}
