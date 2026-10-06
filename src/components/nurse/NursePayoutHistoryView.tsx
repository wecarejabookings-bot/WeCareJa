import React, { useState } from 'react';
import { PayoutRecord, NurseProfile, Booking } from '../../types';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  FileText, 
  Building, 
  CreditCard, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Receipt,
  X,
  Printer,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface NursePayoutHistoryViewProps {
  nurse: NurseProfile;
  payouts: PayoutRecord[];
  allBookings?: Booking[];
  onOpenInvoiceModal?: (booking: Booking) => void;
}

export const NursePayoutHistoryView: React.FC<NursePayoutHistoryViewProps> = ({
  nurse,
  payouts,
  allBookings = [],
  onOpenInvoiceModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'scheduled'>('all');
  const [selectedPayoutForVoucher, setSelectedPayoutForVoucher] = useState<PayoutRecord | null>(null);

  // Filter payouts for this nurse
  const nursePayouts = payouts.filter(p => p.nurseId === nurse.id || p.nurseName === nurse.name);

  // Apply search & status filter
  const filteredPayouts = nursePayouts.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.payoutReference && p.payoutReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.payoutMethod && p.payoutMethod.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.periodEnd && p.periodEnd.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  // Calculate totals
  const totalCompletedPayoutsJMD = nursePayouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amountJMD, 0);

  const totalGrossCompletedJMD = nursePayouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.grossAmountJMD || (p.amountJMD / 0.85)), 0);

  const scheduledPayoutJMD = nursePayouts
    .filter(p => p.status === 'scheduled')
    .reduce((sum, p) => sum + p.amountJMD, 0);

  const totalCompletedCount = nursePayouts.filter(p => p.status === 'completed').length;

  const formatJMD = (amt: number) => `JMD $${Math.round(amt).toLocaleString()}`;

  const formatDate = (isoOrDateStr?: string) => {
    if (!isoOrDateStr) return 'N/A';
    try {
      const d = new Date(isoOrDateStr);
      return d.toLocaleDateString('en-JM', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoOrDateStr;
    }
  };

  const exportCSV = () => {
    const headers = ['Payout ID', 'Reference', 'Paid Date', 'Period End', 'Status', 'Method', 'Net Payout (JMD)', 'Visits'];
    const rows = filteredPayouts.map(p => [
      p.id,
      p.payoutReference || p.id,
      formatDate(p.payoutDate || p.periodEnd),
      p.periodEnd,
      p.status,
      `"${p.payoutMethod}"`,
      p.amountJMD,
      p.visitCount || (p.bookingIds || []).length
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WeCare_Nurse_Payout_History_${(nurse?.name || 'Nurse').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Summary KPI Strip */}
      <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-[#C77DFF] border border-purple-500/30">
                <DollarSign className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-black text-white tracking-tight">
                Nurse Payout History &amp; Remittance Ledger
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Net clinical earnings automatically deposited every Friday to your designated Jamaican bank or Lynk wallet.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
              title="Download full statement in CSV format"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Statement</span>
            </button>
          </div>
        </div>

        {/* 4-Box Key Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Total Transferred */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-[#0b241b] to-emerald-950/30 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="text-[10px] uppercase tracking-wider">Total Net Paid Out</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-emerald-300 block">
              {formatJMD(totalCompletedPayoutsJMD)}
            </span>
            <span className="text-[11px] text-emerald-200/80 block">
              Across {totalCompletedCount} successful weekly batches
            </span>
          </div>

          {/* Next Friday Scheduled */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/50 via-[#200938] to-purple-950/30 border border-purple-500/30 space-y-1">
            <div className="flex items-center justify-between text-purple-300 font-bold">
              <span className="text-[10px] uppercase tracking-wider">Upcoming Friday Deposit</span>
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-[#C77DFF] block">
              {formatJMD(scheduledPayoutJMD || nurse.pendingPayoutJMD || 0)}
            </span>
            <span className="text-[11px] text-purple-200/80 block">
              Scheduled for batch release this Friday
            </span>
          </div>

          {/* Gross Clinical Revenue */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span className="text-[10px] uppercase tracking-wider">Gross Billed to Clients</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-black text-white block">
              {formatJMD(totalGrossCompletedJMD)}
            </span>
            <span className="text-[11px] text-slate-300 block">
              15% platform support fee retained
            </span>
          </div>

          {/* Verified Destination Account */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span className="text-[10px] uppercase tracking-wider">Payout Destination</span>
              <Building className="w-4 h-4 text-purple-300" />
            </div>
            <span className="text-sm font-bold text-white block truncate">
              {nurse.bankDetails?.bankName.split('(')[0].trim() || 'National Commercial Bank'}
            </span>
            <span className="text-[11px] text-emerald-400 block font-mono">
              {nurse.bankDetails?.accountNumber || '•••• •••• 4821'} • Direct
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Payout ID, ACH reference, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-400 focus:outline-hidden focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#7209B7] text-white shadow-sm'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Payouts ({nursePayouts.length})
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            Successful ({nursePayouts.filter(p => p.status === 'completed').length})
          </button>

          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'scheduled'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Clock className="w-3 h-3 text-purple-300" />
            Scheduled ({nursePayouts.filter(p => p.status === 'scheduled').length})
          </button>
        </div>
      </div>

      {/* Main Historical Payouts Table */}
      <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden text-white shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#C77DFF]" />
            <h4 className="text-sm font-bold text-white">Previous Successful &amp; Scheduled Payouts</h4>
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredPayouts.length} of {nursePayouts.length} transactions
          </span>
        </div>

        {filteredPayouts.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-white text-sm">No Payout Records Found</h5>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No previous payout transfers matched your search criteria. Completed Friday batch settlements will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Payout Date &amp; Batch</th>
                  <th className="py-3.5 px-4">Reference Code</th>
                  <th className="py-3.5 px-4">Visits</th>
                  <th className="py-3.5 px-4 text-emerald-400">Net Remittance</th>
                  <th className="py-3.5 px-4">Method &amp; Destination</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayouts.map((payout) => {
                  const visitCount = payout.visitCount || (payout.bookingIds || []).length;

                  return (
                    <tr 
                      key={payout.id}
                      className="hover:bg-white/[0.03] transition group"
                    >
                      {/* Date & Period */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-white">
                          {formatDate(payout.payoutDate || payout.periodEnd)}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          <span>Period: {payout.periodStart ? `${payout.periodStart} to ${payout.periodEnd}` : payout.periodEnd}</span>
                        </div>
                      </td>

                      {/* Reference Code */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-[11px] font-bold">
                          {payout.payoutReference || payout.id}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">ID: {payout.id}</div>
                      </td>

                      {/* Visits Count */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-semibold text-[11px]">
                          {visitCount} {visitCount === 1 ? 'Visit' : 'Visits'}
                        </span>
                      </td>

                      {/* Net Remittance */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-sm font-black text-emerald-400 block">
                          {formatJMD(payout.amountJMD)}
                        </span>
                        <span className="text-[9px] text-emerald-300/80 font-bold uppercase tracking-wider">
                          Direct Deposit
                        </span>
                      </td>

                      {/* Method & Destination */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white truncate max-w-[200px]">
                          {payout.payoutMethod}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                          {payout.destinationAccount || 'Direct Bank Settlement'}
                        </div>
                      </td>

                      {/* Transaction Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {payout.status === 'completed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Successful</span>
                          </span>
                        )}

                        {payout.status === 'scheduled' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span>Scheduled</span>
                          </span>
                        )}

                        {payout.status === 'processing' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                            <span>Processing</span>
                          </span>
                        )}

                        {payout.status === 'failed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-bold">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedPayoutForVoucher(payout)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-bold transition inline-flex items-center gap-1"
                          title="View Payout Remittance Voucher & Settled Visits"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#C77DFF]" />
                          <span>Voucher</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Summary Notice */}
        <div className="p-4 bg-black/30 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              All transactions verified and processed under Jamaican Banking Standards (ACH Direct &amp; Lynk Network).
            </span>
          </div>
          <span className="text-slate-400 font-medium">
            Weekly Batch Schedule: <strong>Every Friday @ 3:00 PM EST</strong>
          </span>
        </div>
      </div>

      {/* DETAILED PAYOUT REMITTANCE VOUCHER MODAL */}
      {selectedPayoutForVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#140526] border border-purple-500/30 text-white shadow-2xl overflow-hidden my-8">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="relative z-10 p-6 bg-gradient-to-r from-purple-950/60 to-[#140526] border-b border-white/10 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md">
                  <Receipt className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Official Remittance Advice &amp; Payout Voucher
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {selectedPayoutForVoucher.payoutReference || selectedPayoutForVoucher.id}
                  </h3>
                  <span className="text-xs text-slate-300">
                    We Care Jamaica Healthcare Ltd • Registered Nurse Compensation
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayoutForVoucher(null)}
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Body */}
            <div className="relative z-10 p-6 space-y-5 max-h-[65vh] overflow-y-auto text-xs">
              {/* Nurse Identity & Payout Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Practitioner Details</span>
                  <strong className="text-white text-sm block">{selectedPayoutForVoucher.nurseName}</strong>
                  <span className="text-emerald-300 text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    NCJ License: {nurse.nursingCouncilLicense}
                  </span>
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Transfer Status</span>
                  <div>
                    {selectedPayoutForVoucher.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Completed &amp; Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                        <Clock className="w-3 h-3 text-purple-400" />
                        Scheduled Batch
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 text-[11px] block mt-1">
                    Paid: {formatDate(selectedPayoutForVoucher.payoutDate || selectedPayoutForVoucher.periodEnd)}
                  </span>
                </div>
              </div>

              {/* Destination Details */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank / Lynk Transfer Route</span>
                <div className="flex items-center justify-between text-slate-200">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-400" />
                    <strong>{selectedPayoutForVoucher.payoutMethod}</strong>
                  </div>
                  <span className="font-mono text-emerald-300">
                    {selectedPayoutForVoucher.destinationAccount || 'NCB Direct Deposit'}
                  </span>
                </div>
                {selectedPayoutForVoucher.notes && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                    Note: “{selectedPayoutForVoucher.notes}”
                  </p>
                )}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-black/40 to-emerald-950/40 border border-white/10 space-y-3">
                <h5 className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                  Remittance Statement Summary
                </h5>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Clinical Visits Covered:</span>
                    <strong className="text-white">
                      {(selectedPayoutForVoucher.bookingIds || []).length} Completed Care Sessions
                    </strong>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Disbursement Route:</span>
                    <span className="text-purple-300 font-bold">
                      {selectedPayoutForVoucher.payoutMethod}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/15 flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-emerald-300 text-sm block">Net Deposited Amount:</span>
                      <span className="text-[10px] text-emerald-400/80">Direct Electronic Bank Settlement</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-300 font-mono">
                      {formatJMD(selectedPayoutForVoucher.amountJMD)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settled Bookings / Visits in this Payout */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Visits Settled in this Payout ({(selectedPayoutForVoucher.bookingIds || []).length})
                </span>

                <div className="space-y-2">
                  {(selectedPayoutForVoucher.bookingIds || []).map((bId) => {
                    const matched = allBookings.find(b => b.id === bId);
                    return (
                      <div
                        key={bId}
                        className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{matched?.serviceName || 'Home Care Clinical Visit'}</span>
                            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded">
                              {bId}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Patient: {matched?.clientName || 'Private Client'} • {matched?.zone || 'Kingston & St Andrew'}
                          </span>
                        </div>

                        <div className="text-right">
                          <strong className="text-emerald-300 block">
                            {formatJMD(matched?.nurseEarningsJMD || (matched?.priceJMD ? matched.priceJMD * 0.85 : 6375))}
                          </strong>
                          <span className="text-[9px] text-slate-400 block">Direct Deposit</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="relative z-10 p-5 bg-black/50 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>

              <button
                onClick={() => setSelectedPayoutForVoucher(null)}
                className="px-5 py-2 rounded-xl bg-[#7209B7] hover:bg-purple-700 text-white text-xs font-bold transition shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
