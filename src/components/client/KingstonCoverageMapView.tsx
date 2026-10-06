import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NurseProfile } from '../../types';
import { 
  ALL_ZONES_GEO, 
  KINGSTON_METRO_CENTER, 
  calculateDistanceKm, 
  estimateTransitMinutes, 
  JAMAICA_DEMO_LOCATIONS,
  ZoneGeo 
} from '../../data/geoData';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';
import { CaregiverTierBadge } from '../common/CaregiverTierBadge';
import { soundFX } from '../../utils/soundEffects';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Star, 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Car, 
  Activity, 
  Info, 
  CheckCircle2, 
  Filter, 
  Sparkles, 
  ChevronRight, 
  Crosshair, 
  Sun, 
  Moon, 
  Eye, 
  Calendar, 
  Phone, 
  Search, 
  Building2, 
  Radio, 
  Flame, 
  Check, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface KingstonCoverageMapViewProps {
  nurses: NurseProfile[];
  clientZone: string;
  clientAddress?: string;
  selectedNurse: NurseProfile | null;
  onSelectNurse: (nurse: NurseProfile) => void;
  onViewNurseProfile?: (nurse: NurseProfile) => void;
  onBookNurse?: (nurse: NurseProfile) => void;
  userGpsCoords?: { lat: number; lng: number; accuracy?: number } | null;
  isGpsActive?: boolean;
  onTriggerGps?: () => void;
  isLocatingGps?: boolean;
  onSetDemoGps?: (loc: { name: string; lat: number; lng: number }) => void;
}

// Kingston and St Andrew key centers for rapid vicinity jumps
const KINGSTON_HUBS = [
  { id: 'new_kingston', name: 'New Kingston', lat: 18.0074, lng: -76.7836, tag: 'Commercial Core' },
  { id: 'liguanea', name: 'Liguanea & Mona', lat: 18.0163, lng: -76.7584, tag: 'UHWI Corridor' },
  { id: 'barbican', name: 'Barbican & Cherry Gardens', lat: 18.0381, lng: -76.7794, tag: 'St Andrew North' },
  { id: 'hwt', name: 'Half-Way-Tree', lat: 18.0125, lng: -76.7978, tag: 'Transit Hub' },
  { id: 'constant_spring', name: 'Constant Spring & Manor Park', lat: 18.0532, lng: -76.7915, tag: 'Upper St Andrew' },
  { id: 'hope_pastures', name: 'Hope Pastures & Papine', lat: 18.0205, lng: -76.7455, tag: 'East St Andrew' },
  { id: 'downtown', name: 'Downtown Waterfront', lat: 17.9692, lng: -76.7938, tag: 'Kingston Port' },
  { id: 'red_hills', name: 'Red Hills & Meadowbrook', lat: 18.0468, lng: -76.8241, tag: 'Foothills' }
];

export const KingstonCoverageMapView: React.FC<KingstonCoverageMapViewProps> = ({
  nurses,
  clientZone,
  clientAddress,
  selectedNurse,
  onSelectNurse,
  onViewNurseProfile,
  onBookNurse,
  userGpsCoords,
  isGpsActive = false,
  onTriggerGps,
  isLocatingGps = false,
  onSetDemoGps
}) => {
  // Dark mode vs Light mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showCoverageRings, setShowCoverageRings] = useState<boolean>(true);
  const [showTrafficBadges, setShowTrafficBadges] = useState<boolean>(true);
  const [selectedCareLevel, setSelectedCareLevel] = useState<'all' | 'registered_nurse' | 'geriatric_caregiver'>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(30);
  const [activeHub, setActiveHub] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'split' | 'map_only'>('split');

  // DOM and Leaflet Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const coverageLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const clientMarkerRef = useRef<L.LayerGroup | null>(null);

  // Client reference coordinate: Browser GPS if active, otherwise clientZone lookup
  const clientCoordinates = useMemo(() => {
    if (isGpsActive && userGpsCoords) {
      return {
        lat: userGpsCoords.lat,
        lng: userGpsCoords.lng,
        label: 'My Live GPS Location',
        isLive: true
      };
    }
    const zoneInfo = ALL_ZONES_GEO[clientZone] || ALL_ZONES_GEO['New Kingston'];
    return {
      lat: zoneInfo?.lat || 18.0074,
      lng: zoneInfo?.lng || -76.7836,
      label: clientZone || 'New Kingston',
      isLive: false
    };
  }, [isGpsActive, userGpsCoords, clientZone]);

  // Enrich nurses with live vicinity metrics
  const enrichedNurses = useMemo(() => {
    return nurses
      .filter(n => n.status === 'approved')
      .map(nurse => {
        const nLat = nurse.currentLat || clientCoordinates.lat + 0.012;
        const nLng = nurse.currentLng || clientCoordinates.lng + 0.012;
        const distanceKm = calculateDistanceKm(clientCoordinates.lat, clientCoordinates.lng, nLat, nLng);
        const transitMinutes = estimateTransitMinutes(distanceKm);
        const isRN = nurse.careLevel === 'registered_nurse' || (!nurse.careLevel && nurse.requiresNcjRegistration !== false);
        const geofenceKm = nurse.geofenceRadiusKm || 12;
        const inVicinity = distanceKm <= geofenceKm;

        return {
          nurse,
          lat: nLat,
          lng: nLng,
          distanceKm,
          transitMinutes,
          isRN,
          geofenceKm,
          inVicinity
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [nurses, clientCoordinates]);

  // Filtered nurses based on user criteria
  const filteredNurses = useMemo(() => {
    return enrichedNurses.filter(item => {
      if (selectedCareLevel === 'registered_nurse' && !item.isRN) return false;
      if (selectedCareLevel === 'geriatric_caregiver' && item.isRN) return false;
      if (item.distanceKm > maxDistanceKm) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.nurse.name.toLowerCase().includes(q);
        const matchesSpec = item.nurse.specialties.some(s => s.toLowerCase().includes(q));
        const matchesZone = item.nurse.zones.some(z => z.toLowerCase().includes(q));
        if (!matchesName && !matchesSpec && !matchesZone) return false;
      }

      return true;
    });
  }, [enrichedNurses, selectedCareLevel, maxDistanceKm, searchQuery]);

  // Closest nurse calculation
  const closestNurse = filteredNurses.length > 0 ? filteredNurses[0] : null;

  // INITIALIZE LEAFLET MAP
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Kingston & St Andrew center coordinates
    const map = L.map(mapContainerRef.current, {
      center: [18.0179, -76.7845],
      zoom: 12.5,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false // custom zoom buttons provided
    });

    mapInstanceRef.current = map;

    // Layer groups for markers, coverage, and client
    coverageLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    clientMarkerRef.current = L.layerGroup().addTo(map);

    // Initial tile layer
    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

    const tiles = L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution
    }).addTo(map);

    tileLayerRef.current = tiles;

    // Invalidate size on load to avoid grey squares
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // UPDATE TILE LAYER ON DARK/LIGHT MODE TOGGLE
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [isDarkMode]);

  // RENDER CLIENT PIN & ACCURACY RING
  useEffect(() => {
    if (!mapInstanceRef.current || !clientMarkerRef.current) return;
    clientMarkerRef.current.clearLayers();

    const { lat, lng, isLive, label } = clientCoordinates;

    // Custom HTML Client Icon
    const clientIcon = L.divIcon({
      className: 'custom-client-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute -inset-2 rounded-full bg-[#F59E0B]/40 animate-ping"></span>
          <div class="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#F59E0B] to-pink-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <span class="absolute -bottom-5 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 text-white border border-white/20 shadow-md">
            ${isLive ? '📍 My GPS' : '📍 ' + label.split('&')[0].trim()}
          </span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = L.marker([lat, lng], { icon: clientIcon, zIndexOffset: 1000 });
    marker.bindPopup(`
      <div style="font-family: sans-serif; min-width: 170px; padding: 4px;">
        <p style="font-weight: 800; font-size: 13px; margin: 0 0 4px; color: #111;">
          ${isLive ? '📍 Your Current Location' : '📍 Client Neighborhood Base'}
        </p>
        <p style="font-size: 11px; margin: 0 0 4px; color: #555;">
          ${label}
        </p>
        ${clientAddress ? `<p style="font-size: 11px; margin: 0; color: #777;">${clientAddress}</p>` : ''}
        <div style="margin-top: 6px; padding: 4px 6px; background: #fee2e2; border-radius: 6px; font-size: 10px; color: #991b1b; font-weight: 700;">
          All nurse transit times calculated from here
        </div>
      </div>
    `);

    clientMarkerRef.current.addLayer(marker);

    // Accuracy circle if live GPS accuracy available
    if (isLive && userGpsCoords?.accuracy) {
      const accuracyCircle = L.circle([lat, lng], {
        radius: Math.min(userGpsCoords.accuracy, 300),
        color: '#F59E0B',
        fillColor: '#F59E0B',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3, 4'
      });
      clientMarkerRef.current.addLayer(accuracyCircle);
    }
  }, [clientCoordinates, clientAddress, userGpsCoords]);

  // RENDER NURSE COVERAGE RINGS & PINS
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current || !coverageLayerGroupRef.current) return;

    markersLayerGroupRef.current.clearLayers();
    coverageLayerGroupRef.current.clearLayers();

    filteredNurses.forEach(item => {
      const { nurse, lat, lng, distanceKm, transitMinutes, isRN, geofenceKm } = item;
      const isSelected = selectedNurse?.id === nurse.id;

      // 1. Coverage Circles / Geofence rings
      if (showCoverageRings) {
        const ringColor = isRN ? '#1E1B4B' : '#0EA5E9';
        const fillAlpha = isSelected ? 0.18 : 0.08;

        const circle = L.circle([lat, lng], {
          radius: geofenceKm * 1000,
          color: ringColor,
          weight: isSelected ? 2.5 : 1.2,
          opacity: isSelected ? 0.8 : 0.45,
          fillColor: ringColor,
          fillOpacity: fillAlpha,
          dashArray: isSelected ? '4, 4' : undefined
        });

        circle.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px; font-weight: 700;">
            ${nurse.name} • ${geofenceKm}km Coverage Radius
          </div>
        `, { sticky: true });

        coverageLayerGroupRef.current?.addLayer(circle);
      }

      // 2. Custom Nurse Marker HTML
      const badgeColor = isRN ? 'bg-purple-600' : 'bg-sky-500';
      const borderGlow = isSelected 
        ? 'ring-4 ring-[#F59E0B] scale-110 shadow-xl' 
        : 'border-2 border-white shadow-md hover:scale-105';

      const markerHtml = `
        <div class="relative cursor-pointer transition transform duration-200">
          <div class="relative w-11 h-11 rounded-full overflow-hidden ${borderGlow} bg-slate-900">
            <img 
              src="${nurse.photoUrl || 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=400'}" 
              alt="${nurse.name}"
              class="w-full h-full object-cover"
            />
          </div>
          
          <!-- Care Tier Badge -->
          <span class="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black text-white ${badgeColor} shadow-sm border border-white">
            ${isRN ? 'RN' : 'C-GCA'}
          </span>

          <!-- Real-Time Distance Chip -->
          <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-black/85 text-emerald-300 border border-emerald-400/40 shadow-sm flex items-center gap-0.5">
            ${distanceKm.toFixed(1)}km
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-nurse-marker',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Interactive Popup with Booking Trigger
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 220px; padding: 4px 2px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <img 
              src="${nurse.photoUrl}" 
              style="width: 36px; height: 36px; border-radius: 9999px; object-fit: cover; border: 2px solid #1E1B4B;"
            />
            <div>
              <p style="font-weight: 800; font-size: 13px; margin: 0; color: #111; line-height: 1.2;">
                ${nurse.name}
              </p>
              <p style="font-size: 11px; margin: 0; color: #6b21a8; font-weight: 700;">
                ${isRN ? 'Registered Nurse (NCJ Verified)' : 'Certified Geriatric Care Aide'}
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 6px; margin-bottom: 8px; font-size: 11px;">
            <span style="background: #f3e8ff; color: #6b21a8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
              ⭐ ${nurse.rating.toFixed(2)} (${nurse.reviewCount || 20})
            </span>
            <span style="background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
              ⏱️ ~${transitMinutes}m transit
            </span>
            <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
              📍 ${distanceKm.toFixed(1)}km
            </span>
          </div>

          <p style="font-size: 11px; color: #444; margin: 0 0 6px; line-height: 1.3;">
            ${(nurse?.specialties || []).slice(0, 3).join(' • ')}
          </p>

          <div style="border-top: 1px solid #eee; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 800; color: #111; font-size: 12px;">
              JMD $${(nurse.hourlyRateJMD || 7500).toLocaleString()}/hr
            </span>
            <button 
              id="popup-select-nurse-${nurse.id}" 
              style="background: #1E1B4B; color: white; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;"
            >
              Select &amp; View
            </button>
          </div>
        </div>
      `);

      marker.on('click', () => {
        soundFX.playCaregiverSelect();
        onSelectNurse(nurse);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-select-nurse-${nurse.id}`);
        if (btn) {
          btn.onclick = () => {
            soundFX.playCaregiverSelect();
            onSelectNurse(nurse);
          };
        }
      });

      markersLayerGroupRef.current?.addLayer(marker);
    });
  }, [filteredNurses, selectedNurse, showCoverageRings, onSelectNurse]);

  // FLY TO HUB
  const handleFlyToHub = (hub: typeof KINGSTON_HUBS[0]) => {
    setActiveHub(hub.id);
    soundFX.playTabSwitch();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([hub.lat, hub.lng], 14, {
        duration: 1.2
      });
    }
  };

  // FLY TO CLIENT
  const handleFlyToClient = () => {
    soundFX.playTabSwitch();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([clientCoordinates.lat, clientCoordinates.lng], 14.5, {
        duration: 1
      });
    }
  };

  // RESET VIEW TO FULL KINGSTON METRO
  const handleResetMap = () => {
    setActiveHub('all');
    soundFX.playTabSwitch();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([18.0179, -76.7845], 12.5, {
        duration: 1
      });
    }
  };

  return (
    <div className={`space-y-4 rounded-3xl transition-colors duration-300 ${
      isDarkMode 
        ? 'text-white' 
        : 'text-slate-900'
    }`}>
      {/* HEADER: REAL-TIME SERVICE COVERAGE HUD */}
      <div className={`p-5 rounded-3xl backdrop-blur-xl border shadow-2xl transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-[#1b0a2a]/95 via-[#13071e]/90 to-[#2a082e]/95 border-purple-500/30 shadow-purple-950/40' 
          : 'bg-white/95 border-purple-200/80 shadow-slate-300/40 text-slate-900'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] text-white shadow-lg shadow-purple-900/40 shrink-0">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Kingston &amp; St. Andrew Live Care Coverage
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Vicinity Radar
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold">
                  Corporate Area &amp; Foothills
                </span>
              </div>
              <p className={`text-xs mt-1 max-w-2xl ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Visual geographic map with real-time practitioner coverage radii. Track on-call registered nurses and certified geriatric aides across St. Andrew neighborhoods and Kingston parishes.
              </p>
            </div>
          </div>

          {/* Quick Metrics HUD Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`px-3 py-2 rounded-2xl border text-center ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <span className="text-[10px] block font-bold uppercase tracking-wider text-purple-400">
                Active On-Call
              </span>
              <span className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {filteredNurses.length} Nurses
              </span>
            </div>

            <div className={`px-3 py-2 rounded-2xl border text-center ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <span className="text-[10px] block font-bold uppercase tracking-wider text-emerald-400">
                Metro Coverage
              </span>
              <span className="text-base font-black text-emerald-400">
                98.4%
              </span>
            </div>

            <div className={`px-3 py-2 rounded-2xl border text-center ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <span className="text-[10px] block font-bold uppercase tracking-wider text-cyan-400">
                Avg ETA (Transit)
              </span>
              <span className={`text-base font-black ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                {closestNurse ? `~${closestNurse.transitMinutes} mins` : '15 mins'}
              </span>
            </div>
          </div>
        </div>

        {/* MAP CONTROLS & DARK MODE TOGGLE BAR */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          {/* Geolocation Button */}
          <div className="flex flex-wrap items-center gap-2">
            {onTriggerGps && (
              <button
                type="button"
                onClick={onTriggerGps}
                disabled={isLocatingGps}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                  isGpsActive
                    ? 'bg-emerald-500/25 border border-emerald-400/60 text-emerald-300'
                    : isDarkMode
                    ? 'bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200'
                    : 'bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-900'
                }`}
                title="Detect your device GPS in Kingston to calculate live travel distance"
              >
                <Crosshair className={`w-4 h-4 ${isLocatingGps ? 'animate-spin text-purple-400' : isGpsActive ? 'text-emerald-400 animate-pulse' : 'text-purple-300'}`} />
                <span>{isLocatingGps ? 'Locating GPS...' : isGpsActive ? 'Live GPS Locked' : 'Locate My Position'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleFlyToClient}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                isDarkMode 
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Center on Me ({clientCoordinates.label.split('&')[0].trim()})</span>
            </button>

            {/* Coverage Rings Toggle */}
            <button
              type="button"
              onClick={() => {
                soundFX.playTabSwitch();
                setShowCoverageRings(!showCoverageRings);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                showCoverageRings
                  ? 'bg-purple-600/30 text-purple-300 border-purple-400/40 shadow-sm'
                  : isDarkMode
                  ? 'bg-white/5 text-slate-400 border-white/10'
                  : 'bg-slate-100 text-slate-500 border-slate-300'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-purple-400" />
              <span>Coverage Rings: {showCoverageRings ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* RIGHT CONTROLS: DARK MODE TOGGLE & RESET */}
          <div className="flex items-center gap-2">
            {/* DARK MODE / LIGHT MODE TOGGLE (KEY REQUIREMENT) */}
            <div className={`p-1 rounded-2xl border flex items-center ${
              isDarkMode ? 'bg-black/40 border-white/15' : 'bg-slate-200/70 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => {
                  soundFX.playTabSwitch();
                  setIsDarkMode(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-[#1E1B4B] to-purple-800 text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Dark Mode map"
              >
                <Moon className="w-3.5 h-3.5 text-purple-300 fill-purple-300/30" />
                <span>Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playTabSwitch();
                  setIsDarkMode(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  !isDarkMode 
                    ? 'bg-white text-purple-900 shadow-md font-extrabold border border-purple-200' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Light Mode map"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
                <span>Light Mode</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetMap}
              className={`p-2 rounded-xl border transition ${
                isDarkMode 
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
              title="Reset map zoom to Full Kingston Metro"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KINGSTON & ST. ANDREW NEIGHBORHOOD QUICK-JUMP CHIPS */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className={`text-[11px] font-bold shrink-0 flex items-center gap-1 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <MapPin className="w-3 h-3 text-[#F59E0B]" />
            Vicinity Jump:
          </span>

          <button
            type="button"
            onClick={handleResetMap}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeHub === 'all'
                ? 'bg-[#1E1B4B] text-white shadow-sm'
                : isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Kingston &amp; St. Andrew
          </button>

          {KINGSTON_HUBS.map(hub => (
            <button
              key={hub.id}
              type="button"
              onClick={() => handleFlyToHub(hub)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                activeHub === hub.id
                  ? 'bg-[#F59E0B] text-white border-red-400/50 shadow-sm'
                  : isDarkMode
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {hub.name}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER CONTROLS BAR: CARE LEVEL & RADIUS */}
      <div className={`p-4 rounded-2xl backdrop-blur-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
        isDarkMode 
          ? 'bg-white/[0.03] border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Care Level Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400">Care Tier:</span>
            <div className={`flex rounded-xl p-0.5 border ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setSelectedCareLevel('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedCareLevel === 'all'
                    ? 'bg-[#1E1B4B] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Practitioners
              </button>
              <button
                type="button"
                onClick={() => setSelectedCareLevel('registered_nurse')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  selectedCareLevel === 'registered_nurse'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>NCJ Registered Nurses</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCareLevel('geriatric_caregiver')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedCareLevel === 'geriatric_caregiver'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Geriatric Care Aides
              </button>
            </div>
          </div>

          {/* Distance Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400">Radius:</span>
            <div className={`flex rounded-xl p-0.5 border ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              {[
                { label: '5 km', val: 5 },
                { label: '10 km', val: 10 },
                { label: '20 km', val: 20 },
                { label: 'All St. Andrew (35km)', val: 35 }
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setMaxDistanceKm(item.val)}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    maxDistanceKm === item.val
                      ? 'bg-[#F59E0B] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search nurse or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none border transition ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-purple-400' 
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500'
            }`}
          />
        </div>
      </div>

      {/* MAP & VICINITY CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* INTERACTIVE LEAFLET MAP CONTAINER (7 Cols on large screens) */}
        <div className="lg:col-span-7 space-y-2">
          <div 
            className={`relative w-full h-[520px] md:h-[580px] rounded-3xl overflow-hidden border shadow-2xl transition-colors duration-300 ${
              isDarkMode 
                ? 'border-purple-500/30 bg-slate-950 shadow-purple-950/40' 
                : 'border-slate-200 bg-slate-100 shadow-slate-300/50'
            }`}
          >
            {/* The Actual Leaflet Map Canvas */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-full z-0"
              style={{ minHeight: '100%' }}
            />

            {/* Custom Map Floating Controls */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playTabSwitch();
                  mapInstanceRef.current?.zoomIn();
                }}
                className={`p-2.5 rounded-xl border shadow-lg transition backdrop-blur-md ${
                  isDarkMode 
                    ? 'bg-slate-900/90 text-white border-white/20 hover:bg-purple-900/80' 
                    : 'bg-white/95 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playTabSwitch();
                  mapInstanceRef.current?.zoomOut();
                }}
                className={`p-2.5 rounded-xl border shadow-lg transition backdrop-blur-md ${
                  isDarkMode 
                    ? 'bg-slate-900/90 text-white border-white/20 hover:bg-purple-900/80' 
                    : 'bg-white/95 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetMap}
                className={`p-2.5 rounded-xl border shadow-lg transition backdrop-blur-md ${
                  isDarkMode 
                    ? 'bg-slate-900/90 text-white border-white/20 hover:bg-purple-900/80' 
                    : 'bg-white/95 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
                title="Reset View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom-left Map Legend Overlay */}
            <div className={`absolute bottom-4 left-4 z-[400] p-3 rounded-2xl backdrop-blur-xl border shadow-xl text-[11px] max-w-xs ${
              isDarkMode 
                ? 'bg-black/75 border-white/15 text-slate-200' 
                : 'bg-white/90 border-slate-300 text-slate-800'
            }`}>
              <div className="font-bold text-xs mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Service Coverage Map Legend</span>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-600 border border-white shrink-0" />
                  <span>NCJ Registered Nurse (Clinical Coverage Radius)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500 border border-white shrink-0" />
                  <span>Certified Geriatric Aide (ADL &amp; Companion Radius)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-white shrink-0" />
                  <span>Client Reference Pin ({clientCoordinates.label})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-2 text-slate-400">
            <span>Click any nurse icon or coverage circle on the map to view instant transit and profile.</span>
            <span>Leaflet + OpenStreetMap + CARTO Engine</span>
          </div>
        </div>

        {/* VICINITY PRACTITIONER LIST & SELECTED DETAIL CARD (5 Cols on large screens) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Nurse Spotlight Card */}
          {selectedNurse ? (
            (() => {
              const selectedMetric = enrichedNurses.find(item => item.nurse.id === selectedNurse.id);
              const dist = selectedMetric ? selectedMetric.distanceKm.toFixed(1) : '2.1';
              const transit = selectedMetric ? selectedMetric.transitMinutes : 12;

              return (
                <div className={`p-5 rounded-3xl border shadow-2xl space-y-4 transition animate-fadeIn ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-purple-950/60 via-[#190723]/90 to-black/80 border-purple-400/40 shadow-purple-950/50 text-white' 
                    : 'bg-white border-purple-300 shadow-purple-100 text-slate-900'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedNurse.photoUrl || 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=400'}
                        alt={selectedNurse.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Available in Vicinity
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base mt-0.5">{selectedNurse.name}</h3>
                        <CaregiverTierBadge nurse={selectedNurse} size="xs" variant="badge" className="mt-1" />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-purple-400 block">
                        JMD ${(selectedNurse.hourlyRateJMD || 7500).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">per visit hour</span>
                    </div>
                  </div>

                  {/* Proximity metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <Navigation className="w-4 h-4 text-[#F59E0B]" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Proximity Distance</span>
                        <strong className="text-xs">{dist} km from you</strong>
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <Car className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Estimated Transit</span>
                        <strong className="text-xs">~{transit} mins transit</strong>
                      </div>
                    </div>
                  </div>

                  {/* Specialties tags */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400">Core Clinical Specialties:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNurse.specialties.map((s, idx) => (
                        <span 
                          key={idx}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                            isDarkMode 
                              ? 'bg-purple-900/30 text-purple-200 border-purple-500/30' 
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    {onBookNurse && (
                      <button
                        type="button"
                        onClick={() => onBookNurse(selectedNurse)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-900/40 transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Care with {selectedNurse.name.split(' ')[1] || 'Practitioner'}</span>
                      </button>
                    )}

                    {onViewNurseProfile && (
                      <button
                        type="button"
                        onClick={() => onViewNurseProfile(selectedNurse)}
                        className={`px-3.5 py-2.5 rounded-xl border font-bold text-xs transition flex items-center gap-1.5 ${
                          isDarkMode 
                            ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                        }`}
                        title="Inspect full medical credentials and diploma"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                        <span>Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className={`p-5 rounded-3xl border text-center space-y-2 ${
              isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'
            }`}>
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5 text-[#C77DFF]" />
              </div>
              <h4 className="font-bold text-sm">Select Any Nurse on the Map</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click a pin on the Kingston radar to inspect real-time travel transit, certifications, and book instant clinical care.
              </p>
            </div>
          )}

          {/* VICINITY LIST OF AVAILABLE NURSES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Kingston Vicinity Practitioners ({filteredNurses.length})
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">Sorted by nearest</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredNurses.length === 0 ? (
                <div className={`p-8 rounded-2xl border text-center space-y-2 ${
                  isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
                }`}>
                  <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-400">No nurses found within current radius. Expand the radius filter to 20km or 35km.</p>
                </div>
              ) : (
                filteredNurses.map(item => {
                  const isSelected = selectedNurse?.id === item.nurse.id;

                  return (
                    <div
                      key={item.nurse.id}
                      onClick={() => {
                        soundFX.playCaregiverSelect();
                        onSelectNurse(item.nurse);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo([item.lat, item.lng], 14, { duration: 0.8 });
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-400 shadow-md'
                          : isDarkMode
                          ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                          : 'bg-white hover:bg-purple-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={item.nurse.photoUrl || 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=400'} 
                            alt={item.nurse.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-purple-400/50"
                          />
                          <span className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-white ${item.isRN ? 'bg-purple-600' : 'bg-sky-500'}`}>
                            <ShieldCheck className="w-2.5 h-2.5" />
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs line-clamp-1">{item.nurse.name}</h4>
                          <span className="text-[10px] text-purple-400 font-semibold block">
                            {item.isRN ? 'Registered Nurse (NCJ)' : 'Geriatric Caregiver'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {(item?.nurse?.zones || []).slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-400 block">
                          {item.distanceKm.toFixed(1)} km
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ~{item.transitMinutes}m transit
                        </span>
                        <span className="text-[11px] font-bold text-purple-300 mt-0.5 block">
                          JMD ${(item.nurse.hourlyRateJMD || 7500).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
