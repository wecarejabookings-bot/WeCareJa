import React, { useState, useMemo, useRef } from 'react';
import { NurseProfile } from '../../types';
import { 
  ALL_ZONES_GEO,
  KINGSTON_ZONE_GEO, 
  KINGSTON_METRO_CENTER, 
  REGIONS,
  calculateDistanceKm, 
  estimateTransitMinutes, 
  geoToSvgCoords,
  ZoneGeo 
} from '../../data/geoData';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';
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
  Map as MapIcon,
  Crosshair,
  UserCheck,
  Building2,
  Waves
} from 'lucide-react';

interface NurseProximityMapProps {
  nurses: NurseProfile[];
  clientZone: string;
  clientAddress?: string;
  selectedNurse: NurseProfile | null;
  onSelectNurse: (nurse: NurseProfile) => void;
  onViewNurseProfile?: (nurse: NurseProfile) => void;
  onContinue?: () => void;
  userGpsCoords?: { lat: number; lng: number; accuracy?: number } | null;
  isGpsActive?: boolean;
  onTriggerGps?: () => void;
  isLocatingGps?: boolean;
}

export const NurseProximityMap: React.FC<NurseProximityMapProps> = ({
  nurses,
  clientZone,
  clientAddress,
  selectedNurse,
  onSelectNurse,
  onViewNurseProfile,
  onContinue,
  userGpsCoords,
  isGpsActive,
  onTriggerGps,
  isLocatingGps
}) => {
  const [mapTheme, setMapTheme] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNurseId, setHoveredNurseId] = useState<string | null>(null);
  const [maxDistanceFilter, setMaxDistanceFilter] = useState<number>(35); // km
  const [showTrafficCorridors, setShowTrafficCorridors] = useState<boolean>(true);
  const [activeZoneHover, setActiveZoneHover] = useState<ZoneGeo | null>(null);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  // Client coordinate (Uses real-time browser GPS coordinates if active, otherwise designated zone)
  const clientGeo = useMemo(() => {
    if (isGpsActive && userGpsCoords) {
      return {
        name: 'My GPS Location',
        region: 'Kingston & St Andrew' as const,
        lat: userGpsCoords.lat,
        lng: userGpsCoords.lng,
        parish: 'Current Location',
        landmark: 'Live GPS Pin',
        majorRoads: []
      };
    }
    return ALL_ZONES_GEO[clientZone] || ALL_ZONES_GEO['New Kingston'] || ALL_ZONES_GEO['Portmore - Greater Portmore'];
  }, [clientZone, isGpsActive, userGpsCoords]);

  const clientSvgPos = useMemo(() => {
    return geoToSvgCoords(clientGeo.lat, clientGeo.lng);
  }, [clientGeo]);


  // Compute nurse proximity metrics
  const nurseMetrics = useMemo(() => {
    return nurses.map(nurse => {
      const nLat = nurse.currentLat || clientGeo.lat + (Math.random() * 0.04 - 0.02);
      const nLng = nurse.currentLng || clientGeo.lng + (Math.random() * 0.04 - 0.02);
      const distanceKm = calculateDistanceKm(clientGeo.lat, clientGeo.lng, nLat, nLng);
      const transitMins = estimateTransitMinutes(distanceKm);
      const svgPos = geoToSvgCoords(nLat, nLng);
      const inZone = nurse.zones.includes(clientZone);

      return {
        nurse,
        lat: nLat,
        lng: nLng,
        distanceKm,
        transitMins,
        svgPos,
        inZone
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [nurses, clientGeo, clientZone]);

  const filteredNurses = useMemo(() => {
    return nurseMetrics.filter(nm => {
      if (nm.distanceKm > maxDistanceFilter) return false;
      if (selectedRegionFilter === 'all') return true;
      if (selectedRegionFilter === 'kingston') {
        return nm.nurse.zones.some(z => !z.startsWith('Portmore') && !z.startsWith('Spanish Town'));
      }
      if (selectedRegionFilter === 'portmore') {
        return nm.nurse.zones.some(z => z.startsWith('Portmore'));
      }
      if (selectedRegionFilter === 'spanish_town') {
        return nm.nurse.zones.some(z => z.startsWith('Spanish Town'));
      }
      return true;
    });
  }, [nurseMetrics, maxDistanceFilter, selectedRegionFilter]);

  const activeSelectedMetric = useMemo(() => {
    if (!selectedNurse) return null;
    return nurseMetrics.find(nm => nm.nurse.id === selectedNurse.id) || null;
  }, [selectedNurse, nurseMetrics]);

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedRegionFilter('all');
  };

  const handleFocusClient = () => {
    setZoomLevel(1.4);
    // Center pan roughly around clientSvgPos (50 is center)
    setPanOffset({
      x: (50 - clientSvgPos.x) * 3,
      y: (50 - clientSvgPos.y) * 3
    });
  };

  const handleFocusRegion = (regionKey: string) => {
    setSelectedRegionFilter(regionKey);
    if (regionKey === 'all') {
      handleResetView();
    } else if (regionKey === 'kingston') {
      setZoomLevel(1.3);
      setPanOffset({ x: -40, y: 0 });
    } else if (regionKey === 'portmore') {
      setZoomLevel(1.5);
      setPanOffset({ x: 10, y: -40 });
    } else if (regionKey === 'spanish_town') {
      setZoomLevel(1.5);
      setPanOffset({ x: 60, y: 10 });
    }
  };

  const formatJMD = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Proximity Bar & Controls */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-[#C77DFF] border border-purple-400/30">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Live Nurse Proximity Radar</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                Kingston • Portmore • Spanish Town
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Client Base: <strong className="text-white">{clientZone}</strong> {clientAddress ? `(${clientAddress})` : ''}
            </p>
          </div>
        </div>

        {/* Filters & Theme Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* GPS Locate Button */}
          {onTriggerGps && (
            <button
              type="button"
              onClick={onTriggerGps}
              disabled={isLocatingGps}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                isGpsActive
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-md shadow-emerald-950/40'
                  : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Use browser Geolocation API to center map on your live position in Jamaica"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin text-purple-400' : isGpsActive ? 'text-emerald-400 animate-pulse' : 'text-purple-300'}`} />
              <span>{isLocatingGps ? 'Locating GPS...' : isGpsActive ? 'Live GPS Active' : 'Locate GPS'}</span>
            </button>
          )}

          {/* Region Switcher */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
            <Layers className="w-3 h-3 text-purple-300 ml-1.5" />
            {[
              { key: 'all', label: 'All Corridors' },
              { key: 'kingston', label: 'Kingston' },
              { key: 'portmore', label: 'Portmore' },
              { key: 'spanish_town', label: 'Spanish Town' }
            ].map(r => (
              <button
                key={r.key}
                onClick={() => handleFocusRegion(r.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedRegionFilter === r.key
                    ? 'bg-[#1E1B4B] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Max Distance Selector */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
            <Filter className="w-3 h-3 text-slate-400 ml-1.5" />
            <span className="text-[11px] text-slate-300 px-1">Radius:</span>
            {[
              { label: '10 km', val: 10 },
              { label: '20 km', val: 20 },
              { label: 'All (40km)', val: 40 }
            ].map(r => (
              <button
                key={r.val}
                onClick={() => setMaxDistanceFilter(r.val)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                  maxDistanceFilter === r.val
                    ? 'bg-[#1E1B4B] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Map Style Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
            <button
              onClick={() => setMapTheme('dark')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                mapTheme === 'dark' ? 'bg-[#1E1B4B] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tactical Violet Dark Map"
            >
              Radar Dark
            </button>
            <button
              onClick={() => setMapTheme('light')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                mapTheme === 'light' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Clean Vector Map"
            >
              Light
            </button>
            <button
              onClick={() => setMapTheme('satellite')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                mapTheme === 'satellite' ? 'bg-[#F59E0B] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Topographic Terrain"
            >
              Terrain
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas & Split Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* MAP VISUALIZATION CONTAINER (Col 7 on desktop) */}
        <div className="lg:col-span-7 relative min-h-[440px] md:min-h-[500px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-950 flex flex-col justify-between select-none">
          {/* Map Background Layer Styling */}
          <div 
            className={`absolute inset-0 transition-colors duration-500 ${
              mapTheme === 'dark'
                ? 'bg-radial from-[#1e0a2e] via-[#100319] to-[#08010d]'
                : mapTheme === 'light'
                ? 'bg-gradient-to-br from-[#1e1b2e] via-[#2a243d] to-[#171322]'
                : 'bg-radial from-[#1a1424] via-[#0d0a14] to-[#050408]'
            }`}
          />

          {/* SVG Map Canvas */}
          <div 
            className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: '50% 50%',
              transition: 'transform 0.25s ease-out'
            }}
          >
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full preserve-3d"
              style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Radar Grid Pattern */}
                <pattern id="radarGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                </pattern>

                {/* Pulsing Client Wave Gradient */}
                <radialGradient id="clientPulseGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>

                {/* Selected Nurse Route Glow */}
                <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C77DFF" />
                  <stop offset="50%" stopColor="#1E1B4B" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>

                {/* Terrain contours for St Andrew & St Catherine Foothills */}
                <linearGradient id="hillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(114, 9, 183, 0.15)" />
                  <stop offset="100%" stopColor="rgba(14, 3, 22, 0)" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="100" height="100" fill="url(#radarGrid)" />

              {/* Northern Hills & St Jago Ridge Accent (Top) */}
              <path
                d="M 0,0 L 100,0 L 100,20 Q 70,14 45,22 T 0,16 Z"
                fill="url(#hillsGrad)"
                stroke="rgba(199, 125, 255, 0.1)"
                strokeWidth="0.4"
              />

              {/* Kingston Harbour & Hunt's Bay Water Accent */}
              <path
                d="M 40,78 Q 65,72 85,82 L 100,80 L 100,100 L 35,100 Q 38,88 40,78 Z"
                fill="rgba(14, 165, 233, 0.08)"
                stroke="rgba(14, 165, 233, 0.2)"
                strokeWidth="0.4"
              />
              <text x="75" y="92" fill="rgba(14, 165, 233, 0.5)" fontSize="2" fontWeight="bold">
                Kingston Harbour
              </text>

              {/* Major Highway & Connecting Road Arteries across Kingston, Portmore & Spanish Town */}
              {showTrafficCorridors && (
                <g stroke="rgba(255, 255, 255, 0.14)" strokeWidth="0.6" strokeDasharray="1.2,1.2">
                  {/* Mandela Highway (Spanish Town to Kingston Corridor) */}
                  <path d="M 18,48 Q 38,46 62,54" fill="none" stroke="rgba(199, 125, 255, 0.4)" strokeWidth="0.8" />
                  {/* Portmore Municipal Blvd / Causeway to Kingston */}
                  <path d="M 42,75 Q 54,68 68,66" fill="none" stroke="rgba(14, 165, 233, 0.4)" strokeWidth="0.8" />
                  {/* Dyke Road (Portmore to Mandela Hwy connector) */}
                  <path d="M 42,70 L 40,50" fill="none" />
                  {/* Hope Road / Old Hope Road Corridor (Kingston) */}
                  <path d="M 65,48 Q 78,44 92,46" fill="none" />
                  {/* Constant Spring Road */}
                  <path d="M 72,25 L 68,50 L 70,68" fill="none" />
                  {/* Spanish Town Central Artery (Burke Rd / Brunswick Ave) */}
                  <path d="M 15,35 L 18,55 L 14,70" fill="none" />
                </g>
              )}

              {/* Region Landmark Area Labels */}
              <text x="18" y="28" fill="rgba(16, 185, 129, 0.4)" fontSize="2.5" fontWeight="bold" letterSpacing="0.5">
                SPANISH TOWN
              </text>
              <text x="36" y="85" fill="rgba(14, 165, 233, 0.4)" fontSize="2.5" fontWeight="bold" letterSpacing="0.5">
                PORTMORE
              </text>
              <text x="72" y="32" fill="rgba(199, 125, 255, 0.4)" fontSize="2.5" fontWeight="bold" letterSpacing="0.5">
                KINGSTON &amp; ST ANDREW
              </text>

              {/* Zones Polygonal Visual Anchors across all 3 regions */}
              {Object.entries(ALL_ZONES_GEO).map(([key, zone]) => {
                const zPos = geoToSvgCoords(zone.lat, zone.lng);
                const isClientZone = key === clientZone;
                const isHovered = activeZoneHover?.name === key;
                const regionColor = 
                  zone.region === 'Portmore' 
                    ? '#0EA5E9' 
                    : zone.region === 'Spanish Town' 
                    ? '#10B981' 
                    : '#C77DFF';

                return (
                  <g 
                    key={key} 
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveZoneHover(zone)}
                    onMouseLeave={() => setActiveZoneHover(null)}
                  >
                    {/* Zone Boundary Radar Circle */}
                    <circle
                      cx={zPos.x}
                      cy={zPos.y}
                      r={isClientZone ? "7" : "4.5"}
                      fill={
                        isClientZone
                          ? 'rgba(230, 57, 70, 0.16)'
                          : isHovered
                          ? `${regionColor}33`
                          : 'rgba(255, 255, 255, 0.02)'
                      }
                      stroke={
                        isClientZone
                          ? '#F59E0B'
                          : isHovered
                          ? regionColor
                          : 'rgba(255, 255, 255, 0.1)'
                      }
                      strokeWidth={isClientZone ? "0.8" : "0.3"}
                      strokeDasharray={isClientZone ? 'none' : '1,1'}
                    />

                    {/* Zone Dot */}
                    <circle
                      cx={zPos.x}
                      cy={zPos.y}
                      r="0.9"
                      fill={isClientZone ? '#F59E0B' : isHovered ? regionColor : 'rgba(255, 255, 255, 0.3)'}
                    />

                    {/* Zone Label */}
                    <text
                      x={zPos.x}
                      y={zPos.y + (isClientZone ? 4.8 : 3.8)}
                      textAnchor="middle"
                      fill={isClientZone ? '#FF8596' : isHovered ? regionColor : 'rgba(255,255,255,0.45)'}
                      fontSize={isClientZone ? "2.2" : "1.7"}
                      fontWeight={isClientZone ? "bold" : "500"}
                      className="transition-colors pointer-events-none"
                    >
                      {String(zone?.name || '').replace('Portmore - ', '').replace('Spanish Town - ', '').split('&')[0].trim()}
                    </text>
                  </g>
                );
              })}

              {/* Active Route Arc (Connecting Selected Nurse to Client) */}
              {activeSelectedMetric && (
                <g>
                  {/* Route Trajectory Line */}
                  <path
                    d={`M ${activeSelectedMetric.svgPos.x},${activeSelectedMetric.svgPos.y} Q ${(activeSelectedMetric.svgPos.x + clientSvgPos.x) / 2 + 4},${(activeSelectedMetric.svgPos.y + clientSvgPos.y) / 2 - 4} ${clientSvgPos.x},${clientSvgPos.y}`}
                    fill="none"
                    stroke="url(#routeGlow)"
                    strokeWidth="1.2"
                    strokeDasharray="2,2"
                    className="animate-dash"
                  />

                  {/* Midpoint Distance Badge on SVG */}
                  <g 
                    transform={`translate(${
                      (activeSelectedMetric.svgPos.x + clientSvgPos.x) / 2
                    }, ${
                      (activeSelectedMetric.svgPos.y + clientSvgPos.y) / 2 - 3
                    })`}
                  >
                    <rect
                      x="-7"
                      y="-2.5"
                      width="14"
                      height="5"
                      rx="2"
                      fill="#1e0a2e"
                      stroke="#C77DFF"
                      strokeWidth="0.4"
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="1.9"
                      fontWeight="bold"
                    >
                      {activeSelectedMetric.distanceKm} km • ~{activeSelectedMetric.transitMins}m
                    </text>
                  </g>
                </g>
              )}

              {/* CLIENT LOCATION PIN & RADAR WAVES */}
              <g className="cursor-pointer" onClick={handleFocusClient}>
                {/* Outer animated radar pulse ring */}
                <circle
                  cx={clientSvgPos.x}
                  cy={clientSvgPos.y}
                  r="7"
                  fill="url(#clientPulseGrad)"
                  className="animate-ping opacity-75"
                />

                {/* Middle beacon ring */}
                <circle
                  cx={clientSvgPos.x}
                  cy={clientSvgPos.y}
                  r="3.5"
                  fill={isGpsActive ? "rgba(16, 185, 129, 0.4)" : "rgba(230, 57, 70, 0.4)"}
                  stroke={isGpsActive ? "#10B981" : "#F59E0B"}
                  strokeWidth="0.8"
                />

                {/* Center Solid Core */}
                <circle
                  cx={clientSvgPos.x}
                  cy={clientSvgPos.y}
                  r="1.8"
                  fill="#FFFFFF"
                />

                {/* Client Pin Floating Label */}
                <g transform={`translate(${clientSvgPos.x}, ${clientSvgPos.y - 4})`}>
                  <rect
                    x="-12"
                    y="-4"
                    width="24"
                    height="4"
                    rx="1.5"
                    fill={isGpsActive ? "#059669" : "#F59E0B"}
                    stroke="#FFFFFF"
                    strokeWidth="0.3"
                  />
                  <text
                    x="0"
                    y="-1.3"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="1.7"
                    fontWeight="800"
                  >
                    {isGpsActive ? '📍 LIVE GPS LOCATION' : 'YOUR HOME BASE'}
                  </text>
                </g>
              </g>

              {/* NURSE MARKERS */}
              {filteredNurses.map((nm) => {
                const isSelected = selectedNurse?.id === nm.nurse.id;
                const isHovered = hoveredNurseId === nm.nurse.id;

                return (
                  <g
                    key={nm.nurse.id}
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => onSelectNurse(nm.nurse)}
                    onMouseEnter={() => setHoveredNurseId(nm.nurse.id)}
                    onMouseLeave={() => setHoveredNurseId(null)}
                    style={{
                      transform: isSelected || isHovered ? 'scale(1.15)' : 'scale(1)',
                      transformOrigin: `${nm.svgPos.x}% ${nm.svgPos.y}%`
                    }}
                  >
                    {/* Glowing Selection Aura */}
                    {isSelected && (
                      <circle
                        cx={nm.svgPos.x}
                        cy={nm.svgPos.y}
                        r="6"
                        fill="rgba(114, 9, 183, 0.4)"
                        stroke="#C77DFF"
                        strokeWidth="0.8"
                        className="animate-pulse"
                      />
                    )}

                    {/* Outer Nurse Pin Halo */}
                    <circle
                      cx={nm.svgPos.x}
                      cy={nm.svgPos.y}
                      r="4"
                      fill={isSelected ? '#1E1B4B' : '#1e0b2e'}
                      stroke={isSelected ? '#FFFFFF' : '#C77DFF'}
                      strokeWidth="0.6"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
                    />

                    {/* Clip-Path Photo inside Pin */}
                    <clipPath id={`clip-${nm.nurse.id}`}>
                      <circle cx={nm.svgPos.x} cy={nm.svgPos.y} r="3.2" />
                    </clipPath>

                    <image
                      href={nm.nurse.photoUrl}
                      x={nm.svgPos.x - 3.2}
                      y={nm.svgPos.y - 3.2}
                      width="6.4"
                      height="6.4"
                      clipPath={`url(#clip-${nm.nurse.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />

                    {/* Verified NCJ Shield Badge on Pin Top-Right */}
                    <circle
                      cx={nm.svgPos.x + 2.4}
                      cy={nm.svgPos.y - 2.4}
                      r="1.4"
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth="0.3"
                    />

                    {/* Floating Proximity Pill above Nurse */}
                    <g transform={`translate(${nm.svgPos.x}, ${nm.svgPos.y - 5.5})`}>
                      <rect
                        x="-9"
                        y="-3"
                        width="18"
                        height="3.4"
                        rx="1.2"
                        fill={isSelected ? '#1E1B4B' : 'rgba(20, 5, 30, 0.92)'}
                        stroke={isSelected ? '#C77DFF' : 'rgba(255,255,255,0.3)'}
                        strokeWidth="0.3"
                      />
                      <text
                        x="0"
                        y="-0.7"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="1.7"
                        fontWeight="700"
                      >
                        {nm.distanceKm} km • ~{nm.transitMins}m
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Floating In-Map Compass & Zoom Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-black/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/15 shadow-xl">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.8))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-300 transition"
              title="Reset radar center"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowTrafficCorridors(!showTrafficCorridors)}
              className={`p-2 rounded-xl transition ${
                showTrafficCorridors ? 'bg-purple-500/30 text-purple-200' : 'bg-white/5 text-slate-400'
              }`}
              title="Toggle Kingston traffic corridors"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Map Attribution and Legend (Bottom Overlay) */}
          <div className="relative z-10 m-4 p-3 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] border border-white" />
                <span>Your Location ({clientZone})</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E1B4B] border border-[#C77DFF]" />
                <span>Active Licensed Nurse</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>NCJ Verified</span>
              </span>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Google Maps Grounding</span>
              <span>•</span>
              <span>Attribution ID: gmp_mcp_codeassist_v1_aistudio</span>
            </div>
          </div>
        </div>

        {/* NURSE SELECTION & PROXIMITY DECK (Col 5 on desktop) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Closest Registered Nurses ({filteredNurses.length})
              </span>
              <span className="text-[11px] text-purple-300">
                Sorted by proximity to {clientZone}
              </span>
            </div>

            {/* Nurse Cards List */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredNurses.map((nm) => {
                const isSelected = selectedNurse?.id === nm.nurse.id;
                const isHovered = hoveredNurseId === nm.nurse.id;

                return (
                  <div
                    key={nm.nurse.id}
                    onClick={() => onSelectNurse(nm.nurse)}
                    onMouseEnter={() => setHoveredNurseId(nm.nurse.id)}
                    onMouseLeave={() => setHoveredNurseId(null)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'border-[#C77DFF] bg-gradient-to-br from-[#1E1B4B]/40 via-[#2b0c3f]/80 to-[#1b0526]/90 shadow-xl ring-2 ring-purple-500/40'
                        : isHovered
                        ? 'border-purple-400/40 bg-white/[0.08]'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Photo & Identity */}
                      <div className="flex items-center gap-3">
                        <div 
                          className="relative shrink-0 cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewNurseProfile) onViewNurseProfile(nm.nurse);
                          }}
                          title="Click to view verified profile"
                        >
                          <img
                            src={nm.nurse.photoUrl}
                            alt={nm.nurse.name}
                            className={`w-13 h-13 rounded-full object-cover border-2 shadow-md transition group-hover:scale-105 ${
                              isSelected ? 'border-purple-300 ring-2 ring-[#1E1B4B]' : 'border-purple-500/40'
                            }`}
                          />
                          {nm.nurse.status === 'approved' && (
                            <span 
                              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-xs" 
                              title="Nursing Council of Jamaica Verified"
                            >
                              <ShieldCheck className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onViewNurseProfile) onViewNurseProfile(nm.nurse);
                              }}
                              className="font-bold text-white text-xs leading-tight hover:text-purple-300 transition cursor-pointer"
                            >
                              {nm.nurse.name}
                            </h4>
                          </div>

                          <div className="mt-1">
                            {nm.nurse.status === 'approved' ? (
                              <VerifiedNursingCouncilBadge 
                                nurse={nm.nurse} 
                                size="xs" 
                                variant="trust-pill"
                                label="NCJ Registered"
                                viewerRole="client"
                                showLicense={false}
                              />
                            ) : (
                              <span className="text-[10px] text-amber-300 font-medium">
                                Pending NCJ Vetting
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
                            <span className="flex items-center text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                              {nm.nurse.rating}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">{nm.nurse.yearsExperience} yrs exp</span>
                          </div>
                        </div>
                      </div>

                      {/* Distance & ETA Chip */}
                      <div className="text-right shrink-0">
                        <div className="inline-flex flex-col items-end">
                          <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[11px] font-extrabold flex items-center gap-1">
                            <Car className="w-3 h-3 text-[#F59E0B]" />
                            <span>{nm.distanceKm} km</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                            ~{nm.transitMins} min transit
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Specialties & Zones Tags */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {(nm?.nurse?.specialties || []).slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded-lg text-[10px] bg-white/5 text-slate-300 border border-white/10 font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                      {nm.inZone && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          ✓ Primary Zone
                        </span>
                      )}
                    </div>

                    {/* Bottom Pricing & Selection Confirmation */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewNurseProfile) onViewNurseProfile(nm.nurse);
                        }}
                        className="text-[11px] font-semibold text-purple-300 hover:text-white flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Verified Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNurse(nm.nurse);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-md'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Nurse Selected</span>
                          </>
                        ) : (
                          <span>Select Nurse</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Nurse Summary & Continue Bar */}
          {selectedNurse && activeSelectedMetric && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1E1B4B]/40 via-[#230d36] to-[#F59E0B]/30 border border-purple-400/40 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C77DFF]">
                  Ready to Dispatch
                </span>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {selectedNurse.name}
                  </h4>
                  {selectedNurse.status === 'approved' && (
                    <VerifiedNursingCouncilBadge 
                      nurse={selectedNurse} 
                      size="xs" 
                      variant="trust-pill"
                      label="Verified by Council"
                      showLicense={true}
                    />
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  <strong>{activeSelectedMetric.distanceKm} km away</strong> • Est. arrival in <strong>{activeSelectedMetric.transitMins} mins</strong>
                </p>
              </div>

              {onContinue && (
                <button
                  onClick={onContinue}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-950/60 transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
