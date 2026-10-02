import React, { useState, useMemo, useRef } from 'react';
import { Booking, NurseProfile, UserAccount, PayoutRecord, UserRole } from '../../types';
import { 
  generateCSV, 
  generateTSV, 
  triggerFileDownload, 
  copyToClipboard, 
  saveExportArchive, 
  getExportArchives, 
  deleteExportArchive, 
  clearAllExportArchives,
  exportFullJsonStorageBackup,
  ExportArchiveItem
} from '../../utils/exportUtils';
import { 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Archive, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  X, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  Layers, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Activity, 
  AlertCircle,
  Database,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type ExportEntityType = 'bookings' | 'nurses' | 'users' | 'payouts';

interface DataExportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole; // 'admin' | 'nurse' | 'client'
  currentNurse?: NurseProfile;
  bookings: Booking[];
  nurses: NurseProfile[];
  userAccounts?: UserAccount[];
  payouts?: PayoutRecord[];
  initialEntity?: ExportEntityType;
}

export const DataExportPrintModal: React.FC<DataExportPrintModalProps> = ({
  isOpen,
  onClose,
  userRole,
  currentNurse,
  bookings,
  nurses,
  userAccounts = [],
  payouts = [],
  initialEntity = 'bookings'
}) => {
  // Navigation tabs inside modal
  const [modalTab, setModalTab] = useState<'studio' | 'print_view' | 'archives'>('studio');
  const [selectedEntity, setSelectedEntity] = useState<ExportEntityType>(initialEntity);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days'>('all');

  // Copy status
  const [copiedFormat, setCopiedFormat] = useState<'csv' | 'tsv' | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Storage archives
  const [archives, setArchives] = useState<ExportArchiveItem[]>(() => getExportArchives());

  // Printable container ref
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Entity configuration definitions
  const entityOptions: { id: ExportEntityType; label: string; icon: React.FC<{ className?: string }>; description: string }[] = useMemo(() => {
    if (userRole === 'nurse') {
      return [
        { id: 'bookings', label: 'My Care Visits', icon: Activity, description: 'Visits and patient bookings assigned to you' },
        { id: 'nurses', label: 'Peer Nurse Network', icon: Users, description: 'Verified Jamaican caregiver network roster' },
        { id: 'payouts', label: 'My Payout Records', icon: DollarSign, description: 'Weekly 85% settlement clearing slips' }
      ];
    }
    return [
      { id: 'bookings', label: 'All Care Bookings', icon: Activity, description: 'Master log of bookings, visits & clinical care' },
      { id: 'nurses', label: 'Licensed Nurses', icon: Users, description: 'Verified NCJ nurses and active dispatch roster' },
      { id: 'users', label: 'User Accounts', icon: Database, description: 'Clients, patients, caregivers & staff accounts' },
      { id: 'payouts', label: 'Payout Clearing', icon: DollarSign, description: 'Weekly caregiver payment settlement history' }
    ];
  }, [userRole]);

  // Column definitions per entity
  const columnsConfig: Record<ExportEntityType, { id: string; label: string; defaultSelected: boolean }[]> = useMemo(() => ({
    bookings: [
      { id: 'id', label: 'Booking ID', defaultSelected: true },
      { id: 'scheduledDateTime', label: 'Scheduled Date & Time', defaultSelected: true },
      { id: 'serviceName', label: 'Service Care Type', defaultSelected: true },
      { id: 'clientName', label: 'Patient / Client Name', defaultSelected: true },
      { id: 'clientPhone', label: 'Client Contact Number', defaultSelected: true },
      { id: 'clientAddress', label: 'Address & Street', defaultSelected: false },
      { id: 'zone', label: 'Parish / Zone', defaultSelected: true },
      { id: 'nurseName', label: 'Assigned Nurse', defaultSelected: true },
      { id: 'status', label: 'Booking Status', defaultSelected: true },
      { id: 'duration', label: 'Care Duration (Mins)', defaultSelected: true },
      { id: 'priceJMD', label: 'Total Price (JMD)', defaultSelected: true },
      { id: 'nurseEarningsJMD', label: 'Nurse 85% Split (JMD)', defaultSelected: true },
      { id: 'platformFeeJMD', label: 'We Care 15% Fee (JMD)', defaultSelected: userRole === 'admin' },
      { id: 'paymentMethod', label: 'Payment Channel', defaultSelected: true },
      { id: 'paymentStatus', label: 'Payment Escrow Status', defaultSelected: true },
      { id: 'rating', label: 'Patient Rating (1-5)', defaultSelected: false },
      { id: 'clinicalSummary', label: 'Clinical Care Notes', defaultSelected: false }
    ],
    nurses: [
      { id: 'id', label: 'Nurse ID', defaultSelected: true },
      { id: 'name', label: 'Full Legal Name', defaultSelected: true },
      { id: 'category', label: 'Nurse Level (RN/LPN)', defaultSelected: true },
      { id: 'nursingCouncilLicense', label: 'NCJ License Number', defaultSelected: true },
      { id: 'licenseVerified', label: 'Verified by Council', defaultSelected: true },
      { id: 'status', label: 'Approval Status', defaultSelected: true },
      { id: 'rating', label: 'Average Rating (1-5)', defaultSelected: true },
      { id: 'reviewCount', label: 'Review Count', defaultSelected: false },
      { id: 'yearsExperience', label: 'Years Experience', defaultSelected: true },
      { id: 'hourlyRateJMD', label: 'Hourly Rate (JMD)', defaultSelected: true },
      { id: 'zones', label: 'Coverage Zones', defaultSelected: true },
      { id: 'specialties', label: 'Clinical Specialties', defaultSelected: false },
      { id: 'completedVisitsCount', label: 'Completed Visits', defaultSelected: true },
      { id: 'totalEarningsJMD', label: 'Gross Earnings (JMD)', defaultSelected: true },
      { id: 'pendingPayoutJMD', label: 'Pending Payout (JMD)', defaultSelected: false },
      { id: 'phone', label: 'Phone Number', defaultSelected: true },
      { id: 'email', label: 'Email Address', defaultSelected: true }
    ],
    users: [
      { id: 'id', label: 'User ID', defaultSelected: true },
      { id: 'name', label: 'Full Name', defaultSelected: true },
      { id: 'email', label: 'Email Address', defaultSelected: true },
      { id: 'role', label: 'User Role', defaultSelected: true },
      { id: 'phone', label: 'Phone Number', defaultSelected: true },
      { id: 'zone', label: 'Parish / Neighborhood', defaultSelected: true },
      { id: 'address', label: 'Street Address', defaultSelected: false },
      { id: 'approvalStatus', label: 'Verification Status', defaultSelected: true },
      { id: 'trn', label: 'Tax Registration (TRN)', defaultSelected: false },
      { id: 'createdAt', label: 'Account Created', defaultSelected: true },
      { id: 'lastLoginAt', label: 'Last Login', defaultSelected: false },
      { id: 'emergencyName', label: 'Emergency Contact', defaultSelected: false },
      { id: 'emergencyPhone', label: 'Emergency Phone', defaultSelected: false }
    ],
    payouts: [
      { id: 'id', label: 'Payout Reference ID', defaultSelected: true },
      { id: 'nurseName', label: 'Nurse / Caregiver Name', defaultSelected: true },
      { id: 'nurseId', label: 'Caregiver ID', defaultSelected: false },
      { id: 'amountJMD', label: 'Net Disbursed (JMD)', defaultSelected: true },
      { id: 'periodStart', label: 'Period Start', defaultSelected: true },
      { id: 'periodEnd', label: 'Period End', defaultSelected: true },
      { id: 'status', label: 'Settlement Status', defaultSelected: true },
      { id: 'payoutMethod', label: 'Disbursement Method', defaultSelected: true },
      { id: 'referenceNumber', label: 'Bank / Lynk Ref No', defaultSelected: true },
      { id: 'processedAt', label: 'Processed Date', defaultSelected: true }
    ]
  }), [userRole]);

  // Selected column IDs state per entity
  const [selectedColumnIds, setSelectedColumnIds] = useState<Record<ExportEntityType, string[]>>({
    bookings: columnsConfig.bookings.filter(c => c.defaultSelected).map(c => c.id),
    nurses: columnsConfig.nurses.filter(c => c.defaultSelected).map(c => c.id),
    users: columnsConfig.users.filter(c => c.defaultSelected).map(c => c.id),
    payouts: columnsConfig.payouts.filter(c => c.defaultSelected).map(c => c.id)
  });

  const toggleColumn = (entity: ExportEntityType, columnId: string) => {
    setSelectedColumnIds(prev => {
      const current = prev[entity] || [];
      if (current.includes(columnId)) {
        if (current.length <= 1) return prev; // Keep at least one column
        return { ...prev, [entity]: current.filter(id => id !== columnId) };
      } else {
        return { ...prev, [entity]: [...current, columnId] };
      }
    });
  };

  const selectAllColumns = (entity: ExportEntityType) => {
    setSelectedColumnIds(prev => ({
      ...prev,
      [entity]: columnsConfig[entity].map(c => c.id)
    }));
  };

  const resetDefaultColumns = (entity: ExportEntityType) => {
    setSelectedColumnIds(prev => ({
      ...prev,
      [entity]: columnsConfig[entity].filter(c => c.defaultSelected).map(c => c.id)
    }));
  };

  // Filter raw data according to active entity & user role
  const rawDataForEntity = useMemo(() => {
    if (selectedEntity === 'bookings') {
      if (userRole === 'nurse' && currentNurse) {
        return bookings.filter(b => b.nurseId === currentNurse.id || b.nurseName === currentNurse.name);
      }
      return bookings;
    }
    if (selectedEntity === 'nurses') {
      if (userRole === 'nurse') {
        return nurses.filter(n => n.status === 'approved');
      }
      return nurses;
    }
    if (selectedEntity === 'users') {
      return userAccounts;
    }
    if (selectedEntity === 'payouts') {
      if (userRole === 'nurse' && currentNurse) {
        return payouts.filter(p => p.nurseId === currentNurse.id || p.nurseName === currentNurse.name);
      }
      return payouts;
    }
    return [];
  }, [selectedEntity, userRole, currentNurse, bookings, nurses, userAccounts, payouts]);

  // Apply filters (search, status, date, zone)
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const now = Date.now();

    return rawDataForEntity.filter((item: any) => {
      // 1. Search term
      if (term) {
        const searchableValues = [
          item.id,
          item.name,
          item.clientName,
          item.nurseName,
          item.serviceName,
          item.email,
          item.phone,
          item.clientPhone,
          item.zone,
          item.address,
          item.nursingCouncilLicense,
          item.referenceNumber
        ].filter(Boolean).map(v => String(v).toLowerCase());

        const matchesSearch = searchableValues.some(v => v.includes(term));
        if (!matchesSearch) return false;
      }

      // 2. Status filter
      if (statusFilter !== 'all') {
        const itemStatus = item.status || item.approvalStatus;
        if (itemStatus !== statusFilter) return false;
      }

      // 3. Zone filter
      if (zoneFilter !== 'all') {
        const itemZone = item.zone || (Array.isArray(item.zones) ? item.zones.join(' ') : '');
        if (!itemZone.toLowerCase().includes(zoneFilter.toLowerCase())) return false;
      }

      // 4. Date filter
      if (dateFilter !== 'all') {
        const dateString = item.scheduledDateTime || item.createdAt || item.processedAt || item.periodEnd;
        if (dateString) {
          const itemTime = new Date(dateString).getTime();
          if (!isNaN(itemTime)) {
            const diffHours = (now - itemTime) / (1000 * 60 * 60);
            if (dateFilter === 'today' && diffHours > 24) return false;
            if (dateFilter === 'last_7_days' && diffHours > 24 * 7) return false;
            if (dateFilter === 'last_30_days' && diffHours > 24 * 30) return false;
            if (dateFilter === 'last_90_days' && diffHours > 24 * 90) return false;
          }
        }
      }

      return true;
    });
  }, [rawDataForEntity, searchTerm, statusFilter, zoneFilter, dateFilter]);

  // Available statuses in filtered entity dataset
  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    rawDataForEntity.forEach((item: any) => {
      const s = item.status || item.approvalStatus;
      if (s) set.add(s);
    });
    return Array.from(set);
  }, [rawDataForEntity]);

  // Available zones in filtered entity dataset
  const availableZones = useMemo(() => {
    const set = new Set<string>();
    rawDataForEntity.forEach((item: any) => {
      if (item.zone) set.add(item.zone);
      if (Array.isArray(item.zones)) {
        item.zones.forEach((z: string) => set.add(z));
      }
    });
    return Array.from(set).sort();
  }, [rawDataForEntity]);

  // Calculate dynamic summary stats
  const summaryStats = useMemo(() => {
    const count = filteredData.length;
    let totalJMD = 0;
    if (selectedEntity === 'bookings') {
      totalJMD = filteredData.reduce((sum: number, b: Booking) => sum + (b.priceJMD || 0), 0);
    } else if (selectedEntity === 'nurses') {
      totalJMD = filteredData.reduce((sum: number, n: NurseProfile) => sum + (n.totalEarningsJMD || 0), 0);
    } else if (selectedEntity === 'payouts') {
      totalJMD = filteredData.reduce((sum: number, p: PayoutRecord) => sum + (p.amountJMD || 0), 0);
    }
    return { count, totalJMD };
  }, [filteredData, selectedEntity]);

  // Helper to extract column value from item
  const getCellValue = (item: any, colId: string): string => {
    if (!item) return '';
    switch (colId) {
      case 'id': return String(item.id || '');
      case 'scheduledDateTime': return item.scheduledDateTime ? new Date(item.scheduledDateTime).toLocaleString() : '';
      case 'serviceName': return String(item.serviceName || '');
      case 'clientName': return String(item.clientName || item.name || '');
      case 'clientPhone': return String(item.clientPhone || item.phone || '');
      case 'clientAddress': return String(item.clientAddress || item.address || '');
      case 'zone': return String(item.zone || (Array.isArray(item.zones) ? item.zones.slice(0, 3).join(', ') : ''));
      case 'nurseName': return String(item.nurseName || 'Unassigned');
      case 'status': return String(item.status || item.approvalStatus || 'N/A');
      case 'duration': return String((item.actualDurationMinutes || item.baseDurationMinutes || 45) + ' mins');
      case 'priceJMD': return item.priceJMD ? `$${Number(item.priceJMD).toLocaleString()} JMD` : '$0 JMD';
      case 'nurseEarningsJMD': return item.nurseEarningsJMD ? `$${Number(item.nurseEarningsJMD).toLocaleString()} JMD` : '$0 JMD';
      case 'platformFeeJMD': return item.platformFeeJMD ? `$${Number(item.platformFeeJMD).toLocaleString()} JMD` : '$0 JMD';
      case 'paymentMethod': return String(item.paymentMethod || 'Stripe / Card');
      case 'paymentStatus': return String(item.paymentStatus || 'held_in_escrow');
      case 'rating': return item.rating ? `${item.rating} / 5` : 'Unrated';
      case 'clinicalSummary': return item.clinicalNotes?.careSummary || item.notes || 'No notes';
      case 'name': return String(item.name || '');
      case 'category': return item.category === 'registered_nurse' ? 'Registered Nurse (RN)' : item.category === 'geriatric_caregiver' ? 'Geriatric Caregiver' : String(item.category || 'Licensed Nurse');
      case 'nursingCouncilLicense': return String(item.nursingCouncilLicense || 'Pending Verification');
      case 'licenseVerified': return item.licenseVerified ? 'Verified NCJ' : 'Pending';
      case 'reviewCount': return String(item.reviewCount || 0);
      case 'yearsExperience': return String((item.yearsExperience || 0) + ' years');
      case 'hourlyRateJMD': return item.hourlyRateJMD ? `$${Number(item.hourlyRateJMD).toLocaleString()} JMD/hr` : '$0';
      case 'zones': return Array.isArray(item.zones) ? item.zones.join('; ') : String(item.zone || '');
      case 'specialties': return Array.isArray(item.specialties) ? item.specialties.join('; ') : '';
      case 'completedVisitsCount': return String(item.completedVisitsCount || 0);
      case 'totalEarningsJMD': return item.totalEarningsJMD ? `$${Number(item.totalEarningsJMD).toLocaleString()} JMD` : '$0 JMD';
      case 'pendingPayoutJMD': return item.pendingPayoutJMD ? `$${Number(item.pendingPayoutJMD).toLocaleString()} JMD` : '$0 JMD';
      case 'phone': return String(item.phone || item.phoneNumber || '');
      case 'email': return String(item.email || '');
      case 'role': return String(item.role || 'client').toUpperCase();
      case 'approvalStatus': return String(item.approvalStatus || 'approved');
      case 'trn': return String(item.trn || item.trnNumber || 'Protected');
      case 'createdAt': return item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
      case 'lastLoginAt': return item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleDateString() : 'Active recently';
      case 'emergencyName': return String(item.emergencyContact?.name || '');
      case 'emergencyPhone': return String(item.emergencyContact?.phone || '');
      case 'amountJMD': return item.amountJMD ? `$${Number(item.amountJMD).toLocaleString()} JMD` : '$0 JMD';
      case 'periodStart': return String(item.periodStart || '');
      case 'periodEnd': return String(item.periodEnd || '');
      case 'payoutMethod': return String(item.payoutMethod || 'Bank Deposit');
      case 'referenceNumber': return String(item.referenceNumber || item.id || '');
      case 'processedAt': return item.processedAt ? new Date(item.processedAt).toLocaleString() : '';
      default: return String(item[colId] ?? '');
    }
  };

  // Prepare table headers & matrix for CSV / TSV / Print
  const currentColumns = columnsConfig[selectedEntity];
  const activeColIds = selectedColumnIds[selectedEntity] || [];
  const activeColumns = currentColumns.filter(c => activeColIds.includes(c.id));

  const headers = activeColumns.map(c => c.label);
  const rows = filteredData.map(item => activeColumns.map(col => getCellValue(item, col.id)));

  // Generate suggested filename
  const getSuggestedFilename = (ext: 'csv' | 'json') => {
    const dateStr = new Date().toISOString().split('T')[0];
    const prefix = userRole === 'nurse' ? `wecare_nurse_${currentNurse?.id || 'caregiver'}` : 'wecare_admin';
    return `${prefix}_${selectedEntity}_export_${dateStr}.${ext}`;
  };

  // EXPORT TO CSV HANDLER
  const handleDownloadCSV = () => {
    const csv = generateCSV(headers, rows);
    const filename = getSuggestedFilename('csv');
    triggerFileDownload(csv, filename, 'text/csv;charset=utf-8;');

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // COPY TO CLIPBOARD HANDLER (TSV or CSV)
  const handleCopyClipboard = async (format: 'tsv' | 'csv') => {
    const text = format === 'tsv' ? generateTSV(headers, rows) : generateCSV(headers, rows);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2500);
    }
  };

  // SAVE TO LOCAL STORAGE ARCHIVES HANDLER
  const handleSaveToArchive = () => {
    const csv = generateCSV(headers, rows);
    const filename = getSuggestedFilename('csv');
    const filterInfo = `Filters: Status=${statusFilter}, Zone=${zoneFilter}, Date=${dateFilter}`;

    const saved = saveExportArchive({
      name: `${selectedEntity.toUpperCase()} Snapshot (${filteredData.length} records)`,
      entityType: selectedEntity,
      recordCount: filteredData.length,
      totalAmountJMD: summaryStats.totalJMD,
      filename,
      csvContent: csv,
      filterSummary: filterInfo,
      format: 'csv'
    });

    setArchives(getExportArchives());
    setSaveSuccessMsg(`Saved to local archive: ${saved.name}`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // DELETE ARCHIVE
  const handleDeleteArchive = (id: string) => {
    const updated = deleteExportArchive(id);
    setArchives(updated);
  };

  // PRINT VIEW HANDLER
  const handleTriggerPrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-gradient-to-br from-[#12041e] via-[#1a072d] to-[#0d0217] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7209B7] to-purple-800 flex items-center justify-center shadow-lg shadow-purple-950/60 border border-purple-400/40">
              <FileSpreadsheet className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-[#C77DFF] border border-purple-500/30">
                  We Care Jamaica Dispatch Suite
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {userRole === 'admin' ? 'Admin Master Records' : `Caregiver: ${currentNurse?.name || 'Nurse Portal'}`}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Data Export, Print &amp; Storage Center
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Top Modal Navigation */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalTab('studio')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  modalTab === 'studio' ? 'bg-[#7209B7] text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('print_view')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  modalTab === 'print_view' ? 'bg-[#7209B7] text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print View</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('archives')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  modalTab === 'archives' ? 'bg-[#7209B7] text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Saved Storage ({archives.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition border border-white/10"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST / SUCCESS BANNER */}
        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* TAB 1: EXPORT STUDIO */}
        {modalTab === 'studio' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Entity Selector Buttons */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                1. Select Data Entity to Export
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {entityOptions.map((ent) => {
                  const Icon = ent.icon;
                  const isSelected = selectedEntity === ent.id;
                  return (
                    <button
                      key={ent.id}
                      type="button"
                      onClick={() => {
                        setSelectedEntity(ent.id);
                        setStatusFilter('all');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-gradient-to-br from-purple-900/60 to-[#7209B7]/40 border-purple-400/60 shadow-lg shadow-purple-950/40 text-white' 
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-white/5 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{ent.label}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{ent.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-purple-400" /> 2. Filter &amp; Search Criteria
                </span>
                <span className="text-[11px] text-slate-400">
                  Showing <strong>{filteredData.length}</strong> of <strong>{rawDataForEntity.length}</strong> records
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, ID, service..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 text-xs capitalize"
                >
                  <option value="all">All Statuses</option>
                  {availableStatuses.map(st => (
                    <option key={st} value={st}>{String(st || '').replace(/_/g, ' ')}</option>
                  ))}
                </select>

                {/* Zone Filter */}
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 text-xs"
                >
                  <option value="all">All Zones / Parishes</option>
                  {availableZones.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>

                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 text-xs"
                >
                  <option value="all">All Time History</option>
                  <option value="today">Past 24 Hours</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_90_days">Last 90 Days</option>
                </select>
              </div>
            </div>

            {/* Column Picker Toggles */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> 3. Select CSV &amp; Print Columns ({activeColumns.length}/{currentColumns.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => selectAllColumns(selectedEntity)}
                    className="text-[11px] text-[#C77DFF] hover:underline font-semibold"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => resetDefaultColumns(selectedEntity)}
                    className="text-[11px] text-slate-400 hover:underline"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentColumns.map((col) => {
                  const isChecked = activeColIds.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => toggleColumn(selectedEntity, col.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                        isChecked 
                          ? 'bg-purple-600/30 border-purple-400/50 text-white' 
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-purple-500 text-white' : 'border border-white/20'
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span>{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Data Preview Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    4. Data Preview ({filteredData.length} Records)
                  </h3>
                  {summaryStats.totalJMD > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
                      Total: ${summaryStats.totalJMD.toLocaleString()} JMD
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  Showing top {Math.min(filteredData.length, 5)} rows in preview
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-300 border-b border-white/10 font-bold">
                    <tr>
                      {activeColumns.map(c => (
                        <th key={c.id} className="p-3 whitespace-nowrap">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={activeColumns.length} className="p-6 text-center text-slate-400 text-xs">
                          No matching records found for the active search criteria.
                        </td>
                      </tr>
                    ) : (
                      (filteredData || []).slice(0, 5).map((item: any, idx) => (
                        <tr key={item.id || idx} className="hover:bg-white/[0.02] transition">
                          {activeColumns.map(col => (
                            <td key={col.id} className="p-3 whitespace-nowrap font-mono text-[11px]">
                              {getCellValue(item, col.id)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EXPORT ACTIONS BAR */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Download CSV Button */}
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  disabled={filteredData.length === 0}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV File ({filteredData.length})</span>
                </button>

                {/* 2. Copy TSV for Excel / Google Sheets */}
                <button
                  type="button"
                  onClick={() => handleCopyClipboard('tsv')}
                  disabled={filteredData.length === 0}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition border border-white/10 flex items-center gap-2 disabled:opacity-50"
                  title="Copy formatted table to paste directly into Excel or Google Sheets cells"
                >
                  {copiedFormat === 'tsv' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-300" />}
                  <span>{copiedFormat === 'tsv' ? 'Copied for Excel!' : 'Copy to Clipboard (Excel TSV)'}</span>
                </button>

                {/* 3. Copy Raw CSV */}
                <button
                  type="button"
                  onClick={() => handleCopyClipboard('csv')}
                  disabled={filteredData.length === 0}
                  className="px-3.5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition border border-white/5 flex items-center gap-1.5"
                  title="Copy raw comma-separated values"
                >
                  {copiedFormat === 'csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Raw CSV</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* 4. Save to In-App Local Storage Archives */}
                <button
                  type="button"
                  onClick={handleSaveToArchive}
                  disabled={filteredData.length === 0}
                  className="px-4 py-3 rounded-2xl bg-purple-900/40 hover:bg-purple-900/60 text-[#C77DFF] hover:text-white text-xs font-bold transition border border-purple-500/30 flex items-center gap-2 shadow-sm"
                  title="Save snapshot to browser local storage for future reference"
                >
                  <Archive className="w-4 h-4 text-purple-300" />
                  <span>Save to Storage Archive</span>
                </button>

                {/* 5. Switch to Print View */}
                <button
                  type="button"
                  onClick={() => setModalTab('print_view')}
                  className="px-4 py-3 rounded-2xl bg-[#7209B7] hover:bg-[#5A0694] text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-purple-950/50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open Print View</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OFFICIAL PRINT VIEW & PRINT PREVIEW */}
        {modalTab === 'print_view' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/50">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-purple-400" />
                  Printable Document Layout Preview
                </span>
                <span className="text-slate-400">({filteredData.length} records selected)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalTab('studio')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition"
                >
                  Back to Filter Studio
                </button>
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document Now</span>
                </button>
              </div>
            </div>

            {/* Printable Paper Canvas (High-Contrast Clean Print Format) */}
            <div 
              ref={printContainerRef}
              id="wecare-printable-document"
              className="bg-white text-black p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-300 font-sans space-y-6 max-w-4xl mx-auto"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            >
              {/* Header Letterhead */}
              <div className="border-b-2 border-black pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#7209B7] text-white font-black flex items-center justify-center text-xl shadow-sm">
                    WC
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-black uppercase">
                      We Care Jamaica Dispatch
                    </h1>
                    <p className="text-xs text-slate-700 font-medium">
                      Ministry of Health &amp; Wellness Verified Home Healthcare Network
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Kingston • St. Andrew • Portmore • Spanish Town • 24/7 Dispatch Hotline
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-700 font-mono">
                  <p className="font-bold text-black uppercase text-sm">
                    {selectedEntity.toUpperCase()} AUDIT REPORT
                  </p>
                  <p>Generated: {new Date().toLocaleString()}</p>
                  <p>Issuer: {userRole === 'admin' ? 'Administrative Directorate' : `RN ${currentNurse?.name || 'Practitioner'}`}</p>
                  <p className="text-[10px] text-slate-500">Document ID: WC-EXP-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>

              {/* Summary Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">Total Records</span>
                  <span className="text-base font-black text-black">{filteredData.length} Entries</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">Financial Volume</span>
                  <span className="text-base font-black text-[#7209B7]">
                    ${summaryStats.totalJMD.toLocaleString()} JMD
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">Active Filter</span>
                  <span className="text-xs font-semibold text-black capitalize">
                    {statusFilter === 'all' ? 'All Statuses' : String(statusFilter || '').replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">Parish Scope</span>
                  <span className="text-xs font-semibold text-black">{zoneFilter === 'all' ? 'All Jamaica Zones' : zoneFilter}</span>
                </div>
              </div>

              {/* Data Table for Print */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead className="bg-slate-200 text-black font-bold uppercase text-[10px] tracking-wider border-b border-slate-400">
                    <tr>
                      <th className="p-2 border border-slate-300 text-center w-8">#</th>
                      {activeColumns.map(c => (
                        <th key={c.id} className="p-2 border border-slate-300">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-[11px]">
                    {filteredData.map((item: any, idx) => (
                      <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 border border-slate-300 text-center font-mono text-[10px] text-slate-500">
                          {idx + 1}
                        </td>
                        {activeColumns.map(col => (
                          <td key={col.id} className="p-2 border border-slate-300 font-mono">
                            {getCellValue(item, col.id)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Official Sign-off & Verification */}
              <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <p className="font-bold text-black uppercase text-[11px]">Certification Statement</p>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    This certified clinical report reflects official records maintained on the We Care Jamaica Dispatch System. All registered nurses are licensed under the Nursing Council of Jamaica Act.
                  </p>
                </div>

                <div className="text-right flex flex-col justify-end space-y-1">
                  <div className="border-b border-black w-48 ml-auto pb-1 text-center font-serif italic text-xs">
                    {userRole === 'admin' ? 'Dr. Michelle Sterling, Medical Dir.' : (currentNurse?.name || 'Registered Nurse')}
                  </div>
                  <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">
                    Authorized Medical / Clinical Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IN-APP SAVED STORAGE ARCHIVES */}
        {modalTab === 'archives' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Archive className="w-4 h-4 text-[#C77DFF]" />
                  Browser Local Storage Snapshot Archives ({archives.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Saved snapshots are preserved locally on this device for offline audits and recurring review.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {archives.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Clear all saved local snapshots?')) {
                        clearAllExportArchives();
                        setArchives([]);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All Archives
                  </button>
                )}

                {/* System-wide JSON Backup for external cloud/disk storage */}
                <button
                  type="button"
                  onClick={() => exportFullJsonStorageBackup({
                    bookings,
                    nurses,
                    userAccounts,
                    payouts,
                    archives
                  })}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  title="Export complete JSON dataset for off-site backup"
                >
                  <Database className="w-3.5 h-3.5" /> Export Complete JSON Backup
                </button>
              </div>
            </div>

            {/* List of archives */}
            {archives.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                <Archive className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="font-bold text-white text-sm">No Snapshots Saved Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Use the <strong>"Save to Storage Archive"</strong> button inside the Export Studio to capture timestamped snapshots of bookings, nurses, and user lists.
                </p>
                <button
                  type="button"
                  onClick={() => setModalTab('studio')}
                  className="px-4 py-2 rounded-xl bg-[#7209B7] text-white text-xs font-bold transition"
                >
                  Go to Export Studio
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {archives.map((arch) => (
                  <div
                    key={arch.id}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-[#C77DFF] border border-purple-500/30">
                          {arch.entityType}
                        </span>
                        <h4 className="font-bold text-sm text-white">{arch.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        Saved on: {new Date(arch.savedAt).toLocaleString()} • {arch.recordCount} Records
                        {arch.totalAmountJMD ? ` • Total: $${arch.totalAmountJMD.toLocaleString()} JMD` : ''}
                      </p>
                      {arch.filterSummary && (
                        <p className="text-[11px] text-slate-500 font-mono">{arch.filterSummary}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Re-download CSV */}
                      <button
                        type="button"
                        onClick={() => triggerFileDownload(arch.csvContent, arch.filename, 'text/csv;charset=utf-8;')}
                        className="px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
                        title="Download CSV file from archive"
                      >
                        <Download className="w-3.5 h-3.5" /> Download CSV
                      </button>

                      {/* Copy CSV */}
                      <button
                        type="button"
                        onClick={async () => {
                          await copyToClipboard(arch.csvContent);
                          alert('Archive CSV copied to clipboard!');
                        }}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteArchive(arch.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                        title="Delete archive snapshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
