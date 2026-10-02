import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Volume2, 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  DollarSign, 
  QrCode, 
  AlertTriangle, 
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface PushNotificationLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushNotificationLibraryModal: React.FC<PushNotificationLibraryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeRole, setActiveRole] = useState<'client' | 'nurse' | 'admin'>('client');
  const [testedSound, setTestedSound] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestSound = (soundType: 'doorbell' | 'request' | 'alert' | 'success') => {
    setTestedSound(soundType);
    if (soundType === 'doorbell') {
      soundFX.playDoorbellArrived();
    } else if (soundType === 'request') {
      soundFX.playNewJobRequestLoud();
    } else if (soundType === 'alert') {
      soundFX.playAlertSirenPulse();
    } else if (soundType === 'success') {
      soundFX.playSuccessSoftDing();
    }

    setTimeout(() => {
      setTestedSound(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-[#120224] border border-purple-500/30 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-300 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#C77DFF]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Push Notification &amp; Sound Library</span>
              </h2>
              <p className="text-xs text-purple-200">
                Section 11 • Interactive audio previews &amp; notification triggers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Engine Bar */}
        <div className="px-5 py-3 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Audio Chimes:</span>
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleTestSound('doorbell')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 ${
                testedSound === 'doorbell'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>doorbell.mp3 (Arrival)</span>
            </button>

            <button
              onClick={() => handleTestSound('request')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 ${
                testedSound === 'request'
                  ? 'bg-purple-500 text-white border-purple-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>request.mp3 (Job)</span>
            </button>

            <button
              onClick={() => handleTestSound('alert')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 ${
                testedSound === 'alert'
                  ? 'bg-red-500 text-white border-red-400 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>alert.mp3 (SOS)</span>
            </button>

            <button
              onClick={() => handleTestSound('success')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 ${
                testedSound === 'success'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>success.mp3</span>
            </button>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-white/10 bg-black/20 p-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveRole('client')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeRole === 'client' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            Client Alerts (6)
          </button>
          <button
            onClick={() => setActiveRole('nurse')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeRole === 'nurse' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            Nurse / Caregiver Alerts (6)
          </button>
          <button
            onClick={() => setActiveRole('admin')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeRole === 'admin' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            Admin Ops Alerts (3)
          </button>
        </div>

        {/* Notification Cards */}
        <div className="p-5 overflow-y-auto space-y-3 text-xs flex-1">
          {activeRole === 'client' && (
            <>
              {/* 1. Nurse En Route */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-400">NURSE EN ROUTE</span>
                  <span className="text-[10px] text-slate-400">Default Chime</span>
                </div>
                <p className="text-white font-medium">
                  "Nurse Patricia Campbell is on the way! ETA: 22 mins. Track live in app."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                    [Track in App]
                  </span>
                </div>
              </div>

              {/* 2. Nurse Arrived (DOORBELL) */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">NURSE ARRIVED AT DOORSTEP</span>
                  <button
                    onClick={() => handleTestSound('doorbell')}
                    className="text-[10px] text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>SOUND: doorbell.mp3</span>
                  </button>
                </div>
                <p className="text-white font-medium">
                  "🚪 Nurse Patricia Campbell is at your door! Please check their We Care ID badge before opening."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    [Open App]
                  </span>
                  <span className="text-[10px] text-slate-400">Muted 9pm–6am if night mode active</span>
                </div>
              </div>

              {/* 3. QR Check-in */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-purple-300">QR CHECK-IN VERIFIED</span>
                  <span className="text-[10px] text-slate-400">Silent / Vibrate</span>
                </div>
                <p className="text-white font-medium">
                  "Visit started at 10:14 AM. Nurse Patricia Campbell has checked in via QR scan."
                </p>
              </div>

              {/* 4. Wellness Log Added */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">WELLNESS LOG ADDED</span>
                  <span className="text-[10px] text-slate-400">Informational</span>
                </div>
                <p className="text-white font-medium">
                  "Nurse Patricia Campbell logged wellness observations. Tap to view notes &amp; vitals."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                    [View Notes]
                  </span>
                </div>
              </div>

              {/* 5. Visit Completed */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">VISIT COMPLETED</span>
                  <button
                    onClick={() => handleTestSound('success')}
                    className="text-[10px] text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>SOUND: success.mp3</span>
                  </button>
                </div>
                <p className="text-white font-medium">
                  "Visit complete! Total: $6,500 JMD. Your receipt is ready."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
                    [View Receipt]
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 font-bold text-[10px]">
                    [Rate Nurse]
                  </span>
                </div>
              </div>

              {/* 6. Emergency Alert */}
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-red-400">EMERGENCY SOS ALERT</span>
                  <button
                    onClick={() => handleTestSound('alert')}
                    className="text-[10px] text-red-300 bg-red-500/20 hover:bg-red-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>SOUND: alert.mp3</span>
                  </button>
                </div>
                <p className="text-white font-medium">
                  "🚨 EMERGENCY ALERT triggered at 22 Mona Road, Kingston 6. Help is on the way. If accidental, tap Cancel."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold text-[10px]">
                    [I'm Safe - Cancel]
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                    [Call 119]
                  </span>
                </div>
              </div>
            </>
          )}

          {activeRole === 'nurse' && (
            <>
              {/* 1. New Job Request */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-purple-300">NEW JOB REQUEST</span>
                  <button
                    onClick={() => handleTestSound('request')}
                    className="text-[10px] text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>SOUND: request.mp3 (Loud)</span>
                  </button>
                </div>
                <p className="text-white font-medium">
                  "New Job Request! Elderly Assistance in Kingston 6. $7,000 JMD • 3.2 km away. You have 2 minutes to accept."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]">
                    [Accept]
                  </span>
                  <span className="px-2.5 py-1 rounded bg-white/10 text-slate-300 font-bold text-[10px]">
                    [Decline]
                  </span>
                </div>
              </div>

              {/* 2. Job Accepted */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-400">JOB ACCEPTED</span>
                  <span className="text-[10px] text-slate-400">Standard Ping</span>
                </div>
                <p className="text-white font-medium">
                  "You accepted Patricia Campbell in Kingston 6. Tap 'En Route' when you depart."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                    [En Route]
                  </span>
                </div>
              </div>

              {/* 3. 30 Min Before */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400">30 MIN VISIT COUNTDOWN</span>
                  <span className="text-[10px] text-slate-400">Prep Alert</span>
                </div>
                <p className="text-white font-medium">
                  "Upcoming visit in 30 mins: Patricia Campbell at 22 Mona Road. Prepare PPE kit."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    [Open Maps]
                  </span>
                </div>
              </div>

              {/* 4. Weekly Payout */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">WEEKLY PAYOUT DEPOSITED</span>
                  <button
                    onClick={() => handleTestSound('success')}
                    className="text-[10px] text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>SOUND: success.mp3</span>
                  </button>
                </div>
                <p className="text-white font-medium">
                  "💰 Payout Sent! $42,500 JMD has been transferred to your bank account."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    [View Breakdown]
                  </span>
                </div>
              </div>

              {/* 5. Document Expiry */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400">DOCUMENT EXPIRY WARNING</span>
                  <span className="text-[10px] text-slate-400">Compliance</span>
                </div>
                <p className="text-white font-medium">
                  "⚠️ NCJ License expires in 30 days. Upload renewal to avoid interruption."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    [Upload Renewal]
                  </span>
                </div>
              </div>

              {/* 6. Police Record Reminder */}
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-purple-300">POLICE RECORD 60-DAY COUNTDOWN</span>
                  <span className="text-[10px] text-slate-400">Section 10</span>
                </div>
                <p className="text-white font-medium">
                  "Reminder: 46 days left to upload police record. Profile pauses on May 5, 2026."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px]">
                    [Upload Record]
                  </span>
                </div>
              </div>
            </>
          )}

          {activeRole === 'admin' && (
            <>
              {/* 1. New Nurse Application */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-purple-300">NEW PROVIDER ONBOARDING</span>
                  <span className="text-[10px] text-slate-400">Admin Dispatch</span>
                </div>
                <p className="text-white font-medium">
                  "New Application: Nurse Keisha Thomas (RN - UWISON). NCJ &amp; Gov ID ready for review."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px]">
                    [Review Now]
                  </span>
                </div>
              </div>

              {/* 2. SOS Triggered */}
              <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-red-400">LEVEL 2 SOS EMERGENCY</span>
                  <button
                    onClick={() => handleTestSound('alert')}
                    className="text-[10px] text-red-300 bg-red-500/20 hover:bg-red-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>SOUND: alert.mp3</span>
                  </button>
                </div>
                <p className="text-white font-medium">
                  "🚨 LEVEL 2 SOS: Patricia Campbell at 22 Mona Road. Coordinates: 18.0179, -76.7483. 119 contacted."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                    [View Map]
                  </span>
                </div>
              </div>

              {/* 3. Disputed Visit */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400">VISIT DISPUTED</span>
                  <span className="text-[10px] text-slate-400">Customer Support</span>
                </div>
                <p className="text-white font-medium">
                  "Visit Disputed: BK-9841. Client reported Nurse late by 45 mins. Clinical review required."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    [Review Dispute]
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">Web Audio API + Vibrate API integrated</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
