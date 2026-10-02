import React from 'react';
import { 
  Zap, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  Calendar, 
  Phone,
  ArrowRight
} from 'lucide-react';
import { NurseProfile } from '../../types';
import { calculateZoneWaitTimeReduction } from '../../utils/zoneAlertsUtils';

interface ZoneAvailabilityAlertBannerProps {
  nurse: NurseProfile;
  zone: string;
  estWaitMinutes?: number;
  savedWaitMinutes?: number;
  onBookFastTrack: (nurse: NurseProfile, zone: string) => void;
  onViewProfile?: (nurse: NurseProfile) => void;
  onDismiss: () => void;
}

export const ZoneAvailabilityAlertBanner: React.FC<ZoneAvailabilityAlertBannerProps> = ({
  nurse,
  zone,
  estWaitMinutes = 14,
  savedWaitMinutes = 60,
  onBookFastTrack,
  onViewProfile,
  onDismiss
}) => {
  const reduction = calculateZoneWaitTimeReduction(zone);
  const waitTime = estWaitMinutes || reduction.estWaitMinutes;
  const saved = savedWaitMinutes || reduction.savedWaitMinutes;

  const careLevelTitle = 
    nurse.careLevel === 'registered_nurse' ? 'Registered Nurse (RN)' :
    (nurse.careLevel as string) === 'practical_nurse' || nurse.careLevel === 'practical_nurse_aide' ? 'Licensed Practical Nurse (LPN)' :
    'Certified Geriatric Aide';

  return (
    <div className="relative z-40 w-full mb-4 animate-slideDown">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/90 via-purple-950/85 to-slate-950/95 border-2 border-emerald-400/60 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl">
        {/* Background glow lines */}
        <div className="absolute top-0 right-0 w-80 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Left: Nurse info and zone alert */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            {/* Avatar with live pulse badge */}
            <div className="relative shrink-0">
              <img
                src={nurse.photoUrl}
                alt={nurse.name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-md"
              />
              <span 
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center"
                title="Now Active & Ready to Dispatch"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </span>
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-[10px] font-black text-emerald-300 uppercase tracking-wider">
                  <Zap className="w-3 h-3 text-emerald-300 fill-emerald-300 animate-pulse" />
                  <span>Proactive Zone Alert</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-[10px] font-bold border border-purple-400/30">
                  <MapPin className="w-2.5 h-2.5 text-rose-400" />
                  <span>{zone} ({reduction.meta.parish})</span>
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold">
                  <Clock className="w-3 h-3" />
                  <span>Est. {waitTime}m Arrival (Saved ~{saved}m)</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-white truncate">
                  {nurse.name}
                </h4>
                <span className="text-xs text-purple-300 font-semibold truncate hidden sm:inline">
                  • {careLevelTitle}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs text-amber-300 font-bold">
                  ★ {nurse.rating || 4.9}
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">
                On-duty right in <strong>{zone}</strong>. Skip normal 75-min city-wide dispatch traffic and receive care in ~<strong>{waitTime} minutes</strong>!
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            {onViewProfile && (
              <button
                type="button"
                onClick={() => onViewProfile(nurse)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition border border-white/10"
              >
                Profile
              </button>
            )}

            <button
              type="button"
              onClick={() => onBookFastTrack(nurse, zone)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:opacity-95 text-white text-xs font-black transition shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Fast-Track Book ({waitTime}m)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
