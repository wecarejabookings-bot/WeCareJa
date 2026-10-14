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
  HeartHandshake
} from 'lucide-react';

interface HelpHowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'client' | 'nurse' | 'faq';
  logoVariation?: LogoVariation;
  onOpenSignUp?: () => void;
  onOpenPanic?: () => void;
}

export const HelpHowItWorksModal: React.FC<HelpHowItWorksModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'client',
  logoVariation = 'heart-cross',
  onOpenSignUp,
  onOpenPanic
}) => {
  const [activeTab, setActiveTab] = useState<'client' | 'nurse' | 'faq'>(defaultTab);

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
        <div className="flex border-b border-white/10 bg-black/30 p-2 gap-2 text-xs font-bold">
          <button
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('client');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'client'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Client &amp; Family Guide</span>
          </button>

          <button
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('nurse');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'nurse'
                ? 'bg-gradient-to-r from-[#7209B7] to-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Nurse &amp; Caregiver Guide</span>
          </button>

          <button
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('faq');
            }}
            className={`py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'faq'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety &amp; Policies</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {/* TAB 1: CLIENT GUIDE (Section 3) */}
          {activeTab === 'client' && (
            <div className="space-y-6 animate-fadeIn">
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
