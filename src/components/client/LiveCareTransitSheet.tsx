import React, { useState, useEffect, useRef } from 'react';
import { Booking, NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  ShieldAlert, 
  Share2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  KeyRound, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radio,
  Timer,
  Info,
  Lock,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveCareTransitSheetProps {
  booking: Booking;
  nurse?: NurseProfile | null;
  onOpenChat: (booking: Booking) => void;
  onOpenPanic: (booking?: Booking) => void;
  onCancelBooking?: (bookingId: string, reason: string) => void;
  onArrivalVerified?: (bookingId: string) => void;
  onStartTimer?: (bookingId: string) => void;
}

export const LiveCareTransitSheet: React.FC<LiveCareTransitSheetProps> = ({
  booking,
  nurse,
  onOpenChat,
  onOpenPanic,
  onCancelBooking,
  onArrivalVerified,
  onStartTimer
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  
  // Simulated transit movement and live ETA
  const [etaMinutes, setEtaMinutes] = useState<number>(booking.liveEtaMinutes || 6);
  const [etaSeconds, setEtaSeconds] = useState<number>(30);
  const [carProgress, setCarProgress] = useState<number>(0.3); // 0 to 1 along path

  // Doorstep 4-digit PIN
  const safetyPin = booking.safetyPin || booking.arrivalPassCode || '7392';

  // Countdown timer for en_route
  useEffect(() => {
    if (booking.status !== 'en_route') return;

    const interval = setInterval(() => {
      setEtaSeconds(prevSec => {
        if (prevSec <= 1) {
          setEtaMinutes(prevMin => {
            if (prevMin <= 1) {
              // Nurse has arrived at doorstep!
              soundFX.playSuccessPing();
              return 0;
            }
            return prevMin - 1;
          });
          return 59;
        }
        return prevSec - 1;
      });

      // Smooth progress advancement towards 1.0
      setCarProgress(prev => Math.min(0.95, prev + 0.005));
    }, 1000);

    return () => clearInterval(interval);
  }, [booking.status]);

  // Share Live Trip Link
  const handleShareTrip = () => {
    const shareText = `Track Nurse ${booking.nurseName || 'Caregiver'} arriving at ${booking.clientAddress || booking.zone} for WeCare Jamaican Home Visit. Safety PIN: ${safetyPin}. Live tracking: https://wecare.jm/track/${booking.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      soundFX.playDelightChime();
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  // SVG route geometry coordinates for Kingston animation
  const routeStart = { x: 40, y: 140 };
  const routeEnd = { x: 340, y: 50 };
  const currentCarX = routeStart.x + (routeEnd.x - routeStart.x) * carProgress;
  const currentCarY = routeStart.y + (routeEnd.y - routeStart.y) * carProgress;

  return (
    <div className="w-full bg-gradient-to-b from-[#140420] via-[#0d0216] to-black border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden text-white relative">
      {/* Top Floating Status Strip (Dynamic Status Pill) */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E1B4B]/40 via-purple-900/30 to-black border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shrink-0 animate-pulse">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                {booking.status === 'en_route' ? 'En Route to Doorstep' : booking.status === 'in_progress' ? 'Care in Progress' : 'Nurse Dispatched'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white truncate">
              {booking.status === 'en_route' ? (
                etaMinutes > 0 ? (
                  <span>Nurse arriving in {etaMinutes} min ({etaSeconds}s)</span>
                ) : (
                  <span className="text-emerald-400">Nurse has arrived at your gate!</span>
                )
              ) : booking.status === 'in_progress' ? (
                <span>Clinical Visit Active</span>
              ) : (
                <span>Visit Scheduled: {booking.serviceName}</span>
              )}
            </h3>
          </div>
        </div>

        {/* Toggle Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
          title={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* LIVE SIMULATED ROUTE MAP RADAR */}
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#0a0212] h-44 sm:h-52 shadow-inner flex items-center justify-center">
            {/* SVG Map Canvas */}
            <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
              {/* Grid Background */}
              <defs>
                <pattern id="transitGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E1B4B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <rect width="400" height="200" fill="url(#transitGrid)" />

              {/* Kingston Roads / Corridors */}
              <path d="M 10 180 Q 150 140 380 160" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
              <path d="M 50 20 Q 200 80 350 180" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
              
              {/* Active Route Line */}
              <path 
                d="M 40 140 Q 180 120 340 50" 
                stroke="url(#routeGrad)" 
                strokeWidth="4" 
                strokeDasharray="6 4"
                fill="none" 
              />

              {/* Destination Pin (Patient Doorstep) */}
              <g transform="translate(340, 50)">
                <circle r="14" fill="rgba(230, 57, 70, 0.25)" className="animate-ping" />
                <circle r="8" fill="#F59E0B" stroke="#fff" strokeWidth="2" />
                <text x="12" y="4" fill="#fff" fontSize="10" fontWeight="bold">Patient Home</text>
              </g>

              {/* Origin / Depot */}
              <g transform="translate(40, 140)">
                <circle r="5" fill="#1E1B4B" stroke="#fff" strokeWidth="1.5" />
                <text x="-30" y="-8" fill="#94a3b8" fontSize="8">Dispatch Depot</text>
              </g>

              {/* Moving Nurse Transit Marker */}
              <g transform={`translate(${currentCarX}, ${currentCarY})`}>
                <circle r="16" fill="rgba(16, 185, 129, 0.3)" className="animate-ping" />
                <circle r="10" fill="#10B981" stroke="#fff" strokeWidth="2" />
                <circle r="3" fill="#fff" />
                <text x="12" y="-4" fill="#6ee7b7" fontSize="9" fontWeight="bold">Nurse En Route</text>
              </g>
            </svg>

            {/* Live Traffic Badge Overlay */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hope Rd / Trafalgar corridor • Normal Transit</span>
            </div>

            {/* Distance & ETA Overlay */}
            <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/30 text-right shadow-lg">
              <span className="text-[10px] text-emerald-300 block font-bold uppercase">Transit Distance</span>
              <span className="text-xs font-black text-white font-mono">
                {((1 - carProgress) * (booking.distanceKm || 2.4)).toFixed(1)} km remaining
              </span>
            </div>
          </div>

          {/* LATEST ARRIVAL DISPATCH NOTIFICATION FROM NURSE */}
          {(booking.arrivalNotificationMessage || booking.arrivalEtaMinutes !== undefined) && (
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              (booking.arrivalEtaMinutes ?? 10) < 2
                ? 'bg-red-950/80 border-red-500/70 text-red-100 ring-2 ring-red-400/40 animate-pulse'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-ping" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider block">
                    {(booking.arrivalEtaMinutes ?? 10) < 2 ? '🚨 Vicinity Alert (< 2 mins)' : '📡 Live Arrival Ping'}
                  </span>
                  <p className="text-xs font-bold text-white">
                    {booking.arrivalNotificationMessage || `Nurse is ${booking.arrivalEtaMinutes} minutes away`}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-300">
                {booking.arrivalEtaDistanceKm ? `${booking.arrivalEtaDistanceKm} km away` : ''}
              </span>
            </div>
          )}

          {/* 4-DIGIT SAFETY PIN CARD (CLINICAL SAFETY VERIFICATION) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#1d072b] to-indigo-950/70 border-2 border-purple-500/40 shadow-xl space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] uppercase font-black tracking-widest text-amber-300">
                Official Doorstep Safety PIN
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 my-2">
              {safetyPin.split('').map((digit, idx) => (
                <div
                  key={idx}
                  className="w-11 h-12 rounded-2xl bg-black/60 border border-purple-400/50 flex items-center justify-center text-xl sm:text-2xl font-black text-white font-mono shadow-inner"
                >
                  {digit}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-purple-200 max-w-md mx-auto">
              Provide this 4-digit PIN to your attending nurse upon arrival at your doorstep. They will enter it into their WeCare app to verify identity and unlock the care session.
            </p>
          </div>

          {/* ATTENDING NURSE DETAILS CARD */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Nurse Info */}
            <div className="flex items-center gap-3">
              <img
                src={booking.nursePhoto || 'https://images.unsplash.com/photo-1594824813587-0b1689363590?auto=format&fit=crop&q=80&w=400'}
                alt={booking.nurseName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-white text-base">{booking.nurseName || 'Assigned Nurse'}</h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    <span>NCJ Verified</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star className="w-3 h-3 fill-amber-300" />
                    <span>4.95 (380+ visits)</span>
                  </span>
                  <span>•</span>
                  <span>Sterile clinical kit on board</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Visit Total</span>
              <span className="text-lg font-black text-emerald-400">
                JMD ${(booking.priceJMD || 7500).toLocaleString()}
              </span>
              <span className="text-[10px] text-purple-300 block capitalize">
                Paid via {booking.paymentMethod?.replace('_', ' ') || 'NCB Quik'}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS (CALL, CHAT, SAFETY SHIELD, SHARE) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {/* Call Nurse */}
            <a
              href={`tel:${booking.nursePhone || '+1 (876) 555-0100'}`}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition flex items-center justify-center gap-2 group"
            >
              <Phone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              <span>Call Nurse</span>
            </a>

            {/* Chat Nurse */}
            <button
              type="button"
              onClick={() => onOpenChat(booking)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition flex items-center justify-center gap-2 group"
            >
              <MessageSquare className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
              <span>In-App Chat</span>
            </button>

            {/* Share Live Trip Link */}
            <button
              type="button"
              onClick={handleShareTrip}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition flex items-center justify-center gap-2 group"
            >
              <Share2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
              <span>{shareCopied ? 'Link Copied!' : 'Share Trip'}</span>
            </button>

            {/* Safety Toolkit (Clinical Emergency Shield) */}
            <button
              type="button"
              onClick={() => setShowSafetyModal(true)}
              className="p-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-bold transition flex items-center justify-center gap-2 group"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 group-hover:scale-110 transition" />
              <span>Safety Toolkit</span>
            </button>
          </div>
        </div>
      )}

      {/* SAFETY TOOLKIT MODAL */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#160424] border border-red-500/40 rounded-3xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">WeCare Safety Toolkit</h3>
              </div>
              <button
                onClick={() => setShowSafetyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Your safety and dignity are 100% protected. Use these emergency tools immediately if you feel uncomfortable.
            </p>

            <div className="space-y-2.5">
              {/* 119 Police & Medical Dispatch */}
              <a
                href="tel:119"
                className="w-full p-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-between transition shadow-lg"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4" />
                  <span>Call Emergency 119 (Police / Ambulance)</span>
                </div>
                <span className="text-[10px] font-black uppercase bg-black/30 px-2 py-0.5 rounded">
                  Instant Dial
                </span>
              </a>

              {/* 24/7 WeCare Clinical Trust Line */}
              <a
                href="tel:+18769262273"
                className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>24/7 WeCare Trust &amp; Safety Hotline</span>
                </div>
                <span className="text-slate-400 text-[10px]">876-926-CARE</span>
              </a>

              {/* Trigger System Panic */}
              <button
                type="button"
                onClick={() => {
                  setShowSafetyModal(false);
                  onOpenPanic(booking);
                }}
                className="w-full p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Trigger Clinical Escalation Protocol</span>
              </button>
            </div>

            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-bold hover:bg-white/5 transition"
            >
              Close Safety Toolkit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
