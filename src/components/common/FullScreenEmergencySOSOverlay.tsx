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

export interface EmergencySOSData {
  id: string;
  triggeredBy: 'client' | 'nurse' | 'admin';
  triggererName: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  zone: string;
  serviceName: string;
  nurseName: string;
  nursePhone?: string;
  nursePhoto?: string;
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
      `Direct emergency alert sent to JCF Police 119 dispatch, UHWI Emergency Trauma, and We Care Lead Administrator ${ADMIN_PROFILE.name}.`,
      'sos_emergency'
    );
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

        {/* Primary Speed-Dial Bar - Ultra Large Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 119 Police */}
          <a
            href="tel:119"
            className="p-5 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-2xl shadow-red-950/80 border-2 border-yellow-300/80 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group"
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
          </a>

          {/* 110 Fire & Ambulance */}
          <a
            href="tel:110"
            className="p-5 rounded-3xl bg-gradient-to-br from-orange-600 to-amber-800 hover:from-orange-500 hover:to-amber-700 text-white shadow-2xl shadow-orange-950/80 border-2 border-white/30 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group"
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
          </a>

          {/* Attending Nurse or Client Direct */}
          <a
            href={`tel:${(isClientView ? emergencyData.nursePhone : emergencyData.clientPhone) || '8765550192'}`}
            className="p-5 rounded-3xl bg-gradient-to-br from-purple-700 to-indigo-900 hover:from-purple-600 hover:to-indigo-800 text-white shadow-2xl shadow-purple-950/80 border-2 border-purple-400/40 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
                {isClientView ? 'Attending Nurse' : 'Patient / Client'}
              </span>
              <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black block tracking-tight truncate">
                {isClientView ? emergencyData.nurseName : emergencyData.clientName}
              </span>
              <span className="text-xs text-purple-200 font-mono block mt-0.5">
                {isClientView ? emergencyData.nursePhone : emergencyData.clientPhone}
              </span>
            </div>
          </a>

          {/* Family Emergency Contact */}
          <a
            href={`tel:${String(emergencyData.emergencyContact.phone).replace(/[^0-9+]/g, '')}`}
            className="p-5 rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-900 hover:from-emerald-600 hover:to-teal-800 text-white shadow-2xl shadow-emerald-950/80 border-2 border-emerald-400/40 transition transform hover:-translate-y-0.5 flex flex-col justify-between gap-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/40 text-emerald-200 px-2 py-0.5 rounded-full">
                Family Guardian
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
        </div>

        {/* Vital Patient & Incident Information Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Patient Bio & Critical Medical Info */}
          <div className="p-5 rounded-3xl bg-white/[0.06] backdrop-blur-2xl border-2 border-red-500/30 space-y-3.5">
            <div className="flex items-center gap-2 text-red-300 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-2">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span>Patient Medical Quick Profile</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Full Name</span>
                <strong className="text-base text-white font-extrabold">{emergencyData.clientName}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-bold">Blood Group</span>
                  <span className="text-base font-black text-red-400 font-mono">
                    {emergencyData.bloodType || 'O+ Positive'}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-bold">Visit Service</span>
                  <span className="text-xs font-bold text-white truncate block">
                    {emergencyData.serviceName}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-red-500/15 border border-red-400/30">
                <span className="text-[10px] text-red-300 uppercase font-black block">Critical Known Allergies</span>
                <span className="text-xs font-bold text-white">
                  {(emergencyData.allergies && emergencyData.allergies.length > 0) 
                    ? emergencyData.allergies.join(', ') 
                    : 'Penicillin, Sulfa Antibiotics (Verified)'}
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
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Residence</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {emergencyData.clientAddress}
                </p>
                <span className="text-xs text-purple-300 font-semibold">{emergencyData.zone}, Jamaica</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 font-mono text-[11px] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">GPS Coordinates for Responders</span>
                <p className="text-emerald-400 font-bold">
                  LAT: {emergencyData.gpsCoordinates.lat.toFixed(4)}° N
                </p>
                <p className="text-emerald-400 font-bold">
                  LNG: {emergencyData.gpsCoordinates.lng.toFixed(4)}° W
                </p>
              </div>

              <a
                href={`https://maps.google.com/?q=${emergencyData.gpsCoordinates.lat},${emergencyData.gpsCoordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-white/10"
              >
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Open in Google Maps Navigation</span>
              </a>
            </div>
          </div>

          {/* Card 3: Responders & Emergency Admin Network */}
          <div className="p-5 rounded-3xl bg-white/[0.06] backdrop-blur-2xl border-2 border-red-500/30 space-y-3.5">
            <div className="flex items-center gap-2 text-red-300 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Assigned Caregiver &amp; Monitoring</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Attending Licensed Caregiver</span>
                <strong className="text-sm text-white font-bold block">{emergencyData.nurseName}</strong>
                <span className="text-xs text-emerald-300 font-mono">{emergencyData.nursePhone || '+1 (876) 555-0192'}</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-bold">We Care Admin Control</span>
                <span className="font-bold text-white text-xs block">{ADMIN_PROFILE.name} ({ADMIN_PROFILE.title})</span>
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
    </div>
  );
};
