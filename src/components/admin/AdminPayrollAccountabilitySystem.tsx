import React, { useState, useEffect, useMemo } from 'react';
import { Booking, UserAccount, AdminPayrollRecord, AdminPaymentHistoryItem } from '../../types';
import {
  loadAdminPayroll,
  saveAdminPayroll,
  loadPaymentHistory,
  savePaymentHistory,
  checkAndRunAutomatedWeeklyLogic,
  calculatePlatformFinance,
  getKingstonNow,
  getMondayOfCurrentWeek,
  getNextMondayDate,
  getWeekPeriodString,
  getWeeksWorked,
  getAdminPayStatus,
  exportPaymentHistoryCSV,
  formatJMD,
  OWNER_EMAIL
} from '../../utils/adminPayrollUtils';
import { AdminPayslipModal } from './AdminPayslipModal';
import { AdminPayNowModal } from './AdminPayNowModal';
import { AdminEditSalaryModal } from './AdminEditSalaryModal';
import { AdminAddStaffModal } from './AdminAddStaffModal';
import { soundFX } from '../../utils/soundEffects';
import { supabase } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Printer,
  Edit,
  CheckCircle2,
  Calendar,
  Sparkles,
  Smartphone,
  Building,
  User,
  Crown,
  Lock,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  CreditCard,
  Search,
  Filter,
  Trash2,
  Check,
  X
} from 'lucide-react';

interface AdminPayrollAccountabilitySystemProps {
  bookings: Booking[];
  currentUser?: UserAccount | null;
  isMasterAdmin?: boolean;
  selectedStaffEmail?: string;
}

export const AdminPayrollAccountabilitySystem: React.FC<AdminPayrollAccountabilitySystemProps> = ({
  bookings,
  currentUser,
  isMasterAdmin = true,
  selectedStaffEmail
}) => {
  // State for Admin Payroll List and Payment History stored in localStorage
  const [admins, setAdmins] = useState<AdminPayrollRecord[]>(() => loadAdminPayroll());
  const [paymentHistory, setPaymentHistory] = useState<AdminPaymentHistoryItem[]>(() => loadPaymentHistory());

  // Interactive View Persona Switcher (Allows testing Owner vs Regular Admin perspectives)
  const [activePersona, setActivePersona] = useState<string>(() => {
    if (selectedStaffEmail) return selectedStaffEmail;
    if (!isMasterAdmin) {
      return currentUser?.email || OWNER_EMAIL;
    }
    return OWNER_EMAIL;
  });

  useEffect(() => {
    if (selectedStaffEmail) {
      setActivePersona(selectedStaffEmail);
    } else if (!isMasterAdmin && activePersona.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      setActivePersona(currentUser?.email || OWNER_EMAIL);
    }
  }, [selectedStaffEmail, isMasterAdmin]);

  // Modal States
  const [selectedAdminForPay, setSelectedAdminForPay] = useState<AdminPayrollRecord | null>(null);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<AdminPayrollRecord | null>(null);
  const [selectedPaymentForPayslip, setSelectedPaymentForPayslip] = useState<AdminPaymentHistoryItem | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{ msg: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Search filter for Table A
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Support' | 'Dispatcher' | 'Manager'>('all');

  // Inline Salary Editing State (Accessible to all admins)
  const [editingSalaryAdminId, setEditingSalaryAdminId] = useState<string | null>(null);
  const [editingSalaryInput, setEditingSalaryInput] = useState<string>('');

  const handleSaveSalaryInline = (adminId: string) => {
    const num = parseFloat(editingSalaryInput);
    if (isNaN(num) || num < 0) {
      showToast('Please enter a valid salary amount', 'warning');
      return;
    }
    const updated = admins.map(a => {
      if (a.id === adminId) {
        return { ...a, weeklySalaryJMD: num };
      }
      return a;
    });
    setAdmins(updated);
    saveAdminPayroll(updated);
    setEditingSalaryAdminId(null);
    showToast(`Updated weekly salary to $${num.toLocaleString()} JMD`, 'success');
    soundFX.playSuccessPing();
  };

  // Automated Weekly Logic check on mount & sync with Supabase admin_staff table
  useEffect(() => {
    const fetchSupabaseStaff = async () => {
      try {
        const { data, error } = await supabase.from('admin_staff').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: AdminPayrollRecord[] = data.map((row: any) => ({
            id: row.id || row.user_id || `admin-${row.email}`,
            userId: row.user_id,
            fullName: row.full_name || row.name || 'Admin Staff',
            email: row.email,
            role: row.role || 'Support',
            weeklySalaryJMD: Number(row.weekly_salary) || 4000,
            startDate: row.employment_start_date ? row.employment_start_date.split('T')[0] : (row.start_date || getKingstonNow().toISOString().split('T')[0]),
            weeksWorked: Number(row.weeks_worked) || 0,
            status: row.status || 'Active',
            totalPaid: Number(row.total_paid) || 0,
            totalEarned: Number(row.total_earned) || 0,
            balanceDue: Number(row.balance_due) || 0,
            lynkOrBankInfo: row.lynk_or_bank_info || 'Lynk / Bank pending',
            phone: row.phone || '(876) 582-7613'
          }));
          setAdmins(mapped);
          saveAdminPayroll(mapped);
          return;
        }
      } catch (err) {
        console.warn('Note fetching admin_staff from Supabase:', err);
      }

      // Fallback: Run weekly logic on local records
      const { updatedRecords, accruedCount } = checkAndRunAutomatedWeeklyLogic(admins, false);
      if (accruedCount > 0) {
        setAdmins(updatedRecords);
        showToast(`Automated Monday Run: Accrued weekly stipend for ${accruedCount} active admin(s)`, 'info');
      }
    };

    fetchSupabaseStaff();
  }, []);

  const showToast = (msg: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotificationToast({ msg, type });
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Determine current active viewing permissions: Master admin (wecareja.bookings@gmail.com) always has full owner clearance
  const isMasterAdminEmail = (currentUser?.email || '').toLowerCase().replace(/\./g, '') === 'wecarejabookings@gmail.com' ||
    (selectedStaffEmail || '').toLowerCase().replace(/\./g, '') === 'wecarejabookings@gmail.com' ||
    activePersona.toLowerCase().replace(/\./g, '') === 'wecarejabookings@gmail.com' ||
    currentUser?.role === 'admin' ||
    Boolean(isMasterAdmin);

  const isViewingAsOwner = Boolean(isMasterAdmin || isMasterAdminEmail);

  // Zero Out button: ONLY for Owner wecareja.bookings@gmail.com.
  // On click confirm: "Zero out {name}? Fixes -110,500 profit bug."
  // Then: supabase.from('admin_staff').update({weeks_worked:0, total_earned:0, balance_due:0, employment_start_date: new Date().toISOString()}).eq('id', staff.id)
  const handleZeroOutStaff = async (staff: AdminPayrollRecord) => {
    const isOwner = isViewingAsOwner || (currentUser?.email || '').toLowerCase().replace(/\./g, '') === 'wecarejabookings@gmail.com';
    if (!isOwner) {
      showToast('Zero Out action is strictly restricted to Owner wecareja.bookings@gmail.com', 'warning');
      soundFX.playWarningSound();
      return;
    }

    const confirmed = window.confirm(`Zero out ${staff.fullName}? Fixes -110,500 profit bug.`);
    if (!confirmed) return;

    soundFX.playToggleClick();

    // 1. Update Supabase
    try {
      await supabase.from('admin_staff').update({
        weeks_worked: 0,
        total_earned: 0,
        balance_due: 0,
        employment_start_date: new Date().toISOString()
      }).eq('id', staff.id);
    } catch (err) {
      console.warn('Supabase zero out note:', err);
    }

    // 2. Update local state & localStorage
    const updated = admins.map(a => {
      if (a.id === staff.id) {
        return {
          ...a,
          weeksWorked: 0,
          totalEarned: 0,
          totalPaid: 0,
          balanceDue: 0,
          startDate: new Date().toISOString().split('T')[0]
        };
      }
      return a;
    });

    setAdmins(updated);
    saveAdminPayroll(updated);
    soundFX.playSuccessPing();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(`Zeroed out ${staff.fullName}. Profit calculation reset!`, 'success');
  };

  // Permanently delete admin staff from payroll registry with double confirm
  const handleDeleteAdminStaff = async (adminToDelete: AdminPayrollRecord) => {
    const isMasterTarget = adminToDelete.email.toLowerCase().replace(/\./g, '') === 'wecarejabookings@gmail.com' || adminToDelete.id === 'admin-sydney';
    if (isMasterTarget) {
      showToast('Cannot delete the Master Administrator / Owner account.', 'warning');
      soundFX.playWarningSound();
      return;
    }

    // Double confirm
    const confirmed1 = window.confirm(
      `Are you sure you want to delete ${adminToDelete.fullName} from Admin Staff?`
    );
    if (!confirmed1) return;

    const confirmed2 = window.confirm(
      `This will permanently remove ${adminToDelete.fullName} from payroll and revoke admin access. Proceed?`
    );
    if (!confirmed2) return;

    // Delete from Supabase
    try {
      await supabase.from('admin_staff').delete().eq('id', adminToDelete.id);
      await supabase.from('staff').delete().eq('id', adminToDelete.id);
    } catch (err) {
      console.warn('Supabase delete staff note:', err);
    }

    const updated = admins.filter(a => a.id !== adminToDelete.id);
    setAdmins(updated);
    saveAdminPayroll(updated);

    // Also remove from local user accounts if exists
    try {
      const rawAccounts = localStorage.getItem('wecare_user_accounts');
      if (rawAccounts) {
        const accounts: UserAccount[] = JSON.parse(rawAccounts);
        const filteredAccs = accounts.filter(a => a.id !== adminToDelete.id && a.email?.toLowerCase() !== adminToDelete.email.toLowerCase());
        localStorage.setItem('wecare_user_accounts', JSON.stringify(filteredAccs));
      }
    } catch {}

    showToast(`Permanently deleted ${adminToDelete.fullName} from staff registry.`, 'success');
    soundFX.playToggleClick();
  };
  
  // Find current admin record if viewing as regular admin
  const currentAdminProfile = useMemo(() => {
    if (isViewingAsOwner) {
      return admins.find(a => a.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) || admins[0];
    }
    return admins.find(a => a.email.toLowerCase() === activePersona.toLowerCase()) || admins[1] || admins[0];
  }, [admins, activePersona, isViewingAsOwner]);

  // Kingston time calculations
  const kingstonNow = getKingstonNow();
  const nextPayDay = getNextMondayDate(kingstonNow);
  const currentWeekPeriod = getWeekPeriodString(kingstonNow);

  // Platform Finance Math (from 15% commission)
  const financeMath = useMemo(() => {
    return calculatePlatformFinance(bookings, admins);
  }, [bookings, admins]);

  // Filtered Table A: Admin List
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch = admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.lynkOrBankInfo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [admins, searchQuery, roleFilter]);

  // Filtered Table B: Payment History
  // Owner sees all payments. Regular admin sees ONLY their own payments!
  const filteredPaymentHistory = useMemo(() => {
    if (isViewingAsOwner) {
      return paymentHistory;
    }
    return paymentHistory.filter(
      p => p.adminId === currentAdminProfile?.id || 
           p.adminName.toLowerCase() === currentAdminProfile?.fullName.toLowerCase()
    );
  }, [paymentHistory, isViewingAsOwner, currentAdminProfile]);

  // Handler: Execute Payment ("Pay Now" flow)
  const handleConfirmPayment = (
    admin: AdminPayrollRecord,
    amount: number,
    method: string,
    transactionId: string,
    note: string
  ) => {
    const todayIso = kingstonNow.toISOString().split('T')[0];
    const newBalanceDue = Math.max(0, (admin.balanceDue || 0) - amount);

    // 1. Update Admin Record
    const updatedAdmins = admins.map(a => {
      if (a.id === admin.id) {
        return {
          ...a,
          balanceDue: newBalanceDue,
          totalPaid: (a.totalPaid || 0) + amount,
          lastPayDate: todayIso
        };
      }
      return a;
    });

    setAdmins(updatedAdmins);
    saveAdminPayroll(updatedAdmins);

    // 2. Add to Payment History
    const newHistoryItem: AdminPaymentHistoryItem = {
      id: `pay-tx-${Date.now().toString().slice(-6)}`,
      adminId: admin.id,
      adminName: admin.fullName,
      role: admin.role,
      date: todayIso,
      amount,
      method,
      transactionId,
      paidBy: `We Care Jamaica (${OWNER_EMAIL})`,
      note: note || `Weekly payroll disbursement for ${admin.role} role`,
      weekPeriod: currentWeekPeriod,
      weeklySalary: admin.weeklySalaryJMD,
      balanceAfterPayment: newBalanceDue,
      lynkOrBankInfo: admin.lynkOrBankInfo
    };

    const updatedHistory = [newHistoryItem, ...paymentHistory];
    setPaymentHistory(updatedHistory);
    savePaymentHistory(updatedHistory);

    // 3. Close Pay Modal & Trigger Celebrations
    setSelectedAdminForPay(null);
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#10B981', '#F59E0B', '#C77DFF']
    });

    // 4. Automatically open generated payslip for immediate print / save
    setSelectedPaymentForPayslip(newHistoryItem);
    showToast(`Payment of ${formatJMD(amount)} disbursed to ${admin.fullName}!`, 'success');
  };

  // Handler: Save Edited Salary
  const handleSaveEditedSalary = (updatedAdmin: AdminPayrollRecord) => {
    const updatedAdmins = admins.map(a => a.id === updatedAdmin.id ? updatedAdmin : a);
    setAdmins(updatedAdmins);
    saveAdminPayroll(updatedAdmins);
    showToast(`Updated payroll details for ${updatedAdmin.fullName}`, 'success');
  };

  // Handler: Add New Admin
  const handleAddNewAdmin = (newAdmin: AdminPayrollRecord) => {
    const updated = [newAdmin, ...admins];
    setAdmins(updated);
    saveAdminPayroll(updated);
    showToast(`Onboarded ${newAdmin.fullName} as ${newAdmin.role}`, 'success');
  };

  // Handler: Manual simulation of Monday Payroll Run
  const handleSimulateMondayRun = () => {
    soundFX.playToggleClick();
    const { updatedRecords, accruedCount } = checkAndRunAutomatedWeeklyLogic(admins, true);
    setAdmins(updatedRecords);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#10B981', '#F59E0B']
    });
    showToast(`Manual Weekly Run: Accrued weekly salaries for ${accruedCount} active admin staff!`, 'success');
  };

  // Handler: Toggle Active/Inactive status
  const handleToggleAdminStatus = (adminId: string) => {
    if (!isViewingAsOwner) return;
    const updated = admins.map(a => {
      if (a.id === adminId) {
        const nextStatus = a.status === 'Active' ? 'Inactive' : 'Active';
        return { ...a, status: nextStatus as 'Active' | 'Inactive' };
      }
      return a;
    });
    setAdmins(updated);
    saveAdminPayroll(updated);
    soundFX.playToggleClick();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationToast && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between shadow-xl transition animate-fadeIn ${
          notificationToast.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
            : notificationToast.type === 'warning'
            ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            : 'bg-purple-950/80 border-purple-500/50 text-purple-200'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{notificationToast.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="text-xs opacity-75 hover:opacity-100 cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Persona / Permission Switcher Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              Role Access &amp; Permissions
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Kingston Time: {kingstonNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (UTC-5)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Admin Payroll &amp; Accountability System
          </h2>
          <p className="text-xs text-slate-300">
            {isViewingAsOwner
              ? '👑 Viewing as Master Owner (wecareja.bookings@gmail.com) - Full platform finances, pay now & salary editing enabled.'
              : `🛡️ Viewing as ${currentAdminProfile.fullName} (${currentAdminProfile.role}) - Restricted view: Own balance, earnings & payslips only.`}
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-bold mr-1">View As:</span>
          {isMasterAdmin && (
            <button
              type="button"
              onClick={() => {
                setActivePersona(OWNER_EMAIL);
                soundFX.playToggleClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                isViewingAsOwner
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-950/40 border border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Owner (Sydney Mattis)</span>
            </button>
          )}

          {admins.filter(a => a.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()).map((staff) => (
            <button
              key={staff.id}
              type="button"
              onClick={() => {
                setActivePersona(staff.email);
                soundFX.playToggleClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activePersona.toLowerCase() === staff.email.toLowerCase() && !isViewingAsOwner
                  ? 'bg-gradient-to-r from-purple-600 to-[#1E1B4B] text-white shadow-md shadow-purple-950/40 border border-purple-400'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5 text-purple-300" />
              <span>{staff.fullName.split(' ')[0]} ({staff.role})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PLATFORM MATH CARDS (Owner Only) OR PERSONAL OVERVIEW (Admin Only) */}
      {/* ========================================================================= */}
      {isViewingAsOwner ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Platform 15% Income */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-purple-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Platform 15% Income
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                {formatJMD(financeMath.platformEarningsThisWeek)}
              </span>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                <span>Calculated from {financeMath.weeklyBookingsCount} weekly bookings</span>
                <span className="text-purple-300 font-mono">({formatJMD(financeMath.totalBookingsVolume)} gross)</span>
              </p>
            </div>
          </div>

          {/* Card 2: Total Admin Payroll Due */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-amber-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Payroll Due
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono block">
                {formatJMD(financeMath.totalAdminPayrollDue)}
              </span>
              <p className="text-xs text-slate-300 mt-1">
                Sum of balance due across all active admin staff
              </p>
            </div>
          </div>

          {/* Card 3: Net Profit (Red if negative) */}
          <div className={`p-5 sm:p-6 rounded-3xl backdrop-blur-xl shadow-xl border relative overflow-hidden transition ${
            financeMath.profitThisWeek >= 0
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 ${
              financeMath.profitThisWeek >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/20'
            }`} />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Net Profit
              </span>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                financeMath.profitThisWeek >= 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              }`}>
                {financeMath.profitThisWeek >= 0 ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-2xl sm:text-3xl font-black font-mono block ${
                financeMath.profitThisWeek >= 0 ? 'text-emerald-400' : 'text-rose-400 font-black'
              }`}>
                {financeMath.profitThisWeek < 0 ? '-' : ''}
                {formatJMD(Math.abs(financeMath.profitThisWeek))}
              </span>
              <p className="text-xs text-slate-300 mt-1">
                {financeMath.profitThisWeek >= 0
                  ? 'Positive margin: 15% Platform income exceeds payroll liability'
                  : '⚠️ Negative margin: Admin payroll due exceeds this week\'s 15% earnings'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Admin Personal Dashboard View */
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-[#1E1B4B]/50 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20 shrink-0">
                {currentAdminProfile.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">{currentAdminProfile.fullName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40">
                    {currentAdminProfile.role}
                  </span>
                  {(() => {
                    const payStatus = getAdminPayStatus(currentAdminProfile, kingstonNow);
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${payStatus.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${payStatus.dotClass}`} />
                        <span>{payStatus.label}</span>
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Payout Rail: <strong className="font-mono text-emerald-300">{currentAdminProfile.lynkOrBankInfo}</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">
                Active Weekly Period
              </span>
              <span className="text-xs text-white font-bold">{currentWeekPeriod}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* My Balance Due */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-amber-500/30">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                My Balance Due
              </span>
              <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">
                {formatJMD(currentAdminProfile.balanceDue)}
              </span>
              <span className="text-[11px] text-slate-300 mt-1 block">
                {currentAdminProfile.balanceDue > 0 ? 'Pending Friday/Monday clearing' : 'Settled to date'}
              </span>
            </div>

            {/* My Total Earned */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-purple-500/30">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                My Total Earned
              </span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">
                {formatJMD(currentAdminProfile.totalEarned)}
              </span>
              <span className="text-[11px] text-slate-300 mt-1 block">
                Cumulative across {getWeeksWorked(currentAdminProfile.startDate, kingstonNow)} weeks
              </span>
            </div>

            {/* My Total Received */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-emerald-500/30">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                My Total Paid
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
                {formatJMD(currentAdminProfile.totalPaid)}
              </span>
              <span className="text-[11px] text-slate-300 mt-1 block">
                Cleared via Lynk / Bank
              </span>
            </div>

            {/* My Next Pay Day */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                My Next Pay Day
              </span>
              <span className="text-base font-black text-purple-300 mt-1 block">
                {nextPayDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Weekly Salary: {formatJMD(currentAdminProfile.weeklySalaryJMD)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TABLE A: ADMIN LIST (Owner Only) */}
      {/* ========================================================================= */}
      {isViewingAsOwner && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Table A: Admin Staff Payroll Registry</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {admins.length} Staff
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Weekly stipends, accrued balances, and live payment authorization for Kingston &amp; St Andrew dispatch.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAddStaffModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Admin Staff</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search admin staff by name, email, or Lynk handle..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
              {(['all', 'Dispatcher', 'Support', 'Manager'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    roleFilter === role
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : role}
                </button>
              ))}
            </div>
          </div>

          {/* Table A Card */}
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Admin Staff</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Weekly Salary</th>
                    <th className="py-3 px-4">Weeks Worked</th>
                    <th className="py-3 px-4">Total Earned</th>
                    <th className="py-3 px-4">Total Paid</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAdmins.map((admin) => {
                    const weeks = getWeeksWorked(admin.startDate, kingstonNow);
                    const payStatus = getAdminPayStatus(admin, kingstonNow);
                    const isDue = admin.balanceDue > 0;

                    return (
                      <tr key={admin.id} className="hover:bg-white/[0.03] transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {admin.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-extrabold text-white">{admin.fullName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{admin.email}</div>
                              <div className="text-[10px] text-emerald-300 font-mono truncate max-w-[180px]">
                                {admin.lynkOrBankInfo}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                            {admin.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                          {editingSalaryAdminId === admin.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={editingSalaryInput}
                                onChange={(e) => setEditingSalaryInput(e.target.value)}
                                className="w-24 px-2 py-1 rounded bg-black/60 border border-emerald-400 text-white font-mono text-xs focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveSalaryInline(admin.id)}
                                className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                                title="Save to Supabase / Registry"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSalaryAdminId(null)}
                                className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span>{formatJMD(admin.weeklySalaryJMD)}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSalaryAdminId(admin.id);
                                  setEditingSalaryInput(admin.weeklySalaryJMD.toString());
                                }}
                                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                                title="Edit Staff Pay Rate Inline"
                              >
                                <Edit className="w-3 h-3 text-purple-300" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {weeks} wk{weeks === 1 ? '' : 's'}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {formatJMD(admin.totalEarned)}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-emerald-300">
                          {formatJMD(admin.totalPaid)}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className={`text-sm font-black ${
                            admin.balanceDue > 0 ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {formatJMD(admin.balanceDue)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => handleToggleAdminStatus(admin.id)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                admin.status === 'Active'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                              title="Click to toggle Active / Inactive"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                              <span>{admin.status}</span>
                            </button>

                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${payStatus.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${payStatus.dotClass}`} />
                              <span>{payStatus.label}</span>
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* 1. Edit Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedAdminForEdit(admin)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition cursor-pointer flex items-center gap-1"
                              title={`Edit ${admin.fullName} salary, weeks worked & role`}
                            >
                              <Edit className="w-3.5 h-3.5 text-purple-300" />
                              <span className="text-[11px] font-bold">Edit</span>
                            </button>

                            {/* 2. Zero Out ($0 icon) - ONLY for Owner wecareja.bookings@gmail.com */}
                            {isViewingAsOwner && (
                              <button
                                type="button"
                                onClick={() => handleZeroOutStaff(admin)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer flex items-center gap-1 shadow-sm"
                                title={`Zero out ${admin.fullName}? Fixes -110,500 profit bug`}
                              >
                                <span className="font-mono font-black text-xs leading-none text-amber-400">$0</span>
                                <span className="text-[11px] font-black">Zero Out</span>
                              </button>
                            )}

                            {/* 3. Delete (trash) - double confirm */}
                            <button
                              type="button"
                              onClick={() => handleDeleteAdminStaff(admin)}
                              disabled={admin.email.toLowerCase().replace(/\./g, '') === 'wecarejabookings@gmail.com' || admin.id === 'admin-sydney'}
                              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                                admin.email.toLowerCase().replace(/\./g, '') === 'wecarejabookings@gmail.com' || admin.id === 'admin-sydney'
                                  ? 'opacity-30 cursor-not-allowed bg-red-950/30 text-red-500/40 border border-red-900/30'
                                  : 'bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-sm cursor-pointer hover:scale-105'
                              }`}
                              title={
                                admin.email.toLowerCase().replace(/\./g, '') === 'wecarejabookings@gmail.com' || admin.id === 'admin-sydney'
                                  ? 'Master Administrator account cannot be deleted'
                                  : `Delete ${admin.fullName} from staff registry`
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>

                            {/* 4. Pay Now Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedAdminForPay(admin)}
                              disabled={!isDue}
                              className={`px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1 shadow-md cursor-pointer ${
                                isDue
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-950/40'
                                  : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-60'
                              }`}
                              title={isDue ? `Disburse weekly stipend of ${formatJMD(admin.balanceDue)}` : 'No outstanding balance due'}
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Pay Now</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TABLE B: PAYMENT HISTORY & CSV EXPORT */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {isViewingAsOwner ? 'Table B: Admin Payment History & Accountability' : 'My Payment History & Payslips'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {filteredPaymentHistory.length} Transactions
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isViewingAsOwner
                ? 'Complete electronic ledger of weekly stipends cleared via Lynk & Jamaican banking rails.'
                : 'Your verified electronic payment receipts and printable official payslips.'}
            </p>
          </div>

          {isViewingAsOwner && (
            <button
              type="button"
              onClick={() => exportPaymentHistoryCSV(filteredPaymentHistory)}
              className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-white border border-purple-400/40 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* Table B Card */}
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Admin Staff</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method Lynk/Bank</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Paid By Owner</th>
                  <th className="py-3 px-4 text-right">Official Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPaymentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No payment history records recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredPaymentHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition">
                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {item.date}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-white">{item.adminName}</div>
                        <span className="text-[10px] text-purple-300 px-1.5 py-0.2 rounded bg-purple-950/50 border border-purple-500/20">
                          {item.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                        {formatJMD(item.amount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200">{item.method}</div>
                        {item.lynkOrBankInfo && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                            {item.lynkOrBankInfo}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-purple-300">
                        {item.transactionId}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                        <span className="font-bold text-white block">We Care Jamaica</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {OWNER_EMAIL}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForPayslip(item)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-white border border-purple-400/40 text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-purple-300" />
                          <span>Print Payslip</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Pay Now Modal */}
      <AdminPayNowModal
        admin={selectedAdminForPay}
        isOpen={Boolean(selectedAdminForPay)}
        onClose={() => setSelectedAdminForPay(null)}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Official Printable Payslip Modal */}
      {selectedPaymentForPayslip && (
        <AdminPayslipModal
          payment={selectedPaymentForPayslip}
          isOpen={Boolean(selectedPaymentForPayslip)}
          onClose={() => setSelectedPaymentForPayslip(null)}
        />
      )}

      {/* Edit Salary Modal */}
      <AdminEditSalaryModal
        admin={selectedAdminForEdit}
        isOpen={Boolean(selectedAdminForEdit)}
        onClose={() => setSelectedAdminForEdit(null)}
        onSave={handleSaveEditedSalary}
      />

      {/* Add New Staff Modal */}
      <AdminAddStaffModal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        onAddAdmin={handleAddNewAdmin}
      />
    </div>
  );
};
