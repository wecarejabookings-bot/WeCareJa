import React, { useState } from 'react';
import { Logo } from './Logo';
import { LogoVariation } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  X, 
  Radio, 
  QrCode, 
  Bell, 
  MessageSquare, 
  ShieldAlert, 
  Award,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SplashOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoVariation?: LogoVariation;
  onGetStarted?: () => void;
}

export const SplashOnboardingModal: React.FC<SplashOnboardingModalProps> = ({
  isOpen,
  onClose,
  logoVariation = 'heart-cross',
  onGetStarted
}) => {
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  const handleNext = () => {
    soundFX.playTabSwitch();
    if (currentScreen === 1) setCurrentScreen(2);
    else if (currentScreen === 2) setCurrentScreen(3);
    else {
      handleComplete();
    }
  };

  const handleBack = () => {
    soundFX.playTabSwitch();
    if (currentScreen === 3) setCurrentScreen(2);
    else if (currentScreen === 2) setCurrentScreen(1);
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('wecare_onboarding_completed', 'true');
    } catch {}
    soundFX.playSuccessSoftDing();
    onClose();
    if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#120224] border border-purple-500/30 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Logo variation={logoVariation} size="sm" />
            <span className="text-xs font-black tracking-wider uppercase text-purple-300">
              Launch Welcome Guide
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => {
                    soundFX.playTabSwitch();
                    setCurrentScreen(step as 1 | 2 | 3);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    currentScreen === step 
                      ? 'w-6 bg-gradient-to-r from-[#7209B7] to-[#C77DFF]' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to screen ${step}`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body based on Active Screen */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {currentScreen === 1 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Screen 1 Visual Illustration */}
              <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600/30 to-[#E63946]/20 border border-purple-400/40 flex items-center justify-center shadow-xl shadow-purple-950/50">
                <Clock className="w-12 h-12 text-[#C77DFF] animate-pulse" />
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase shadow">
                  90 Mins
                </span>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Corporate Area Launch</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  We Care Jamaica
                </h2>
                <p className="text-base sm:text-lg font-semibold text-purple-200 leading-relaxed">
                  Licensed Nurses to Your Doorstep in 90 Minutes.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    <MapPin className="w-3 h-3 text-[#E63946]" /> Kingston
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    <MapPin className="w-3 h-3 text-[#E63946]" /> St. Andrew
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    <MapPin className="w-3 h-3 text-[#E63946]" /> Portmore
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    <MapPin className="w-3 h-3 text-[#E63946]" /> Spanish Town
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Rapid dispatch within your home parish</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Caregivers &amp; RNs scheduled 7 days a week</span>
                </div>
              </div>
            </div>
          )}

          {currentScreen === 2 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Screen 2 Visual Illustration */}
              <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600/30 to-purple-600/20 border border-emerald-400/40 flex items-center justify-center shadow-xl shadow-emerald-950/50">
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase shadow">
                  Verified
                </span>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>NCJ &amp; HEART Verified</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Verified Nurses Only
                </h2>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  Every nurse is verified with <strong className="text-emerald-300">Nursing Council of Jamaica (NCJ)</strong> license, government ID &amp; school credentials.
                </p>
                <p className="text-xs sm:text-sm text-purple-200">
                  Caregivers verified by diploma / HEART Trust / NCTVET. Look for the <strong className="text-emerald-400">Verified Badge</strong> on every helper's profile.
                </p>
              </div>

              {/* Verified Badge Preview Pill Box */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> What to Look For:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
                    Active Badge
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>NCJ License Valid</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Gov ID Verified</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>School Diploma Logged</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>2 References Checked</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentScreen === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Screen 3 Visual Illustration */}
              <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-[#E63946]/30 to-purple-600/30 border border-red-400/40 flex items-center justify-center shadow-xl shadow-red-950/50">
                <ShieldAlert className="w-12 h-12 text-[#E63946]" />
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase shadow">
                  Protected
                </span>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
                  <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>Complete Peace of Mind</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Track, Chat &amp; Stay Safe
                </h2>
                <p className="text-sm sm:text-base text-purple-200 leading-relaxed">
                  Live ETA, doorbell chime, QR check-in at your door, in-app chat, and 24/7 SOS panic button.
                </p>
              </div>

              {/* Safety Features Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-1.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                    <Radio className="w-4 h-4 text-[#C77DFF]" />
                  </div>
                  <strong className="text-xs font-bold text-white">Live ETA Tracking</strong>
                  <span className="text-[10px] text-slate-400">30 min active window</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-1.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Bell className="w-4 h-4 text-amber-400" />
                  </div>
                  <strong className="text-xs font-bold text-white">Doorbell Chime</strong>
                  <span className="text-[10px] text-slate-400">Warm arrival alert</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-1.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                  </div>
                  <strong className="text-xs font-bold text-white">QR Door Check-in</strong>
                  <span className="text-[10px] text-slate-400">Starts visit securely</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-1.5">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-300">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </div>
                  <strong className="text-xs font-bold text-white">SOS Panic Button</strong>
                  <span className="text-[10px] text-slate-400">Level 1 &amp; 119 Speed Dial</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          {currentScreen > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition"
            >
              Skip
            </button>
          )}

          {currentScreen === 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-purple-600 hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-purple-950/60 transition flex items-center gap-2 ml-auto"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : currentScreen === 2 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/60 transition flex items-center gap-2"
            >
              <span>Next: Safety &amp; Tracking</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] via-purple-600 to-[#E63946] hover:opacity-95 text-white text-xs font-extrabold shadow-xl shadow-purple-950/60 transition flex items-center gap-2"
            >
              <span>Start Exploring Care</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
