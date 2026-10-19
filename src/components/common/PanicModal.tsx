import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, AlertTriangle, MapPin, Send, CheckCircle2, User, Heart, Building2 } from 'lucide-react';
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
}

export const PanicModal: React.FC<PanicModalProps> = ({
  isOpen,
  onClose,
  activeBooking,
  userRole
}) => {
  const [alertSent, setAlertSent] = useState(false);
  const [isPolicePopupOpen, setIsPolicePopupOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const address = activeBooking?.clientAddress || 'Trafalgar Road, New Kingston, Jamaica';
  const nearestPolice = findNearestPoliceStations(null, null, address, 1)[0];

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
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition border border-white/10"
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
                <span className="text-xs font-bold text-red-300 block">Current Jamaican Service Location:</span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {activeBooking?.clientAddress || 'Trafalgar Road, New Kingston'}, Kingston, St. Andrew, Portmore, and Spanish Town
                </p>
                {activeBooking && (
                  <p className="text-xs text-slate-300 mt-1">
                    Booking: <strong>{activeBooking.serviceName}</strong> | Nurse: <strong>{activeBooking.nurseName || 'Assigned Nurse'}</strong>
                  </p>
                )}
              </div>
            </div>
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
                <a
                  href={`tel:${nearestPolice.primaryPhone.replace(/[^0-9+]/g, '')}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Station</span>
                </a>
              </div>
            </div>
          )}

          {/* AI Voice Police Dispatcher (30s Failsafe Countdown when unable to speak) */}
          <AIEmergencyVoicePoliceDispatch
            userRole={userRole}
            userName={userRole === 'nurse' ? (activeBooking?.nurseName || 'Nurse on Duty') : (activeBooking?.clientName || 'Patient / Family')}
            lat={null}
            lng={null}
            address={address}
            nearestStationName={nearestPolice?.name}
            nearestStationPhone={nearestPolice?.primaryPhone}
            nearestStationDistanceKm={nearestPolice?.distanceKm}
            autoStartCountdown={true}
          />

          {/* Primary 119 Call Action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:119"
              className="flex-1 p-4 rounded-2xl bg-[#E63946] hover:bg-red-600 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-red-950/50 transition group border border-red-400/40"
            >
              <div className="p-2 rounded-xl bg-white/20 group-hover:scale-110 transition">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-xs text-red-100 block">Immediate Speed Dial</span>
                <span className="text-lg font-black">Call 119 Emergency</span>
              </div>
            </a>

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
          userAddress={address}
          userRole={userRole}
          userName={userRole === 'nurse' ? (activeBooking?.nurseName || 'Nurse on Duty') : (activeBooking?.clientName || 'Patient / Family')}
        />
      )}
    </div>
  );
};
