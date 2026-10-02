import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Star,
  Award,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Heart,
  ShieldCheck,
  Calendar,
  Layers,
  BarChart3,
  Flame,
  ChevronRight,
  ArrowUpRight,
  Crown,
  Smile,
  BadgeCheck,
  Users
} from 'lucide-react';
import { NurseProfile, Booking, CelebrationPayload } from '../../types';
import {
  generateCaregiverMonthlyPerformance,
  getPractitionerNextMilestone,
  INITIAL_PRACTITIONER_MILESTONES,
  calculateNurseVisitsCount
} from '../../data/milestonesData';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface CaregiverPerformanceMetricsProps {
  currentNurse: NurseProfile;
  bookings: Booking[];
  onOpenCelebration?: (payload: CelebrationPayload) => void;
  onUpdateNurseProfile?: (updatedNurse: NurseProfile) => void;
  onNavigateToMilestones?: () => void;
}

export const CaregiverPerformanceMetrics: React.FC<CaregiverPerformanceMetricsProps> = ({
  currentNurse,
  bookings,
  onOpenCelebration,
  onUpdateNurseProfile,
  onNavigateToMilestones
}) => {
  // Chart view mode
  const [activeChartTab, setActiveChartTab] = useState<'overview' | 'growth' | 'ratings' | 'services'>('overview');
  // Timeframe selector
  const [timeRange, setTimeRange] = useState<'6m' | '3m' | 'all'>('6m');

  // Simulated visits state (synced with actual bookings and nurse record)
  const actualVisits = calculateNurseVisitsCount(currentNurse.id, bookings);
  const baselineCount = Math.max(actualVisits, currentNurse.completedVisitsCount || 8);
  const [simulatedVisits, setSimulatedVisits] = useState<number>(baselineCount);

  // Generate monthly performance metrics for recharts
  const fullMonthlyData = useMemo(() => {
    return generateCaregiverMonthlyPerformance(currentNurse.id, bookings, simulatedVisits);
  }, [currentNurse.id, bookings, simulatedVisits]);

  // Filter based on timeRange
  const displayedMonthlyData = useMemo(() => {
    if (timeRange === '3m') {
      return (fullMonthlyData || []).slice(-3);
    }
    return fullMonthlyData || [];
  }, [fullMonthlyData, timeRange]);

  // Next milestone goal calculation
  const milestoneInfo = useMemo(() => {
    return getPractitionerNextMilestone(simulatedVisits);
  }, [simulatedVisits]);

  // Aggregated KPIs
  const kpis = useMemo(() => {
    const totalVisitsThisPeriod = displayedMonthlyData.reduce((sum, d) => sum + d.visits, 0);
    const avgRating = +(
      displayedMonthlyData.reduce((sum, d) => sum + d.avgRating, 0) / displayedMonthlyData.length
    ).toFixed(2);
    const totalHours = displayedMonthlyData.reduce((sum, d) => sum + d.totalHoursLogged, 0);
    const totalFiveStars = displayedMonthlyData.reduce((sum, d) => sum + d.fiveStarReviews, 0);
    const latestMoMGrowth = displayedMonthlyData[displayedMonthlyData.length - 1]?.growthPct || 23.5;

    // Service sums
    const totalWound = displayedMonthlyData.reduce((sum, d) => sum + d.woundCare, 0);
    const totalElderly = displayedMonthlyData.reduce((sum, d) => sum + d.elderlyCompanionship, 0);
    const totalVitals = displayedMonthlyData.reduce((sum, d) => sum + d.vitalsCheck, 0);
    const totalRehab = displayedMonthlyData.reduce((sum, d) => sum + d.rehabTherapy, 0);
    const totalMed = displayedMonthlyData.reduce((sum, d) => sum + d.medicationIV, 0);

    return {
      totalVisitsThisPeriod,
      avgRating,
      totalHours,
      totalFiveStars,
      latestMoMGrowth,
      services: [
        { label: 'Wound Care & Sterile Dressing', count: totalWound, color: '#7209B7', pct: Math.round((totalWound / totalVisitsThisPeriod) * 100) || 35 },
        { label: 'Elderly Companionship & ADL', count: totalElderly, color: '#10B981', pct: Math.round((totalElderly / totalVisitsThisPeriod) * 100) || 25 },
        { label: 'Vitals & Blood Sugar Monitoring', count: totalVitals, color: '#F59E0B', pct: Math.round((totalVitals / totalVisitsThisPeriod) * 100) || 22 },
        { label: 'Post-Op Rehab & Mobility', count: totalRehab, color: '#E63946', pct: Math.round((totalRehab / totalVisitsThisPeriod) * 100) || 12 },
        { label: 'Medication & IV Infusion', count: totalMed, color: '#06B6D4', pct: Math.round((totalMed / totalVisitsThisPeriod) * 100) || 6 }
      ]
    };
  }, [displayedMonthlyData]);

  // Handle simulating or completing a visit to trigger milestone unlock
  const handleSimulateVisitCompletion = () => {
    soundFX.playVisitCompleted();
    const newCount = simulatedVisits + 1;
    setSimulatedVisits(newCount);

    // Update nurse record in parent if callback exists
    if (onUpdateNurseProfile) {
      onUpdateNurseProfile({
        ...currentNurse,
        completedVisitsCount: newCount
      });
    }

    // Check if a milestone was achieved
    const achievedMilestone = INITIAL_PRACTITIONER_MILESTONES.find(
      m => m.category === 'practitioner_visits' && m.targetCount === newCount
    );

    if (achievedMilestone && onOpenCelebration) {
      soundFX.playVisitCompleted('royal_fanfare');
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#FFD166', '#10B981', '#7209B7', '#E63946', '#4CC9F0']
      });

      setTimeout(() => {
        onOpenCelebration({
          milestoneId: achievedMilestone.id,
          title: 'Caregiver Milestone Badge Achieved! 🏆',
          subtitle: `${achievedMilestone.targetCount} Completed Home Visits Milestone`,
          milestoneTitle: `${achievedMilestone.title} Milestone Badge`,
          category: 'practitioner_visits',
          tier: achievedMilestone.tier,
          count: achievedMilestone.targetCount,
          targetRole: 'nurse',
          recipientName: currentNurse.name,
          rewardText: achievedMilestone.rewardLabel,
          motivationalQuote: achievedMilestone.motivationalQuote,
          certificateData: {
            recipientName: currentNurse.name,
            achievementTitle: `${achievedMilestone.title} (${achievedMilestone.targetCount} Patient Care Visits Delivered)`,
            dateAwarded: new Date().toLocaleDateString('en-JM'),
            issuer: 'We Care Jamaica Nursing Directorate & Clinical Board',
            verificationCode: `WC-NURSE-${achievedMilestone.targetCount}`
          }
        });
      }, 400);
    } else {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
  };

  // Custom Tooltip for Recharts
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="p-3.5 rounded-2xl bg-[#130722]/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl text-xs space-y-1.5 min-w-[190px]">
        <div className="font-extrabold text-white border-b border-white/10 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-purple-300 font-normal">Monthly Performance</span>
        </div>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-bold text-white font-mono">
              {typeof item.value === 'number' && item.name.includes('Rating')
                ? `${item.value.toFixed(2)} ★`
                : typeof item.value === 'number' && item.name.includes('Growth')
                ? `+${item.value}%`
                : `${item.value}`}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-purple-950/70 via-[#160728] to-slate-950 border border-purple-500/30 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/20 via-pink-600/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-[#C77DFF] border border-purple-500/40 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span>Caregiver Performance Analytics</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Recharts Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {currentNurse.careLevel === 'registered_nurse' ? 'Registered General Nurse (RN)' : 'Certified Caregiver'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Caregiver Performance Metrics &amp; Quality Trends
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track your monthly patient visit growth, verified 5-star satisfaction ratings, and clinical service distribution over time. Complete visits to unlock milestone achievement badges!
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2 self-start lg:self-center bg-black/40 p-1 rounded-2xl border border-white/10 text-xs shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFX.playTabSwitch();
                setTimeRange('3m');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                timeRange === '3m'
                  ? 'bg-[#7209B7] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 3 Months
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playTabSwitch();
                setTimeRange('6m');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                timeRange === '6m'
                  ? 'bg-[#7209B7] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 6 Months
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playTabSwitch();
                setTimeRange('all');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                timeRange === 'all'
                  ? 'bg-[#7209B7] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* MILESTONE ACHIEVEMENT PROMINENT TARGET BANNER */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-950/70 via-purple-950/80 to-slate-900 border-2 border-amber-500/40 shadow-2xl text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-900/50 shrink-0">
              <Trophy className="w-8 h-8 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Upcoming Milestone Badge
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  {simulatedVisits} of {milestoneInfo.targetCount} Completed Visits
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                <span>{milestoneInfo.nextMilestone?.title || 'Care Angel 🌟'}</span>
                <span className="text-xs font-normal text-amber-300">
                  ({milestoneInfo.targetCount} Visits Milestone)
                </span>
              </h3>
              <p className="text-xs text-amber-100/80 mt-0.5">
                {milestoneInfo.isMaxLevel ? (
                  <span>You have achieved the highest tier of patient visit honors!</span>
                ) : (
                  <span>
                    Complete <strong className="text-white font-bold">{milestoneInfo.remainingVisits} more visit{milestoneInfo.remainingVisits !== 1 ? 's' : ''}</strong> to unlock the {milestoneInfo.nextMilestone?.rewardLabel || 'Gold Caregiver Badge + JMD $2,500 Performance Perk'}!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar & Test Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="min-w-[200px] space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-amber-200">Milestone Progress</span>
                <span className="font-bold text-white">{milestoneInfo.progressPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-black/50 border border-amber-500/30 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-400 transition-all duration-500 shadow-sm"
                  style={{ width: `${milestoneInfo.progressPct}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateVisitCompletion}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs transition shadow-lg shadow-amber-950/50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Simulate completing 1 visit to progress towards the milestone badge"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Simulate 1 Visit</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Visits & Growth */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg text-white">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Visits in Period</span>
            <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {kpis.totalVisitsThisPeriod}
          </div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
            <span>+{kpis.latestMoMGrowth}%</span>
            <span className="text-slate-400 font-normal">Month-over-Month</span>
          </div>
        </div>

        {/* Patient Satisfaction Rating */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg text-white">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Patient Satisfaction</span>
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-baseline gap-1">
            <span>{kpis.avgRating}</span>
            <span className="text-xs text-amber-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-1">
            <span className="font-bold text-amber-300">{kpis.totalFiveStars}</span>
            <span>Five-Star Reviews</span>
          </div>
        </div>

        {/* Clinical Hours Delivered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg text-white">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Clinical Care Hours</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {Math.round(kpis.totalHours)}h
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-1">
            <span className="text-emerald-400 font-bold">100%</span>
            <span>Sterile Protocol Adherence</span>
          </div>
        </div>

        {/* Active Milestone Status */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg text-white">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Milestone Badge Tier</span>
            <div className="p-1.5 rounded-xl bg-pink-500/20 text-pink-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-white mt-1 truncate">
            {milestoneInfo.nextMilestone?.title || 'Care Angel 🌟'}
          </div>
          <div className="text-[11px] text-purple-300 flex items-center gap-1 mt-1">
            <span>{milestoneInfo.remainingVisits} visits to unlock</span>
          </div>
        </div>
      </div>

      {/* Chart View Mode Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10">
        <button
          type="button"
          onClick={() => {
            soundFX.playTabSwitch();
            setActiveChartTab('overview');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeChartTab === 'overview'
              ? 'bg-[#7209B7] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30'
              : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span>Overview (Visits &amp; Ratings)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playTabSwitch();
            setActiveChartTab('growth');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeChartTab === 'growth'
              ? 'bg-[#7209B7] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30'
              : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Monthly Visit Growth</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playTabSwitch();
            setActiveChartTab('ratings');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeChartTab === 'ratings'
              ? 'bg-[#7209B7] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30'
              : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400" />
          <span>Patient Satisfaction Ratings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playTabSwitch();
            setActiveChartTab('services');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeChartTab === 'services'
              ? 'bg-[#7209B7] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30'
              : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
          }`}
        >
          <Layers className="w-4 h-4 text-pink-400" />
          <span>Completed Service Types</span>
        </button>
      </div>

      {/* CHART SECTION: TAB 1 - ALL-IN-ONE OVERVIEW (COMPOSED CHART) */}
      {activeChartTab === 'overview' && (
        <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>Monthly Visits vs. Patient Satisfaction Rating</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Dual Axis Recharts
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Bars represent completed home visits; the line indicates monthly patient review rating.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-purple-600 inline-block" /> Completed Visits
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Avg Rating (★)
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-0.5 bg-amber-400 inline-block" /> Target Benchmark
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayedMonthlyData} margin={{ top: 15, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#c084fc"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[4.5, 5.0]}
                  stroke="#34d399"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${v} ★`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  yAxisId="left"
                  dataKey="visits"
                  name="Completed Visits"
                  fill="#7209B7"
                  radius={[8, 8, 0, 0]}
                  barSize={36}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="targetVisits"
                  name="Target Benchmark"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgRating"
                  name="Avg Rating"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CHART SECTION: TAB 2 - MONTHLY VISIT GROWTH (AREA + BAR) */}
      {activeChartTab === 'growth' && (
        <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>Month-over-Month Visit Volume Growth</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Trending +{kpis.latestMoMGrowth}%
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Volume trajectory shows steady expansion in patient care requests across Jamaican communities.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Completed Visits
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayedMonthlyData} margin={{ top: 15, right: 15, left: -10, bottom: 20 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="Completed Visits"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#growthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CHART SECTION: TAB 3 - PATIENT SATISFACTION RATINGS (LINE) */}
      {activeChartTab === 'ratings' && (
        <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>Verified Patient Satisfaction &amp; Review Trends</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {kpis.avgRating} / 5.0 Star Average
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Aggregated from verified patient feedback submitted after home care sessions.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Monthly CSAT (Stars)
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayedMonthlyData} margin={{ top: 15, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  domain={[4.7, 5.0]}
                  stroke="#fbbf24"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(2)} ★`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  name="Average Rating"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ fill: '#fbbf24', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Testimonial highlight card */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200">
            <Smile className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Recent Jamaican Family Compliment:</p>
              <p className="italic text-amber-200/90 mt-0.5">
                “Our visiting nurse arrived right on time in Kingston 6, sanitized thoroughly, and treated my grandmother's wound with the utmost gentleness and respect. 5 stars all the way!”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHART SECTION: TAB 4 - COMPLETED SERVICE TYPES OVER TIME (STACKED BAR) */}
      {activeChartTab === 'services' && (
        <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>Completed Service Types Breakdown Over Time</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Stacked Recharts
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Visualizes the distribution of specialized clinical procedures delivered each month.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-[#7209B7]" /> Wound Care
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-[#10B981]" /> Elderly Care
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]" /> Vitals
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-[#E63946]" /> Rehab
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-[#06B6D4]" /> Medication
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayedMonthlyData} margin={{ top: 15, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="woundCare" name="Wound Care" stackId="a" fill="#7209B7" />
                <Bar dataKey="elderlyCompanionship" name="Elderly Companionship" stackId="a" fill="#10B981" />
                <Bar dataKey="vitalsCheck" name="Vitals Check" stackId="a" fill="#F59E0B" />
                <Bar dataKey="rehabTherapy" name="Rehab & Mobility" stackId="a" fill="#E63946" />
                <Bar dataKey="medicationIV" name="Medication & IV" stackId="a" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Service percentage pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {kpis.services.map((svc, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">{svc.label.split(' ')[0]}</span>
                  <span className="font-bold text-white">{svc.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${svc.pct}%`, backgroundColor: svc.color }} />
                </div>
                <span className="text-[10px] text-slate-300 font-mono block">
                  {svc.count} visit{svc.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MILESTONE BADGES RECOGNITION SHOWCASE */}
      <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Caregiver Milestone Badges &amp; Progression</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Achieve visits to unlock verified badges visible to clients and medical directors across Jamaica.
            </p>
          </div>
          {onNavigateToMilestones && (
            <button
              type="button"
              onClick={onNavigateToMilestones}
              className="text-xs text-purple-300 hover:text-white font-bold flex items-center gap-1 transition"
            >
              <span>View All Practitioner Milestones</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INITIAL_PRACTITIONER_MILESTONES.filter(m => m.category === 'practitioner_visits').map((milestone) => {
            const isUnlocked = simulatedVisits >= milestone.targetCount;
            const isNext = !isUnlocked && milestone.id === milestoneInfo.nextMilestone?.id;

            return (
              <div
                key={milestone.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/40 shadow-lg'
                    : isNext
                    ? 'bg-gradient-to-br from-amber-950/60 to-purple-950/50 border-amber-500/50 shadow-lg ring-1 ring-amber-500/30'
                    : 'bg-black/30 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2.5 rounded-xl ${
                    isUnlocked
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isNext
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/5 text-slate-400'
                  }`}>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isNext ? (
                      <Trophy className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Award className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isUnlocked
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isNext
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/5 text-slate-400'
                  }`}>
                    {isUnlocked ? 'Unlocked' : isNext ? 'Next Goal' : 'Locked'}
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm mt-3">{milestone.title}</h4>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                  {milestone.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-mono">
                    Target: {milestone.targetCount} visits
                  </span>
                  <span className={isUnlocked ? 'text-emerald-400 font-bold' : isNext ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                    {isUnlocked ? '✓ Badge Awarded' : `${Math.max(0, milestone.targetCount - simulatedVisits)} to go`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Client & Caregiver Unified Motivation Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-emerald-950/50 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">
                Synchronized Caregiver &amp; Patient Milestones
              </span>
              <span className="text-[11px] text-slate-300">
                Every visit you complete progresses BOTH you toward your Care Angel badge AND your patient toward their “Master of Recovery” achievement badge.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSimulateVisitCompletion}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Complete Visit &amp; Progress Milestone</span>
          </button>
        </div>
      </div>
    </div>
  );
};
