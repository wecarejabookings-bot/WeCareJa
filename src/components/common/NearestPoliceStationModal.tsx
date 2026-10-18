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

interface NearestPoliceStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress?: string;
  initialLat?: number | null;
  initialLng?: number | null;
}

export const NearestPoliceStationModal: React.FC<NearestPoliceStationModalProps> = ({
  isOpen,
  onClose,
  userAddress = 'Kingston & St. Andrew, Jamaica',
  initialLat = null,
  initialLng = null
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

  const getCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9+]/g, '');
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
                Nearest Police Station to Your Location
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
                <a
                  href={`tel:${getCleanPhone(nearestStation.primaryPhone)}`}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-950/60 transition group cursor-pointer border border-red-400/30"
                >
                  <PhoneCall className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  <span>Call Station: {nearestStation.primaryPhone}</span>
                </a>

                {nearestStation.secondaryPhone && (
                  <a
                    href={`tel:${getCleanPhone(nearestStation.secondaryPhone)}`}
                    className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition cursor-pointer"
                    title="Call secondary line"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-300" />
                    <span>Alt: {nearestStation.secondaryPhone}</span>
                  </a>
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
                      <a
                        href={`tel:${getCleanPhone(station.primaryPhone)}`}
                        className="px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-blue-500/40 cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{station.primaryPhone}</span>
                      </a>
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

            <a
              href="tel:119"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 119</span>
            </a>
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
