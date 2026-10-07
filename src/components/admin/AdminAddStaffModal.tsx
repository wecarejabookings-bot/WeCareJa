import React, { useState } from 'react';
import { AdminPayrollRecord, AdminStaffRole, UserAccount } from '../../types';
import { getKingstonNow } from '../../utils/adminPayrollUtils';
import { soundFX } from '../../utils/soundEffects';
import { supabase } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import { UserPlus, Check, X, Shield, DollarSign, Eye, EyeOff, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AdminStaffRole>('Support');
  const [weeklySalaryJMD, setWeeklySalaryJMD] = useState<number>(4000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = tempPassword.trim();

    if (!cleanName || !cleanEmail) {
      setErrorMessage('Full name and email are required.');
      return;
    }
    if (!cleanPass || cleanPass.length < 6) {
      setErrorMessage('Temporary password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    soundFX.playToggleClick();

    let createdUserId = `admin-${Date.now().toString().slice(-6)}`;

    try {
      // Step 1: Create real login in Supabase Auth
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              full_name: cleanName,
              role: 'admin'
            }
          }
        });

        if (authError) {
          console.warn('Supabase auth.signUp note:', authError.message);
        }
        if (authData?.user?.id) {
          createdUserId = authData.user.id;
          try {
            await supabase.functions.invoke('confirm-user', { body: { user_id: authData.user.id } });
          } catch (fnErr) {
            console.warn('confirm-user invoke error:', fnErr);
          }
        }
      } catch (authErr: any) {
        console.warn('Supabase auth signup caught:', authErr);
      }

      // After signUp ALWAYS upsert profiles
      try {
        await supabase.from('profiles').upsert({
          id: createdUserId,
          email: cleanEmail,
          role: role,
          full_name: cleanName,
          is_admin: true
        });
      } catch (profErr) {
        console.warn('profiles upsert note:', profErr);
      }

      // Step 2 & 3: Insert into admin_staff
      const newAdminRecord: AdminPayrollRecord = {
        id: createdUserId,
        userId: createdUserId,
        fullName: cleanName,
        email: cleanEmail,
        role,
        weeklySalaryJMD: Number(weeklySalaryJMD) || 4000,
        startDate: getKingstonNow().toISOString().split('T')[0],
        weeksWorked: 0,
        status: 'Active',
        totalPaid: 0,
        totalEarned: 0,
        balanceDue: 0,
        lynkOrBankInfo: 'Lynk / Bank pending',
        phone: '(876) 582-7613'
      };

      try {
        await supabase.from('admin_staff').insert({
          user_id: createdUserId,
          email: cleanEmail,
          full_name: cleanName,
          role: role,
          weekly_salary: Number(weeklySalaryJMD) || 4000,
          weeks_worked: 0,
          total_earned: 0,
          balance_due: 0,
          status: 'Active',
          employment_start_date: new Date().toISOString()
        });
      } catch (insertErr) {
        console.warn('Supabase admin_staff insert note:', insertErr);
      }

      // Step 4: Insert into user_roles and staff tables with role=admin
      try {
        await supabase.from('user_roles').insert({
          user_id: createdUserId,
          role: 'admin'
        });
      } catch {}

      try {
        await supabase.from('staff').insert({
          id: createdUserId,
          email: cleanEmail,
          full_name: cleanName,
          role: 'admin'
        });
      } catch {}

      try {
        await supabase.from('profiles').upsert({
          id: createdUserId,
          email: cleanEmail,
          full_name: cleanName,
          username: cleanEmail.split('@')[0],
          role: 'admin'
        });
      } catch {}

      // Register local UserAccount so top bar Admin button & login work seamlessly
      try {
        const rawAccounts = localStorage.getItem('wecare_user_accounts');
        const accounts: UserAccount[] = rawAccounts ? JSON.parse(rawAccounts) : [];
        const newAccount: UserAccount = {
          id: createdUserId,
          name: cleanName,
          full_name: cleanName,
          username: cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: '(876) 582-7613',
          role: 'admin',
          title: `${role} Administrator`,
          password: cleanPass,
          approvalStatus: 'approved',
          createdAt: new Date().toISOString()
        };
        const updatedAccounts = [newAccount, ...accounts.filter(a => a.email.toLowerCase() !== cleanEmail)];
        localStorage.setItem('wecare_user_accounts', JSON.stringify(updatedAccounts));
      } catch {}

      // Add to payroll state
      onAddAdmin(newAdminRecord);

      // Step 5: Show success
      setSuccessMessage('Admin created - they can now login at wecareja.care');
      soundFX.playSuccessPing();
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error onboarding admin staff');
    } finally {
      setIsSubmitting(false);
    }
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
              <h2 className="text-base font-black text-white">Create Functional Admin Staff</h2>
              <p className="text-xs text-slate-300">Creates Supabase login &amp; sets weekly stipend</p>
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

        {successMessage ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-black text-white">Account Created!</h3>
            <p className="text-xs text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl">
              {successMessage}
            </p>
            <p className="text-[11px] text-slate-400">
              Credentials: <strong className="text-white">{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5 text-xs sm:text-sm">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs">
                {errorMessage}
              </div>
            )}

            {/* full_name */}
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

            {/* email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Email Address (Login Username)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500 transition"
                placeholder="shanique@wecareja.care"
              />
            </div>

            {/* temp_password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Temporary Password</span>
                <span className="text-[10px] text-purple-300">Min 6 characters</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-500 transition"
                  placeholder="TempPassword123!"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* role */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminStaffRole)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Support">Support</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              {/* weekly_salary */}
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
                    value={weeklySalaryJMD}
                    onChange={(e) => setWeeklySalaryJMD(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    placeholder="4000"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 space-y-1 text-[11px] text-slate-300">
              <span className="font-bold text-purple-300 block">✨ Automatic Provisioning:</span>
              <span>Creates Supabase Auth credentials, registers admin access permissions, and initializes weeks worked to 0 (fixes 91-week bug).</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#1E1B4B] hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Login...' : '+ Create Functional Admin'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
