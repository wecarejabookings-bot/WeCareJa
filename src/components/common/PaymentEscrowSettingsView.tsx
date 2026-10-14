import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  Smartphone, 
  Building2, 
  RefreshCw,
  Info,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface EscrowTransactionDemo {
  id: string;
  clientName: string;
  providerName: string;
  serviceName: string;
  amountJMD: number;
  providerPayoutJMD: number;
  appFeeJMD: number;
  status: 'PAID_HELD' | 'COMPLETE_CONFIRMED' | 'REFUND_REQUESTED';
  date: string;
}

interface PaymentEscrowSettingsViewProps {
  isAdmin?: boolean;
  onReleasePayment?: (txId: string) => void;
}

export const PaymentEscrowSettingsView: React.FC<PaymentEscrowSettingsViewProps> = ({
  isAdmin = false,
  onReleasePayment
}) => {
  const [transactions, setTransactions] = useState<EscrowTransactionDemo[]>([
    {
      id: 'ESC-4091',
      clientName: 'Patricia Sutherland',
      providerName: 'Registered Home Nurse, RN',
      serviceName: 'Wound Dressing & Post-Op Care',
      amountJMD: 7500,
      providerPayoutJMD: 6375, // 85%
      appFeeJMD: 1125, // 15%
      status: 'PAID_HELD',
      date: 'Today, 2:30 PM'
    },
    {
      id: 'ESC-4088',
      clientName: 'Marcus Sterling',
      providerName: 'Certified Caregiver',
      serviceName: 'Senior Respite Care (2-Hour Block)',
      amountJMD: 5800,
      providerPayoutJMD: 4930, // 85%
      appFeeJMD: 870, // 15%
      status: 'COMPLETE_CONFIRMED',
      date: 'Yesterday'
    },
    {
      id: 'ESC-4074',
      clientName: 'Davina Morrison',
      providerName: 'Registered Home Nurse, RN',
      serviceName: 'IV Therapy & Injectable Admin',
      amountJMD: 9000,
      providerPayoutJMD: 7650, // 85%
      appFeeJMD: 1350, // 15%
      status: 'PAID_HELD',
      date: 'Sept 27, 2026'
    }
  ]);

  const [releasedIds, setReleasedIds] = useState<string[]>([]);

  const handleAdminRelease = (id: string) => {
    soundFX.playSuccessPing();
    setReleasedIds(prev => [...prev, id]);
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'COMPLETE_CONFIRMED' };
      }
      return t;
    }));
    if (onReleasePayment) {
      onReleasePayment(id);
    }
  };

  return (
    <div className="w-full space-y-6 text-white animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#1E1B4B] border-2 border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>WeCare Jamaica Escrow Protection</span>
            </span>
            <span className="text-xs text-blue-200">100% Upfront Safeguard &bull; 85/15 Split</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Payments &amp; Escrow Rules
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Every home care booking in Kingston, St. Andrew, Portmore, and Spanish Town is protected by WeCare Jamaica's secure escrow vault.
          </p>
        </div>
      </div>

      {/* Official Master Document Escrow Policy */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-5">
        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Lock className="w-5 h-5 text-blue-400" />
          <span>Official Payment &amp; Escrow Policy</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-[13px] leading-relaxed">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h4 className="font-black text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Secure Booking</span>
            </h4>
            <p className="text-slate-300">
              When you book a Nurse or Caregiver, you pay 100% upfront via Lynk, bank transfer, or card. This payment is held safely by WeCare Jamaica in escrow.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h4 className="font-black text-blue-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>We Hold, Not Spend</span>
            </h4>
            <p className="text-slate-300">
              Your money is NOT sent to provider immediately. We hold it until service complete.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h4 className="font-black text-amber-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Service Complete</span>
            </h4>
            <p className="text-slate-300">
              After visit, you tap <strong>"Confirm Service Complete"</strong> in app.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h4 className="font-black text-emerald-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Provider Gets Paid</span>
            </h4>
            <p className="text-slate-300">
              Once confirmed, WeCare releases 85% to your Nurse/Caregiver within 24 hours. WeCare keeps 15% service fee.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h4 className="font-black text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>What if service not done?</span>
            </h4>
            <p className="text-slate-300">
              If provider does not show, or you cancel within policy, you get 100% refund to Lynk/bank within 48 hours.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h4 className="font-black text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>No Cash to Provider</span>
            </h4>
            <p className="text-slate-300">
              Please do not pay cash directly. Pay only through app to stay protected.
            </p>
          </div>
        </div>

        {/* Payment Methods Launch Details */}
        <div className="p-4 rounded-2xl bg-[#1E1B4B]/80 border border-blue-400/30 space-y-2 text-xs">
          <span className="font-black text-blue-300 uppercase tracking-wide block text-[11px]">
            Payment Methods (Launch)
          </span>
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-white block font-mono">Lynk: @wecareja</strong>
                <span className="text-slate-300 text-[11px]">1876-582-7613</span>
              </div>
            </div>

            <div className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <strong className="text-white block">NCB Direct Transfer</strong>
                <span className="text-slate-300 text-[11px]">WeCare Jamaica • Kingston Branch</span>
              </div>
            </div>

            <div className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block">Card (WiPay)</strong>
                <span className="text-slate-300 text-[11px]">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Status Legend & Live Flow Demonstration */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Escrow Flow &amp; Status Monitor
            </h3>
            <p className="text-xs text-slate-400">
              Live status states governing all platform transactions:
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
              PAID_HELD (Yellow)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
              COMPLETE_CONFIRMED (Green)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/40 font-bold">
              REFUND_REQUESTED (Red)
            </span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Escrow ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3 text-right">Client Amount</th>
                <th className="py-2.5 px-3 text-right">85% Provider Net</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-3 font-mono font-bold text-blue-300">{tx.id}</td>
                  <td className="py-3 px-3 font-medium text-white">{tx.clientName}</td>
                  <td className="py-3 px-3 text-slate-300">{tx.providerName}</td>
                  <td className="py-3 px-3 text-slate-400">{tx.serviceName}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    ${tx.amountJMD.toLocaleString()} JMD
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    ${tx.providerPayoutJMD.toLocaleString()} JMD
                  </td>
                  <td className="py-3 px-3 text-center">
                    {tx.status === 'PAID_HELD' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase font-mono">
                        PAID_HELD
                      </span>
                    )}
                    {tx.status === 'COMPLETE_CONFIRMED' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase font-mono">
                        COMPLETE_CONFIRMED
                      </span>
                    )}
                    {tx.status === 'REFUND_REQUESTED' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px] font-black uppercase font-mono">
                        REFUND_REQUESTED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {tx.status === 'PAID_HELD' ? (
                      <button
                        type="button"
                        onClick={() => handleAdminRelease(tx.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Release Payment to Provider</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">
                        Payout Dispatched
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
