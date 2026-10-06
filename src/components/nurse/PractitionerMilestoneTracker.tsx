import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  Heart, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Printer,
  ChevronRight
} from 'lucide-react';
import { 
  MilestoneItem, 
  CelebrationPayload, 
  NurseProfile, 
  Booking 
} from '../../types';
import { 
  INITIAL_PRACTITIONER_MILESTONES, 
  calculateNurseVisitsCount, 
  MOTIVATIONAL_REINFORCEMENTS 
} from '../../data/milestonesData';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface PractitionerMilestoneTrackerProps {
  currentNurse: NurseProfile;
  bookings: Booking[];
  onOpenCelebration: (payload: CelebrationPayload) => void;
  compact?: boolean;
}

export const PractitionerMilestoneTracker: React.FC<PractitionerMilestoneTrackerProps> = ({
  currentNurse,
  bookings,
  onOpenCelebration,
  compact = false
}) => {
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => {
    try {
      const saved = localStorage.getItem(`wecare_nurse_milestones_${currentNurse.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PRACTITIONER_MILESTONES;
  });

  // Calculate actual completed visits from bookings
  const actualVisitsCount = calculateNurseVisitsCount(currentNurse.id, bookings);

  // Sync count
  useEffect(() => {
    setMilestones(prev => {
      let changed = false;
      const updated = prev.map(m => {
        if (m.category === 'practitioner_visits') {
          const effectiveCount = Math.max(m.currentCount, actualVisitsCount, currentNurse.completedVisitsCount || 0);
          const completed = effectiveCount >= m.targetCount;
          if (m.currentCount !== effectiveCount || m.isCompleted !== completed) {
            changed = true;
            return {
              ...m,
              currentCount: effectiveCount,
              isCompleted: completed,
              completedAt: completed && !m.isCompleted ? new Date().toISOString() : m.completedAt
            };
          }
        }
        return m;
      });
      if (changed) {
        localStorage.setItem(`wecare_nurse_milestones_${currentNurse.id}`, JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, [actualVisitsCount, currentNurse.completedVisitsCount, currentNurse.id]);

  const saveMilestones = (items: MilestoneItem[]) => {
    setMilestones(items);
    localStorage.setItem(`wecare_nurse_milestones_${currentNurse.id}`, JSON.stringify(items));
  };

  // Simulate / Complete Visit for Practitioner Testing
  const handleSimulateVisitMilestone = () => {
    soundFX.playSuccessPing();

    const visitMilestone = milestones.find(m => m.category === 'practitioner_visits' && !m.isCompleted) || milestones[2];
    const newCount = (visitMilestone?.currentCount || 8) + 1;

    const updated = milestones.map(m => {
      if (m.category === 'practitioner_visits') {
        const reached = newCount >= m.targetCount;
        const newlyUnlocked = reached && !m.isCompleted;

        if (newlyUnlocked) {
          setTimeout(() => {
            onOpenCelebration({
              milestoneId: m.id,
              title: 'Practitioner Milestone Unlocked!',
              subtitle: `${m.targetCount} Completed Patient Care Visits`,
              milestoneTitle: m.title,
              category: 'practitioner_visits',
              tier: m.tier,
              count: m.targetCount,
              targetRole: 'nurse',
              recipientName: currentNurse.name,
              rewardText: m.rewardLabel,
              motivationalQuote: m.motivationalQuote,
              certificateData: {
                recipientName: currentNurse.name,
                achievementTitle: `${m.title} (${m.targetCount} Patient Sessions Delivered)`,
                dateAwarded: new Date().toLocaleDateString('en-JM'),
                issuer: 'We Care Jamaica Nursing Directorate',
                verificationCode: `WC-NURSE-${m.targetCount}`
              }
            });
          }, 300);
        }

        return {
          ...m,
          currentCount: newCount,
          isCompleted: reached,
          completedAt: reached && !m.isCompleted ? new Date().toISOString() : m.completedAt
        };
      }
      return m;
    });

    saveMilestones(updated);
  };

  const visitMilestones = milestones.filter(m => m.category === 'practitioner_visits');
  const clinicalMilestones = milestones.filter(m => m.category === 'clinical_excellence');

  const nextVisit = visitMilestones.find(m => !m.isCompleted) || visitMilestones[visitMilestones.length - 1];
  const visitPercent = Math.min(100, Math.round(((nextVisit.currentCount) / nextVisit.targetCount) * 100));

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#18112e] to-slate-900 border border-purple-400/30 text-white space-y-6 shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-400/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Practitioner Milestone & Recognition Tracker
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase flex items-center gap-1">
                <Crown className="w-2.5 h-2.5" />
                <span>Excellence Rewards</span>
              </span>
            </div>
            <p className="text-xs text-purple-200">
              Honoring your bedside compassion, verified clinical documentation, and client satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* Two Practitioner Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Track 1: Completed Care Visits */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-purple-400/20 space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                <Trophy className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Track 1: Patient Care Delivery
                </span>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>Home Health Visits Completed</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                    {nextVisit.currentCount} Visits
                  </span>
                </h4>
              </div>
            </div>
          </div>

          {/* Stepper Milestones */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-purple-200">
              <span className="font-semibold">Visit Milestone Ladder</span>
              <span className="font-bold text-amber-300">
                Target: {nextVisit.targetCount} Visits ({nextVisit.title})
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center">
              {(visitMilestones || []).slice(0, 4).map((m, idx) => (
                <div
                  key={m.id || `milestone-${idx}`}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                    m.isCompleted
                      ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 shadow-xs'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-extrabold truncate w-full">{m.title}</span>
                  <span className="text-[9px] font-mono font-bold">
                    {m.targetCount} {m.targetCount === 1 ? 'Visit' : 'Visits'}
                  </span>
                  {m.isCompleted ? (
                    <Award className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span className="text-[9px] text-slate-500">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-300 font-bold">
              <span>Next Goal: {nextVisit.title}</span>
              <span className="text-amber-300">{visitPercent}% Achieved</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${visitPercent}%` }}
              />
            </div>
          </div>

          {/* Reward Preview */}
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 flex items-center justify-between text-xs">
            <span className="text-purple-200 text-[11px]">
              🎁 <strong>Perk at {nextVisit.targetCount} Visits:</strong> {nextVisit.rewardLabel}
            </span>
          </div>
        </div>

        {/* Track 2: Clinical Excellence & Reliability */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-purple-400/20 space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  Track 2: Quality & Documentation
                </span>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>Clinical Excellence & Ratings</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                    ⭐ {currentNurse.rating || 4.9} Rating
                  </span>
                </h4>
              </div>
            </div>
          </div>

          {/* Excellence Badges */}
          <div className="space-y-2">
            {clinicalMilestones.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`p-1.5 rounded-lg ${item.isCompleted ? 'bg-amber-400/20 text-amber-300' : 'bg-white/10 text-slate-400'}`}>
                    <Star className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-[10px] text-slate-300">{item.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {item.isCompleted ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                      Unlocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-400 text-[10px] font-bold">
                      {item.currentCount}/{item.targetCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 flex items-center justify-between text-xs">
            <span className="text-purple-200 text-[11px]">
              🌟 <strong>Recognition:</strong> Top 5% Caregiver in Kingston & St. Andrew
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Quote for Jamaican Nurses */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-slate-900 border border-purple-400/20 flex items-center gap-3">
        <span className="text-xl">🩺</span>
        <p className="text-xs italic text-purple-200/90 font-medium leading-relaxed">
          {MOTIVATIONAL_REINFORCEMENTS.nurse[Math.floor(Math.random() * MOTIVATIONAL_REINFORCEMENTS.nurse.length)]}
        </p>
      </div>
    </div>
  );
};
