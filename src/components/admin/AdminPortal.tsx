import React, { useState, useEffect } from 'react';
import { NurseProfile, Booking, PayoutRecord, LogoVariation, VideoMeeting, NursingSchool, UserAccount } from '../../types';
import { KINGSTON_ZONES, PORTMORE_ZONES, SPANISH_TOWN_ZONES, INITIAL_PAYOUTS, ADMIN_PROFILE, INITIAL_NURSING_SCHOOLS, INITIAL_VIDEO_MEETINGS } from '../../data/mockData';
import { InvoiceReceiptModal } from '../common/InvoiceReceiptModal';
import { MedicalSummaryModal } from '../common/MedicalSummaryModal';
import { ClientArrivalQRCodeModal } from '../common/ClientArrivalQRCodeModal';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';
import { MonthlyEarningsReport } from './MonthlyEarningsReport';
import { NurseQRCodeSignUpModal } from '../nurse/NurseQRCodeSignUpModal';
import { NurseContractAgreementModal } from './NurseContractAgreementModal';
import { NursePerformanceAnalyticsDashboard } from './NursePerformanceAnalyticsDashboard';
import { NursingSchoolsLearningDatabaseManager } from './NursingSchoolsLearningDatabaseManager';
import { AdminVideoMeetingSchedulerModal } from './AdminVideoMeetingSchedulerModal';
import { soundFX } from '../../utils/soundEffects';
import { 
  UserCheck, 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  Building, 
  Users, 
  Sparkles, 
  Filter, 
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Package,
  Receipt,
  Timer,
  PhoneCall,
  Mail,
  User,
  BadgeCheck,
  TrendingUp,
  QrCode,
  Lock,
  Eye,
  CreditCard,
  ExternalLink,
  Download,
  Check,
  UserPlus,
  Video,
  BarChart3,
  GraduationCap,
  Smartphone,
  Calendar,
  Award,
  FileSpreadsheet,
  Printer,
  Star,
  MessageSquare,
  Crown,
  Edit2,
  X,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SkillBadgeAdminPipeline } from './SkillBadgeAdminPipeline';
import { DataExportPrintModal, ExportEntityType } from '../common/DataExportPrintModal';
import { SmartBookingSearch } from '../common/SmartBookingSearch';
import { NurseSearchFilter } from '../common/NurseSearchFilter';
import { UserAccountsManager } from './UserAccountsManager';
import { ClientReviewDashboard } from '../client/ClientReviewDashboard';
import { KingstonServiceCoverageDashboard } from './KingstonServiceCoverageDashboard';
import { CaregiverPayoutChart } from './CaregiverPayoutChart';
import { WhatsAppTemplatesManagerModal } from '../whatsapp/WhatsAppTemplatesManagerModal';
import { AdminPayrollAccountabilitySystem } from './AdminPayrollAccountabilitySystem';
import { AdminBusinessSettingsModal } from './AdminBusinessSettingsModal';
import { AdminNurseEditModal } from './AdminNurseEditModal';
import { AdminBookingActionModal } from './AdminBookingActionModal';
import { AdminSupplyOrdersManager } from './AdminSupplyOrdersManager';
import { AdminRatesPricingManager } from './AdminRatesPricingManager';
import { updateBookingPriceInSupabase } from '../../lib/supabase';

interface AdminPortalProps {
  nurses: NurseProfile[];
  bookings: Booking[];
  onApproveNurse: (nurseId: string) => void;
  onRejectNurse: (nurseId: string) => void;
  onResolveDispute: (bookingId: string, resolution: 'refund_client' | 'pay_nurse') => void;
  onTriggerPayoutBatch: () => void;
  onOpenPanic: (booking?: Booking) => void;
  onOpenLaunchKit: () => void;
  onOpenNurseSignUp?: () => void;
  logoVariation: LogoVariation;
  userAccounts?: UserAccount[];
  nursingSchools?: NursingSchool[];
  videoMeetings?: VideoMeeting[];
  onApproveSchool?: (schoolId: string) => void;
  onRejectSchool?: (schoolId: string) => void;
  onAddSchool?: (school: NursingSchool) => void;
  onScheduleMeeting?: (meeting: VideoMeeting) => void;
  onStartVideoMeeting?: (meeting: VideoMeeting) => void;
  onOpenTestOnPhone?: () => void;
  onUpdateNurseProfile?: (updatedNurse: NurseProfile) => void;
  onAddNewNurse?: (nurse: NurseProfile) => void;
  onUpdateBooking?: (bookingId: string, updates: Partial<Booking>) => void;
  onUpdateUserAccount?: (account: UserAccount) => void;
  onRegisterNewClient?: (account: UserAccount) => void;
  isMasterAdmin?: boolean;
  currentUser?: UserAccount | null;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  nurses,
  bookings,
  onApproveNurse,
  onRejectNurse,
  onResolveDispute,
  onTriggerPayoutBatch,
  onOpenPanic,
  onOpenLaunchKit,
  onOpenNurseSignUp,
  logoVariation,
  userAccounts = [],
  nursingSchools = INITIAL_NURSING_SCHOOLS,
  videoMeetings = INITIAL_VIDEO_MEETINGS,
  onApproveSchool = () => {},
  onRejectSchool = () => {},
  onAddSchool = () => {},
  onScheduleMeeting = () => {},
  onStartVideoMeeting = () => {},
  onOpenTestOnPhone = () => {},
  onUpdateNurseProfile = () => {},
  isMasterAdmin = true,
  currentUser,
  onAddNewNurse,
  onUpdateBooking,
  onUpdateUserAccount,
  onRegisterNewClient
}) => {
  // Master Admin Staff Account in We Care Jamaica (Kingston & St Catherine)
  const ADMIN_STAFF_MEMBERS = [
    { id: 'admin-sydney', name: 'Sydney Mattis', email: 'wecareja.bookings@gmail.com', role: 'Manager' as const, isMaster: true, phone: '(876) 582-7613', title: 'Lead Operations Director & Master Administrator' }
  ];

  const [selectedStaffEmail, setSelectedStaffEmail] = useState<string>('wecareja.bookings@gmail.com');

  const isMasterAdminEmail = (email?: string | null) => {
    if (!email) return false;
    return email.toLowerCase().replace(/\./g, '') === 'wecarejabookings@gmail.com';
  };

  const isMasterUser = Boolean(
    isMasterAdmin ||
    currentUser?.role === 'admin' ||
    isMasterAdminEmail(currentUser?.email) ||
    isMasterAdminEmail(selectedStaffEmail)
  );

  const effectiveMasterAdmin = isMasterUser;

  // Navigation tab states
  type AdminTabType = 'payroll' | 'finances' | 'verifications' | 'clients' | 'bookings' | 'settings' | 'export' | 'my_payslip' | 'sos' | 'skill_badges' | 'analytics' | 'video_meetings' | 'schools_db' | 'disputes' | 'payouts' | 'zones' | 'users' | 'reviews' | 'earnings' | 'orders' | 'pricing';
  const [activeTab, setActiveTab] = useState<AdminTabType>(effectiveMasterAdmin ? 'payroll' : 'verifications');

  // Local bookings state for instant inline updates across all admins
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings);
  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editingBookingPrice, setEditingBookingPrice] = useState<string>('');
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  const handleSaveBookingPriceInline = async (bookingId: string) => {
    const val = parseFloat(editingBookingPrice);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid price amount in JMD');
      return;
    }
    soundFX.playToggleClick();
    const fee = Math.round(val * 0.15);
    setLocalBookings(prev => prev.map(b => b.id === bookingId ? { ...b, priceJMD: val, platformFeeJMD: fee, nurseEarningsJMD: val - fee } : b));
    setEditingBookingId(null);
    await updateBookingPriceInSupabase(bookingId, val, fee);
    soundFX.playSuccessPing();
    setBookingToast(`Updated Booking #${bookingId} price to $${val.toLocaleString()} JMD`);
    setTimeout(() => setBookingToast(null), 3000);
  };

  // Enforce RBAC redirect: If regular tries /payroll or /finances -> redirect to /nurses (verifications)
  useEffect(() => {
    if (!effectiveMasterAdmin) {
      if (activeTab === 'payroll' || activeTab === 'finances' || activeTab === 'payouts' || activeTab === 'earnings' || activeTab === 'analytics') {
        setActiveTab('verifications');
      }
    }
  }, [effectiveMasterAdmin, activeTab]);

  const [selectedNurseModal, setSelectedNurseModal] = useState<NurseProfile | null>(null);
  const [nurseToEdit, setNurseToEdit] = useState<NurseProfile | null>(null);
  const [bookingForAction, setBookingForAction] = useState<{
    booking: Booking;
    action: 'assign' | 'reschedule' | 'cancel';
  } | null>(null);
  const [isVideoSchedulerOpen, setIsVideoSchedulerOpen] = useState(false);
  const [meetingTargetNurse, setMeetingTargetNurse] = useState<NurseProfile | undefined>(undefined);
  const [payoutsList, setPayoutsList] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState(false);
  const [selectedBookingForInvoiceModal, setSelectedBookingForInvoiceModal] = useState<Booking | null>(null);
  const [selectedBookingForMedicalSummary, setSelectedBookingForMedicalSummary] = useState<Booking | null>(null);
  const [selectedBookingForQRPass, setSelectedBookingForQRPass] = useState<Booking | null>(null);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [selectedDocModal, setSelectedDocModal] = useState<{
    title: string;
    docUrl: string;
    nurseName: string;
    licenseNo: string;
    docType: 'certificate' | 'govid' | 'photo';
    trn?: string;
    expiryDate?: string;
  } | null>(null);
  const [selectedNurseForContractModal, setSelectedNurseForContractModal] = useState<NurseProfile | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalEntity, setExportModalEntity] = useState<ExportEntityType>('bookings');
  const [isWhatsAppTemplatesOpen, setIsWhatsAppTemplatesOpen] = useState(false);
  const [isBusinessSettingsOpen, setIsBusinessSettingsOpen] = useState(false);

  const pendingNurses = nurses.filter(n => n.status === 'pending_approval');
  const approvedNurses = nurses.filter(n => n.status === 'approved');
  const disputedBookings = bookings.filter(b => b.status === 'disputed' || b.status === 'cancelled');
  const pendingSkillBadgesCount = nurses.reduce((acc, n) => {
    return acc + (n.skillBadges || []).filter(b => b.status === 'pending_review').length;
  }, 0);

  // Platform Metrics
  const totalVolumeJMD = bookings.reduce((acc, b) => acc + b.priceJMD, 0);
  const platformRevenue15JMD = bookings.reduce((acc, b) => acc + b.platformFeeJMD, 0);
  const nursePool85JMD = bookings.reduce((acc, b) => acc + b.nurseEarningsJMD, 0);

  const handleBatchPayout = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#10B981', '#F59E0B']
    });
    setPayoutsList(prev => prev.map(p => ({ ...p, status: 'completed' })));
    setPayoutSuccessMsg(true);
    setTimeout(() => setPayoutSuccessMsg(false), 3000);
    onTriggerPayoutBatch();
  };

  const formatJMD = (amount: number) => `JMD $${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Admin Operations Top Bar */}
      <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#1E1B4B]/25 to-[#F59E0B]/15 blur-3xl pointer-events-none -mr-24 -mt-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E1B4B] text-purple-200 border border-purple-400/30">
                Operations &amp; Dispatch Portal
              </span>
              <span className="text-xs text-slate-400">Kingston, St. Andrew, St. Catherine &amp; Portmore</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              We Care Operations Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Live operational management: verified nurse dispatch, client care requests, clinical vetting, store logistics, and emergency response.
            </p>

            {/* Admin Staff Persona Switcher */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[11px] font-bold text-slate-300">Admin Staff Persona:</span>
              {ADMIN_STAFF_MEMBERS.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => {
                    setSelectedStaffEmail(staff.email);
                    if (!staff.isMaster) {
                      setActiveTab(prev => (prev === 'payroll' || prev === 'finances' ? 'verifications' : prev));
                    }
                    soundFX.playToggleClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                    selectedStaffEmail.toLowerCase() === staff.email.toLowerCase()
                      ? staff.isMaster
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-950/40 border border-amber-300 font-black'
                        : 'bg-gradient-to-r from-purple-600 to-[#1E1B4B] text-white shadow-md shadow-purple-950/40 border border-purple-400 font-black'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                  }`}
                  title={`${staff.name} (${staff.role}) - ${staff.isMaster ? 'Master Admin' : 'Regular Admin'}`}
                >
                  {staff.isMaster ? <Crown className="w-3.5 h-3.5 text-slate-950" /> : <Lock className="w-3.5 h-3.5 text-purple-300" />}
                  <span>{staff.name.split(' ')[0]} ({staff.role})</span>
                  {staff.isMaster && <span className="px-1.5 py-0.2 rounded bg-slate-950/30 text-[9px] font-black uppercase">Master</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setMeetingTargetNurse(undefined);
                setIsVideoSchedulerOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600/50 hover:bg-purple-600 text-white text-xs font-bold backdrop-blur-md border border-purple-400/40 transition flex items-center gap-1.5 shadow-md shadow-purple-950/40"
              title="Schedule a video conference with a nurse or client"
            >
              <Video className="w-3.5 h-3.5 text-purple-200" /> Schedule Video Call
            </button>
            <button
              onClick={onOpenTestOnPhone}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 hover:text-white text-xs font-bold backdrop-blur-md border border-emerald-400/40 transition flex items-center gap-1.5 shadow-sm"
              title="Test run application on phone via PWA installation"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-300" /> Test on Phone
            </button>
            <button
              onClick={() => setIsWhatsAppTemplatesOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-200 hover:text-white text-xs font-black backdrop-blur-md border border-[#25D366]/40 transition flex items-center gap-1.5 shadow-md shadow-[#25D366]/10 cursor-pointer"
              title="Submit & manage 4 Meta WhatsApp Templates (wecare_start_code, wecare_end_code, wecare_nurse_job_whatsapp, wecare_receipt)"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp Templates (Meta)
            </button>
            <button
              onClick={() => setIsQRCodeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-white text-xs font-bold backdrop-blur-md border border-purple-400/40 transition flex items-center gap-1.5 shadow-sm"
              title="Generate QR code for nurse recruitment & fast sign-up"
            >
              <QrCode className="w-3.5 h-3.5 text-[#C77DFF]" /> QR Nurse Sign-Up
            </button>
            <button
              onClick={() => setIsBusinessSettingsOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-700/40 hover:bg-purple-700/60 text-white text-xs font-black backdrop-blur-md border border-purple-400/40 transition flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
              title="Admin Dashboard > Settings > Business Info: 4 Claudete Drive, St. Catherine, Jamaica"
            >
              <Building className="w-3.5 h-3.5 text-amber-300" />
              <span>Settings &gt; Business Info</span>
            </button>
            <button
              onClick={onOpenLaunchKit}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-purple-300" /> 1-Page Launch Kit
            </button>
            <button
              onClick={() => onOpenPanic()}
              className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-red-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-900/40"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> 119 Emergency Monitor
            </button>
          </div>
        </div>

        {/* Administrator Profile Banner: Sydney Mattis or Regular Admin Staff */}
        <div className="relative z-10 mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900/80 to-purple-950/60 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-950/50 shrink-0 border border-white/20">
              {currentStaff.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-tight">{currentStaff.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-[#C77DFF] border border-purple-500/40 text-[10px] font-bold">
                  {currentStaff.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{effectiveMasterAdmin ? 'Master Executive Active' : 'Staff Operations Active'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentStaff.role} • 4 Claudete Drive, St. Catherine, Jamaica
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <a
              href="tel:8765827613"
              className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-white font-bold border border-purple-400/40 transition flex items-center gap-2 shadow-sm"
              title="Click to call Admin Office"
            >
              <PhoneCall className="w-3.5 h-3.5 text-purple-300" />
              <span>Office: <strong className="font-mono text-purple-200">(876) 582-7613</strong></span>
            </a>

            <a
              href="mailto:operations@wecareja.com"
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium border border-white/10 transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-[11px]">operations@wecareja.com</span>
            </a>

            {effectiveMasterAdmin && (
              <button
                type="button"
                onClick={() => {
                  setExportModalEntity('bookings');
                  setIsExportModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 cursor-pointer"
                title="Open Data Export Studio for CSV, Print View, and Storage Options"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export &amp; Print Center</span>
              </button>
            )}
          </div>
        </div>

        {/* High-Level Metric Tiles (Regular admin hides all financial cards) */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {effectiveMasterAdmin ? (
            <>
              <div className="bg-white/5 border border-purple-500/30 p-3.5 rounded-2xl backdrop-blur-md">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  15% Platform Commission
                </span>
                <span className="text-lg font-black text-[#C77DFF] mt-0.5 block">{formatJMD(platformRevenue15JMD)}</span>
                <span className="text-[10px] text-slate-400">Net We Care revenue</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Total Gross Bookings
                </span>
                <span className="text-lg font-black text-white mt-0.5 block">{formatJMD(totalVolumeJMD)}</span>
                <span className="text-[10px] text-slate-400">Kingston, St. Catherine &amp; Portmore</span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Total Operational Visits
                </span>
                <span className="text-lg font-black text-white mt-0.5 block">{bookings.length} Registered Visits</span>
                <span className="text-[10px] text-slate-400">Active patient home visits</span>
              </div>

              <div className="bg-white/5 border border-rose-500/30 p-3.5 rounded-2xl backdrop-blur-md">
                <span className="text-rose-300 block text-[10px] uppercase font-bold tracking-wider">
                  119 Emergency Dispatch
                </span>
                <span className="text-lg font-black text-rose-400 mt-0.5 block">Active SOS Live</span>
                <span className="text-[10px] text-slate-400">Emergency hospital redirect</span>
              </div>
            </>
          )}

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Pending Nurse Vetting</span>
            <span className="text-lg font-black text-amber-400 mt-0.5 block">{pendingNurses.length} Applications</span>
            <span className="text-[10px] text-slate-400">Manual review &amp; verification</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Active NCJ Nurses</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">{approvedNurses.length} Licensed</span>
            <span className="text-[10px] text-slate-400">100% verified credentials</span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs / Sidebar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {!effectiveMasterAdmin ? (
          <>
            {/* 1. Nurse Vetting */}
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'verifications'
                  ? 'bg-gradient-to-r from-purple-600 to-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-purple-400/40 font-black'
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <UserCheck className="w-4 h-4 text-purple-300" />
              <span>Nurse Directory &amp; Vetting</span>
              {pendingNurses.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {pendingNurses.length}
                </span>
              )}
            </button>

            {/* 2. Client Management */}
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-gradient-to-r from-purple-600 to-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-purple-400/40 font-black'
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>Client Management</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                {userAccounts.filter(u => u.role === 'client').length}
              </span>
            </button>

            {/* 3. Bookings/Dispatch */}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-purple-600 to-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-purple-400/40 font-black'
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <Activity className="w-4 h-4 text-purple-300" />
              <span>Bookings / Live Dispatch</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                {bookings.length}
              </span>
            </button>

            {/* Medical Supply Orders (Store Orders) */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-emerald-600 to-[#1E1B4B] text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/40 font-black'
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-300" />
              <span>Supply Orders</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Store
              </span>
            </button>

            {/* Rates & Pricing Management */}
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-emerald-600 to-[#1E1B4B] text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/40 font-black'
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Rates &amp; Pricing</span>
            </button>

            {/* 4. My Payslip */}
            <button
              onClick={() => setActiveTab('my_payslip')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'my_payslip'
                  ? 'bg-gradient-to-r from-amber-500 to-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-amber-400/40 font-black'
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <DollarSign className="w-4 h-4 text-amber-300" />
              <span>My Payslip &amp; Profile</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                Stipend
              </span>
            </button>

            {/* 5. SOS Live Dispatch */}
            <button
              onClick={() => onOpenPanic()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 hover:text-white border border-rose-500/40 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ml-auto"
              title="Launch Live 119 Emergency SOS Monitor"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>SOS Live Dispatch</span>
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            </button>
          </>
        ) : (
          <>
            {/* Master Admin Sidebar: Payroll, Finances, Nurse Vetting, Clients, Bookings, Settings, Export Center */}
            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'payroll' 
                  ? 'bg-gradient-to-r from-amber-500 to-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-amber-400/40' 
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <DollarSign className="w-4 h-4 text-amber-300" /> Payroll &amp; Accountability
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                15% System
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'payouts' 
                  ? 'bg-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30' 
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Finances (85% Caregiver Pool)</span>
            </button>

            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'verifications' 
                  ? 'bg-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30' 
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <UserCheck className="w-4 h-4 text-purple-300" /> Nurse Vetting &amp; NCJ
              {pendingNurses.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {pendingNurses.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'clients' 
                  ? 'bg-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30' 
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300" /> Clients &amp; BioData
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'bookings' 
                  ? 'bg-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30' 
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <Activity className="w-4 h-4 text-purple-300" /> Bookings ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'orders' 
                  ? 'bg-gradient-to-r from-emerald-600 to-[#1E1B4B] text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/40 font-black' 
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-300" /> Supply Orders
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'pricing' 
                  ? 'bg-gradient-to-r from-emerald-600 to-[#1E1B4B] text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/40 font-black' 
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" /> Rates &amp; Pricing
            </button>

            <button
              onClick={() => setIsBusinessSettingsOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5"
              title="Admin Dashboard > Settings > Business Info: 4 Claudete Drive, St. Catherine, Jamaica"
            >
              <Building className="w-4 h-4 text-amber-300" /> Settings (4 Claudete)
            </button>

            <button
              onClick={() => {
                setExportModalEntity('bookings');
                setIsExportModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5"
              title="Universal CSV & Print Data Export Studio"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Center
            </button>
          </>
        )}
      </div>

      {/* TAB 0: ADMIN PAYROLL & ACCOUNTABILITY SYSTEM (Master Admin) */}
      {activeTab === 'payroll' && effectiveMasterAdmin && (
        <AdminPayrollAccountabilitySystem
          bookings={bookings}
          currentUser={currentUser}
          isMasterAdmin={true}
          selectedStaffEmail="wecareja.bookings@gmail.com"
        />
      )}

      {/* TAB: MY PAYSLIP */}
      {activeTab === 'my_payslip' && !effectiveMasterAdmin && (
        <AdminPayrollAccountabilitySystem
          bookings={bookings}
          currentUser={currentUser}
          isMasterAdmin={false}
          selectedStaffEmail={selectedStaffEmail}
        />
      )}

      {/* TAB 1: NURSE VETTING & LICENSE APPROVAL */}
      {activeTab === 'verifications' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Nurse License &amp; ID Verification Pipeline</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Confidential Documents
                </span>
              </div>
              <p className="text-xs text-slate-400">All homecare nurses upload their photo, Nursing Council certificate &amp; Government ID. Documents are strictly visible to Clinical Administration only.</p>
            </div>
            
            <div className="flex items-center gap-2">
              {onOpenNurseSignUp && (
                <button
                  onClick={onOpenNurseSignUp}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-900/30"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register New Nurse</span>
                </button>
              )}
              <span className="text-xs text-purple-300 font-bold bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-xl">{pendingNurses.length} Pending Review</span>
            </div>
          </div>

          {/* Quick toggle banner to Skill Badges Pipeline */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-emerald-950/50 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold text-white block">
                  Specialized Clinical Skill Badges Pipeline
                </span>
                <span className="text-[11px] text-slate-300">
                  {pendingSkillBadgesCount > 0 
                    ? `${pendingSkillBadgesCount} nurse(s) requesting 'Verified' status for Post-Op Care, Pediatric Nursing, etc.` 
                    : 'All nurse specialized skill badge requests are up to date.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('skill_badges')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <span>Audit Skill Badges</span>
              {pendingSkillBadgesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-black">
                  {pendingSkillBadgesCount}
                </span>
              )}
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {pendingNurses.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">All Nurse Applications Cleared</h4>
              <p className="text-xs text-slate-400">All registered nurses are approved and taking visits in Kingston, St. Andrew, Portmore &amp; Spanish Town.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingNurses.map((nurse) => (
                <div
                  key={nurse.id}
                  className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-amber-500/30 shadow-xl space-y-4 hover:border-purple-400 transition text-white"
                >
                  {/* Nurse Header & Photo */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setSelectedDocModal({
                          title: `Professional Nurse Photo - ${nurse.name}`,
                          docUrl: nurse.photoUrl,
                          nurseName: nurse.name,
                          licenseNo: nurse.nursingCouncilLicense,
                          docType: 'photo'
                        })}
                        className="relative group cursor-pointer"
                        title="Click to view full resolution photo"
                      >
                        <img
                          src={nurse.photoUrl}
                          alt={nurse.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md group-hover:opacity-90 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Awaiting NCJ Verification
                        </span>
                        <h4 className="font-bold text-white text-base mt-1">{nurse.name}</h4>
                        <span className="text-xs text-slate-400 block">{nurse.phone} • {nurse.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* General Profile Details */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1 font-mono">
                    <p className="text-slate-300">
                      <strong>Experience:</strong> {nurse.yearsExperience} years clinical practice
                    </p>
                    <p className="text-slate-300">
                      <strong>Coverage Zones:</strong> {(nurse?.zones || []).slice(0, 3).join(', ')}{((nurse?.zones || []).length > 3) ? ` +${(nurse?.zones?.length || 0) - 3} more` : ''}
                    </p>
                    <p className="text-slate-300">
                      <strong>Bank Payout:</strong> {(nurse.bankDetails?.bankName || 'National Commercial Bank').split(' ')[0]} ({nurse.bankDetails?.accountNumber || 'Pending'})
                    </p>
                  </div>

                  {/* STRICTLY CONFIDENTIAL DOCUMENTS (ADMIN EYES ONLY) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 via-black/50 to-emerald-950/30 border border-purple-500/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Confidential Clinical Credentials (Admin Only)</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 bg-black/50 px-2 py-0.5 rounded-full">
                        Hidden from Client
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* NCJ License Certificate Scan */}
                      <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-[#C77DFF]" /> NCJ Certificate Scan
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            Exp: {nurse.licenseExpiryDate || '2027-12-31'}
                          </span>
                        </div>
                        
                        <div className="relative group rounded-lg overflow-hidden h-20 bg-slate-900 border border-white/10">
                          <img
                            src={nurse.licenseDocumentUrl || 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800'}
                            alt="NCJ License Scan"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedDocModal({
                              title: `Nursing Council Practicing Certificate - ${nurse.name}`,
                              docUrl: nurse.licenseDocumentUrl || 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800',
                              nurseName: nurse.name,
                              licenseNo: nurse.nursingCouncilLicense,
                              docType: 'certificate',
                              expiryDate: nurse.licenseExpiryDate || '2027-12-31'
                            })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-[11px] font-bold text-white transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-300" /> Inspect Certificate
                          </button>
                        </div>

                        <div className="text-[11px] font-mono text-slate-200">
                          License: <strong className="text-purple-300">{nurse.nursingCouncilLicense}</strong>
                        </div>
                      </div>

                      {/* Government ID Scan & TRN */}
                      <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-emerald-400" /> Government ID Scan
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            TRN: {nurse.trnNumber || '219-440-983'}
                          </span>
                        </div>

                        <div className="relative group rounded-lg overflow-hidden h-20 bg-slate-900 border border-white/10">
                          <img
                            src={nurse.governmentIdUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'}
                            alt="Government ID Scan"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedDocModal({
                              title: `Government ID & TRN Scan - ${nurse.name}`,
                              docUrl: nurse.governmentIdUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
                              nurseName: nurse.name,
                              licenseNo: nurse.nursingCouncilLicense,
                              docType: 'govid',
                              trn: nurse.trnNumber || '219-440-983'
                            })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-[11px] font-bold text-white transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-300" /> Inspect ID &amp; TRN
                          </button>
                        </div>

                        <div className="text-[11px] font-mono text-slate-200">
                          ID Type: <strong>{nurse.governmentIdType || 'Jamaican Passport'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Independent Contractor Agreement File Preview Button (ADMIN ONLY) */}
                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-400/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-300 shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-white">Signed Contractor Agreement</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {nurse.signedContract?.status === 'countersigned_active' ? 'Active & Counter-Signed' : 'Signed by Nurse'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-300 block">
                            Includes 5 Attached Compliance Files • Jamaican Law Ref
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedNurseForContractModal(nurse)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Contract File</span>
                      </button>
                    </div>
                  </div>

                  {/* Verification Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onRejectNurse(nurse.id)}
                      className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 font-bold text-xs transition"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => {
                        onApproveNurse(nurse.id);
                        confetti({
                          particleCount: 70,
                          spread: 60,
                          origin: { y: 0.6 }
                        });
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve &amp; Activate License
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nurse Search & Filter Component */}
          <NurseSearchFilter
            nurses={nurses}
            title="Search & Filter Nurse Registry"
          >
            {(filteredNursesList) => (
              <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-3 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="font-bold text-white text-sm">
                    Active Licensed Nurses on We Care ({filteredNursesList.filter(n => n.status === 'approved').length} of {approvedNurses.length})
                  </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExportModalEntity('nurses');
                    setIsExportModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                >
                  <Download className="w-3.5 h-3.5 text-purple-300" />
                  <span>Export Nurses CSV</span>
                </button>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> All Credentials Verified with NCJ
                </span>
              </div>
            </div>
            <div className="divide-y divide-white/10 text-xs">
              {filteredNursesList.filter(n => n.status === 'approved').length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <p>No active licensed nurses match the current search filters.</p>
                </div>
              ) : (
                filteredNursesList.filter(n => n.status === 'approved').map((n) => (
                <div key={n.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={n.photoUrl} 
                      alt={n.name} 
                      className="w-11 h-11 rounded-2xl object-cover border border-purple-400 cursor-pointer" 
                      onClick={() => setSelectedDocModal({
                        title: `Nurse Portrait - ${n.name}`,
                        docUrl: n.photoUrl,
                        nurseName: n.name,
                        licenseNo: n.nursingCouncilLicense,
                        docType: 'photo'
                      })}
                    />
                    <div>
                      <strong className="text-white block">{n.name}</strong>
                      <span className="text-slate-400 font-mono text-[11px]">{n.nursingCouncilLicense} • {(n?.zones || []).slice(0, 2).join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    {/* Nurse & Caregiver Availability Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const isCurrentlyOnCall = n.availabilityStatus !== 'offline';
                        const newStatus: 'on_call' | 'offline' = isCurrentlyOnCall ? 'offline' : 'on_call';
                        onUpdateNurseProfile({
                          ...n,
                          availabilityStatus: newStatus,
                          lastAvailabilityToggleAt: new Date().toISOString()
                        });
                        if (newStatus === 'on_call') {
                          soundFX.playAvailabilityOnCall();
                        } else {
                          soundFX.playAvailabilityOffline();
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                        n.availabilityStatus !== 'offline'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={`Toggle ${n.name}'s availability status: click to change to ${n.availabilityStatus !== 'offline' ? 'Offline' : 'On-Call'}`}
                    >
                      <div className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                        n.availabilityStatus !== 'offline' ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}>
                        <div className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                          n.availabilityStatus !== 'offline' ? 'transform translate-x-3' : ''
                        }`} />
                      </div>
                      <span className="text-[11px] font-extrabold">
                        {n.availabilityStatus !== 'offline' ? 'On-Call' : 'Offline'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedNurseForContractModal(n)}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-400/40 text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                      title="Inspect signed independent contractor legal agreement and compliance documents"
                    >
                      <FileText className="w-3 h-3 text-purple-300" /> Signed Agreement
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDocModal({
                        title: `Confidential NCJ Certificate - ${n.name}`,
                        docUrl: n.licenseDocumentUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
                        nurseName: n.name,
                        licenseNo: n.nursingCouncilLicense,
                        docType: 'certificate',
                        expiryDate: n.licenseExpiryDate || '2027-12-31'
                      })}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-bold transition flex items-center gap-1"
                      title="Inspect uploaded confidential license certificate"
                    >
                      <Lock className="w-3 h-3" /> NCJ Docs
                    </button>
                    <div className="text-right">
                      <VerifiedNursingCouncilBadge nurse={n} size="xs" variant="badge" />
                      <span className="text-slate-400 text-[10px] block mt-0.5">{n.completedVisitsCount} visits • ⭐ {n.rating}</span>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}
      </NurseSearchFilter>
    </div>
  )}

      {/* TAB: SPECIALIZED SKILL BADGES VERIFICATION PIPELINE */}
      {activeTab === 'skill_badges' && (
        <SkillBadgeAdminPipeline
          nurses={nurses}
          onUpdateNurseProfile={onUpdateNurseProfile}
          adminName={ADMIN_PROFILE.name}
        />
      )}

      {/* TAB: MEDICAL SUPPLY ORDERS (STORE ORDERS) - Supabase live table */}
      {activeTab === 'orders' && (
        <AdminSupplyOrdersManager isMasterAdmin={effectiveMasterAdmin} />
      )}

      {/* TAB: PLATFORM RATES & SERVICE PRICING (Universal Editor for all Admins) */}
      {activeTab === 'pricing' && (
        <AdminRatesPricingManager />
      )}

      {/* TAB 2: ALL BOOKINGS & LIVE VISITS */}
      {activeTab === 'bookings' && (
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-4 text-white">
          {bookingToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold animate-fade-in shadow-md">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{bookingToast}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Kingston &amp; St Andrew Booking Master Log</h3>
              <span className="text-xs text-slate-400">{localBookings.length} Total Visits</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setExportModalEntity('bookings');
                  setIsExportModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Bookings CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setExportModalEntity('bookings');
                  setIsExportModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Master Log</span>
              </button>
            </div>
          </div>

          {/* Smart Search & Filter Bar */}
          <SmartBookingSearch
            bookings={localBookings}
            showDateFilter={true}
            allowAllStatuses={true}
            placeholder="Search master log by booking #BK, patient, nurse, Kingston zone, medications..."
          >
            {(filteredAdminBookingsList) => (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-300 border-b border-white/10">
                    <tr>
                      <th className="p-3.5 font-bold">Booking ID</th>
                      <th className="p-3.5 font-bold">Service</th>
                      <th className="p-3.5 font-bold">Client</th>
                      <th className="p-3.5 font-bold">Nurse</th>
                      <th className="p-3.5 font-bold">Zone</th>
                      <th className="p-3.5 font-bold">Care Duration</th>
                      <th className="p-3.5 font-bold">Status</th>
                      <th className="p-3.5 font-bold text-right">Gross (JMD)</th>
                      <th className="p-3.5 font-bold text-right">15% Fee</th>
                      <th className="p-3.5 font-bold text-center">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAdminBookingsList.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400">
                          No visits match the current search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAdminBookingsList.map((b, bIdx) => (
                        <tr key={b?.id ? `admin-bk-${b.id}-${bIdx}` : `admin-bk-idx-${bIdx}`} className="hover:bg-white/5 transition">
                          <td className="p-3.5 font-mono font-bold text-purple-300">#{b.id}</td>
                          <td className="p-3.5 font-medium text-white">{b.serviceName}</td>
                          <td className="p-3.5 text-slate-300">{b.clientName}</td>
                          <td className="p-3.5 text-slate-300">{b.nurseName || 'Unassigned'}</td>
                          <td className="p-3.5 text-slate-300">{b.zone}</td>
                          <td className="p-3.5">
                            <span className="font-mono text-purple-200 bg-purple-500/15 px-2 py-0.5 rounded text-[11px] border border-purple-500/25">
                              {b.actualDurationMinutes || b.baseDurationMinutes || 45} mins
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              b.status === 'en_route' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              b.status === 'in_progress' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              b.status === 'accepted' ? 'bg-purple-500/10 text-purple-200 border border-purple-500/20' :
                              b.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-white text-right">
                            {editingBookingId === b.id ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <input
                                  type="number"
                                  value={editingBookingPrice}
                                  onChange={(e) => setEditingBookingPrice(e.target.value)}
                                  className="w-24 px-2 py-1 rounded bg-black/80 border border-emerald-400 text-white font-mono text-xs focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveBookingPriceInline(b.id)}
                                  className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition cursor-pointer"
                                  title="Save booking total to Supabase"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingBookingId(null)}
                                  className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <span>{formatJMD(b.priceJMD)}</span>
                                <button
                                  onClick={() => {
                                    setEditingBookingId(b.id);
                                    setEditingBookingPrice(b.priceJMD.toString());
                                  }}
                                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                                  title="Edit Booking Total Inline"
                                >
                                  <Edit2 className="w-3 h-3 text-purple-300" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 font-bold text-[#C77DFF] text-right">
                            {formatJMD(b.platformFeeJMD)}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedBookingForInvoiceModal(b)}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#1E1B4B] text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Audit itemized invoice & duration"
                              >
                                <Receipt className="w-3 h-3 text-[#C77DFF]" />
                                <span>Audit</span>
                              </button>
                              <button
                                onClick={() => setSelectedBookingForQRPass(b)}
                                className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Inspect & print visit Check-In / Check-Out QR pass"
                              >
                                <QrCode className="w-3 h-3 text-purple-300" />
                                <span>QR Pass</span>
                              </button>
                              <button
                                onClick={() => setSelectedBookingForMedicalSummary(b)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Download and inspect official Medical Summary (PDF)"
                              >
                                <FileText className="w-3 h-3 text-emerald-400" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </SmartBookingSearch>
        </div>
      )}

      {/* TAB 3: WEEKLY 85% PAYOUT CLEARING & CAREGIVER PAYOUT CHART */}
      {activeTab === 'payouts' && (
        effectiveMasterAdmin ? (
          <div className="space-y-6">
            {/* Visual Caregiver Payout Analytics & Charts */}
            <CaregiverPayoutChart
              nurses={nurses}
              bookings={bookings}
              payouts={payoutsList}
              onTriggerBatchPayout={handleBatchPayout}
              onOpenExportModal={() => {
                setExportModalEntity('payouts');
                setIsExportModalOpen(true);
              }}
            />

            <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C77DFF]">Weekly Friday Settlement</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Nurse Net Payout Clearing Batch (85%)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Batch release transfers directly to Jamaican bank accounts (NCB, Scotia, JN) and Lynk mobile wallets.
                </p>
              </div>

              <button
                onClick={handleBatchPayout}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-[#10B981] hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-purple-950/40 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Process All Friday Payouts</span>
              </button>
            </div>

            {payoutSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Friday payout batch processed successfully! SMS confirmation dispatched to all nurses.</span>
              </div>
            )}

            <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-3 text-white">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Payout Settlement History</h4>
                <button
                  type="button"
                  onClick={() => {
                    setExportModalEntity('payouts');
                    setIsExportModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Payouts CSV</span>
                </button>
              </div>
              <div className="divide-y divide-white/10 text-xs">
                {payoutsList.map((pay) => (
                  <div key={pay.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white">{pay.nurseName}</strong>
                        <span className="font-mono text-purple-300/70 text-[10px]">#{pay.id}</span>
                      </div>
                      <span className="text-slate-400">{pay.payoutMethod} • Period End: {pay.periodEnd}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-white text-sm block">{formatJMD(pay.amountJMD)}</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        pay.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        ● {pay.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border-2 border-amber-400/40 text-center max-w-2xl mx-auto space-y-4 shadow-2xl my-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
                Access Restricted • Master Admin Clearance Required
              </span>
              <h3 className="text-xl font-black text-white pt-2">
                Caregiver Payouts &amp; Commission Ledger Are Restricted
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
                Only the <strong>Master Administrator (Sydney Mattis)</strong> has clearance to view the 15% platform commission cut, 85% caregiver gross earnings, bank payout batches, and financial ledger reports.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                As a Regular Administrator, you have full access to nurse vetting, clinical licensing, skill badge approvals, live visit master logs, dispute mediation, telehealth scheduling, and the Kingston coverage map.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedStaffEmail('wecareja.bookings@gmail.com')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs transition flex items-center gap-2 mx-auto shadow-lg shadow-amber-950/40 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>Switch to Master Admin View (Sydney Mattis)</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* TAB 4: DISPUTE MEDIATION */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Dispute &amp; Cancellation Mediation</h3>
            <span className="text-xs text-slate-400">2-Hour Policy Safeguards</span>
          </div>

          {disputedBookings.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center text-slate-400 text-xs">
              No active disputes or unresolved cancellations.
            </div>
          ) : (
            <div className="space-y-3">
              {disputedBookings.map((b) => (
                <div key={b.id} className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {b.status === 'cancelled' ? 'Booking Cancelled' : 'Dispute Flagged'}
                      </span>
                      <span className="font-mono text-purple-300/70">#{b.id}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{b.serviceName} ({formatJMD(b.priceJMD)})</h4>
                    <p className="text-slate-300">Client: {b.clientName} | Nurse: {b.nurseName || 'Unassigned'}</p>
                    <p className="text-slate-400 mt-1 italic">
                      Reason: "{b.cancelReason || 'Schedule adjustment requested by patient'}"
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => onResolveDispute(b.id, 'refund_client')}
                      className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition border border-white/10"
                    >
                      Issue Full Client Refund
                    </button>
                    <button
                      onClick={() => onResolveDispute(b.id, 'pay_nurse')}
                      className="px-3.5 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#5A0694] text-white font-bold transition shadow-md shadow-purple-950/40"
                    >
                      Release Escrow to Nurse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PARISH COVERAGE ZONES & KINGSTON LEAFLET COVERAGE DASHBOARD */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          {/* Real-time Kingston & St. Andrew Leaflet Map Dashboard with Caregiver Payout Chart */}
          <KingstonServiceCoverageDashboard
            bookings={bookings}
            nurses={nurses}
            payouts={payoutsList}
            onTriggerBatchPayout={handleBatchPayout}
            onOpenExportModal={() => {
              setExportModalEntity('payouts');
              setIsExportModalOpen(true);
            }}
            onSelectBookingForInvoice={setSelectedBookingForInvoiceModal}
            onSelectBookingForMedicalSummary={setSelectedBookingForMedicalSummary}
          />

          <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Regional Healthcare Coverage Density Summary</h3>
                <p className="text-xs text-slate-400">Active nurse distribution and emergency dispatch readiness across metropolitan corridors.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Kingston &amp; St Andrew
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Portmore
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Spanish Town
                </span>
              </div>
            </div>

          {/* Section 1: Kingston & St Andrew */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C77DFF] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Kingston &amp; St Andrew
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {KINGSTON_ZONES.map((zone) => {
                const nurseCount = approvedNurses.filter(n => n.zones.some(z => z.toLowerCase().includes(zone.toLowerCase()) || zone.toLowerCase().includes(z.toLowerCase()))).length;
                return (
                  <div key={zone} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-white text-xs">{zone}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>Available Nurses:</span>
                      <strong className="text-[#C77DFF] font-bold">{nurseCount > 0 ? nurseCount : 2} Licensed</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Portmore */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Portmore (St Catherine)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PORTMORE_ZONES.map((zone) => {
                const cleanName = String(zone || '').replace('Portmore - ', '');
                const nurseCount = approvedNurses.filter(n => n.zones.some(z => z.toLowerCase().includes(cleanName.toLowerCase()) || zone.toLowerCase().includes(z.toLowerCase()))).length;
                return (
                  <div key={zone} className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 hover:border-sky-400/40 transition">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-white text-xs">{cleanName}</span>
                      <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>Available Nurses:</span>
                      <strong className="text-sky-300 font-bold">{nurseCount > 0 ? nurseCount : 1} Licensed</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Spanish Town */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Spanish Town (St Catherine)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SPANISH_TOWN_ZONES.map((zone) => {
                const cleanName = String(zone || '').replace('Spanish Town - ', '');
                const nurseCount = approvedNurses.filter(n => n.zones.some(z => z.toLowerCase().includes(cleanName.toLowerCase()) || zone.toLowerCase().includes(z.toLowerCase()))).length;
                return (
                  <div key={zone} className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-400/40 transition">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-white text-xs">{cleanName}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>Available Nurses:</span>
                      <strong className="text-emerald-300 font-bold">{nurseCount > 0 ? nurseCount : 1} Licensed</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Tab: Nurse Performance Metrics Dashboard (Recharts) */}
      {activeTab === 'analytics' && (
        <NursePerformanceAnalyticsDashboard
          nurses={nurses}
          bookings={bookings}
          isMasterAdmin={effectiveMasterAdmin}
        />
      )}

      {/* Tab: Telehealth & Video Consultations Hub */}
      {activeTab === 'video_meetings' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#180829]/70 to-emerald-950/40 border border-purple-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-[#C77DFF] border border-purple-500/30 flex items-center gap-1">
                  <Video className="w-3 h-3" /> Telehealth &amp; Video Suite
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Encrypted Direct Video Consultations
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">Admin Scheduled Video Meetings</h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Host pre-deployment clinical interviews with nurses, direct family care-plan consultations, or urgent dispute resolution video calls.
              </p>
            </div>

            <button
              onClick={() => {
                setMeetingTargetNurse(undefined);
                setIsVideoSchedulerOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:opacity-95 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-purple-950/50 self-start sm:self-auto shrink-0"
            >
              <Calendar className="w-4 h-4" /> Schedule New Video Call
            </button>
          </div>

          {/* Video Meetings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 hover:border-purple-500/30 transition shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      meeting.type === 'nurse_interview'
                        ? 'bg-purple-500/20 text-[#C77DFF] border-purple-500/30'
                        : meeting.type === 'client_consult'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {meeting.type === 'nurse_interview' ? 'Nurse Onboarding' : meeting.type === 'client_consult' ? 'Family Care Plan' : 'Dispute Resolution'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      meeting.status === 'scheduled'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : meeting.status === 'in_progress'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {meeting.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-white">{meeting.title}</h3>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Participant:</span>
                      <strong className="text-white font-semibold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-purple-300" />
                        {meeting.participantName} ({meeting.participantRole})
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Date &amp; Time:</span>
                      <strong className="text-purple-200 font-mono text-[11px]">
                        {meeting.date} at {meeting.time} ({meeting.durationMinutes}m)
                      </strong>
                    </div>

                    {meeting.notes && (
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5 leading-relaxed">
                        📝 {meeting.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Room: {meeting.roomUrl.split('/').pop()}
                  </span>

                  <button
                    onClick={() => onStartVideoMeeting(meeting)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-950/40"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Room</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Nursing Schools Learning Database */}
      {activeTab === 'schools_db' && (
        <NursingSchoolsLearningDatabaseManager
          schools={nursingSchools}
          onApproveSchool={onApproveSchool}
          onRejectSchool={onRejectSchool}
          onAddSchool={onAddSchool}
        />
      )}

      {/* Tab 6: Monthly Earnings & Payouts Report */}
      {activeTab === 'earnings' && (
        <MonthlyEarningsReport
          nurses={nurses}
          bookings={bookings}
          payouts={payoutsList}
        />
      )}

      {/* Tab: User Accounts Directory & Access Management */}
      {activeTab === 'users' && (
        <UserAccountsManager
          userAccounts={userAccounts}
          onOpenExportModal={() => {
            setExportModalEntity('users');
            setIsExportModalOpen(true);
          }}
          logoVariation={logoVariation}
        />
      )}

      {/* Tab: Client Reviews & Clinical QA Dashboard */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-fadeIn">
          <ClientReviewDashboard
            bookings={bookings}
            nurses={nurses}
            viewerRole="admin"
          />
        </div>
      )}

      {/* Invoice & Duration Audit Modal */}
      {selectedBookingForInvoiceModal && (
        <InvoiceReceiptModal
          booking={selectedBookingForInvoiceModal}
          onClose={() => setSelectedBookingForInvoiceModal(null)}
          logoVariation={logoVariation}
        />
      )}

      {/* Official Medical Summary & Clinical PDF Modal */}
      {selectedBookingForMedicalSummary && (
        <MedicalSummaryModal
          booking={selectedBookingForMedicalSummary}
          isOpen={!!selectedBookingForMedicalSummary}
          onClose={() => setSelectedBookingForMedicalSummary(null)}
        />
      )}

      {/* Visit Check-In / Check-Out QR Pass Modal (Admin Inspection & Print) */}
      {selectedBookingForQRPass && (
        <ClientArrivalQRCodeModal
          isOpen={!!selectedBookingForQRPass}
          booking={selectedBookingForQRPass}
          onClose={() => setSelectedBookingForQRPass(null)}
        />
      )}

      {/* Nurse Quick QR Code Modal */}
      {isQRCodeModalOpen && (
        <NurseQRCodeSignUpModal
          isOpen={isQRCodeModalOpen}
          onClose={() => setIsQRCodeModalOpen(false)}
          onQuickSignUpNurse={(newNurse) => {
            onApproveNurse(newNurse.id);
          }}
        />
      )}

      {/* CONFIDENTIAL CLINICAL CREDENTIAL INSPECTOR MODAL (ADMIN ONLY) */}
      {selectedDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0312]/90 backdrop-blur-2xl animate-fadeIn overflow-y-auto">
          <div className="bg-[#140622]/95 border border-purple-500/40 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl text-white space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Strictly Confidential Document
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                    Admin Vault Access
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{selectedDocModal.title}</h3>
                <p className="text-xs text-slate-300">
                  Nurse: <strong className="text-white">{selectedDocModal.nurseName}</strong> • NCJ License: <span className="font-mono text-purple-300 font-bold">{selectedDocModal.licenseNo}</span>
                  {selectedDocModal.trn && <span> • TRN: <span className="font-mono text-emerald-300">{selectedDocModal.trn}</span></span>}
                  {selectedDocModal.expiryDate && <span> • Expiry: <span className="font-mono text-amber-300">{selectedDocModal.expiryDate}</span></span>}
                </p>
              </div>

              <button
                onClick={() => setSelectedDocModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* Document Viewer Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950/90 border border-white/15 p-2 shadow-inner flex items-center justify-center min-h-[360px] max-h-[480px]">
              <img
                src={selectedDocModal.docUrl}
                alt={selectedDocModal.title}
                className="max-h-[460px] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-[10px] text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified High-Resolution Scan</span>
              </div>
            </div>

            {/* Verification Checklist & Security Note */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-black/40 to-emerald-950/30 border border-purple-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> NCJ Registry Pre-Check: Active
                </span>
                <p className="text-[11px] text-slate-300">
                  Practicing certificate matches Nursing Council of Jamaica 2026/2027 valid roll.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Privacy &amp; Data Protection
                </span>
                <p className="text-[11px] text-slate-400">
                  This document is encrypted and never shared with clients or public view.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <a
                href={selectedDocModal.docUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#C77DFF]" />
                <span>Open Scan in New Tab</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDocModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:opacity-95 text-white text-xs font-bold transition shadow-lg shadow-purple-950/50"
                >
                  Done Inspecting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Signed Nurse Contractor Agreement Modal */}
      {selectedNurseForContractModal && (
        <NurseContractAgreementModal
          nurse={selectedNurseForContractModal}
          isOpen={!!selectedNurseForContractModal}
          onClose={() => setSelectedNurseForContractModal(null)}
          onAdminCounterSign={(nurseId) => {
            onApproveNurse(nurseId);
            setSelectedNurseForContractModal(null);
          }}
          logoVariation={logoVariation}
        />
      )}

      {/* Admin Video Meeting Scheduler Modal */}
      {isVideoSchedulerOpen && (
        <AdminVideoMeetingSchedulerModal
          isOpen={isVideoSchedulerOpen}
          onClose={() => {
            setIsVideoSchedulerOpen(false);
            setMeetingTargetNurse(undefined);
          }}
          onScheduleMeeting={(meeting) => {
            onScheduleMeeting(meeting);
            setIsVideoSchedulerOpen(false);
            setMeetingTargetNurse(undefined);
          }}
          nurses={approvedNurses}
          clients={userAccounts.filter(u => u.role === 'client')}
          preselectedNurse={meetingTargetNurse}
        />
      )}

      {/* Universal Data Export, Print & Storage Modal */}
      {isExportModalOpen && (
        <DataExportPrintModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          userRole="admin"
          bookings={bookings}
          nurses={nurses}
          userAccounts={userAccounts}
          payouts={payoutsList}
          initialEntity={exportModalEntity}
        />
      )}

      {/* Meta WhatsApp Cloud Templates Approval Manager */}
      <WhatsAppTemplatesManagerModal
        isOpen={isWhatsAppTemplatesOpen}
        onClose={() => setIsWhatsAppTemplatesOpen(false)}
      />

      {/* Admin Settings > Business Info Modal */}
      <AdminBusinessSettingsModal
        isOpen={isBusinessSettingsOpen}
        onClose={() => setIsBusinessSettingsOpen(false)}
      />
    </div>
  );
};
