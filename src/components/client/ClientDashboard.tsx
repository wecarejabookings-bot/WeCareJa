import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  User, 
  Phone, 
  MessageSquare, 
  QrCode, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  Flame, 
  Activity, 
  Pill, 
  CheckCircle2, 
  Heart, 
  Award, 
  ChevronRight, 
  AlertCircle, 
  Navigation, 
  Footprints,
  CalendarCheck,
  Stethoscope,
  Smile,
  BadgeCheck
} from 'lucide-react';
import { 
  Booking, 
  ServiceItem, 
  NurseProfile, 
  UserAccount, 
  MilestoneItem, 
  CelebrationPayload 
} from '../../types';
import { INITIAL_PATIENT_MILESTONES, calculatePatientTherapySessionsCount } from '../../data/milestonesData';
import { getArrivalPassCode } from '../../utils/arrivalVerification';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

export interface ClientDashboardProps {
  currentUser?: UserAccount | null;
  bookings: Booking[];
  services: ServiceItem[];
  nurses: NurseProfile[];
  onRequestNewVisit: () => void;
  onSelectService?: (service: ServiceItem) => void;
  onViewBookingDetails?: (booking: Booking) => void;
  onOpenChat?: (booking: Booking) => void;
  onOpenArrivalQR?: (booking: Booking) => void;
  onOpenCelebration?: (payload: CelebrationPayload) => void;
  onNavigateToMilestones?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToCoverageMap?: () => void;
  onNavigateToMedSchedule?: () => void;
  onUpdateBookingStatus?: (bookingId: string, status: Booking['status'], clinicalNotes?: any, additionalData?: any) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  currentUser,
  bookings,
  services,
  nurses,
  onRequestNewVisit,
  onSelectService,
  onViewBookingDetails,
  onOpenChat,
  onOpenArrivalQR,
  onOpenCelebration,
  onNavigateToMilestones,
  onNavigateToHistory,
  onNavigateToCoverageMap,
  onNavigateToMedSchedule,
  onUpdateBookingStatus
}) => {
  // Load and sync medical milestones
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => {
    try {
      const saved = localStorage.getItem('wecare_patient_milestones');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seen = new Set<string>();
          return parsed.filter((item: any, idx: number) => {
            const id = item?.id || `milestone-init-${idx}`;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });
        }
      }
    } catch {}
    return INITIAL_PATIENT_MILESTONES;
  });

  // Daily medication adherence streak
  const [medStreak, setMedStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wecare_patient_med_streak');
      if (saved) return Number(saved);
    } catch {}
    return 6; // Default to 6 so next check-in triggers 7-day milestone
  });

  const [checkedInToday, setCheckedInToday] = useState<boolean>(() => {
    try {
      const lastCheckIn = localStorage.getItem('wecare_patient_med_last_checkin');
      const today = new Date().toISOString().split('T')[0];
      return lastCheckIn === today;
    } catch {}
    return false;
  });

  // Calculate therapy sessions from bookings
  const therapySessionsCount = useMemo(() => {
    return calculatePatientTherapySessionsCount(bookings);
  }, [bookings]);

  // Sync therapy counts with milestones
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

  // Handle client daily medication check-in
  const handleDailyMedCheckIn = () => {
    if (checkedInToday) return;

    soundFX.playSuccessPing();
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10B981', '#1E1B4B', '#FFD166', '#4CC9F0']
    });

    const newStreak = medStreak + 1;
    const today = new Date().toISOString().split('T')[0];

    setMedStreak(newStreak);
    setCheckedInToday(true);

    try {
      localStorage.setItem('wecare_patient_med_streak', String(newStreak));
      localStorage.setItem('wecare_patient_med_last_checkin', today);

      // Check if this unlocked milestone
      const updatedMilestones = milestones.map(m => {
        if (m.category === 'medication_adherence') {
          const isNowCompleted = newStreak >= m.targetCount;
          if (isNowCompleted && !m.isCompleted) {
            return {
              ...m,
              currentCount: newStreak,
              isCompleted: true,
              completedAt: new Date().toISOString()
            };
          }
          return {
            ...m,
            currentCount: Math.min(newStreak, m.targetCount)
          };
        }
        return m;
      });

      setMilestones(updatedMilestones);
      localStorage.setItem('wecare_patient_milestones', JSON.stringify(updatedMilestones));

      // Trigger celebration if streak hits 7
      if (newStreak === 7 && onOpenCelebration) {
        const achieved = updatedMilestones.find(m => m.id === 'p-med-7');
        if (achieved) {
          onOpenCelebration({
            milestoneId: achieved.id,
            title: 'Weekly Medication Hero!',
            subtitle: '7-Day Flawless Adherence Streak Achieved',
            milestoneTitle: achieved.title,
            category: achieved.category,
            tier: achieved.tier,
            count: 7,
            targetRole: 'patient',
            recipientName: currentUser?.name || 'Patient',
            rewardText: achieved.rewardLabel,
            motivationalQuote: achieved.motivationalQuote
          });
        }
      }
    } catch (e) {
      console.error('Failed to save med streak checkin', e);
    }
  };

  // Filter client's upcoming visits (deduplicated by booking ID)
  const upcomingVisits = useMemo(() => {
    const list = bookings
      .filter(b => ['requested', 'accepted', 'en_route', 'in_progress'].includes(b.status))
      .sort((a, b) => {
        const timeA = new Date(a.scheduledDateTime || a.date || a.createdAt).getTime();
        const timeB = new Date(b.scheduledDateTime || b.date || b.createdAt).getTime();
        return timeA - timeB;
      });
    const seen = new Set<string>();
    return list.filter((b, idx) => {
      const id = b?.id || `booking-temp-${idx}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [bookings]);

  const completedVisits = useMemo(() => {
    return bookings.filter(b => b.status === 'completed');
  }, [bookings]);

  // The very next visit spotlight
  const nextVisit = upcomingVisits[0] || null;

  // Filter active (in-progress or top unlocked) milestones, strictly deduplicated
  const activeMilestones = useMemo(() => {
    const inProgress = milestones.filter(m => !m.isCompleted);
    const completed = milestones.filter(m => m.isCompleted);
    const combined = [...inProgress.slice(0, 3), ...completed.slice(0, 1)];
    const seen = new Set<string>();
    return combined.filter((m, idx) => {
      const id = m?.id || `milestone-temp-${idx}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [milestones]);

  // Quick book services deduplicated
  const quickServices = useMemo(() => {
    const seen = new Set<string>();
    return services.filter((s, idx) => {
      const id = s?.id || `srv-temp-${idx}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, 4);
  }, [services]);

  const completedMilestonesCount = useMemo(() => {
    return milestones.filter(m => m.isCompleted).length;
  }, [milestones]);

  // Greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Format date readable
  const formatVisitSchedule = (dateTimeStr?: string, dateStr?: string) => {
    if (!dateTimeStr && !dateStr) return 'Scheduled Soon';
    const targetDate = new Date(dateTimeStr || dateStr || '');
    if (isNaN(targetDate.getTime())) return dateTimeStr || dateStr || 'Scheduled';

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = targetDate.toDateString() === today.toDateString();
    const isTomorrow = targetDate.toDateString() === tomorrow.toDateString();

    const timeString = targetDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (isToday) return `Today at ${timeString}`;
    if (isTomorrow) return `Tomorrow at ${timeString}`;

    const dateFormatted = targetDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    return `${dateFormatted} at ${timeString}`;
  };

  // Status badge config
  const getStatusBadge = (status: Booking['status'], nurseAccepted?: boolean) => {
    switch (status) {
      case 'in_progress':
        return {
          label: 'Session Active',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
          dot: 'bg-emerald-400 animate-ping'
        };
      case 'en_route':
        return {
          label: 'Caregiver En Route',
          color: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          dot: 'bg-amber-400 animate-pulse'
        };
      case 'accepted':
        return {
          label: 'Confirmed & Locked',
          color: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
          dot: 'bg-purple-400'
        };
      case 'requested':
      default:
        return {
          label: nurseAccepted ? 'Confirmed' : 'Dispatched / Awaiting',
          color: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
          dot: 'bg-blue-400 animate-pulse'
        };
    }
  };

  // Category Icon helper for milestones
  const renderMilestoneIcon = (category: string) => {
    switch (category) {
      case 'therapy_sessions':
        return <Footprints className="w-4 h-4 text-emerald-300" />;
      case 'medication_adherence':
        return <Pill className="w-4 h-4 text-purple-300" />;
      case 'vitals_stability':
        return <Activity className="w-4 h-4 text-teal-300" />;
      case 'nutrition_hydration':
        return <Heart className="w-4 h-4 text-pink-300" />;
      default:
        return <Award className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div id="client-dashboard-container" className="space-y-6 animate-fadeIn">
      {/* Top Welcome & Quick-Action Hub */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c082e] via-[#120520] to-[#250838] border border-purple-500/30 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1E1B4B]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#F59E0B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Licensed In-Home Care • Jamaica
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#F59E0B]" />
                {currentUser?.zone || 'Kingston & St. Andrew'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-white">{currentUser?.name?.split(' ')[0] || 'Patient'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              Welcome to your personal care portal. View your upcoming home nurse visits, track your medical recovery milestones, and schedule licensed care across Kingston, St. Andrew, and Portmore.
            </p>
          </div>

          {/* Primary Quick-Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              id="dashboard-request-nurse-btn"
              type="button"
              onClick={() => {
                soundFX.playClick();
                onRequestNewVisit();
              }}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#9D4EDD] to-[#F59E0B] text-white font-black text-sm shadow-xl shadow-purple-950/70 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] border border-purple-300/40 transition-all flex items-center justify-center gap-2.5 group"
            >
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-amber-300 group-hover:rotate-90 transition-transform">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="tracking-wide">Request Home Nurse Visit</span>
              <ArrowRight className="w-4 h-4 ml-1 text-purple-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* 4 Summary Stats Chips */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-purple-200/70 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Upcoming Visits
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-white">{upcomingVisits.length}</span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {upcomingVisits.length > 0 ? 'Active' : 'All Clear'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-purple-200/70 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Milestones
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-white">{completedMilestonesCount}</span>
              <span className="text-[10px] text-amber-300 font-medium">Unlocked</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-purple-200/70 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Daily Med Streak
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-white">{medStreak} <span className="text-xs font-bold text-orange-300">Days</span></span>
              {checkedInToday && (
                <span className="text-[10px] text-emerald-300 font-bold">Done Today ✓</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-purple-200/70 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-teal-400" /> Completed Care
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-white">{completedVisits.length}</span>
              <span className="text-[10px] text-slate-300">Sessions</span>
            </div>
          </div>
        </div>

        {/* Quick Service Request Shortcut Pills */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-purple-300/80 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Quick Book:
          </span>
          {quickServices.map((service, idx) => (
            <button
              key={`quick-service-${service.id || idx}-${idx}`}
              onClick={() => {
                soundFX.playClick();
                if (onSelectService) {
                  onSelectService(service);
                } else {
                  onRequestNewVisit();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 text-purple-200 hover:text-white border border-purple-500/30 hover:border-purple-400 transition flex items-center gap-1.5"
            >
              <span>{service.icon || '🩺'}</span>
              <span className="font-semibold">{service.name}</span>
              <span className="text-[10px] text-purple-300/60 font-mono">${(service.priceJMD || 0).toLocaleString()} JMD</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Upcoming Visits (Left 7 Cols) + Active Medical Milestones (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upcoming Visit Schedule */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] flex items-center justify-center text-white shadow-md">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Upcoming Visit Schedule
                  {upcomingVisits.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#F59E0B] text-white text-[10px] font-black">
                      {upcomingVisits.length}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">Scheduled practitioner arrivals &amp; active visit records</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRequestNewVisit}
              className="text-xs font-bold text-purple-300 hover:text-white transition flex items-center gap-1 hover:underline"
            >
              <span>+ Add Visit</span>
            </button>
          </div>

          {/* Spotlight Highlight for Next Scheduled or Active Visit */}
          {nextVisit && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b0c42] to-[#160624] border-2 border-purple-400/40 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-pulse" /> Next Upcoming Visit
                </span>
                
                {(() => {
                  const badge = getStatusBadge(nextVisit.status, nextVisit.nurseAccepted);
                  return (
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${badge.color}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Caregiver & Service Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={nextVisit.nursePhoto || 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=200'}
                      alt={nextVisit.nurseName || 'Caregiver'}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-[#160624]" title="Nursing Council Registered">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      {nextVisit.serviceName}
                    </h3>
                    <p className="text-xs text-purple-200/90 font-medium">
                      Assigned Caregiver: <strong className="text-white">{nextVisit.nurseName || 'Assigned Nurse'}</strong>
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#F59E0B]" />
                        {formatVisitSchedule(nextVisit.scheduledDateTime, nextVisit.date)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {nextVisit.zone || 'Kingston'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Doorstep Arrival PIN Pill */}
                <div className="sm:text-right shrink-0 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-purple-200/70 uppercase font-bold block">Doorstep Passcode</span>
                  <span className="font-mono text-lg font-black text-amber-300 tracking-wider">
                    {getArrivalPassCode(nextVisit)}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Share with nurse upon arrival</span>
                </div>
              </div>

              {/* Action buttons on Next Visit */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  {onOpenArrivalQR && (
                    <button
                      type="button"
                      onClick={() => onOpenArrivalQR(nextVisit)}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white border border-purple-400/30 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-300" />
                      <span>Doorstep QR Pass</span>
                    </button>
                  )}

                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={() => onOpenChat(nextVisit)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
                      <span>Chat</span>
                    </button>
                  )}

                  {nextVisit.nursePhone && (
                    <a
                      href={`tel:${nextVisit.nursePhone}`}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Call</span>
                    </a>
                  )}
                </div>

                {onViewBookingDetails && (
                  <button
                    type="button"
                    onClick={() => onViewBookingDetails(nextVisit)}
                    className="text-xs font-bold text-purple-300 hover:text-white transition flex items-center gap-1"
                  >
                    <span>Full Visit Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List of Other Upcoming Appointments */}
          {upcomingVisits.length > 1 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300/80">
                Subsequent Scheduled Visits
              </h4>
              <div className="space-y-2.5">
                {upcomingVisits.slice(1).map((booking, idx) => {
                  const badge = getStatusBadge(booking.status, booking.nurseAccepted);
                  return (
                    <div
                      key={`upcoming-booking-${booking.id || idx}-${idx}`}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.nursePhoto || 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=150'}
                          alt={booking.nurseName || 'Nurse'}
                          className="w-10 h-10 rounded-xl object-cover border border-purple-400/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{booking.serviceName}</h4>
                          <p className="text-xs text-slate-300">
                            with <strong className="text-white">{booking.nurseName || 'Assigned Nurse'}</strong> • {formatVisitSchedule(booking.scheduledDateTime, booking.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${badge.color}`}>
                          {badge.label}
                        </span>

                        {onOpenArrivalQR && (
                          <button
                            type="button"
                            onClick={() => onOpenArrivalQR(booking)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition"
                            title="View Doorstep QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        )}

                        {onViewBookingDetails && (
                          <button
                            type="button"
                            onClick={() => onViewBookingDetails(booking)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition"
                            title="View Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State when no upcoming visits */}
          {upcomingVisits.length === 0 && (
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center mx-auto shadow-inner">
                <Calendar className="w-7 h-7 text-purple-300" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">No Upcoming Home Care Visits</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You have no pending or scheduled appointments right now. Keep your recovery and health routine consistent by scheduling a licensed nurse or geriatric caregiver visit.
                </p>
              </div>
              <button
                type="button"
                onClick={onRequestNewVisit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white text-xs font-bold shadow-lg shadow-purple-950/50 hover:opacity-95 transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Book Your Next Home Visit</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Active Medical Milestones & Daily Adherence */}
        <div className="lg:col-span-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  Active Medical Milestones
                </h2>
                <p className="text-xs text-slate-400">Recovery progression &amp; positive reinforcement</p>
              </div>
            </div>

            {onNavigateToMilestones && (
              <button
                type="button"
                onClick={onNavigateToMilestones}
                className="text-xs font-bold text-amber-300 hover:text-white transition flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Daily Medication Adherence Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-400/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-orange-400" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">Daily Medication Adherence</h4>
                  <span className="text-[10px] text-purple-200/80">Log your on-time daily prescription</span>
                </div>
              </div>

              <span className="font-mono text-sm font-extrabold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/30">
                {medStreak} Day Streak 🔥
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-300">
                {checkedInToday ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Today's check-in recorded!
                  </span>
                ) : (
                  <span>Take prescribed medication on schedule to keep your streak alive.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToMedSchedule && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTabSwitch();
                      onNavigateToMedSchedule();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-indigo-200 hover:text-white text-xs font-bold transition flex items-center gap-1 border border-white/10 cursor-pointer"
                  >
                    <Pill className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Visual Schedule</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDailyMedCheckIn}
                  disabled={checkedInToday}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    checkedInToday
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md active:scale-95'
                  }`}
                >
                  {checkedInToday ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Logged Today</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-white" />
                      <span>Log Meds Taken</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Active Milestones Progress List */}
          <div className="space-y-3">
            {activeMilestones.map((milestone, idx) => {
              const progressPercent = Math.min(100, Math.round((milestone.currentCount / milestone.targetCount) * 100));

              return (
                <div
                  key={`active-milestone-${milestone.id || idx}-${idx}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    milestone.isCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        milestone.isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {milestone.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          renderMilestoneIcon(milestone.category)
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white">{milestone.title}</h4>
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                            milestone.tier === 'gold' ? 'bg-amber-500/20 text-amber-300' :
                            milestone.tier === 'silver' ? 'bg-slate-300/20 text-slate-200' :
                            milestone.tier === 'platinum' ? 'bg-cyan-500/20 text-cyan-200' :
                            'bg-orange-500/20 text-orange-200'
                          }`}>
                            {milestone.tier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          {milestone.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-black text-white">
                        {milestone.currentCount}/{milestone.targetCount}
                      </span>
                      <span className="text-[10px] text-purple-300 block font-medium">
                        {progressPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2.5 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        milestone.isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-[#1E1B4B] via-[#C77DFF] to-[#F59E0B]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Reward footer */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-amber-300/90 font-semibold flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" />
                      Reward: {milestone.rewardLabel}
                    </span>

                    {milestone.isCompleted && onOpenCelebration && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenCelebration({
                            milestoneId: milestone.id,
                            title: 'Milestone Completed!',
                            subtitle: milestone.title,
                            milestoneTitle: milestone.title,
                            category: milestone.category,
                            tier: milestone.tier,
                            count: milestone.currentCount,
                            targetRole: 'patient',
                            recipientName: currentUser?.name || 'Patient',
                            rewardText: milestone.rewardLabel,
                            motivationalQuote: milestone.motivationalQuote
                          });
                        }}
                        className="text-emerald-300 hover:text-white font-bold transition flex items-center gap-1 hover:underline"
                      >
                        <span>Celebrate 🎉</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reassurance Banner */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs text-purple-200/90">
              <span className="font-bold text-white block">Nursing Council Jamaica Standard</span>
              <span>All visits strictly conform to NCJ ethical care, patient privacy, and sterile standards.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
