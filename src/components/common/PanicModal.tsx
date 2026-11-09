import React, { useState, useEffect } from 'react';
import { ShieldAlert, PhoneCall, AlertTriangle, MapPin, Send, CheckCircle2, User, Heart, Building2, Clock, Radio, RotateCcw } from 'lucide-react';
import { Booking } from '../../types';
import { ADMIN_PROFILE } from '../../data/mockData';
import { findNearestPoliceStations } from '../../data/jamaicaPoliceStations';
import { NearestPoliceStationModal } from './NearestPoliceStationModal';
import { AIEmergencyVoicePoliceDispatch } from './AIEmergencyVoicePoliceDispatch';

interface PanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBooking?: Booking | null;
  userRole: 'client' | 'nurse' | 'admin';
  userName?: string;
  userAddress?: string;
  initialLat?: number | null;
  initialLng?: number | null;
  autoCallOnOpen?: boolean;
}

export const PanicModal: React.FC<PanicModalProps> = ({
  isOpen,
  onClose,
  activeBooking,
  userRole,
  userName,
  userAddress,
  initialLat = null,
  initialLng = null,
  autoCallOnOpen = true
}) => {
  const [alertSent, setAlertSent] = useState(false);
  const [isPolicePopupOpen, setIsPolicePopupOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const effectiveAddress = (activeBooking?.clientAddress || userAddress || '').trim();
  const effectiveName = activeBooking?.clientName || userName || (userRole === 'nurse' ? 'WeCareJa Nurse' : 'WeCareJa Client');

  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (initialLat && initialLng) {
      return { lat: initialLat, lng: initialLng };
    }
    return null;
  });

  // Query live physical GPS immediately upon modal opening
  useEffect(() => {
    if (!isOpen) return;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLiveCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn('Panic GPS note:', err.message),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 15000 }
      );
    }
  }, [isOpen]);

  const nearestPolice = findNearestPoliceStations(
    liveCoords?.lat ?? initialLat,
    liveCoords?.lng ?? initialLng,
    effectiveAddress || 'Kingston & St. Andrew, Jamaica',
    1
  )[0];

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
  const [selectedAction, setSelectedAction] = useState<{
    type: '119' | 'station' | 'auto_nearest';
    name: string;
    phone: string;
  } | null>(null);
  const [hasAutoCalled, setHasAutoCalled] = useState<boolean>(false);
  const [hasTriggeredImmediateCall, setHasTriggeredImmediateCall] = useState<boolean>(false);

  // When SOS emergency is triggered, call closest police station immediately based on actual location
  useEffect(() => {
    if (!isOpen || !autoCallOnOpen || hasTriggeredImmediateCall || !nearestPolice) return;

    setHasTriggeredImmediateCall(true);
    setSelectedAction({
      type: 'auto_nearest',
      name: nearestPolice.name,
      phone: nearestPolice.primaryPhone
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
  }, [isOpen, autoCallOnOpen, nearestPolice, hasTriggeredImmediateCall]);

  // 30-second countdown: if no selection is made, automatically call nearest station based on location
  useEffect(() => {
    if (!isOpen || !isAutoCallActive || selectedAction !== null || hasAutoCalled) return;

    if (autoCallSeconds <= 0) {
      if (nearestPolice) {
        setSelectedAction({
          type: 'auto_nearest',
          name: nearestPolice.name,
          phone: nearestPolice.primaryPhone
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

        // Execute actual call to nearest station automatically
        window.location.href = formatTelHref(nearestPolice.primaryPhone);
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
  }, [autoCallSeconds, isAutoCallActive, isOpen, selectedAction, hasAutoCalled, nearestPolice]);

  const handleSelectCall = (type: '119' | 'station', name: string, phone: string) => {
    setIsAutoCallActive(false);
    setSelectedAction({ type, name, phone });
    setHasAutoCalled(false);
    window.location.href = formatTelHref(phone);
  };

  const handleCancelAutoCall = () => {
    setIsAutoCallActive(false);
  };

  if (!isOpen) return null;

  const triggerPanicBroadcast = () => {
    setAlertSent(true);
  };

  const emergencyContactsList = [
    { name: '119 Police & National Emergency', number: '119', badge: 'Police & Tactical', color: 'bg-red-600' },
    { name: '110 Fire Brigade & Ambulance', number: '110', badge: 'Ambulance / Fire', color: 'bg-orange-600' },
    { name: 'UHWI Mona Emergency Room', number: '+1 (876) 927-1620', badge: 'Hospital ER', color: 'bg-purple-700' },
    { name: 'Kingston Public Hospital (KPH)', number: '+1 (876) 922-0210', badge: 'Trauma Center', color: 'bg-blue-700' },
    { name: 'We Care Admin Office (Lead Operations)', number: ADMIN_PROFILE.officeNumber, badge: 'Lead Administrator', color: 'bg-[#7209B7]' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f0416]/85 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#150722]/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full shadow-2xl border border-red-500/30 overflow-hidden text-white">
        {/* Urgent Header */}
        <div className="bg-red-500/20 backdrop-blur-xl border-b border-red-500/30 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/30 border border-red-400/40 animate-pulse">
              <ShieldAlert className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-500/30 text-red-200 border border-red-500/40 px-2.5 py-0.5 rounded-full">
                Emergency Protocol
              </span>
              <h2 className="text-xl font-black tracking-tight mt-1 text-white">
                We Care 119 Emergency &amp; Panic
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition border border-white/10 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Location & Details Box */}
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-red-300 block">Service Location:</span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {effectiveAddress}
                </p>
                {activeBooking?.nurseName ? (
                  <p className="text-xs text-slate-300 mt-1">
                    Booking: <strong>{activeBooking.serviceName}</strong> | Attending Nurse: <strong>{activeBooking.nurseName}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-slate-300 mt-1">
                    Emergency Dispatch Mode: <strong>Direct 119 Speed Dial</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency 30-Second Auto-Call Failsafe Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-red-950/90 via-red-900/60 to-black/90 border-2 border-red-500 shadow-2xl relative overflow-hidden">
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Connect Call ({selectedAction.phone})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Select <strong>119</strong> or your <strong>nearest station</strong> below to call immediately. If no selection is made, your device will <strong>automatically call {nearestPolice?.name || 'the nearest police station'} in {autoCallSeconds} seconds</strong> based on your location.
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
                  {nearestPolice && (
                    <button
                      type="button"
                      onClick={() => handleSelectCall('station', nearestPolice.name, nearestPolice.primaryPhone)}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-between shadow-xl transition cursor-pointer border border-blue-400/40 group"
                    >
                      <div className="text-left min-w-0 pr-2">
                        <span className="text-[10px] text-blue-200 uppercase tracking-wider block font-bold">
                          Select Choice 2 • ~{nearestPolice.distanceKm} km
                        </span>
                        <span className="text-sm font-black truncate block">{nearestPolice.name}</span>
                        <span className="text-[11px] text-blue-100 block font-mono font-normal">{nearestPolice.primaryPhone}</span>
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

          {/* Option: Call Nearest Police Station based on exact location */}
          {nearestPolice && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-blue-950/80 border-2 border-blue-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Nearest Police Station
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold">
                    ~{nearestPolice.distanceKm} km away • {nearestPolice.division}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white">{nearestPolice.name}</h4>
                <p className="text-[11px] text-slate-300">{nearestPolice.address}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPolicePopupOpen(true)}
                  className="px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  View Option Popup
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectCall('station', nearestPolice.name, nearestPolice.primaryPhone)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Station</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Voice Police Dispatcher (Can speak script if desired) */}
          <AIEmergencyVoicePoliceDispatch
            userRole={userRole}
            userName={effectiveName}
            lat={null}
            lng={null}
            address={effectiveAddress}
            nearestStationName={nearestPolice?.name}
            nearestStationPhone={nearestPolice?.primaryPhone}
            nearestStationDistanceKm={nearestPolice?.distanceKm}
            autoStartCountdown={false}
          />

          {/* Primary 119 Call Action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleSelectCall('119', '119 Police & National Emergency', '119')}
              className="flex-1 p-4 rounded-2xl bg-[#E63946] hover:bg-red-600 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-red-950/50 transition group border border-red-400/40 cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-xs text-red-100 block">Immediate Speed Dial</span>
                <span className="text-lg font-black">Call 119 Emergency</span>
              </div>
            </button>

            <button
              onClick={triggerPanicBroadcast}
              disabled={alertSent}
              className={`p-4 rounded-2xl font-bold flex items-center justify-center gap-2 border transition ${
                alertSent
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                  : 'bg-white/10 text-purple-200 border-white/15 hover:bg-white/15'
              }`}
            >
              {alertSent ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <span className="text-xs block text-emerald-300">Broadcast Active</span>
                    <span className="text-sm font-bold text-white">Contacts &amp; Admin Alerted</span>
                  </div>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <span className="text-xs block text-purple-300">Silent SMS Alert</span>
                    <span className="text-sm font-bold text-white">Notify Emergency Contact</span>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Direct Jamaican Emergency Lines */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Direct Emergency Contacts (Kingston, St. Andrew, Portmore &amp; Spanish Town)
            </h4>
            <div className="space-y-2">
              {emergencyContactsList.map((contact, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${contact.color}`} />
                    <span className="font-semibold text-white">{contact.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300 font-medium">
                      {contact.badge}
                    </span>
                  </div>
                  <a
                    href={`tel:${String(contact?.number || '').replace(/\s+/g, '')}`}
                    className="font-mono font-bold text-purple-300 hover:text-white flex items-center gap-1 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Policy Notice */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <p>
              <strong>We Care Safety Policy:</strong> In-home healthcare visits across Kingston, St. Andrew, Portmore, and Spanish Town adhere to Ministry of Health &amp; Wellness and Nursing Council guidelines. Panic activations automatically send geolocation timestamps to designated contacts and We Care administrative monitoring.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white/[0.03] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10"
          >
            Close Emergency Panel
          </button>
        </div>
      </div>

      {isPolicePopupOpen && (
        <NearestPoliceStationModal
          isOpen={isPolicePopupOpen}
          onClose={() => setIsPolicePopupOpen(false)}
          userAddress={effectiveAddress}
          userRole={userRole}
          userName={effectiveName}
        />
      )}
    </div>
  );
};
