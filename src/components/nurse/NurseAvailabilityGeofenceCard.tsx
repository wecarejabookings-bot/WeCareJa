import React, { useState } from 'react';
import { 
  Radio, 
  Moon, 
  Compass, 
  MapPin, 
  ShieldCheck, 
  Sliders, 
  Crosshair, 
  Check, 
  Sparkles,
  Info,
  Car,
  Clock
} from 'lucide-react';
import { NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { getGeofenceRadiusLabel } from '../../utils/geofencing';
import { ALL_ZONES_GEO, findNearestZone, JAMAICA_DEMO_LOCATIONS } from '../../data/geoData';

interface NurseAvailabilityGeofenceCardProps {
  nurse: NurseProfile;
  onUpdateNurseProfile: (updatedNurse: NurseProfile) => void;
  activeBookingsCount?: number;
}

export const NurseAvailabilityGeofenceCard: React.FC<NurseAvailabilityGeofenceCardProps> = ({
  nurse,
  onUpdateNurseProfile,
  activeBookingsCount = 0
}) => {
  const isOnCall = nurse.availabilityStatus !== 'offline';
  const currentRadius = nurse.geofenceRadiusKm || 15;
  const isStrictEnforced = nurse.geofenceStrictEnforcement ?? false;
  
  const [showGeofenceSettings, setShowGeofenceSettings] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Quick Toggle Handler
  const handleToggleAvailability = () => {
    const newStatus: 'on_call' | 'offline' = isOnCall ? 'offline' : 'on_call';
    
    if (newStatus === 'on_call') {
      soundFX.playAvailabilityOnCall();
    } else {
      soundFX.playAvailabilityOffline();
    }

    const updated: NurseProfile = {
      ...nurse,
      availabilityStatus: newStatus,
      lastAvailabilityToggleAt: new Date().toISOString()
    };

    onUpdateNurseProfile(updated);
  };

  // Change Geofence Radius
  const handleRadiusChange = (newRadius: number) => {
    soundFX.playToggleClick();
    const updated: NurseProfile = {
      ...nurse,
      geofenceRadiusKm: newRadius
    };
    onUpdateNurseProfile(updated);
  };

  // Toggle Strict Geofence Enforcement
  const handleToggleStrict = () => {
    soundFX.playToggleClick();
    const updated: NurseProfile = {
      ...nurse,
      geofenceStrictEnforcement: !isStrictEnforced
    };
    onUpdateNurseProfile(updated);
  };

  // Calibrate Anchor to Live GPS
  const handleCalibrateGps = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    setLocationSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        const nearest = findNearestZone(latitude, longitude);

        const updated: NurseProfile = {
          ...nurse,
          currentLat: latitude,
          currentLng: longitude,
          geofenceAnchorName: `${nearest.zone.name} (${accuracy < 100 ? 'High-Precision GPS' : 'Live GPS'})`,
          geofenceActiveParish: nearest.zone.parish
        };

        onUpdateNurseProfile(updated);
        soundFX.playSuccessPing();
        setLocationSuccessMsg(`Geofence anchored to live coordinates near ${nearest.zone.name} (±${Math.round(accuracy)}m).`);
        setTimeout(() => setLocationSuccessMsg(null), 5000);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(`GPS error (${error.code}): ${error.message}. You can select a Jamaican community below.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Set Demo Landmark Anchor
  const handleSetLandmarkAnchor = (landmark: typeof JAMAICA_DEMO_LOCATIONS[0]) => {
    soundFX.playToggleClick();
    const nearest = findNearestZone(landmark.lat, landmark.lng);
    const updated: NurseProfile = {
      ...nurse,
      currentLat: landmark.lat,
      currentLng: landmark.lng,
      geofenceAnchorName: landmark.name,
      geofenceActiveParish: nearest.zone.parish
    };
    onUpdateNurseProfile(updated);
    setLocationSuccessMsg(`Anchor calibrated to ${landmark.name}`);
    setTimeout(() => setLocationSuccessMsg(null), 4000);
  };

  const anchorDisplay = nurse.geofenceAnchorName || nurse.zones?.[0] || 'Liguanea & Mona, Kingston 6';
  const radiusPresets = [5, 10, 15, 25, 35];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#19092c]/90 to-purple-950/70 border border-white/15 backdrop-blur-2xl shadow-2xl p-5 md:p-6 text-white relative overflow-hidden transition-all duration-300">
      {/* Background ambient lighting */}
      <div 
        className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isOnCall ? 'bg-emerald-500/20' : 'bg-slate-700/20'
        }`} 
      />

      <div className="relative z-10 space-y-5">
        {/* Top Header: Title & Quick Status Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/30 flex items-center gap-1.5 shadow-sm">
                <Sliders className="w-3.5 h-3.5 text-[#C77DFF]" />
                <span>Practitioner Dispatch Controller</span>
              </span>

              {nurse.lastAvailabilityToggleAt && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>
                    Updated: {new Date(nurse.lastAvailabilityToggleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </span>
              )}
            </div>

            <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
              Live Availability &amp; Geofencing Boundary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Switch between <strong>On-Call</strong> (accepting patient dispatch in your active corridor) and <strong>Offline</strong> (off-duty). Client booking screens update in real-time.
            </p>
          </div>

          {/* Quick Toggle Switch Button */}
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-2 rounded-2xl shrink-0">
            <div className="text-right pr-1">
              <div className={`text-xs font-black uppercase tracking-wider flex items-center justify-end gap-1.5 ${
                isOnCall ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {isOnCall ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>On-Call</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3 h-3 text-slate-400" />
                    <span>Offline</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                {isOnCall ? 'In Client Booking Pool' : 'Off-Duty / Paused'}
              </div>
            </div>

            {/* Tactile Switch */}
            <button
              type="button"
              onClick={handleToggleAvailability}
              className={`w-16 h-9 rounded-full transition-all duration-300 p-1 flex items-center cursor-pointer shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                isOnCall 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 justify-end' 
                  : 'bg-slate-700 justify-start'
              }`}
              title={isOnCall ? "Click to toggle Offline (Off-Duty)" : "Click to toggle On-Call (Ready for Dispatch)"}
              aria-label="Toggle availability status"
            >
              <div className={`w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center transition-all transform ${
                isOnCall ? 'scale-105' : 'scale-95'
              }`}>
                {isOnCall ? (
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Live Status Overview Banner */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isOnCall 
            ? 'bg-emerald-950/30 border-emerald-500/30 shadow-lg shadow-emerald-950/20' 
            : 'bg-slate-900/60 border-slate-700/60'
        }`}>
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              isOnCall 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {isOnCall ? (
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              ) : (
                <Moon className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-bold ${isOnCall ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {isOnCall ? '🟢 Live & Ready for Patient Dispatch' : '⚪ Currently Off-Duty / Paused'}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300 border border-white/10">
                  {activeBookingsCount} Active Booking{activeBookingsCount === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isOnCall 
                  ? `You appear as On-Call for patients within your ${currentRadius} km geofence around ${anchorDisplay}.` 
                  : 'Your profile is flagged as Off-Duty. Patients cannot request immediate on-demand visits.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowGeofenceSettings(!showGeofenceSettings)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                showGeofenceSettings
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                  : 'bg-white/10 hover:bg-white/15 text-purple-200 border-white/15'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#C77DFF]" />
              <span>{showGeofenceSettings ? 'Hide Geofence Controls' : 'Configure Geofence & GPS'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Geofencing Settings Panel */}
        {showGeofenceSettings && (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/15 space-y-6 animate-fadeIn">
            {/* Geofence Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Geofencing &amp; Service Radius Configuration</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Set how far you are willing to travel from your anchor location in Jamaica.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Strict Radius Enforcement:</span>
                <button
                  type="button"
                  onClick={handleToggleStrict}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border flex items-center gap-1.5 ${
                    isStrictEnforced
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                  title="When strict is ON, clients outside your radius cannot book you"
                >
                  {isStrictEnforced ? 'Strict (Inside Radius Only)' : 'Flexible (Extended Travel Allowed)'}
                </button>
              </div>
            </div>

            {/* Radius Presets and Slider */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span>Active Service Boundary:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {currentRadius} km ({getGeofenceRadiusLabel(currentRadius)})
                  </span>
                </label>

                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Est. transit time buffer: ~{Math.round((currentRadius / 25) * 60) + 4} mins</span>
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {radiusPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleRadiusChange(preset)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 border ${
                      currentRadius === preset
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <span className="font-extrabold text-sm">{preset} km</span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-tight">
                      {preset <= 5 ? 'Ward' : preset <= 10 ? 'Core Metro' : preset <= 15 ? 'Greater Metro' : preset <= 25 ? 'Corridor' : 'Tri-Parish'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Smooth Range Slider */}
              <div className="pt-2">
                <input
                  type="range"
                  min="3"
                  max="35"
                  step="1"
                  value={currentRadius}
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#7209B7]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>3 km (Tight ward)</span>
                  <span>15 km (Metro recommendation)</span>
                  <span>35 km (Max tri-parish)</span>
                </div>
              </div>
            </div>

            {/* GPS Anchor Point Management */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>Current Geofence Center Anchor</span>
                  </div>
                  <div className="text-xs text-cyan-300 font-semibold">
                    {anchorDisplay}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Coords: {nurse.currentLat?.toFixed(4) || '18.0074'}° N, {nurse.currentLng?.toFixed(4) || '-76.7836'}° W
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCalibrateGps}
                  disabled={isLocating}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Acquiring GPS...' : 'Calibrate to Device GPS'}</span>
                </button>
              </div>

              {/* Feedback messages */}
              {locationSuccessMsg && (
                <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{locationSuccessMsg}</span>
                </div>
              )}

              {locationError && (
                <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{locationError}</span>
                </div>
              )}

              {/* Quick Anchor Presets */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[11px] text-slate-400 font-medium block mb-2">
                  Quick Landmark Anchors (Kingston, Portmore &amp; Spanish Town):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {JAMAICA_DEMO_LOCATIONS.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSetLandmarkAnchor(loc)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-[#C77DFF]" />
                      <span>{loc.name.split(' (')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Geofence Radar Visual Simulation */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900/60 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live Geofence Radar Boundary Active</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Patients residing within {currentRadius} km of {anchorDisplay} will see you prioritized as <strong>"In Geofence"</strong> on their booking screen.
                  </p>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold shrink-0">
                Coverage: ~{Math.round(Math.PI * currentRadius * currentRadius)} km²
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
