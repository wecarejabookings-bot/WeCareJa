import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  X, 
  Filter, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Download,
  Printer,
  ChevronDown
} from 'lucide-react';
import { UserAccount, LogoVariation } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { AdminClientModal } from './AdminClientModal';
import { 
  Key,
  ShieldAlert,
  UserPlus,
  Edit
} from 'lucide-react';

interface UserAccountsManagerProps {
  userAccounts?: UserAccount[];
  onOpenExportModal?: () => void;
  logoVariation?: LogoVariation;
  onUpdateUserAccount?: (account: UserAccount) => void;
  onRegisterNewClient?: (account: UserAccount) => void;
  initialRoleFilter?: 'all' | 'client' | 'nurse' | 'admin';
}

export const UserAccountsManager: React.FC<UserAccountsManagerProps> = ({
  userAccounts = [],
  onOpenExportModal,
  onUpdateUserAccount,
  onRegisterNewClient,
  initialRoleFilter = 'all'
}) => {
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'client' | 'nurse' | 'admin'>(initialRoleFilter);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [createdAfterDate, setCreatedAfterDate] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserAccount | null>(null);

  // Client Modal States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForEdit, setClientForEdit] = useState<UserAccount | null>(null);

  // Filtering user accounts by Name, Date, or Status
  const filteredUsers = useMemo(() => {
    return (userAccounts || []).filter((u) => {
      // 1. Role Filter
      if (selectedRole !== 'all' && u.role !== selectedRole) {
        return false;
      }

      // 2. Status Filter
      if (selectedStatus !== 'all') {
        const uStatus = (u as any).status || 'active';
        if (uStatus !== selectedStatus) return false;
      }

      // 3. Date Filter (Created / Join Date)
      if (createdAfterDate) {
        const uDate = u.createdAt || (u as any).joinDate || '';
        if (uDate && uDate < createdAfterDate) {
          return false;
        }
      }

      // 4. Name / Keyword Search
      if (!query.trim()) return true;

      const q = query.toLowerCase().trim();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').toLowerCase().includes(q);
      const matchZone = (u.zone || '').toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);

      return matchName || matchEmail || matchPhone || matchZone || matchRole || matchId;
    });
  }, [userAccounts, query, selectedRole, selectedStatus, createdAfterDate]);

  const handleClear = () => {
    soundFX.playSuccessPing();
    setQuery('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setCreatedAfterDate('');
  };

  const hasActiveFilters = !!query.trim() || selectedRole !== 'all' || selectedStatus !== 'all' || !!createdAfterDate;

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-5 text-white">
      {/* Header with Title and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C77DFF]" />
            <h3 className="text-base font-bold text-white">User Accounts &amp; Access Directory</h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
              {(userAccounts || []).length} Total Registered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search and filter registered Jamaican clients, care practitioners, and admin staff by name, registration date, or verification status.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setClientForEdit(null);
              setIsClientModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-black shadow-md shadow-emerald-950/40 flex items-center gap-1.5 shrink-0 cursor-pointer transition border border-emerald-400/30"
            title="Register new Jamaican client with residential address, gate access code and emergency contact"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New Client</span>
          </button>

          {onOpenExportModal && (
            <button
              type="button"
              onClick={onOpenExportModal}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Name & Keyword Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search user accounts by name, email, phone (+876), parish zone, or ID..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-slate-500 text-xs focus:border-purple-400 outline-none transition shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Registration Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 whitespace-nowrap hidden sm:inline">Registered After:</span>
            <input
              type="date"
              value={createdAfterDate}
              onChange={(e) => {
                soundFX.playFilterSelect();
                setCreatedAfterDate(e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-purple-400 outline-none transition cursor-pointer font-mono"
              title="Filter accounts registered after date"
            />
            {createdAfterDate && (
              <button
                type="button"
                onClick={() => setCreatedAfterDate('')}
                className="text-slate-400 hover:text-white p-1 text-xs"
                title="Clear date filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Status and Role Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
          {/* Role Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold">Role:</span>
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'client', label: '👤 Clients' },
              { id: 'nurse', label: '🩺 Nurses' },
              { id: 'admin', label: '🛡️ Admins' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  soundFX.playFilterSelect();
                  setSelectedRole(r.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedRole === r.id
                    ? 'bg-purple-600 text-white border border-purple-400/50 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: '✓ Active' },
              { id: 'pending', label: '⏳ Pending' },
              { id: 'suspended', label: '✕ Suspended' }
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  soundFX.playFilterSelect();
                  setSelectedStatus(s.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedStatus === s.id
                    ? 'bg-emerald-600/50 text-emerald-200 border border-emerald-400/50 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <span className="font-mono text-slate-400 text-[11px] ml-auto">
            Showing <strong className="text-purple-300">{filteredUsers.length}</strong> of {userAccounts.length}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-slate-300 border-b border-white/10">
            <tr>
              <th className="p-3.5 font-bold">User</th>
              <th className="p-3.5 font-bold">Role</th>
              <th className="p-3.5 font-bold">Contact Info</th>
              <th className="p-3.5 font-bold">Zone / Address</th>
              <th className="p-3.5 font-bold">Registered Date</th>
              <th className="p-3.5 font-bold">Status</th>
              <th className="p-3.5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No user accounts match your search filters. Try clearing filters or searching for another name or phone number.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isNurse = user.role === 'nurse';
                const isAdmin = user.role === 'admin';
                const isClient = user.role === 'client';
                const status = (user as any).status || 'active';

                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-200 flex items-center justify-center font-bold text-xs border border-purple-400/30">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-white block font-medium">{user.name}</strong>
                          <span className="font-mono text-[10px] text-slate-400">ID: {user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isAdmin 
                          ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                          : isNurse 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px]">{user.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono text-[11px]">{user.phone || '—'}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{user.zone || 'Kingston & St Andrew'}</span>
                      </div>
                      {user.address && (
                        <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                          {user.address}
                        </span>
                      )}
                      {user.gateCode && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-300 font-mono mt-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 max-w-fit">
                          <Key className="w-2.5 h-2.5 text-amber-400" />
                          <span>Gate: {user.gateCode}</span>
                        </div>
                      )}
                      {user.emergencyContact && (
                        <div className="text-[10px] text-slate-300 flex items-center gap-1 mt-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 max-w-fit">
                          <ShieldAlert className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{user.emergencyContact.name} ({user.emergencyContact.relation})</span>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-slate-300">
                      {user.createdAt || (user as any).joinDate || '2025-01-15'}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                        status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isClient && (
                          <button
                            type="button"
                            onClick={() => {
                              setClientForEdit(user);
                              setIsClientModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white text-[11px] font-bold transition border border-purple-400/30 flex items-center gap-1 cursor-pointer"
                            title="Edit Client Address, Gate Code & Emergency Contacts"
                          >
                            <Edit className="w-3 h-3 text-purple-300" />
                            <span>Edit</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedUserDetail(user)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-purple-200 hover:text-white text-[11px] font-bold transition border border-white/10 cursor-pointer"
                        >
                          Inspect
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

      {/* User Detail Inspect Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#170624] border border-white/15 p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-purple-600/30 text-purple-200 border border-purple-400/40 flex items-center justify-center font-bold">
                  {selectedUserDetail.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">{selectedUserDetail.name}</h4>
                  <span className="text-xs font-mono text-purple-300">Role: {selectedUserDetail.role.toUpperCase()}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                <div>
                  <span className="text-slate-400 block text-[10px]">Email Address</span>
                  <strong className="text-white">{selectedUserDetail.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone Number</span>
                  <strong className="text-white font-mono">{selectedUserDetail.phone || '—'}</strong>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[10px]">Parish Zone</span>
                  <strong className="text-white">{selectedUserDetail.zone || 'Kingston & St Andrew'}</strong>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[10px]">Account ID</span>
                  <strong className="text-purple-300 font-mono text-[10px]">{selectedUserDetail.id}</strong>
                </div>
              </div>

              {selectedUserDetail.emergencyContact && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-bold text-amber-300 uppercase block tracking-wider">Emergency Contact</span>
                  <div className="flex items-center justify-between mt-1 text-slate-200">
                    <span>{selectedUserDetail.emergencyContact.name} ({selectedUserDetail.emergencyContact.relation})</span>
                    <span className="font-mono text-amber-200">{selectedUserDetail.emergencyContact.phone}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Register & Edit Client Modal */}
      <AdminClientModal
        isOpen={isClientModalOpen}
        client={clientForEdit}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientForEdit(null);
        }}
        onSave={(data) => {
          if (clientForEdit) {
            const updated: UserAccount = {
              ...clientForEdit,
              ...data
            } as UserAccount;
            if (onUpdateUserAccount) {
              onUpdateUserAccount(updated);
            }
          } else {
            const newClient: UserAccount = {
              id: `user-client-${Date.now().toString().slice(-4)}`,
              username: `client_${(data.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              role: 'client',
              approvalStatus: 'approved',
              name: data.name || 'New Client',
              email: data.email || '',
              phone: data.phone || '',
              address: data.address || '',
              gateCode: data.gateCode || '',
              zone: data.zone || 'Kingston & St Andrew',
              createdAt: new Date().toISOString().split('T')[0],
              emergencyContact: data.emergencyContact,
              ...data
            } as UserAccount;
            if (onRegisterNewClient) {
              onRegisterNewClient(newClient);
            } else if (onUpdateUserAccount) {
              onUpdateUserAccount(newClient);
            }
          }
          setIsClientModalOpen(false);
          setClientForEdit(null);
        }}
      />
    </div>
  );
};
