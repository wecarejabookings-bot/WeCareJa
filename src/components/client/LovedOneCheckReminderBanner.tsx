import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Send, 
  Users, 
  Shuffle, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  PhoneCall, 
  AlertCircle, 
  X,
  Stethoscope,
  Smile,
  Bell
} from 'lucide-react';
import { NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';

export interface LovedOneCheckReminder {
  id: string;
  target: 'Mom' | 'Dad' | 'Grandmother' | 'Grandfather' | 'Aunt / Uncle' | 'Elderly Relative' | 'Loved One';
  headline: string;
  body: string;
  actionText: string;
  tag: string;
  recommendedService: string;
}

export const LOVED_ONE_REMINDERS: LovedOneCheckReminder[] = [
  {
    id: 'reminder-mom-1',
    target: 'Mom',
    headline: "Haven't heard from Mom today?",
    body: "Ensure she is safe, comfortable, and taking her prescribed medication on time. Dispatch a verified WeCare home nurse right now for a bedside wellness check and receive real-time vitals and photo updates directly in the app.",
    actionText: "Send Nurse to Check on Mom",
    tag: "Bedside Wellness & Vitals Check",
    recommendedService: "Elderly & Companion Care"
  },
  {
    id: 'reminder-dad-1',
    target: 'Dad',
    headline: "Has anyone checked in on Dad today?",
    body: "Give yourself complete peace of mind. Dispatch an on-call licensed nurse to his doorstep in Kingston, St. Andrew, or Portmore to verify his blood pressure, mobility, and midday nutrition.",
    actionText: "Send Nurse to Check on Dad",
    tag: "Blood Pressure & Nutrition Check",
    recommendedService: "Vitals Monitoring & Telemetry"
  },
  {
    id: 'reminder-grandma-1',
    target: 'Grandmother',
    headline: "Wondering how Grandma is feeling this afternoon?",
    body: "A gentle in-person companion visit makes all the difference. Our certified nursing team will verify her glucose readings, assist with daily activities, and send you an instant clinical summary.",
    actionText: "Send Nurse to Check on Grandma",
    tag: "Companion & Medication Support",
    recommendedService: "Elderly & Companion Care"
  },
  {
    id: 'reminder-relative-1',
    target: 'Elderly Relative',
    headline: "Live abroad or busy at work? Don't let distance create worry.",
    body: "Request an immediate welfare check for your elderly loved ones across Jamaica. An attending licensed nurse will arrive, evaluate their health and living environment, and log an encrypted report in your portal.",
    actionText: "Dispatch Immediate Welfare Check",
    tag: "Family Peace of Mind",
    recommendedService: "Elderly & Companion Care"
  },
  {
    id: 'reminder-general-1',
    target: 'Loved One',
    headline: "Need a quick update on your loved one's condition?",
    body: "Skip the anxious waiting. Book a 45-minute home wellness check with a registered practitioner. Get instant confirmation and live doorstep verification.",
    actionText: "Request Instant Nurse Check-In",
    tag: "Rapid Care Response",
    recommendedService: "General Nursing & Assessment"
  }
];

interface LovedOneCheckReminderBannerProps {
  onDispatchCheck: (target: string, recommendedService: string, notes: string) => void;
  onOpenNursingTeam: () => void;
  availableNursesCount?: number;
  onTriggerNotification?: (title: string, message: string) => void;
  compact?: boolean;
}

export const LovedOneCheckReminderBanner: React.FC<LovedOneCheckReminderBannerProps> = ({
  onDispatchCheck,
  onOpenNursingTeam,
  availableNursesCount = 8,
  onTriggerNotification,
  compact = false
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedTarget, setSelectedTarget] = useState<string>('Mom');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);

  // Set initial random reminder on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * LOVED_ONE_REMINDERS.length);
    setCurrentIndex(randomIndex);
    setSelectedTarget(LOVED_ONE_REMINDERS[randomIndex].target);
  }, []);

  // Periodic reminder notification check
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoCycling && !isDismissed) {
        setCurrentIndex((prev) => (prev + 1) % LOVED_ONE_REMINDERS.length);
      }
    }, 45000); // cycle banner every 45s if idle

    return () => clearInterval(interval);
  }, [isAutoCycling, isDismissed]);

  const currentReminder = LOVED_ONE_REMINDERS[currentIndex] || LOVED_ONE_REMINDERS[0];

  const handleShuffle = () => {
    soundFX.playClick();
    setIsAutoCycling(false);
    const nextIdx = (currentIndex + 1) % LOVED_ONE_REMINDERS.length;
    setCurrentIndex(nextIdx);
    setSelectedTarget(LOVED_ONE_REMINDERS[nextIdx].target);
  };

  const handleTargetChange = (target: string) => {
    soundFX.playClick();
    setIsAutoCycling(false);
    setSelectedTarget(target);
    const matchingIdx = LOVED_ONE_REMINDERS.findIndex(r => r.target === target);
    if (matchingIdx >= 0) {
      setCurrentIndex(matchingIdx);
    }
  };

  const handleSendNurseClick = () => {
    soundFX.playSuccessPing();
    const formattedNotes = `Proactive Loved One Check for ${selectedTarget}. Please assess vital signs, verify prescribed medication compliance, ensure meal & hydration status, and submit a comprehensive in-app status update.`;
    onDispatchCheck(selectedTarget, currentReminder.recommendedService, formattedNotes);
  };

  if (isDismissed) {
    return (
      <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1A1E4E] to-[#12163b] border border-blue-500/20 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#F59E0B]" />
          <span>Need a nurse to check on Mom, Dad, or an elderly relative today?</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDismissed(false)}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition"
          >
            Show Reminder
          </button>
          <button
            onClick={onOpenNursingTeam}
            className="px-3 py-1 rounded-lg bg-[#F59E0B] text-slate-950 font-bold text-[11px] hover:bg-[#FFA500] transition flex items-center gap-1"
          >
            <Users className="w-3 h-3" />
            <span>Meet Team</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1E4E] via-[#161a45] to-[#0d102e] border-2 border-blue-400/40 p-5 sm:p-6 shadow-2xl backdrop-blur-xl animate-fadeIn">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Blue EKG Line Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-80" />

      <div className="relative z-10 space-y-4">
        {/* Header Row: Target Pills + Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Heart className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              Loved One Check Reminder
            </span>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {availableNursesCount} Verified Nurses Ready
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShuffle}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              title="Shuffle caring reminder"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="hidden sm:inline">Different Reminder</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Minimize banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Target Quick Selectors (Mom, Dad, Grandma, Grandpa, Relative) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" /> Checking on:
          </span>
          {(['Mom', 'Dad', 'Grandmother', 'Grandfather', 'Elderly Relative'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTargetChange(t)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedTarget === t
                  ? 'bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-900/40 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <span>{t}</span>
            </button>
          ))}
        </div>

        {/* Main Reminder Message & Call to Action */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-1">
          <div className="lg:col-span-8 space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug flex items-center gap-2">
              <span>{currentReminder.headline}</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
              {currentReminder.body}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-blue-200">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                NCJ / HEART-NTA Vetted Caregivers
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Live In-App Vitals &amp; Doorstep Verification
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Kingston, St. Andrew &amp; Portmore
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
            {/* Primary CTA: Dispatch Nurse Now */}
            <button
              type="button"
              onClick={handleSendNurseClick}
              className="w-full px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FFA500] to-[#F59E0B] hover:brightness-105 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/50 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 group cursor-pointer border border-amber-300/50"
            >
              <Send className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
              <span>{currentReminder.actionText}</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform ml-auto sm:ml-0" />
            </button>

            {/* Secondary CTA: Meet Nursing Team Directory (Client Safe) */}
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onOpenNursingTeam();
              }}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-[#3B82F6]/50"
            >
              <Users className="w-4 h-4 text-[#3B82F6]" />
              <span>Meet Our Nursing Team</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#3B82F6]/30 text-blue-200 text-[10px] font-mono">
                {availableNursesCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
