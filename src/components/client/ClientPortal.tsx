import React, { useState, useMemo, useEffect } from 'react';
import { 
  ServiceItem, 
  NurseProfile, 
  Booking, 
  LogoVariation, 
  UserAccount, 
  ActivityNotificationItem, 
  ActivityNotificationType,
  NurseCareLevel
} from '../../types';
import { KINGSTON_ZONES, PORTMORE_ZONES, SPANISH_TOWN_ZONES, ALL_SERVICE_ZONES } from '../../data/mockData';
import { ALL_ZONES_GEO, KINGSTON_ZONE_GEO, calculateDistanceKm, estimateTransitMinutes, findNearestZone, isCoordinatesInJamaica, JAMAICA_DEMO_LOCATIONS } from '../../data/geoData';
import { soundFX } from '../../utils/soundEffects';
import { checkNurseBookingConflict } from '../../utils/bookingAvailability';
import { HealthNewsFeed } from './HealthNewsFeed';
import { NurseProximityMap } from './NurseProximityMap';
import { KingstonCoverageMapView } from './KingstonCoverageMapView';
import { FindNearbyNurseSection } from './FindNearbyNurseSection';
import { PatientHistorySection } from './PatientHistorySection';
import { InvoiceReceiptModal } from '../common/InvoiceReceiptModal';
import { MedicalSummaryModal } from '../common/MedicalSummaryModal';
import { BiometricHealthScanModal } from '../common/BiometricHealthScanModal';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';
import { CaregiverTierBadge } from '../common/CaregiverTierBadge';
import { ScopeOfCareModal } from '../common/ScopeOfCareModal';
import { NurseProfileModal } from '../common/NurseProfileModal';
import { ClientArrivalQRCodeModal } from '../common/ClientArrivalQRCodeModal';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { ShareAppModal } from '../common/ShareAppModal';
import { AutoDetectLocationButton } from '../common/AutoDetectLocationButton';
import { ActivityNotificationStream } from '../common/ActivityNotificationStream';
import { CaregiverSuggestionModal } from './CaregiverSuggestionModal';
import { CaregiverSuggestionSection } from './CaregiverSuggestionSection';
import { PatientProfileModal } from '../patient/PatientProfileModal';
import { PatientMilestoneTracker } from '../patient/PatientMilestoneTracker';
import { CelebrationMilestoneModal } from '../common/CelebrationMilestoneModal';
import { SyncHealthDataModal } from '../patient/SyncHealthDataModal';
import { CallContactModal } from '../common/CallContactModal';
import { VisitTimerWidget } from '../nurse/VisitTimerWidget';
import { ServiceLogo } from '../common/ServiceLogo';
import { SmartBookingSearch } from '../common/SmartBookingSearch';
import { InstantCareDispatchView } from './InstantCareDispatchView';
import { LiveCareTransitSheet } from './LiveCareTransitSheet';
import { PPESafetyNotice, PPEReadyBadge, PPEToggle } from '../common/PPESafetyNotice';
import { ClientDoorstepArrivalBanner } from '../common/ClientDoorstepArrivalBanner';
import { ClientArrivalEtaBanner } from './ClientArrivalEtaBanner';
import { QuickSOSButton } from '../common/QuickSOSButton';
import { ActionDropdown } from '../common/ActionDropdown';
import { CaregiverFavoritesSection } from './CaregiverFavoritesSection';
import { HealthVitalsDashboard } from '../patient/HealthVitalsDashboard';
import { ClientReviewDashboard } from './ClientReviewDashboard';
import { ClientDashboard } from './ClientDashboard';
import { BookCareShowcase } from './BookCareShowcase';
import { VisualMedicationSchedule } from './VisualMedicationSchedule';
import { PatientHealthOverviewView } from './PatientHealthOverviewView';
import { generateSafetyPin } from '../../utils/careDispatchUtils';
import { getArrivalPassCode } from '../../utils/arrivalVerification';
import { 
  LayoutDashboard,
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Star, 
  CreditCard, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  MessageSquare, 
  Heart, 
  ShieldAlert, 
  Activity, 
  Search, 
  ArrowLeft, 
  FileText, 
  HelpCircle, 
  Plus, 
  Globe, 
  Newspaper,
  Map as MapIcon,
  LayoutGrid,
  Car,
  Compass,
  Receipt,
  Timer,
  UserCheck,
  Eye,
  Award,
  Crosshair,
  Camera,
  Share2,
  Bell,
  HeartHandshake,
  Ban,
  AlertTriangle,
  Info,
  Video,
  Repeat,
  Zap,
  QrCode,
  Flame,
  TrendingUp,
  Mic,
  Lock,
  KeyRound,
  Maximize2,
  Stethoscope,
  RefreshCw,
  Pill,
  Building,
  Banknote,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CaregiverAcceptanceTimerCard } from './CaregiverAcceptanceTimerCard';
import { CaregiverPromptModal, PromptModalType } from './CaregiverPromptModal';
import { SuppliesChecklistModal } from '../common/SuppliesChecklistModal';

interface ClientPortalProps {
  services: ServiceItem[];
  nurses: NurseProfile[];
  bookings: Booking[];
  onCreateBooking: (newBooking: Booking) => void;
  onCancelBooking: (bookingId: string, reason: string) => void;
  onOpenChat: (booking: Booking) => void;
  onOpenRating: (booking: Booking) => void;
  onOpenPanic: (booking?: Booking) => void;
  onOpenLaunchKit: () => void;
  onOpenNurseSignUp?: () => void;
  onOpenShareApp?: () => void;
  onNavigateStore?: () => void;
  logoVariation: LogoVariation;
  currentUser?: UserAccount;
  onUpdateUser?: (updated: UserAccount) => void;
  notifications?: ActivityNotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onClearNotifications?: () => void;
  onTriggerNotification?: (type: ActivityNotificationType, title: string, message: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: Booking['status'], clinicalNotes?: any, additionalData?: Partial<Booking>) => void;
  onRerouteBooking?: (bookingId: string, reason?: string, preferredNurseId?: string) => void;
  onOpenVideoCall?: (participantName: string, participantRole: 'nurse' | 'admin', meetingTitle?: string) => void;
  onUpdateNurseProfile?: (updatedNurse: NurseProfile) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  services,
  nurses,
  bookings,
  onCreateBooking,
  onCancelBooking,
  onOpenChat,
  onOpenRating,
  onOpenPanic,
  onOpenLaunchKit,
  onOpenNurseSignUp,
  onOpenShareApp,
  onNavigateStore,
  logoVariation,
  currentUser,
  onUpdateUser,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearNotifications,
  onTriggerNotification,
  onUpdateBookingStatus,
  onRerouteBooking,
  onOpenVideoCall,
  onUpdateNurseProfile
}) => {
  // Supplies Checklist Modal state (Requirement 5)
  const [isSuppliesChecklistOpen, setIsSuppliesChecklistOpen] = useState(false);
  const [pendingBookingToConfirm, setPendingBookingToConfirm] = useState<Booking | null>(null);

  // Booking Wizard State
  const [currentStep, setCurrentStep] = useState<'browse' | 'select_service' | 'schedule_location' | 'select_nurse' | 'payment_confirm' | 'success'>('browse');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>(currentUser?.zone || 'New Kingston');
  const [clientAddress, setClientAddress] = useState<string>(currentUser?.address || '14 Trafalgar Road, Apt 4B');
  const [clientName, setClientName] = useState<string>(currentUser?.name || 'Patricia Sutherland');
  const [clientPhone, setClientPhone] = useState<string>(currentUser?.phone || '+1 (876) 909-1234');
  const [emergencyName, setEmergencyName] = useState<string>(currentUser?.emergencyContact?.name || 'David Sutherland');
  const [emergencyPhone, setEmergencyPhone] = useState<string>(currentUser?.emergencyContact?.phone || '+1 (876) 881-2299');
  const [emergencyRelation, setEmergencyRelation] = useState<string>(currentUser?.emergencyContact?.relation || 'Son');
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visitTime, setVisitTime] = useState<string>('14:00');
  const [notes, setNotes] = useState<string>('');
  const [selectedNurse, setSelectedNurse] = useState<NurseProfile | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'stripe' | 'lynk_mobile_money' | 'ncb_quik' | 'cash_on_delivery'>('card');
  const [nurseSelectionViewMode, setNurseSelectionViewMode] = useState<'map' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'active_bookings' 
    | 'coverage_map' 
    | 'find_nearby' 
    | 'smart_suggest' 
    | 'notifications' 
    | 'health_news' 
    | 'new_booking' 
    | 'history' 
    | 'milestones'
    | 'instant_dispatch'
    | 'favorites'
    | 'vitals_dashboard'
    | 'reviews_dashboard'
    | 'health_overview'
    | 'medication_schedule'
    | 'payments_escrow'
  >('dashboard');
  const [showCancelModal, setShowCancelModal] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Schedule change');
  const [selectedBookingForInvoiceModal, setSelectedBookingForInvoiceModal] = useState<Booking | null>(null);
  const [selectedBookingForMedicalSummary, setSelectedBookingForMedicalSummary] = useState<Booking | null>(null);
  const [selectedBookingForBiometricScan, setSelectedBookingForBiometricScan] = useState<Booking | null>(null);
  const [selectedBookingForCallModal, setSelectedBookingForCallModal] = useState<Booking | null>(null);
  const [viewingNurseProfile, setViewingNurseProfile] = useState<NurseProfile | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [showScopeModal, setShowScopeModal] = useState<boolean>(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState<boolean>(false);
  const [isPatientProfileModalOpen, setIsPatientProfileModalOpen] = useState<boolean>(false);
  const [isSyncHealthDataModalOpen, setIsSyncHealthDataModalOpen] = useState<boolean>(false);
  const [celebrationPayload, setCelebrationPayload] = useState<any>(null);
  const [selectedBookingForArrivalQR, setSelectedBookingForArrivalQR] = useState<Booking | null>(null);
  const [bookingConflictError, setBookingConflictError] = useState<string | null>(null);
  const [simulatePaymentFailure, setSimulatePaymentFailure] = useState<boolean>(false);
  const [paymentFailureError, setPaymentFailureError] = useState<string | null>(null);
  const [clientDoubleBookingWarning, setClientDoubleBookingWarning] = useState<string | null>(null);
  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    type: PromptModalType;
    booking: Booking | null;
  }>({
    isOpen: false,
    type: 'dispatched',
    booking: null
  });

  const handleClientStartTimer = (bookingId: string) => {
    const startTime = new Date().toISOString();
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(bookingId, 'in_progress', undefined, {
        visitStartedAt: startTime
      });
    }
    soundFX.playSuccessPing();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    if (onTriggerNotification) {
      onTriggerNotification(
        'booking_confirmed',
        '⏱️ Care Session Timer Started',
        `You have started the visit timer for booking #${bookingId}. The caregiver clock is now live and synchronized.`
      );
    }
  };

  // Full-screen pop-up listener when caregiver accepts a booking
  useEffect(() => {
    let timeoutId: any;
    const handleAcceptedEvent = (e: any) => {
      if (e?.detail?.booking) {
        timeoutId = setTimeout(() => {
          setPromptModal({
            isOpen: true,
            type: 'accepted',
            booking: e.detail.booking
          });
        }, 0);
      }
    };
    window.addEventListener('wecare_booking_accepted_fullscreen', handleAcceptedEvent);
    return () => {
      window.removeEventListener('wecare_booking_accepted_fullscreen', handleAcceptedEvent);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Browser Geolocation & Proximity State
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsNearestZone, setGpsNearestZone] = useState<{ name: string; distanceKm: number } | null>(null);

  // Geolocation trigger using the browser API
  const handleTriggerGeolocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude, accuracy });
        setIsGpsActive(true);
        setIsLocatingGps(false);

        // Check if user is in Jamaica territory
        if (isCoordinatesInJamaica(latitude, longitude)) {
          const nearest = findNearestZone(latitude, longitude);
          setGpsNearestZone({
            name: nearest.zone.name,
            distanceKm: nearest.distanceKm
          });
          setSelectedZone(nearest.zone.name);
        } else {
          // Fallback simulation for out-of-region testers
          const nearest = findNearestZone(latitude, longitude);
          setGpsNearestZone({
            name: nearest.zone.name,
            distanceKm: nearest.distanceKm
          });
          setSelectedZone('New Kingston');
        }
      },
      (error) => {
        setIsLocatingGps(false);
        let message = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission was denied. Select your Kingston neighborhood below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
        }
        setGpsError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleClearGps = () => {
    setIsGpsActive(false);
    setGpsCoords(null);
    setGpsError(null);
    setGpsNearestZone(null);
  };

  const handleSetDemoGps = (loc: { name: string; lat: number; lng: number }) => {
    setGpsCoords({ lat: loc.lat, lng: loc.lng, accuracy: 12 });
    setIsGpsActive(true);
    setIsLocatingGps(false);
    setGpsError(null);
    const match = findNearestZone(loc.lat, loc.lng);
    setGpsNearestZone({ name: match.zone.name, distanceKm: match.distanceKm });
    setSelectedZone(match.zone.name);
  };

  // Approved caregivers and nurses
  const availableNurses = nurses.filter(n => n.status === 'approved');

  const filteredServices = services.filter(srv => {
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || srv.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const clientBookings = bookings.filter(b => b.clientId === 'cli-1' || b.clientName === clientName || !b.clientId);
  const activeBookingsList = clientBookings.filter(b => ['requested', 'accepted', 'en_route', 'in_progress'].includes(b.status));
  const completedBookingsList = clientBookings.filter(b => ['completed', 'cancelled', 'disputed', 'closed'].includes(b.status) || (b.clinicalNotes && b.status !== 'cancelled'));

  // Frequent Bookings based on past history for 1-Tap Re-Booking
  const clientFrequentBookings = useMemo(() => {
    if (clientBookings.length > 0) {
      const map = new Map<string, {
        nurseId: string;
        nurseName: string;
        nursePhoto: string;
        serviceId: string;
        serviceName: string;
        count: number;
        baseDurationMinutes: number;
        priceJMD: number;
        zone: string;
        notes?: string;
      }>();

      clientBookings.forEach(b => {
        const key = `${b.nurseId || b.nurseName}__${b.serviceId || b.serviceName}`;
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
          existing.priceJMD = b.priceJMD;
          if (b.zone) existing.zone = b.zone;
        } else {
          map.set(key, {
            nurseId: b.nurseId,
            nurseName: b.nurseName,
            nursePhoto: b.nursePhoto,
            serviceId: b.serviceId,
            serviceName: b.serviceName,
            count: 1,
            baseDurationMinutes: b.baseDurationMinutes || 60,
            priceJMD: b.priceJMD,
            zone: b.zone || selectedZone || 'New Kingston',
            notes: b.notes
          });
        }
      });

      return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }

    // Clean launch state: no mock favorites
    return [];
  }, [clientBookings, selectedZone]);

  const handleStartBookingWithService = (service: ServiceItem) => {
    soundFX.playStepComplete();
    setSelectedService(service);
    setBookingConflictError(null);
    setCurrentStep('schedule_location');
  };

  const handleRebookService = (serviceName: string, nurseId?: string) => {
    soundFX.playCaregiverSelect();
    const matchedService = services.find(s => s.name.toLowerCase() === serviceName.toLowerCase()) || services[0];
    const matchedNurse = nurses.find(n => n.id === nurseId) || null;
    setSelectedService(matchedService);
    if (matchedNurse) {
      setSelectedNurse(matchedNurse);
    }
    setBookingConflictError(null);
    setCurrentStep('schedule_location');
    setActiveTab('new_booking');
  };

  const handleSelectAndBookFromSuggestion = (
    nurse: NurseProfile,
    service: ServiceItem,
    durationMinutes: number,
    date: string,
    time: string,
    zone: string,
    customNotes: string
  ) => {
    setSelectedNurse(nurse);
    setSelectedService({
      ...service,
      durationMinutes: durationMinutes || service.durationMinutes
    });
    setVisitDate(date);
    setVisitTime(time);
    setSelectedZone(zone);
    if (customNotes) {
      setNotes(customNotes);
    }
    setBookingConflictError(null);
    setActiveTab('new_booking');
    setCurrentStep('payment_confirm');
    soundFX.playSuccessPing();
  };

  // Cross-Booking Validation on Selected Nurse
  const nurseToConfirm = selectedNurse || availableNurses[0];
  const activeConflictCheck = nurseToConfirm
    ? checkNurseBookingConflict(
        nurseToConfirm.id,
        visitDate,
        visitTime,
        selectedService?.durationMinutes || 60,
        bookings
      )
    : { isAvailable: true, conflictingBookings: [], suggestedTimes: [], conflictingTimeRange: '' };

  // Nurse & Caregiver Availability Toggle Handler
  const handleToggleNurseAvailability = (targetNurse: NurseProfile) => {
    if (onUpdateNurseProfile) {
      const isCurrentlyOnCall = targetNurse.availabilityStatus !== 'offline';
      const newStatus: 'on_call' | 'offline' = isCurrentlyOnCall ? 'offline' : 'on_call';
      onUpdateNurseProfile({
        ...targetNurse,
        availabilityStatus: newStatus,
        lastAvailabilityToggleAt: new Date().toISOString()
      });
      if (newStatus === 'on_call') {
        soundFX.playAvailabilityOnCall();
      } else {
        soundFX.playAvailabilityOffline();
      }
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedService) return;

    const assignedNurse = selectedNurse || availableNurses[0];
    if (!assignedNurse) {
      setBookingConflictError('Please select an available nurse or caregiver.');
      return;
    }

    // QA Testing: Simulated Payment Failure check
    if (simulatePaymentFailure) {
      soundFX.playLateTimerWarning();
      setPaymentFailureError(
        'Payment Authorization Failed: Transaction declined by NCB Banking Network (Simulated QA Test). Your account was NOT charged and no booking was confirmed.'
      );
      return;
    }
    setPaymentFailureError(null);

    // STRICT CROSS-BOOKING SAFEGUARD: Verify nurse is not already booked during this time window
    const duration = selectedService.durationMinutes || 60;
    const conflict = checkNurseBookingConflict(
      assignedNurse.id,
      visitDate,
      visitTime,
      duration,
      bookings
    );

    if (!conflict.isAvailable) {
      soundFX.playLateTimerWarning();
      setBookingConflictError(
        `Cross-Booking Blocked (Nurse Unavailable): ${assignedNurse.name} already has a confirmed visit booked during ${conflict.conflictingTimeRange}. Please choose an alternative time slot (e.g., ${conflict.suggestedTimes.join(', ')}).`
      );
      return;
    }

    // CLIENT DOUBLE-BOOKING CHECK: Warn if client has another nurse booked at the same date/time
    const clientConflict = (bookings || []).find((b) => {
      if (!b || !['requested', 'accepted', 'en_route', 'in_progress'].includes(b.status)) return false;
      const isClient = (b.clientId && currentUser?.id && b.clientId === currentUser.id) || (b.clientPhone && clientPhone && b.clientPhone === clientPhone);
      if (!isClient) return false;
      const bDate = (b.scheduledDateTime || '').split('T')[0];
      if (bDate !== visitDate) return false;
      const reqStart = new Date(`${visitDate}T${visitTime}:00`).getTime();
      const reqEnd = reqStart + duration * 60000;
      const bStart = new Date(b.scheduledDateTime).getTime();
      const bEnd = bStart + (b.baseDurationMinutes || 60) * 60000;
      return Math.max(reqStart, bStart) < Math.min(reqEnd, bEnd);
    });

    if (clientConflict && !clientDoubleBookingWarning) {
      soundFX.playLateTimerWarning();
      setClientDoubleBookingWarning(
        `⚠️ Client Double-Booking Warning: You already have another nurse (${clientConflict.nurseName} for ${clientConflict.serviceName}) scheduled for this date and time window. Tap 'Authorize Escrow' once more if you explicitly intended to book 2 different caregivers simultaneously.`
      );
      return;
    }

    setBookingConflictError(null);
    setClientDoubleBookingWarning(null);
    const scheduledDateObj = new Date(`${visitDate}T${visitTime}:00`);
    const freeCancelTime = new Date(scheduledDateObj.getTime() - 2 * 3600000).toISOString();
    const totalPrice = selectedService.priceJMD;
    const platformFee = Math.round(totalPrice * 0.15); // 15% platform fee
    const nurseNet = Math.round(totalPrice * 0.85); // 85% to nurse

    const newBooking: Booking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      clientId: currentUser?.id || 'cli-1',
      clientName,
      clientPhone,
      clientAddress,
      zone: selectedZone,
      clientEmergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation
      },
      nurseId: assignedNurse.id,
      nurseName: assignedNurse.name,
      nursePhoto: assignedNurse.photoUrl,
      nursePhone: assignedNurse.phone,
      scheduledDateTime: scheduledDateObj.toISOString(),
      baseDurationMinutes: duration,
      createdAt: new Date().toISOString(),
      status: 'requested',
      nurseAccepted: false,
      clientActivated: false,
      requestSentAt: new Date().toISOString(),
      acceptanceTimeoutSeconds: 90,
      rerouteCount: 0,
      previousNurseIds: [assignedNurse.id],
      priceJMD: totalPrice,
      platformFeeJMD: platformFee,
      nurseEarningsJMD: nurseNet,
      paymentMethod,
      paymentStatus: 'held_in_escrow',
      notes,
      freeCancelDeadline: freeCancelTime,
      unreadMessagesCount: 0
    };

    // Prompt Supplies Checklist Modal before saving to Supabase (Requirement 5)
    setPendingBookingToConfirm(newBooking);
    setIsSuppliesChecklistOpen(true);
  };

  const handleCompleteChecklistAndBook = () => {
    if (!pendingBookingToConfirm) return;
    const finalizedBooking: Booking = {
      ...pendingBookingToConfirm,
      supplies_checklist_ack: true
    };

    onCreateBooking(finalizedBooking);
    setPromptModal({
      isOpen: true,
      type: 'dispatched',
      booking: finalizedBooking
    });
    setIsSuppliesChecklistOpen(false);
    setPendingBookingToConfirm(null);
    
    // Play gentle 'ding' notification sound & booking request dispatched chime
    soundFX.playGentleDing();
    soundFX.playBookingRequest();
    soundFX.triggerNotification(
      '📩 Booking Request Sent!',
      `Caregiver ${finalizedBooking.nurseName} has received your booking request for ${new Date(finalizedBooking.scheduledDateTime).toLocaleDateString()} in ${finalizedBooking.zone}. Supplies checklist verified and recorded.`,
      'booking_confirmed'
    );

    if (onTriggerNotification) {
      onTriggerNotification(
        'booking_confirmed',
        'Booking Request Dispatched (Pending Acceptance)',
        `Caregiver ${finalizedBooking.nurseName} notified for visit #${(finalizedBooking?.id || '').slice(0, 8)} (${finalizedBooking.zone}). Supplies verified.`
      );
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#F59E0B', '#9D4EDD', '#06D6A0']
    });
    setCurrentStep('success');
  };

  const handleConfirmInstantDispatch = (bookingData: Partial<Booking>) => {
    const pin = bookingData.safetyPin || generateSafetyPin();
    const assignedNurse = nurses.find(n => n.id === bookingData.nurseId) || availableNurses[0] || nurses[0];
    const finalPrice = bookingData.priceJMD || 7500;
    const platformFee = bookingData.platformFeeJMD || Math.round(finalPrice * 0.15);
    const nurseEarnings = bookingData.nurseEarningsJMD || (finalPrice - platformFee);

    const newBooking: Booking = {
      id: `BK-DISPATCH-${Date.now()}`,
      clientId: currentUser?.id || 'client-demo-1',
      serviceId: bookingData.serviceId || 'srv-1',
      serviceName: bookingData.serviceName || 'On-Demand Clinical Care',
      clientName,
      clientPhone,
      clientAddress: bookingData.clientAddress || clientAddress,
      clientEmergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation
      },
      zone: bookingData.zone || selectedZone,
      scheduledDateTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      baseDurationMinutes: 60,
      actualDurationMinutes: 60,
      priceJMD: finalPrice,
      platformFeeJMD: platformFee,
      nurseEarningsJMD: nurseEarnings,
      status: 'requested',
      nurseAccepted: false,
      clientActivated: false,
      requestSentAt: new Date().toISOString(),
      acceptanceTimeoutSeconds: 90,
      rerouteCount: 0,
      previousNurseIds: [assignedNurse.id],
      paymentStatus: 'held_in_escrow',
      freeCancelDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      notes: bookingData.notes || 'Instant clinical care dispatch',
      nurseId: assignedNurse.id,
      nurseName: assignedNurse.name,
      nursePhoto: assignedNurse.photoUrl,
      nursePhone: assignedNurse.phone,
      paymentMethod: (bookingData.paymentMethod as any) || paymentMethod,
      dispatchMode: bookingData.dispatchMode || 'fixed',
      dispatchTier: bookingData.dispatchTier || 'comfort',
      safetyPin: pin,
      arrivalPassCode: pin,
      liveEtaMinutes: bookingData.liveEtaMinutes || 7,
      distanceKm: bookingData.distanceKm || 2.1,
      trustedFamilyMember: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation,
        photoUrl: '',
        canManageCare: true
      }
    };

    // Prompt Supplies Checklist Modal before saving (Requirement 5)
    setPendingBookingToConfirm(newBooking);
    setIsSuppliesChecklistOpen(true);
  };

  const handleCancelSubmit = () => {
    if (showCancelModal) {
      onCancelBooking(showCancelModal.id, cancelReason);
      soundFX.triggerNotification(
        'Booking Cancelled',
        `Visit with ${showCancelModal.nurseName} has been cancelled.`,
        'cancellation'
      );
      if (onTriggerNotification) {
        onTriggerNotification(
          'cancellation',
          'Booking Cancelled',
          `Visit #${(showCancelModal?.id || '').slice(0, 8)} was cancelled (${cancelReason}).`
        );
      }
      setShowCancelModal(null);
    }
  };

  const formatJMD = (amount: number) => {
    return `JMD $${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* URGENT TOP-LEVEL DOORSTEP ARRIVAL ALERT BANNER (Active caregiver at door) */}
      {bookings
        .filter(b => b.arrivalAlertSent && !b.arrivalAlertAcknowledged && b.status !== 'completed' && b.status !== 'cancelled')
        .map(alertBooking => (
          <ClientDoorstepArrivalBanner
            key={`top-arrival-alert-${alertBooking.id}`}
            booking={alertBooking}
            onUpdateBookingStatus={onUpdateBookingStatus}
            onOpenQRPass={(b) => setSelectedBookingForArrivalQR(b)}
            onCallCaregiver={(b) => setSelectedBookingForCallModal(b)}
            onTriggerNotification={onTriggerNotification}
          />
        ))}

      {/* LIVE ARRIVAL ETA NOTIFICATION BANNER (When nurse has notified arrival time e.g. 'Nurse is 10 minutes away') */}
      {bookings
        .filter(b => (b.arrivalNotificationMessage || b.arrivalEtaMinutes !== undefined) && (b.status === 'en_route' || b.status === 'accepted'))
        .slice(0, 1)
        .map(etaBooking => (
          <ClientArrivalEtaBanner
            key={`top-arrival-eta-${etaBooking.id}`}
            booking={etaBooking}
            onCallCaregiver={(b) => setSelectedBookingForCallModal(b)}
            onOpenChat={(b) => onOpenChat(b)}
          />
        ))}

      {/* Client Onboarding Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#1E1B4B]/40 to-red-950/50 backdrop-blur-xl border border-white/15 text-white p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 border border-white/15 text-purple-200 backdrop-blur-md">
              Client Homecare Portal • Kingston, St. Andrew, Portmore &amp; Spanish Town
            </span>
            <span className="text-xs text-purple-300 font-medium">3-Step Easy Booking</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Trusted In-Home Caregivers &amp; Clinical Nurses in Jamaica
          </h1>

          <p className="text-sm text-purple-100/90 mt-2 leading-relaxed">
            Choose between <strong>NCJ-Registered Clinical Nurses</strong> (for IV, sterile wound dressing, catheters) and <strong>Certified Geriatric Care Aides</strong> (for senior companionship, bathing, ADL care &amp; vitals at minimal rates).
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={() => {
                soundFX.playTabSwitch();
                setActiveTab('instant_dispatch');
                setCurrentStep('browse');
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md border border-emerald-400/30 transition flex items-center gap-1.5 cursor-pointer"
              title="Book on-demand verified care with instant tier dispatch"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Instant Dispatch</span>
              <span className="px-1 py-0.2 rounded-md bg-black/40 text-emerald-300 text-[9px] font-black uppercase tracking-wider">
                Live GPS
              </span>
            </button>

            <button
              onClick={() => {
                soundFX.playTabSwitch();
                setActiveTab('favorites');
                setCurrentStep('browse');
              }}
              className="px-3 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-200 hover:text-white text-xs font-bold border border-pink-400/30 backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer"
              title="View and book your saved favorite nurses and trusted caregivers"
            >
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
              <span>Favorites</span>
            </button>

            {/* 1. Book Care Cascading Dropdown */}
            <ActionDropdown
              label="Book Care"
              icon={<Plus className="w-4 h-4 text-white" />}
              size="sm"
              variant="primary"
              items={[
                {
                  id: 'book-standard',
                  label: 'Book Standard Visit',
                  sublabel: 'Choose clinical service & schedule practitioner',
                  icon: <Stethoscope className="w-4 h-4 text-[#C77DFF]" />,
                  onClick: () => {
                    setCurrentStep('select_service');
                    setActiveTab('new_booking');
                  }
                },
                {
                  id: 'book-instant',
                  label: 'Instant Care Dispatch',
                  sublabel: 'Urgent bedside response across Kingston & St. Andrew',
                  icon: <Zap className="w-4 h-4 text-amber-300" />,
                  badge: 'Instant',
                  badgeColor: 'bg-emerald-400 text-slate-950 font-black',
                  onClick: () => {
                    soundFX.playTabSwitch();
                    setActiveTab('instant_dispatch');
                    setCurrentStep('browse');
                  }
                },
                {
                  id: 'book-suggest',
                  label: 'Smart Care Matcher',
                  sublabel: 'Find right level of RN, LPN or CNA',
                  icon: <Sparkles className="w-4 h-4 text-amber-400" />,
                  divider: true,
                  onClick: () => setIsSuggestionModalOpen(true)
                }
              ]}
            />

            {/* 2. Health & Records Cascading Dropdown */}
            <ActionDropdown
              label="Health Records"
              icon={<Activity className="w-4 h-4 text-emerald-400" />}
              size="sm"
              variant="emerald"
              items={[
                {
                  id: 'health-vitals',
                  label: 'Patient Vitals Telemetry',
                  sublabel: 'Real-time BP, SpO2, heart rate, blood glucose logs',
                  icon: <Activity className="w-4 h-4 text-emerald-400" />,
                  onClick: () => {
                    soundFX.playTabSwitch();
                    setActiveTab('vitals_dashboard');
                    setCurrentStep('browse');
                  }
                },
                {
                  id: 'health-sync',
                  label: 'Sync Health Devices',
                  sublabel: 'Connect BP monitor, pulse oximeter & glucometer',
                  icon: <RefreshCw className="w-4 h-4 text-emerald-300" />,
                  onClick: () => {
                    soundFX.playFilterSelect();
                    setIsSyncHealthDataModalOpen(true);
                  }
                },
                {
                  id: 'health-profile',
                  label: 'Patient Profile & Meds',
                  sublabel: 'Allergies, chronic conditions & guardian contacts',
                  icon: <Heart className="w-4 h-4 text-pink-400" />,
                  onClick: () => setIsPatientProfileModalOpen(true)
                },
                {
                  id: 'health-history',
                  label: 'Patient History & Notes',
                  sublabel: 'Past visits, dictated caregiver notes & invoices',
                  icon: <FileText className="w-4 h-4 text-[#C77DFF]" />,
                  divider: true,
                  onClick: () => {
                    setActiveTab('history');
                    setCurrentStep('browse');
                  }
                }
              ]}
            />

            {/* 3. Explore & Tools Cascading Dropdown */}
            <ActionDropdown
              label="Explore"
              icon={<Compass className="w-4 h-4 text-purple-300" />}
              size="sm"
              variant="purple"
              items={[
                {
                  id: 'explore-map',
                  label: 'Live Coverage Map',
                  sublabel: 'Real-time nurse locations across Kingston & St. Andrew',
                  icon: <MapPin className="w-4 h-4 text-[#F59E0B]" />,
                  badge: 'Leaflet',
                  badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                  onClick: () => {
                    soundFX.playTabSwitch();
                    setActiveTab('coverage_map');
                    setCurrentStep('browse');
                  }
                },
                {
                  id: 'explore-scope',
                  label: 'Scope & Pay Rates Guide',
                  sublabel: 'NCJ regulations, task authority & hourly rates',
                  icon: <HeartHandshake className="w-4 h-4 text-cyan-400" />,
                  onClick: () => setShowScopeModal(true)
                },
                {
                  id: 'explore-share',
                  label: 'Share We Care (+$500)',
                  sublabel: 'Referral link • Give $500 Get $500 credit',
                  icon: <Share2 className="w-4 h-4 text-emerald-400" />,
                  badge: '+$500',
                  badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                  onClick: () => setIsShareModalOpen(true)
                },
                {
                  id: 'explore-photo',
                  label: 'Take Profile Photo',
                  sublabel: 'Update photo with device camera',
                  icon: <Camera className="w-4 h-4 text-purple-300" />,
                  divider: true,
                  onClick: () => setIsCameraModalOpen(true)
                }
              ]}
            />

            {/* Compact 119 Emergency Panic Button */}
            <button
              onClick={() => onOpenPanic()}
              className="px-2.5 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-red-600 text-white text-[11px] font-bold shadow-xs border border-red-400/30 transition flex items-center gap-1 cursor-pointer"
              title="119 Emergency Panic Dispatch"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>119</span>
            </button>
          </div>
        </div>

        {/* 3 Step Indicator Pills */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-md text-slate-200">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] text-white font-bold flex items-center justify-center text-xs shadow-xs">1</span>
            <span>Choose Clinical or Geriatric Care</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-md text-slate-200">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] text-white font-bold flex items-center justify-center text-xs shadow-xs">2</span>
            <span>Check live availability (no cross-booking)</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-md text-slate-200">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] text-white font-bold flex items-center justify-center text-xs shadow-xs">3</span>
            <span>Secure in-app escrow &amp; live tracking</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs - Tidy & Cascading */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {/* 1. Dashboard Tab */}
          <button
            id="tab-client-dashboard"
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('dashboard');
              setCurrentStep('browse');
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard' && currentStep === 'browse'
                ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-md border border-purple-400/40'
                : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-purple-300 shrink-0" />
            <span>Dashboard</span>
          </button>

          {/* 2. Active Visits Tab */}
          <button
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('active_bookings');
              setCurrentStep('browse');
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'active_bookings' && currentStep === 'browse'
                ? 'bg-[#1E1B4B] text-white shadow-md border border-purple-400/30'
                : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Visits</span>
            {activeBookingsList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#F59E0B] text-white text-[9px] font-black animate-pulse">
                {activeBookingsList.length}
              </span>
            )}
          </button>

          {/* 3. Visual Medication Schedule Tab */}
          <button
            id="tab-client-medication-schedule"
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('medication_schedule');
              setCurrentStep('browse');
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              (activeTab === 'medication_schedule' || activeTab === 'health_overview') && currentStep === 'browse'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-400/40'
                : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
            }`}
          >
            <Pill className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Med Schedule</span>
          </button>

          {/* 4. Book Care (Cascading Dropdown: Instant Dispatch, Standard Care, Coverage Map) */}
          <ActionDropdown
            label={
              activeTab === 'instant_dispatch'
                ? '⚡ Instant Care'
                : activeTab === 'coverage_map'
                ? '📍 Coverage Map'
                : '✨ Book a Care'
            }
            icon={<Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />}
            size="sm"
            variant={['new_booking', 'instant_dispatch', 'coverage_map'].includes(activeTab) ? 'activeTab' : 'primary'}
            items={[
              {
                id: 'tab-instant',
                label: 'Instant Care Dispatch',
                sublabel: 'Urgent bedside nursing response',
                icon: <Zap className="w-4 h-4 text-amber-300" />,
                badge: 'Instant',
                badgeColor: 'bg-emerald-400 text-slate-950 font-black',
                onClick: () => {
                  soundFX.playTabSwitch();
                  setActiveTab('instant_dispatch');
                  setCurrentStep('browse');
                }
              },
              {
                id: 'tab-book-new',
                label: 'Book Standard Visit',
                sublabel: 'Select service & schedule caregiver',
                icon: <Plus className="w-4 h-4 text-[#C77DFF]" />,
                onClick: () => {
                  soundFX.playTabSwitch();
                  setActiveTab('new_booking');
                  setCurrentStep('select_service');
                }
              },
              {
                id: 'tab-map',
                label: 'Live Coverage Map',
                sublabel: 'Real-time nurse locations across Kingston',
                icon: <MapPin className="w-4 h-4 text-[#F59E0B]" />,
                badge: 'Leaflet',
                badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                onClick: () => {
                  soundFX.playTabSwitch();
                  setActiveTab('coverage_map');
                  setCurrentStep('browse');
                }
              }
            ]}
          />

          {/* 5. Health & Records (Cascading Dropdown: Overview, Med Schedule, Vitals Telemetry, Patient History, Saved Favorites) */}
          <ActionDropdown
            label={
              activeTab === 'health_overview'
                ? 'Care Overview'
                : activeTab === 'medication_schedule'
                ? 'Med Schedule'
                : activeTab === 'vitals_dashboard'
                ? 'Vitals'
                : activeTab === 'history'
                ? 'History'
                : activeTab === 'favorites'
                ? 'Favorites'
                : 'Health & Records'
            }
            icon={<Activity className="w-4 h-4 text-emerald-400 shrink-0" />}
            size="sm"
            variant={['health_overview', 'medication_schedule', 'vitals_dashboard', 'history', 'favorites'].includes(activeTab) ? 'activeTab' : 'tab'}
            items={[
              {
                id: 'tab-health-overview',
                label: 'Personalized Care Overview',
                sublabel: 'Care timeline, medication schedule & appointments',
                icon: <Activity className="w-4 h-4 text-indigo-400" />,
                badge: 'Overview',
                badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
                onClick: () => {
                  soundFX.playTabSwitch();
                  setActiveTab('health_overview');
                  setCurrentStep('browse');
                }
              },
              {
                id: 'tab-med-schedule',
                label: 'Visual Medication Schedule',
                sublabel: 'Daily dosing schedule with 1-tap adherence log',
                icon: <Pill className="w-4 h-4 text-blue-400" />,
                badge: '1-Tap Take',
                badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                onClick: () => {
                  soundFX.playTabSwitch();
                  setActiveTab('medication_schedule');
                  setCurrentStep('browse');
                }
              },
              {
                id: 'tab-vitals',
                label: 'Health & Vitals Telemetry',
                sublabel: 'Real-time vital signs and health records',
                icon: <Activity className="w-4 h-4 text-emerald-400" />,
                onClick: () => {
                  soundFX.playTabSwitch();
                  setActiveTab('vitals_dashboard');
                  setCurrentStep('browse');
                }
              },
              {
                id: 'tab-history',
                label: 'Patient History',
                sublabel: 'Completed visits & nurse clinical documentation',
                icon: <FileText className="w-4 h-4 text-[#C77DFF]" />,
                badge: completedBookingsList.length > 0 ? `${completedBookingsList.length}` : undefined,
                badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                onClick: () => {
                  soundFX.playTabSwitch();
                  setActiveTab('history');
                  setCurrentStep('browse');
                }
              },
              {
                id: 'tab-favorites',
                label: 'Saved Favorite Caregivers',
                sublabel: 'Your trusted and preferred nurses',
                icon: <Heart className="w-4 h-4 text-pink-400" />,
                divider: true,
                onClick: () => {
                  soundFX.playTabSwitch();
                  setActiveTab('favorites');
                  setCurrentStep('browse');
                }
              }
            ]}
          />

          {/* 5. Activity Alerts Tab */}
          <button
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('notifications');
              setCurrentStep('browse');
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'notifications' && currentStep === 'browse'
                ? 'bg-[#1E1B4B] text-white shadow-md border border-purple-400/30'
                : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
            }`}
          >
            <Bell className="w-4 h-4 text-purple-300 shrink-0" />
            <span>Alerts</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#F59E0B] text-white text-[9px] font-black animate-pulse">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Area: <strong className="text-slate-200">Kingston • Portmore • Spanish Town</strong></span>
        </div>
      </div>

      {/* VIEW: BOOKING WIZARD */}
      {currentStep !== 'browse' && (
        <div className="bg-white/[0.04] backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl text-white">
          {/* Progress Bar */}
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <button
              onClick={() => {
                if (currentStep === 'select_service') setCurrentStep('browse');
                if (currentStep === 'schedule_location') setCurrentStep('select_service');
                if (currentStep === 'select_nurse') setCurrentStep('schedule_location');
                if (currentStep === 'payment_confirm') setCurrentStep('select_nurse');
                if (currentStep === 'success') setCurrentStep('browse');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={currentStep === 'select_service' ? 'text-[#C77DFF]' : 'text-slate-500'}>1. Service</span>
              <span className="text-slate-600">→</span>
              <span className={currentStep === 'schedule_location' ? 'text-[#C77DFF]' : 'text-slate-500'}>2. Schedule</span>
              <span className="text-slate-600">→</span>
              <span className={currentStep === 'select_nurse' ? 'text-[#C77DFF]' : 'text-slate-500'}>3. Caregiver</span>
              <span className="text-slate-600">→</span>
              <span className={currentStep === 'payment_confirm' ? 'text-[#C77DFF]' : 'text-slate-500'}>4. Payment</span>
            </div>
          </div>

          {/* STEP 1: SELECT SERVICE (CLINICAL VS GERIATRIC MINIMAL CARE) */}
          {currentStep === 'select_service' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Select In-Home Healthcare or Caregiver Service</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose clinical nurse procedures (NCJ Registered) or affordable senior assistance &amp; ADLs (Non-NCJ Geriatric Aides).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSuggestionModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Smart Suggestion Matcher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowScopeModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold transition flex items-center gap-2 shrink-0"
                  >
                    <HeartHandshake className="w-4 h-4 text-cyan-400" />
                    <span>Compare Care Levels &amp; Rates</span>
                  </button>
                </div>
              </div>

              {/* Visual Book a Care Showcase with Pictures & Comprehensive Care Options */}
              <BookCareShowcase
                services={services}
                onSelectService={(service) => handleStartBookingWithService(service)}
                onOpenMatcher={() => setIsSuggestionModalOpen(true)}
              />

              {/* Requirement Matcher Prompt Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-amber-950/20 to-slate-900/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Not sure which nurse level you need?</h4>
                    <p className="text-[11px] text-slate-300">
                      Put in your requirements (e.g. 1-hour elderly sitting) and we will automatically suggest the most affordable caregiver option.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSuggestionModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-amber-600 hover:opacity-95 text-white font-bold text-xs shadow-sm transition whitespace-nowrap self-start sm:self-auto"
                >
                  Open Matcher ✨
                </button>
              </div>

              {/* Frequent Bookings (1-Tap Fast Re-Book Strip) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#1E1B4B]/20 to-slate-900/60 border border-purple-400/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#1E1B4B]/40 text-[#C77DFF] border border-purple-400/30">
                      <Repeat className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>⚡ Frequent Bookings (Past History)</span>
                        <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black uppercase">
                          Fast Re-Book
                        </span>
                      </h4>
                      <p className="text-[11px] text-purple-200/80">
                        Re-book your preferred caregiver in 1 tap without searching through all services
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTabSwitch();
                      setActiveTab('instant_dispatch');
                      setCurrentStep('browse');
                    }}
                    className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 transition self-start sm:self-auto"
                  >
                    <span>Instant Care Dispatch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(clientFrequentBookings || []).slice(0, 2).map((freq, idx) => {
                    const targetNurse = nurses.find(n => n.id === freq.nurseId || n.name === freq.nurseName) || nurses[0];
                    const targetSrv = services.find(s => s.id === freq.serviceId || s.name === freq.serviceName) || services[0];
                    const isOnCall = targetNurse?.availabilityStatus !== 'offline';

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={targetNurse?.photoUrl || freq.nursePhoto}
                            alt={freq.nurseName}
                            className="w-12 h-12 rounded-xl object-cover border border-purple-400/30 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-white text-xs truncate">
                                {freq.nurseName}
                              </span>
                              {isOnCall && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" title="On-Call Ready" />
                              )}
                            </div>
                            <p className="text-[11px] text-purple-200/90 font-medium truncate">
                              {freq.serviceName}
                            </p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>Booked {freq.count}x</span>
                              <span>•</span>
                              <strong className="text-emerald-400 font-mono">JMD ${freq.priceJMD.toLocaleString()}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 1);
                            const tomorrow = d.toISOString().split('T')[0];
                            handleSelectAndBookFromSuggestion(
                              targetNurse,
                              targetSrv,
                              freq.baseDurationMinutes,
                              tomorrow,
                              '10:00',
                              freq.zone,
                              freq.notes || `Re-booking regular ${freq.serviceName} routine.`
                            );
                          }}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-extrabold text-[11px] shadow-sm transition whitespace-nowrap flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                          <span>1-Tap Re-Book</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Category Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Services' },
                  { id: 'elderly_care', label: 'Geriatric & Minimal Care (Non-NCJ)' },
                  { id: 'wound_care', label: 'Wound Dressing & Surgical (NCJ)' },
                  { id: 'iv_therapy', label: 'IV Infusions & Meds (NCJ)' },
                  { id: 'postnatal', label: 'Mother & Baby (NCJ)' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundFX.playFilterSelect();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-xs'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.map((service) => {
                  const isGeriatricFriendly = service.suitableForGeriatricCaregiver || service.careLevelRequired === 'geriatric_caregiver';
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleStartBookingWithService(service)}
                      className="p-5 rounded-2xl border border-white/10 hover:border-purple-400/50 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md transition cursor-pointer flex flex-col justify-between group shadow-md hover:shadow-purple-900/20"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          {/* Logo-like Pictorial Emblem */}
                          <div className="flex items-center gap-3">
                            <ServiceLogo 
                              service={service} 
                              size="md" 
                              showBadge={true} 
                              withGlow={true} 
                              interactive={false} 
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                {isGeriatricFriendly ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                                    Geriatric Aide
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                    NCJ RN
                                  </span>
                                )}

                                {service.popular && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F59E0B] text-white shadow-xs shadow-red-500/30">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-white text-sm group-hover:text-purple-200 transition leading-snug">
                                {service.name}
                              </h4>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mt-1 leading-relaxed pl-1">{service.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>{service.durationMinutes} mins</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-[#C77DFF]">{formatJMD(service.priceJMD)}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {isGeriatricFriendly ? 'Affordable Minimal Care' : 'Clinical Procedure Rate'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SCHEDULE & LOCATION */}
          {currentStep === 'schedule_location' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <ServiceLogo service={selectedService} size="md" showBadge={true} withGlow={true} />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C77DFF]">Selected Service</span>
                    <h4 className="font-bold text-sm text-white">{selectedService?.name}</h4>
                    <span className="text-[11px] text-slate-400 block">
                      {selectedService?.tagline || selectedService?.careScopeSummary || 'In-home clinical & caregiving service'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-[#C77DFF]">{formatJMD(selectedService?.priceJMD || 0)}</span>
                  <span className="text-[10px] text-slate-400 block">{selectedService?.durationMinutes || 60} mins visit</span>
                </div>
              </div>

              {/* Quick Region Switcher Buttons */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Choose Service Area:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedZone('New Kingston');
                      setClientAddress('14 Trafalgar Road, Kingston 5');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      !selectedZone.startsWith('Portmore') && !selectedZone.startsWith('Spanish Town')
                        ? 'border-purple-400 bg-purple-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[#C77DFF] block">Parish</span>
                    <strong className="text-xs block truncate">Kingston &amp; St Andrew</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedZone('Portmore - Portmore Pines & Caribbean Estate');
                      setClientAddress('Portmore Pines Plaza, St Catherine');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedZone.startsWith('Portmore')
                        ? 'border-sky-400 bg-sky-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-sky-400 block">St Catherine</span>
                    <strong className="text-xs block truncate">Portmore</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedZone('Spanish Town - Town Centre & Cathedral');
                      setClientAddress('Burke Road, Spanish Town, St Catherine');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedZone.startsWith('Spanish Town')
                        ? 'border-emerald-400 bg-emerald-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-emerald-400 block">St Catherine</span>
                    <strong className="text-xs block truncate">Spanish Town</strong>
                  </button>
                </div>
              </div>

              {/* Quick Auto-Detect Location Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-emerald-950/30 to-slate-900/50 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Auto-Detect Your Address &amp; Zone</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">GPS Verified</span>
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Use device GPS to determine your Jamaican parish/neighborhood and pin your coordinates for faster nurse dispatch.
                    </p>
                  </div>
                </div>

                <AutoDetectLocationButton
                  onLocationDetected={(loc) => {
                    if (loc.nearestZone) setSelectedZone(loc.nearestZone);
                    if (loc.formattedAddress) setClientAddress(loc.formattedAddress);
                    setGpsCoords({ lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy });
                    setIsGpsActive(true);
                  }}
                  variant="compact"
                  label="Auto-Detect Location"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Specific Neighborhood Zone
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-white/15 bg-[#170826] text-white text-xs font-semibold focus:ring-2 focus:ring-[#1E1B4B]/50 focus:bg-[#200a35] focus:outline-none backdrop-blur-md"
                  >
                    <optgroup label="📍 Kingston & St Andrew">
                      {KINGSTON_ZONES.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </optgroup>
                    <optgroup label="📍 Portmore (St Catherine)">
                      {PORTMORE_ZONES.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </optgroup>
                    <optgroup label="📍 Spanish Town (St Catherine)">
                      {SPANISH_TOWN_ZONES.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Exact Street Address &amp; Gate Code
                  </label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="e.g. 14 Trafalgar Road / Caribbean Estate Gate"
                    className="w-full p-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#1E1B4B]/50 focus:bg-white/10 focus:outline-none backdrop-blur-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Visit Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 focus:outline-none backdrop-blur-md [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Preferred Time Slot</label>
                  <input
                    type="time"
                    value={visitTime}
                    onChange={(e) => {
                      setVisitTime(e.target.value);
                      setBookingConflictError(null);
                      setClientDoubleBookingWarning(null);
                    }}
                    className="w-full p-3 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 focus:outline-none backdrop-blur-md [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Calendar Quick Time Slots with Real-Time Booking Prevention */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Quick Time Slots for {nurseToConfirm?.name || 'Selected Caregiver'} ({visitDate}):</span>
                  </span>
                  <span className="text-[10px] text-purple-300 font-semibold">
                    🔴 Booked slots automatically disabled
                  </span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
                  {['08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'].map(slot => {
                    const slotConflict = nurseToConfirm ? checkNurseBookingConflict(
                      nurseToConfirm.id,
                      visitDate,
                      slot,
                      selectedService?.durationMinutes || 60,
                      bookings
                    ) : { isAvailable: true };
                    const isBooked = !slotConflict.isAvailable;
                    const isSelected = visitTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => {
                          setVisitTime(slot);
                          setBookingConflictError(null);
                          setClientDoubleBookingWarning(null);
                          soundFX.playToggleClick();
                        }}
                        className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition border flex flex-col items-center justify-center ${
                          isBooked
                            ? 'bg-red-950/40 border-red-500/30 text-red-300 opacity-60 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-900/50'
                            : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20'
                        }`}
                        title={isBooked ? `Nurse unavailable at ${slot}` : `Select ${slot}`}
                      >
                        <span>{slot}</span>
                        <span className={`text-[9px] font-normal ${isBooked ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                          {isBooked ? 'Booked' : 'Available'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Double-Booking Warning Alert if selected time is already booked */}
                {!activeConflictCheck.isAvailable && (
                  <div className="mt-2 p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>
                      <strong className="text-white">Double Booking Blocked:</strong> {nurseToConfirm?.name || 'Practitioner'} is already booked for another patient at {visitTime}. Please pick an available slot above.
                    </span>
                  </div>
                )}
              </div>

              {/* Safety & Emergency Contact Section */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
                  <h4 className="text-xs font-bold text-red-200">Safety &amp; Emergency Contact (Mandatory)</h4>
                </div>
                <p className="text-[11px] text-slate-300 mb-3">
                  In case of clinical escalation or panic button trigger, this person will receive automatic SMS updates and 119 emergency dispatch.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-white/15 bg-white/5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Phone (+1 876)</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-white/15 bg-white/5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-white/15 bg-white/5 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Specific Patient Instructions or Medical Context (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Needs senior companion for bedtime ADL routine, or postoperative sterile bandage dressing..."
                  className="w-full p-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#1E1B4B]/50 focus:bg-white/10 focus:outline-none backdrop-blur-md"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep('select_nurse')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-purple-900/40 flex items-center gap-2"
                >
                  <span>Continue to Select Practitioner</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT PRACTITIONER (LIVE AVAILABILITY & CROSS-BOOKING CHECK) */}
          {currentStep === 'select_nurse' && (
            <FindNearbyNurseSection
              nurses={availableNurses}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              selectedNurse={selectedNurse}
              onSelectNurse={(nurse) => {
                setSelectedNurse(nurse);
                setBookingConflictError(null);
              }}
              onViewNurseProfile={(nurse) => setViewingNurseProfile(nurse)}
              onToggleAvailability={handleToggleNurseAvailability}
              gpsCoords={gpsCoords}
              isGpsActive={isGpsActive}
              isLocatingGps={isLocatingGps}
              gpsError={gpsError}
              gpsNearestZone={gpsNearestZone}
              onTriggerGps={handleTriggerGeolocation}
              onClearGps={handleClearGps}
              onSetDemoGps={handleSetDemoGps}
              viewMode={nurseSelectionViewMode}
              onChangeViewMode={setNurseSelectionViewMode}
              isBookingFlow={true}
              onContinueBooking={() => setCurrentStep('payment_confirm')}
              allBookings={bookings}
              requestedDate={visitDate}
              requestedTime={visitTime}
              durationMinutes={selectedService?.durationMinutes || 60}
              selectedService={selectedService}
            />
          )}

          {/* STEP 4: PAYMENT REVIEW & ESCROW BREAKDOWN */}
          {currentStep === 'payment_confirm' && selectedService && (
            <div className="max-w-xl mx-auto space-y-5">
              <div className="text-center pb-2">
                <h3 className="text-lg font-bold text-white">Review &amp; Authorize Escrow Payment</h3>
                <p className="text-xs text-slate-400">
                  Payment is safely held in escrow and only released upon completed visit and verification.
                </p>
              </div>

              {/* Conflict Error Message if Cross-Booking detected */}
              {(!activeConflictCheck.isAvailable || bookingConflictError) && (
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-red-300">
                    <Ban className="w-4 h-4 text-red-400" />
                    <span>Cross-Booking Collision Warning</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {bookingConflictError || `This practitioner is already booked on ${visitDate} during ${activeConflictCheck.conflictingTimeRange}.`}
                  </p>
                  {(activeConflictCheck?.suggestedTimes?.length || 0) > 0 && (
                    <div className="pt-2">
                      <span className="text-cyan-300 font-bold block mb-1">
                        Select an available alternate time slot:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(activeConflictCheck?.suggestedTimes || []).map((altTime) => (
                          <button
                            key={altTime}
                            type="button"
                            onClick={() => {
                              setVisitTime(altTime);
                              setBookingConflictError(null);
                              soundFX.playSuccessPing();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-mono font-bold text-xs"
                          >
                            Switch to {altTime}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Breakdown Box */}
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3 text-xs text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-3">
                  <div className="flex items-center gap-3">
                    <ServiceLogo service={selectedService} size="sm" showBadge={false} withGlow={true} />
                    <div>
                      <span className="font-bold text-white block text-sm">{selectedService.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-400">Assigned: {nurseToConfirm?.name || 'Selected Practitioner'}</span>
                        {nurseToConfirm && (
                          <CaregiverTierBadge nurse={nurseToConfirm} size="xs" variant="badge" />
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-white text-sm shrink-0">
                    {formatJMD(nurseToConfirm?.hourlyRateJMD || selectedService.priceJMD)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Service Location:</span>
                  <span className="font-semibold text-white">{selectedZone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Time:</span>
                  <span className="font-semibold text-white">{visitDate} at {visitTime} ({selectedService.durationMinutes || 60} mins)</span>
                </div>

                {/* Practitioner Scope & Disclosure */}
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-purple-200 font-semibold">
                    <span>Caregiver Classification:</span>
                    <span className="font-bold text-white">
                      {nurseToConfirm?.qualificationTitle || (nurseToConfirm?.careLevel === 'registered_nurse' ? 'NCJ Registered Clinical Nurse' : 'Certified Geriatric Care Aide')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    {nurseToConfirm?.careLevel === 'registered_nurse'
                      ? 'Authorized for doctor-prescribed IV infusions, sterile wound debridement, and clinical procedures.'
                      : 'Authorized for senior assistance, ADL hygiene, vitals assessment, and companionship.'}
                  </p>
                </div>

                <div className="flex justify-between text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl font-medium">
                  <span>Free Cancellation Policy:</span>
                  <span>Until 2 hours before visit</span>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Escrow Authorized</span>
                    <span className="text-lg font-black text-[#C77DFF]">
                      {formatJMD(nurseToConfirm?.hourlyRateJMD || selectedService.priceJMD)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Includes 15% Platform Insurance &amp; 119 Safety Ops</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Select Jamaican Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border font-bold flex items-center gap-2 transition ${
                      paymentMethod === 'card' ? 'border-blue-400 bg-blue-600/30 text-white shadow-sm' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-400" /> Credit/Debit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('lynk_mobile_money')}
                    className={`p-3 rounded-xl border font-bold flex items-center gap-2 transition ${
                      paymentMethod === 'lynk_mobile_money' ? 'border-blue-400 bg-blue-600/30 text-white shadow-sm' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" /> Lynk (@wecareja)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ncb_quik')}
                    className={`p-3 rounded-xl border font-bold flex items-center gap-2 transition ${
                      paymentMethod === 'ncb_quik' ? 'border-blue-400 bg-blue-600/30 text-white shadow-sm' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-400" /> NCB Bank Transfer / Quik
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-3 rounded-xl border font-bold flex items-center gap-2 transition ${
                      paymentMethod === 'cash_on_delivery' ? 'border-blue-400 bg-blue-600/30 text-white shadow-sm' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" /> Cash on Delivery (At Doorstep)
                  </button>
                </div>
              </div>

              {/* NCB Business Savings Account Details */}
              {paymentMethod === 'ncb_quik' && (
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between text-blue-200 font-bold">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-400" />
                      <span>NCB Jamaica (Business Savings Account)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Direct Bank Transfer
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
                    <div><span className="text-slate-400">Bank:</span> <strong className="text-white">National Commercial Bank (NCB) Jamaica</strong></div>
                    <div><span className="text-slate-400">Account Type:</span> <strong className="text-emerald-300">Business Savings</strong></div>
                    <div><span className="text-slate-400">Account Name:</span> <strong className="text-white">We Care Jamaica Limited</strong></div>
                    <div><span className="text-slate-400">Branch Transit:</span> <strong className="text-white">062 (Oxford Place / New Kingston)</strong></div>
                    <div className="sm:col-span-2 text-slate-300">
                      <span className="text-slate-400">Account Number:</span> <span className="font-mono text-emerald-400 font-bold tracking-wider">Configured (Direct BOJ Escrow)</span>
                    </div>
                    <div className="sm:col-span-2 text-slate-400 text-[10px]">
                      Reference: <span className="font-mono text-purple-300">WCJ-{visitDate.replace(/-/g, '')}-{(selectedService?.id || 'SRV').toUpperCase()}</span>
                    </div>
                  </div>

                  {/* QA Test Simulation: Failed Payment */}
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-red-200">
                      <input
                        type="checkbox"
                        checked={simulatePaymentFailure}
                        onChange={(e) => {
                          setSimulatePaymentFailure(e.target.checked);
                          if (e.target.checked) setPaymentFailureError(null);
                        }}
                        className="rounded text-red-500 focus:ring-red-400"
                      />
                      <span className="font-bold">[QA Test Trigger]: Simulate Payment Failure / Decline</span>
                    </label>
                    <p className="text-[10px] text-slate-400 pl-6">
                      When enabled, clicking confirm will simulate an NCB bank decline. Booking will NOT confirm.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Failure Error Alert */}
              {paymentFailureError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-red-100 font-bold mb-0.5">Payment Failed &amp; Booking Aborted:</strong>
                    <span>{paymentFailureError}</span>
                  </div>
                </div>
              )}

              {/* Client Double Booking Warning Alert */}
              {clientDoubleBookingWarning && (
                <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-100 font-bold mb-0.5">Double-Booking Precaution:</strong>
                    <span>{clientDoubleBookingWarning}</span>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200">
                <p>
                  🔒 <strong>We Care Security Guarantee:</strong> Free cancellation up to 2 hours before scheduled time. If the practitioner cancels or cannot make it, a 100% refund is automatically returned to your card/wallet.
                </p>
              </div>

              <button
                disabled={!activeConflictCheck.isAvailable}
                onClick={handleConfirmBooking}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 ${
                  !activeConflictCheck.isAvailable
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                    : 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white shadow-purple-900/50'
                }`}
              >
                {!activeConflictCheck.isAvailable ? (
                  <>
                    <Ban className="w-4 h-4 text-red-400" />
                    <span>Practitioner Booked (Select Alternative Time)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Authorize Escrow &amp; Confirm Booking ({formatJMD(nurseToConfirm?.hourlyRateJMD || selectedService.priceJMD)})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 5: BOOKING SUCCESS CONFIRMATION */}
          {currentStep === 'success' && (
            <div className="text-center py-8 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-black text-white">Booking Request Dispatched!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your caregiver has received your request. Under Jamaican clinical guidelines, <strong>the booking will be activated once your attending caregiver accepts</strong>.
              </p>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-purple-200 text-left">
                <span className="font-bold block mb-1 text-white">What happens next:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                  <li>Your caregiver will review and accept your visit request.</li>
                  <li>Upon caregiver acceptance, doorstep arrival QR pass and live tracking unlock.</li>
                  <li>Use in-app chat for gate code or parking instructions once activated.</li>
                  <li>119 Panic Button remains available at all times.</li>
                </ul>
              </div>

              {/* Confirmed Booking PPE Mandate Notice */}
              <PPESafetyNotice variant="booking_confirmed" userRole="client" />

              <button
                onClick={() => {
                  setCurrentStep('browse');
                  setActiveTab('active_bookings');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white font-bold text-xs hover:opacity-95 transition shadow-lg shadow-purple-900/40"
              >
                View Active Bookings
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW: CLIENT DEDICATED DASHBOARD */}
      {currentStep === 'browse' && activeTab === 'dashboard' && (
        <ClientDashboard
          currentUser={currentUser}
          bookings={clientBookings}
          services={services}
          nurses={nurses}
          onRequestNewVisit={() => {
            setCurrentStep('select_service');
            setActiveTab('new_booking');
          }}
          onSelectService={(service) => {
            setSelectedService(service);
            setCurrentStep('schedule_location');
            setActiveTab('new_booking');
          }}
          onViewBookingDetails={(booking) => {
            setSelectedBookingForMedicalSummary(booking);
          }}
          onOpenChat={onOpenChat}
          onOpenArrivalQR={(booking) => {
            setSelectedBookingForArrivalQR(booking);
          }}
          onOpenCelebration={(payload) => {
            setCelebrationPayload(payload);
          }}
          onNavigateToMilestones={() => {
            setActiveTab('milestones');
          }}
          onNavigateToHistory={() => {
            setActiveTab('history');
          }}
          onNavigateToCoverageMap={() => {
            setActiveTab('coverage_map');
          }}
          onNavigateToMedSchedule={() => {
            soundFX.playTabSwitch();
            setActiveTab('medication_schedule');
            setCurrentStep('browse');
          }}
          onUpdateBookingStatus={onUpdateBookingStatus}
        />
      )}

      {/* VIEW: ACTIVE VISITS LIST */}
      {currentStep === 'browse' && activeTab === 'active_bookings' && (
        <div className="space-y-4">
          {/* Elderly Loved One 3x Daily Care Routine Prompt Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#1E1B4B]/40 to-red-950/60 backdrop-blur-xl border-2 border-purple-400/40 shadow-2xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                    Specialized Elderly Care Regimen
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Save $2,000 / Day Package Discount
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Elderly Loved One Left at Home Alone?
                </h3>
                <p className="text-xs text-purple-200/90 max-w-2xl leading-relaxed">
                  Sign up for <strong className="text-white">3 Practitioner Visits Per Day</strong>: Morning awakening &amp; meds (8:00 AM), Midday nutrition &amp; mobility (1:00 PM), and Evening dinner &amp; tuck-in safety check (6:00 PM). Includes automated 30-minute pre-visit browser notifications.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSuggestionModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-extrabold text-xs shadow-xl shadow-purple-950/60 border border-pink-300/40 transition flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-white fill-white" />
                  <span>Match Guardian Caregiver</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof (window as any).__triggerWeCare30MinReminderTest === 'function') {
                      (window as any).__triggerWeCare30MinReminderTest();
                    } else {
                      soundFX.triggerNotification(
                        '⏰ 30-Minute Visit Reminder: Senior Care Check',
                        'Assigned caregiver arrives in approximately 30 minutes at your residence.',
                        'visit_reminder_30min'
                      );
                    }
                  }}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white font-bold text-xs border border-purple-400/30 transition flex items-center gap-1.5 shadow-sm"
                  title="Test the 30-minute pre-visit chime and browser alert system"
                >
                  <Bell className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Test 30-Min Visit Reminder</span>
                </button>
              </div>
            </div>

            {/* Routine Schedule Indicator Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-black text-xs shrink-0">
                  🌅 1
                </div>
                <div>
                  <span className="font-bold text-white block text-[11px]">Morning (8:00 AM)</span>
                  <span className="text-[10px] text-slate-300">Awakening, vitals, breakfast &amp; meds</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-black text-xs shrink-0">
                  ☀️ 2
                </div>
                <div>
                  <span className="font-bold text-white block text-[11px]">Afternoon (1:00 PM)</span>
                  <span className="text-[10px] text-slate-300">Lunch, hydration, hygiene &amp; mobility</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-black text-xs shrink-0">
                  🌙 3
                </div>
                <div>
                  <span className="font-bold text-white block text-[11px]">Evening (6:00 PM)</span>
                  <span className="text-[10px] text-slate-300">Dinner, night meds &amp; bedtime safety</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C77DFF]" />
              Active Home Visits in Kingston &amp; St Andrew
            </h3>
            <span className="text-xs text-slate-400">{activeBookingsList.length} Active</span>
          </div>

          {/* Live Care Transit Sheet & Transit Radar Tracker */}
          {activeBookingsList.find(b => b.status === 'en_route' || b.status === 'in_progress' || b.status === 'accepted') && (
            <div className="animate-fadeIn">
              <LiveCareTransitSheet
                booking={activeBookingsList.find(b => b.status === 'en_route' || b.status === 'in_progress' || b.status === 'accepted')!}
                onOpenChat={(b) => onOpenChat(b)}
                onOpenPanic={(b) => onOpenPanic(b)}
                onCancelBooking={(id, reason) => onCancelBooking(id, reason)}
                onStartTimer={(bId) => handleClientStartTimer(bId)}
              />
            </div>
          )}

          {activeBookingsList.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 text-[#C77DFF] border border-white/10 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">No Active Visits Right Now</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Need wound care, elderly companionship, ADL assistance, or IV therapy in Kingston? Book a verified caregiver in under 2 minutes.
              </p>
              <button
                onClick={() => {
                  setCurrentStep('select_service');
                  setActiveTab('new_booking');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white font-bold text-xs hover:opacity-95 transition shadow-lg shadow-purple-900/30 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Book Home Visit
              </button>
            </div>
          ) : (
            <SmartBookingSearch
              bookings={activeBookingsList}
              placeholder="Smart Search visits by booking #BK, Kingston zone, nurse, condition, or meds..."
            >
              {(filteredClientBookings) => (
                filteredClientBookings.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center space-y-2 text-slate-400 text-xs">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-300">
                      <Search className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">No Active Visits Match Your Filter</h4>
                    <p className="max-w-md mx-auto text-slate-400">
                      No active visits match your current search query or parish filter. Try searching for a different keyword or reset filters.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredClientBookings.map((booking, bIdx) => {
                const statusStyles = {
                  requested: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                  accepted: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                  en_route: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                  in_progress: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                  completed: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
                  disputed: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                };

                const statusLabel = {
                  requested: 'Pending Caregiver Acceptance ⏳',
                  accepted: 'Caregiver Accepted • Activated ✓',
                  en_route: 'En Route 🚗',
                  in_progress: 'Visit In Progress 🩺',
                  completed: 'Completed',
                  cancelled: 'Cancelled',
                  disputed: 'Under Review'
                };

                return (
                  <div
                    key={booking?.id ? `client-bk-${booking.id}-${bIdx}` : `client-bk-idx-${bIdx}`}
                    className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-4 hover:border-white/20 transition text-white"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-start gap-3">
                        <ServiceLogo serviceName={booking.serviceName} size="md" showBadge={false} withGlow={true} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyles[booking.status]}`}>
                              {statusLabel[booking.status]}
                            </span>
                            <span className="text-xs font-mono text-purple-300">#{booking.id}</span>
                            <PPEReadyBadge booking={booking} />
                          </div>
                          <h4 className="font-bold text-white text-base">{booking.serviceName}</h4>
                          <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span>{booking.clientAddress}, {booking.zone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 text-right">
                        <div className="flex items-center gap-2">
                          <QuickSOSButton
                            booking={booking}
                            userRole="client"
                            onUpdateBookingStatus={onUpdateBookingStatus}
                            onTriggerNotification={onTriggerNotification}
                            size="sm"
                          />
                          <div>
                            <span className="text-base font-black text-[#C77DFF]">{formatJMD(booking.priceJMD)}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 block">Escrow Protected</span>
                      </div>
                    </div>

                    {/* Awaiting Caregiver Acceptance Timer & Auto-Reroute Cascade */}
                    {booking.status === 'requested' && (
                      <CaregiverAcceptanceTimerCard
                        booking={booking}
                        nurses={nurses}
                        onRerouteBooking={onRerouteBooking}
                        onUpdateBookingStatus={onUpdateBookingStatus}
                        onTriggerNotification={onTriggerNotification}
                        onOpenPrompt={(type, b) => setPromptModal({ isOpen: true, type, booking: b })}
                      />
                    )}

                    {/* Doorstep Arrival Alert Banner (Instant notification when nurse/caregiver is at door) */}
                    <ClientDoorstepArrivalBanner
                      booking={booking}
                      onUpdateBookingStatus={onUpdateBookingStatus}
                      onOpenQRPass={(b) => setSelectedBookingForArrivalQR(b)}
                      onCallCaregiver={(b) => setSelectedBookingForCallModal(b)}
                      onTriggerNotification={onTriggerNotification}
                      className="my-1.5"
                    />

                    {/* Live Arrival ETA Notification Message from Nurse (e.g. 'Nurse is 10 minutes away') */}
                    {(booking.arrivalNotificationMessage || booking.arrivalEtaMinutes !== undefined) && (
                      <ClientArrivalEtaBanner
                        booking={booking}
                        onCallCaregiver={(b) => setSelectedBookingForCallModal(b)}
                        onOpenChat={(b) => onOpenChat(b)}
                        className="my-1.5"
                      />
                    )}

                    {/* Doorstep Arrival Pass & Security PIN Card (Mandatory before nurse can start visit) */}
                    {(booking.status === 'accepted' || booking.status === 'en_route') && !booking.arrivalVerified && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-purple-950/60 to-slate-900 border-2 border-emerald-400/50 shadow-xl space-y-3 my-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shrink-0">
                              <KeyRound className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-white text-sm">Doorstep Arrival Pass &amp; Code</span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/40">
                                  Mandatory To Start Visit
                                </span>
                              </div>
                              <p className="text-xs text-slate-300">
                                The caregiver cannot start the visit timer until they scan this pass or you / your family provide this PIN.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedBookingForArrivalQR(booking)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                            >
                              <QrCode className="w-4 h-4 text-slate-950" />
                              <span>Show QR Pass</span>
                            </button>
                          </div>
                        </div>

                        {/* PIN Code Box & Remote Relative Helper */}
                        <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 font-medium">Your Doorstep PIN:</span>
                            <span className="font-mono font-black text-emerald-300 text-lg bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-400/50 tracking-widest shadow-inner">
                              {getArrivalPassCode(booking)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator.clipboard) {
                                  navigator.clipboard.writeText(getArrivalPassCode(booking));
                                  soundFX.playSuccessPing();
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                              title="Copy Doorstep PIN"
                            >
                              Copy
                            </button>
                          </div>

                          <div className="text-[11px] text-amber-200/90 leading-tight">
                            💡 <strong>Unable to use a phone?</strong> A family member elsewhere can open their own device and read or text this code to the nurse!
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Active In-Progress Live Care Timer & Alert */}
                    {booking.status === 'in_progress' && (
                      <div className="pt-1">
                        <VisitTimerWidget
                          booking={booking}
                          userRole="client"
                          onStartTimer={(bId) => {
                            if (onUpdateBookingStatus) {
                              onUpdateBookingStatus(bId, 'in_progress', undefined, { visitStartedAt: new Date().toISOString() });
                            }
                          }}
                          onEndTimer={(bId, elapsedMin, startAt, endAt) => {
                            if (onUpdateBookingStatus) {
                              onUpdateBookingStatus(bId, 'completed', undefined, {
                                actualDurationMinutes: elapsedMin,
                                visitStartedAt: startAt,
                                visitEndedAt: endAt
                              });
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Practitioner Details & Schedule */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/5 p-3.5 rounded-xl border border-white/10">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => {
                          const matchedNurse = nurses.find(n => n.id === booking.nurseId || n.name === booking.nurseName);
                          if (matchedNurse) {
                            setViewingNurseProfile(matchedNurse);
                          }
                        }}
                        title="Click to view full verified profile"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={booking.nursePhoto || 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=400'}
                            alt={booking.nurseName}
                            className="w-11 h-11 rounded-full object-cover border-2 border-[#1E1B4B] group-hover:scale-105 transition"
                          />
                          <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                            <ShieldCheck className="w-2.5 h-2.5" />
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white block group-hover:text-purple-300 transition">
                              {booking.nurseName || 'Assigned Practitioner'}
                            </span>
                            <Eye className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                          </div>
                          {(() => {
                            const matched = nurses.find(n => n.id === booking.nurseId);
                            return (
                              <CaregiverTierBadge
                                nurse={matched || {
                                  careLevel: 'registered_nurse',
                                  requiresNcjRegistration: true,
                                  licenseVerified: true
                                } as any}
                                size="xs"
                                variant="badge"
                                className="mt-0.5"
                              />
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#C77DFF]" />
                          <span>Scheduled: {new Date(booking.scheduledDateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 mt-0.5">
                          Free cancellation before: {new Date(booking.freeCancelDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* LIVE DOORSTEP CHECK-IN STATUS DISPLAY */}
                    {(booking.arrivalVerified || booking.pinVerified || booking.status === 'ARRIVED_VERIFIED') ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-between gap-3 shadow-lg my-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                              DOORSTEP ARRIVAL VERIFIED ✓
                            </span>
                            <h4 className="text-sm font-black text-white truncate">
                              Nurse Arrived - PIN Verified at {booking.arrivalVerifiedAt ? new Date(booking.arrivalVerifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '9:32 AM'}
                            </h4>
                            <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{booking.arrivalGpsLocation || '14 Trafalgar Road, Kingston 10, Jamaica'}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForArrivalQR(booking)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shrink-0 cursor-pointer"
                        >
                          View Pass
                        </button>
                      </div>
                    ) : (booking.status === 'accepted' || booking.status === 'en_route') ? (
                      <div className="p-3.5 rounded-2xl bg-[#1E1B4B]/80 border-2 border-[#F59E0B] flex items-center justify-between gap-3 shadow-xl my-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            className="w-10 h-10 rounded-xl text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md"
                            style={{ backgroundColor: '#F59E0B' }}
                          >
                            <QrCode className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                              DOORSTEP ARRIVAL PASS READY
                            </span>
                            <h4 className="text-xs sm:text-sm font-black text-white truncate">
                              Show QR Code or 4-Digit PIN to Nurse
                            </h4>
                            <p className="text-[11px] text-slate-300 truncate">
                              Auto-generated Job #{booking.id} security pass
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForArrivalQR(booking)}
                          className="px-3.5 py-2 rounded-xl text-xs font-black text-[#1E1B4B] shadow-md transition shrink-0 cursor-pointer hover:opacity-95"
                          style={{ backgroundColor: '#F59E0B' }}
                        >
                          Open QR Pass
                        </button>
                      </div>
                    ) : null}

                    {/* Confirmed Booking & Arrival PPE Safety Reminder */}
                    <PPESafetyNotice
                      variant={booking.status === 'in_progress' ? 'on_arrival' : 'compact'}
                      userRole="client"
                      className="my-1"
                    />

                    {/* Interactive PPE Protection Responsibility Toggle */}
                    <PPEToggle
                      booking={booking}
                      userRole="client"
                      onUpdateBookingStatus={onUpdateBookingStatus}
                      className="my-1"
                    />

                    {/* Live Visit Care Timer Widget (Client View with Start Button & Auto-Invoice) */}
                    {(booking.status === 'accepted' || booking.status === 'en_route' || booking.status === 'in_progress') && (
                      <div className="pt-1">
                        <VisitTimerWidget
                          booking={booking}
                          userRole="client"
                          onStartTimer={(bId) => handleClientStartTimer(bId)}
                        />
                      </div>
                    )}

                    {/* Real-time Dictated Clinical Notes & Visit Updates */}
                    {(((booking?.visitUpdates?.length || 0) > 0) || ((booking?.clinicalNotes?.visitUpdates?.length || 0) > 0)) && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-black/40 to-purple-950/30 border border-purple-500/30 space-y-2 shadow-inner">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-purple-200 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                            Live Care Updates &amp; Dictated Notes ({(booking?.visitUpdates || booking?.clinicalNotes?.visitUpdates || []).length})
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Live Nurse Feed
                          </span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {(booking.visitUpdates || booking.clinicalNotes?.visitUpdates || []).map((log, lIdx) => (
                            <div key={log?.id ? `log-${log.id}-${lIdx}` : `log-idx-${lIdx}`} className="p-2 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-200">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                                <span className="font-bold text-white flex items-center gap-1">
                                  <span>{log.authorName}</span>
                                  {log.recordedViaVoice && (
                                    <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] border border-purple-500/30 font-sans">
                                      Dictated
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono text-purple-300">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed">{log.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unified Professional Care Actions Bar with Cascading Dropdowns */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 mt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Care Actions Cascading Dropdown */}
                        <ActionDropdown
                          label="Care Actions"
                          icon={<Sparkles className="w-4 h-4 text-purple-300 shrink-0" />}
                          size="sm"
                          variant="primary"
                          items={[
                            ...(booking.status === 'requested' ? [{
                              id: 'act-qr-locked',
                              label: 'QR Pass (Locked)',
                              sublabel: 'Unlocks once caregiver accepts booking',
                              icon: <Lock className="w-4 h-4 text-amber-400" />,
                              disabled: true,
                              onClick: () => {}
                            }] : booking.status === 'in_progress' ? [{
                              id: 'act-checkout-qr',
                              label: 'Visit Check-Out QR Pass',
                              sublabel: 'Show QR to nurse to sign off visit',
                              icon: <QrCode className="w-4 h-4 text-purple-300" />,
                              onClick: () => setSelectedBookingForArrivalQR(booking)
                            }] : [{
                              id: 'act-arrival-qr',
                              label: booking.arrivalVerified ? '✓ Arrival Verified (QR)' : 'Doorstep Arrival QR Pass',
                              sublabel: 'Show to nurse upon arrival at doorstep',
                              icon: booking.arrivalVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <QrCode className="w-4 h-4 text-emerald-400" />,
                              onClick: () => setSelectedBookingForArrivalQR(booking)
                            }]),
                            ...((booking.status === 'accepted' || booking.status === 'en_route') ? [{
                              id: 'act-fullscreen',
                              label: 'Fullscreen Pass & Details',
                              sublabel: 'Interactive map and dispatch tracker',
                              icon: <Maximize2 className="w-4 h-4 text-purple-300" />,
                              onClick: () => setPromptModal({ isOpen: true, type: 'accepted', booking })
                            }] : []),
                            ...((!booking.visitStartedAt && (booking.status === 'accepted' || booking.status === 'en_route')) ? [{
                              id: 'act-start-clock',
                              label: 'Start Visit Clock',
                              sublabel: 'Caregiver has arrived, start timer',
                              icon: <Clock className="w-4 h-4 text-emerald-400" />,
                              onClick: () => handleClientStartTimer(booking.id)
                            }] : []),
                            ...(booking.status === 'in_progress' ? [{
                              id: 'act-complete-rate',
                              label: 'Complete & Rate Visit',
                              sublabel: 'Finalize care hours and rate caregiver',
                              icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
                              onClick: () => {
                                if (onUpdateBookingStatus) {
                                  onUpdateBookingStatus(booking.id, 'completed', undefined, { visitEndedAt: new Date().toISOString() });
                                }
                                onOpenRating(booking);
                              }
                            }] : []),
                            {
                              id: 'act-cancel-booking',
                              label: 'Cancel Booking',
                              sublabel: 'Request cancellation and refund',
                              icon: <X className="w-4 h-4 text-red-400" />,
                              variant: 'danger',
                              divider: true,
                              onClick: () => setShowCancelModal(booking)
                            }
                          ]}
                        />

                        {/* 2. Contact Caregiver Cascading Dropdown */}
                        <ActionDropdown
                          label="Contact"
                          icon={<Phone className="w-4 h-4 text-emerald-400 shrink-0" />}
                          size="sm"
                          variant="emerald"
                          items={[
                            {
                              id: 'call-caregiver',
                              label: 'Voice Call',
                              sublabel: booking.nursePhone || 'Assigned caregiver phone',
                              icon: <Phone className="w-4 h-4 text-emerald-400" />,
                              onClick: () => setSelectedBookingForCallModal(booking)
                            },
                            {
                              id: 'video-caregiver',
                              label: 'Telehealth Video',
                              sublabel: 'Secure encrypted video room',
                              icon: <Video className="w-4 h-4 text-purple-300" />,
                              onClick: () => {
                                if (onOpenVideoCall) {
                                  onOpenVideoCall(booking.nurseName, 'nurse', `Clinical Telehealth with Nurse ${booking.nurseName}`);
                                }
                              }
                            },
                            {
                              id: 'chat-caregiver',
                              label: 'Message Caregiver',
                              sublabel: 'Real-time in-app chat',
                              icon: <MessageSquare className="w-4 h-4 text-purple-300" />,
                              badge: booking.unreadMessagesCount ? `${booking.unreadMessagesCount}` : undefined,
                              onClick: () => onOpenChat(booking)
                            }
                          ]}
                        />

                        {/* Quick-SOS Trigger */}
                        <QuickSOSButton
                          booking={booking}
                          userRole="client"
                          onUpdateBookingStatus={onUpdateBookingStatus}
                          onTriggerNotification={onTriggerNotification}
                          size="sm"
                        />

                        {/* 119 Emergency Button */}
                        <button
                          type="button"
                          onClick={() => onOpenPanic(booking)}
                          className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                          title="Speed Dial to 119 Emergency Dispatch"
                        >
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          <span>119</span>
                        </button>
                      </div>

                      {/* Right: Status Badge / QR Shortcut */}
                      <div className="flex items-center gap-2">
                        {booking.status === 'in_progress' ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateBookingStatus) {
                                onUpdateBookingStatus(booking.id, 'completed', undefined, { visitEndedAt: new Date().toISOString() });
                              }
                              onOpenRating(booking);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>Complete &amp; Rate</span>
                          </button>
                        ) : booking.arrivalVerified ? (
                          <div
                            onClick={() => setSelectedBookingForArrivalQR(booking)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold shadow-xs cursor-pointer hover:bg-emerald-500/30 transition"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedBookingForArrivalQR(booking)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 via-purple-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-purple-600/40 text-emerald-200 hover:text-white border border-emerald-400/40 font-bold text-[11px] transition flex items-center gap-1.5 shadow-xs cursor-pointer animate-pulse"
                          >
                            <QrCode className="w-4 h-4 text-emerald-400" />
                            <span>QR Pass</span>
                          </button>
                        )}
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

      {/* VIEW: KINGSTON & ST. ANDREW LIVE SERVICE COVERAGE MAP (LEAFLET + GEOLOCATION + DARK MODE) */}
      {currentStep === 'browse' && activeTab === 'coverage_map' && (
        <div className="space-y-4">
          <KingstonCoverageMapView
            nurses={availableNurses}
            clientZone={selectedZone}
            clientAddress={clientAddress}
            selectedNurse={selectedNurse}
            onSelectNurse={(nurse) => setSelectedNurse(nurse)}
            onViewNurseProfile={(nurse) => setViewingNurseProfile(nurse)}
            userGpsCoords={gpsCoords}
            isGpsActive={isGpsActive}
            onTriggerGps={handleTriggerGeolocation}
            isLocatingGps={isLocatingGps}
            onSetDemoGps={handleSetDemoGps}
            onBookNurse={(nurse) => {
              setSelectedNurse(nurse);
              setActiveTab('new_booking');
              setCurrentStep('select_service');
            }}
          />
        </div>
      )}

      {/* VIEW: SMART CAREGIVER SUGGESTION MATCHER (DEDICATED SECTION) */}
      {currentStep === 'browse' && activeTab === 'smart_suggest' && (
        <CaregiverSuggestionSection
          nurses={nurses}
          services={services}
          allBookings={bookings}
          currentZone={selectedZone}
          onSelectAndBook={handleSelectAndBookFromSuggestion}
          onViewProfile={(nurse) => setViewingNurseProfile(nurse)}
          onOpenScopeModal={() => setShowScopeModal(true)}
          currentUser={currentUser}
          onUpdateNurseProfile={onUpdateNurseProfile}
        />
      )}

      {/* VIEW: FIND NEARBY CAREGIVERS (DEDICATED EXPLORER) */}
      {currentStep === 'browse' && activeTab === 'find_nearby' && (
        <div className="space-y-4">
          <FindNearbyNurseSection
            nurses={availableNurses}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            selectedNurse={selectedNurse}
            onSelectNurse={(nurse) => setSelectedNurse(nurse)}
            onViewNurseProfile={(nurse) => setViewingNurseProfile(nurse)}
            onToggleAvailability={handleToggleNurseAvailability}
            gpsCoords={gpsCoords}
            isGpsActive={isGpsActive}
            isLocatingGps={isLocatingGps}
            gpsError={gpsError}
            gpsNearestZone={gpsNearestZone}
            onTriggerGps={handleTriggerGeolocation}
            onClearGps={handleClearGps}
            onSetDemoGps={handleSetDemoGps}
            viewMode={nurseSelectionViewMode}
            onChangeViewMode={setNurseSelectionViewMode}
            isBookingFlow={false}
            allBookings={bookings}
            requestedDate={visitDate}
            requestedTime={visitTime}
            durationMinutes={60}
            onBookNurse={(nurse) => {
              setSelectedNurse(nurse);
              setActiveTab('new_booking');
              setCurrentStep('select_service');
            }}
          />
        </div>
      )}

      {/* VIEW: PATIENT CLINICAL HISTORY & RATINGS */}
      {currentStep === 'browse' && activeTab === 'history' && (
        <PatientHistorySection
          bookings={clientBookings}
          clientName={clientName}
          clientPhone={clientPhone}
          clientAddress={clientAddress}
          onOpenRating={(b) => onOpenRating(b)}
          onViewInvoice={(b) => setSelectedBookingForInvoiceModal(b)}
          onRebookService={handleRebookService}
          onOpenChat={(b) => onOpenChat(b)}
          onBookNewCare={() => {
            setCurrentStep('select_service');
            setActiveTab('new_booking');
          }}
          logoVariation={logoVariation}
          onOpenBiometricScan={(b) => setSelectedBookingForBiometricScan(b || clientBookings[0] || bookings[0])}
          onDownloadMedicalSummary={(b) => setSelectedBookingForMedicalSummary(b)}
        />
      )}

      {/* VIEW: MOHW HEALTH NEWS FEED (GOOGLE SEARCH GROUNDED) */}
      {currentStep === 'browse' && activeTab === 'health_news' && (
        <HealthNewsFeed
          onBookService={(topic) => {
            setCurrentStep('select_service');
            setActiveTab('new_booking');
            if (topic) {
              setNotes(`Client requested visit related to MOHW health notice: ${topic}`);
            }
          }}
        />
      )}

      {/* VIEW: ACTIVITY NOTIFICATIONS & LIVE AUDIO STREAM */}
      {currentStep === 'browse' && activeTab === 'notifications' && (
        <div className="space-y-4">
          <ActivityNotificationStream
            notifications={notifications}
            onMarkAsRead={onMarkNotificationRead}
            onMarkAllAsRead={onMarkAllNotificationsRead}
            onClearNotifications={onClearNotifications}
            currentRole="client"
          />
        </div>
      )}

      {/* VIEW: PATIENT MILESTONE & POSITIVE REINFORCEMENT TRACKER */}
      {currentStep === 'browse' && activeTab === 'milestones' && (
        <div className="space-y-4 animate-fadeIn">
          <PatientMilestoneTracker
            bookings={clientBookings}
            currentUser={currentUser}
            onOpenCelebration={(payload) => setCelebrationPayload(payload)}
            onNavigateToServices={() => {
              setCurrentStep('select_service');
              setActiveTab('new_booking');
            }}
          />
        </div>
      )}

      {/* VIEW: INSTANT CARE DISPATCH */}
      {currentStep === 'browse' && activeTab === 'instant_dispatch' && (
        <div className="space-y-4 animate-fadeIn">
          <InstantCareDispatchView
            nurses={availableNurses}
            services={services}
            currentUser={currentUser}
            userGpsCoords={gpsCoords}
            onTriggerGps={handleTriggerGeolocation}
            isLocatingGps={isLocatingGps}
            onConfirmDispatch={handleConfirmInstantDispatch}
            onViewNurseProfile={(nurse) => setViewingNurseProfile(nurse)}
          />
        </div>
      )}

      {/* VIEW: CAREGIVER FAVORITES & SAVED PRACTITIONERS */}
      {currentStep === 'browse' && activeTab === 'favorites' && (
        <div className="space-y-4 animate-fadeIn">
          <CaregiverFavoritesSection
            nurses={nurses}
            onSelectNurseForBooking={(nurse) => {
              setSelectedNurse(nurse);
              setActiveTab('instant_dispatch');
              setCurrentStep('browse');
            }}
            onViewNurseProfile={(nurse) => setViewingNurseProfile(nurse)}
          />
        </div>
      )}

      {/* VIEW: PATIENT CLINICAL VITALS & TELEMETRY DASHBOARD */}
      {currentStep === 'browse' && activeTab === 'vitals_dashboard' && (
        <div className="space-y-4 animate-fadeIn">
          <HealthVitalsDashboard
            currentUser={currentUser}
            bookings={clientBookings}
            onRequestVitalsVisit={() => {
              setActiveTab('instant_dispatch');
              setCurrentStep('browse');
            }}
          />
        </div>
      )}

      {/* VIEW: CLIENT REVIEW DASHBOARD */}
      {currentStep === 'browse' && activeTab === 'reviews_dashboard' && (
        <div className="space-y-4 animate-fadeIn">
          <ClientReviewDashboard
            bookings={bookings}
            nurses={nurses}
            currentUser={currentUser}
            onOpenRating={onOpenRating}
            onOpenNurseProfile={(nurse) => setViewingNurseProfile(nurse)}
            viewerRole="client"
          />
        </div>
      )}

      {/* VIEW: PERSONALIZED HEALTH OVERVIEW (CARE TIMELINE, MEDICATION SCHEDULE, UPCOMING APPOINTMENTS) */}
      {currentStep === 'browse' && activeTab === 'health_overview' && (
        <div className="space-y-4 animate-fadeIn">
          <PatientHealthOverviewView
            currentUser={currentUser}
            bookings={bookings}
            services={services}
            nurses={nurses}
            onUpdateUser={onUpdateUser}
            onRequestNewVisit={() => {
              setActiveTab('new_booking');
              setCurrentStep('select_service');
            }}
            onOpenChat={(b) => onOpenChat(b)}
            onOpenArrivalQR={(b) => setSelectedBookingForArrivalQR(b)}
            onViewBookingDetails={(b) => setSelectedBookingForMedicalSummary(b)}
            onNavigateToHistory={() => {
              setActiveTab('history');
              setCurrentStep('browse');
            }}
            logoVariation={logoVariation}
          />
        </div>
      )}

      {/* VIEW: VISUAL MEDICATION SCHEDULE SUB-COMPONENT WITH 'TAKE' BUTTONS */}
      {currentStep === 'browse' && activeTab === 'medication_schedule' && (
        <div className="space-y-4 animate-fadeIn">
          <VisualMedicationSchedule
            currentUser={currentUser}
            onUpdateUser={onUpdateUser}
            onNavigateToBooking={() => {
              setActiveTab('new_booking');
              setCurrentStep('select_service');
            }}
          />
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-xl animate-fadeIn">
          <div className="bg-[#150722]/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/15 text-white">
            <h3 className="text-base font-bold text-white">Cancel Booking #{showCancelModal.id}</h3>
            <p className="text-xs text-slate-300 mt-1">
              Free cancellation is enabled up to 2 hours before the visit time. Full escrow refund will be processed immediately.
            </p>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-300 block mb-1">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs backdrop-blur-md"
              >
                <option value="Schedule change">Schedule change</option>
                <option value="Patient condition improved">Patient condition improved</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Need different time slot">Need different time slot</option>
              </select>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-slate-300 font-bold text-xs hover:bg-white/10 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelSubmit}
                className="flex-1 py-2.5 rounded-xl bg-[#F59E0B] text-white font-bold text-xs hover:bg-red-600 shadow-md shadow-red-900/40 transition"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Care Invoice & Receipt Modal */}
      {selectedBookingForInvoiceModal && (
        <InvoiceReceiptModal
          booking={selectedBookingForInvoiceModal}
          onClose={() => setSelectedBookingForInvoiceModal(null)}
          logoVariation={logoVariation}
        />
      )}

      {/* Verified Practitioner Profile & Council Credentials Modal */}
      <NurseProfileModal
        nurse={viewingNurseProfile}
        isOpen={!!viewingNurseProfile}
        onClose={() => setViewingNurseProfile(null)}
        viewerRole="client"
        allBookings={bookings}
        requestedDate={visitDate}
        requestedTime={visitTime}
        durationMinutes={selectedService?.durationMinutes || 60}
        onSelectNurseForBooking={(nurse) => {
          setSelectedNurse(nurse);
          setBookingConflictError(null);
          if (currentStep === 'browse') {
            setCurrentStep('schedule_location');
          }
        }}
        isSelected={selectedNurse?.id === viewingNurseProfile?.id}
        onToggleAvailability={(targetNurse) => {
          if (onUpdateNurseProfile) {
            const isCurrentlyOnCall = targetNurse.availabilityStatus !== 'offline';
            const newStatus: 'on_call' | 'offline' = isCurrentlyOnCall ? 'offline' : 'on_call';
            onUpdateNurseProfile({
              ...targetNurse,
              availabilityStatus: newStatus,
              lastAvailabilityToggleAt: new Date().toISOString()
            });
            if (newStatus === 'on_call') {
              soundFX.playAvailabilityOnCall();
            } else {
              soundFX.playAvailabilityOffline();
            }
          }
        }}
      />

      {/* Scope of Care & Pay Rates Comparison Modal */}
      <ScopeOfCareModal
        isOpen={showScopeModal}
        onClose={() => setShowScopeModal(false)}
        selectedNurse={selectedNurse || viewingNurseProfile}
      />

      {/* Device Camera Capture Modal for Profile Picture */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={(photoDataUrl) => {
          if (currentUser && onUpdateUser) {
            onUpdateUser({
              ...currentUser,
              avatarUrl: photoDataUrl
            });
          }
          soundFX.playSuccessPing();
        }}
        title="Take Profile Picture"
      />

      {/* Share We Care Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        logoVariation={logoVariation}
      />

      {/* Smart Caregiver Suggestion Matcher Modal */}
      <CaregiverSuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        nurses={nurses}
        services={services}
        allBookings={bookings}
        currentZone={selectedZone}
        onSelectAndBook={(nurse, service, durationMinutes, date, time, zone, notes) => {
          setIsSuggestionModalOpen(false);
          handleSelectAndBookFromSuggestion(nurse, service, durationMinutes, date, time, zone, notes);
        }}
        onViewProfile={(nurse) => {
          setIsSuggestionModalOpen(false);
          setViewingNurseProfile(nurse);
        }}
        onOpenScopeModal={() => {
          setIsSuggestionModalOpen(false);
          setShowScopeModal(true);
        }}
      />

      {/* Direct Call / In-App Voice Call Modal */}
      {selectedBookingForCallModal && (
        <CallContactModal
          booking={selectedBookingForCallModal}
          callerRole="client"
          onClose={() => setSelectedBookingForCallModal(null)}
          onOpenChat={onOpenChat}
        />
      )}

      {/* Patient Health Profile, Bio Data & Medication Management Modal */}
      {currentUser && (
        <PatientProfileModal
          isOpen={isPatientProfileModalOpen}
          onClose={() => setIsPatientProfileModalOpen(false)}
          user={currentUser}
          onUpdateUser={onUpdateUser}
          viewerRole="client"
        />
      )}

      {/* Patient Doorstep Arrival QR Pass Modal */}
      {selectedBookingForArrivalQR && (
        <ClientArrivalQRCodeModal
          isOpen={!!selectedBookingForArrivalQR}
          booking={selectedBookingForArrivalQR}
          onClose={() => setSelectedBookingForArrivalQR(null)}
          onSimulateNurseArrival={(bookingId) => {
            if (onUpdateBookingStatus) {
              onUpdateBookingStatus(bookingId, 'in_progress', undefined, {
                arrivalVerified: true,
                arrivalVerifiedAt: new Date().toISOString(),
                arrivalVerificationMethod: 'qr_scan',
                arrivalGpsLocation: `18.0179° N, 76.8099° W (${selectedBookingForArrivalQR.zone}, Jamaica)`,
                visitStartedAt: new Date().toISOString()
              });
              soundFX.playSuccessPing();
            }
          }}
          onSimulateNurseCheckout={(bookingId) => {
            if (onUpdateBookingStatus) {
              const nowIso = new Date().toISOString();
              onUpdateBookingStatus(bookingId, 'completed', undefined, {
                checkoutVerified: true,
                checkoutVerifiedAt: nowIso,
                checkoutVerificationMethod: 'qr_scan',
                checkoutGpsLocation: `18.0179° N, 76.8099° W (${selectedBookingForArrivalQR.zone}, Jamaica)`,
                visitEndedAt: nowIso,
                actualDurationMinutes: selectedBookingForArrivalQR.baseDurationMinutes || 60
              });
              soundFX.playVisitCompleted();
            }
          }}
        />
      )}

      {/* Patient Milestone Celebration Modal */}
      <CelebrationMilestoneModal
        isOpen={!!celebrationPayload}
        payload={celebrationPayload}
        onClose={() => setCelebrationPayload(null)}
      />

      {/* Sync Health Data & Device Telemetry Modal */}
      <SyncHealthDataModal
        isOpen={isSyncHealthDataModalOpen}
        onClose={() => setIsSyncHealthDataModalOpen(false)}
        currentUser={currentUser || null}
        onUpdateUser={onUpdateUser}
        onTriggerNotification={onTriggerNotification}
      />

      {/* Official Medical Summary Print & PDF Export Modal */}
      {selectedBookingForMedicalSummary && (
        <MedicalSummaryModal
          isOpen={!!selectedBookingForMedicalSummary}
          booking={selectedBookingForMedicalSummary}
          onClose={() => setSelectedBookingForMedicalSummary(null)}
          onOpenBiometricScan={(b) => setSelectedBookingForBiometricScan(b)}
        />
      )}

      {/* Live Biometric Health Scan Modal (Camera rPPG & Sensor Telemetry) */}
      {selectedBookingForBiometricScan && (
        <BiometricHealthScanModal
          isOpen={!!selectedBookingForBiometricScan}
          booking={selectedBookingForBiometricScan}
          onClose={() => setSelectedBookingForBiometricScan(null)}
          onSaveScanResult={(scanResult) => {
            if (selectedBookingForBiometricScan && onUpdateBookingStatus) {
              onUpdateBookingStatus(
                selectedBookingForBiometricScan.id,
                selectedBookingForBiometricScan.status,
                selectedBookingForBiometricScan.clinicalNotes,
                { biometricScan: scanResult }
              );
              // Update local modal if open
              setSelectedBookingForMedicalSummary(prev => prev && prev.id === selectedBookingForBiometricScan.id ? {
                ...prev,
                biometricScan: scanResult
              } : prev);
            }
          }}
        />
      )}

      {/* User Prompt & Auto-Cascade Guidance Modal */}
      {promptModal.isOpen && promptModal.booking && (
        <CaregiverPromptModal
          isOpen={promptModal.isOpen}
          type={promptModal.type}
          booking={promptModal.booking}
          nurse={nurses.find(n => n.id === promptModal.booking?.nurseId) || null}
          nurses={nurses}
          onClose={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
          onViewArrivalQR={() => {
            if (promptModal.booking) {
              setSelectedBookingForArrivalQR(promptModal.booking);
            }
          }}
          onOpenChat={() => {
            if (promptModal.booking) {
              onOpenChat(promptModal.booking);
            }
          }}
          onRerouteBooking={onRerouteBooking}
          onUpdateBookingStatus={onUpdateBookingStatus}
          onTriggerNotification={onTriggerNotification}
        />
      )}

      {/* Supplies Checklist Modal - Mandatory before booking created (Requirement 5) */}
      <SuppliesChecklistModal
        isOpen={isSuppliesChecklistOpen}
        onClose={() => {
          setIsSuppliesChecklistOpen(false);
          setPendingBookingToConfirm(null);
        }}
        onConfirm={handleCompleteChecklistAndBook}
        onOpenStore={() => onNavigateStore?.()}
        serviceName={pendingBookingToConfirm?.serviceName || selectedService?.name}
      />
    </div>
  );
};
