import React, { useState, useEffect } from 'react';
import { AdminPayrollRecord } from '../../types';
import { formatJMD, getKingstonNow, getLast4 } from '../../utils/adminPayrollUtils';
import { soundFX } from '../../utils/soundEffects';
import { DollarSign, CheckCircle2, X, CreditCard, Building, Smartphone, FileText, AlertCircle, Sparkles } from 'lucide-react';

interface AdminPayNowModalProps {
  admin: AdminPayrollRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (
    admin: AdminPayrollRecord,
    amount: number,
    method: string,
    transactionId: string,
    note: string
  ) => void;
}

export const AdminPayNowModal: React.FC<AdminPayNowModalProps> = ({
  admin,
  isOpen,
  onClose,
  onConfirmPayment
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<string>('Lynk Digital Wallet');
  const [transactionId, setTransactionId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Auto-fill when admin changes
  useEffect(() => {
    if (admin) {
      const defaultAmount = admin.balanceDue > 0 ? admin.balanceDue : admin.weeklySalaryJMD || 4000;
      setAmount(defaultAmount);
      
      // Auto-detect method from lynkOrBankInfo
      const info = admin.lynkOrBankInfo || '';
      let initialMethod = 'Lynk Digital Wallet';
      let txPrefix = 'LYNK-TX-';
      if (info.toLowerCase().includes('ncb')) {
        initialMethod = 'NCB Direct Transfer';
        txPrefix = 'NCB-TR-';
      } else if (info.toLowerCase().includes('scotia')) {
        initialMethod = 'Scotiabank Transfer';
        txPrefix = 'BNS-TR-';
      } else if (info.toLowerCase().includes('jn')) {
        initialMethod = 'JN Bank Transfer';
        txPrefix = 'JN-TR-';
      } else if (info.toLowerCase().includes('lynk')) {
        initialMethod = 'Lynk Digital Wallet';
        txPrefix = 'LYNK-TX-';
      }
      setMethod(initialMethod);

      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      setTransactionId(`${txPrefix}${randomSuffix}`);
      setNote(`Weekly stipend disbursement for ${admin.role} duties`);
      setError(null);
    }
  }, [admin]);

  if (!isOpen || !admin) return null;

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
    let prefix = 'TX-';
    if (newMethod.includes('Lynk')) prefix = 'LYNK-TX-';
    else if (newMethod.includes('NCB')) prefix = 'NCB-TR-';
    else if (newMethod.includes('Scotia')) prefix = 'BNS-TR-';
    else if (newMethod.includes('JN')) prefix = 'JN-TR-';
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    setTransactionId(`${prefix}${randomSuffix}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid disbursement amount greater than 0');
      return;
    }
    if (!transactionId.trim()) {
      setError('Please provide a transaction reference ID');
      return;
    }

    soundFX.playPaymentConfirmed();
    onConfirmPayment(admin, amount, method, transactionId.trim(), note.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-[#1E1B4B] p-5 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Executive Payroll Disbursement
              </h2>
              <p className="text-xs text-slate-300">
                Disburse weekly salary via Lynk or Jamaican Bank Transfer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Admin Overview Box */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                  Recipient Staff Member
                </span>
                <span className="text-sm font-black text-white">{admin.fullName}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {admin.role}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">
                  Current Balance Due
                </span>
                <span className="text-base font-black text-amber-400">
                  {formatJMD(admin.balanceDue)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="text-slate-400 font-mono">Destination Account:</span>
              <span className="font-bold text-emerald-300 font-mono">
                {admin.lynkOrBankInfo || 'No bank info provided'}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Disbursement Amount (JMD)</span>
              <button
                type="button"
                onClick={() => setAmount(admin.balanceDue > 0 ? admin.balanceDue : admin.weeklySalaryJMD)}
                className="text-[11px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                Auto-fill full balance ({formatJMD(admin.balanceDue)})
              </button>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                JMD $
              </span>
              <input
                type="number"
                min="1"
                step="100"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-18 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-base font-black focus:outline-none focus:border-emerald-500 transition"
                placeholder="4000"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Payment Gateway / Rail</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Lynk Digital Wallet', icon: Smartphone, label: 'Lynk (Instant)' },
                { name: 'NCB Direct Transfer', icon: Building, label: 'NCB Online' },
                { name: 'Scotiabank Transfer', icon: CreditCard, label: 'Scotiabank BNS' },
                { name: 'JN Bank Transfer', icon: Building, label: 'JN Bank' }
              ].map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => handleMethodChange(m.name)}
                  className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer ${
                    method === m.name
                      ? 'bg-purple-600/30 border-purple-400 text-white shadow-md shadow-purple-950/40'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <m.icon className="w-4 h-4 text-purple-300 shrink-0" />
                  <span className="text-xs font-bold truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Transaction Reference / ID</span>
              <span className="text-[10px] text-slate-400 font-mono">Auto-generated</span>
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-500 transition"
              placeholder="LYNK-TX-982142"
              required
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Memo / Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
              placeholder="Weekly payroll stipend"
            />
          </div>

          {/* Authorized Disburser Info */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-center justify-between">
            <span>Authorized Disburser:</span>
            <span className="font-bold text-white font-mono">
              We Care Jamaica (wecareja.bookings@gmail.com)
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Disburse Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
