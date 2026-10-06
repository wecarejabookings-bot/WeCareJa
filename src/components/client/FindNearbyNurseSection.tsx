import React, { useState, useMemo } from 'react';
import { NurseProfile, Booking, ServiceItem, NurseCareLevel } from '../../types';
import { ALL_ZONES_GEO, calculateDistanceKm, estimateTransitMinutes, JAMAICA_DEMO_LOCATIONS } from '../../data/geoData';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';
import { CaregiverTierBadge } from '../common/CaregiverTierBadge';
import { ScopeOfCareModal } from '../common/ScopeOfCareModal';
import { ServiceLogo } from '../common/ServiceLogo';
import { NurseProximityMap } from './NurseProximityMap';
import { KingstonCoverageMapView } from './KingstonCoverageMapView';
import { checkNurseBookingConflict } from '../../utils/bookingAvailability';
import { soundFX } from '../../utils/soundEffects';
import { VerifiedBadgeBreakdownModal } from '../common/VerifiedBadgeBreakdownModal';
import { 
  Crosshair, 
  MapPin, 
  Car, 
  Star, 
  ShieldCheck, 
  Clock, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RefreshCw, 
  Compass, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  ChevronRight, 
  Map as MapIcon, 
  LayoutGrid, 
  AlertCircle,
  Zap,
  Award,
  Layers,
  X,
  HeartHandshake,
  Ban,
  Calendar,
  AlertTriangle,
  Info,
  DollarSign,
  Radio,
  Moon,
  BadgeCheck
} from 'lucide-react';

interface FindNearbyNurseSectionProps {
  nurses: NurseProfile[];
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  selectedNurse: NurseProfile | null;
  onSelectNurse: (nurse: NurseProfile) => void;
  onViewNurseProfile: (nurse: NurseProfile) => void;
  onBookNurse?: (nurse: NurseProfile) => void;
  onToggleAvailability?: (nurse: NurseProfile) => void;
  gpsCoords: { lat: number; lng: number; accuracy?: number } | null;
  isGpsActive: boolean;
  isLocatingGps: boolean;
  gpsError: string | null;
  gpsNearestZone: { name: string; distanceKm: number } | null;
  onTriggerGps: () => void;
  onClearGps: () => void;
  onSetDemoGps: (loc: { name: string; lat: number; lng: number }) => void;
  viewMode: 'grid' | 'map';
  onChangeViewMode: (mode: 'grid' | 'map') => void;
  isBookingFlow?: boolean;
  onContinueBooking?: () => void;
  allBookings?: Booking[];
  requestedDate?: string;
  requestedTime?: string;
  durationMinutes?: number;
  selectedService?: ServiceItem | null;
}

export const FindNearbyNurseSection: React.FC<FindNearbyNurseSectionProps> = ({
  nurses,
  selectedZone,
  onSelectZone,
  selectedNurse,
  onSelectNurse,
  onViewNurseProfile,
  onBookNurse,
  onToggleAvailability,
  gpsCoords,
  isGpsActive,
  isLocatingGps,
  gpsError,
  gpsNearestZone,
  onTriggerGps,
  onClearGps,
  onSetDemoGps,
  viewMode,
  onChangeViewMode,
  isBookingFlow = false,
  onContinueBooking,
  allBookings = [],
  requestedDate,
  requestedTime,
  durationMinutes = 60,
  selectedService
}) => {
  const isPortmoreOrSpanishTown = selectedZone.toLowerCase().includes('portmore') || selectedZone.toLowerCase().includes('spanish town');
  const defaultZoneLockKm = isPortmoreOrSpanishTown ? 8 : 7;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'proximity' | 'rating' | 'experience' | 'price_asc' | 'price_desc'>('proximity');
  const [radiusFilterKm, setRadiusFilterKm] = useState<number>(defaultZoneLockKm);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [careLevelFilter, setCareLevelFilter] = useState<string>('all'); // 'all' | 'registered_nurse' | 'geriatric_caregiver'
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [kingstonAreaFilter, setKingstonAreaFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'on_call' | 'in_geofence'>('all');
  const [showDemoLocations, setShowDemoLocations] = useState<boolean>(false);
  const [showScopeModal, setShowScopeModal] = useState<boolean>(false);
  const [breakdownNurse, setBreakdownNurse] = useState<NurseProfile | null>(null);
  const [mapType, setMapType] = useState<'leaflet' | 'radar'>('leaflet');

  // Available approved nurses
  const approvedNurses = useMemo(() => {
    return nurses.filter(n => n.status === 'approved');
  }, [nurses]);

  // Extract all distinct specialties
  const availableSpecialties = useMemo(() => {
    const specs = new Set<string>();
    approvedNurses.forEach(n => {
      n.specialties.forEach(s => specs.add(s));
    });
    return Array.from(specs);
  }, [approvedNurses]);

  // Determine effective reference coordinates (Live GPS coordinates or selected parish zone)
  const effectiveLocation = useMemo(() => {
    if (isGpsActive && gpsCoords) {
      return {
        lat: gpsCoords.lat,
        lng: gpsCoords.lng,
        label: gpsNearestZone ? `GPS near ${gpsNearestZone.name}` : `GPS (${gpsCoords.lat.toFixed(3)}°, ${gpsCoords.lng.toFixed(3)}°)`,
        isGps: true
      };
    }
    const zGeo = ALL_ZONES_GEO[selectedZone] || ALL_ZONES_GEO['New Kingston'];
    return {
      lat: zGeo.lat,
      lng: zGeo.lng,
      label: selectedZone,
      isGps: false
    };
  }, [isGpsActive, gpsCoords, gpsNearestZone, selectedZone]);

  // Calculate distance & availability check for all nurses
  const targetDateStr = requestedDate || new Date().toISOString().split('T')[0];
  const targetTimeStr = requestedTime || '10:00';

  const enrichedNurses = useMemo(() => {
    return approvedNurses.map((nurse) => {
      const nLat = nurse.currentLat || effectiveLocation.lat + 0.01;
      const nLng = nurse.currentLng || effectiveLocation.lng + 0.01;
      const distanceKm = calculateDistanceKm(effectiveLocation.lat, effectiveLocation.lng, nLat, nLng);
      const transitMins = estimateTransitMinutes(distanceKm);

      // Check cross-booking availability
      const availability = checkNurseBookingConflict(
        nurse.id,
        targetDateStr,
        targetTimeStr,
        durationMinutes,
        allBookings
      );

      const isRN = nurse.careLevel === 'registered_nurse' || (!nurse.careLevel && nurse.requiresNcjRegistration !== false);
      const geofenceRadiusKm = nurse.geofenceRadiusKm || 15;
      const isWithinGeofence = distanceKm <= geofenceRadiusKm;
      const isOnCall = nurse.availabilityStatus !== 'offline';

      return {
        ...nurse,
        distanceKm,
        transitMins,
        inSelectedZone: nurse.zones.includes(selectedZone),
        availability,
        isRN,
        geofenceRadiusKm,
        isWithinGeofence,
        isOnCall
      };
    });
  }, [approvedNurses, effectiveLocation, selectedZone, targetDateStr, targetTimeStr, durationMinutes, allBookings]);

  // Filter and sort nurses based on user selections
  const filteredAndSortedNurses = useMemo(() => {
    return enrichedNurses
      .filter((nurse) => {
        // Availability & Geofence filter
        if (availabilityFilter === 'on_call' && !nurse.isOnCall) {
          return false;
        }
        if (availabilityFilter === 'in_geofence' && !nurse.isWithinGeofence) {
          return false;
        }

        // Distance radius filter
        if (radiusFilterKm < 900 && nurse.distanceKm > radiusFilterKm) {
          return false;
        }

        // Clinical Scope Restriction (Launch Pack Rule: Caregivers cannot accept clinical tasks)
        if (selectedService) {
          const serviceText = `${selectedService.name} ${selectedService.id} ${selectedService.description || ''}`.toLowerCase();
          const isClinicalTask = 
            selectedService.category === 'clinical' ||
            ['wound', 'iv', 'infusion', 'injection', 'catheter', 'blood', 'post-op', 'post_op', 'medication administration'].some(t => serviceText.includes(t));
          
          if (isClinicalTask && !nurse.isRN) {
            return false;
          }
        }
        // Region filter
        if (regionFilter === 'kingston' && !nurse.zones.some(z => !z.startsWith('Portmore') && !z.startsWith('Spanish Town'))) {
          return false;
        }
        if (regionFilter === 'portmore' && !nurse.zones.some(z => z.startsWith('Portmore'))) {
          return false;
        }
        if (regionFilter === 'spanish_town' && !nurse.zones.some(z => z.startsWith('Spanish Town'))) {
          return false;
        }
        // Care Level filter
        if (careLevelFilter === 'registered_nurse' && !nurse.isRN) {
          return false;
        }
        if (careLevelFilter === 'geriatric_caregiver' && nurse.isRN) {
          return false;
        }
        // Specialty filter
        if (specialtyFilter !== 'all' && !nurse.specialties.includes(specialtyFilter)) {
          return false;
        }
        // Rating filter
        if (ratingFilter !== 'all' && nurse.rating < parseFloat(ratingFilter)) {
          return false;
        }
        // Specific Kingston / parish area filter
        if (kingstonAreaFilter !== 'all' && !nurse.zones.some(z => z.toLowerCase().includes(kingstonAreaFilter.toLowerCase()))) {
          return false;
        }
        // Search query with intelligent clinical synonym recognition
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = nurse.name.toLowerCase().includes(q);
          const matchBio = nurse.bio.toLowerCase().includes(q);
          const matchSpec = nurse.specialties.some(s => {
            const sLower = s.toLowerCase();
            if (sLower.includes(q)) return true;
            // Clinical specialization synonym expansions
            if (q.includes('geriatric') && (sLower.includes('elderly') || sLower.includes('senior') || sLower.includes('dementia') || sLower.includes('bedridden'))) return true;
            if (q.includes('post-op') && (sLower.includes('surgical') || sLower.includes('recovery') || sLower.includes('wound'))) return true;
            if (q.includes('pediatric') && (sLower.includes('postnatal') || sLower.includes('newborn') || sLower.includes('child') || sLower.includes('pediatric'))) return true;
            if (q.includes('wound') && (sLower.includes('dressing') || sLower.includes('ulcer') || sLower.includes('recovery'))) return true;
            if (q.includes('medication') && (sLower.includes('diabetic') || sLower.includes('iv therapy') || sLower.includes('vitals') || sLower.includes('hypertension'))) return true;
            if (q.includes('palliative') && (sLower.includes('hospice') || sLower.includes('comfort') || sLower.includes('end of life') || sLower.includes('palliative'))) return true;
            return false;
          });
          const matchZone = nurse.zones.some(z => z.toLowerCase().includes(q));
          const matchQual = (nurse.qualificationTitle || '').toLowerCase().includes(q);
          if (!matchName && !matchBio && !matchSpec && !matchZone && !matchQual) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'proximity') {
          // Prioritize on-call nurses over offline nurses when sorting by proximity
          if (a.isOnCall !== b.isOnCall) {
            return a.isOnCall ? -1 : 1;
          }
          return a.distanceKm - b.distanceKm;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'experience') {
          return b.yearsExperience - a.yearsExperience;
        }
        if (sortBy === 'price_asc') {
          return a.hourlyRateJMD - b.hourlyRateJMD;
        }
        if (sortBy === 'price_desc') {
          return b.hourlyRateJMD - a.hourlyRateJMD;
        }
        return 0;
      });
  }, [enrichedNurses, radiusFilterKm, regionFilter, careLevelFilter, specialtyFilter, searchQuery, sortBy, ratingFilter, kingstonAreaFilter, availabilityFilter]);

  const formatJMD = (amount: number) => {
    return `JMD $${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Geolocation & Nearby Radar Banner */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-[#1E1B4B]/25 to-red-950/40 backdrop-blur-2xl border border-white/15 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1E1B4B]/50 text-purple-200 border border-purple-400/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C77DFF] animate-pulse" />
                <span>Jamaica Caregiver &amp; Nurse Proximity Radar</span>
              </span>
              
              {isGpsActive ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Browser GPS Active</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-300 border border-white/15">
                  Default Area: {selectedZone}
                </span>
              )}

              {requestedDate && requestedTime && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Slot: {requestedDate} @ {requestedTime}</span>
                </span>
              )}

              {selectedService && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-900/60 border border-purple-400/40 text-purple-200">
                  <ServiceLogo service={selectedService} size="xs" showBadge={false} />
                  <span className="text-[11px] font-bold text-white">
                    Selected: {selectedService.name}
                  </span>
                </div>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Select a Certified Caregiver or Registered Nurse
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              Choose between <strong>NCJ Registered Clinical Nurses</strong> (for IV, wound care &amp; surgical procedures) or <strong>Certified Geriatric Care Aides</strong> (for non-invasive ADLs, senior assistance &amp; companionship at affordable rates).
            </p>
          </div>

          {/* Quick Scope & Rate info button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowScopeModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <HeartHandshake className="w-4 h-4 text-cyan-400" />
              <span>Scope &amp; Pay Rates Guide</span>
            </button>

            <button
              type="button"
              onClick={onTriggerGps}
              disabled={isLocatingGps}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg"
            >
              <Crosshair className={`w-4 h-4 ${isLocatingGps ? 'animate-spin' : ''}`} />
              <span>{isLocatingGps ? 'Locating GPS...' : 'Update My GPS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH AND ADVANCED MULTI-TIER FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by practitioner name, specialty (e.g. Geriatric, Wound Care), zone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#170826] border border-white/15 text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-[#1E1B4B]/50 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* CARE LEVEL TIER FILTER PILLS */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto">
            <span className="text-[10px] text-slate-400 pl-2 font-bold uppercase tracking-wider whitespace-nowrap">Tier:</span>
            {[
              { id: 'all', label: 'All Caregivers' },
              { id: 'registered_nurse', label: 'NCJ Registered Nurses ($6.5k-$10.5k)' },
              { id: 'geriatric_caregiver', label: 'Geriatric Aides ($2.8k-$3.8k)' }
            ].map(tier => (
              <button
                key={tier.id}
                type="button"
                onClick={() => {
                  soundFX.playFilterSelect();
                  setCareLevelFilter(tier.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  careLevelFilter === tier.id
                    ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Clinical Specialization Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
          <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1 pr-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Clinical Specialties:</span>
          </span>
          {[
            { label: 'Geriatric Care', query: 'Geriatric' },
            { label: 'Post-Op Care', query: 'Post-Op' },
            { label: 'Pediatric Nursing', query: 'Pediatric' },
            { label: 'Wound Dressing', query: 'Wound Care' },
            { label: 'Palliative & Hospice', query: 'Palliative' },
            { label: 'Medication Mgmt', query: 'Medication' }
          ].map(spec => {
            const isActive = searchQuery.toLowerCase().includes(spec.query.toLowerCase()) || specialtyFilter.toLowerCase().includes(spec.query.toLowerCase());
            return (
              <button
                key={spec.label}
                type="button"
                onClick={() => {
                  soundFX.playFilterSelect();
                  if (isActive) {
                    setSearchQuery('');
                    setSpecialtyFilter('all');
                  } else {
                    setSearchQuery(spec.query);
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40 border border-emerald-300 font-black'
                    : 'bg-white/5 hover:bg-white/10 text-purple-200 border border-purple-400/20 hover:border-purple-400/40'
                }`}
              >
                <span>{spec.label}</span>
                {isActive && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
              </button>
            );
          })}
          {(searchQuery || specialtyFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSpecialtyFilter('all');
              }}
              className="text-[11px] text-slate-400 hover:text-white underline pl-1.5 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Second Row: Region, Specialty, Rating, Radius & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Region Filter */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
              {[
                { id: 'all', label: 'All Regions' },
                { id: 'kingston', label: 'Kingston & St Andrew' },
                { id: 'portmore', label: 'Portmore' },
                { id: 'spanish_town', label: 'Spanish Town' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    soundFX.playFilterSelect();
                    setRegionFilter(r.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    regionFilter === r.id
                      ? 'bg-[#1E1B4B] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Specialty Filter */}
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#170826] border border-white/15 text-white text-xs font-semibold focus:ring-2 focus:ring-[#1E1B4B]/50 focus:outline-none"
            >
              <option value="all">🩺 All Specialties</option>
              {availableSpecialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            {/* Radius Filter */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
              <span className="text-[11px] text-slate-400 pl-1.5 pr-1 font-medium">Radius:</span>
              {[
                { label: isPortmoreOrSpanishTown ? '🔒 8km Zone' : '🔒 7km Zone', val: defaultZoneLockKm },
                { label: '< 15km', val: 15 },
                { label: 'All Zones', val: 999 }
              ].map(rad => (
                <button
                  key={rad.val}
                  type="button"
                  onClick={() => setRadiusFilterKm(rad.val)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                    radiusFilterKm === rad.val
                      ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rad.label}
                </button>
              ))}
            </div>

            {/* Live Dispatch & Geofence Filter */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
              {[
                { id: 'all', label: 'All Status' },
                { id: 'on_call', label: '🟢 On-Call Only' },
                { id: 'in_geofence', label: '📍 In Geofence' }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    soundFX.playFilterSelect();
                    setAvailabilityFilter(st.id as any);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    availabilityFilter === st.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Sort & View Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
              <SlidersHorizontal className="w-3 h-3 text-purple-300" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer py-0.5"
              >
                <option value="proximity" className="bg-[#170826] text-white">📍 Proximity (Closest First)</option>
                <option value="rating" className="bg-[#170826] text-white">⭐ Highest Rating</option>
                <option value="experience" className="bg-[#170826] text-white">🩺 Years Experience</option>
                <option value="price_asc" className="bg-[#170826] text-white">💵 Price (Low to High)</option>
                <option value="price_desc" className="bg-[#170826] text-white">💎 Price (High to Low)</option>
              </select>
            </div>

            <div className="flex items-center bg-white/5 border border-white/15 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  soundFX.playTabSwitch();
                  onChangeViewMode('map');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'map'
                    ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playTabSwitch();
                  onChangeViewMode('grid');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid ({filteredAndSortedNurses.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW: MAP (LEAFLET INTERACTIVE MAP WITH DARK MODE OPTION OR TACTICAL RADAR) */}
      {viewMode === 'map' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Map Interface:</span>
              <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTabSwitch();
                    setMapType('leaflet');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    mapType === 'leaflet'
                      ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-[#F59E0B]" />
                  <span>Geographic Map (with Dark Mode)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTabSwitch();
                    setMapType('radar');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    mapType === 'radar'
                      ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3 h-3 text-purple-400" />
                  <span>Tactical Radar</span>
                </button>
              </div>
            </div>
            <span className="text-[11px] text-purple-300 font-semibold hidden sm:inline">
              Real-time vicinity &amp; transit in Kingston &amp; St. Andrew
            </span>
          </div>

          {mapType === 'leaflet' ? (
            <KingstonCoverageMapView
              nurses={filteredAndSortedNurses}
              clientZone={selectedZone}
              selectedNurse={selectedNurse}
              onSelectNurse={onSelectNurse}
              onViewNurseProfile={onViewNurseProfile}
              userGpsCoords={gpsCoords}
              isGpsActive={isGpsActive}
              onTriggerGps={onTriggerGps}
              isLocatingGps={isLocatingGps}
              onSetDemoGps={onSetDemoGps}
              onBookNurse={onBookNurse || onContinueBooking}
            />
          ) : (
            <NurseProximityMap
              nurses={filteredAndSortedNurses}
              clientZone={selectedZone}
              selectedNurse={selectedNurse}
              onSelectNurse={onSelectNurse}
              onViewNurseProfile={onViewNurseProfile}
              onContinue={onContinueBooking}
              userGpsCoords={gpsCoords}
              isGpsActive={isGpsActive}
              onTriggerGps={onTriggerGps}
              isLocatingGps={isLocatingGps}
            />
          )}
        </div>
      )}

      {/* VIEW: NURSE CARD GRID WITH AVAILABILITY & COLLISION CHECKS */}
      {viewMode === 'grid' && (
        <div>
          {filteredAndSortedNurses.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 text-[#C77DFF] border border-white/10 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">No Practitioners Found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active caregivers or nurses matched your current filters. Try changing your distance radius or switching to "All Caregivers".
              </p>
              <button
                type="button"
                onClick={() => {
                  setRadiusFilterKm(999);
                  setCareLevelFilter('all');
                  setSpecialtyFilter('all');
                  setRegionFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-purple-200 text-xs font-bold transition border border-white/15"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedNurses.map((nurse, index) => {
                const isSelected = selectedNurse?.id === nurse.id;
                const isClosest = index === 0 && sortBy === 'proximity';
                const isAvailable = nurse.availability?.isAvailable ?? true;

                return (
                  <div
                    key={nurse.id}
                    onClick={() => {
                      if (!isAvailable) {
                        soundFX.playLateTimerWarning();
                        return;
                      }
                      soundFX.playCaregiverSelect();
                      onSelectNurse(nurse);
                    }}
                    className={`p-5 rounded-2xl border transition flex flex-col justify-between backdrop-blur-md relative overflow-hidden group ${
                      !isAvailable
                        ? 'border-red-500/30 bg-red-950/15 opacity-80 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#C77DFF] bg-purple-900/30 shadow-2xl ring-2 ring-[#1E1B4B]/50 cursor-pointer'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] cursor-pointer'
                    }`}
                  >
                    {/* Top Proximity Line */}
                    {isClosest && isAvailable && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 shadow-sm" />
                    )}

                    <div>
                      {/* Distance, Geofence & Real-Time Availability Status Header */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{nurse.distanceKm} km away</span>
                          <span className="text-slate-400 text-[10px]">• ~{nurse.transitMins}m transit</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Interactive Nurse / Caregiver Availability Toggle */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleAvailability) {
                                onToggleAvailability(nurse);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              nurse.isOnCall
                                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/50'
                                : 'bg-slate-800/95 hover:bg-slate-700 text-slate-300 border-slate-600 hover:text-white'
                            }`}
                            title={`Click to toggle ${nurse.name}'s availability between On-Call and Offline`}
                          >
                            <div className={`w-5 h-3 flex items-center rounded-full p-0.5 transition-colors ${
                              nurse.isOnCall ? 'bg-emerald-500' : 'bg-slate-600'
                            }`}>
                              <div className={`w-2 h-2 rounded-full bg-white shadow-xs transition-transform ${
                                nurse.isOnCall ? 'transform translate-x-2' : ''
                              }`} />
                            </div>
                            {nurse.isOnCall ? (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span>On-Call</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Moon className="w-2.5 h-2.5 text-slate-400" />
                                <span>Offline</span>
                              </span>
                            )}
                          </button>

                          {/* Geofence Corridor Pill */}
                          {nurse.isWithinGeofence ? (
                            <span 
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1"
                              title={`Within practitioner's ${nurse.geofenceRadiusKm} km dispatch radius`}
                            >
                              <Compass className="w-2.5 h-2.5 text-cyan-400" />
                              <span>In Geofence</span>
                            </span>
                          ) : (
                            <span 
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                              title={`Beyond practitioner's ${nurse.geofenceRadiusKm} km service boundary`}
                            >
                              <Compass className="w-2.5 h-2.5 text-amber-400" />
                              <span>Beyond {nurse.geofenceRadiusKm}km</span>
                            </span>
                          )}

                          {/* Availability Pill / Conflict Warning */}
                          {isAvailable ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Free @ {targetTimeStr}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-400/40 flex items-center gap-1 animate-pulse">
                              <Ban className="w-3 h-3 text-red-400" />
                              <span>Booked</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Profile Photo & Council/Caregiver Badges */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="relative shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFX.playBadgeUnlock();
                            onViewNurseProfile(nurse);
                          }}
                          title="Click to view detailed profile, qualifications and schedule"
                        >
                          <img
                            src={nurse.photoUrl}
                            alt={nurse.name}
                            className={`w-14 h-14 rounded-full object-cover border-2 shadow-md group-hover:scale-105 transition ${
                              nurse.isRN ? 'border-emerald-400' : 'border-sky-400'
                            }`}
                          />
                          <span 
                            className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white shadow-xs ${
                              nurse.isRN ? 'bg-emerald-500' : 'bg-sky-500'
                            }`}
                          >
                            {nurse.isRN ? <ShieldCheck className="w-3 h-3" /> : <HeartHandshake className="w-3 h-3" />}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewNurseProfile(nurse);
                            }}
                            className="font-bold text-white text-sm leading-tight hover:text-purple-300 transition truncate"
                          >
                            {nurse.name}
                          </h4>

                          <div className="mt-1">
                            <CaregiverTierBadge
                              nurse={nurse}
                              size="xs"
                              variant="badge"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Caregiver Scope Restrictions (Launch Pack Directive) */}
                      {!nurse.isRN && (
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[10px] mb-2.5 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Caregiver:</strong> Non-clinical support. For clinical tasks book RN/LPN.</span>
                        </div>
                      )}

                      {/* Ratings & Experience Row */}
                      <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                        <div className="flex items-center text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                          <span>{nurse.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{nurse.reviewCount} visits</span>
                        <span>•</span>
                        <span>{nurse.yearsExperience} yrs exp</span>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                        {nurse.bio}
                      </p>

                      {/* Verified Specialized Skill Badges */}
                      {nurse.skillBadges && nurse.skillBadges.filter(b => b.status === 'verified').length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {nurse.skillBadges.filter(b => b.status === 'verified').map(badge => (
                            <span 
                              key={badge.id} 
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-xs"
                              title={`Verified by Clinical Admin: ${badge.skillName}`}
                            >
                              <BadgeCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{badge.skillName}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {nurse.specialties.map(spec => (
                          <span key={spec} className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-purple-200 border border-white/10 font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Cross-Booking Collision Alert Warning */}
                      {!isAvailable && (
                        <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-[11px] mb-3 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-red-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>Schedule Conflict on {targetDateStr}</span>
                          </div>
                          <p className="text-[10px] text-slate-300">
                            {nurse.availability?.conflictReason || 'Nurse is booked for another home visit.'}
                          </p>
                          {(nurse.availability?.suggestedTimes?.length || 0) > 0 && (
                            <div className="pt-1 text-[10px]">
                              <span className="text-cyan-300 font-semibold">Available alternative slots: </span>
                              <span className="text-white font-mono">{(nurse.availability?.suggestedTimes || []).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Offline Status Warning */}
                      {!nurse.isOnCall && (
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 text-[11px] mb-3 flex items-start gap-2">
                          <Moon className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            Practitioner is currently <strong>Offline (Off-Duty)</strong>. Immediate dispatch is unavailable, but advance appointment bookings remain open.
                          </span>
                        </div>
                      )}

                      {/* View Full Credentials & Verified Badge Breakdown Links */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFX.playBadgeUnlock();
                            setBreakdownNurse(nurse);
                          }}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                          title="View Verified Badge breakdown: NCJ license, photo ID, school, and 60-day police record"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified Badge Breakdown</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewNurseProfile(nurse);
                          }}
                          className="text-[11px] font-bold text-purple-300 hover:text-white flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C77DFF]" />
                          <span>Scope &amp; Profile</span>
                        </button>
                      </div>
                    </div>

                    {/* Footer / Price & Action */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-[#C77DFF] block">{formatJMD(nurse.hourlyRateJMD)}</span>
                        <span className="text-[9px] text-slate-400">
                          {nurse.isRN ? 'Clinical Visit Rate' : 'Geriatric / ADL Rate'}
                        </span>
                      </div>

                      {isBookingFlow ? (
                        <button
                          type="button"
                          disabled={!isAvailable}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                            !isAvailable
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : isSelected
                              ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-md'
                              : 'bg-white/10 text-slate-200 hover:bg-white/20'
                          }`}
                        >
                          {!isAvailable ? 'Unavailable' : isSelected ? 'Selected' : 'Choose Nurse'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAvailable) return;
                            if (onBookNurse) {
                              onBookNurse(nurse);
                            } else {
                              onSelectNurse(nurse);
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1 ${
                            !isAvailable
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white'
                          }`}
                        >
                          <span>{!isAvailable ? 'Booked' : 'Book Visit'}</span>
                          {isAvailable && <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Booking Step Footer Continue Button */}
          {isBookingFlow && onContinueBooking && (
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={() => onChangeViewMode('map')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <MapIcon className="w-4 h-4 text-[#C77DFF]" />
                <span>View on Proximity Radar</span>
              </button>

              <button
                disabled={!selectedNurse}
                onClick={onContinueBooking}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] disabled:opacity-50 hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-purple-900/40 flex items-center gap-2"
              >
                <span>Proceed with Selected Nurse</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scope of Care Modal */}
      <ScopeOfCareModal
        isOpen={showScopeModal}
        onClose={() => setShowScopeModal(false)}
      />

      {/* Verified Badge Breakdown Modal */}
      {breakdownNurse && (
        <VerifiedBadgeBreakdownModal
          isOpen={!!breakdownNurse}
          onClose={() => setBreakdownNurse(null)}
          nurse={breakdownNurse}
        />
      )}
    </div>
  );
};
