import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  Flame, 
  Activity, 
  Pill, 
  CalendarCheck, 
  Clock, 
  ChevronRight, 
  Gift, 
  ShieldCheck, 
  Volume2, 
  TrendingUp, 
  Heart, 
  Plus, 
  Check, 
  Zap, 
  Crown,
  RotateCcw,
  Footprints
} from 'lucide-react';
import { 
  MilestoneItem, 
  CelebrationPayload, 
  Booking, 
  UserAccount 
} from '../../types';
import { 
  INITIAL_PATIENT_MILESTONES, 
  calculatePatientTherapySessionsCount, 
  MOTIVATIONAL_REINFORCEMENTS 
} from '../../data/milestonesData';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface PatientMilestoneTrackerProps {
  bookings: Booking[];
  currentUser?: UserAccount | null;
  onOpenCelebration: (payload: CelebrationPayload) => void;
  onNavigateToServices?: () => void;
  compact?: boolean;
}

export const PatientMilestoneTracker: React.FC<PatientMilestoneTrackerProps> = ({
  bookings,
  currentUser,
  onOpenCelebration,
  onNavigateToServices,
  compact = false
}) => {
  // Load patient milestones from localStorage or defaults
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => {
    try {
      const saved = localStorage.getItem('wecare_patient_milestones');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PATIENT_MILESTONES;
  });

  // Medication streak state
  const [medStreak, setMedStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wecare_patient_med_streak');
      if (saved) return Number(saved);
    } catch {}
    return 6; // default 6 days so 1 more check-in triggers 7-day milestone!
  });

  // Checked in today flag
  const [checkedInToday, setCheckedInToday] = useState<boolean>(() => {
    try {
      const lastCheckIn = localStorage.getItem('wecare_patient_med_last_checkin');
      const today = new Date().toISOString().split('T')[0];
      return lastCheckIn === today;
    } catch {}
    return false;
  });

  // Calculate therapy sessions from bookings
  const therapySessionsCount = calculatePatientTherapySessionsCount(bookings);

  // Sync therapy count into milestones
  useEffect(() => {
    setMilestones(prev => {
      let changed = false;
      const updated = prev.map(m => {
        if (m.category === 'therapy_sessions') {
          const effectiveCount = Math.max(m.currentCount, therapySessionsCount);
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
        localStorage.setItem('wecare_patient_milestones', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, [therapySessionsCount]);

  // Persist milestones
  const saveMilestones = (items: MilestoneItem[]) => {
    setMilestones(items);
    localStorage.setItem('wecare_patient_milestones', JSON.stringify(items));
  };

  // Log medication check-in
  const handleMedicationCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('wecare_patient_med_last_checkin', today);
    setCheckedInToday(true);

    const newStreak = medStreak + 1;
    setMedStreak(newStreak);
    localStorage.setItem('wecare_patient_med_streak', String(newStreak));

    soundFX.playSuccessPing();

    // Check if any medication milestone is reached
    const updated = milestones.map(m => {
      if (m.category === 'medication_adherence') {
        const count = newStreak;
        const reached = count >= m.targetCount;
        const newlyUnlocked = reached && !m.isCompleted;

        if (newlyUnlocked) {
          // Trigger celebration!
          setTimeout(() => {
            onOpenCelebration({
              milestoneId: m.id,
              title: 'Medication Adherence Milestone Unlocked!',
              subtitle: `${m.targetCount}-Day Consistent Check-In Streak`,
              milestoneTitle: m.title,
              category: 'medication_adherence',
              tier: m.tier,
              count: m.targetCount,
              targetRole: 'patient',
              recipientName: currentUser?.name || 'Valued Patient',
              rewardText: m.rewardLabel,
              motivationalQuote: m.motivationalQuote,
              certificateData: {
                recipientName: currentUser?.name || 'Valued Patient',
                achievementTitle: `${m.title} (${m.targetCount}-Day Adherence Streak)`,
                dateAwarded: new Date().toLocaleDateString('en-JM'),
                issuer: 'We Care Jamaica Health Network',
                verificationCode: `WC-MED-${m.targetCount}`
              }
            });
          }, 300);
        }

        return {
          ...m,
          currentCount: count,
          isCompleted: reached,
          completedAt: reached && !m.isCompleted ? new Date().toISOString() : m.completedAt
        };
      }
      return m;
    });

    saveMilestones(updated);

    // Mini confetti burst for daily check-in
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  // Complete / Simulate a therapy session
  const handleSimulateTherapySession = () => {
    soundFX.playSuccessPing();

    const currentSessions = milestones.find(m => m.category === 'therapy_sessions')?.currentCount || 0;
    const nextSessions = currentSessions + 1;

    const updated = milestones.map(m => {
      if (m.category === 'therapy_sessions') {
        const count = nextSessions;
        const reached = count >= m.targetCount;
        const newlyUnlocked = reached && !m.isCompleted;

        if (newlyUnlocked) {
          setTimeout(() => {
            onOpenCelebration({
              milestoneId: m.id,
              title: 'Therapy & Rehabilitation Milestone Reached!',
              subtitle: `${m.targetCount} Completed Physical Therapy Sessions`,
              milestoneTitle: m.title,
              category: 'therapy_sessions',
              tier: m.tier,
              count: m.targetCount,
              targetRole: 'patient',
              recipientName: currentUser?.name || 'Valued Patient',
              rewardText: m.rewardLabel,
              motivationalQuote: m.motivationalQuote,
              certificateData: {
                recipientName: currentUser?.name || 'Valued Patient',
                achievementTitle: `${m.title} (${m.targetCount} Therapy Sessions Completed)`,
                dateAwarded: new Date().toLocaleDateString('en-JM'),
                issuer: 'We Care Jamaica Health Network',
                verificationCode: `WC-THERAPY-${m.targetCount}`
              }
            });
          }, 300);
        }

        return {
          ...m,
          currentCount: count,
          isCompleted: reached,
          completedAt: reached && !m.isCompleted ? new Date().toISOString() : m.completedAt
        };
      }
      return m;
    });

    saveMilestones(updated);
  };

  // Filter track milestones
  const therapyMilestones = milestones.filter(m => m.category === 'therapy_sessions');
  const medicationMilestones = milestones.filter(m => m.category === 'medication_adherence');

  const nextTherapy = therapyMilestones.find(m => !m.isCompleted) || therapyMilestones[therapyMilestones.length - 1];
  const nextMed = medicationMilestones.find(m => !m.isCompleted) || medicationMilestones[medicationMilestones.length - 1];

  const therapyPercent = Math.min(100, Math.round(((nextTherapy.currentCount) / nextTherapy.targetCount) * 100));
  const medPercent = Math.min(100, Math.round(((medStreak) / nextMed.targetCount) * 100));

  // Past 7 days check-in simulation
  const pastDays = [
    { day: 'Mon', checked: true },
    { day: 'Tue', checked: true },
    { day: 'Wed', checked: true },
    { day: 'Thu', checked: true },
    { day: 'Fri', checked: true },
    { day: 'Sat', checked: true },
    { day: 'Today', checked: checkedInToday }
  ];

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-400/30 text-white space-y-6 shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-400/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Patient Milestone Tracker
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Positive Reinforcement</span>
              </span>
            </div>
            <p className="text-xs text-purple-200">
              Celebrate your therapy sessions, rehabilitation milestones, and consistent medication check-ins.
            </p>
          </div>
        </div>

        {/* Quick Test Celebration Action */}
        <button
          type="button"
          onClick={() => {
            onOpenCelebration({
              milestoneId: 'demo-milestone',
              title: '🎉 Celebratory Milestone Demo',
              subtitle: '7-Day Consistent Medication Check-Ins',
              milestoneTitle: 'Weekly Health Hero',
              category: 'medication_adherence',
              tier: 'silver',
              count: 7,
              targetRole: 'patient',
              recipientName: currentUser?.name || 'Valued Patient',
              rewardText: 'Silver Adherence Shield + $5 Care Voucher',
              motivationalQuote: '“One one cocoa full basket. Small daily health efforts compound into miraculous strength.”',
              certificateData: {
                recipientName: currentUser?.name || 'Valued Patient',
                achievementTitle: 'Weekly Health Hero (7-Day Adherence Streak)',
                dateAwarded: new Date().toLocaleDateString('en-JM'),
                issuer: 'We Care Jamaica Health Network',
                verificationCode: 'WC-MED-7'
              }
            });
          }}
          className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/30 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Test Celebration Animation</span>
        </button>
      </div>

      {/* Two Tracking Tracks: Medication Check-Ins & Therapy Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Track 1: Consistent Medication Check-Ins */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-purple-400/20 space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                <Pill className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Track 1: Daily Adherence
                </span>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>Medication Check-In Streak</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 text-[10px] font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                    <span>{medStreak} Days Active</span>
                  </span>
                </h4>
              </div>
            </div>

            {/* Check-In Button */}
            <button
              type="button"
              onClick={handleMedicationCheckIn}
              disabled={checkedInToday}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1 cursor-pointer ${
                checkedInToday
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 cursor-default'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white'
              }`}
            >
              {checkedInToday ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Checked In Today</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Check-in</span>
                </>
              )}
            </button>
          </div>

          {/* 7-Day Visual Tracker Strip */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-purple-200">
              <span className="font-semibold">7-Day Consistency View</span>
              <span className="font-bold text-amber-300">
                Next: {nextMed.title} ({medStreak}/{nextMed.targetCount} days)
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {pastDays.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                    item.checked
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-xs'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-bold">{item.day}</span>
                  {item.checked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600 my-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-300 font-bold">
              <span>Goal: {nextMed.title}</span>
              <span className="text-emerald-300">{medPercent}% Complete</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${medPercent}%` }}
              />
            </div>
          </div>

          {/* Unlocked Reward Preview */}
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 flex items-center justify-between text-xs">
            <span className="text-purple-200 text-[11px]">
              🎁 <strong>Reward at {nextMed.targetCount} Days:</strong> {nextMed.rewardLabel}
            </span>
          </div>
        </div>

        {/* Track 2: Therapy & Rehabilitation Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-purple-400/20 space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 shrink-0">
                <Activity className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                  Track 2: Recovery & Mobility
                </span>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>Therapy Sessions Completed</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold">
                    {nextTherapy.currentCount} Sessions
                  </span>
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateTherapySession}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#E63946] hover:opacity-90 text-white text-xs font-black shadow-md transition flex items-center gap-1 cursor-pointer"
              title="Simulate or log a completed therapy session"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Complete Session</span>
            </button>
          </div>

          {/* Stepper Milestones */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-purple-200">
              <span className="font-semibold">Rehabilitation Milestones</span>
              <span className="font-bold text-amber-300">
                Target: {nextTherapy.targetCount} Sessions
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center">
              {(therapyMilestones || []).slice(0, 4).map((m, idx) => (
                <div
                  key={m.id || `therapy-m-${idx}`}
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
              <span>Goal: {nextTherapy.title}</span>
              <span className="text-purple-300">{therapyPercent}% Complete</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-[#E63946] rounded-full transition-all duration-500"
                style={{ width: `${therapyPercent}%` }}
              />
            </div>
          </div>

          {/* Unlocked Reward Preview */}
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 flex items-center justify-between text-xs">
            <span className="text-purple-200 text-[11px]">
              🏆 <strong>Reward at {nextTherapy.targetCount} Sessions:</strong> {nextTherapy.rewardLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Positive Reinforcement Wisdom Strip */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-slate-900 border border-amber-400/20 flex items-center gap-3">
        <span className="text-xl">🇯🇲</span>
        <p className="text-xs italic text-amber-200/90 font-medium leading-relaxed">
          {MOTIVATIONAL_REINFORCEMENTS.patient[Math.floor(Math.random() * MOTIVATIONAL_REINFORCEMENTS.patient.length)]}
        </p>
      </div>
    </div>
  );
};
