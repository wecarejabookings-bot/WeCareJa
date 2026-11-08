import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  LocateFixed, 
  Radio, 
  Clock, 
  Check, 
  X,
  AlertOctagon,
  Building2,
  Share2
} from 'lucide-react';
import { 
  findNearestPoliceStations, 
  NearbyPoliceStationResult, 
  PoliceStation 
} from '../../data/jamaicaPoliceStations';
import { formatCoordinates } from '../../utils/locationDetector';
import { AIEmergencyVoicePoliceDispatch } from './AIEmergencyVoicePoliceDispatch';

interface NearestPoliceStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress?: string;
  initialLat?: number | null;
  initialLng?: number | null;
  userRole?: 'client' | 'nurse' | 'admin';
  userName?: string;
}

export const NearestPoliceStationModal: React.FC<NearestPoliceStationModalProps> = ({
  isOpen,
  onClose,
  userAddress = 'Kingston & St. Andrew, Jamaica',
  initialLat = null,
  initialLng = null,
  userRole = 'client',
  userName
}) => {
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (initialLat && initialLng) {
      return { lat: initialLat, lng: initialLng };
    }
    return null;
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting exact GPS location...');
  const [nearbyStations, setNearbyStations] = useState<NearbyPoliceStationResult[]>(() => {
    return findNearestPoliceStations(initialLat, initialLng, userAddress, 4);
  });
  const [copiedStationId, setCopiedStationId] = useState<string | null>(null);

  // Trigger live GPS detection upon opening
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.geolocation) {
      setIsLocating(true);
      setLocationStatus('Acquiring high-accuracy GPS coordinates...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsCoords({ lat, lng });
          setIsLocating(false);
          setLocationStatus('Exact GPS location verified');

          const stations = findNearestPoliceStations(lat, lng, userAddress, 4);
          setNearbyStations(stations);
        },
        (error) => {
          console.warn('Geolocation lookup note:', error.message);
          setIsLocating(false);
          setLocationStatus('Using corridor address estimate');
          const stations = findNearestPoliceStations(initialLat, initialLng, userAddress, 4);
          setNearbyStations(stations);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    } else {
      setLocationStatus('Using corridor address estimate');
      const stations = findNearestPoliceStations(initialLat, initialLng, userAddress, 4);
      setNearbyStations(stations);
    }
  }, [isOpen, userAddress, initialLat, initialLng]);

  if (!isOpen) return null;

  const nearestStation = nearbyStations[0];
  const otherStations = nearbyStations.slice(1);

  const handleCopyStationDetails = (station: NearbyPoliceStationResult) => {
    const text = `Nearest Police Station: ${station.name}\nAddress: ${station.address}\nPhone: ${station.primaryPhone}\nDistance: ${station.distanceKm} km\nExact Location: ${userAddress}`;
    navigator.clipboard.writeText(text);
    setCopiedStationId(station.id);
    setTimeout(() => setCopiedStationId(null), 2500);
  };

  const formatTelHref = (phone: string) => {
    const digits = phone.replace(/[^0-9+]/g, '');
    if (digits === '119' || digits === '110') return `tel:${digits}`;
    if (digits.startsWith('+1')) return `tel:${digits}`;
    if (digits.startsWith('1') && digits.length === 11) return `tel:+${digits}`;
    if (digits.startsWith('876') && digits.length === 10) return `tel:+1${digits}`;
    return `tel:${digits}`;
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9+]/g, '');
  };

  // 30-Second Automatic Failsafe Call Timer
  const [autoCallSeconds, setAutoCallSeconds] = useState<number>(30);
  const [isAutoCallActive, setIsAutoCallActive] = useState<boolean>(true);
  const [selectedAction, setSelectedAction] = useState<{
    type: '119' | 'station' | 'auto_nearest';
    name: string;
    phone: string;
  } | null>(null);
  const [hasAutoCalled, setHasAutoCalled] = useState<boolean>(false);

  // 30-second countdown: if no selection is made, automatically call nearest station based on user location
  useEffect(() => {
    if (!isOpen || !isAutoCallActive || selectedAction !== null || hasAutoCalled) return;

    if (autoCallSeconds <= 0) {
      const targetStation = nearestStation || nearbyStations[0];
      if (targetStation) {
        setSelectedAction({
          type: 'auto_nearest',
          name: targetStation.name,
          phone: targetStation.primaryPhone
        });
        setHasAutoCalled(true);
        setIsAutoCallActive(false);

        try {
          if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(`30 seconds elapsed with no selection. Calling nearest police station: ${targetStation.name} now.`);
            utter.rate = 1.05;
            window.speechSynthesis.speak(utter);
          }
        } catch {}

        // Execute the actual phone call to the nearest police station automatically
        window.location.href = formatTelHref(targetStation.primaryPhone);
      } else {
        setSelectedAction({
          type: '119',
          name: '119 Police & National Emergency',
          phone: '119'
        });
        setHasAutoCalled(true);
        setIsAutoCallActive(false);
        window.location.href = 'tel:119';
      }
      return;
    }

    const timer = setTimeout(() => {
      setAutoCallSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoCallSeconds, isAutoCallActive, isOpen, selectedAction, hasAutoCalled, nearestStation, nearbyStations]);

  const handleSelectCall = (type: '119' | 'station', name: string, phone: string) => {
    setIsAutoCallActive(false);
    setSelectedAction({ type, name, phone });
    setHasAutoCalled(false);
    window.location.href = formatTelHref(phone);
  };

  const handleCancelAutoCall = () => {
    setIsAutoCallActive(false);
  };

  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div 
        className="bg-gradient-to-b from-slate-900 via-[#0B132B] to-slate-950 rounded-3xl max-w-xl w-full border-2 border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden text-white flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="police-modal-title"
      >
        {/* Header */}
        <div className="bg-red-600/95 text-white px-5 py-4 border-b border-red-400/40 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-red-600 flex items-center justify-center font-black shadow-md shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  Emergency JCF Police
                </span>
                <span className="text-[11px] font-bold text-red-100 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-ping text-yellow-300" /> Live Police Directory
                </span>
              </div>
              <h2 id="police-modal-title" className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                Emergency Call &amp; Nearest Police Station
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-black/30 hover:bg-black/50 text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
            aria-label="Close police station option popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* User Location Pill */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-xl shrink-0 ${isLocating ? 'bg-amber-500/20 text-amber-300 animate-spin' : 'bg-emerald-500/20 text-emerald-300'}`}>
                <LocateFixed className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {locationStatus}
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {gpsCoords ? formatCoordinates(gpsCoords.lat, gpsCoords.lng) : userAddress}
                </p>
              </div>
            </div>

            {gpsCoords && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-[10px] font-black shrink-0">
                GPS LOCKED
              </span>
            )}
          </div>

          {/* Emergency 30-Second Auto-Call Failsafe Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-red-950/90 via-red-900/60 to-black/90 border-2 border-red-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-red-200">
                  Emergency Call Selector
                </span>
              </div>

              {isAutoCallActive && selectedAction === null && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-black text-xs shadow-md animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Auto-Call in {autoCallSeconds}s</span>
                </div>
              )}
            </div>

            {hasAutoCalled && selectedAction ? (
              <div className="p-3.5 rounded-2xl bg-red-600/30 border border-red-400/50 space-y-2">
                <div className="flex items-center gap-2 text-yellow-300 font-black text-sm">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>AUTOMATIC CALL PLACED: {selectedAction.name}</span>
                </div>
                <p className="text-xs text-slate-200">
                  30-second failsafe timer elapsed with no manual selection. WeCare automatically placed the phone call to your nearest station: <strong>{selectedAction.phone}</strong> based on your GPS location.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectCall(selectedAction.type as any, selectedAction.name, selectedAction.phone)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg transition cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Redial {selectedAction.name} ({selectedAction.phone})</span>
                  </button>
                </div>
              </div>
            ) : selectedAction ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>CALL INITIATED: {selectedAction.name}</span>
                </div>
                <p className="text-xs text-slate-200">
                  Dialing <strong>{selectedAction.phone}</strong>. If your phone dialer did not open automatically, tap below to connect.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectCall(selectedAction.type as any, selectedAction.name, selectedAction.phone)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Connect Call ({selectedAction.phone})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Select <strong>119</strong> or your <strong>nearest station</strong> below to call immediately. If no selection is made, your device will <strong>automatically call {nearestStation?.name || 'the nearest police station'} in {autoCallSeconds} seconds</strong> based on your live location.
                </p>

                {/* Progress Bar */}
                {isAutoCallActive && (
                  <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/10">
                    <div
                      className="bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500 h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(autoCallSeconds / 30) * 100}%` }}
                    />
                  </div>
                )}

                {/* Quick Selection Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Option A: Call 119 */}
                  <button
                    type="button"
                    onClick={() => handleSelectCall('119', '119 Police & National Emergency', '119')}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm flex items-center justify-between shadow-xl transition cursor-pointer border border-red-400/40 group"
                  >
                    <div className="text-left">
                      <span className="text-[10px] text-red-200 uppercase tracking-wider block font-bold">Select Choice 1</span>
                      <span className="text-base font-black">Call 119</span>
                      <span className="text-[11px] text-red-100 block font-normal">Police &amp; National Emergency</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/20 group-hover:scale-110 transition shrink-0">
                      <PhoneCall className="w-5 h-5 text-white" />
                    </div>
                  </button>

                  {/* Option B: Call Nearest Station */}
                  {nearestStation && (
                    <button
                      type="button"
                      onClick={() => handleSelectCall('station', nearestStation.name, nearestStation.primaryPhone)}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-between shadow-xl transition cursor-pointer border border-blue-400/40 group"
                    >
                      <div className="text-left min-w-0 pr-2">
                        <span className="text-[10px] text-blue-200 uppercase tracking-wider block font-bold">
                          Select Choice 2 • ~{nearestStation.distanceKm} km
                        </span>
                        <span className="text-sm font-black truncate block">{nearestStation.name}</span>
                        <span className="text-[11px] text-blue-100 block font-mono font-normal">{nearestStation.primaryPhone}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/20 group-hover:scale-110 transition shrink-0">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Auto-Call Status / Cancel */}
                {isAutoCallActive && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>⚡ Auto-calling nearest station when timer hits 0s</span>
                    <button
                      type="button"
                      onClick={handleCancelAutoCall}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold transition cursor-pointer border border-white/10"
                    >
                      Cancel Auto-Call
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Voice Police Dispatcher (Can also speak script if desired) */}
          <AIEmergencyVoicePoliceDispatch
            userRole={userRole}
            userName={userName}
            lat={gpsCoords?.lat ?? initialLat}
            lng={gpsCoords?.lng ?? initialLng}
            address={userAddress}
            nearestStationName={nearestStation?.name}
            nearestStationPhone={nearestStation?.primaryPhone}
            nearestStationDistanceKm={nearestStation?.distanceKm}
            autoStartCountdown={false}
          />

          {/* Featured #1 Closest Police Station */}
          {nearestStation && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/70 border-2 border-blue-500/60 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Building2 className="w-3.5 h-3.5" /> #1 Closest Police Station
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{nearestStation.estimatedDriveMinutes} min drive • {nearestStation.distanceKm} km away
                </span>
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">
                {nearestStation.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{nearestStation.address} ({nearestStation.division} Division)</span>
              </p>

              {/* Action Buttons for Nearest Station */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectCall('station', nearestStation.name, nearestStation.primaryPhone)}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-950/60 transition group cursor-pointer border border-red-400/30"
                >
                  <PhoneCall className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  <span>Call Station: {nearestStation.primaryPhone}</span>
                </button>

                {nearestStation.secondaryPhone && (
                  <button
                    type="button"
                    onClick={() => handleSelectCall('station', `${nearestStation.name} (Alt)`, nearestStation.secondaryPhone!)}
                    className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition cursor-pointer"
                    title="Call secondary line"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-300" />
                    <span>Alt: {nearestStation.secondaryPhone}</span>
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${nearestStation.lat},${nearestStation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-4 rounded-2xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-400/40 transition cursor-pointer"
                  title="Open GPS driving directions in Google Maps"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-300" />
                  <span className="hidden sm:inline">Directions</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyStationDetails(nearestStation)}
                  className="py-3.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center border border-white/10 transition cursor-pointer"
                  title="Copy details to clipboard"
                >
                  {copiedStationId === nearestStation.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Other Nearby Police Stations */}
          {otherStations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Other Nearby Police Stations in Corridor</span>
                <span className="text-[10px] text-slate-400 font-normal">Sorted by distance</span>
              </h4>

              <div className="space-y-2">
                {otherStations.map((station) => (
                  <div
                    key={station.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{station.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-slate-300">
                          {station.distanceKm} km
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {station.address} • {station.division}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectCall('station', station.name, station.primaryPhone)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-blue-500/40 cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{station.primaryPhone}</span>
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
                        title="Directions"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* National 119 Speed Dial Bar */}
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Jamaica National Emergency</span>
                <span className="text-[11px] text-slate-300">Universal Police &amp; Tactical Dispatch</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectCall('119', '119 Police & National Emergency', '119')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 119</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/[0.03] border-t border-white/10 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            JCF Emergency Station Network &bull; Jamaica
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/15 cursor-pointer"
          >
            Dismiss &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
};
