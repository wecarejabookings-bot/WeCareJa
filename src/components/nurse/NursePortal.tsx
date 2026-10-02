import React, { useState } from 'react';
import { NurseProfile, Booking, ClinicalNotes, LogoVariation, InvoiceSummary, PayoutRecord, NursePeerChatMessage, VisitQRAction, ActivityNotificationType } from '../../types';
import { KINGSTON_ZONES, PORTMORE_ZONES, SPANISH_TOWN_ZONES, ALL_SERVICE_ZONES, INITIAL_PAYOUTS } from '../../data/mockData';
import { VisitTimerWidget } from './VisitTimerWidget';
import { CallContactModal } from '../common/CallContactModal';
import { InvoiceReceiptModal } from '../common/InvoiceReceiptModal';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';
import { NurseProfileModal } from '../common/NurseProfileModal';
import { NurseQRCodeSignUpModal } from './NurseQRCodeSignUpModal';
import { NursePayoutHistoryView } from './NursePayoutHistoryView';
import { NursePeerNetworkView } from './NursePeerNetworkView';
import { PatientMedicationReminderCard } from './PatientMedicationReminderCard';
import { IncomingBookingPromptModal } from './IncomingBookingPromptModal';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { NurseAvailabilityGeofenceCard } from './NurseAvailabilityGeofenceCard';
import { InProgressVisitTimerBanner } from './InProgressVisitTimerBanner';
import { NurseArrivalQRScannerModal } from './NurseArrivalQRScannerModal';
import { PractitionerMilestoneTracker } from './PractitionerMilestoneTracker';
import { CelebrationMilestoneModal } from '../common/CelebrationMilestoneModal';
import { ServiceLogo } from '../common/ServiceLogo';
import { PPESafetyNotice, PPEReadyBadge, PPEToggle } from '../common/PPESafetyNotice';
import { ArrivalDoorbellAlertButton } from '../common/ArrivalDoorbellAlertButton';
import { NotifyArrivalButton } from './NotifyArrivalButton';
import { ActionDropdown, ActionDropdownItem } from '../common/ActionDropdown';
import { QuickSOSButton } from '../common/QuickSOSButton';
import { BookingDetailModal } from './BookingDetailModal';
import { MedicalSummaryModal } from '../common/MedicalSummaryModal';
import { BiometricHealthScanModal } from '../common/BiometricHealthScanModal';
import { VoiceToTextClinicalRecorder } from './VoiceToTextClinicalRecorder';
import { ClinicalVoiceNotesInput } from './ClinicalVoiceNotesInput';
import { ClientReviewDashboard } from '../client/ClientReviewDashboard';
import { SmartBookingSearch } from '../common/SmartBookingSearch';
import { soundFX } from '../../utils/soundEffects';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Send, 
  MessageSquare, 
  ShieldAlert, 
  FileText, 
  Upload, 
  UserCheck, 
  AlertCircle, 
  Heart, 
  Activity, 
  ChevronRight, 
  Phone,
  Car,
  Navigation,
  Sparkles,
  Building,
  CreditCard,
  Lock,
  Timer,
  Plus,
  Minus,
  Receipt,
  FileCheck,
  QrCode,
  Eye,
  Award,
  ArrowUpRight,
  Users,
  Camera,
  Share2,
  Video,
  Radio,
  Moon,
  Mic,
  BadgeCheck,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Download,
  Star,
  LogOut,
  FileBadge,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NurseSkillBadgesManager } from './SkillBadgeSystem';
import { CaregiverPerformanceMetrics } from './CaregiverPerformanceMetrics';
import { calculateNurseVisitsCount, INITIAL_PRACTITIONER_MILESTONES } from '../../data/milestonesData';
import { DataExportPrintModal, ExportEntityType } from '../common/DataExportPrintModal';
import { VerifiedWeCareIDCardModal } from './VerifiedWeCareIDCardModal';
import { NavigateToLocationButton } from '../common/NavigateToLocationButton';
import { PoliceRecord60DayBanner } from './PoliceRecord60DayBanner';
import { getProcedureVisual, getClientReputation } from '../../utils/procedureVisuals';
import { NurseContractAgreementModal } from '../admin/NurseContractAgreementModal';
import { CaregiverSuppliesChecklistModal } from './CaregiverSuppliesChecklistModal';

interface NursePortalProps {
  nurses: NurseProfile[];
  bookings: Booking[];
  currentNurseId: string;
  payouts?: PayoutRecord[];
  peerMessages?: NursePeerChatMessage[];
  onSendPeerMessage?: (message: Omit<NursePeerChatMessage, 'id' | 'timestamp'>) => void;
  onUpdateNurseProfile: (updatedNurse: NurseProfile) => void;
  onAddNewNurse?: (newNurse: NurseProfile) => void;
  onOpenNurseSignUp?: () => void;
  onNavigateStore?: () => void;
  onUpdateBookingStatus: (
    bookingId: string, 
    status: Booking['status'], 
    clinicalNotes?: ClinicalNotes,
    additionalData?: Partial<Booking>
  ) => void;
  onRerouteBooking?: (bookingId: string, reason?: string, preferredNurseId?: string) => void;
  onOpenChat: (booking: Booking) => void;
  onOpenPanic: (booking?: Booking) => void;
  onOpenLaunchKit: () => void;
  logoVariation: LogoVariation;
  onOpenVideoCall?: (participantName: string, participantRole: 'client' | 'admin', meetingTitle?: string) => void;
  onTriggerNotification?: (type: ActivityNotificationType, title: string, description: string, bookingId?: string) => void;
}

export const NursePortal: React.FC<NursePortalProps> = ({
  nurses,
  bookings,
  currentNurseId,
  payouts = INITIAL_PAYOUTS,
  peerMessages = [],
  onSendPeerMessage,
  onUpdateNurseProfile,
  onAddNewNurse,
  onOpenNurseSignUp,
  onNavigateStore,
  onUpdateBookingStatus,
  onRerouteBooking,
  onOpenChat,
  onOpenPanic,
  onOpenLaunchKit,
  logoVariation,
  onOpenVideoCall,
  onTriggerNotification
}) => {
  const fallbackEmptyNurse: NurseProfile = {
    id: 'nurse-pending',
    name: 'Registered Practitioner (Awaiting Registration)',
    phone: '+1 (876) 555-0000',
    email: 'practitioner@wecare.jm',
    photoUrl: 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=400',
    institutionAttended: 'School of Nursing',
    dateOfBirth: '1995-01-01',
    gender: 'female',
    residentialAddress: 'Kingston, Jamaica',
    careLevel: 'registered_nurse',
    qualificationTitle: 'Registered General Nurse (NCJ)',
    requiresNcjRegistration: true,
    payTierDescription: 'Clinical Tier • 85% Caregiver Payout',
    certifications: ['NCJ Active License', 'Basic Life Support (BLS)'],
    scopeOfCare: { canProvide: [], cannotProvide: [] },
    nursingCouncilLicense: 'NCJ-PENDING',
    licenseVerified: false,
    status: 'pending_approval',
    rating: 5.0,
    reviewCount: 0,
    yearsExperience: 0,
    specialties: ['General Nursing'],
    zones: ['New Kingston'],
    hourlyRateJMD: 7500,
    currentLat: 18.0074,
    currentLng: -76.7836,
    bio: 'Licensed healthcare professional registered on We Care Jamaica network.',
    totalEarningsJMD: 0,
    pendingPayoutJMD: 0,
    completedVisitsCount: 0
  };

  const currentNurse = nurses.find(n => n.id === currentNurseId) || nurses[0] || fallbackEmptyNurse;

  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'earnings' | 'payouts' | 'profile' | 'network' | 'milestones' | 'skill_badges' | 'performance' | 'reviews'>('requests');
  const [celebrationPayload, setCelebrationPayload] = useState<any>(null);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  
  // Caregiver Supplies Checklist Modal before accepting job (Task 3)
  const [acceptingJobForSuppliesChecklist, setAcceptingJobForSuppliesChecklist] = useState<Booking | null>(null);

  // Closeout form state for completing a visit
  const [selectedBookingForCloseout, setSelectedBookingForCloseout] = useState<Booking | null>(null);
  const [closeoutMinutes, setCloseoutMinutes] = useState<number>(45);
  const [closeoutStartedAt, setCloseoutStartedAt] = useState<string>('');
  const [closeoutEndedAt, setCloseoutEndedAt] = useState<string>('');

  // Invoice Receipt Modal
  const [selectedBookingForInvoiceModal, setSelectedBookingForInvoiceModal] = useState<Booking | null>(null);
  const [selectedBookingForMedicalSummary, setSelectedBookingForMedicalSummary] = useState<Booking | null>(null);
  const [selectedBookingForBiometricScan, setSelectedBookingForBiometricScan] = useState<Booking | null>(null);
  const [selectedBookingForArrivalQRScan, setSelectedBookingForArrivalQRScan] = useState<Booking | null>(null);
  const [qrScannerInitialMode, setQrScannerInitialMode] = useState<VisitQRAction | undefined>(undefined);

  const handleOpenQRScanner = (booking: Booking, mode?: VisitQRAction) => {
    setQrScannerInitialMode(mode || (booking.status === 'in_progress' ? 'check_out' : 'check_in'));
    setSelectedBookingForArrivalQRScan(booking);
  };
  const [selectedBookingForCallModal, setSelectedBookingForCallModal] = useState<Booking | null>(null);
  const [selectedBookingForDetailModal, setSelectedBookingForDetailModal] = useState<Booking | null>(null);
  const [isPreviewProfileOpen, setIsPreviewProfileOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [selectedBookingForPrompt, setSelectedBookingForPrompt] = useState<Booking | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalEntity, setExportModalEntity] = useState<ExportEntityType>('bookings');
  const [isIDCardModalOpen, setIsIDCardModalOpen] = useState(false);
  const [isContractAgreementOpen, setIsContractAgreementOpen] = useState(false);

  // Vitals State
  const [bp, setBp] = useState('124/80 mmHg');
  const [pulse, setPulse] = useState('74 bpm');
  const [glucose, setGlucose] = useState('5.9 mmol/L');
  const [spo2, setSpo2] = useState('99%');
  const [temp, setTemp] = useState('36.6 °C');
  const [medsAdministered, setMedsAdministered] = useState('');
  const [careSummary, setCareSummary] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null);

  // Quick Toggle Handler for immediate On-Call / Offline switching
  const handleQuickToggleAvailability = () => {
    const isCurrentlyOnCall = currentNurse.availabilityStatus !== 'offline';
    const newStatus: 'on_call' | 'offline' = isCurrentlyOnCall ? 'offline' : 'on_call';
    
    if (newStatus === 'on_call') {
      soundFX.playAvailabilityOnCall();
      setAvailabilityNotice('🟢 You are now ON-CALL. Your profile is immediately active in the client booking pool & smart dispatcher radar.');
    } else {
      soundFX.playAvailabilityOffline();
      setAvailabilityNotice('🌙 You are now OFFLINE (Off-Duty). New on-demand dispatch requests are paused in the client booking pool.');
    }

    const updated: NurseProfile = {
      ...currentNurse,
      availabilityStatus: newStatus,
      lastAvailabilityToggleAt: new Date().toISOString()
    };
    onUpdateNurseProfile(updated);

    setTimeout(() => {
      setAvailabilityNotice(null);
    }, 5000);
  };

  // Onboarding edit form
  const [onboardingName, setOnboardingName] = useState(currentNurse.name);
  const [onboardingPhone, setOnboardingPhone] = useState(currentNurse.phone);
  const [onboardingLicense, setOnboardingLicense] = useState(currentNurse.nursingCouncilLicense);
  const [onboardingExp, setOnboardingExp] = useState(currentNurse.yearsExperience);
  const [onboardingBio, setOnboardingBio] = useState(currentNurse.bio);
  const [onboardingBankName, setOnboardingBankName] = useState(currentNurse.bankDetails?.bankName || 'National Commercial Bank (NCB) Jamaica');
  const [onboardingAccount, setOnboardingAccount] = useState(currentNurse.bankDetails?.accountNumber || '•••• •••• 4821');
  const [onboardingLynk, setOnboardingLynk] = useState(currentNurse.bankDetails?.lynkWallet || 'lynk.me/nurse');
  const [selectedZones, setSelectedZones] = useState<string[]>(currentNurse.zones);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Relevant bookings for this nurse
  const nurseBookings = bookings.filter(b => b.nurseId === currentNurse.id || b.nurseName === currentNurse.name);
  const activeVisits = nurseBookings.filter(b => ['accepted', 'en_route', 'in_progress'].includes(b.status));
  const inProgressVisits = activeVisits.filter(b => b.status === 'in_progress');
  const pendingRequests = bookings.filter(b => b.status === 'requested');
  const completedVisits = nurseBookings.filter(b => b.status === 'completed');

  const toggleZone = (zone: string) => {
    if (selectedZones.includes(zone)) {
      setSelectedZones(selectedZones.filter(z => z !== zone));
    } else {
      setSelectedZones([...selectedZones, zone]);
    }
  };

  const handleStartVisitTimer = (bookingId: string) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    // Without the nurse scanning or putting in the doorstep arrival code, they can't start a visit!
    if (targetBooking && !targetBooking.arrivalVerified && targetBooking.status !== 'in_progress') {
      soundFX.playCancellation();
      handleOpenQRScanner(targetBooking, 'check_in');
      if (onTriggerNotification) {
        onTriggerNotification(
          'system_alert',
          '🔒 Doorstep Arrival Code Required',
          `Cannot start visit #${bookingId.slice(0, 8)}. Please scan the client's QR pass or enter the 4-digit doorstep code provided by the client or their remote family member.`,
          bookingId
        );
      }
      return;
    }

    const now = new Date().toISOString();
    onUpdateBookingStatus(bookingId, 'in_progress', undefined, {
      visitStartedAt: now
    });
  };

  const handleOpenCloseoutModal = (
    booking: Booking, 
    calculatedMins?: number, 
    startedIso?: string, 
    endedIso?: string
  ) => {
    const start = startedIso || booking.visitStartedAt || booking.scheduledDateTime;
    const end = endedIso || new Date().toISOString();
    let mins = calculatedMins;
    if (!mins) {
      if (booking.visitStartedAt) {
        mins = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(booking.visitStartedAt).getTime()) / 60000));
      } else {
        mins = booking.baseDurationMinutes || 45;
      }
    }

    setCloseoutMinutes(mins);
    setCloseoutStartedAt(start);
    setCloseoutEndedAt(end);
    setSelectedBookingForCloseout(booking);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: NurseProfile = {
      ...currentNurse,
      name: onboardingName,
      phone: onboardingPhone,
      nursingCouncilLicense: onboardingLicense,
      yearsExperience: Number(onboardingExp),
      bio: onboardingBio,
      zones: selectedZones,
      bankDetails: {
        bankName: onboardingBankName,
        accountNumber: onboardingAccount,
        accountType: 'Savings',
        lynkWallet: onboardingLynk
      }
    };
    onUpdateNurseProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCloseoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForCloseout) return;

    const baseMins = selectedBookingForCloseout.baseDurationMinutes || 45;
    const basePrice = selectedBookingForCloseout.basePriceJMD || selectedBookingForCloseout.priceJMD;
    const hourlyRate = selectedBookingForCloseout.hourlyRateJMD || currentNurse.hourlyRateJMD || 7500;
    const overtimeRatePerMin = hourlyRate / 60;
    const overtimeMins = Math.max(0, closeoutMinutes - baseMins);
    const overtimeFee = Math.round(overtimeMins * overtimeRatePerMin);
    const finalTotalCharged = basePrice + overtimeFee;
    const finalNurseEarnings = Math.round(finalTotalCharged * 0.85);
    const finalPlatformFee = finalTotalCharged - finalNurseEarnings;

    const invoiceSummary: InvoiceSummary = {
      invoiceNumber: `INV-WC-${(selectedBookingForCloseout?.id || 'BK-7294').replace('BK-', '')}-JAM`,
      issuedAt: closeoutEndedAt || new Date().toISOString(),
      startedAt: closeoutStartedAt || selectedBookingForCloseout.visitStartedAt || selectedBookingForCloseout.scheduledDateTime,
      endedAt: closeoutEndedAt || new Date().toISOString(),
      baseDurationMinutes: baseMins,
      actualDurationMinutes: closeoutMinutes,
      overtimeMinutes: overtimeMins,
      basePriceJMD: basePrice,
      overtimeRatePerHourJMD: hourlyRate,
      overtimeFeeJMD: overtimeFee,
      totalChargedJMD: finalTotalCharged,
      platformFeeJMD: finalPlatformFee,
      nurseEarningsJMD: finalNurseEarnings,
      paymentMethod: selectedBookingForCloseout.paymentMethod || 'card',
      paymentStatus: 'paid_to_nurse',
      timeBreakdownText: `${closeoutMinutes} mins care logged (${baseMins}m base${overtimeMins > 0 ? ` + ${overtimeMins}m overtime` : ''})`,
      items: [
        {
          description: `${selectedBookingForCloseout.serviceName} (Standard ${baseMins} min In-Home Visit)`,
          quantity: 1,
          unit: 'Visit',
          unitRateJMD: basePrice,
          totalJMD: basePrice
        },
        ...(overtimeMins > 0 ? [{
          description: `Extended Clinical Care Time (${overtimeMins} mins overtime @ JMD $${hourlyRate.toLocaleString()}/hr)`,
          quantity: overtimeMins,
          unit: 'Minutes',
          unitRateJMD: Math.round(overtimeRatePerMin * 10) / 10,
          totalJMD: overtimeFee
        }] : [])
      ]
    };

    const clinicalData: ClinicalNotes = {
      bloodPressure: bp,
      pulseRate: pulse,
      bloodGlucose: glucose,
      oxygenSaturation: spo2,
      temperature: temp,
      medicationsAdministered: medsAdministered || 'None required during visit.',
      careSummary: careSummary || 'Clinical visit carried out adhering to sterile protocol. Patient stable and comfortable.',
      nurseRecommendations: recommendations || 'Continue regular medication schedule and monitoring.',
      completedAt: closeoutEndedAt || new Date().toISOString()
    };

    onUpdateBookingStatus(selectedBookingForCloseout.id, 'completed', clinicalData, {
      visitStartedAt: closeoutStartedAt || selectedBookingForCloseout.visitStartedAt || selectedBookingForCloseout.scheduledDateTime,
      visitEndedAt: closeoutEndedAt || new Date().toISOString(),
      actualDurationMinutes: closeoutMinutes,
      priceJMD: finalTotalCharged,
      platformFeeJMD: finalPlatformFee,
      nurseEarningsJMD: finalNurseEarnings,
      invoiceSummary,
      paymentStatus: 'paid_to_nurse'
    });

    soundFX.playVisitCompleted();
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#F59E0B', '#10B981', '#FFD166']
    });

    // Evaluate milestone achievement for completing visits
    const updatedCount = calculateNurseVisitsCount(currentNurse.id, bookings) + 1;
    const achievedMilestone = INITIAL_PRACTITIONER_MILESTONES.find(
      m => m.category === 'practitioner_visits' && m.targetCount === updatedCount
    );

    if (achievedMilestone) {
      setTimeout(() => {
        soundFX.playVisitCompleted('royal_fanfare');
        setCelebrationPayload({
          milestoneId: achievedMilestone.id,
          title: 'Caregiver Milestone Badge Achieved! 🏆',
          subtitle: `${achievedMilestone.targetCount} Completed Home Visits Milestone`,
          milestoneTitle: `${achievedMilestone.title} Milestone Badge`,
          category: 'practitioner_visits',
          tier: achievedMilestone.tier,
          count: achievedMilestone.targetCount,
          targetRole: 'nurse',
          recipientName: currentNurse.name,
          rewardText: achievedMilestone.rewardLabel,
          motivationalQuote: achievedMilestone.motivationalQuote,
          certificateData: {
            recipientName: currentNurse.name,
            achievementTitle: `${achievedMilestone.title} (${achievedMilestone.targetCount} Home Care Visits)`,
            dateAwarded: new Date().toLocaleDateString('en-JM'),
            issuer: 'We Care Jamaica Clinical Council',
            verificationCode: `WC-NURSE-${achievedMilestone.targetCount}`
          }
        });
      }, 500);
    }

    setSelectedBookingForCloseout(null);
  };

  const formatJMD = (amount: number) => `JMD $${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Nurse Status & Overview Banner */}
      <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#1E1B4B]/20 to-[#F59E0B]/10 blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={currentNurse.photoUrl}
              alt={currentNurse.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg shadow-purple-950/40 shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-white">{currentNurse.name}</h1>
                {currentNurse.status === 'approved' ? (
                  <VerifiedNursingCouncilBadge 
                    nurse={currentNurse} 
                    variant="trust-pill"
                    label="Verified by Council"
                    showLicense={true}
                    size="sm" 
                  />
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> Pending Admin Document Approval
                  </span>
                )}

                {/* Interactive Quick Toggle Status Pill */}
                <button
                  type="button"
                  onClick={handleQuickToggleAvailability}
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                    currentNurse.availabilityStatus === 'offline'
                      ? 'bg-slate-800/95 text-slate-300 hover:text-white border-slate-600 hover:border-slate-500 hover:bg-slate-700'
                      : 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/50'
                  }`}
                  title="Click to instantly toggle status between On-Call & Offline"
                >
                  {currentNurse.availabilityStatus === 'offline' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Status: Offline (Off-Duty)</span>
                      <span className="px-1.5 py-0.2 text-[9px] bg-slate-700 rounded text-slate-300 ml-0.5">Switch to On-Call</span>
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span>Status: On-Call (Dispatch Ready)</span>
                      <span className="px-1.5 py-0.2 text-[9px] bg-emerald-800/60 rounded text-emerald-200 ml-0.5">Switch to Offline</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-purple-200/80 mt-1">
                License: <strong className="text-white font-mono">{currentNurse.nursingCouncilLicense}</strong> • Service Area: Kingston, St. Andrew, Portmore, and Spanish Town
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
                <span>⭐ <strong className="text-white">{currentNurse.rating > 0 ? currentNurse.rating : '5.0'}</strong> Rating ({currentNurse.reviewCount} reviews)</span>
                <span className="text-slate-600">•</span>
                <span>🏥 <strong className="text-white">{currentNurse.completedVisitsCount}</strong> Completed Visits</span>
                <span className="text-slate-600">•</span>
                <span>💰 <strong className="text-emerald-400">Guaranteed Escrow Payouts</strong></span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
            {/* Prominent Quick Toggle Availability Switch */}
            <button
              type="button"
              onClick={handleQuickToggleAvailability}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2.5 border cursor-pointer ${
                currentNurse.availabilityStatus !== 'offline'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 shadow-emerald-950/40 hover:brightness-110'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
              }`}
              title="Quick Toggle: Switch instantly between On-Call & Offline"
            >
              <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                currentNurse.availabilityStatus !== 'offline' ? 'bg-emerald-300/80' : 'bg-slate-600'
              }`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                  currentNurse.availabilityStatus !== 'offline' ? 'transform translate-x-3.5' : ''
                }`} />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-white/70 block -mb-0.5 font-medium">Availability</span>
                <span className="flex items-center gap-1.5 font-extrabold text-xs">
                  {currentNurse.availabilityStatus !== 'offline' ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <span>On-Call (Live)</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3 h-3 text-slate-400" />
                      <span>Offline (Off-Duty)</span>
                    </>
                  )}
                </span>
              </div>
            </button>

            <button
              onClick={() => setIsPreviewProfileOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white text-xs font-bold backdrop-blur-md border border-purple-400/40 transition flex items-center gap-1.5 shadow-sm"
              title="Preview how clients see your verified profile"
            >
              <Eye className="w-3.5 h-3.5 text-[#C77DFF]" /> 
              <span>Preview Public Profile</span>
            </button>

            {/* Caregiver Tools Cascading Dropdown */}
            <ActionDropdown
              label="Tools"
              icon={<Sparkles className="w-4 h-4 text-purple-300" />}
              size="xs"
              variant="secondary"
              align="right"
              items={[
                {
                  id: 'tool-video-admin',
                  label: 'Video Call Admin',
                  sublabel: 'Direct clinical consultation with Sydney Mattis',
                  icon: <Video className="w-4 h-4 text-purple-300" />,
                  onClick: () => {
                    if (onOpenVideoCall) {
                      onOpenVideoCall('Sydney Mattis (Admin & Clinical Director)', 'admin', 'Direct Clinical Consultation & Admin Support');
                    }
                  }
                },
                {
                  id: 'tool-id-card',
                  label: 'Verified We Care ID',
                  sublabel: 'Printable verification card & QR pass (PDF)',
                  icon: <FileBadge className="w-4 h-4 text-emerald-400" />,
                  onClick: () => {
                    soundFX.playIDCardGenerated();
                    setIsIDCardModalOpen(true);
                  }
                },
                {
                  id: 'tool-performance',
                  label: 'Performance Metrics',
                  sublabel: 'Caregiver acceptance rate & analytics',
                  icon: <BarChart3 className="w-4 h-4 text-amber-300" />,
                  onClick: () => {
                    soundFX.playTabSwitch();
                    setActiveTab('performance');
                  }
                },
                {
                  id: 'tool-photo',
                  label: 'Update Profile Photo',
                  sublabel: 'Capture image with device camera',
                  icon: <Camera className="w-4 h-4 text-purple-300" />,
                  onClick: () => setIsCameraModalOpen(true)
                },
                {
                  id: 'tool-export-csv',
                  label: 'Export & Print (CSV)',
                  sublabel: 'Download visit spreadsheets & records',
                  icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
                  divider: true,
                  onClick: () => {
                    setExportModalEntity('bookings');
                    setIsExportModalOpen(true);
                  }
                },
                {
                  id: 'tool-qr-signup',
                  label: 'Fast QR Sign-Up',
                  sublabel: 'Recruit fellow Jamaican nurses & caregivers',
                  icon: <QrCode className="w-4 h-4 text-[#C77DFF]" />,
                  onClick: () => setIsQRCodeModalOpen(true)
                },
                {
                  id: 'tool-launch-kit',
                  label: '1-Page Launch Kit',
                  sublabel: 'Operations & protocol quick guide',
                  icon: <FileText className="w-4 h-4 text-purple-300" />,
                  onClick: onOpenLaunchKit
                },
                {
                  id: 'tool-test-reminder',
                  label: 'Test 30-Min Reminder',
                  sublabel: 'Preview pre-visit chime alert',
                  icon: <Clock className="w-4 h-4 text-amber-300" />,
                  onClick: () => {
                    if (typeof (window as any).__triggerWeCare30MinReminderTest === 'function') {
                      (window as any).__triggerWeCare30MinReminderTest();
                    } else {
                      soundFX.triggerNotification(
                        '⏰ 30-Minute Visit Reminder: Upcoming Patient Arrival',
                        'Visit begins in 30 minutes. Verify PPE, wound dressing kit and travel route.',
                        'visit_reminder_30min'
                      );
                    }
                  }
                }
              ]}
            />

            {/* Sleek Nurse 119 Panic Button */}
            <button
              type="button"
              onClick={() => onOpenPanic()}
              className="px-2.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
              title="Immediate emergency panic alert to admin & 119 response"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>119</span>
            </button>
          </div>
        </div>

        {/* Weekly Payout Summary Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div 
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('payouts');
            }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer transition group"
            title="Click to view full Payout History"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Pending Friday Payout</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 transition" />
            </div>
            <span className="text-base font-black text-emerald-400 mt-0.5 block">{formatJMD(currentNurse.pendingPayoutJMD)}</span>
          </div>

          <div 
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('payouts');
            }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer transition group"
            title="Click to view historical remittances"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total Net Earnings</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white opacity-60 group-hover:opacity-100 transition" />
            </div>
            <span className="text-base font-black text-white mt-0.5 block">{formatJMD(currentNurse.totalEarningsJMD)}</span>
          </div>

          <div 
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('active');
            }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Active Visits</span>
              <Clock className="w-3.5 h-3.5 text-[#C77DFF]" />
            </div>
            <span className="text-base font-black text-[#C77DFF] mt-0.5 block">{activeVisits.length} Visits</span>
          </div>

          <div 
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('payouts');
            }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer transition group"
          >
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Payout Method</span>
            <span className="text-xs font-semibold text-emerald-300 mt-0.5 block truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              {currentNurse.bankDetails?.bankName.split(' ')[0] || 'NCB'} Direct
            </span>
          </div>
        </div>
      </div>

      {/* 60-Day Police Record Compliance & Tracking Banner */}
      <PoliceRecord60DayBanner
        nurse={currentNurse}
        onUpdateNurse={onUpdateNurseProfile}
      />

      {/* Instant Availability Status Feedback Notification */}
      {availabilityNotice && (
        <div className={`p-4 rounded-2xl border backdrop-blur-xl animate-fadeIn flex items-center justify-between gap-3 shadow-lg ${
          currentNurse.availabilityStatus !== 'offline'
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50'
            : 'bg-slate-900/90 border-slate-600 text-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            {currentNurse.availabilityStatus !== 'offline' ? (
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            ) : (
              <Moon className="w-5 h-5 text-slate-400 shrink-0" />
            )}
            <p className="text-xs font-semibold leading-relaxed">
              {availabilityNotice}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAvailabilityNotice(null)}
            className="text-xs font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Toggle Availability Switch & Geofence Boundary Controller */}
      <NurseAvailabilityGeofenceCard
        nurse={currentNurse}
        onUpdateNurseProfile={onUpdateNurseProfile}
        activeBookingsCount={activeVisits.length}
      />

      {/* Live In-Progress Care Visit Floating / Top HUD Banner */}
      {inProgressVisits.length > 0 && (
        <InProgressVisitTimerBanner
          booking={inProgressVisits[0]}
          onNavigateToActiveTab={() => {
            soundFX.playTabSwitch();
            setActiveTab('active');
          }}
          onOpenCloseoutModal={(b, calcMins, startIso, endIso) => {
            handleOpenCloseoutModal(b, calcMins, startIso, endIso);
          }}
          onUpdateBookingStatus={onUpdateBookingStatus}
        />
      )}

      {/* Navigation Tabs - Consolidated Cascading Action Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2.5 overflow-x-auto">
        {/* 1. Offers */}
        <button
          onClick={() => {
            soundFX.playTabSwitch();
            setActiveTab('requests');
          }}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'requests' 
              ? 'bg-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30' 
              : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
          }`}
          title="Incoming job offers and visit dispatch pool"
        >
          <Activity className="w-4 h-4 text-purple-300 shrink-0" />
          <span>Offers</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#F59E0B] text-white text-[9px] font-black">
              {pendingRequests.length}
            </span>
          )}
        </button>

        {/* 2. Active Visits */}
        <button
          onClick={() => {
            soundFX.playTabSwitch();
            setActiveTab('active');
          }}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'active' 
              ? 'bg-[#1E1B4B] text-white shadow-lg shadow-purple-950/50 border border-purple-400/30' 
              : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
          }`}
          title="Current assigned visits and in-progress timer"
        >
          <Clock className="w-4 h-4 text-purple-300 shrink-0" /> 
          <span>Visits</span>
          {inProgressVisits.length > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-[9px] font-black flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {inProgressVisits.length} Live
            </span>
          ) : activeVisits.length > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 text-[9px] font-bold">
              {activeVisits.length}
            </span>
          ) : null}
        </button>

        {/* 3. Financials (Cascading Dropdown: Earnings + Payouts) */}
        <ActionDropdown
          label={activeTab === 'payouts' ? 'Payouts' : 'Financials'}
          icon={<DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />}
          size="sm"
          variant={activeTab === 'earnings' || activeTab === 'payouts' ? 'activeTab' : 'tab'}
          items={[
            {
              id: 'fin-earnings',
              label: 'Earnings & Statements',
              sublabel: 'Weekly earnings, deductions & escrow balance',
              icon: <DollarSign className="w-4 h-4 text-purple-300" />,
              onClick: () => {
                soundFX.playTabSwitch();
                setActiveTab('earnings');
              }
            },
            {
              id: 'fin-payouts',
              label: 'Payout History',
              sublabel: 'Settled bank deposits & remittances',
              icon: <Receipt className="w-4 h-4 text-emerald-400" />,
              badge: (payouts || []).filter(p => p.nurseId === currentNurse.id || p.nurseName === currentNurse.name).length,
              onClick: () => {
                soundFX.playTabSwitch();
                setActiveTab('payouts');
              }
            }
          ]}
        />

        {/* 4. Credentials & Badges (Cascading Dropdown: Skills, Milestones, Performance, License) */}
        <ActionDropdown
          label={
            activeTab === 'skill_badges'
              ? 'Badges'
              : activeTab === 'milestones'
              ? 'Milestones'
              : activeTab === 'performance'
              ? 'Metrics'
              : activeTab === 'profile'
              ? 'Credentials'
              : 'Credentials'
          }
          icon={<BadgeCheck className="w-4 h-4 text-purple-300 shrink-0" />}
          size="sm"
          variant={['skill_badges', 'performance', 'milestones', 'profile'].includes(activeTab) ? 'activeTab' : 'tab'}
          items={[
            {
              id: 'cred-skills',
              label: 'Specialized Skill Badges',
              sublabel: 'Clinical skills, verifications & credentials',
              icon: <BadgeCheck className="w-4 h-4 text-emerald-400" />,
              badge: (currentNurse.skillBadges || []).filter(b => b.status === 'verified').length,
              onClick: () => {
                soundFX.playTabSwitch();
                setActiveTab('skill_badges');
              }
            },
            {
              id: 'cred-milestones',
              label: 'Practitioner Milestones',
              sublabel: 'Visit milestones & level achievements',
              icon: <Award className="w-4 h-4 text-amber-400" />,
              onClick: () => {
                soundFX.playTabSwitch();
                setActiveTab('milestones');
              }
            },
            {
              id: 'cred-performance',
              label: 'Performance Metrics',
              sublabel: 'Caregiver acceptance rate & analytics',
              icon: <BarChart3 className="w-4 h-4 text-purple-400" />,
              onClick: () => {
                soundFX.playTabSwitch();
                setActiveTab('performance');
              }
            },
            {
              id: 'cred-license',
              label: 'NCJ License & Bio',
              sublabel: 'Nursing council registration & profile',
              icon: <UserCheck className="w-4 h-4 text-blue-400" />,
              onClick: () => {
                soundFX.playTabSwitch();
                setActiveTab('profile');
              }
            }
          ]}
        />

        {/* 5. Community & Reviews (Cascading Dropdown: Peer Network + Reviews) */}
        <ActionDropdown
          label={activeTab === 'reviews' ? 'Reviews' : activeTab === 'network' ? 'Network' : 'Community'}
          icon={<Users className="w-4 h-4 text-fuchsia-300 shrink-0" />}
          size="sm"
          variant={['network', 'reviews'].includes(activeTab) ? 'activeTab' : 'tab'}
          items={[
            {
              id: 'comm-network',
              label: 'Peer Nurse Network',
              sublabel: 'Chat with verified Jamaican colleagues',
              icon: <Users className="w-4 h-4 text-[#C77DFF]" />,
              badge: `${nurses.filter(n => n.status === 'approved' && n.id !== currentNurse.id).length} Active`,
              onClick: () => {
                soundFX.playTabSwitch();
                setActiveTab('network');
              }
            },
            {
              id: 'comm-reviews',
              label: 'Patient Reviews & Feedback',
              sublabel: 'Client ratings, testimonials & clinical praise',
              icon: <Star className="w-4 h-4 text-amber-400" />,
              onClick: () => {
                soundFX.playTabSwitch();
                setActiveTab('reviews');
              }
            }
          ]}
        />
      </div>

      {/* TAB: INCOMING REQUESTS (BROADCAST DISPATCH) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Incoming Visit Offers in Kingston &amp; St Andrew</h3>
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>45s Smart Dispatch Window • Auto-cascades if unaccepted</span>
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-300 flex items-center justify-center mx-auto border border-purple-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">No Pending Broadcasts</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When clients book in your selected zones ({currentNurse.zones.join(', ')}), notifications appear here instantly.
              </p>
            </div>
          ) : (
            <SmartBookingSearch
              bookings={pendingRequests}
              placeholder="Filter incoming offers by patient, Kingston zone, condition, or service..."
            >
              {(filteredOffers) => (
                filteredOffers.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center space-y-2 text-slate-400 text-xs">
                    No incoming visit offers match your current search filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredOffers.map((req, reqIdx) => (
                <div
                  key={req?.id ? `offer-${req.id}-${reqIdx}` : `offer-idx-${reqIdx}`}
                  className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-purple-500/30 shadow-xl space-y-3.5 hover:border-purple-400 transition text-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <ServiceLogo serviceName={req.serviceName} size="md" showBadge={false} withGlow={true} />
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B] text-white">
                          New Home Visit Request
                        </span>
                        <h4 className="font-bold text-white text-base mt-1">{req.serviceName}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-xs text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                            <span>{req.zone}, Kingston</span>
                          </p>
                          <NavigateToLocationButton
                            address={req.clientAddress || req.zone}
                            zone={req.zone}
                            size="xs"
                            variant="subtle"
                            label="View Route"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-emerald-300 font-bold block uppercase tracking-wider">Your Guaranteed Payout</span>
                      <span className="text-xl font-black text-emerald-400">{formatJMD(req.nurseEarningsJMD)}</span>
                      <span className="text-[10px] text-slate-400 block">Direct Escrow Transfer</span>
                    </div>
                  </div>

                  {/* Procedure Visual Showcase Banner */}
                  {(() => {
                    const procVis = getProcedureVisual(req.serviceId, req.serviceName);
                    const clientRep = getClientReputation(req.clientName, req.clientId);
                    return (
                      <>
                        <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-slate-900 border border-purple-500/20 group">
                          <img
                            src={procVis.imageUrl}
                            alt={req.serviceName}
                            className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-purple-600/90 text-white font-bold text-[10px] backdrop-blur-md shadow">
                              {procVis.categoryBadge}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black/60 text-slate-200 text-[10px] backdrop-blur-md border border-white/10">
                              {req.baseDurationMinutes || 60} mins
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                            <span className="text-white font-bold text-xs drop-shadow truncate">Clinical Prep: {procVis.clinicalEquipment.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>

                        {/* Client Card with Small Photo & Nurse Rating */}
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={req.clientPhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                              alt={req.clientName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-purple-400 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white text-xs truncate">{req.clientName}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase shrink-0 ${
                                  clientRep.isFirstTime
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                }`}>
                                  {clientRep.userTypeLabel}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 truncate mt-0.5">{req.clientAddress || req.zone}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 justify-end">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-black text-white text-xs">{clientRep.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-[9px] text-amber-300/80 block font-semibold">
                              Nurse Rated ({clientRep.reviewCount} revs)
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="p-2.5 rounded-xl bg-black/30 text-xs text-slate-300 border border-white/5 flex items-center justify-between">
                    <span><strong className="text-white">Scheduled:</strong> {new Date(req.scheduledDateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[10px] text-purple-300 font-mono">PIN Check Required</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setSelectedBookingForPrompt(req)}
                      className="flex-1 py-2.5 rounded-xl border border-purple-400/40 bg-purple-600/20 text-purple-200 font-bold text-xs hover:bg-purple-600/30 transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review &amp; Respond
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playCancellation();
                        if (onRerouteBooking) {
                          onRerouteBooking(req.id, 'Declined by caregiver in incoming offers tab');
                        } else {
                          onUpdateBookingStatus(req.id, 'cancelled');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-300 font-bold text-xs hover:bg-red-500/10 transition cursor-pointer"
                      title="Decline this request and auto-transfer to the next available practitioner"
                    >
                      Decline &amp; Reroute
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playToggleClick();
                        setAcceptingJobForSuppliesChecklist(req);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Review required supplies checklist and accept job"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept Job
                    </button>
                  </div>
                </div>
              ))}
                  </div>
                )
              )}
            </SmartBookingSearch>
          )}
        </div>
      )}

      {/* TAB: ACTIVE CARE VISITS */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>Current Assigned Visits ({activeVisits.length})</span>
                {inProgressVisits.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {inProgressVisits.length} In-Progress Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kingston &amp; St Andrew Patients • Live clinical timer, vitals &amp; transparent billing
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setExportModalEntity('bookings');
                  setIsExportModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setExportModalEntity('bookings');
                  setIsExportModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Schedule</span>
              </button>
            </div>
          </div>

          {activeVisits.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center text-slate-400 text-xs">
              No active visits assigned. Accept incoming requests above to start a visit.
            </div>
          ) : (
            <SmartBookingSearch
              bookings={activeVisits}
              placeholder="Smart Search: patient, booking #BK, Kingston zone, clinical condition, medications..."
            >
              {(filteredActiveList) => (
                filteredActiveList.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center space-y-2 text-slate-400 text-xs">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-300">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">No Matching Visits Found</h4>
                    <p className="max-w-md mx-auto text-slate-400">
                      No active visits match your current search query or parish filter. Try searching for a different patient, #BK ID, or clear your filters.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {[...filteredActiveList]
                      .sort((a, b) => {
                        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
                        if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
                        return 0;
                      })
                      .map((booking, bIdx) => {
                  const isInProgress = booking.status === 'in_progress';
                  return (
                    <div
                      key={booking?.id ? `active-booking-${booking.id}-${bIdx}` : `active-booking-idx-${bIdx}`}
                      className={`p-5 rounded-3xl backdrop-blur-xl space-y-4 text-white transition-all ${
                        isInProgress
                          ? 'bg-gradient-to-br from-emerald-950/45 via-purple-950/25 to-[#170624] border-2 border-emerald-500/60 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                          : 'bg-white/[0.04] border border-white/10 shadow-xl'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex items-start gap-3">
                          <ServiceLogo serviceName={booking.serviceName} size="md" showBadge={false} withGlow={true} />
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              {isInProgress ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 flex items-center gap-1.5 shadow-sm">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                  <span>In-Progress Care Visit • Timer Running</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                                  Status: {booking.status}
                                </span>
                              )}
                              <span className="text-xs font-mono text-purple-300/70">#{booking.id}</span>
                              <PPEReadyBadge booking={booking} />
                              {booking.visitStartedAt && (
                                <span className="text-[11px] font-mono font-semibold text-slate-300 bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-emerald-400" />
                                  Clocked in: {new Date(booking.visitStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <h4 className="font-extrabold text-white text-base">{booking.serviceName}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                                <strong className="text-white">{booking.clientAddress}</strong> ({booking.zone})
                              </p>
                              <NavigateToLocationButton
                                address={booking.clientAddress}
                                zone={booking.zone}
                                lat={booking.nurseLiveLat}
                                lng={booking.nurseLiveLng}
                                size="xs"
                                variant="primary"
                                label="Maps"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-right">
                          <div className="flex items-center gap-2">
                            <QuickSOSButton
                              booking={booking}
                              userRole="nurse"
                              onUpdateBookingStatus={onUpdateBookingStatus}
                              onTriggerNotification={onTriggerNotification}
                              size="sm"
                            />
                            <div>
                              <span className="text-xs text-slate-400 block">Your Payout</span>
                              <span className="text-base font-black text-emerald-400">{formatJMD(booking.nurseEarningsJMD)}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 block">(15% fee deducted)</span>
                        </div>
                      </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Client Details</span>
                      <strong className="text-white">{booking.clientName}</strong>
                      <span className="text-slate-300 block">{booking.clientPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                      <strong className="text-white">{booking.clientEmergencyContact.name} ({booking.clientEmergencyContact.relation})</strong>
                      <span className="text-slate-300 block">{booking.clientEmergencyContact.phone}</span>
                    </div>
                  </div>

                  {/* Patient Health Requirements & Medication Reminder Clock */}
                  <PatientMedicationReminderCard 
                    booking={booking}
                    onLogMedicationAdministered={(medId, medName) => {
                      onUpdateBookingStatus(booking.id, booking.status, undefined, {
                        medicationsAdministeredLog: [
                          ...(booking.medicationsAdministeredLog || []),
                          {
                            medicationId: medId,
                            medicationName: medName,
                            administeredAt: new Date().toISOString(),
                            administeredBy: currentNurse.name
                          }
                        ]
                      });
                    }}
                  />

                  {/* Progressive Visit Actions & Live Timer */}
                  <div className="space-y-4 pt-2">
                    {/* Confirmed Booking & Arrival PPE Safety Reminder */}
                    <PPESafetyNotice
                      variant={booking.status === 'in_progress' ? 'on_arrival' : 'compact'}
                      userRole="nurse"
                    />

                    {/* Interactive PPE Protection Responsibility Toggle */}
                    <PPEToggle
                      booking={booking}
                      userRole="nurse"
                      onUpdateBookingStatus={onUpdateBookingStatus}
                      className="my-1"
                    />

                    {/* Compact Doorstep Arrival & ETA Dispatch Strip */}
                    {(booking.status === 'accepted' || booking.status === 'en_route' || booking.status === 'in_progress') && (
                      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-2.5 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-[#C77DFF] shrink-0" />
                          <span className="text-[11px] font-bold text-white">
                            Arrival &amp; Doorbell Dispatch
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <NotifyArrivalButton
                            booking={booking}
                            currentNurseName={currentNurse.name}
                            onUpdateBookingStatus={onUpdateBookingStatus}
                            onTriggerNotification={onTriggerNotification}
                            size="sm"
                          />
                          <ArrivalDoorbellAlertButton
                            booking={booking}
                            currentNurseName={currentNurse.name}
                            onUpdateBookingStatus={onUpdateBookingStatus}
                            onTriggerNotification={onTriggerNotification}
                            variant="compact"
                          />
                        </div>
                      </div>
                    )}

                    {/* Embedded Live Timer & Auto-Invoice Widget */}
                    <VisitTimerWidget
                      booking={booking}
                      onStartTimer={handleStartVisitTimer}
                      onEndTimer={(bookingId, totalMins, startIso, endIso) => {
                        handleOpenCloseoutModal(booking, totalMins, startIso, endIso);
                      }}
                      onOpenArrivalScanner={(b) => handleOpenQRScanner(b, 'check_in')}
                      onVerifyArrivalSuccess={(bookingId, arrivalData) => {
                        onUpdateBookingStatus(bookingId, 'in_progress', undefined, {
                          ...arrivalData,
                          status: 'in_progress'
                        });
                      }}
                    />

                    {/* Unified Professional Care Actions Bar with Cascading Dropdowns */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                      {/* Left: Communication & Clinical Cascading Dropdowns */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Contact Cascading Dropdown */}
                        <ActionDropdown
                          label="Contact"
                          icon={<Phone className="w-4 h-4 text-emerald-400 shrink-0" />}
                          size="sm"
                          variant="emerald"
                          items={[
                            {
                              id: 'call-patient',
                              label: 'Voice Call',
                              sublabel: booking.clientPhone,
                              icon: <Phone className="w-4 h-4 text-emerald-400" />,
                              onClick: () => setSelectedBookingForCallModal(booking)
                            },
                            {
                              id: 'chat-patient',
                              label: 'Live Chat',
                              sublabel: 'Encrypted message channel',
                              icon: <MessageSquare className="w-4 h-4 text-purple-300" />,
                              badge: booking.unreadMessagesCount ? `${booking.unreadMessagesCount}` : undefined,
                              onClick: () => onOpenChat(booking)
                            },
                            {
                              id: 'video-patient',
                              label: 'Telehealth Video',
                              sublabel: 'Secure video consultation',
                              icon: <Video className="w-4 h-4 text-purple-300" />,
                              onClick: () => {
                                if (onOpenVideoCall) {
                                  onOpenVideoCall(booking.clientName, 'client', `Telehealth Video with Patient ${booking.clientName}`);
                                }
                              }
                            }
                          ]}
                        />

                        {/* 2. Clinical Charting Cascading Dropdown */}
                        <ActionDropdown
                          label="Clinical"
                          icon={<FileText className="w-4 h-4 text-purple-300 shrink-0" />}
                          size="sm"
                          variant="purple"
                          items={[
                            {
                              id: 'clinical-notes',
                              label: 'Dictate Notes & Charting',
                              sublabel: 'Voice-to-text clinical documentation',
                              icon: <Mic className="w-4 h-4 text-amber-300" />,
                              onClick: () => setSelectedBookingForDetailModal(booking)
                            },
                            {
                              id: 'biometric-vitals',
                              label: 'Biometric Health Scan',
                              sublabel: 'Camera pulse & oxygen telemetry',
                              icon: <Activity className="w-4 h-4 text-emerald-400" />,
                              onClick: () => setSelectedBookingForBiometricScan(booking)
                            },
                            {
                              id: 'medical-summary',
                              label: 'Medical Summary',
                              sublabel: 'Patient allergies, meds & conditions',
                              icon: <FileCheck className="w-4 h-4 text-blue-300" />,
                              onClick: () => setSelectedBookingForMedicalSummary(booking)
                            }
                          ]}
                        />

                        {/* SOS & Panic */}
                        <QuickSOSButton
                          booking={booking}
                          userRole="nurse"
                          onUpdateBookingStatus={onUpdateBookingStatus}
                          onTriggerNotification={onTriggerNotification}
                          size="sm"
                        />

                        <button
                          type="button"
                          onClick={() => onOpenPanic(booking)}
                          className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                          title="Trigger 119 Emergency Panic"
                        >
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          <span>119</span>
                        </button>
                      </div>

                      {/* Right: Operational Status & QR Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Doorstep Location-Based QR Attendance Verification (Check-In) */}
                        {booking.arrivalVerified ? (
                          <div
                            onClick={() => handleOpenQRScanner(booking, 'check_in')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[11px] font-bold shadow-sm cursor-pointer hover:bg-emerald-500/30 transition"
                            title={`Check-In confirmed via QR scan at ${booking.arrivalVerifiedAt ? new Date(booking.arrivalVerifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>QR Verified</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenQRScanner(booking, 'check_in')}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black text-[11px] transition shadow-md flex items-center gap-1.5 cursor-pointer animate-pulse"
                            title="Scan the patient's QR code on doorstep"
                          >
                            <QrCode className="w-4 h-4 text-slate-950" />
                            <span>Scan QR</span>
                          </button>
                        )}

                        {/* Status & Transit Cascading Dropdown */}
                        {booking.status === 'accepted' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateBookingStatus(booking.id, 'in_progress', undefined, {
                                  visitStartedAt: new Date().toISOString()
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                              title="Begin the visit care timer immediately"
                            >
                              <Timer className="w-4 h-4 text-white" />
                              <span>Start Care</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateBookingStatus(booking.id, 'en_route')}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Car className="w-4 h-4 text-white" />
                              <span>En Route</span>
                            </button>
                            <ActionDropdown
                              label="Status"
                              icon={<ChevronDown className="w-3.5 h-3.5 text-blue-200" />}
                              size="xs"
                              variant="secondary"
                              align="right"
                              items={[
                                {
                                  id: 'transit-start-care',
                                  label: 'Start Care (Direct Clock-In)',
                                  sublabel: 'Begin care visit and activate clinical timer',
                                  icon: <Timer className="w-4 h-4 text-emerald-400" />,
                                  onClick: () => {
                                    onUpdateBookingStatus(booking.id, 'in_progress', undefined, {
                                      visitStartedAt: new Date().toISOString()
                                    });
                                  }
                                },
                                {
                                  id: 'transit-en-route',
                                  label: 'Mark En Route',
                                  sublabel: 'Notify client you have begun travel',
                                  icon: <Car className="w-4 h-4 text-blue-400" />,
                                  onClick: () => onUpdateBookingStatus(booking.id, 'en_route')
                                }
                              ]}
                            />
                          </div>
                        )}

                        {booking.status === 'en_route' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateBookingStatus(booking.id, 'in_progress', undefined, {
                                  visitStartedAt: new Date().toISOString()
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Timer className="w-4 h-4" />
                              <span>Start Care</span>
                            </button>
                            <ActionDropdown
                              label="Transit"
                              icon={<ChevronDown className="w-3.5 h-3.5 text-emerald-200" />}
                              size="xs"
                              variant="secondary"
                              align="right"
                              items={[
                                {
                                  id: 'transit-arrive-clock',
                                  label: 'Arrived & Start Care',
                                  sublabel: 'At patient home, start official visit timer',
                                  icon: <Timer className="w-4 h-4 text-emerald-400" />,
                                  onClick: () => {
                                    onUpdateBookingStatus(booking.id, 'in_progress', undefined, {
                                      visitStartedAt: new Date().toISOString()
                                    });
                                  }
                                },
                                {
                                  id: 'transit-qr-scan',
                                  label: 'Doorstep Check-In QR',
                                  sublabel: 'Scan patient doorstep QR attendance',
                                  icon: <QrCode className="w-4 h-4 text-[#C77DFF]" />,
                                  onClick: () => handleOpenQRScanner(booking, 'check_in')
                                }
                              ]}
                            />
                          </div>
                        )}

                        {booking.status === 'in_progress' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenCloseoutModal(booking)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-95 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                              title="End care visit and document clinical vitals"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>End Care</span>
                            </button>
                            <ActionDropdown
                              label="Visit"
                              icon={<ChevronDown className="w-3.5 h-3.5 text-purple-200" />}
                              size="xs"
                              variant="secondary"
                              align="right"
                              items={[
                                {
                                  id: 'visit-checkout-qr',
                                  label: 'Scan Check-Out QR',
                                  sublabel: 'Scan patient sign-off QR pass',
                                  icon: <QrCode className="w-4 h-4 text-purple-300" />,
                                  onClick: () => handleOpenQRScanner(booking, 'check_out')
                                },
                                {
                                  id: 'visit-closeout-modal',
                                  label: 'Finalize & Closeout',
                                  sublabel: 'Complete billing & generate invoice',
                                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
                                  onClick: () => handleOpenCloseoutModal(booking)
                                },
                                {
                                  id: 'visit-dictate-notes',
                                  label: 'Dictate Clinical Notes',
                                  sublabel: 'Record voice observations & charting',
                                  icon: <Mic className="w-4 h-4 text-amber-300" />,
                                  divider: true,
                                  onClick: () => setSelectedBookingForDetailModal(booking)
                                }
                              ]}
                            />
                          </div>
                        )}

                        {booking.checkoutVerified && (
                          <div
                            onClick={() => handleOpenQRScanner(booking, 'check_out')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/50 text-[11px] font-bold shadow-xs cursor-pointer hover:bg-purple-500/30 transition"
                          >
                            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>Checked Out</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
                  </div>
                )
              )}
            </SmartBookingSearch>
          )}
        </div>
      )}

      {/* TAB: EARNINGS & STATEMENTS */}
      {activeTab === 'earnings' && (
        <div className="space-y-5">
          {/* Practitioner Compensation & Signed Contract Access */}
          <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>We Care Practitioner Compensation &amp; Payout Summary</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  All clinical payouts are held in escrow and deposited directly upon visit verification.
                </p>
              </div>

              {/* DEDICATED SECTION FOR NURSE TO VIEW THEIR SIGNED AGREEMENT */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playTabSwitch();
                  setIsContractAgreementOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition flex items-center gap-2 shadow-lg shadow-purple-950/50 border border-purple-400/40 cursor-pointer shrink-0"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>View My Signed Practitioner Agreement</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-[10px] font-bold text-[#C77DFF] uppercase block tracking-wider">Net Direct Remittance</span>
                <span className="text-2xl font-black text-[#C77DFF] mt-1 block">Direct Escrow</span>
                <p className="text-slate-300 mt-1">Transferred directly to your verified NCB, BNS, JN, or Lynk wallet account.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Legal Terms &amp; Rates</span>
                <span className="text-2xl font-black text-white mt-1 block">Contracted</span>
                <p className="text-slate-300 mt-1">Full rate schedule and terms are archived in your signed practitioner agreement.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block tracking-wider">Weekly Settlement Cycle</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">Every Friday</span>
                <p className="text-slate-300 mt-1">Automated batch deposit for all completed &amp; closed clinical visits.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-3 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="font-bold text-white text-sm">Recent Completed Visits &amp; Ledger</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExportModalEntity('bookings');
                    setIsExportModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Earnings Ledger CSV</span>
                </button>
                <span className="text-xs text-purple-300">All invoices verified &amp; settled</span>
              </div>
            </div>

            <div className="divide-y divide-white/10 text-xs">
              {completedVisits.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No completed visits yet in this billing cycle.</div>
              ) : (
                completedVisits.map((b) => (
                  <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{b.serviceName}</strong>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {b.actualDurationMinutes || b.baseDurationMinutes || 45} mins care
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs flex flex-wrap items-center gap-2">
                        <span>{b.clientName} ({b.zone})</span>
                        <span>•</span>
                        <span>{new Date(b.scheduledDateTime).toLocaleDateString()}</span>
                        {b.actualDurationMinutes && b.baseDurationMinutes && b.actualDurationMinutes > b.baseDurationMinutes && (
                          <span className="text-amber-300 font-medium">
                            (+{b.actualDurationMinutes - b.baseDurationMinutes}m overtime billed)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="font-black text-emerald-400 text-base block">+{formatJMD(b.nurseEarningsJMD)}</span>
                        <span className="text-[10px] text-slate-400">Total: {formatJMD(b.priceJMD)}</span>
                      </div>

                      <button
                        onClick={() => setSelectedBookingForInvoiceModal(b)}
                        className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#C77DFF]" />
                        <span>Invoice Receipt</span>
                      </button>

                      <button
                        onClick={() => setSelectedBookingForMedicalSummary(b)}
                        className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                        title="Download official clinical notes & visit summary (PDF)"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Medical Summary (PDF)</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick link banner to Payout History */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-emerald-950/40 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Receipt className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-white">Need Official Remittance Statements?</h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  View your complete table of previous successful payouts, ACH bank deposit codes, and transaction statuses.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('payouts')}
              className="px-5 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-2 shrink-0 shadow-lg shadow-purple-950/50"
            >
              <span>Open Payout History</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB: PAYOUT HISTORY */}
      {activeTab === 'payouts' && (
        <NursePayoutHistoryView
          nurse={currentNurse}
          payouts={payouts}
          allBookings={bookings}
          onOpenInvoiceModal={(b) => setSelectedBookingForInvoiceModal(b)}
        />
      )}

      {/* TAB: NCJ LICENSE & ONBOARDING FORM */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-5 max-w-2xl text-white">
          <div className="pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Nurse Credentials &amp; Verification (NCJ)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Independent contractor registration for Kingston &amp; St Andrew parish healthcare visits.
            </p>
          </div>

          {/* Official Document & Nursing Council Badge Status */}
          {currentNurse.status === 'approved' ? (
            <VerifiedNursingCouncilBadge nurse={currentNurse} variant="card" showLicense={true} />
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Documents Submitted • Awaiting Admin NCJ Verification</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Your Nursing Council of Jamaica license (<strong className="text-white font-mono">{currentNurse.nursingCouncilLicense}</strong>) and government ID are currently under administrative review. Once verified by an administrator, the official <strong>'Verified by Nursing Council'</strong> visual badge will automatically activate on your public profile and proximity cards.
              </p>
            </div>
          )}

          {/* Official Verified We Care ID Card Presentation & Print Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-900/30 to-emerald-950/40 border border-amber-400/40 flex flex-wrap items-center justify-between gap-4 text-xs shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-md relative shrink-0 bg-slate-800">
                <img 
                  src={currentNurse.photoUrl} 
                  alt={currentNurse.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-bold text-amber-300 text-center py-0.5 font-mono">
                  ID
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-white text-sm">Verified We Care ID Card</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                    NCJ Verified
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-400/30">
                    PRINTABLE PDF
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Official clinical credential badge featuring your professional verification status, photo, NCJ license (<strong className="text-white font-mono">{currentNurse.nursingCouncilLicense}</strong>), and instant verification QR code.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playIDCardGenerated();
                setIsIDCardModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 border border-amber-300/50 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Generate & print Verified We Care ID card as PDF"
            >
              <FileBadge className="w-3.5 h-3.5 text-slate-950" />
              <span>Generate ID Card (PDF)</span>
            </button>
          </div>

          {/* Specialized Skill Badges Quick Link / Status */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-emerald-950/50 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Specialized Clinical Skill Badges</span>
                <span className="text-[11px] text-slate-300">
                  {(currentNurse.skillBadges || []).filter(b => b.status === 'verified').length} verified skill badge(s) active on your public profile.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFX.playTabSwitch();
                setActiveTab('skill_badges');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
            >
              <span>Manage Badges</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Profile and credentials updated successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Full Legal Nurse Name</label>
              <input
                type="text"
                value={onboardingName}
                onChange={(e) => setOnboardingName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:ring-2 focus:ring-[#1E1B4B]/40 focus:border-purple-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Jamaican Phone (+1 876)</label>
              <input
                type="text"
                value={onboardingPhone}
                onChange={(e) => setOnboardingPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:ring-2 focus:ring-[#1E1B4B]/40 focus:border-purple-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Nursing Council License #</label>
              <input
                type="text"
                value={onboardingLicense}
                onChange={(e) => setOnboardingLicense(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs focus:ring-2 focus:ring-[#1E1B4B]/40 focus:border-purple-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Years Clinical Experience</label>
              <input
                type="number"
                value={onboardingExp}
                onChange={(e) => setOnboardingExp(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:ring-2 focus:ring-[#1E1B4B]/40 focus:border-purple-400"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 block">
                Coverage Neighborhoods (Select all areas you are willing to travel to)
              </label>
              <span className="text-[11px] text-purple-300 font-semibold">
                {selectedZones.length} Selected
              </span>
            </div>

            {/* Region 1: Kingston & St Andrew */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C77DFF] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Kingston &amp; St Andrew
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const allIn = KINGSTON_ZONES.every(z => selectedZones.includes(z));
                    if (allIn) {
                      setSelectedZones(selectedZones.filter(z => !KINGSTON_ZONES.includes(z)));
                    } else {
                      setSelectedZones(Array.from(new Set([...selectedZones, ...KINGSTON_ZONES])));
                    }
                  }}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  {KINGSTON_ZONES.every(z => selectedZones.includes(z)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {KINGSTON_ZONES.map((zone) => {
                  const isSelected = selectedZones.includes(zone);
                  return (
                    <button
                      type="button"
                      key={zone}
                      onClick={() => toggleZone(zone)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
                        isSelected
                          ? 'bg-[#1E1B4B] text-white shadow-md border border-purple-400/40'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {zone}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Region 2: Portmore */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Portmore (St Catherine)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const allIn = PORTMORE_ZONES.every(z => selectedZones.includes(z));
                    if (allIn) {
                      setSelectedZones(selectedZones.filter(z => !PORTMORE_ZONES.includes(z)));
                    } else {
                      setSelectedZones(Array.from(new Set([...selectedZones, ...PORTMORE_ZONES])));
                    }
                  }}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  {PORTMORE_ZONES.every(z => selectedZones.includes(z)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PORTMORE_ZONES.map((zone) => {
                  const isSelected = selectedZones.includes(zone);
                  return (
                    <button
                      type="button"
                      key={zone}
                      onClick={() => toggleZone(zone)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-md border border-sky-400/40'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {String(zone || '').replace('Portmore - ', '')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Region 3: Spanish Town */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Spanish Town (St Catherine)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const allIn = SPANISH_TOWN_ZONES.every(z => selectedZones.includes(z));
                    if (allIn) {
                      setSelectedZones(selectedZones.filter(z => !SPANISH_TOWN_ZONES.includes(z)));
                    } else {
                      setSelectedZones(Array.from(new Set([...selectedZones, ...SPANISH_TOWN_ZONES])));
                    }
                  }}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  {SPANISH_TOWN_ZONES.every(z => selectedZones.includes(z)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SPANISH_TOWN_ZONES.map((zone) => {
                  const isSelected = selectedZones.includes(zone);
                  return (
                    <button
                      type="button"
                      key={zone}
                      onClick={() => toggleZone(zone)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md border border-emerald-400/40'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {String(zone || '').replace('Spanish Town - ', '')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Banking / Lynk Payout Details */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-purple-400" />
              Jamaican Banking Details for Weekly Friday Payouts
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Bank Name</label>
                <select
                  value={onboardingBankName}
                  onChange={(e) => setOnboardingBankName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-white/15 bg-[#1a0b28] text-white text-xs"
                >
                  <option value="National Commercial Bank (NCB) Jamaica">National Commercial Bank (NCB)</option>
                  <option value="Scotiabank Jamaica">Scotiabank Jamaica</option>
                  <option value="JN Bank Jamaica">JN Bank Jamaica</option>
                  <option value="First Global Bank Jamaica">First Global Bank</option>
                  <option value="Sagicor Bank Jamaica">Sagicor Bank</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={onboardingAccount}
                  onChange={(e) => setOnboardingAccount(e.target.value)}
                  className="w-full p-2 rounded-xl border border-white/15 bg-white/5 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Lynk Wallet Handle (Optional)</label>
              <input
                type="text"
                value={onboardingLynk}
                onChange={(e) => setOnboardingLynk(e.target.value)}
                placeholder="lynk.me/username"
                className="w-full p-2 rounded-xl border border-white/15 bg-white/5 text-white text-xs font-mono placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Nurse Professional Bio</label>
            <textarea
              rows={3}
              value={onboardingBio}
              onChange={(e) => setOnboardingBio(e.target.value)}
              className="w-full p-3 rounded-2xl border border-white/15 bg-white/5 text-white text-xs focus:ring-2 focus:ring-[#1E1B4B]/40 focus:border-purple-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#1E1B4B] hover:bg-[#5A0694] text-white font-bold text-xs transition shadow-lg shadow-purple-950/50"
          >
            Save Nurse Profile &amp; Banking Details
          </button>
        </form>
      )}

      {/* TAB: PEER NURSE COLLABORATION & NETWORK */}
      {activeTab === 'network' && (
        <NursePeerNetworkView
          allNurses={nurses}
          currentNurse={currentNurse}
          peerMessages={peerMessages}
          onSendPeerMessage={onSendPeerMessage || (() => {})}
        />
      )}

      {/* TAB: PRACTITIONER MILESTONES & REINFORCEMENT */}
      {activeTab === 'milestones' && (
        <div className="space-y-4 animate-fadeIn">
          <PractitionerMilestoneTracker
            currentNurse={currentNurse}
            bookings={bookings}
            onOpenCelebration={(payload) => setCelebrationPayload(payload)}
          />
        </div>
      )}

      {/* TAB: SPECIALIZED CLINICAL SKILL BADGES */}
      {activeTab === 'skill_badges' && (
        <div className="space-y-6 animate-fadeIn">
          <NurseSkillBadgesManager
            currentNurse={currentNurse}
            onUpdateNurseProfile={onUpdateNurseProfile}
          />
        </div>
      )}

      {/* TAB: CAREGIVER PERFORMANCE METRICS (RECHARTS VISUALIZATION) */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-fadeIn">
          <CaregiverPerformanceMetrics
            currentNurse={currentNurse}
            bookings={bookings}
            onOpenCelebration={(payload) => setCelebrationPayload(payload)}
            onUpdateNurseProfile={onUpdateNurseProfile}
            onNavigateToMilestones={() => setActiveTab('skill_badges')}
          />
        </div>
      )}

      {/* TAB: PATIENT & CLIENT REVIEW DASHBOARD */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          <ClientReviewDashboard
            bookings={bookings}
            nurses={nurses}
            viewerRole="nurse"
            targetNurseId={currentNurse.id}
          />
        </div>
      )}

      {/* CLINICAL CLOSEOUT MODAL (TIMER DURATION + AUTO-CALCULATED INVOICE + VITALS) */}
      {selectedBookingForCloseout && (() => {
        const baseM = selectedBookingForCloseout.baseDurationMinutes || 45;
        const baseP = selectedBookingForCloseout.basePriceJMD || selectedBookingForCloseout.priceJMD;
        const hRate = selectedBookingForCloseout.hourlyRateJMD || currentNurse.hourlyRateJMD || 7500;
        const otMins = Math.max(0, closeoutMinutes - baseM);
        const otFee = Math.round(otMins * (hRate / 60));
        const totCharge = baseP + otFee;
        const nurseNet = Math.round(totCharge * 0.85);
        const platFee = totCharge - nurseNet;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
            <div className="bg-[#150722]/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-white/15 text-white space-y-4">
              <div className="pb-3 border-b border-white/10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C77DFF]">
                      Clinical Closeout &amp; Invoice Finalization
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Auto-Calculated
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedBookingForCloseout.serviceName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Patient: {selectedBookingForCloseout.clientName} • {selectedBookingForCloseout.zone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBookingForCloseout(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              {/* Dynamic Duration & Invoice Calculation Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 via-[#1b0a2a] to-slate-950/60 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Visit Duration &amp; Bill Breakdown</span>
                  </div>
                  
                  {/* Fine-tune duration controls */}
                  <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setCloseoutMinutes(prev => Math.max(5, prev - 5))}
                      className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition"
                      title="Decrease 5 minutes"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-white px-1">{closeoutMinutes} mins</span>
                    <button
                      type="button"
                      onClick={() => setCloseoutMinutes(prev => prev + 5)}
                      className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition"
                      title="Add 5 minutes"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Calculation Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Clinical Care</span>
                    <strong className="text-white font-mono">{baseM} mins included</strong>
                    <span className="text-[10px] text-slate-400 block">Standard care block</span>
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Overtime Extra</span>
                    <strong className={otMins > 0 ? 'text-amber-300 font-mono' : 'text-slate-400 font-mono'}>
                      {otMins > 0 ? `+${otMins} mins` : 'None'}
                    </strong>
                    <span className="text-[10px] text-slate-400 block">Logged on arrival</span>
                  </div>

                  <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
                    <span className="text-emerald-300 block text-[10px] uppercase font-bold">Your Net Payout</span>
                    <strong className="text-emerald-400 font-mono text-sm">{formatJMD(nurseNet)}</strong>
                    <span className="text-[10px] text-emerald-400/90 block font-semibold">Direct Escrow Deposit</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCloseoutSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      placeholder="e.g. 120/80 mmHg"
                      className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Pulse Rate</label>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="e.g. 72 bpm"
                      className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Blood Glucose</label>
                    <input
                      type="text"
                      value={glucose}
                      onChange={(e) => setGlucose(e.target.value)}
                      placeholder="e.g. 5.6 mmol/L"
                      className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Oxygen Sat (SpO2)</label>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="e.g. 98%"
                      className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Temperature</label>
                    <input
                      type="text"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="e.g. 36.7 °C"
                      className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Medications Administered with direct microphone dictation */}
                <ClinicalVoiceNotesInput
                  label="Medications Administered / Dose"
                  value={medsAdministered}
                  onChange={setMedsAdministered}
                  placeholder="e.g. Cleansed with sterile saline, applied silver sulfadiazine..."
                  isTextarea={false}
                  clinicalFieldType="medications"
                />

                {/* Clinical Care Summary with direct microphone dictation */}
                <ClinicalVoiceNotesInput
                  label="Clinical Care Summary"
                  value={careSummary}
                  onChange={setCareSummary}
                  placeholder="Observations on patient recovery, wound healing stage..."
                  rows={2}
                  isTextarea={true}
                  clinicalFieldType="care_summary"
                />

                {/* Recommendations with direct microphone dictation */}
                <ClinicalVoiceNotesInput
                  label="Recommendations for Client / Family"
                  value={recommendations}
                  onChange={setRecommendations}
                  placeholder="e.g. Keep dressing dry for 48 hours, monitor temperature..."
                  rows={2}
                  isTextarea={true}
                  clinicalFieldType="recommendations"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForCloseout(null)}
                    className="flex-1 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white font-bold text-xs hover:opacity-95 shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finalize Invoice &amp; Complete Visit</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* DIRECT CALL / VOICE MODAL */}
      {selectedBookingForCallModal && (
        <CallContactModal
          booking={selectedBookingForCallModal}
          callerRole="caregiver"
          onClose={() => setSelectedBookingForCallModal(null)}
          onOpenChat={onOpenChat}
        />
      )}

      {/* INVOICE & RECEIPT MODAL */}
      {selectedBookingForInvoiceModal && (
        <InvoiceReceiptModal
          booking={selectedBookingForInvoiceModal}
          onClose={() => setSelectedBookingForInvoiceModal(null)}
          logoVariation={logoVariation}
        />
      )}

      {/* NURSE PUBLIC VERIFIED PROFILE PREVIEW MODAL */}
      {isPreviewProfileOpen && (
        <NurseProfileModal
          nurse={currentNurse}
          isOpen={isPreviewProfileOpen}
          onClose={() => setIsPreviewProfileOpen(false)}
          onSelectNurseForBooking={() => setIsPreviewProfileOpen(false)}
        />
      )}

      {/* QUICK NURSE QR CODE SIGN-UP MODAL */}
      {isQRCodeModalOpen && (
        <NurseQRCodeSignUpModal
          isOpen={isQRCodeModalOpen}
          onClose={() => setIsQRCodeModalOpen(false)}
          onQuickSignUpNurse={(newNurse) => {
            if (onAddNewNurse) {
              onAddNewNurse(newNurse);
            }
          }}
        />
      )}

      {/* NURSE DOORSTEP ARRIVAL & VISIT QR SCANNER MODAL */}
      {selectedBookingForArrivalQRScan && (
        <NurseArrivalQRScannerModal
          isOpen={!!selectedBookingForArrivalQRScan}
          booking={selectedBookingForArrivalQRScan}
          currentNurse={currentNurse}
          initialMode={qrScannerInitialMode}
          onClose={() => {
            setSelectedBookingForArrivalQRScan(null);
            setQrScannerInitialMode(undefined);
          }}
          onConfirmArrival={(bookingId, arrivalData) => {
            onUpdateBookingStatus(bookingId, 'in_progress', undefined, arrivalData);
            setSelectedBookingForArrivalQRScan(null);
            setQrScannerInitialMode(undefined);
          }}
          onConfirmCheckout={(bookingId, checkoutData) => {
            onUpdateBookingStatus(bookingId, 'completed', undefined, checkoutData);
            setSelectedBookingForArrivalQRScan(null);
            setQrScannerInitialMode(undefined);
          }}
          onUpdateBookingStatus={onUpdateBookingStatus}
          onTriggerNotification={onTriggerNotification}
        />
      )}

      {/* CAMERA CAPTURE MODAL FOR NURSE AVATAR */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={(photoDataUrl) => {
          onUpdateNurseProfile({
            ...currentNurse,
            photoUrl: photoDataUrl
          });
          soundFX.playSuccessPing();
        }}
        title="Take Nurse Profile Photo"
      />

      {/* CLINICAL BOOKING DETAIL & VOICE-TO-TEXT DICTATION MODAL */}
      {selectedBookingForDetailModal && (
        <BookingDetailModal
          isOpen={!!selectedBookingForDetailModal}
          booking={selectedBookingForDetailModal}
          currentNurseName={currentNurse.name}
          onClose={() => setSelectedBookingForDetailModal(null)}
          onSaveClinicalNotes={(bookingId, notes, updates) => {
            onUpdateBookingStatus(bookingId, selectedBookingForDetailModal.status, notes, {
              clinicalNotes: notes,
              visitUpdates: updates
            });
            setSelectedBookingForDetailModal(prev => prev ? {
              ...prev,
              clinicalNotes: notes,
              visitUpdates: updates
            } : null);
          }}
          onOpenChat={onOpenChat}
          onOpenVideoCall={onOpenVideoCall}
          onOpenArrivalQRScan={(b, mode) => handleOpenQRScanner(b, mode)}
          onOpenCloseoutModal={(b) => handleOpenCloseoutModal(b)}
          onOpenBiometricScan={(b) => setSelectedBookingForBiometricScan(b)}
          onDownloadMedicalSummary={(b) => setSelectedBookingForMedicalSummary(b)}
          onUpdateBookingStatus={onUpdateBookingStatus}
          onTriggerNotification={onTriggerNotification}
        />
      )}

      {/* OFFICIAL MEDICAL SUMMARY MODAL (PRINT-OPTIMIZED CLINICAL NOTES & REMITTANCE AUDIT) */}
      {selectedBookingForMedicalSummary && (
        <MedicalSummaryModal
          isOpen={!!selectedBookingForMedicalSummary}
          booking={selectedBookingForMedicalSummary}
          onClose={() => setSelectedBookingForMedicalSummary(null)}
          onOpenBiometricScan={(b) => {
            setSelectedBookingForBiometricScan(b);
          }}
        />
      )}

      {/* LIVE BIOMETRIC HEALTH SCAN MODAL (OPTICAL rPPG CAMERA / SENSOR) */}
      {selectedBookingForBiometricScan && (
        <BiometricHealthScanModal
          isOpen={!!selectedBookingForBiometricScan}
          booking={selectedBookingForBiometricScan}
          onClose={() => setSelectedBookingForBiometricScan(null)}
          onSaveScanResult={(scanResult) => {
            if (selectedBookingForBiometricScan) {
              onUpdateBookingStatus(
                selectedBookingForBiometricScan.id,
                selectedBookingForBiometricScan.status,
                selectedBookingForBiometricScan.clinicalNotes,
                { biometricScan: scanResult }
              );
              // Update local modal references if open
              setSelectedBookingForDetailModal(prev => prev && prev.id === selectedBookingForBiometricScan.id ? {
                ...prev,
                biometricScan: scanResult
              } : prev);
              setSelectedBookingForMedicalSummary(prev => prev && prev.id === selectedBookingForBiometricScan.id ? {
                ...prev,
                biometricScan: scanResult
              } : prev);
            }
          }}
        />
      )}

      {/* PRACTITIONER MILESTONE CELEBRATION MODAL */}
      <CelebrationMilestoneModal
        isOpen={!!celebrationPayload}
        payload={celebrationPayload}
        onClose={() => setCelebrationPayload(null)}
      />

      {/* Universal Data Export, Print & Storage Modal */}
      {isExportModalOpen && (
        <DataExportPrintModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          userRole="nurse"
          currentNurse={currentNurse}
          bookings={bookings}
          nurses={nurses}
          payouts={payouts}
          initialEntity={exportModalEntity}
        />
      )}

      {/* VERIFIED WE CARE ID CARD MODAL (PRINTABLE PDF CREDENTIAL BADGE) */}
      {isIDCardModalOpen && (
        <VerifiedWeCareIDCardModal
          nurse={currentNurse}
          isOpen={isIDCardModalOpen}
          onClose={() => setIsIDCardModalOpen(false)}
        />
      )}

      {/* INCOMING BOOKING PROMPT MODAL (REVIEW, ACCEPT / DECLINE / COUNTER-BID) */}
      {selectedBookingForPrompt && (
        <IncomingBookingPromptModal
          isOpen={!!selectedBookingForPrompt}
          booking={selectedBookingForPrompt}
          nurse={currentNurse}
          onAccept={(bookingId) => {
            soundFX.playBookingConfirmed();
            onUpdateBookingStatus(bookingId, 'accepted', undefined, {
              nurseAccepted: true,
              nurseAcceptedAt: new Date().toISOString()
            });
            if (onTriggerNotification) {
              onTriggerNotification(
                'booking_confirmed',
                'Visit Request Accepted & Activated!',
                `You accepted booking #${(bookingId || '').slice(0, 8)}. Client portal activated with doorstep verification pass.`,
                bookingId
              );
            }
            setSelectedBookingForPrompt(null);
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          }}
          onDecline={(bookingId, reason) => {
            soundFX.playCancellation();
            if (onTriggerNotification) {
              onTriggerNotification(
                'system_alert',
                'Visit Request Declined',
                `Booking #${(bookingId || '').slice(0, 8)} declined (${reason || 'Caregiver unavailable'}). Auto-cascading to next available nurse.`,
                bookingId
              );
            }
            if (onRerouteBooking) {
              onRerouteBooking(bookingId, reason || 'Declined by caregiver; auto-cascaded to next practitioner');
            } else {
              onUpdateBookingStatus(bookingId, 'cancelled', undefined, {
                notes: `Declined by nurse: ${reason}`
              });
            }
            setSelectedBookingForPrompt(null);
          }}
          onClose={() => setSelectedBookingForPrompt(null)}
        />
      )}

      {/* DEDICATED NURSE SIGNED CONTRACT AGREEMENT MODAL */}
      {isContractAgreementOpen && (
        <NurseContractAgreementModal
          nurse={currentNurse}
          isOpen={isContractAgreementOpen}
          onClose={() => setIsContractAgreementOpen(false)}
          logoVariation={logoVariation}
        />
      )}

      {/* CAREGIVER VISIT SUPPLIES CHECKLIST MODAL (Task 3) */}
      <CaregiverSuppliesChecklistModal
        isOpen={Boolean(acceptingJobForSuppliesChecklist)}
        booking={acceptingJobForSuppliesChecklist}
        onClose={() => setAcceptingJobForSuppliesChecklist(null)}
        onConfirmAccept={(jobToAccept) => {
          soundFX.playBookingConfirmed();
          onUpdateBookingStatus(jobToAccept.id, 'accepted', undefined, {
            nurseAccepted: true,
            nurseAcceptedAt: new Date().toISOString(),
            supplies_checklist_ack: true
          });
          if (onTriggerNotification) {
            onTriggerNotification(
              'booking_confirmed',
              'Visit Request Accepted & Activated!',
              `You accepted job offer #${(jobToAccept?.id || '').slice(0, 8)} (${jobToAccept.serviceName}). Required clinical supplies verified ready to bring.`,
              jobToAccept.id
            );
          }
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 }
          });
          setAcceptingJobForSuppliesChecklist(null);
        }}
        onOpenStore={onNavigateStore}
      />
    </div>
  );
};
