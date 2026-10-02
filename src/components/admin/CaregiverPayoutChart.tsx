import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Smartphone, 
  Download, 
  Filter, 
  Award, 
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  Search
} from 'lucide-react';
import { NurseProfile, Booking, PayoutRecord } from '../../types';
import { formatJMD } from '../../utils/currency';
import { soundFX } from '../../utils/soundEffects';

interface CaregiverPayoutChartProps {
  nurses: NurseProfile[];
  bookings: Booking[];
  payouts: PayoutRecord[];
  onTriggerBatchPayout?: () => void;
  onOpenExportModal?: () => void;
  compactMode?: boolean;
}

export const CaregiverPayoutChart: React.FC<CaregiverPayoutChartProps> = ({
  nurses,
  bookings,
  payouts,
  onTriggerBatchPayout,
  onOpenExportModal,
  compactMode = false
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'month' | 'recent_week'>('all');
  const [selectedPaymentRail, setSelectedPaymentRail] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChartTab, setActiveChartTab] = useState<'by_nurse' | 'weekly_trend' | 'rail_distribution'>('by_nurse');
  const [showBatchSuccess, setShowBatchSuccess] = useState(false);

  // Compute metrics per nurse (aggregating both completed payouts and pending escrow)
  const nurseEarningsData = useMemo(() => {
    return nurses.map((nurse) => {
      // Completed payouts from payout records
      const completedPayoutsForNurse = payouts.filter(
        p => (p.nurseId === nurse.id || p.nurseName.toLowerCase().includes(nurse.name.toLowerCase())) && p.status === 'completed'
      );
      const totalPaidOutJMD = completedPayoutsForNurse.reduce((sum, p) => sum + p.amountJMD, 0);
      const completedVisitsFromPayouts = completedPayoutsForNurse.reduce((sum, p) => sum + (p.visitCount || 1), 0);

      // Pending earnings from active/completed bookings not yet settled in Friday clearing
      const pendingBookingsForNurse = bookings.filter(
        b => (b.nurseId === nurse.id || b.nurseName === nurse.name) && 
             ['completed', 'in_progress'].includes(b.status) &&
             b.paymentStatus === 'held_in_escrow'
      );
      const pendingPayoutJMD = pendingBookingsForNurse.reduce((sum, b) => sum + (b.nurseEarningsJMD || Math.round(b.priceJMD * 0.85)), 0);

      // All bookings for visit count
      const allVisits = bookings.filter(
        b => (b.nurseId === nurse.id || b.nurseName === nurse.name) && b.status === 'completed'
      ).length;

      const totalEarningsJMD = totalPaidOutJMD + pendingPayoutJMD;
      const visitsCount = Math.max(allVisits, completedVisitsFromPayouts, 1);
      const avgPerVisitJMD = Math.round(totalEarningsJMD / visitsCount);

      // Short display name for chart axis (e.g. "Althea C.")
      const nameParts = (nurse?.name || 'Practitioner').replace('Nurse ', '').split(' ');
      const shortName = nameParts.length > 1 
        ? `${nameParts[0]} ${nameParts[1][0]}.` 
        : nameParts[0];

      return {
        id: nurse.id,
        nurseName: nurse.name,
        shortName,
        careLevel: nurse.careLevel || 'registered_nurse',
        tier: (nurse as any).caregiverTier || (nurse.rating >= 4.9 ? 'Gold Tier' : 'Silver Tier'),
        rating: nurse.rating || 5.0,
        paidOutJMD: totalPaidOutJMD,
        pendingPayoutJMD: pendingPayoutJMD,
        totalEarningsJMD: totalEarningsJMD,
        visitsCount,
        avgPerVisitJMD,
        photo: nurse.photoUrl || (nurse as any).photo || 'https://images.unsplash.com/photo-1594824813689-537ff1e9de49?auto=format&fit=crop&w=150&q=80',
        preferredMethod: completedPayoutsForNurse[0]?.payoutMethod || 'Lynk Mobile Money'
      };
    }).sort((a, b) => b.totalEarningsJMD - a.totalEarningsJMD);
  }, [nurses, payouts, bookings]);

  // Overall KPI sums
  const totalPaidOutSumJMD = useMemo(() => {
    return payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amountJMD, 0);
  }, [payouts]);

  const totalPendingFridayJMD = useMemo(() => {
    return bookings
      .filter(b => ['completed', 'in_progress'].includes(b.status) && b.paymentStatus === 'held_in_escrow')
      .reduce((sum, b) => sum + (b.nurseEarningsJMD || Math.round(b.priceJMD * 0.85)), 0);
  }, [bookings]);

  const totalCaregiverPoolJMD = totalPaidOutSumJMD + totalPendingFridayJMD;
  const completedCaregiverVisitsCount = useMemo(() => {
    return bookings.filter(b => b.status === 'completed').length;
  }, [bookings]);

  const avgPayoutPerCaregiverVisitJMD = completedCaregiverVisitsCount > 0 
    ? Math.round(totalPaidOutSumJMD / completedCaregiverVisitsCount) 
    : 6350;

  // Weekly historical trend data
  const weeklyTrendData = useMemo(() => {
    const weeks = [
      { week: 'Wk 31 (Aug 1)', payoutJMD: 85000, caregivers: 4, status: 'Settled' },
      { week: 'Wk 32 (Aug 8)', payoutJMD: 112000, caregivers: 5, status: 'Settled' },
      { week: 'Wk 33 (Aug 15)', payoutJMD: 138500, caregivers: 6, status: 'Settled' },
      { week: 'Wk 34 (Aug 22)', payoutJMD: 165000, caregivers: 7, status: 'Settled' },
      { week: 'Wk 35 (Current)', payoutJMD: totalPendingFridayJMD > 0 ? totalPendingFridayJMD : 84200, caregivers: 6, status: 'Pending Friday' }
    ];
    return weeks;
  }, [totalPendingFridayJMD]);

  // Payment rail breakdown (NCB vs Lynk vs Scotia vs JN)
  const paymentRailsData = useMemo(() => {
    let ncbTotal = 0;
    let lynkTotal = 0;
    let scotiaTotal = 0;
    let jnTotal = 0;

    payouts.forEach(p => {
      const method = (p.payoutMethod || '').toLowerCase();
      if (method.includes('lynk')) {
        lynkTotal += p.amountJMD;
      } else if (method.includes('scotia')) {
        scotiaTotal += p.amountJMD;
      } else if (method.includes('jn') || method.includes('jamaica national')) {
        jnTotal += p.amountJMD;
      } else {
        ncbTotal += p.amountJMD;
      }
    });

    // Fallback seed distribution if empty
    if (ncbTotal + lynkTotal + scotiaTotal + jnTotal === 0) {
      ncbTotal = 185000;
      lynkTotal = 145000;
      scotiaTotal = 62000;
      jnTotal = 28000;
    }

    return [
      { name: 'NCB Direct Deposit', value: ncbTotal, color: '#10B981', icon: Building2 },
      { name: 'Lynk Mobile Money', value: lynkTotal, color: '#1E1B4B', icon: Smartphone },
      { name: 'Scotiabank Jamaica', value: scotiaTotal, color: '#F59E0B', icon: CreditCard },
      { name: 'JN Bank Transfer', value: jnTotal, color: '#F59E0B', icon: Building2 }
    ];
  }, [payouts]);

  // Filtered list of caregivers for the breakdown
  const filteredCaregivers = useMemo(() => {
    return nurseEarningsData.filter(item => {
      if (selectedPaymentRail !== 'all') {
        const pMethod = item.preferredMethod.toLowerCase();
        if (selectedPaymentRail === 'lynk' && !pMethod.includes('lynk')) return false;
        if (selectedPaymentRail === 'ncb' && !pMethod.includes('ncb')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.nurseName.toLowerCase().includes(q);
        const matchesMethod = item.preferredMethod.toLowerCase().includes(q);
        if (!matchesName && !matchesMethod) return false;
      }
      return true;
    });
  }, [nurseEarningsData, selectedPaymentRail, searchQuery]);

  const handleProcessFridayBatch = () => {
    soundFX.playSuccessChime();
    if (onTriggerBatchPayout) {
      onTriggerBatchPayout();
    }
    setShowBatchSuccess(true);
    setTimeout(() => setShowBatchSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn" id="caregiver-payout-chart-root">
      {/* Top Banner & Title */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-[#19082a] to-emerald-950/50 border border-purple-500/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Caregiver Compensation Engine
            </span>
            <span className="text-xs text-purple-300 font-bold">
              85% Net Practitioner Share
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Caregiver Payout Analytics &amp; Settlement
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Direct real-time tracking of Jamaican Dollar (JMD) net payouts disbursed to verified registered nurses and caregivers via NCB Direct Deposit, Lynk Mobile Money, and Scotiabank.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onOpenExportModal && (
            <button
              type="button"
              onClick={onOpenExportModal}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/15 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-300" />
              <span>Export Payouts CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleProcessFridayBatch}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-black text-xs transition shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Process Friday Batch</span>
          </button>
        </div>
      </div>

      {showBatchSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Friday Payout Settlement clearing initiated! Batch notification sent to NCB Bank Clearing &amp; Lynk Mobile API.</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Disbursed */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-2 hover:border-purple-400/30 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">Total Disbursed (Paid)</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatJMD(totalPaidOutSumJMD)}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Fully settled to bank &amp; Lynk</span>
          </div>
        </div>

        {/* Pending Friday Clearing */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-2 hover:border-amber-400/30 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">Pending Friday Batch</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
            {formatJMD(totalPendingFridayJMD > 0 ? totalPendingFridayJMD : 48500)}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
            <Calendar className="w-3 h-3" />
            <span>Auto-clears Friday 3:00 PM EST</span>
          </div>
        </div>

        {/* Net Rate */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-2 hover:border-purple-400/30 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">Caregiver Net Share</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-[#C77DFF] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
            85.0%
          </div>
          <div className="flex items-center gap-1 text-[10px] text-purple-300 font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>Guaranteed practitioner split</span>
          </div>
        </div>

        {/* Average Visit Payout */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-2 hover:border-sky-400/30 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">Avg Payout Per Visit</span>
            <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-300 font-mono">
            {formatJMD(avgPayoutPerCaregiverVisitJMD)}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
            <Users className="w-3 h-3 text-sky-400" />
            <span>{nurseEarningsData.length} active registered nurses</span>
          </div>
        </div>
      </div>

      {/* Chart View Switcher */}
      <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Caregiver Compensation Visual Charts</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare practitioner earnings, weekly settlement volumes, and settlement channels.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex p-1 rounded-2xl bg-black/40 border border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                setActiveChartTab('by_nurse');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === 'by_nurse'
                  ? 'bg-[#1E1B4B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Payouts by Nurse</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                setActiveChartTab('weekly_trend');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === 'weekly_trend'
                  ? 'bg-[#1E1B4B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Friday Trends</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                setActiveChartTab('rail_distribution');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === 'rail_distribution'
                  ? 'bg-[#1E1B4B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Rails</span>
            </button>
          </div>
        </div>

        {/* CHART TAB 1: Payouts by Nurse (BarChart) */}
        {activeChartTab === 'by_nurse' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <span className="w-3 h-3 rounded bg-[#10B981]" /> Settled Payout (JMD)
                </span>
                <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <span className="w-3 h-3 rounded bg-[#F59E0B]" /> Pending Friday Escrow (JMD)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Sorted by highest grossing caregiver
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={nurseEarningsData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis 
                    dataKey="shortName" 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff20' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff20' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-2xl bg-[#160728]/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl text-xs space-y-1.5">
                          <div className="flex items-center gap-2 font-bold text-white border-b border-white/10 pb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>{data.nurseName}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Settled Paid Out:</span>
                            <strong className="text-emerald-400">{formatJMD(data.paidOutJMD)}</strong>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Pending Friday Batch:</span>
                            <strong className="text-amber-400">{formatJMD(data.pendingPayoutJMD)}</strong>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300 border-t border-white/10 pt-1 font-bold">
                            <span>Total Earnings (85%):</span>
                            <strong className="text-purple-300">{formatJMD(data.totalEarningsJMD)}</strong>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-0.5">
                            Method: {data.preferredMethod}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="paidOutJMD" name="Settled Payout" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="pendingPayoutJMD" name="Pending Escrow" fill="#F59E0B" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART TAB 2: Weekly Friday Trends (AreaChart) */}
        {activeChartTab === 'weekly_trend' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500" /> Weekly Settlement Volume (JMD)
              </span>
              <span className="text-[11px] text-slate-400">
                Friday afternoon ACH &amp; Lynk batch release
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyTrendData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
                >
                  <defs>
                    <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E1B4B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff20' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff20' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-2xl bg-[#160728]/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl text-xs space-y-1">
                          <strong className="text-white block border-b border-white/10 pb-1">{data.week}</strong>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Batch Volume:</span>
                            <strong className="text-emerald-400">{formatJMD(data.payoutJMD)}</strong>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Caregivers Paid:</span>
                            <strong className="text-purple-300">{data.caregivers} Nurses</strong>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold block">{data.status}</span>
                        </div>
                      );
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="payoutJMD" 
                    stroke="#C77DFF" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#payoutGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART TAB 3: Payment Rails Breakdown */}
        {activeChartTab === 'rail_distribution' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentRailsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentRailsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatJMD(Number(value)), 'Total Volume']}
                    contentStyle={{
                      backgroundColor: '#160728',
                      borderColor: '#1E1B4B',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Disbursement Channels (Jamaica)
              </h4>
              <div className="space-y-2">
                {paymentRailsData.map((rail) => {
                  const Icon = rail.icon;
                  return (
                    <div 
                      key={rail.name} 
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" 
                          style={{ backgroundColor: `${rail.color}25`, color: rail.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-white text-xs block">{rail.name}</strong>
                          <span className="text-[10px] text-slate-400">Direct instant transfer</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <strong className="text-white font-mono text-xs block">{formatJMD(rail.value)}</strong>
                        <span className="text-[10px] font-bold" style={{ color: rail.color }}>
                          {((rail.value / (totalPaidOutSumJMD || 1)) * 100).toFixed(0)}% share
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Caregiver Payout Directory Table */}
      {!compactMode && (
        <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-white text-sm">Practitioner Compensation Ledger</h4>
              <p className="text-xs text-slate-400">Verified breakdown per caregiver with direct payout routing.</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search nurse..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 outline-none focus:border-purple-400"
                />
              </div>

              <select
                value={selectedPaymentRail}
                onChange={(e) => setSelectedPaymentRail(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-purple-400"
              >
                <option value="all" className="bg-[#160728]">All Payment Rails</option>
                <option value="ncb" className="bg-[#160728]">NCB Direct</option>
                <option value="lynk" className="bg-[#160728]">Lynk Mobile</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Caregiver</th>
                  <th className="py-2.5 px-3">Tier &amp; Level</th>
                  <th className="py-2.5 px-3">Completed Visits</th>
                  <th className="py-2.5 px-3">Settled Paid (JMD)</th>
                  <th className="py-2.5 px-3">Pending Friday (JMD)</th>
                  <th className="py-2.5 px-3 text-right">Net Total (85%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredCaregivers.map((cg) => (
                  <tr key={cg.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={cg.photo}
                          alt={cg.nurseName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                        />
                        <div>
                          <strong className="text-white block font-bold">{cg.nurseName}</strong>
                          <span className="text-[10px] text-slate-400">{cg.preferredMethod}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-[#C77DFF] border border-purple-500/30 uppercase">
                        {cg.tier} • {cg.careLevel === 'registered_nurse' ? 'RN' : 'Caregiver'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {cg.visitsCount} visits
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {formatJMD(cg.paidOutJMD)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-300">
                      {cg.pendingPayoutJMD > 0 ? formatJMD(cg.pendingPayoutJMD) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-white text-sm">
                      {formatJMD(cg.totalEarningsJMD)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
