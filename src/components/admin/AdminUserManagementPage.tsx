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
  DollarSign,
  Sparkles,
  Eye
} from 'lucide-react';
import { UserAccount, UserRole, NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { supabase } from '../../lib/supabase';
import { AdminTopicsDirectoryManager } from './AdminTopicsDirectoryManager';
import { AdminApplicantInspectionModal } from './AdminApplicantInspectionModal';
import { getDisplayName } from '../../utils/privacy';
import confetti from 'canvas-confetti';

export interface AdminUserRecord {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  phone: string;
  role: UserRole;
  address: string;
  trn?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  repName?: string;
  repPhone?: string;
  repRelation?: string;
  knownIllnesses?: string[];
  allergies?: string[];
  medications?: string[];
  doctorName?: string;
  doctorPhone?: string;
  photoUrl?: string;
  repPhotoUrl?: string;
  isBookingOnBehalf?: boolean;
  department?: string;
  title?: string;
  driversLicenseNumber?: string;
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
  
  // High-visibility Admin Section Tab: 'users' vs 'topics' (Manage Topics Directory #01-#10)
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'topics'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      const s = window.location.search.toLowerCase();
      if (p.includes('topic') || h.includes('topic') || s.includes('topic')) {
        return 'topics';
      }
    }
    return 'users';
  });
  
  // Modal states
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserRecord | null>(null);
  const [inspectingApplicant, setInspectingApplicant] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for Editing Modal
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    parish: 'Kingston',
    trn: '',
    dateOfBirth: '',
    gender: 'female',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    repName: '',
    repPhone: '',
    repRelation: '',
    knownIllness: 'Hypertension',
    customIllness: '',
    allergies: '',
    medications: '',
    doctorName: '',
    doctorPhone: '',
    department: 'Clinical Operations',
    title: 'Administrator',
    specialty: '',
    ncjLicense: '',
    hourlyRate: 7500,
    driversLicenseNumber: '',
    bio: '',
    role: 'client' as UserRole,
    status: 'approved' as AdminUserRecord['status']
  });

  // Load all users ONLY from Supabase profiles table
  const fetchAllUsers = async () => {
    setLoading(true);

    try {
      // Purge any stale mock accounts from localStorage
      try {
        localStorage.removeItem('wecare_user_accounts');
      } catch {}

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching profiles from Supabase:', error);
        setToastMessage({ type: 'error', text: `Failed to load profiles: ${error.message}` });
        setLoading(false);
        return;
      }

      if (Array.isArray(profiles)) {
        const mappedUsers: AdminUserRecord[] = profiles
          .filter((p: any) => p && p.id && p.id !== 'admin-001' && p.id !== 'user-admin-01')
          .map((p: any) => {
            // Treat 'master_admin' as Admin so Sydney 2e9a3a25... shows as Admin not Client
            const isMasterAdmin = 
              p.role === 'master_admin' || 
              p.username === 'sydney' || 
              p.id === '2e9a3a25-3404-47ed-a8f4-b0a7ecab3ba7';

            const resolvedRole: UserRole = isMasterAdmin 
              ? 'admin' 
              : (p.role === 'admin' ? 'admin' : (p.role === 'nurse' ? 'nurse' : 'client'));

            const displayName = 
              p.full_name || 
              p.username || 
              (p.email ? p.email.split('@')[0] : '') || 
              (isMasterAdmin ? 'Lead Administrator' : 'Registered User');

            return {
              id: p.id,
              fullName: displayName,
              username: p.username || (p.email ? p.email.split('@')[0] : (isMasterAdmin ? 'admin' : 'user')),
              email: p.email || (isMasterAdmin ? 'wecareja.bookings@gmail.com' : ''),
              phone: p.phone || (isMasterAdmin ? '+1876582-7613' : ''),
              role: resolvedRole,
              address: p.address || (isMasterAdmin ? 'Kingston, Jamaica' : 'Kingston, Jamaica'),
              trn: p.trn || '',
              department: isMasterAdmin ? 'Executive Clinical Leadership & Registry Audit' : (resolvedRole === 'admin' ? 'Administration' : undefined),
              title: isMasterAdmin ? 'Lead Operations Director & Master Administrator' : (resolvedRole === 'admin' ? 'System Administrator' : (resolvedRole === 'nurse' ? 'Licensed Nurse Practitioner' : 'Registered Client')),
              status: 'approved',
              source: 'supabase',
              createdAt: p.created_at || new Date().toISOString()
            };
          });

        // Merge any accounts from localStorage wecare_user_accounts
        try {
          const rawLocal = localStorage.getItem('wecare_user_accounts');
          if (rawLocal) {
            const parsed = JSON.parse(rawLocal);
            if (Array.isArray(parsed)) {
              for (const lu of parsed) {
                if (!lu || !lu.id) continue;
                const exists = mappedUsers.some(mu => mu.id === lu.id || (lu.email && mu.email.toLowerCase() === lu.email.toLowerCase()));
                if (!exists) {
                  mappedUsers.push({
                    id: lu.id,
                    fullName: lu.full_name || lu.name || 'User',
                    username: lu.username || (lu.email ? lu.email.split('@')[0] : 'user'),
                    email: lu.email || '',
                    phone: lu.phone || '',
                    role: lu.role || 'client',
                    address: lu.address || lu.zone || 'Kingston, Jamaica',
                    trn: lu.trn || '',
                    department: lu.department,
                    title: lu.title || (lu.role === 'admin' ? 'Administrator' : lu.role === 'nurse' ? 'Licensed Nurse' : 'Client'),
                    status: 'approved',
                    source: 'local',
                    createdAt: lu.createdAt || new Date().toISOString()
                  });
                }
              }
            }
          }
        } catch {}

        setUsers(mappedUsers);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Unexpected error querying Supabase profiles:', err);
      setToastMessage({ type: 'error', text: 'Error retrieving user records from Supabase' });
    } finally {
      setLoading(false);
    }
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
    setEditFormData(prev => ({
      ...prev,
      fullName: user.fullName || '',
      username: (user as any).username || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      parish: user.address?.includes('St.') ? user.address : 'Kingston',
      specialty: user.specialty || 'Elderly & Geriatric Home Care',
      trn: user.trn || '',
      ncjLicense: user.ncjLicense || '',
      hourlyRate: user.hourlyRate || 7500,
      bio: user.bio || '',
      role: user.role,
      status: user.status
    }));
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    soundFX.playStepComplete();

    const illnesses = [
      editFormData.knownIllness !== 'Other' ? editFormData.knownIllness : '',
      editFormData.customIllness.trim()
    ].filter(Boolean);

    const updatedUser: AdminUserRecord = {
      ...editingUser,
      fullName: editFormData.fullName.trim(),
      username: editFormData.username.trim() || editFormData.email.split('@')[0],
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      address: editFormData.address.trim(),
      trn: editFormData.trn.trim(),
      dateOfBirth: editFormData.dateOfBirth,
      gender: editFormData.gender,
      emergencyContactName: editFormData.emergencyContactName.trim(),
      emergencyContactPhone: editFormData.emergencyContactPhone.trim(),
      emergencyContactRelation: editFormData.emergencyContactRelation.trim(),
      repName: editFormData.repName.trim(),
      repPhone: editFormData.repPhone.trim(),
      repRelation: editFormData.repRelation.trim(),
      knownIllnesses: illnesses,
      allergies: editFormData.allergies.split(',').map(s => s.trim()).filter(Boolean),
      medications: editFormData.medications.split(',').map(s => s.trim()).filter(Boolean),
      doctorName: editFormData.doctorName.trim(),
      doctorPhone: editFormData.doctorPhone.trim(),
      department: editFormData.department.trim(),
      title: editFormData.title.trim(),
      ncjLicense: editFormData.ncjLicense.trim(),
      driversLicenseNumber: editFormData.driversLicenseNumber.trim(),
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
            username: updatedUser.username,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            zone: updatedUser.address,
            role: updatedUser.role,
            trn: updatedUser.trn,
            approvalStatus: updatedUser.status,
            emergencyContact: {
              name: updatedUser.emergencyContactName || '',
              phone: updatedUser.emergencyContactPhone || '',
              relation: updatedUser.emergencyContactRelation || 'Next of Kin'
            },
            patientBioData: {
              ...(parsed[idx].patientBioData || {}),
              dateOfBirth: updatedUser.dateOfBirth,
              gender: updatedUser.gender as any,
              knownIllnesses: updatedUser.knownIllnesses || [],
              allergies: updatedUser.allergies || []
            },
            accountHolder: updatedUser.repName ? {
              name: updatedUser.repName,
              phone: updatedUser.repPhone || '',
              email: '',
              country: 'Jamaica',
              billingAddress: updatedUser.address,
              relationshipToPatient: updatedUser.repRelation || 'Authorized Representative'
            } : parsed[idx].accountHolder,
            department: updatedUser.department,
            title: updatedUser.title
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
    setToastMessage({ type: 'success', text: `User "${getDisplayName(updatedUser, currentUser)}" updated successfully.` });
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

    setToastMessage({ type: 'success', text: `${getDisplayName(user, currentUser)}'s role updated to ${newRole.toUpperCase()}.` });
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
      text: newStatus === 'approved' ? `Nurse ${getDisplayName(user, currentUser)} is now APPROVED for patient dispatch.` : `Nurse ${getDisplayName(user, currentUser)} status updated.` 
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
    setToastMessage({ type: 'success', text: `User "${getDisplayName(deletingUser, currentUser)}" has been deleted.` });
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

  // Inspect Applicant's Signed Agreement & Statutory Documents (DL, TRN, NCJ)
  const openInspectApplicant = (u: AdminUserRecord) => {
    let dossier: any = {};
    try {
      const cleanEmail = (u.email || '').toLowerCase().trim();
      const d1 = cleanEmail ? localStorage.getItem(`wecare_dossier_${cleanEmail}`) : null;
      const d2 = u.id ? localStorage.getItem(`wecare_dossier_${u.id}`) : null;
      if (d1) dossier = { ...dossier, ...JSON.parse(d1) };
      if (d2) dossier = { ...dossier, ...JSON.parse(d2) };
    } catch {}

    // Check if TRN encodes DOSSIER payload
    if (u.trn && typeof u.trn === 'string' && u.trn.includes('DOSSIER:')) {
      try {
        const jsonPart = u.trn.split('DOSSIER:')[1].trim();
        const parsed = JSON.parse(jsonPart);
        dossier = { ...dossier, ...parsed };
      } catch {}
    }

    // Check local nurse registry
    let localNurse: any = {};
    try {
      const rawNurses = localStorage.getItem('wecare_nurses');
      if (rawNurses) {
        const parsed = JSON.parse(rawNurses);
        const found = parsed.find((n: any) => n.id === u.id || (n.email && u.email && n.email.toLowerCase() === u.email.toLowerCase()));
        if (found) localNurse = found;
      }
    } catch {}

    const merged = {
      id: u.id,
      full_name: u.fullName,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      address: u.address,
      trn: u.trn,
      status: u.status,
      created_at: u.createdAt,
      dateOfBirth: u.dateOfBirth || dossier.dateOfBirth || localNurse.dateOfBirth,
      parish: u.address || dossier.parish || localNurse.parish || 'Kingston',
      driversLicenseNumber: u.driversLicenseNumber || dossier.driversLicenseNumber || localNurse.driversLicenseNumber,
      ncjLicense: u.ncjLicense || dossier.ncjLicense || localNurse.ncjLicense,
      emergencyContactName: u.emergencyContactName || dossier.emergencyContactName,
      emergencyContactPhone: u.emergencyContactPhone || dossier.emergencyContactPhone,
      emergencyContactRelation: u.emergencyContactRelation || dossier.emergencyContactRelation,
      bankName: dossier.bankName || (u as any).bankName,
      accountNumber: dossier.accountNumber || (u as any).accountNumber,
      accountType: dossier.accountType || (u as any).accountType,
      bankBranch: dossier.bankBranch || (u as any).bankBranch,
      photoUrl: u.photoUrl || dossier.photoUrl || localNurse.photoUrl,
      driversLicenseFrontUrl: dossier.driversLicenseFrontUrl || localNurse.driversLicenseFrontUrl || (u as any).driversLicenseFrontUrl,
      driversLicenseBackUrl: dossier.driversLicenseBackUrl || localNurse.driversLicenseBackUrl || (u as any).driversLicenseBackUrl,
      trnCertificateUrl: dossier.trnCertificateUrl || localNurse.trnCertificateUrl || (u as any).trnCertificateUrl,
      licenseDocumentUrl: dossier.licenseDocumentUrl || localNurse.licenseDocumentUrl || localNurse.governmentIdUrl || (u as any).licenseDocumentUrl,
      policeRecordUrl: dossier.policeRecordUrl || localNurse.policeRecordUrl || (u as any).policeRecordUrl,
      bankLetterUrl: dossier.bankLetterUrl || localNurse.bankLetterUrl || (u as any).bankLetterUrl,
      proofOfAddressUrl: dossier.proofOfAddressUrl || localNurse.proofOfAddressUrl || (u as any).proofOfAddressUrl,
      contractAccepted: dossier.contractAccepted !== undefined ? dossier.contractAccepted : true,
      agreementAccepted: dossier.agreementAccepted !== undefined ? dossier.agreementAccepted : true,
      signatureName: dossier.signatureName || u.fullName,
      signatureDate: dossier.signatureDate || u.createdAt
    };

    setInspectingApplicant(merged);
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
          {/* Manage Topics Directory Quick Tab Button */}
          <button
            type="button"
            onClick={() => setActiveAdminTab(activeAdminTab === 'topics' ? 'users' : 'topics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 border cursor-pointer shadow-md ${
              activeAdminTab === 'topics'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-950/40'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white border-blue-400/40 shadow-blue-950/40'
            }`}
            title="Manage 10 Interactive Homepage Topics (#01-#10) & App CMS"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeAdminTab === 'topics' ? '← Back to Users Directory' : 'Manage Topics Directory'}</span>
          </button>

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

      {/* High-Visibility Admin Navigation Tabs: Users Directory vs Topics Directory CMS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md shadow-lg">
        <button
          type="button"
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeAdminTab === 'users'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 font-black border border-blue-400/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4 text-blue-300" />
          <span>User Accounts Directory ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('topics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeAdminTab === 'topics'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/50 font-black border border-blue-400/40'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Manage Topics Directory (#01–#10)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
            Homepage CMS
          </span>
        </button>
      </div>

      {activeAdminTab === 'topics' ? (
        <AdminTopicsDirectoryManager currentUser={currentUser} />
      ) : (
        <>

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
                            <span className="font-bold text-white block">{getDisplayName(u, currentUser)}</span>
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
                          {/* Inspect Documents & Agreement Button */}
                          <button
                            type="button"
                            onClick={() => openInspectApplicant(u)}
                            className="px-2 py-1 rounded-lg bg-[#1A1E4E] hover:bg-[#2A2E6E] border border-amber-400/40 text-amber-300 hover:text-white transition cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Inspect Driver's License, TRN, NCJ License, and Signed Agreement"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-300" />
                            <span className="text-[10px] font-bold">Inspect Docs</span>
                          </button>

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
                  Edit User Profile: {getDisplayName(editingUser, currentUser)}
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
              {/* Name, Username & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
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

              {/* Date of Birth & Gender (For all users) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.dateOfBirth}
                    onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Gender</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="female" className="bg-[#0f0a26]">Female</option>
                    <option value="male" className="bg-[#0f0a26]">Male</option>
                    <option value="other" className="bg-[#0f0a26]">Other</option>
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

              {/* CLIENT SPECIFIC: Next of Kin, Authorized Representative & Health Profile */}
              {editFormData.role === 'client' && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-3.5">
                  <span className="text-[11px] font-bold text-purple-300 block uppercase">
                    Next of Kin, Care Representative &amp; Health Conditions
                  </span>
                  
                  {/* Next of Kin */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Emergency Contact / Next of Kin</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Next of Kin Name"
                        value={editFormData.emergencyContactName}
                        onChange={(e) => setEditFormData({ ...editFormData, emergencyContactName: e.target.value })}
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={editFormData.emergencyContactPhone}
                        onChange={(e) => setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })}
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Relationship (e.g. Spouse)"
                        value={editFormData.emergencyContactRelation}
                        onChange={(e) => setEditFormData({ ...editFormData, emergencyContactRelation: e.target.value })}
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Person using app on behalf */}
                  <div className="space-y-1.5 pt-1 border-t border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Authorized Representative (Using App on Behalf)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Representative Name"
                        value={editFormData.repName}
                        onChange={(e) => setEditFormData({ ...editFormData, repName: e.target.value })}
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="tel"
                        placeholder="Representative Phone"
                        value={editFormData.repPhone}
                        onChange={(e) => setEditFormData({ ...editFormData, repPhone: e.target.value })}
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Relationship (e.g. Daughter)"
                        value={editFormData.repRelation}
                        onChange={(e) => setEditFormData({ ...editFormData, repRelation: e.target.value })}
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Illness Dropdown + Other Box */}
                  <div className="space-y-1.5 pt-1 border-t border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Primary Illness / Medical Conditions</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <select
                          value={editFormData.knownIllness}
                          onChange={(e) => setEditFormData({ ...editFormData, knownIllness: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                        >
                          <option value="Hypertension" className="bg-[#150722]">Hypertension (High Blood Pressure)</option>
                          <option value="Diabetes Type 2" className="bg-[#150722]">Diabetes Type 2</option>
                          <option value="Alzheimer's / Dementia" className="bg-[#150722]">Alzheimer's / Dementia</option>
                          <option value="Arthritis" className="bg-[#150722]">Arthritis / Mobility Limitation</option>
                          <option value="Post-Op Recovery" className="bg-[#150722]">Post-Op Surgical Recovery</option>
                          <option value="Stroke Recovery" className="bg-[#150722]">Stroke Recovery</option>
                          <option value="Chronic Kidney Disease" className="bg-[#150722]">Chronic Kidney Disease</option>
                          <option value="None" className="bg-[#150722]">None / General Wellness</option>
                          <option value="Other" className="bg-[#150722]">Other (Specify Beside)</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="If Other, write illness or condition..."
                          value={editFormData.customIllness}
                          onChange={(e) => setEditFormData({ ...editFormData, customIllness: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN SPECIFIC FIELDS */}
              {editFormData.role === 'admin' && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-3">
                  <span className="text-[11px] font-bold text-amber-400 block uppercase">
                    Administrator Position &amp; Department
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Administrative Title</label>
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Department</label>
                      <input
                        type="text"
                        value={editFormData.department}
                        onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

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
              Are you sure you want to delete <strong>{getDisplayName(deletingUser, currentUser)}</strong> ({deletingUser.role})? This will remove the profile record from Supabase and active dispatch roster.
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

      {/* Statutory Document & Agreement Inspection Modal */}
      {inspectingApplicant && (
        <AdminApplicantInspectionModal
          applicant={inspectingApplicant}
          onClose={() => setInspectingApplicant(null)}
          onApprove={async (app) => {
            const targetUser = users.find(x => x.id === app.id || x.email === app.email);
            if (targetUser) {
              await handleApproveNurse(targetUser);
            }
            setInspectingApplicant(null);
            setToastMessage({ type: 'success', text: `Applicant "${app.full_name || app.fullName}" approved & authorized!` });
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onReject={async (app) => {
            try {
              if (supabase) {
                await supabase.from('profiles').update({ status: 'suspended' }).eq('id', app.id);
              }
            } catch {}
            setUsers(prev => prev.map(u => u.id === app.id ? { ...u, status: 'suspended' } : u));
            setInspectingApplicant(null);
            soundFX.playPop();
            setToastMessage({ type: 'error', text: `Applicant rejected and suspended.` });
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onGoToManageUsers={(app) => {
            setInspectingApplicant(null);
            const targetUser = users.find(x => x.id === app.id || x.email === app.email);
            if (targetUser) {
              handleOpenEdit(targetUser);
            }
          }}
        />
      )}
        </>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
