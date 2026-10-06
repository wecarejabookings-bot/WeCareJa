import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Activity, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Layers, 
  Maximize2, 
  RotateCcw, 
  Eye, 
  DollarSign, 
  Car, 
  Phone, 
  Building2, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  Heart,
  BarChart3,
  Map as MapIcon,
  FileText,
  Receipt,
  Printer,
  X
} from 'lucide-react';
import { Booking, NurseProfile, PayoutRecord } from '../../types';
import { ALL_ZONES_GEO, ZoneGeo } from '../../data/geoData';
import { KINGSTON_ZONES } from '../../data/mockData';
import { formatJMD } from '../../utils/currency';
import { soundFX } from '../../utils/soundEffects';
import { CaregiverPayoutChart } from './CaregiverPayoutChart';

interface KingstonServiceCoverageDashboardProps {
  bookings: Booking[];
  nurses: NurseProfile[];
  payouts: PayoutRecord[];
  onTriggerBatchPayout?: () => void;
  onOpenExportModal?: () => void;
  onSelectBookingForInvoice?: (booking: Booking) => void;
  onSelectBookingForMedicalSummary?: (booking: Booking) => void;
}

// Key Kingston & St Andrew Centers for fast navigation jumps
const KINGSTON_CORRIDORS = [
  { id: 'all', name: 'All Kingston & St. Andrew', lat: 18.0179, lng: -76.7845, zoom: 12.5 },
  { id: 'new_kingston', name: 'New Kingston', lat: 18.0074, lng: -76.7836, zoom: 15 },
  { id: 'liguanea', name: 'Liguanea & Mona', lat: 18.0163, lng: -76.7584, zoom: 14.5 },
  { id: 'barbican', name: 'Barbican & Cherry Gdns', lat: 18.0381, lng: -76.7794, zoom: 14.5 },
  { id: 'hwt', name: 'Half-Way-Tree', lat: 18.0125, lng: -76.7978, zoom: 15 },
  { id: 'constant_spring', name: 'Constant Spring & Manor', lat: 18.0532, lng: -76.7915, zoom: 14.5 },
  { id: 'hope_papine', name: 'Hope Pastures & Papine', lat: 18.0205, lng: -76.7455, zoom: 14.5 },
  { id: 'cross_roads', name: 'Cross Roads & Vineyard', lat: 17.9892, lng: -76.7865, zoom: 14.5 },
  { id: 'downtown', name: 'Downtown Waterfront', lat: 17.9692, lng: -76.7938, zoom: 14.5 },
  { id: 'red_hills', name: 'Red Hills & Meadowbrook', lat: 18.0468, lng: -76.8241, zoom: 14 }
];

export const KingstonServiceCoverageDashboard: React.FC<KingstonServiceCoverageDashboardProps> = ({
  bookings,
  nurses,
  payouts,
  onTriggerBatchPayout,
  onOpenExportModal,
  onSelectBookingForInvoice,
  onSelectBookingForMedicalSummary
}) => {
  // View mode: Map Dashboard vs Caregiver Payout Chart
  const [activeViewMode, setActiveViewMode] = useState<'map' | 'payout_chart' | 'split'>('map');
  const [tileTheme, setTileTheme] = useState<'dark' | 'voyager' | 'osm'>('dark');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all_active' | 'in_progress' | 'en_route' | 'accepted' | 'requested' | 'all'>('all_active');
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCoverageRadius, setShowCoverageRadius] = useState(true);
  const [showCompletedBookings, setShowCompletedBookings] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Leaflet DOM and Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const bookingsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const coverageRingsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Derive geographical positions for bookings in Kingston & St Andrew
  const enrichedBookings = useMemo(() => {
    return bookings.map((b, index) => {
      // Check zone coordinate
      const zoneGeo = ALL_ZONES_GEO[b.zone] || ALL_ZONES_GEO['New Kingston'];
      const isKingstonStAndrew = KINGSTON_ZONES.includes(b.zone) || 
        zoneGeo?.region === 'Kingston & St Andrew' || 
        b.clientAddress.toLowerCase().includes('kingston') || 
        b.clientAddress.toLowerCase().includes('st andrew') ||
        b.clientAddress.toLowerCase().includes('st. andrew');

      // Add deterministic slight offset for distinct pin visibility when in same zone
      const hash = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (hash % 8) * (Math.PI / 4);
      const offsetRadius = 0.003 + ((hash % 5) * 0.0012);
      const lat = zoneGeo ? zoneGeo.lat + Math.sin(angle) * offsetRadius : 18.0179;
      const lng = zoneGeo ? zoneGeo.lng + Math.cos(angle) * offsetRadius : -76.7845;

      // Check if active
      const isActive = ['in_progress', 'en_route', 'accepted', 'requested'].includes(b.status);

      return {
        booking: b,
        lat,
        lng,
        zoneGeo,
        isKingstonStAndrew,
        isActive
      };
    });
  }, [bookings]);

  // Filtered bookings for display
  const filteredBookings = useMemo(() => {
    return enrichedBookings.filter(item => {
      // Must be Kingston & St Andrew
      if (!item.isKingstonStAndrew) return false;

      // Status filter
      if (selectedStatusFilter === 'all_active' && !item.isActive) return false;
      if (selectedStatusFilter === 'in_progress' && item.booking.status !== 'in_progress') return false;
      if (selectedStatusFilter === 'en_route' && item.booking.status !== 'en_route') return false;
      if (selectedStatusFilter === 'accepted' && item.booking.status !== 'accepted') return false;
      if (selectedStatusFilter === 'requested' && item.booking.status !== 'requested') return false;
      if (selectedStatusFilter === 'all' && !showCompletedBookings && item.booking.status === 'completed') return false;

      // Corridor filter
      if (selectedCorridorFilter !== 'all') {
        const corridorName = KINGSTON_CORRIDORS.find(c => c.id === selectedCorridorFilter)?.name || '';
        const zoneMatches = item.booking.zone.toLowerCase().includes(corridorName.toLowerCase().split(' ')[0]) ||
                            corridorName.toLowerCase().includes(item.booking.zone.toLowerCase().split(' ')[0]);
        if (!zoneMatches) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = item.booking.clientName.toLowerCase().includes(q);
        const matchesAddress = item.booking.clientAddress.toLowerCase().includes(q);
        const matchesNurse = (item.booking.nurseName || '').toLowerCase().includes(q);
        const matchesService = item.booking.serviceName.toLowerCase().includes(q);
        const matchesId = item.booking.id.toLowerCase().includes(q);
        if (!matchesClient && !matchesAddress && !matchesNurse && !matchesService && !matchesId) return false;
      }

      return true;
    });
  }, [enrichedBookings, selectedStatusFilter, selectedCorridorFilter, searchQuery, showCompletedBookings]);

  // Kingston Metrics
  const kingstonStats = useMemo(() => {
    const kBookings = enrichedBookings.filter(b => b.isKingstonStAndrew);
    const activeKBookings = kBookings.filter(b => b.isActive);
    const inProgressCount = kBookings.filter(b => b.booking.status === 'in_progress').length;
    const enRouteCount = kBookings.filter(b => b.booking.status === 'en_route').length;
    const acceptedCount = kBookings.filter(b => b.booking.status === 'accepted').length;
    const requestedCount = kBookings.filter(b => b.booking.status === 'requested').length;
    const completedCount = kBookings.filter(b => b.booking.status === 'completed').length;

    // Available approved nurses covering Kingston
    const approvedNursesInKingston = nurses.filter(n => 
      n.status === 'approved' && 
      n.zones.some(z => KINGSTON_ZONES.includes(z) || z.toLowerCase().includes('kingston'))
    );

    // Sum active volume
    const activeVolumeJMD = activeKBookings.reduce((sum, b) => sum + b.booking.priceJMD, 0);

    return {
      totalActive: activeKBookings.length,
      inProgressCount,
      enRouteCount,
      acceptedCount,
      requestedCount,
      completedCount,
      nursesCovering: approvedNursesInKingston.length,
      activeVolumeJMD
    };
  }, [enrichedBookings, nurses]);

  // INITIALIZE LEAFLET MAP
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Kingston Metro & St Andrew foothills
    const map = L.map(mapContainerRef.current, {
      center: [18.0179, -76.7845],
      zoom: 12.5,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false
    });

    mapInstanceRef.current = map;

    // Tile Layer based on theme
    const getTileUrl = (theme: string) => {
      switch (theme) {
        case 'voyager':
          return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        case 'osm':
          return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        case 'dark':
        default:
          return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      }
    };

    const tiles = L.tileLayer(getTileUrl(tileTheme), {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    tileLayerRef.current = tiles;

    // Layer groups for markers and coverage rings
    coverageRingsLayerGroupRef.current = L.layerGroup().addTo(map);
    bookingsLayerGroupRef.current = L.layerGroup().addTo(map);

    // Resize recalculation after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when tileTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const getTileUrl = (theme: string) => {
      switch (theme) {
        case 'voyager':
          return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        case 'osm':
          return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        case 'dark':
        default:
          return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      }
    };
    tileLayerRef.current.setUrl(getTileUrl(tileTheme));
  }, [tileTheme]);

  // RENDER CORRIDOR COVERAGE RINGS
  useEffect(() => {
    if (!mapInstanceRef.current || !coverageRingsLayerGroupRef.current) return;
    coverageRingsLayerGroupRef.current.clearLayers();

    if (!showCoverageRadius) return;

    KINGSTON_ZONES.forEach((zoneName) => {
      const geo = ALL_ZONES_GEO[zoneName];
      if (!geo) return;

      // Count active bookings in this zone
      const activeInZone = enrichedBookings.filter(b => b.isActive && b.booking.zone === zoneName).length;
      const nursesInZone = nurses.filter(n => n.status === 'approved' && n.zones.includes(zoneName)).length;

      // Determine ring status color
      let ringColor = '#1E1B4B';
      let fillColor = '#1E1B4B';
      let fillOpacity = 0.08;

      if (activeInZone >= 2) {
        ringColor = '#10B981'; // High activity, well covered
        fillColor = '#10B981';
        fillOpacity = 0.12;
      } else if (activeInZone === 1) {
        ringColor = '#0EA5E9'; // Active visit
        fillColor = '#0EA5E9';
        fillOpacity = 0.10;
      } else if (nursesInZone === 0) {
        ringColor = '#F59E0B'; // Low coverage warning
        fillColor = '#F59E0B';
        fillOpacity = 0.08;
      }

      // Create Leaflet circle representing medical dispatch coverage
      const circle = L.circle([geo.lat, geo.lng], {
        radius: 1200,
        color: ringColor,
        weight: 1.5,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        dashArray: activeInZone > 0 ? undefined : '4, 6'
      });

      circle.bindTooltip(`
        <div class="text-xs p-1">
          <strong class="text-white block">${zoneName}</strong>
          <span class="text-slate-300 text-[10px]">Active Bookings: ${activeInZone} • Nurses: ${nursesInZone}</span>
        </div>
      `, {
        className: 'custom-leaflet-tooltip',
        permanent: false,
        direction: 'top'
      });

      coverageRingsLayerGroupRef.current?.addLayer(circle);
    });
  }, [showCoverageRadius, enrichedBookings, nurses]);

  // RENDER ACTIVE BOOKING MARKERS
  useEffect(() => {
    if (!mapInstanceRef.current || !bookingsLayerGroupRef.current) return;
    bookingsLayerGroupRef.current.clearLayers();
    markersMapRef.current.clear();

    filteredBookings.forEach(({ booking, lat, lng }) => {
      // Marker color and pulse style by status
      let pinColor = '#1E1B4B';
      let pulseColor = 'rgba(114, 9, 183, 0.4)';
      let statusLabel = 'Accepted';
      let iconSymbol = 'check';

      if (booking.status === 'in_progress') {
        pinColor = '#10B981';
        pulseColor = 'rgba(16, 185, 129, 0.5)';
        statusLabel = 'In-Progress Visit';
        iconSymbol = 'heart';
      } else if (booking.status === 'en_route') {
        pinColor = '#0EA5E9';
        pulseColor = 'rgba(14, 165, 233, 0.5)';
        statusLabel = 'Nurse En-Route';
        iconSymbol = 'car';
      } else if (booking.status === 'requested') {
        pinColor = '#F59E0B';
        pulseColor = 'rgba(245, 158, 11, 0.5)';
        statusLabel = 'Pending Dispatch';
        iconSymbol = 'clock';
      } else if (booking.status === 'completed') {
        pinColor = '#64748B';
        pulseColor = 'transparent';
        statusLabel = 'Completed';
        iconSymbol = 'check';
      }

      // Custom Leaflet DivIcon with pulsing ripple
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${booking.status === 'in_progress' || booking.status === 'en_route' ? `
            <span class="absolute -inset-2.5 rounded-full animate-ping" style="background-color: ${pulseColor};"></span>
          ` : ''}
          <div class="relative w-9 h-9 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white transition-transform group-hover:scale-110" style="background: linear-gradient(135deg, ${pinColor}, #110521);">
            ${iconSymbol === 'heart' ? `
              <svg class="w-4 h-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ` : iconSymbol === 'car' ? `
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 104 0M19 17a2 2 0 104 0"/></svg>
            ` : iconSymbol === 'clock' ? `
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ` : `
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            `}
          </div>
          <span class="absolute -bottom-5 whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/90 text-white border border-white/20 shadow-md">
            ${booking.id}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-booking-marker',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Rich interactive Leaflet popup
      const popupContent = `
        <div class="p-3.5 space-y-2 text-xs font-sans text-slate-100" style="min-width: 260px; max-width: 320px;">
          <div class="flex items-center justify-between border-b border-white/15 pb-2">
            <span class="font-mono text-xs font-black text-purple-300">${booking.id}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style="background-color: ${pinColor}30; color: ${pinColor}; border: 1px solid ${pinColor}50;">
              ${statusLabel}
            </span>
          </div>

          <div>
            <strong class="text-white text-sm font-black block leading-snug">${booking.serviceName}</strong>
            <p class="text-[11px] text-slate-300 mt-0.5">${booking.clientAddress} (${booking.zone})</p>
          </div>

          <div class="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
            <div class="flex justify-between items-center text-slate-300">
              <span>Patient:</span>
              <strong class="text-white">${booking.clientName}</strong>
            </div>
            <div class="flex justify-between items-center text-slate-300">
              <span>Assigned Nurse:</span>
              <strong class="text-purple-300">${booking.nurseName || 'Awaiting Dispatch'}</strong>
            </div>
            <div class="flex justify-between items-center text-slate-300">
              <span>Visit Fee:</span>
              <strong class="text-emerald-400 font-mono">${formatJMD(booking.priceJMD)}</strong>
            </div>
            <div class="flex justify-between items-center text-slate-300">
              <span>Nurse Net (85%):</span>
              <strong class="text-emerald-300 font-mono">${formatJMD(booking.nurseEarningsJMD || Math.round(booking.priceJMD * 0.85))}</strong>
            </div>
          </div>

          <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1">
            <span>Scheduled: ${new Date(booking.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span class="font-bold text-slate-300">${String(booking.paymentMethod || 'card').replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup',
        maxWidth: 320
      });

      marker.on('click', () => {
        soundFX.playPop();
        setSelectedBookingId(booking.id);
      });

      bookingsLayerGroupRef.current?.addLayer(marker);
      markersMapRef.current.set(booking.id, marker);
    });
  }, [filteredBookings]);

  // Pan to booking when selected from list
  const handleSelectBooking = (bookingId: string) => {
    soundFX.playPop();
    setSelectedBookingId(bookingId);
    const target = filteredBookings.find(b => b.booking.id === bookingId);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 15, { duration: 1.2 });
      const marker = markersMapRef.current.get(bookingId);
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 500);
      }
    }
  };

  // Jump to Corridor
  const handleJumpToCorridor = (corridorId: string) => {
    soundFX.playPop();
    setSelectedCorridorFilter(corridorId);
    const corridor = KINGSTON_CORRIDORS.find(c => c.id === corridorId);
    if (corridor && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([corridor.lat, corridor.lng], corridor.zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn" id="kingston-coverage-dashboard">
      {/* Top Header & View Switcher */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1e072b] via-[#14061e] to-[#0e1726] border border-purple-500/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-[#C77DFF] border border-purple-500/30 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#C77DFF]" /> Kingston &amp; St. Andrew Metro
            </span>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Leaflet Dispatch Map
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Active Booking Locations &amp; Service Coverage
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Real-time geospatial dispatch monitoring across all 10 Kingston &amp; St. Andrew healthcare corridors. Track in-progress clinical visits, en-route nurses, and caregiver financial settlements.
          </p>
        </div>

        {/* Top View Mode Switcher (Coverage Map vs Caregiver Payout Chart) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="p-1 rounded-2xl bg-black/50 border border-white/15 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                setActiveViewMode('map');
                setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'map'
                  ? 'bg-[#1E1B4B] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Coverage Map</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                setActiveViewMode('payout_chart');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'payout_chart'
                  ? 'bg-[#10B981] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Caregiver Payout Chart</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                setActiveViewMode('split');
                setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hidden xl:flex ${
                activeViewMode === 'split'
                  ? 'bg-purple-700 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Active Bookings in Kingston */}
        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 hover:border-purple-400/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">Active in KSA</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-[#C77DFF] flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {kingstonStats.totalActive}
          </div>
          <span className="text-[10px] text-purple-300 font-bold block">
            Corridor deployments
          </span>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 hover:border-emerald-400/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">In-Progress Now</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {kingstonStats.inProgressCount}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold block">
            Clinical visits live
          </span>
        </div>

        {/* Nurses on Duty */}
        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 hover:border-sky-400/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">Nurses Assigned</span>
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-300 font-mono">
            {kingstonStats.nursesCovering}
          </div>
          <span className="text-[10px] text-sky-300 font-bold block">
            Licensed in parish
          </span>
        </div>

        {/* En Route in Traffic */}
        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 hover:border-cyan-400/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">En Route Driving</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Car className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {kingstonStats.enRouteCount}
          </div>
          <span className="text-[10px] text-slate-400 font-bold block">
            Avg ~14 min transit
          </span>
        </div>

        {/* Active Volume JMD */}
        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 hover:border-amber-400/40 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">Active Volume</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
            {formatJMD(kingstonStats.activeVolumeJMD)}
          </div>
          <span className="text-[10px] text-amber-400 font-bold block">
            Held in escrow (85% pool)
          </span>
        </div>
      </div>

      {/* MAIN VIEW AREA: Map Dashboard vs Caregiver Payout Chart vs Split */}
      {(activeViewMode === 'map' || activeViewMode === 'split') && (
        <div className={`space-y-6 ${activeViewMode === 'split' ? 'grid grid-cols-1 xl:grid-cols-2 gap-6 space-y-0' : ''}`}>
          {/* MAP CONTAINER & CONTROLS */}
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-5 border border-white/10 space-y-4 shadow-2xl">
            {/* Map Filters & Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Corridor Quick Jumps Dropdown */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-purple-400" /> Corridor:
                </label>
                <select
                  value={selectedCorridorFilter}
                  onChange={(e) => handleJumpToCorridor(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold outline-none focus:border-purple-400 cursor-pointer"
                >
                  {KINGSTON_CORRIDORS.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#160728] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="all_active" className="bg-[#160728]">All Active Bookings</option>
                  <option value="in_progress" className="bg-[#160728]">🟢 In-Progress Live</option>
                  <option value="en_route" className="bg-[#160728]">🔵 En-Route Driving</option>
                  <option value="accepted" className="bg-[#160728]">🟣 Accepted &amp; Scheduled</option>
                  <option value="requested" className="bg-[#160728]">🟡 Pending Dispatch</option>
                  <option value="all" className="bg-[#160728]">All (Incl. Completed)</option>
                </select>
              </div>

              {/* Map Layer & Style Switchers */}
              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowCoverageRadius(!showCoverageRadius)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                    showCoverageRadius
                      ? 'bg-purple-500/20 text-[#C77DFF] border-purple-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle 1.2km Medical Dispatch Coverage Radii"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Coverage Rings</span>
                </button>

                {/* Tile Theme Switcher */}
                <div className="flex p-0.5 rounded-xl bg-black/40 border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTileTheme('dark')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      tileTheme === 'dark' ? 'bg-[#1E1B4B] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileTheme('voyager')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      tileTheme === 'voyager' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Medical Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileTheme('osm')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      tileTheme === 'osm' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OSM
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleJumpToCorridor('all')}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                  title="Reset to Kingston Metro Center"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* THE LEAFLET MAP CANVAS */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-[#120520] shadow-inner">
              <div 
                ref={mapContainerRef} 
                className="w-full h-[420px] sm:h-[480px] z-0"
              />

              {/* Floating Map HUD overlay */}
              <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
                <div className="px-3 py-1.5 rounded-2xl bg-[#14061e]/90 backdrop-blur-xl border border-white/20 shadow-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-white">
                    {filteredBookings.length} Active Care Locations
                  </span>
                </div>
              </div>

              {/* Status Legend */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] p-2.5 rounded-2xl bg-[#14061e]/90 backdrop-blur-xl border border-white/15 shadow-xl flex items-center gap-3 text-[10px] flex-wrap">
                <span className="flex items-center gap-1 font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> In Progress
                </span>
                <span className="flex items-center gap-1 font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> En Route
                </span>
                <span className="flex items-center gap-1 font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C77DFF]" /> Accepted
                </span>
                <span className="flex items-center gap-1 font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Requested
                </span>
              </div>
            </div>

            {/* Active Bookings Quick List / Interactive Dispatch Drawer */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>Monitored Booking Locations ({filteredBookings.length})</span>
                </h4>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search address or patient..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Selected Booking Quick Action & Clinical Audit Banner */}
              {selectedBookingId && (() => {
                const sel = filteredBookings.find(b => b.booking.id === selectedBookingId)?.booking;
                if (!sel) return null;
                const hasBiometrics = !!sel.biometricScan;

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#180829] to-emerald-950/50 border border-purple-500/40 shadow-xl space-y-3 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-purple-300">
                            #{sel.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-[#C77DFF] border border-purple-500/30">
                            {String(sel.status || 'requested').replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-300">
                            Zone: <strong className="text-white">{sel.zone}</strong>
                          </span>
                          {hasBiometrics && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-400" /> Biometrics Logged
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-sm mt-1">{sel.serviceName}</h4>
                        <p className="text-xs text-slate-300">
                          Patient: <strong className="text-white">{sel.clientName}</strong> • Address: <span className="text-slate-200">{sel.clientAddress}</span>
                          {sel.nurseName && <span> • Nurse: <strong className="text-purple-300">{sel.nurseName}</strong></span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {onSelectBookingForMedicalSummary && (
                          <button
                            type="button"
                            onClick={() => onSelectBookingForMedicalSummary(sel)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                            title="Open and print official Medical Summary PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download Medical Summary (PDF)</span>
                          </button>
                        )}

                        {onSelectBookingForInvoice && (
                          <button
                            type="button"
                            onClick={() => onSelectBookingForInvoice(sel)}
                            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
                            title="Inspect itemized duration and fee audit"
                          >
                            <Receipt className="w-3.5 h-3.5 text-[#C77DFF]" />
                            <span>Audit Invoice</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedBookingId(null)}
                          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                          title="Deselect"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Financial Transparency & Escrow Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Gross Visit Fee</span>
                        <strong className="text-white font-mono text-xs">{formatJMD(sel.priceJMD)}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] text-emerald-400 block">Nurse Earnings (85%)</span>
                        <strong className="text-emerald-300 font-mono text-xs">{formatJMD(sel.nurseEarningsJMD || Math.round(sel.priceJMD * 0.85))}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] text-purple-300 block">Platform Fee (15%)</span>
                        <strong className="text-purple-200 font-mono text-xs">{formatJMD(sel.platformFeeJMD || Math.round(sel.priceJMD * 0.15))}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Escrow / Clearing</span>
                        <span className="text-[11px] font-bold text-amber-300 uppercase block">
                          ● {String(sel.paymentStatus || 'held_in_escrow').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredBookings.map(({ booking, lat, lng }) => {
                  const isSelected = selectedBookingId === booking.id;
                  const isLive = booking.status === 'in_progress';
                  const isTransit = booking.status === 'en_route';

                  return (
                    <div
                      key={booking.id}
                      onClick={() => handleSelectBooking(booking.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-400/60 ring-2 ring-purple-500/30'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[11px] font-black text-purple-300">
                            {booking.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isLive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                              : isTransit
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : booking.status === 'accepted'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {String(booking.status || 'requested').replace('_', ' ')}
                          </span>
                        </div>

                        <h5 className="font-bold text-white text-xs line-clamp-1">{booking.serviceName}</h5>
                        <p className="text-[11px] text-slate-300 line-clamp-1">
                          📍 {booking.clientAddress}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <div className="text-slate-400">
                          <span>Nurse: </span>
                          <strong className="text-white">{booking.nurseName?.split(' ')[1] || 'Unassigned'}</strong>
                        </div>
                        <div className="text-right font-mono font-bold text-emerald-400">
                          {formatJMD(booking.priceJMD)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* If Split mode, display Caregiver Payout Chart side-by-side */}
          {activeViewMode === 'split' && (
            <div>
              <CaregiverPayoutChart
                nurses={nurses}
                bookings={bookings}
                payouts={payouts}
                onTriggerBatchPayout={onTriggerBatchPayout}
                onOpenExportModal={onOpenExportModal}
                compactMode={true}
              />
            </div>
          )}
        </div>
      )}

      {/* FULL CAREGIVER PAYOUT CHART VIEW */}
      {activeViewMode === 'payout_chart' && (
        <CaregiverPayoutChart
          nurses={nurses}
          bookings={bookings}
          payouts={payouts}
          onTriggerBatchPayout={onTriggerBatchPayout}
          onOpenExportModal={onOpenExportModal}
          compactMode={false}
        />
      )}
    </div>
  );
};
