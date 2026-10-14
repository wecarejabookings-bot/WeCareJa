import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  Trophy, 
  Award, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  Share2, 
  Printer, 
  Download, 
  Gift, 
  ShieldCheck, 
  Volume2, 
  Flame, 
  CalendarCheck,
  Activity,
  Heart,
  Pill,
  ArrowRight,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CelebrationPayload, MilestoneTier } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface CelebrationMilestoneModalProps {
  payload: CelebrationPayload | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimReward?: (milestoneId: string) => void;
}

export const CelebrationMilestoneModal: React.FC<CelebrationMilestoneModalProps> = ({
  payload,
  isOpen,
  onClose,
  onClaimReward
}) => {
  const [showCertificate, setShowCertificate] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Trigger high-energy confetti & triumphant chime upon opening
  const fireCelebration = () => {
    soundFX.playVisitCompleted('royal_fanfare');

    // Multi-stage fireworks and confetti bursts
    const end = Date.now() + 1500;
    const colors = ['#FFD166', '#10B981', '#7209B7', '#E63946', '#4CC9F0'];

    // Center burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.55 },
      colors
    });

    // Side cannons interval
    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
        colors
      });
    }, 250);
  };

  useEffect(() => {
    if (isOpen && payload) {
      setIsClaimed(false);
      setShowCertificate(false);
      setCopiedLink(false);
      fireCelebration();
    }
  }, [isOpen, payload]);

  if (!isOpen || !payload) return null;

  const getTierColor = (tier: MilestoneTier) => {
    switch (tier) {
      case 'diamond':
        return {
          badgeBg: 'from-cyan-500/30 via-blue-500/20 to-purple-500/30 border-cyan-400',
          pillBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
          glow: 'shadow-cyan-500/30'
        };
      case 'platinum':
        return {
          badgeBg: 'from-purple-500/30 via-indigo-500/20 to-pink-500/30 border-purple-400',
          pillBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
          glow: 'shadow-purple-500/30'
        };
      case 'gold':
        return {
          badgeBg: 'from-amber-500/30 via-yellow-500/20 to-orange-500/30 border-amber-400',
          pillBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          glow: 'shadow-amber-500/30'
        };
      case 'silver':
        return {
          badgeBg: 'from-slate-400/30 via-slate-300/20 to-slate-500/30 border-slate-300',
          pillBg: 'bg-slate-500/20 text-slate-200 border-slate-400/40',
          glow: 'shadow-slate-400/30'
        };
      case 'bronze':
      default:
        return {
          badgeBg: 'from-orange-700/30 via-amber-700/20 to-amber-900/30 border-orange-400',
          pillBg: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
          glow: 'shadow-orange-500/30'
        };
    }
  };

  const tierStyles = getTierColor(payload.tier);

  const handleShare = () => {
    const text = `🎉 Milestone Reached on We Care Jamaica!\n${payload.recipientName} just unlocked the "${payload.milestoneTitle}" milestone (${payload.subtitle}).\nEvery step toward health matters! 🇯🇲🩺`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      soundFX.playSuccessPing();
    }
  };

  const handleClaim = () => {
    setIsClaimed(true);
    soundFX.playSuccessPing();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    if (onClaimReward) {
      onClaimReward(payload.milestoneId);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c1236] via-[#130b29] to-[#0d071d] border-2 border-purple-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-900/60 text-white space-y-6 my-auto">
        {/* Floating Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Icon & Radiant Glow */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="relative">
            {/* Animated radiant rings */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-purple-500 to-emerald-400 rounded-full blur-xl opacity-70 animate-pulse" />
            <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${tierStyles.badgeBg} border-2 flex items-center justify-center shadow-lg ${tierStyles.glow} transform hover:scale-105 transition duration-300`}>
              {payload.category === 'medication_adherence' ? (
                <Pill className="w-12 h-12 text-amber-300 animate-bounce" />
              ) : payload.category === 'therapy_sessions' ? (
                <Activity className="w-12 h-12 text-emerald-300 animate-bounce" />
              ) : payload.targetRole === 'nurse' ? (
                <Award className="w-12 h-12 text-amber-300 animate-bounce" />
              ) : (
                <Trophy className="w-12 h-12 text-yellow-300 animate-bounce" />
              )}
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md">
              {payload.tier} Tier
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
              <span className="text-xs font-black tracking-widest uppercase text-amber-300">
                {payload.title}
              </span>
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {payload.milestoneTitle}
            </h2>
            <p className="text-sm font-semibold text-purple-200">
              Honoring <span className="text-white underline decoration-amber-400 decoration-2">{payload.recipientName}</span> • {payload.subtitle}
            </p>
          </div>
        </div>

        {/* Positive Reinforcement & Clinical Wellness Benefit */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-purple-400/20 space-y-3 text-left">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {payload.targetRole === 'nurse' ? '🩺 Nursing Excellence Recognized' : '🌿 Positive Recovery & Health Impact'}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {payload.category === 'medication_adherence'
                  ? 'Consistent daily medication check-ins maintain therapeutic blood levels, preventing hospital readmissions and stabilizing vital organ functions.'
                  : payload.category === 'therapy_sessions'
                  ? 'Completing planned therapy and mobility sessions builds muscle strength, accelerates neurological recovery, and drastically decreases senior fall risks.'
                  : payload.category === 'practitioner_visits'
                  ? 'Delivering attentive in-home care preserves patient dignity and provides compassionate healthcare access across Kingston communities.'
                  : 'Documenting clinical vitals with precision ensures safe continuity of care between doctors and caregivers.'}
              </p>
            </div>
          </div>

          {/* Motivational Quote */}
          {payload.motivationalQuote && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs italic text-amber-200 font-medium text-center">
                "{payload.motivationalQuote}"
              </p>
            </div>
          )}
        </div>

        {/* Unlocked Reward / Care Credit Card */}
        {payload.rewardText && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-slate-900/40 border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shrink-0 shadow-md">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                  Unlocked Reward & Perk
                </span>
                <p className="text-sm font-extrabold text-white">
                  {payload.rewardText}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClaim}
              disabled={isClaimed}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isClaimed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 cursor-default'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950'
              }`}
            >
              {isClaimed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Claimed & Credited</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Claim Perk Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Official Printable Certificate View (Toggled) */}
        {showCertificate && (
          <div 
            ref={certificateRef}
            className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#fbfbfa] to-[#f4ede4] text-slate-900 border-4 border-amber-500 shadow-2xl relative overflow-hidden"
          >
            {/* Certificate Decorative Border */}
            <div className="border-2 border-dashed border-amber-700/40 p-6 rounded-xl relative space-y-4 text-center">
              <div className="flex items-center justify-between border-b border-amber-800/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-emerald-800">
                    We Care Jamaica 🇯🇲
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Official Healthcare Seal
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  {payload.targetRole === 'nurse' ? 'Professional Recognition of Excellence' : 'Certificate of Health & Recovery Milestone'}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-900">
                  {payload.milestoneTitle}
                </h3>
              </div>

              <p className="text-xs text-slate-700">
                This certifies that
              </p>

              <p className="text-lg sm:text-xl font-black text-emerald-900 font-serif border-b border-slate-400 inline-block px-6 pb-1">
                {payload.recipientName}
              </p>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                has successfully achieved <strong className="text-slate-900">{payload.subtitle}</strong> with admirable resilience, discipline, and commitment to positive wellness outcomes in Jamaica.
              </p>

              <div className="pt-4 flex items-end justify-between text-left text-[10px] text-slate-600 border-t border-amber-800/20">
                <div>
                  <p className="font-bold text-slate-800">Sydney Mattis</p>
                  <p>Director of Operations, We Care</p>
                  <p className="font-mono text-[9px] text-slate-400">Kingston, Jamaica</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full border-2 border-amber-600 flex items-center justify-center bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">
                    SEAL
                  </div>
                  <span className="font-mono text-[8px] text-slate-400">VERIFIED</span>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-700">
                    {new Date().toLocaleDateString('en-JM', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="font-mono text-[9px] text-slate-400">ID: WC-JAM-{payload.count}092</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fireCelebration}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
              title="Trigger confetti and fanfare again"
            >
              <Volume2 className="w-4 h-4" />
              <span>Replay Fanfare</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-purple-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Achievement</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCertificate(prev => !prev)}
              className="px-3.5 py-2 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 text-xs font-bold text-purple-100 border border-purple-400/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>{showCertificate ? 'Hide Certificate' : 'View Official Certificate'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-200 text-xs font-black shadow-md transition cursor-pointer"
            >
              Continue Care
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
