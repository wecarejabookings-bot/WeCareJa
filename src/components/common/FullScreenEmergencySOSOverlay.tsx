import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  AlertTriangle, 
  MapPin, 
  Send, 
  CheckCircle2, 
  User, 
  Heart, 
  Stethoscope, 
  Volume2, 
  VolumeX, 
  Clock, 
  Radio, 
  ShieldCheck, 
  XCircle,
  Users,
  Building,
  Check
} from 'lucide-react';
import { Booking, UserRole } from '../../types';
import { ADMIN_PROFILE } from '../../data/mockData';
import { soundFX } from '../../utils/soundEffects';
import { findNearestPoliceStations } from '../../data/jamaicaPoliceStations';
import { NearestPoliceStationModal } from './NearestPoliceStationModal';
import { AIEmergencyVoicePoliceDispatch } from './AIEmergencyVoicePoliceDispatch';

export interface EmergencySOSData {
  id: string;
  triggeredBy: 'client' | 'nurse' | 'admin';
  triggererName: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  zone: string;
  serviceName: string;
  nurseName?: string;
  nursePhone?: string;
  nursePhoto?: string;
  lastVisitDate?: string;
  lastVisitService?: string;
  hasPreviousNurseVisit?: boolean;
  timestamp: string;
  bookingId?: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  gpsAccuracyStatus?: 'locked' | 'acquiring' | 'profile_default';
  status: 'active' | 'resolved';
}

interface FullScreenEmergencySOSOverlayProps {
  isOpen: boolean;
  emergencyData: EmergencySOSData | null;
  currentUserRole: UserRole;
  onClose: () => void;
  onResolveEmergency: (resolutionNotes: string) => void;
}

export const FullScreenEmergencySOSOverlay: React.FC<FullScreenEmergencySOSOverlayProps> = ({
  isOpen,
  emergencyData,
  currentUserRole,
  onClose,
  onResolveEmergency
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [isPolicePopupOpen, setIsPolicePopupOpen] = useState(false);

  const nearestPolice = emergencyData ? findNearestPoliceStations(
    emergencyData.gpsCoordinates?.lat || null,
    emergencyData.gpsCoordinates?.lng || null,
    emergencyData.clientAddress || emergencyData.zone || 'Kingston, Jamaica',
    1
  )[0] : null;

  // Play audio alert loop when opened
  useEffect(() => {
    if (!isOpen || isMuted) return;

    soundFX.playQuickSOSTone();
    const interval = setInterval(() => {
      if (!isMuted) {
        soundFX.playQuickSOSTone();
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isOpen, isMuted]);

  if (!isOpen || !emergencyData) return null;

  const handleResolve = () => {
    onResolveEmergency(resolutionNotes || 'Emergency stood down and resolved. Patient and nurse safety confirmed.');
    setShowResolveConfirm(false);
  };

  const handleDispatchSilentAlert = () => {
    setAlertDispatched(true);
    soundFX.triggerNotification(
      '🚨 119 Emergency Alert Broadcast Dispatched',
      `Direct emergency alert sent to JCF Police 119 dispatch, UHWI Emergency Trauma, and We Care Lead Administrator.`,
      'sos_emergency'
    );
  };

  const formatTelHref = (phone: string) => {
    const digits = phone.replace(/[^0-9+]/g, '');
    if (digits === '119' || digits === '110') return `tel:${digits}`;
    if (digits.startsWith('+1')) return `tel:${digits}`;
    if (digits.startsWith('1') && digits.length === 11) return `tel:+${digits}`;
    if (digits.startsWith('876') && digits.length === 10) return `tel:+1${digits}`;
    return `tel:${digits}`;
  };

  // 30-Second Automatic Failsafe Call Timer
  const [autoCallSeconds, setAutoCallSeconds] = useState<number>(30);
  const [isAutoCallActive, setIsAutoCallActive] = useState<boolean>(true);
  const [selectedCallTarget, setSelectedCallTarget] = useState<{
    name: string;
    phone: string;
    type: '119' | '110' | 'station' | 'auto_nearest';
  } | null>(null);
  const [hasAutoCalled, setHasAutoCalled] = useState<boolean>(false);
  const [hasTriggeredImmediateCall, setHasTriggeredImmediateCall] = useState<boolean>(false);

  // When SOS emergency is triggered, call closest police station immediately based on actual location
  useEffect(() => {
    if (!isOpen || hasTriggeredImmediateCall || !nearestPolice) return;

    setHasTriggeredImmediateCall(true);
    setSelectedCallTarget({
      name: nearestPolice.name,
      phone: nearestPolice.primaryPhone,
      type: 'auto_nearest'
    });
    setHasAutoCalled(true);
    setIsAutoCallActive(false);

    try {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(`Emergency SOS: Calling closest police station, ${nearestPolice.name}, based on your actual location.`);
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      }
    } catch {}

    window.location.href = formatTelHref(nearestPolice.primaryPhone);
  }, [isOpen, nearestPolice, hasTriggeredImmediateCall]);

  // Auto-call nearest station if no selection made in 30 seconds
  useEffect(() => {
    if (!isOpen || !isAutoCallActive || selectedCallTarget !== null || hasAutoCalled) return;

    if (autoCallSeconds <= 0) {
      if (nearestPolice) {
        setSelectedCallTarget({
          name: nearestPolice.name,
          phone: nearestPolice.primaryPhone,
          type: 'auto_nearest'
        });
        setHasAutoCalled(true);
        setIsAutoCallActive(false);

        try {
          if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(`30 seconds elapsed with no selection. Calling nearest police station: ${nearestPolice.name} now.`);
            utter.rate = 1.05;
            window.speechSynthesis.speak(utter);
          }
        } catch {}

        window.location.href = formatTelHref(nearestPolice.primaryPhone);
      } else {
        setSelectedCallTarget({
          name: '119 Emergency Dispatch',
          phone: '119',
          type: 'auto_nearest'
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
  }, [autoCallSeconds, isAutoCallActive, isOpen, selectedCallTarget, hasAutoCalled, nearestPolice]);

  const handleSelectCall = (type: '119' | '110' | 'station', name: string, phone: string) => {
    setIsAutoCallActive(false);
    setSelectedCallTarget({ type, name, phone });
    setHasAutoCalled(false);
    window.location.href = formatTelHref(phone);
  };

  const handleCancelAutoCall = () => {
    setIsAutoCallActive(false);
  };

  const isClientView = currentUserRole === 'client';
  const isNurseView = currentUserRole === 'nurse';

  return (
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-gradient-to-b from-[#3a0008] via-[#1a0005] to-[#090003] text-white flex flex-col justify-between overflow-y-auto selection:bg-red-500 selection:text-white">
      {/* Flashing Urgency Strobe Header Bar */}
      <div className="bg-red-600/90 backdrop-blur-xl border-b-4 border-yellow-400 text-white px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-white text-red-600 font-black shadow-lg">
            <ShieldAlert className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider">
                🚨 CRITICAL 119 EMERGENCY ACTIVE
              </span>
              <span className="text-xs font-bold text-red-100 uppercase tracking-widest hidden sm:inline">
                • SCREEN TAKEOVER ON BOTH CLIENT &amp; NURSE APPS
              </span>
            </div>
            <p className="text-sm font-black text-white mt-0.5">
              BROADCAST TO PATIENT SCREEN, NURSE DEVICE &amp; WE CARE EMERGENCY COMMAND
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title={isMuted ? 'Unmute Siren Alarm' : 'Mute Siren Alarm'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" />}
            <span>{isMuted ? 'Alarm Muted' : 'Siren Active'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition border border-white/30 cursor-pointer"
            title="Minimize to top urgent banner"
          >
            Minimize Overlay
          </button>
        </div>
      </div>

      {/* Main Interactive Alert Core */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Originator Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600/30 via-red-900/40 to-black/60 border-2 border-red-500/60 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-950/70 shrink-0 border-2 border-white/30">
              <AlertTriangle className="w-7 h-7 text-yellow-300" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-300 block">
                Emergency Alert Origin
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Triggered by {emergencyData.triggererName} ({emergencyData.triggeredBy.toUpperCase()})
              </h2>
              <p className="text-xs text-slate-200 mt-0.5">
                Timestamp: {new Date(emergencyData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • Geofenced Jamaican Homecare Visit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-red-500/25 border border-red-400 text-red-200 font-mono text-xs font-bold flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span>LIVE TRANSMISSION</span>
            </span>
          </div>
        </div>

        {/* Nearest Police Station Option Card */}
        {nearestPolice && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-400 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  👮 Nearest Police Station Option
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                  ~{nearestPolice.distanceKm} km away • {nearestPolice.division}
                </span>
              </div>
              <h3 className="text-xl font-black text-white">{nearestPolice.name}</h3>
              <p className="text-xs text-slate-300">{nearestPolice.address}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsPolicePopupOpen(true)}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <span>View Stations Popup</span>
              </button>
              <a
                href={`tel:${nearestPolice.primaryPhone.replace(/[^0-9+]/g, '')}`}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black transition flex items-center gap-2 shadow-xl shadow-blue-950/80 cursor-pointer border border-blue-400/40"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Call Station: {nearestPolice.primaryPhone}</span>
              </a>
            </div>
          </div>
        )}

        {/* AI Voice Police Dispatcher (30s Failsafe Countdown when unable to speak) */}
        <AIEmergencyVoicePoliceDispatch
          userRole={emergencyData.triggeredBy || currentUserRole}
          userName={emergencyData.triggererName || emergencyData.clientName}
          lat={emergencyData.gpsCoordinates?.lat ?? null}
          lng={emergencyData.gpsCoordinates?.lng ?? null}
          address={emergencyData.clientAddress || emergencyData.zone || 'Kingston, Jamaica'}
          nearestStationName={nearestPolice?.name}
          nearestStationPhone={nearestPolice?.primaryPhone}
          nearestStationDistanceKm={nearestPolice?.distanceKm}
          autoStartCountdown={false}
        />

        {/* 30-Second Automatic Failsafe Call Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-black/60 border-2 border-red-500 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-red-200">
                Automatic Emergency Failsafe
              </span>
            </div>

            {isAutoCallActive && selectedCallTarget === null && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-black text-xs shadow-md animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>Auto-Call in {autoCallSeconds}s</span>
              </div>
            )}
          </div>

          {hasAutoCalled && selectedCallTarget ? (
            <div className="p-3.5 rounded-2xl bg-red-600/30 border border-red-400/50 space-y-2">
              <div className="flex items-center gap-2 text-yellow-300 font-black text-sm">
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>AUTOMATIC CALL PLACED: {selectedCallTarget.name}</span>
              </div>
              <p className="text-xs text-slate-200">
                30-second timer elapsed with no selection. WeCare automatically placed the call to your nearest station: <strong>{selectedCallTarget.phone}</strong>.
              </p>
              <button
                type="button"
                onClick={() => handleSelectCall(selectedCallTarget.type as any, selectedCallTarget.name, selectedCallTarget.phone)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Redial {selectedCallTarget.phone}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Select <strong>119</strong> or your <strong>nearest station ({nearestPolice?.name || 'Local Police'})</strong> below. If no selection is made, your device will <strong>automatically call {nearestPolice?.name || 'nearest station'} in {autoCallSeconds} seconds</strong> based on your GPS location.
              </p>

              {isAutoCallActive && (
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(autoCallSeconds / 30) * 100}%` }}
                  />
                </div>
              )}

              {isAutoCallActive && (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>⚡ Auto-calling at 0s if no button is tapped</span>
                  <button
                    type="button"
                    onClick={handleCancelAutoCall}
                    className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold transition cursor-pointer"
                  >
                    Cancel Auto-Call
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Speed-Dial Bar - Ultra Large Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 119 Police */}
          <button
            type="button"
            onClick={() => handleSelectCall('119', '119 Police & Tactical Dispatch', '119')}
            className="p-5 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-2xl shadow-red-950/80 border-2 border-yellow-300/80 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-full">
                Speed Dial #1
              </span>
              <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black block tracking-tight">CALL 119</span>
              <span className="text-xs text-red-100 font-bold block">Jamaica Police &amp; Tactical Dispatch</span>
            </div>
          </button>

          {/* 110 Fire & Ambulance */}
          <button
            type="button"
            onClick={() => handleSelectCall('110', '110 Fire Brigade & Ambulance', '110')}
            className="p-5 rounded-3xl bg-gradient-to-br from-orange-600 to-amber-800 hover:from-orange-500 hover:to-amber-700 text-white shadow-2xl shadow-orange-950/80 border-2 border-white/30 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                Ambulance / Fire
              </span>
              <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black block tracking-tight">CALL 110</span>
              <span className="text-xs text-orange-100 font-bold block">Jamaica Fire Brigade &amp; Emergency EMS</span>
            </div>
          </button>

          {/* Attending Nurse, Last Visiting Nurse, or Direct We Care Emergency Operations */}
          {isClientView ? (
            emergencyData.nurseName && emergencyData.nursePhone ? (
              <a
                href={`tel:${emergencyData.nursePhone.replace(/[^0-9+]/g, '')}`}
                className="p-5 rounded-3xl bg-gradient-to-br from-purple-700 to-indigo-900 hover:from-purple-600 hover:to-indigo-800 text-white shadow-2xl shadow-purple-950/80 border-2 border-purple-400/40 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
                    {emergencyData.lastVisitDate ? 'Last Visiting Nurse' : 'Attending Nurse'}
                  </span>
                  <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black block tracking-tight truncate">
                    {emergencyData.nurseName}
                  </span>
                  <span className="text-xs text-purple-200 font-mono block mt-0.5">
                    {emergencyData.nursePhone}
                  </span>
                </div>
              </a>
            ) : (
              <a
                href={`tel:${ADMIN_PROFILE.officeNumber.replace(/[^0-9+]/g, '')}`}
                className="p-5 rounded-3xl bg-gradient-to-br from-purple-700 to-indigo-900 hover:from-purple-600 hover:to-indigo-800 text-white shadow-2xl shadow-purple-950/80 border-2 border-purple-400/40 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
                    Operations Dispatch
                  </span>
                  <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black block tracking-tight truncate">
                    We Care Rapid Ops
                  </span>
                  <span className="text-xs text-purple-200 font-mono block mt-0.5">
                    {ADMIN_PROFILE.officeNumber} (24/7)
                  </span>
                </div>
              </a>
            )
          ) : (
            <a
              href={emergencyData.clientPhone ? `tel:${emergencyData.clientPhone.replace(/[^0-9+]/g, '')}` : '#'}
              className="p-5 rounded-3xl bg-gradient-to-br from-purple-700 to-indigo-900 hover:from-purple-600 hover:to-indigo-800 text-white shadow-2xl shadow-purple-950/80 border-2 border-purple-400/40 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
                  Patient / Client
                </span>
                <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black block tracking-tight truncate">
                  {emergencyData.clientName}
                </span>
                <span className="text-xs text-purple-200 font-mono block mt-0.5">
                  {emergencyData.clientPhone || 'No phone registered'}
                </span>
              </div>
            </a>
          )}

          {/* Family Emergency Contact or Hospital ER */}
          {emergencyData.emergencyContact?.name && emergencyData.emergencyContact?.phone ? (
            <a
              href={`tel:${String(emergencyData.emergencyContact.phone).replace(/[^0-9+]/g, '')}`}
              className="p-5 rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-900 hover:from-emerald-600 hover:to-teal-800 text-white shadow-2xl shadow-emerald-950/80 border-2 border-emerald-400/40 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/40 text-emerald-200 px-2 py-0.5 rounded-full">
                  {emergencyData.emergencyContact.relation || 'Emergency Contact'}
                </span>
                <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black block tracking-tight truncate">
                  {emergencyData.emergencyContact.name}
                </span>
                <span className="text-xs text-emerald-200 block truncate">
                  {emergencyData.emergencyContact.relation} • {emergencyData.emergencyContact.phone}
                </span>
              </div>
            </a>
          ) : (
            <a
              href="tel:+18769271620"
              className="p-5 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white shadow-2xl shadow-black/80 border-2 border-white/20 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-slate-300 px-2 py-0.5 rounded-full">
                  Next of Kin / Contact
                </span>
                <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-slate-300 block">
                  Not Recorded on Profile
                </span>
                <span className="text-xs text-emerald-400 block truncate font-semibold mt-0.5">
                  Call UHWI Trauma ER: +1 (876) 927-1620
                </span>
              </div>
            </a>
          )}
        </div>

        {/* Vital Patient & Incident Information Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Patient Bio & Critical Medical Info (Strictly linked to user profile) */}
          <div className="p-5 rounded-3xl bg-white/[0.06] backdrop-blur-2xl border-2 border-red-500/30 space-y-3.5">
            <div className="flex items-center gap-2 text-red-300 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-2">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span>Patient Medical Quick Profile</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Registered Name</span>
                <strong className="text-base text-white font-extrabold">{emergencyData.clientName}</strong>
                {emergencyData.clientPhone && (
                  <span className="text-xs text-slate-300 block font-mono mt-0.5">{emergencyData.clientPhone}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-bold">Blood Group</span>
                  <span className="text-sm font-black text-red-400 font-mono">
                    {emergencyData.bloodType?.trim() ? emergencyData.bloodType : 'Unrecorded on profile'}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-bold">Incident / Service</span>
                  <span className="text-xs font-bold text-white truncate block">
                    {emergencyData.serviceName || 'Emergency Assistance Request'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-red-500/15 border border-red-400/30">
                <span className="text-[10px] text-red-300 uppercase font-black block">Known Allergies on Profile</span>
                <span className="text-xs font-bold text-white">
                  {(emergencyData.allergies && emergencyData.allergies.length > 0) 
                    ? emergencyData.allergies.join(', ') 
                    : 'None recorded on profile'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Exact Location & Geofence Coordinates */}
          <div className="p-5 rounded-3xl bg-white/[0.06] backdrop-blur-2xl border-2 border-red-500/30 space-y-3.5">
            <div className="flex items-center gap-2 text-red-300 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-2">
              <MapPin className="w-4 h-4 text-[#E63946]" />
              <span>Live Location &amp; Geofence</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Client Registered Address</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {emergencyData.clientAddress || 'Address not registered in user profile'}
                </p>
                {emergencyData.zone && (
                  <span className="text-xs text-purple-300 font-semibold">{emergencyData.zone}, Jamaica</span>
                )}
              </div>

              <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Live Device Coordinates</span>
                  {emergencyData.gpsAccuracyStatus === 'locked' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold">GPS LOCKED ✓</span>
                  )}
                </div>
                <p className="text-emerald-400 font-bold">
                  LAT: {emergencyData.gpsCoordinates.lat ? emergencyData.gpsCoordinates.lat.toFixed(5) + '° N' : 'Acquiring GPS...'}
                </p>
                <p className="text-emerald-400 font-bold">
                  LNG: {emergencyData.gpsCoordinates.lng ? emergencyData.gpsCoordinates.lng.toFixed(5) + '° W' : 'Acquiring GPS...'}
                </p>
              </div>

              {emergencyData.gpsCoordinates.lat && emergencyData.gpsCoordinates.lng ? (
                <a
                  href={`https://maps.google.com/?q=${emergencyData.gpsCoordinates.lat},${emergencyData.gpsCoordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Open Live GPS in Google Maps</span>
                </a>
              ) : emergencyData.clientAddress ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(emergencyData.clientAddress + ', Jamaica')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Search Registered Address in Maps</span>
                </a>
              ) : null}
            </div>
          </div>

          {/* Card 3: Responders & Emergency Admin Network */}
          <div className="p-5 rounded-3xl bg-white/[0.06] backdrop-blur-2xl border-2 border-red-500/30 space-y-3.5">
            <div className="flex items-center gap-2 text-red-300 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Assigned Caregiver &amp; Monitoring</span>
            </div>

            <div className="space-y-2 text-xs">
              {emergencyData.nurseName ? (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {emergencyData.lastVisitDate ? 'Last Visiting Licensed Nurse' : 'Attending Licensed Caregiver'}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {emergencyData.nursePhoto ? (
                      <img src={emergencyData.nursePhoto} alt={emergencyData.nurseName} className="w-8 h-8 rounded-full object-cover border border-emerald-400/50" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                        {emergencyData.nurseName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <strong className="text-sm text-white font-bold block">{emergencyData.nurseName}</strong>
                      {emergencyData.nursePhone && (
                        <a href={`tel:${emergencyData.nursePhone.replace(/[^0-9+]/g, '')}`} className="text-xs text-emerald-300 font-mono hover:underline">
                          {emergencyData.nursePhone}
                        </a>
                      )}
                    </div>
                  </div>
                  {emergencyData.lastVisitService && (
                    <p className="text-[11px] text-slate-300 mt-1">
                      Last Visit: <span className="text-white font-medium">{emergencyData.lastVisitService}</span>
                      {emergencyData.lastVisitDate && (
                        <span className="text-slate-400 block text-[10px]">
                          {new Date(emergencyData.lastVisitDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold uppercase block">Previous Caregiver History</span>
                  <strong className="text-xs text-white font-bold block">No previous nurse visit on record</strong>
                  <p className="text-[11px] text-slate-400">
                    This client has no completed home nurse visits on file. No made-up nurse is shown. Connect directly with 119 police dispatch or We Care operations below.
                  </p>
                </div>
              )}

              <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-bold">We Care Admin Control</span>
                <span className="font-bold text-white text-xs block">Lead Administrator (Operations)</span>
                <a href={`tel:${ADMIN_PROFILE.officeNumber}`} className="text-xs text-purple-300 font-mono hover:underline">
                  Office: {ADMIN_PROFILE.officeNumber}
                </a>
              </div>

              <button
                type="button"
                onClick={handleDispatchSilentAlert}
                disabled={alertDispatched}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 border ${
                  alertDispatched
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-600/30 hover:bg-red-600/50 text-red-200 border-red-400/40'
                }`}
              >
                {alertDispatched ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Emergency SMS Broadcast Active ✓</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-red-300" />
                    <span>Re-Broadcast Silent Alert SMS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hospital Direct ER Lines Box */}
        <div className="p-4 sm:p-5 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            <span>Direct Jamaican Hospital Emergency Rooms (Kingston &amp; St. Andrew)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <a
              href="tel:+18769271620"
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between transition"
            >
              <div>
                <strong className="text-white block font-bold">UHWI Mona Emergency Room</strong>
                <span className="text-[10px] text-slate-400">University Hospital Trauma</span>
              </div>
              <span className="font-mono text-xs font-bold text-purple-300">+1 (876) 927-1620</span>
            </a>

            <a
              href="tel:+18769220210"
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between transition"
            >
              <div>
                <strong className="text-white block font-bold">Kingston Public Hospital (KPH)</strong>
                <span className="text-[10px] text-slate-400">Downtown Level-1 Trauma</span>
              </div>
              <span className="font-mono text-xs font-bold text-blue-300">+1 (876) 922-0210</span>
            </a>

            <a
              href="tel:+18769887700"
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between transition"
            >
              <div>
                <strong className="text-white block font-bold">Spanish Town Hospital</strong>
                <span className="text-[10px] text-slate-400">St. Catherine EMS</span>
              </div>
              <span className="font-mono text-xs font-bold text-teal-300">+1 (876) 988-7700</span>
            </a>
          </div>
        </div>
      </div>

      {/* Resolution & Stand-Down Footer Console */}
      <div className="bg-black/80 backdrop-blur-2xl border-t border-white/10 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            This emergency screen is actively shown across <strong>Client</strong>, <strong>Nurse</strong>, and <strong>Admin</strong> screens. Only authorize stand-down when patient and caregiver safety is secured.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          {!showResolveConfirm ? (
            <button
              type="button"
              onClick={() => setShowResolveConfirm(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
            >
              <Check className="w-4 h-4" />
              <span>Authorize Stand-Down &amp; Resolve SOS</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Resolution reason (e.g. Paramedics arrived)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 w-full sm:w-64"
              />
              <button
                type="button"
                onClick={handleResolve}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shrink-0 cursor-pointer"
              >
                Confirm Resolve
              </button>
              <button
                type="button"
                onClick={() => setShowResolveConfirm(false)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {isPolicePopupOpen && (
        <NearestPoliceStationModal
          isOpen={isPolicePopupOpen}
          onClose={() => setIsPolicePopupOpen(false)}
          userAddress={emergencyData.clientAddress || emergencyData.zone || 'Kingston, Jamaica'}
          initialLat={emergencyData.gpsCoordinates?.lat || null}
          initialLng={emergencyData.gpsCoordinates?.lng || null}
          userRole={emergencyData.triggeredBy || currentUserRole}
          userName={emergencyData.triggererName || emergencyData.clientName}
        />
      )}
    </div>
  );
};
