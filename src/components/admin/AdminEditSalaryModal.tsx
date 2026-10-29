import React, { useState, useEffect } from 'react';
import { AdminPayrollRecord, AdminStaffRole } from '../../types';
import { formatJMD } from '../../utils/adminPayrollUtils';
import { soundFX } from '../../utils/soundEffects';
import { supabase } from '../../lib/supabase';
import { Edit3, Check, X, Shield, DollarSign, Calculator } from 'lucide-react';

interface AdminEditSalaryModalProps {
  admin: AdminPayrollRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAdmin: AdminPayrollRecord) => void;
}

export const AdminEditSalaryModal: React.FC<AdminEditSalaryModalProps> = ({
  admin,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<AdminStaffRole>('Support');
  const [weeklySalary, setWeeklySalary] = useState<number>(4000);
  const [weeksWorked, setWeeksWorked] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [lynkOrBankInfo, setLynkOrBankInfo] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (admin) {
      setName(admin.fullName || '');
      setEmail(admin.email || '');
      setRole(admin.role || 'Support');
      setWeeklySalary(admin.weeklySalaryJMD || 4000);
      setWeeksWorked(admin.weeksWorked ?? (admin.startDate ? Math.max(0, Math.floor((Date.now() - new Date(admin.startDate).getTime()) / (7 * 24 * 3600 * 1000))) : 0));
      setTotalPaid(admin.totalPaid || 0);
      setStatus(admin.status || 'Active');
      setLynkOrBankInfo(admin.lynkOrBankInfo || '');
    }
  }, [admin]);

  if (!isOpen || !admin) return null;

  // Auto-calc: total_earned = weekly_salary * weeks_worked, balance_due = total_earned - total_paid
  const calculatedTotalEarned = Math.max(0, Number(weeklySalary || 0) * Number(weeksWorked || 0));
  const calculatedBalanceDue = Math.max(0, calculatedTotalEarned - Number(totalPaid || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    soundFX.playToggleClick();

    const updatedAdmin: AdminPayrollRecord = {
      ...admin,
      fullName: name.trim() || admin.fullName,
      email: email.trim().toLowerCase() || admin.email,
      role,
      weeklySalaryJMD: Number(weeklySalary) || 4000,
      weeksWorked: Number(weeksWorked) || 0,
      totalPaid: Number(totalPaid) || 0,
      totalEarned: calculatedTotalEarned,
      balanceDue: calculatedBalanceDue,
      status,
      lynkOrBankInfo: lynkOrBankInfo.trim()
    };

    // Save to Supabase admin_staff table
    try {
      await supabase
        .from('admin_staff')
        .update({
          full_name: updatedAdmin.fullName,
          email: updatedAdmin.email,
          role: updatedAdmin.role,
          weekly_salary: updatedAdmin.weeklySalaryJMD,
          weeks_worked: updatedAdmin.weeksWorked,
          total_paid: updatedAdmin.totalPaid,
          total_earned: updatedAdmin.totalEarned,
          balance_due: updatedAdmin.balanceDue,
          status: updatedAdmin.status
        })
        .eq('id', admin.id);
    } catch (err) {
      console.warn('Supabase admin_staff update error:', err);
    }

    setIsSaving(false);
    onSave(updatedAdmin);
    onClose();
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
        <div className="bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-[#1E1B4B] p-5 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Edit Admin Staff &amp; Payroll</h2>
              <p className="text-xs text-slate-300">{admin.fullName} ({admin.email})</p>
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm max-h-[85vh] overflow-y-auto">
          {/* Live Auto-Calc Preview Bar */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-950 border border-purple-500/30 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Auto-Calc Total Earned</span>
              <span className="text-base font-black text-white font-mono">{formatJMD(calculatedTotalEarned)}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{weeksWorked} wks &times; {formatJMD(weeklySalary)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Auto-Calc Balance Due</span>
              <span className="text-base font-black text-amber-300 font-mono">{formatJMD(calculatedBalanceDue)}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Earned &minus; Paid ({formatJMD(totalPaid)})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Staff Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Role */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Staff Duty &amp; Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminStaffRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
              >
                <option value="Support">Support (Care Concierge)</option>
                <option value="Dispatcher">Dispatcher (Nurse Routing)</option>
                <option value="Manager">Manager (Operations Supervisor)</option>
                <option value="Operations Director">Operations Director</option>
              </select>
            </div>

            {/* Weekly Salary */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Weekly Salary (JMD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-xs">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={weeklySalary}
                  onChange={(e) => setWeeklySalary(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs font-bold focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Weeks Worked */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Weeks Worked</span>
                <span className="text-[10px] text-emerald-400">Fixes 91-wk bug</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={weeksWorked}
                onChange={(e) => setWeeksWorked(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs font-bold focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>

            {/* Total Paid */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Total Paid (JMD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-xs">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={totalPaid}
                  onChange={(e) => setTotalPaid(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs font-bold focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Account Payroll Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Active'
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span>Active</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Inactive'
                    ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span>Inactive</span>
              </button>
            </div>
          </div>

          {/* Lynk or Bank Account */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              Lynk Handle or Bank Account Info
            </label>
            <input
              type="text"
              value={lynkOrBankInfo}
              onChange={(e) => setLynkOrBankInfo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
              placeholder="e.g. Lynk @username or NCB Acct: 102938475"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save to Supabase'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
