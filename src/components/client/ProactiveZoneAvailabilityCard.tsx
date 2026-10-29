import React from 'react';
import { 
  Bell, 
  Zap, 
  MapPin, 
  Clock, 
  Sliders, 
  Sparkles, 
  Check, 
  TrendingDown, 
  Volume2, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ClientZoneAvailabilityAlertSettings, NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface ProactiveZoneAvailabilityCardProps {
  settings: ClientZoneAvailabilityAlertSettings;
  onOpenSettings: () => void;
  onToggleEnabled: () => void;
  onSimulateAlert: () => void;
  nurses: NurseProfile[];
}

export const ProactiveZoneAvailabilityCard: React.FC<ProactiveZoneAvailabilityCardProps> = ({
  settings,
  onOpenSettings,
  onToggleEnabled,
  onSimulateAlert,
  nurses
}) => {
  const watchedZones = settings?.watchedZones || [];
  const activeInWatched = (nurses || []).filter(n => 
    n &&
    n.availabilityStatus !== 'offline' && 
    n.status === 'approved' &&
    (n.zones || []).some(z => watchedZones.includes(z))
  ).length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 p-5 sm:p-6 shadow-xl text-white">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${
            settings.enabled 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <Zap className={`w-5 h-5 ${settings.enabled ? 'fill-emerald-300 animate-pulse' : ''}`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-white">
                Proactive Kingston &amp; St. Andrew Zone Alerts
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                settings.enabled 
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {settings.enabled ? '🟢 Active Dispatch Watch' : '⚪ Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Instant chime &amp; notification when an NCJ-licensed nurse becomes active in your neighborhood.
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onToggleEnabled}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              settings.enabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <span>{settings.enabled ? 'Alerts Enabled' : 'Enable Alerts'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure</span>
          </button>
        </div>
      </div>

      {/* Stats & Watched Zones */}
      <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Watched zones list */}
        <div className="md:col-span-2 space-y-2">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Watched Neighborhoods ({watchedZones.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {watchedZones.length === 0 ? (
              <span className="text-xs text-amber-300 italic">No zones selected. Tap 'Configure' to select zones.</span>
            ) : (
              watchedZones.map(zone => (
                <span
                  key={zone}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30"
                >
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{zone}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Wait time metric callout */}
        <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Wait Time Impact:</span>
            <span className="text-emerald-300 font-bold font-mono">14m vs 75m</span>
          </div>
          <p className="text-xs font-black text-emerald-300 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Cuts arrival delays by ~60 mins</span>
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>{activeInWatched} active nurse{activeInWatched !== 1 ? 's' : ''} in zone</span>
            <button
              type="button"
              onClick={onSimulateAlert}
              className="text-purple-300 hover:text-white font-bold inline-flex items-center gap-0.5 transition"
            >
              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              <span>Test Alert</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
