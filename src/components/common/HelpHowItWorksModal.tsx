import React, { useState } from 'react';
import { Logo } from './Logo';
import { LogoVariation } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Radio, 
  Bell, 
  QrCode, 
  FileText, 
  Star, 
  Power, 
  AlertTriangle, 
  Calendar, 
  Navigation, 
  Clock, 
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  HeartHandshake,
  Video,
  Play,
  Pause,
  Scan,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';

interface HelpHowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'client' | 'nurse' | 'faq' | 'video';
  logoVariation?: LogoVariation;
  onOpenSignUp?: () => void;
  onOpenPanic?: () => void;
  onOpenFaceScanTutorial?: () => void;
  onOpenStore?: () => void;
  onOpenQRGuide?: () => void;
  onOpenVideoModal?: () => void;
}

export const HelpHowItWorksModal: React.FC<HelpHowItWorksModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'client',
  logoVariation = 'heart-cross',
  onOpenSignUp,
  onOpenPanic,
  onOpenFaceScanTutorial,
  onOpenStore,
  onOpenQRGuide,
  onOpenVideoModal
}) => {
  const [activeTab, setActiveTab] = useState<'client' | 'nurse' | 'faq' | 'video'>(defaultTab);
  const [videoChapter, setVideoChapter] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-[#120224] border border-purple-500/30 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variation={logoVariation} size="sm" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#C77DFF]" />
                <span>How It Works • We Care Jamaica</span>
              </h2>
              <p className="text-xs text-purple-200">
                Official guide for clients, nurses &amp; certified caregivers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/30 p-2 gap-1.5 sm:gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('client');
            }}
            className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'client'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Client Guide</span>
          </button>

          <button
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('nurse');
            }}
            className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'nurse'
                ? 'bg-gradient-to-r from-[#7209B7] to-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Nurse Guide</span>
          </button>

          <button
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('video');
            }}
            className={`py-2.5 px-3 sm:px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-amber-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4 text-amber-400" />
            <span>Video Tutorial</span>
          </button>

          <button
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('faq');
            }}
            className={`py-2.5 px-3 sm:px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'faq'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Policies</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {/* TAB 1: CLIENT GUIDE (Section 3) */}
          {activeTab === 'client' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Video Option Callout Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-400/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs">Prefer a visual video guide?</span>
                    <span className="text-[10px] text-slate-300">Watch our interactive video on how to use the app for booking, tracking & bundles</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTabSwitch();
                    setActiveTab('video');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1 shrink-0 cursor-pointer shadow"
                >
                  <Play className="w-3 h-3 text-emerald-300" />
                  <span>Video Tutorial</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Quick Summary
                </span>
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  We Care connects you with licensed Registered Nurses (RNs), Licensed Practical Nurses (LPNs), and Certified Caregivers in Kingston, St. Andrew, Portmore &amp; Spanish Town within 90 minutes.
                </p>
              </div>

              {/* Step 1: Choose Service */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">1</span>
                  <h3>Choose Your Required Service</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Select from <strong className="text-white">Elderly Assistance</strong>, <strong className="text-white">Companion Care</strong>, <strong className="text-white">Post-Op Support</strong>, <strong className="text-white">Wellness Checks</strong>, <strong className="text-white">Diabetes Support</strong>, <strong className="text-white">Medication Reminder</strong>, or <strong className="text-white">Home Help</strong>.
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    <strong>Clinical Tasks Scope Rule:</strong> Wound Care, IV Support, and Medication Administration require a licensed <strong>Registered Nurse (RN)</strong> or <strong>LPN</strong>. Non-clinical caregivers cannot administer injections or dress deep wounds.
                  </span>
                </div>
              </div>

              {/* Step 2: Select Provider Type & Rates */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">2</span>
                  <h3>Select Provider Type &amp; Suggested Hourly Rates (JMD)</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Rates vary by zone — Kingston 6, 8 &amp; 10 reflect premium corporate area rates. You set your offered rate within the approved range:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-purple-500/30 text-center">
                    <span className="text-[10px] text-purple-300 font-bold block">RN (Registered Nurse)</span>
                    <strong className="text-emerald-400 text-sm block mt-1">$2,800 – $3,500</strong>
                    <span className="text-[10px] text-slate-400">per hour</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-purple-500/30 text-center">
                    <span className="text-[10px] text-purple-300 font-bold block">LPN Nurse</span>
                    <strong className="text-emerald-400 text-sm block mt-1">$2,200 – $2,800</strong>
                    <span className="text-[10px] text-slate-400">per hour</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-purple-500/30 text-center">
                    <span className="text-[10px] text-purple-300 font-bold block">Certified Caregiver</span>
                    <strong className="text-emerald-400 text-sm block mt-1">$1,600 – $2,000</strong>
                    <span className="text-[10px] text-slate-400">per hour</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-purple-500/30 text-center">
                    <span className="text-[10px] text-purple-300 font-bold block">Companion / Assistant</span>
                    <strong className="text-emerald-400 text-sm block mt-1">$1,400 – $1,800</strong>
                    <span className="text-[10px] text-slate-400">per hour</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Proximity & Instant Dispatch */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">3</span>
                  <h3>Helpers Near You Only (7km Radius)</h3>
                </div>
                <p className="text-xs text-slate-300">
                  We show verified helpers within <strong className="text-white">7km</strong> of your address (8km in Portmore &amp; Spanish Town), complete with reviews, specialties, and full <strong className="text-emerald-400">Verified Badge</strong> breakdowns.
                </p>
                <p className="text-xs text-slate-300">
                  When you send a request, nearby nurses get an instant loud audio chime with your price and exact distance.
                </p>
              </div>

              {/* Step 4: Doorstep QR Verification */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">4</span>
                  <h3>At Your Door: Doorbell Chime + QR Check-in</h3>
                </div>
                <p className="text-xs text-slate-300">
                  When the nurse arrives, you'll hear a warm Jamaican doorbell chime in your app. Ask the helper to show their <strong className="text-white">We Care ID Badge</strong> and scan your <strong className="text-white">Booking QR Code</strong> from <em>My Bookings &gt; Current Visit</em>. The visit cannot start without this QR scan.
                </p>
                {onOpenQRGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenQRGuide();
                    }}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Open Easy QR Check-in Guide →</span>
                  </button>
                )}
              </div>

              {/* Step 5: After Visit */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">5</span>
                  <h3>After Visit: Notes, Insurance Receipt &amp; Rating</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Review logged wellness observations and visit summary. Download your itemized <strong className="text-white">JMD Receipt</strong> for health insurance claim submission (Sagicor, Medecus, Guardian Life). Rating the nurse is required upon checkout.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: NURSE & CAREGIVER GUIDE (Section 5) */}
          {activeTab === 'nurse' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Mandatory Staff Biometric Face Scan Tutorial Banner */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Scan className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs flex items-center gap-1.5">
                      <span>Mandatory Staff Biometric Face Scan</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">Anti-Fraud</span>
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      During sign-up, nurses & admins must scan their live face. Photo file uploads from device storage are strictly disabled.
                    </p>
                  </div>
                </div>
                {onOpenFaceScanTutorial && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playToggleClick();
                      onOpenFaceScanTutorial();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>Face Scan Tutorial</span>
                  </button>
                )}
              </div>

              {/* Duty Mode & Job Acceptance */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <Power className="w-4 h-4 text-emerald-400" />
                  <h3>1. Duty Mode &amp; Receiving Requests</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toggle <strong className="text-emerald-400">ON DUTY</strong> in your header when ready to work. You only receive incoming requests when ON DUTY and within your active zone. When OFF DUTY, you receive zero requests and location tracking is fully disabled.
                </p>
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
                  <strong>Accepting Jobs:</strong> You see client zone, distance (km), service, and offered price. You will never be offered a booking below your set minimum rate. You can Accept or Decline freely with no penalty. <em>Note: 3 confirmed no-shows after accepting leads to automatic profile deactivation.</em>
                </div>
              </div>

              {/* Visit Workflow IN ORDER */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3>2. Visit Workflow IN ORDER</h3>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-black text-[10px] shrink-0">1. En Route</span>
                    <div>
                      <strong className="text-white block">Notify Client &amp; Open GPS</strong>
                      <span className="text-slate-300">Tap En Route to notify the client and launch turn-by-turn directions in Google Maps or Waze.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] shrink-0">2. Arrived</span>
                    <div>
                      <strong className="text-white block">Doorstep Arrival Alert</strong>
                      <span className="text-slate-300">Tap Arrived at Doorstep to send the warm doorbell chime and arrival notification to the patient.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shrink-0">3. QR Scan</span>
                    <div>
                      <strong className="text-white block">Show ID &amp; Scan Client Booking QR</strong>
                      <span className="text-slate-300">Display your Verified We Care ID card and scan the client's Booking QR code to start the visit timer. The visit cannot begin without QR verification.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white font-black text-[10px] shrink-0">4. In Progress</span>
                    <div>
                      <strong className="text-white block">PPE Checklist &amp; Vitals Logging</strong>
                      <span className="text-slate-300">Confirm N95 mask, sterile gloves, and sanitized kit. Log BP, Blood Glucose, SpO2, Pulse, and Temp. The app flags critical ranges for review but does not diagnose. Header clearly states: "For informational purposes only. Not medical advice."</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-[#E63946] text-white font-black text-[10px] shrink-0">5. Completed</span>
                    <div>
                      <strong className="text-white block">QR Checkout &amp; Payout Release</strong>
                      <span className="text-slate-300">Tap complete, then present your Nurse ID QR code for the client to scan. Both QR check-in and QR check-out are required to unlock earnings.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout Schedule */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <h3>Weekly Friday Direct Bank Payouts</h3>
                </div>
                <p className="text-xs text-slate-200">
                  Bank details (NCB, Scotiabank, JN Bank, CIBC, or Lynk) are added AFTER admin approval in <em>Profile &gt; Bank Info</em>. Payouts are transferred every Friday morning for all completed visits.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SAFETY & POLICIES (Section 6, 8, 9) */}
          {activeTab === 'faq' && (
            <div className="space-y-6 animate-fadeIn">
              {/* SOS Panic Hierarchy */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-3">
                <div className="flex items-center gap-2 text-red-300 font-extrabold text-sm">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <h3>24/7 SOS Panic Button Hierarchy</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <strong className="text-amber-300 block mb-1">Level 1 SOS (Single Tap)</strong>
                    <span className="text-slate-300">Alerts emergency contacts + assigned helper/client + We Care Admin. Automatically shares live location coordinates for 60 minutes. Use whenever you feel uncomfortable or unsafe.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <strong className="text-red-400 block mb-1">Level 2 Emergency 119 (Press &amp; Hold 3 Seconds)</strong>
                    <span className="text-slate-300">Instantly speed-dials 119 Jamaican Police / Ambulance dispatch directly and broadcasts high-accuracy GPS coordinates. For genuine life-safety emergencies only.</span>
                  </div>
                </div>
              </div>

              {/* Cancellation & Fees */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <Calendar className="w-4 h-4 text-[#C77DFF]" />
                  <h3>Fair Cancellation Policy</h3>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li><strong className="text-white">Free cancellation</strong> up to 3 hours BEFORE scheduled visit time.</li>
                  <li><strong className="text-amber-300">Cancel within 3 hours:</strong> $1,000 JMD fee to compensate helper's transit reservation.</li>
                  <li><strong className="text-red-400">Client No-Show:</strong> $2,000 JMD fee.</li>
                  <li><strong className="text-purple-300">Nurse Late Cancel:</strong> If nurse cancels after accepting within 2 hours of visit time, a warning is logged; repeated late cancels result in temporary suspension.</li>
                </ul>
              </div>

              {/* Location Privacy */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <h3>Location Privacy &amp; 30-Minute Window</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To protect patient privacy, live exact GPS pin tracking is active ONLY during the booking window (from 30 minutes before the scheduled time until 30 minutes after completion). Outside this window, only the broad neighbourhood area is shown (e.g. "Area: Kingston 8").
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: VIDEO TUTORIAL & APP WALKTHROUGH */}
          {activeTab === 'video' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Video Player Display Screen */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-br from-[#0c1033] via-[#151c4a] to-[#0a0d24]">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span>Interactive App Walkthrough</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    3:30 Total Runtime
                  </span>
                </div>

                <div className="relative z-10 my-auto text-center space-y-2 p-3 sm:p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md max-w-lg mx-auto">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
                    {videoChapter === 0 && <Stethoscope className="w-6 h-6" />}
                    {videoChapter === 1 && <Clock className="w-6 h-6" />}
                    {videoChapter === 2 && <ShoppingBag className="w-6 h-6" />}
                    {videoChapter === 3 && <MapPin className="w-6 h-6 animate-bounce" />}
                    {videoChapter === 4 && <AlertTriangle className="w-6 h-6 text-rose-300" />}
                    {videoChapter === 5 && <Scan className="w-6 h-6 text-cyan-300" />}
                  </div>

                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400 block">
                    {videoChapter === 0 && 'Chapter 1: Platform Overview'}
                    {videoChapter === 1 && 'Chapter 2: Booking a Home Nurse'}
                    {videoChapter === 2 && 'Chapter 3: Medical Store Bundles'}
                    {videoChapter === 3 && 'Chapter 4: Live GPS & QR Check-In'}
                    {videoChapter === 4 && 'Chapter 5: Emergency SOS 119'}
                    {videoChapter === 5 && 'Chapter 6: Staff Biometric Face Scan'}
                  </span>

                  <h4 className="text-sm sm:text-base font-black text-white">
                    {videoChapter === 0 && 'Verified NCJ Home Nursing in Jamaica'}
                    {videoChapter === 1 && 'Procedure Selection, Pricing & Vetting'}
                    {videoChapter === 2 && 'Add Supplies & Monitors to Care Visits'}
                    {videoChapter === 3 && 'Real-Time Map Tracking & Doorstep Chime'}
                    {videoChapter === 4 && 'Real GPS Coordinates & Attending Nurse Dispatch'}
                    {videoChapter === 5 && 'Mandatory Live Face Scan & Passkey Login'}
                  </h4>

                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {videoChapter === 0 && '100% NCJ licensed nurses & caregivers arriving in 15–30 min with clinical escrow protection.'}
                    {videoChapter === 1 && 'Pick from IV therapy, post-op dressings, or senior care, select nurse reviews, and confirm visit date.'}
                    {videoChapter === 2 && 'Order gloves, BP monitors, and wound supplies in one checkout—delivered hand-in-hand by your nurse.'}
                    {videoChapter === 3 && 'Watch nurse travel on the live map, receive an audible doorbell chime, and scan your QR code.'}
                    {videoChapter === 4 && 'Immediate 119 police & Jamaica Fire Brigade dispatch with real attending nurse contact info.'}
                    {videoChapter === 5 && 'Nurses & admins scan their live face via camera. Photo file uploads are strictly disabled.'}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVideoPlaying(!isVideoPlaying);
                        soundFX.playToggleClick();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{isVideoPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoChapter(0);
                        soundFX.playToggleClick();
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
                      title="Restart"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-300 font-mono">
                    Chapter {videoChapter + 1} of 6
                  </span>
                </div>
              </div>

              {/* Chapter Cards Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-400" />
                  <span>Choose Video Topic / Feature Walkthrough</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 0, title: '1. Platform Overview', desc: 'NCJ licensing, coverage zones, safety' },
                    { id: 1, title: '2. Book Home Nurse', desc: 'Select procedure, nurse reviews, booking' },
                    { id: 2, title: '3. Store & Care Bundles', desc: 'Bundle gloves, BP monitors with visit' },
                    { id: 3, title: '4. Live GPS & QR Scan', desc: 'Real-time arrival map, door chime' },
                    { id: 4, title: '5. Emergency SOS 119', desc: 'Real GPS dispatch & attending nurse' },
                    { id: 5, title: '6. Biometric Face Scan', desc: 'Live camera scan tutorial for staff' }
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setVideoChapter(ch.id);
                        soundFX.playTabSwitch();
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        videoChapter === ch.id
                          ? 'bg-blue-600/30 border-blue-400 text-white ring-2 ring-blue-400/50 shadow-md'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-white text-[11px]">{ch.title}</div>
                      <div className="text-[10px] text-slate-400">{ch.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons below Video */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-300">
                  Ready to test these features in your account?
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {onOpenSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSignUp();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs transition cursor-pointer"
                    >
                      Sign Up Account
                    </button>
                  )}
                  {onOpenFaceScanTutorial && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenFaceScanTutorial();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/30 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>Face Scan Tutorial</span>
                    </button>
                  )}
                  {onOpenStore && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStore();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition cursor-pointer"
                    >
                      Medical Store
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Corporate Area: Kingston, St. Andrew, Portmore &amp; Spanish Town
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
