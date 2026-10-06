import React, { useState, useEffect } from 'react';
import { Booking } from '../../types';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  User, 
  ShieldCheck, 
  Clock, 
  Heart, 
  X, 
  MessageSquare, 
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface CallContactModalProps {
  booking: Booking;
  callerRole: 'caregiver' | 'client';
  onClose: () => void;
  onOpenChat?: (booking: Booking) => void;
}

export const CallContactModal: React.FC<CallContactModalProps> = ({
  booking,
  callerRole,
  onClose,
  onOpenChat
}) => {
  const [activeCallTarget, setActiveCallTarget] = useState<{
    name: string;
    role: string;
    phone: string;
    isPatient: boolean;
  } | null>(null);

  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Derive Client & Patient contacts from the booking
  const clientContact = {
    name: booking.clientName || 'Client',
    role: 'Primary Client (Account Holder)',
    phone: booking.clientPhone || '+1 (876) 555-0199',
    isPatient: false
  };

  const patientBioData = booking.patientBioData;
  const emergencyContact = booking.clientEmergencyContact;
  const trustedFamily = booking.trustedFamilyMember;

  // Patient contact details
  const patientContact = {
    name: emergencyContact?.name || `${booking.clientName} (Patient)`,
    role: emergencyContact ? `Patient / Next of Kin (${emergencyContact.relation})` : 'Patient on Record',
    phone: emergencyContact?.phone || booking.clientPhone || '+1 (876) 555-0199',
    isPatient: true
  };

  // Caregiver contact details (if caller is client)
  const caregiverContact = {
    name: booking.nurseName || 'Assigned Caregiver',
    role: 'Assigned Registered Caregiver',
    phone: booking.nursePhone || '+1 (876) 555-3829',
    isPatient: false
  };

  // Timer for connected call
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const handleStartInAppCall = (contact: typeof clientContact) => {
    setActiveCallTarget(contact);
    setCallState('calling');
    setCallDurationSeconds(0);
    soundFX.playCountdownTick(true);

    // Simulate answer after 2.5 seconds
    setTimeout(() => {
      setCallState('connected');
      soundFX.playSuccessPing();
    }, 2400);
  };

  const handleEndCall = () => {
    setCallState('ended');
    soundFX.playCancellation();
    setTimeout(() => {
      setCallState('idle');
      setActiveCallTarget(null);
    }, 1200);
  };

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#1b082e] via-[#120420] to-[#240a38] border border-purple-500/30 p-6 shadow-2xl text-white space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {callerRole === 'caregiver' ? 'Call Client or Patient' : 'Contact Caregiver'}
            </h3>
            <p className="text-xs text-slate-300">
              {callerRole === 'caregiver'
                ? `Booking #${booking.id} • ${booking.serviceName}`
                : `Booking #${booking.id} with ${booking.nurseName || 'Caregiver'}`}
            </p>
          </div>
        </div>

        {/* In-App Active Voice Call Screen */}
        {callState !== 'idle' && activeCallTarget ? (
          <div className="p-6 rounded-2xl bg-black/40 border border-purple-500/30 text-center space-y-5">
            <div className="relative inline-block">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#7209B7] to-[#E63946] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-900/50">
                {activeCallTarget.name.charAt(0)}
              </div>
              {callState === 'calling' && (
                <span className="absolute -inset-2 rounded-full border-2 border-purple-400/60 animate-ping pointer-events-none" />
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-white">{activeCallTarget.name}</h4>
              <p className="text-xs text-purple-300">{activeCallTarget.role}</p>
              <p className="text-xs font-mono text-slate-400 mt-1">{activeCallTarget.phone}</p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono">
              {callState === 'calling' && (
                <span className="text-amber-300 animate-pulse">Ringing Jamaican Network...</span>
              )}
              {callState === 'connected' && (
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Connected: {formatCallTime(callDurationSeconds)}
                </span>
              )}
              {callState === 'ended' && (
                <span className="text-slate-400">Call Ended</span>
              )}
            </div>

            {/* Audio waveform simulation */}
            {callState === 'connected' && (
              <div className="flex items-center justify-center gap-1 h-8">
                {[40, 75, 95, 60, 85, 30, 90, 65, 45, 80].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-emerald-400/80 rounded-full transition-all duration-300"
                    style={{
                      height: `${isMuted ? 4 : Math.max(8, (h + (callDurationSeconds % 5) * 8) % 100)}%`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full border transition ${
                  isMuted 
                    ? 'bg-red-500/20 border-red-500/50 text-red-300' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={handleEndCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950/50 transition transform hover:scale-105"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3.5 rounded-full border transition ${
                  isSpeakerOn 
                    ? 'bg-purple-500/30 border-purple-500/50 text-purple-200' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
                title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ) : (
          /* Selection of Contacts */
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Choose who you would like to reach directly. You can place a direct telephone call or launch the secure in-app audio line.
            </p>

            {callerRole === 'caregiver' ? (
              <div className="space-y-3">
                {/* 1. Client Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">
                          Client (Primary Account Holder)
                        </span>
                        <h4 className="text-sm font-bold text-white">{clientContact.name}</h4>
                        <span className="text-xs text-slate-300 font-mono">{clientContact.phone}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-[10px] font-bold border border-purple-500/30">
                      Primary Contact
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                    <a
                      href={`tel:${clientContact.phone}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Direct Phone Dial</span>
                    </a>

                    <button
                      onClick={() => handleStartInAppCall(clientContact)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-purple-200 border border-white/10 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In-App Voice Call</span>
                    </button>
                  </div>
                </div>

                {/* 2. Patient / Emergency Contact Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
                        <Heart className="w-5 h-5 text-[#E63946]" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-red-300 tracking-wider block">
                          Patient / Family Care Recipient
                        </span>
                        <h4 className="text-sm font-bold text-white">{patientContact.name}</h4>
                        <span className="text-xs text-slate-300 font-mono">{patientContact.phone}</span>
                        <span className="text-[11px] text-slate-400 block">{patientContact.role}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-200 text-[10px] font-bold border border-red-500/30">
                      Care Recipient
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                    <a
                      href={`tel:${patientContact.phone}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Patient Directly</span>
                    </a>

                    <button
                      onClick={() => handleStartInAppCall(patientContact)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-emerald-200 border border-white/10 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In-App Voice Call</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Caller is Client calling Caregiver */
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.nursePhoto || 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=400'}
                      alt={caregiverContact.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-400"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">
                        Assigned Practitioner
                      </span>
                      <h4 className="text-sm font-bold text-white">{caregiverContact.name}</h4>
                      <span className="text-xs text-slate-300 font-mono">{caregiverContact.phone}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                  <a
                    href={`tel:${caregiverContact.phone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Direct Phone Dial</span>
                  </a>

                  <button
                    onClick={() => handleStartInAppCall(caregiverContact)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-purple-200 border border-white/10 font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In-App Voice Call</span>
                  </button>
                </div>
              </div>
            )}

            {/* In-App Chat Quick Action */}
            {onOpenChat && (
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat(booking);
                  }}
                  className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1 font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Prefer text messaging? Open Live Chat</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
