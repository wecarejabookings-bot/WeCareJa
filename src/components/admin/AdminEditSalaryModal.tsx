import React, { useState, useEffect } from 'react';
import { AdminPayrollRecord, AdminStaffRole } from '../../types';
import { formatJMD } from '../../utils/adminPayrollUtils';
import { soundFX } from '../../utils/soundEffects';
import { Edit3, Check, X, Shield, DollarSign } from 'lucide-react';

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
  const [weeklySalary, setWeeklySalary] = useState<number>(4000);
  const [role, setRole] = useState<AdminStaffRole>('Support');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [lynkOrBankInfo, setLynkOrBankInfo] = useState<string>('');

  useEffect(() => {
    if (admin) {
      setWeeklySalary(admin.weeklySalaryJMD || 4000);
      setRole(admin.role || 'Support');
      setStatus(admin.status || 'Active');
      setLynkOrBankInfo(admin.lynkOrBankInfo || '');
    }
  }, [admin]);

  if (!isOpen || !admin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playToggleClick();
    onSave({
      ...admin,
      weeklySalaryJMD: Number(weeklySalary) || 4000,
      role,
      status,
      lynkOrBankInfo: lynkOrBankInfo.trim()
    });
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
        className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-[#1E1B4B] p-5 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Edit Admin Salary &amp; Role</h2>
              <p className="text-xs text-slate-300">{admin.fullName}</p>
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Weekly Salary */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Weekly Salary (JMD)</span>
              <span className="text-[10px] text-slate-400">Default: JMD $4,000</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                JMD $
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={weeklySalary}
                onChange={(e) => setWeeklySalary(Number(e.target.value))}
                className="w-full pl-18 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-base font-black focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Staff Duty &amp; Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminStaffRole)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
            >
              <option value="Support">Support (Care Concierge &amp; Triage)</option>
              <option value="Dispatcher">Dispatcher (Nurse Routing &amp; Live Dispatch)</option>
              <option value="Manager">Manager (Operations Supervisor)</option>
              <option value="Operations Director">Operations Director</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Account Payroll Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Active'
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span>Active (Weekly Accrual)</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Inactive'
                    ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span>Inactive (Paused)</span>
              </button>
            </div>
          </div>

          {/* Lynk or Bank Account */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Lynk Handle or Bank Account Info
            </label>
            <input
              type="text"
              value={lynkOrBankInfo}
              onChange={(e) => setLynkOrBankInfo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
              placeholder="e.g. Lynk @username or NCB Acct: 102938475"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
