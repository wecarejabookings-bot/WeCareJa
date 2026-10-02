import React, { useState } from 'react';
import { AdminPayrollRecord, AdminStaffRole } from '../../types';
import { getKingstonNow } from '../../utils/adminPayrollUtils';
import { soundFX } from '../../utils/soundEffects';
import { UserPlus, Check, X, Shield, DollarSign } from 'lucide-react';

interface AdminAddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (newAdmin: AdminPayrollRecord) => void;
}

export const AdminAddStaffModal: React.FC<AdminAddStaffModalProps> = ({
  isOpen,
  onClose,
  onAddAdmin
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminStaffRole>('Support');
  const [weeklySalaryJMD, setWeeklySalaryJMD] = useState<number>(4000);
  const [startDate, setStartDate] = useState(
    getKingstonNow().toISOString().split('T')[0]
  );
  const [lynkOrBankInfo, setLynkOrBankInfo] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    soundFX.playToggleClick();
    const id = `admin-${Date.now().toString().slice(-6)}`;
    const newAdmin: AdminPayrollRecord = {
      id,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      weeklySalaryJMD: Number(weeklySalaryJMD) || 4000,
      startDate,
      status: 'Active',
      totalPaid: 0,
      totalEarned: 0,
      balanceDue: 0,
      lynkOrBankInfo: lynkOrBankInfo.trim() || 'Lynk / Bank pending',
      phone: phone.trim()
    };

    onAddAdmin(newAdmin);
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
              <UserPlus className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Onboard New Admin Staff</h2>
              <p className="text-xs text-slate-300">Set weekly stipend &amp; Lynk/Bank details</p>
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5 text-xs sm:text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
              placeholder="e.g. Shanique Wright"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
              placeholder="shanique@wecareja.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminStaffRole)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="Support">Support</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Weekly Salary (JMD)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={weeklySalaryJMD}
                onChange={(e) => setWeeklySalaryJMD(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                placeholder="4000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500"
                placeholder="876-555-0199"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              Lynk Handle or Bank Account Info
            </label>
            <input
              type="text"
              value={lynkOrBankInfo}
              onChange={(e) => setLynkOrBankInfo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500"
              placeholder="e.g. Lynk @username or NCB 102938475"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#1E1B4B] hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Add Admin to Payroll</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
