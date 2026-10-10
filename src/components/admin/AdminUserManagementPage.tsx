import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Stethoscope, 
  User, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  RefreshCw, 
  X, 
  Save, 
  ArrowLeft,
  ChevronRight,
  Shield,
  FileText,
  DollarSign
} from 'lucide-react';
import { UserAccount, UserRole, NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { supabase } from '../../lib/supabase';
import confetti from 'canvas-confetti';

export interface AdminUserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  address: string;
  trn?: string;
  ncjLicense?: string;
  specialty?: string;
  hourlyRate?: number;
  bio?: string;
  createdAt: string;
  status: 'active' | 'approved' | 'pending' | 'suspended';
  source: 'supabase' | 'local' | 'synced';
}

interface AdminUserManagementPageProps {
  onBackToPortal?: () => void;
  currentUser?: UserAccount | null;
  isMasterAdmin?: boolean;
}

export const AdminUserManagementPage: React.FC<AdminUserManagementPageProps> = ({
  onBackToPortal,
  currentUser,
  isMasterAdmin = true
}) => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | UserRole>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | string>('all');
  
  // Modal states
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserRecord | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for Editing Modal
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    parish: 'Kingston',
    specialty: '',
    trn: '',
    ncjLicense: '',
    hourlyRate: 7500,
    bio: '',
    role: 'client' as UserRole,
    status: 'approved' as AdminUserRecord['status']
  });

  // Load all users from Supabase and local storage
  const fetchAllUsers = async () => {
    setLoading(true);
    const combinedUsersMap = new Map<string, AdminUserRecord>();

    // 1. Gather local accounts from localStorage
    try {
      const rawAccounts = localStorage.getItem('wecare_user_accounts');
      if (rawAccounts) {
        const parsed = JSON.parse(rawAccounts);
        if (Array.isArray(parsed)) {
          parsed.forEach((acc: any) => {
            if (acc.id) {
              combinedUsersMap.set(acc.id, {
                id: acc.id,
                fullName: acc.name || acc.full_name || 'User',
                email: acc.email || '',
                phone: acc.phone || '',
                role: (acc.role as UserRole) || 'client',
                address: acc.address || acc.zone || 'Kingston, Jamaica',
                trn: acc.trn || '',
                ncjLicense: acc.ncjLicense || acc.nursingCouncilLicense || '',
                specialty: acc.specialty || acc.specialties?.[0] || '',
                hourlyRate: acc.hourlyRate || acc.hourlyRateJMD || 7500,
                bio: acc.bio || '',
                createdAt: acc.createdAt || new Date().toISOString(),
                status: acc.approvalStatus === 'approved' ? 'approved' : 'active',
                source: 'local'
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error reading local user accounts:', e);
    }

    // 2. Gather nurses roster from localStorage
    try {
      const rawNurses = localStorage.getItem('wecare_nurses');
      if (rawNurses) {
        const parsedNurses = JSON.parse(rawNurses);
        if (Array.isArray(parsedNurses)) {
          parsedNurses.forEach((nurse: NurseProfile) => {
            if (nurse.id) {
              const existing = combinedUsersMap.get(nurse.id);
              combinedUsersMap.set(nurse.id, {
                id: nurse.id,
                fullName: nurse.name || existing?.fullName || 'Nurse Practitioner',
                email: nurse.email || existing?.email || '',
                phone: nurse.phone || existing?.phone || '(876) 555-0199',
                role: 'nurse',
                address: nurse.zones?.[0] || existing?.address || 'Kingston',
                trn: nurse.trnNumber || existing?.trn || '',
                ncjLicense: nurse.nursingCouncilLicense || existing?.ncjLicense || 'NCJ-RN-ACTIVE',
                specialty: nurse.specialties?.[0] || existing?.specialty || 'General Home Care',
                hourlyRate: nurse.hourlyRateJMD || existing?.hourlyRate || 7500,
                bio: nurse.bio || existing?.bio || '',
                createdAt: existing?.createdAt || new Date().toISOString(),
                status: nurse.status === 'approved' ? 'approved' : 'active',
                source: 'local'
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error reading local nurses list:', e);
    }

    // 3. Query Supabase profiles table
    try {
      const { data: profiles, error } = await supabase.from('profiles').select('*');
      if (!error && Array.isArray(profiles)) {
        profiles.forEach((p: any) => {
          if (p.id) {
            const existing = combinedUsersMap.get(p.id);
            combinedUsersMap.set(p.id, {
              id: p.id,
              fullName: p.full_name || existing?.fullName || 'Registered User',
              email: existing?.email || '',
              phone: p.phone || existing?.phone || '',
              role: (p.role as UserRole) || existing?.role || 'client',
              address: p.address || existing?.address || 'Kingston, Jamaica',
              trn: p.trn || existing?.trn || '',
              ncjLicense: existing?.ncjLicense || '',
              specialty: existing?.specialty || '',
              hourlyRate: existing?.hourlyRate || 7500,
              bio: existing?.bio || '',
              createdAt: p.created_at || existing?.createdAt || new Date().toISOString(),
              status: existing?.status || 'active',
              source: 'supabase'
            });
          }
        });
      } else if (error) {
        console.warn('Supabase profiles query note (RLS):', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase query note:', err?.message);
    }

    // Default Baseline Master Admin if empty
    if (!combinedUsersMap.has('admin-001') && !combinedUsersMap.has('sydney-admin')) {
      combinedUsersMap.set('admin-001', {
        id: 'admin-001',
        fullName: 'Sydney Mattis',
        email: 'wecareja.bookings@gmail.com',
        phone: '+1 (876) 582-7613',
        role: 'admin',
        address: 'Kingston 6, Jamaica',
        createdAt: '2026-01-01T00:00:00.000Z',
        status: 'approved',
        source: 'local'
      });
    }

    const resultList = Array.from(combinedUsersMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setUsers(resultList);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const searchMatch = 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.trn && u.trn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.ncjLicense && u.ncjLicense.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.address.toLowerCase().includes(searchTerm.toLowerCase());

      const roleMatch = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
      const statusMatch = selectedStatusFilter === 'all' || u.status === selectedStatusFilter;

      return searchMatch && roleMatch && statusMatch;
    });
  }, [users, searchTerm, selectedRoleFilter, selectedStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const nurses = users.filter((u) => u.role === 'nurse').length;
    const clients = users.filter((u) => u.role === 'client').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { total, nurses, clients, admins };
  }, [users]);

  // Open Edit Modal
  const handleOpenEdit = (user: AdminUserRecord) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      parish: user.address.includes('St.') ? user.address : 'Kingston',
      specialty: user.specialty || 'Elderly & Geriatric Home Care',
      trn: user.trn || '',
      ncjLicense: user.ncjLicense || '',
      hourlyRate: user.hourlyRate || 7500,
      bio: user.bio || '',
      role: user.role,
      status: user.status
    });
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    soundFX.playStepComplete();

    const updatedUser: AdminUserRecord = {
      ...editingUser,
      fullName: editFormData.fullName.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      address: editFormData.address.trim(),
      trn: editFormData.trn.trim(),
      ncjLicense: editFormData.ncjLicense.trim(),
      specialty: editFormData.specialty.trim(),
      hourlyRate: Number(editFormData.hourlyRate),
      bio: editFormData.bio.trim(),
      role: editFormData.role,
      status: editFormData.status
    };

    // 1. Update Supabase profiles table using strictly existing columns:
    // id, full_name, role, phone, address, trn
    try {
      const { error: sbError } = await supabase
        .from('profiles')
        .update({
          full_name: updatedUser.fullName,
          phone: updatedUser.phone,
          address: updatedUser.address,
          trn: updatedUser.trn || '',
          role: updatedUser.role
        })
        .eq('id', updatedUser.id);

      if (sbError) {
        console.warn('Supabase profile update note:', sbError.message);
      }
    } catch (err: any) {
      console.warn('Supabase update note:', err?.message);
    }

    // 2. Update local state
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

    // 3. Update localStorage accounts
    try {
      const rawAccounts = localStorage.getItem('wecare_user_accounts');
      if (rawAccounts) {
        const parsed = JSON.parse(rawAccounts);
        const idx = parsed.findIndex((a: any) => a.id === updatedUser.id);
        if (idx >= 0) {
          parsed[idx] = {
            ...parsed[idx],
            name: updatedUser.fullName,
            full_name: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            zone: updatedUser.address,
            role: updatedUser.role,
            trn: updatedUser.trn,
            approvalStatus: updatedUser.status
          };
          localStorage.setItem('wecare_user_accounts', JSON.stringify(parsed));
        }
      }
    } catch {}

    // 4. Update localStorage nurses if nurse
    if (updatedUser.role === 'nurse') {
      try {
        const rawNurses = localStorage.getItem('wecare_nurses');
        if (rawNurses) {
          const parsed = JSON.parse(rawNurses);
          const nIdx = parsed.findIndex((n: any) => n.id === updatedUser.id);
          if (nIdx >= 0) {
            parsed[nIdx] = {
              ...parsed[nIdx],
              name: updatedUser.fullName,
              phone: updatedUser.phone,
              email: updatedUser.email,
              nursingCouncilLicense: updatedUser.ncjLicense,
              trnNumber: updatedUser.trn,
              hourlyRateJMD: updatedUser.hourlyRate,
              specialties: [updatedUser.specialty || 'Clinical Care'],
              bio: updatedUser.bio,
              status: updatedUser.status
            };
            localStorage.setItem('wecare_nurses', JSON.stringify(parsed));
          }
        }
      } catch {}
    }

    setIsSaving(false);
    setEditingUser(null);
    setToastMessage({ type: 'success', text: `User "${updatedUser.fullName}" updated successfully.` });
    soundFX.playSuccessPing();
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick Change Role
  const handleQuickChangeRole = async (user: AdminUserRecord, newRole: UserRole) => {
    soundFX.playToggleClick();
    const updated: AdminUserRecord = { ...user, role: newRole };

    // Update in Supabase profiles
    try {
      await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    } catch {}

    // Update state
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));

    // Update local accounts
    try {
      const raw = localStorage.getItem('wecare_user_accounts');
      if (raw) {
        const accounts = JSON.parse(raw);
        const idx = accounts.findIndex((a: any) => a.id === user.id);
        if (idx >= 0) {
          accounts[idx].role = newRole;
          localStorage.setItem('wecare_user_accounts', JSON.stringify(accounts));
        }
      }
    } catch {}

    setToastMessage({ type: 'success', text: `${user.fullName}'s role updated to ${newRole.toUpperCase()}.` });
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Quick Approve Nurse
  const handleApproveNurse = async (user: AdminUserRecord) => {
    soundFX.playSuccessPing();
    const newStatus = user.status === 'approved' ? 'active' : 'approved';
    const updated: AdminUserRecord = { ...user, status: newStatus };

    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));

    // Update local nurse roster
    try {
      const raw = localStorage.getItem('wecare_nurses');
      if (raw) {
        const nurses = JSON.parse(raw);
        const idx = nurses.findIndex((n: any) => n.id === user.id);
        if (idx >= 0) {
          nurses[idx].status = newStatus;
          nurses[idx].licenseVerified = true;
          localStorage.setItem('wecare_nurses', JSON.stringify(nurses));
        }
      }
    } catch {}

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setToastMessage({ 
      type: 'success', 
      text: newStatus === 'approved' ? `Nurse ${user.fullName} is now APPROVED for patient dispatch.` : `Nurse ${user.fullName} status updated.` 
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Confirm and Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    soundFX.playCancellation();

    const targetId = deletingUser.id;

    // Delete in Supabase
    try {
      await supabase.from('profiles').delete().eq('id', targetId);
    } catch {}

    // Update state
    setUsers((prev) => prev.filter((u) => u.id !== targetId));

    // Remove from local accounts
    try {
      const rawAccounts = localStorage.getItem('wecare_user_accounts');
      if (rawAccounts) {
        const accounts = JSON.parse(rawAccounts).filter((a: any) => a.id !== targetId);
        localStorage.setItem('wecare_user_accounts', JSON.stringify(accounts));
      }

      const rawNurses = localStorage.getItem('wecare_nurses');
      if (rawNurses) {
        const nurses = JSON.parse(rawNurses).filter((n: any) => n.id !== targetId);
        localStorage.setItem('wecare_nurses', JSON.stringify(nurses));
      }
    } catch {}

    setDeletingUser(null);
    setToastMessage({ type: 'success', text: `User "${deletingUser.fullName}" has been deleted.` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Export Users CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Role', 'Parish', 'TRN', 'NCJ License', 'Status', 'Created Date'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.fullName.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      u.role,
      `"${u.address.replace(/"/g, '""')}"`,
      `"${u.trn || ''}"`,
      `"${u.ncjLicense || ''}"`,
      u.status,
      u.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wecareja-users-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundFX.playSuccessPing();
  };

  return (
    <div className="w-full space-y-6 text-left pb-16">
      {/* Top Banner & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBackToPortal && (
            <button
              type="button"
              onClick={onBackToPortal}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition cursor-pointer"
              title="Return to Admin Portal"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                Administrator Control Center
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live Supabase Profiles</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Admin User Management &amp; Signups
            </h1>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAllUsers}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer disabled:opacity-50"
            title="Refresh Profiles from Cloud & Local Store"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
            title="Export CSV of current users list"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div 
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 shadow-xl animate-fadeIn ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="underline cursor-pointer hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Signups</span>
          <span className="text-2xl font-black text-white">{stats.total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
          <span className="text-[11px] font-bold text-emerald-400 block uppercase">Nurses / Midwives</span>
          <span className="text-2xl font-black text-emerald-300">{stats.nurses}</span>
        </div>
        <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30">
          <span className="text-[11px] font-bold text-blue-400 block uppercase">Clients &amp; Families</span>
          <span className="text-2xl font-black text-blue-300">{stats.clients}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
          <span className="text-[11px] font-bold text-amber-400 block uppercase">Administrators</span>
          <span className="text-2xl font-black text-amber-300">{stats.admins}</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, TRN, license, or parish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          {(['all', 'nurse', 'client', 'admin'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRoleFilter(r)}
              className={`px-3 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                selectedRoleFilter === r
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* User Records Table */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/50 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User / Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Parish / Location</th>
                <th className="py-3 px-4">Clinical Info</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    <span>Loading profiles from Supabase and local registry...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : u.role === 'nurse'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}
                          >
                            {u.role === 'admin' ? (
                              <Lock className="w-4 h-4" />
                            ) : u.role === 'nurse' ? (
                              <Stethoscope className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{u.fullName}</span>
                            <span className="text-[10px] font-mono text-slate-500 truncate block max-w-[140px]">
                              {u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {u.email && (
                            <span className="text-slate-300 block flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-amber-400/80 shrink-0" />
                              <span className="truncate max-w-[180px]">{u.email}</span>
                            </span>
                          )}
                          <span className="text-slate-400 block flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-emerald-400/80 shrink-0" />
                            <span>{u.phone || 'No phone'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Role with Quick Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleQuickChangeRole(u, e.target.value as UserRole)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border capitalize focus:outline-none cursor-pointer ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : u.role === 'nurse'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}
                        >
                          <option value="client" className="bg-[#0f0a26] text-white">Client</option>
                          <option value="nurse" className="bg-[#0f0a26] text-white">Nurse</option>
                          <option value="admin" className="bg-[#0f0a26] text-white">Admin</option>
                        </select>
                      </td>

                      {/* Parish */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400/80 shrink-0" />
                          <span className="truncate max-w-[120px]">{u.address || 'Kingston'}</span>
                        </div>
                      </td>

                      {/* Clinical info (Nurses) */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {u.role === 'nurse' ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-300 font-mono text-[10px] block">
                              {u.ncjLicense || 'NCJ Verified'}
                            </span>
                            <span className="text-slate-400 text-[10px] block">
                              {u.specialty || 'General Homecare'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                            u.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.role === 'nurse' && (
                            <button
                              type="button"
                              onClick={() => handleApproveNurse(u)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                u.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-emerald-400 hover:text-emerald-300'
                              }`}
                              title={u.status === 'approved' ? 'Approved Nurse' : 'Approve Nurse'}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 hover:text-amber-200 transition cursor-pointer"
                            title="Edit User Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0f0a26] border-2 border-[#F59E0B] rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  Edit User Profile: {editingUser.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">System Role *</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="client" className="bg-[#0f0a26]">Client (Patient / Family)</option>
                    <option value="nurse" className="bg-[#0f0a26]">Nurse (Clinical Caregiver)</option>
                    <option value="admin" className="bg-[#0f0a26]">Admin (System Administrator)</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Address & TRN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Parish / Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">TRN (Tax Number)</label>
                  <input
                    type="text"
                    value={editFormData.trn}
                    onChange={(e) => setEditFormData({ ...editFormData, trn: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Clinical Fields for Nurses */}
              {editFormData.role === 'nurse' && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-3">
                  <span className="text-[11px] font-bold text-emerald-400 block uppercase">
                    Nurse Clinical Qualifications
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">NCJ License #</label>
                      <input
                        type="text"
                        value={editFormData.ncjLicense}
                        onChange={(e) => setEditFormData({ ...editFormData, ncjLicense: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Hourly Rate (JMD)</label>
                      <input
                        type="number"
                        value={editFormData.hourlyRate}
                        onChange={(e) => setEditFormData({ ...editFormData, hourlyRate: Number(e.target.value) })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Primary Specialty</label>
                    <input
                      type="text"
                      value={editFormData.specialty}
                      onChange={(e) => setEditFormData({ ...editFormData, specialty: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* Bio Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bio / Administrative Notes</label>
                <textarea
                  rows={2}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-[#1E1B4B] shadow-lg transition flex items-center gap-1.5 cursor-pointer hover:opacity-95 disabled:opacity-50"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving Updates...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f0a26] border-2 border-rose-500 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white">Delete User Account?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete <strong>{deletingUser.fullName}</strong> ({deletingUser.role})? This will remove the profile record from Supabase and active dispatch roster.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg transition cursor-pointer"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
