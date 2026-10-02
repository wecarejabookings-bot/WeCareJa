import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Volume2, 
  Radio, 
  Smartphone, 
  Check, 
  Sliders, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  TrendingDown,
  Compass,
  CheckCircle2,
  Calendar,
  History,
  Layers,
  HelpCircle,
  Play
} from 'lucide-react';
import { 
  NurseProfile, 
  ClientZoneAvailabilityAlertSettings, 
  ZoneAlertHistoryItem, 
  UserAccount 
} from '../../types';
import { 
  CORPORATE_AREA_PARISH_ZONES, 
  saveZoneAlertSettings, 
  calculateZoneWaitTimeReduction, 
  ParishZoneMeta 
} from '../../utils/zoneAlertsUtils';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface ZoneAvailabilityAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClientZoneAvailabilityAlertSettings;
  onUpdateSettings: (newSettings: ClientZoneAvailabilityAlertSettings) => void;
  nurses: NurseProfile[];
  currentUser?: UserAccount;
  onSimulateAlert?: (zoneName?: string) => void;
  onBookNurse?: (nurse: NurseProfile, zone: string) => void;
}

export const ZoneAvailabilityAlertSettingsModal: React.FC<ZoneAvailabilityAlertSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  nurses,
  currentUser,
  onSimulateAlert,
  onBookNurse
}) => {
  const [localSettings, setLocalSettings] = useState<ClientZoneAvailabilityAlertSettings>(settings);
  const [parishFilter, setParishFilter] = useState<'all' | 'Kingston' | 'St. Andrew'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'zones' | 'channels' | 'history'>('zones');
  const [browserPermissionGranted, setBrowserPermissionGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  if (!isOpen) return null;

  const handleToggleZone = (zoneName: string) => {
    const isWatched = localSettings.watchedZones.includes(zoneName);
    const updatedZones = isWatched
      ? localSettings.watchedZones.filter(z => z !== zoneName)
      : [...localSettings.watchedZones, zoneName];

    const updated = {
      ...localSettings,
      watchedZones: updatedZones
    };
    setLocalSettings(updated);
  };

  const handleSelectAllCorporateArea = () => {
    soundFX.playGentleDing();
    setLocalSettings({
      ...localSettings,
      watchedZones: CORPORATE_AREA_PARISH_ZONES.map(z => z.name)
    });
  };

  const handleSelectStAndrewOnly = () => {
    soundFX.playGentleDing();
    setLocalSettings({
      ...localSettings,
      watchedZones: CORPORATE_AREA_PARISH_ZONES.filter(z => z.parish === 'St. Andrew').map(z => z.name)
    });
  };

  const handleSelectKingstonOnly = () => {
    soundFX.playGentleDing();
    setLocalSettings({
      ...localSettings,
      watchedZones: CORPORATE_AREA_PARISH_ZONES.filter(z => z.parish === 'Kingston').map(z => z.name)
    });
  };

  const handleMatchHomeAddress = () => {
    soundFX.playGentleDing();
    const userZone = currentUser?.zone;
    if (userZone) {
      const match = CORPORATE_AREA_PARISH_ZONES.find(
        z => z.name.toLowerCase().includes(userZone.toLowerCase()) || userZone.toLowerCase().includes(z.name.toLowerCase())
      );
      if (match) {
        setLocalSettings({
          ...localSettings,
          watchedZones: [match.name]
        });
        return;
      }
    }
    // Default fallback
    setLocalSettings({
      ...localSettings,
      watchedZones: ['Liguanea & Mona', 'New Kingston']
    });
  };

  const handleSave = () => {
    soundFX.playBookingConfirmed();
    saveZoneAlertSettings(localSettings);
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleRequestBrowserPermission = async () => {
    const granted = await soundFX.requestNotificationPermission();
    setBrowserPermissionGranted(granted);
    if (granted) {
      soundFX.playZoneNurseAvailable();
      soundFX.triggerNotification(
        'Proactive Zone Alerts Activated ⚡',
        'We Care will notify you when a nurse becomes available in your Kingston or St. Andrew neighborhood.',
        'zone_nurse_available'
      );
    }
  };

  const handleTestChimeSample = () => {
    soundFX.playZoneNurseAvailable();
  };

  const handleRunSimulation = () => {
    const targetZone = localSettings.watchedZones[0] || 'Liguanea & Mona';
    soundFX.playZoneNurseAvailable();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onSimulateAlert) {
      onSimulateAlert(targetZone);
    }
    onClose();
  };

  // Count active nurses per zone
  const getActiveNurseCountForZone = (zoneName: string) => {
    return nurses.filter(n => 
      n.availabilityStatus !== 'offline' && 
      n.status === 'approved' &&
      n.zones.some(z => z.toLowerCase() === zoneName.toLowerCase())
    ).length;
  };

  const filteredZones = CORPORATE_AREA_PARISH_ZONES.filter(z => {
    if (parishFilter === 'all') return true;
    return z.parish === parishFilter;
  });

  const totalActiveInWatched = nurses.filter(n => 
    n.availabilityStatus !== 'offline' && 
    n.status === 'approved' &&
    n.zones.some(z => localSettings.watchedZones.includes(z))
  ).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-purple-950/70 via-slate-900 to-emerald-950/40 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-pulse" />
                <span>Proactive Proximity Dispatch</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
                Kingston &amp; St. Andrew Corporate Area
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Proactive Zone Availability Notifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Get notified the instant a certified nurse is on-duty in your neighborhood to cut travel delays.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer border border-white/10 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* MASTER TOGGLE & WAIT TIME REDUCTION HERO BANNER */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/50 via-black/40 to-emerald-950/40 border-2 border-emerald-500/40 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
                  localSettings.enabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Parish Zone Proactive Alerts</span>
                    {localSettings.enabled && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                        Active
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {localSettings?.enabled 
                      ? `Watching ${(localSettings?.watchedZones || []).length} zones in Kingston & St. Andrew (${totalActiveInWatched} nurses currently active)`
                      : 'Disabled — You will only see nurses when actively browsing the catalog'
                    }
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playToggleSwitch();
                  setLocalSettings(prev => ({ ...prev, enabled: !prev.enabled }));
                }}
                className={`w-16 h-8 rounded-full p-1 transition duration-300 cursor-pointer flex items-center shadow-md ${
                  localSettings.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                  {localSettings.enabled && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              </button>
            </div>

            {/* WAIT TIME REDUCTION BENCHMARK GRAPH */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span>Doorstep Wait Time Impact in Kingston &amp; St. Andrew:</span>
                </span>
                <span className="font-black text-emerald-300 font-mono">
                  ~60 Mins Saved (70% Faster)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Standard dispatch row */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Standard Cross-City Dispatch (Crosses congested Hope Rd / Trafalgar)</span>
                    <span className="font-mono text-rose-300 font-bold">75 – 90 mins wait</span>
                  </div>
                  <div className="w-full bg-rose-950/40 h-2 rounded-full overflow-hidden border border-rose-500/20">
                    <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full w-[85%]" />
                  </div>
                </div>

                {/* Proactive neighborhood match row */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-emerald-300 font-bold">
                    <span>⚡ Proactive Zone Match (Nurse already stationed in your neighborhood)</span>
                    <span className="font-mono text-emerald-400 font-black">12 – 20 mins wait</span>
                  </div>
                  <div className="w-full bg-emerald-950/40 h-2.5 rounded-full overflow-hidden border border-emerald-500/30">
                    <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full w-[22%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUB-TABS NAVIGATION */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('zones')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'zones'
                  ? 'bg-[#1E1B4B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Watched Parish Zones ({(localSettings?.watchedZones || []).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('channels')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'channels'
                  ? 'bg-[#1E1B4B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Channels &amp; Filters</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'history'
                  ? 'bg-[#1E1B4B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Recent Zone Alerts ({localSettings.history?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: WATCHED PARISH ZONES */}
          {activeSubTab === 'zones' && (
            <div className="space-y-4">
              
              {/* Quick filter & preset bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setParishFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      parishFilter === 'all' ? 'bg-[#1E1B4B] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Zones (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setParishFilter('St. Andrew')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      parishFilter === 'St. Andrew' ? 'bg-[#1E1B4B] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    St. Andrew (7)
                  </button>
                  <button
                    type="button"
                    onClick={() => setParishFilter('Kingston')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      parishFilter === 'Kingston' ? 'bg-[#1E1B4B] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Kingston (3)
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleMatchHomeAddress}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 border border-purple-400/30 font-bold transition flex items-center gap-1"
                  >
                    <Compass className="w-3.5 h-3.5 text-purple-300" />
                    <span>Match My Address</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectAllCorporateArea}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-bold transition"
                  >
                    Select All (10)
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, watchedZones: [] }))}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-bold transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grid of zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredZones.map((zone) => {
                  const isWatched = localSettings.watchedZones.includes(zone.name);
                  const activeNursesCount = getActiveNurseCountForZone(zone.name);

                  return (
                    <div
                      key={zone.name}
                      onClick={() => handleToggleZone(zone.name)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isWatched
                          ? 'bg-gradient-to-r from-purple-950/60 to-emerald-950/40 border-emerald-400/60 shadow-lg'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-slate-400'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            zone.parish === 'St. Andrew' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {zone.code}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Parish of {zone.parish}
                          </span>
                        </div>

                        <h4 className={`text-sm font-black truncate ${isWatched ? 'text-white' : 'text-slate-300'}`}>
                          {zone.name}
                        </h4>

                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          📍 {zone.landmarks}
                        </p>

                        <div className="flex items-center gap-2.5 pt-1 text-[11px]">
                          <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>~{zone.avgLocalWaitMins}m Arrival</span>
                          </span>

                          <span className="text-slate-500">•</span>

                          <span className={`font-semibold flex items-center gap-1 ${
                            activeNursesCount > 0 ? 'text-emerald-300' : 'text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${activeNursesCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                            <span>{activeNursesCount} active nurse{activeNursesCount !== 1 ? 's' : ''}</span>
                          </span>
                        </div>
                      </div>

                      {/* Checkbox badge */}
                      <div className={`w-6 h-6 rounded-xl border flex items-center justify-center shrink-0 mt-1 transition ${
                        isWatched 
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md' 
                          : 'bg-white/5 border-white/20 text-transparent'
                      }`}>
                        <Check className="w-4 h-4 font-black" />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: CHANNELS & PROXIMITY SENSITIVITY */}
          {activeSubTab === 'channels' && (
            <div className="space-y-6">
              
              {/* Caregiver qualification preferences */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Practitioner Qualification Preference:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'all', title: 'Any Certified Caregiver', desc: 'RNs, LPNs & Geriatric Aides' },
                    { id: 'registered_nurse', title: 'Registered Nurses (RN) Only', desc: 'NCJ Licensed Sterile Clinical Care' },
                    { id: 'practical_nurse', title: 'Practical & Registered Nurses', desc: 'Clinical medication & wound care' }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, careLevelPreference: option.id as any }))}
                      className={`p-3 rounded-2xl border text-left transition ${
                        localSettings.careLevelPreference === option.id
                          ? 'bg-[#1E1B4B]/30 border-purple-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <strong className="text-xs block text-white">{option.title}</strong>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Acceptable Wait Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Maximum Wait Time Threshold:
                  </label>
                  <span className="font-mono font-black text-xs text-emerald-400">
                    Alert if Arrival ≤ {localSettings.maxWaitTimeMinutes} Minutes
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 25, 35].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, maxWaitTimeMinutes: mins }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        localSettings.maxWaitTimeMinutes === mins
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      ≤ {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Delivery Channels */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Active Alert Delivery Channels:
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Channel: In-App Audio */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Synthesized Audio Chime</h4>
                        <p className="text-[10px] text-slate-400">Pleasant arpeggio when a local nurse checks in</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestChimeSample}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 text-[10px] font-bold transition flex items-center gap-1"
                        title="Play test chime"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Sample</span>
                      </button>

                      <input
                        type="checkbox"
                        checked={localSettings.channels.inAppAudio}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          channels: { ...prev.channels, inAppAudio: e.target.checked }
                        }))}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Channel: In-App Banner */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Top Proactive Banner</h4>
                        <p className="text-[10px] text-slate-400">1-click Fast-Track booking overlay</p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={localSettings.channels.inAppBanner}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        channels: { ...prev.channels, inAppBanner: e.target.checked }
                      }))}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Channel: Browser Push */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Browser Push Notification</h4>
                        <p className="text-[10px] text-slate-400">Alerts you even if app is in background</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!browserPermissionGranted && (
                        <button
                          type="button"
                          onClick={handleRequestBrowserPermission}
                          className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold"
                        >
                          Enable
                        </button>
                      )}
                      <input
                        type="checkbox"
                        checked={localSettings.channels.browserPush}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          channels: { ...prev.channels, browserPush: e.target.checked }
                        }))}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Channel: SMS / WhatsApp */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">WhatsApp &amp; SMS Dispatch Ping</h4>
                        <p className="text-[10px] text-slate-400">Direct message to {currentUser?.phone || '+1 (876) Jamaican number'}</p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={localSettings.channels.smsWhatsapp}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        channels: { ...prev.channels, smsWhatsapp: e.target.checked }
                      }))}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ALERT HISTORY LOG */}
          {activeSubTab === 'history' && (
            <div className="space-y-3">
              {(!localSettings?.history || (localSettings.history || []).length === 0) ? (
                <div className="p-8 text-center rounded-2xl bg-black/20 border border-white/10 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 mx-auto flex items-center justify-center">
                    <History className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Recent Zone Alerts Logged Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When an on-duty nurse in your watched Kingston or St. Andrew zone becomes active, alerts will appear here with instant booking links.
                  </p>
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    className="mt-3 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Test Alert Simulation Now</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {localSettings.history.map((item) => {
                    const matchedNurse = nurses.find(n => n.id === item.nurseId);
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:bg-white/[0.08] transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.nursePhoto}
                            alt={item.nurseName}
                            className="w-10 h-10 rounded-xl object-cover border border-purple-400/40"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-white">{item.nurseName}</h4>
                              <span className="text-[10px] text-purple-300 font-semibold">• {item.careLevel}</span>
                            </div>
                            <p className="text-[11px] text-slate-300">
                              Active in <strong>{item.zone}</strong> ({item.parish})
                            </p>
                            <span className="text-[10px] text-emerald-400 font-mono">
                              Est. {item.estWaitMinutes}m Arrival • Saved ~{item.savedWaitMinutes}m
                            </span>
                          </div>
                        </div>

                        {matchedNurse && onBookNurse && (
                          <button
                            type="button"
                            onClick={() => {
                              onBookNurse(matchedNurse, item.zone);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-sm"
                          >
                            Book
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER BAR */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Simulation / Test Action */}
          <button
            type="button"
            onClick={handleRunSimulation}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 hover:text-white text-xs font-bold border border-purple-400/40 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            title="Simulate a nurse going on duty in your selected Kingston/St. Andrew zone"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Simulate / Test Zone Alert Now</span>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 font-bold text-xs hover:bg-white/10 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white font-black text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Notification Settings</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
