import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  LogoVariation, 
  Booking, 
  NurseProfile, 
  ServiceItem, 
  ClinicalNotes, 
  PayoutRecord, 
  UserAccount, 
  NursePeerChatMessage, 
  ActivityNotificationItem, 
  ActivityNotificationType,
  VideoMeeting,
  NursingSchool
} from './types';
import { 
  INITIAL_SERVICES, 
  INITIAL_NURSES, 
  INITIAL_BOOKINGS, 
  INITIAL_PAYOUTS, 
  INITIAL_USER_ACCOUNTS, 
  INITIAL_PEER_MESSAGES,
  INITIAL_ACTIVITY_NOTIFICATIONS,
  INITIAL_NURSING_SCHOOLS,
  INITIAL_VIDEO_MEETINGS
} from './data/mockData';
import { getDefaultSkillBadgesForNurse } from './data/skillBadges';
import { INITIAL_PRACTITIONER_MILESTONES, INITIAL_PATIENT_MILESTONES } from './data/milestonesData';
import { MilestoneItem } from './types';
import { Header } from './components/common/Header';
import { ClientPortal } from './components/client/ClientPortal';
import { NursePortal } from './components/nurse/NursePortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { AppLandingCover } from './components/cover/AppLandingCover';
import { LogoSelectorModal } from './components/brand/LogoSelectorModal';
import { LaunchKitModal } from './components/brand/LaunchKitModal';
import { PanicModal } from './components/common/PanicModal';
import { FullScreenEmergencySOSOverlay, EmergencySOSData } from './components/common/FullScreenEmergencySOSOverlay';
import { PersistentEmergencyBanner } from './components/common/PersistentEmergencyBanner';
import { ChatModal } from './components/chat/ChatModal';
import { RatingModal } from './components/client/RatingModal';
import { NurseRegistrationModal } from './components/nurse/NurseRegistrationModal';
import { PatientSignUpModal } from './components/patient/PatientSignUpModal';
import { PatientProfileModal } from './components/patient/PatientProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { BiometricAuthModal } from './components/auth/BiometricAuthModal';
import { ShareAppModal } from './components/common/ShareAppModal';
import { ActivityNotificationModal } from './components/common/ActivityNotificationModal';
import { VisitReminderNotificationManager } from './components/common/VisitReminderNotificationManager';
import { LeftRoleSidebar } from './components/common/LeftRoleSidebar';
import { TestOnPhoneModal } from './components/common/TestOnPhoneModal';
import { VideoConsultationRoomModal } from './components/common/VideoConsultationRoomModal';
import { LegalTermsModal } from './components/common/LegalTermsModal';
import { HelpHowItWorksModal } from './components/common/HelpHowItWorksModal';
import { ContactUsModal } from './components/common/ContactUsModal';
import { AboutUsModal } from './components/common/AboutUsModal';
import { PushNotificationLibraryModal } from './components/common/PushNotificationLibraryModal';
import { AppStoreLaunchPackModal } from './components/brand/AppStoreLaunchPackModal';
import { SplashOnboardingModal } from './components/common/SplashOnboardingModal';
import { MedicalStorePage } from './components/store/MedicalStorePage';
import { AdminSupplyOrdersManager } from './components/admin/AdminSupplyOrdersManager';
import { 
  fetchBookingsFromSupabase, 
  createBookingInSupabase, 
  fetchCurrentProfile, 
  applyRlsPoliciesInSupabase,
  buildUserAccountFromSession,
  supabase 
} from './lib/supabase';
import { Logo } from './components/common/Logo';
import { soundFX } from './utils/soundEffects';
import confetti from 'canvas-confetti';
import { Heart, ShieldCheck, PhoneCall, Sparkles, MapPin, Palette, FileText, Users, KeyRound, Share2, Bell, HelpCircle, Shield, Volume2, BookOpen, Crown, User, Stethoscope, Lock, Building, Mail } from 'lucide-react';
import { isNetworkOnline, processOfflineSyncQueue } from './utils/offlineSyncManager';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [logoVariation, setLogoVariation] = useState<LogoVariation>('heart-cross');
  
  // Navigation View: 'portal' | 'store' | 'admin_orders' (Requirement 3 & 4)
  const [currentView, setCurrentView] = useState<'portal' | 'store' | 'admin_orders'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/store') || hash.includes('/store') || hash.includes('store')) {
        return 'store';
      }
      if (path.includes('/admin/orders') || hash.includes('/admin/orders') || hash.includes('admin_orders')) {
        return 'admin_orders';
      }
    }
    return 'portal';
  });

  // Keep browser URL path/hash and currentView synchronized
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/store') || hash.includes('/store') || hash.includes('store')) {
        setCurrentView('store');
      } else if (path.includes('/admin/orders') || hash.includes('/admin/orders') || hash.includes('admin_orders')) {
        setCurrentView('admin_orders');
      } else {
        setCurrentView('portal');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleNavigateView = (view: 'portal' | 'store' | 'admin_orders') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const targetPath = view === 'store' ? '/store' : view === 'admin_orders' ? '/admin/orders' : '/';
      try {
        window.history.pushState({}, '', targetPath);
      } catch {}
    }
  };

  // State for services, nurses, bookings, and payouts
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('wecare_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [nurses, setNurses] = useState<NurseProfile[]>(() => {
    const saved = localStorage.getItem('wecare_nurses');
    let rawList: NurseProfile[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          rawList = parsed.filter(n => 
            !n.name?.toLowerCase().includes('sharpe') && 
            !n.name?.toLowerCase().includes('althea') && 
            !n.name?.toLowerCase().includes('campbell') && 
            n.id !== 'nurse-101' && 
            n.id !== 'nurse-104'
          );
        }
      } catch {}
    }
    try {
      localStorage.setItem('wecare_nurses', JSON.stringify(rawList));
    } catch {}
    return rawList;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('wecare_bookings');
    let rawList: Booking[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          rawList = parsed.filter(b => 
            !b.nurseName?.toLowerCase().includes('sharpe') && 
            !b.nurseName?.toLowerCase().includes('althea') && 
            !b.nurseName?.toLowerCase().includes('campbell') && 
            b.nurseId !== 'nurse-101' && 
            b.nurseId !== 'nurse-104'
          );
        }
      } catch {}
    }
    try {
      localStorage.setItem('wecare_bookings', JSON.stringify(rawList));
    } catch {}
    return rawList;
  });

  const [payouts, setPayouts] = useState<PayoutRecord[]>(() => {
    const saved = localStorage.getItem('wecare_payouts');
    return saved ? JSON.parse(saved) : INITIAL_PAYOUTS;
  });

  // State for user accounts & auth - Cleaned for launch: only Master Admin Sydney Mattis
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const masterAdmin: UserAccount = {
      id: 'user-admin-01',
      name: 'Sydney Mattis',
      username: 'sydney',
      email: 'wecareja.bookings@gmail.com',
      phone: '(876) 582-7613',
      role: 'admin',
      title: 'Lead Operations Director & Master Administrator',
      department: 'Executive Clinical Leadership & Registry Audit',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813629-455b5502c3ef?auto=format&fit=crop&q=80&w=400',
      zone: 'St. Catherine & Kingston',
      address: '4 Claudete Drive, St. Catherine, Jamaica',
      password: '12345678',
      approvalStatus: 'approved',
      createdAt: '2026-01-01T08:00:00.000Z',
      lastLoginAt: '2026-09-30T03:30:00.000Z'
    };

    // Ready for launch: no users must be on app except master admin
    const finalAccounts = [masterAdmin];
    try {
      localStorage.setItem('wecare_user_accounts', JSON.stringify(finalAccounts));
    } catch {}
    return finalAccounts;
  });

  // Notifications state (cleared 305 test notifications for clean launch)
  const [notifications, setNotifications] = useState<ActivityNotificationItem[]>(() => {
    try {
      localStorage.removeItem('wecare_notifications');
      localStorage.removeItem('wecare_activity_stream');
    } catch {}
    return [];
  });

  // Active user session state with persistent local restoration & RLS-safe fallback
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const sessionAuth = sessionStorage.getItem('wecare_session_user_id');
      if (sessionAuth) return sessionAuth;
      const localAuth = localStorage.getItem('wecare_current_user_id');
      if (localAuth) return localAuth;
    } catch {}
    return null;
  });

  // Derived current user account & authentication status
  const currentUser = userAccounts.find(u => u.id === currentUserId) || null;
  const isAuthenticated = Boolean(currentUser);
  const isMasterAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' ||
      currentUser.username === 'sydney' ||
      currentUser.username === 'admin' ||
      currentUser.name.toLowerCase().includes('sydney mattis') ||
      currentUser.email?.toLowerCase() === 'wecareja.bookings@gmail.com'
    )
  );

  // State for nurse peer collaboration messages
  const [peerMessages, setPeerMessages] = useState<NursePeerChatMessage[]>(() => {
    const saved = localStorage.getItem('wecare_peer_messages');
    return saved ? JSON.parse(saved) : INITIAL_PEER_MESSAGES;
  });

  // State for accredited Jamaican nursing schools
  const [nursingSchools, setNursingSchools] = useState<NursingSchool[]>(() => {
    const saved = localStorage.getItem('wecare_nursing_schools');
    return saved ? JSON.parse(saved) : INITIAL_NURSING_SCHOOLS;
  });

  // State for admin scheduled video meetings
  const [videoMeetings, setVideoMeetings] = useState<VideoMeeting[]>(() => {
    const saved = localStorage.getItem('wecare_video_meetings');
    return saved ? JSON.parse(saved) : INITIAL_VIDEO_MEETINGS;
  });

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'profile' | 'signin' | 'register'>('signin');
  const [isLogoStudioOpen, setIsLogoStudioOpen] = useState(false);
  const [isLaunchKitOpen, setIsLaunchKitOpen] = useState(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [isNurseSignUpOpen, setIsNurseSignUpOpen] = useState(false);
  const [isPatientSignUpOpen, setIsPatientSignUpOpen] = useState(false);
  const [isPatientProfileOpen, setIsPatientProfileOpen] = useState(false);
  const [isShareAppOpen, setIsShareAppOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isTestOnPhoneOpen, setIsTestOnPhoneOpen] = useState(false);
  const [isBiometricAuthOpen, setIsBiometricAuthOpen] = useState(false);
  const [biometricTargetUserId, setBiometricTargetUserId] = useState<string | undefined>(undefined);
  const [activeVideoCall, setActiveVideoCall] = useState<{
    isOpen: boolean;
    callerName?: string;
    callerRole?: 'client' | 'nurse' | 'admin';
    participantName: string;
    participantRole: 'client' | 'nurse' | 'admin';
    meetingTitle?: string;
    meetingRoomId?: string;
  } | null>(null);
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);
  const [activeRatingBooking, setActiveRatingBooking] = useState<Booking | null>(null);
  const [emergencyActiveBooking, setEmergencyActiveBooking] = useState<Booking | null>(null);
  const [activeEmergencySOS, setActiveEmergencySOS] = useState<EmergencySOSData | null>(() => {
    const saved = localStorage.getItem('wecare_active_emergency_sos');
    return saved ? JSON.parse(saved) : null;
  });
  const [isFullScreenSOSOpen, setIsFullScreenSOSOpen] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('wecare_active_emergency_sos'));
  });
  const [isLegalTermsOpen, setIsLegalTermsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isPushLibraryOpen, setIsPushLibraryOpen] = useState(false);
  const [isLaunchPackOpen, setIsLaunchPackOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('wecare_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('wecare_nurses', JSON.stringify(nurses));
  }, [nurses]);

  useEffect(() => {
    localStorage.setItem('wecare_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('wecare_payouts', JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    localStorage.setItem('wecare_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem('wecare_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('wecare_current_user_id', currentUserId);
    } else {
      localStorage.removeItem('wecare_current_user_id');
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('wecare_peer_messages', JSON.stringify(peerMessages));
  }, [peerMessages]);

  useEffect(() => {
    localStorage.setItem('wecare_nursing_schools', JSON.stringify(nursingSchools));
  }, [nursingSchools]);

  useEffect(() => {
    localStorage.setItem('wecare_video_meetings', JSON.stringify(videoMeetings));
  }, [videoMeetings]);

  // Connect Auth & Real Data from Supabase with resilient RLS fallbacks
  useEffect(() => {
    // 1. Run RLS policy setup in background to ensure authenticated users have read/write
    applyRlsPoliciesInSupabase().catch(() => {});

    // 2. Properly check active Supabase Auth session with session.user passed to profile resolver
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        console.warn('supabase.auth.getSession error:', error);
        // Fallback: Preserve active local state, do not logout if RLS or network failed
        return;
      }
      const session = data?.session;
      if (session?.user) {
        try {
          const profile = await fetchCurrentProfile(session.user.id, session.user);
          if (profile && !profile.is_deleted) {
            setUserAccounts(prev => {
              const others = prev.filter(u => u.id !== profile.id);
              return [profile, ...others];
            });
            setCurrentUserId(profile.id);
            setCurrentRole(profile.role);
            try {
              sessionStorage.setItem('wecare_session_user_id', profile.id);
              localStorage.setItem('wecare_current_user_id', profile.id);
            } catch {}
          }
        } catch (profileErr) {
          console.warn('Profile fetch blocked or failed, using session user fallback:', profileErr);
          const fallbackUser = buildUserAccountFromSession(session.user);
          setUserAccounts(prev => [fallbackUser, ...prev.filter(u => u.id !== fallbackUser.id)]);
          setCurrentUserId(fallbackUser.id);
          setCurrentRole(fallbackUser.role);
        }
      }
    }).catch(err => {
      console.warn('Session query rejected, preserving existing auth state:', err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await fetchCurrentProfile(session.user.id, session.user);
          if (profile && !profile.is_deleted) {
            setUserAccounts(prev => {
              const others = prev.filter(u => u.id !== profile.id);
              return [profile, ...others];
            });
            setCurrentUserId(profile.id);
            setCurrentRole(profile.role);
            try {
              sessionStorage.setItem('wecare_session_user_id', profile.id);
              localStorage.setItem('wecare_current_user_id', profile.id);
            } catch {}
          }
        } catch {
          const fallbackUser = buildUserAccountFromSession(session.user);
          setUserAccounts(prev => [fallbackUser, ...prev.filter(u => u.id !== fallbackUser.id)]);
          setCurrentUserId(fallbackUser.id);
          setCurrentRole(fallbackUser.role);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        try {
          sessionStorage.removeItem('wecare_session_user_id');
          localStorage.removeItem('wecare_current_user_id');
        } catch {}
      }
    });

    // 3. Fetch real bookings from Supabase with safe fallback
    fetchBookingsFromSupabase().then(realBookings => {
      if (realBookings && realBookings.length > 0) {
        setBookings(realBookings);
      }
    }).catch(err => {
      console.warn('Bookings load failed (RLS), using local storage bookings:', err);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Activity Notification Handlers with Audio Chimes
  const handleTriggerNotification = useCallback((type: ActivityNotificationType, title: string, description: string, bookingId?: string) => {
    const newNotification: ActivityNotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      read: false,
      targetRole: 'all',
      bookingId
    };

    setNotifications(prev => [newNotification, ...prev]);
    soundFX.triggerNotification(title, description, type);
  }, []);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Open Auth modal with specific tab
  const handleOpenAuthModal = (tab: 'profile' | 'signin' | 'register' = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleOpenBiometricAuth = (targetUserId?: string) => {
    setBiometricTargetUserId(targetUserId);
    setIsBiometricAuthOpen(true);
  };

  const handleBiometricSuccess = (user: UserAccount) => {
    setCurrentUserId(user.id);
    localStorage.setItem('wecare_current_user_id', user.id);
    setCurrentRole(user.role);
    setIsBiometricAuthOpen(false);
    setIsAuthModalOpen(false);
    handleTriggerNotification(
      'system_alert',
      'Biometric Sign-In Verified',
      `Authenticated securely via hardware biometric passkey as ${user.name}.`
    );
  };

  // Sign out user
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setCurrentUserId(null);
    try {
      sessionStorage.removeItem('wecare_session_user_id');
      localStorage.removeItem('wecare_current_user_id');
      if (typeof window !== 'undefined' && window.history?.pushState) {
        window.history.pushState({}, '', '/');
      }
    } catch {}
    handleTriggerNotification(
      'system_alert',
      'Signed Out',
      'You are now signed out. Please sign in to access your portal.'
    );
  };

  // Handle role switch from UI - Master Admin Sydney Mattis has an All-Access Pass to ANY dashboard
  const handleRoleChange = (newRole: UserRole) => {
    if (!isAuthenticated || !currentUser) {
      setCurrentRole(newRole);
      handleOpenAuthModal('signin');
      return;
    }

    // Master Admin All-Access Pass: Unrestricted switching between Client, Nurse & Admin
    if (isMasterAdmin) {
      setCurrentRole(newRole);
      soundFX.playToggleClick();
      handleTriggerNotification(
        'system_alert',
        `Switched to ${newRole.toUpperCase()} Dashboard`,
        `All-Access Pass Active: You are now viewing the ${newRole.toUpperCase()} dashboard as Master Admin Sydney Mattis.`
      );
      return;
    }

    if (currentUser.role !== newRole) {
      handleTriggerNotification(
        'system_alert',
        'Sign Out Required',
        `You are currently signed in as ${currentUser.name} (${currentUser.role.toUpperCase()}). Please sign out first before switching users or roles, or sign in as Master Admin Sydney Mattis.`
      );
      return;
    }
    setCurrentRole(newRole);
  };

  // User Auth Handlers
  const handleSelectUser = (user: UserAccount) => {
    setCurrentUserId(user.id);
    try {
      sessionStorage.setItem('wecare_session_user_id', user.id);
      localStorage.setItem('wecare_current_user_id', user.id);
      if (typeof window !== 'undefined' && window.history?.pushState) {
        window.history.pushState({}, '', '/dashboard');
      }
    } catch {}
    setCurrentRole(user.role);
    setCurrentView('portal');
    setIsAuthModalOpen(false);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUserAccounts(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleCreateAccount = (newAccount: UserAccount) => {
    setUserAccounts(prev => [newAccount, ...prev]);
    setCurrentUserId(newAccount.id);
    localStorage.setItem('wecare_current_user_id', newAccount.id);
    setCurrentRole(newAccount.role);
    setIsAuthModalOpen(false);
  };

  const handleSendPeerMessage = (msgData: Omit<NursePeerChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: NursePeerChatMessage = {
      ...msgData,
      id: `peer-msg-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setPeerMessages(prev => [...prev, newMsg]);
  };

  // Booking Handlers
  const handleCreateBooking = async (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);

    // Save to real Supabase bookings table (Requirement 5)
    try {
      await createBookingInSupabase(newBooking);
    } catch (err) {
      console.warn('Could not write booking to Supabase:', err);
    }

    // Dispatch Client Confirmation Email & Notification
    handleTriggerNotification(
      'booking_confirmed',
      '📧 Booking Confirmation Email Dispatched',
      `Confirmation email sent to ${newBooking.clientName}. Service: ${newBooking.serviceName} with ${newBooking.nurseName} on ${(newBooking.scheduledDateTime || '').split('T')[0]}. Escrow verified via NCB Business Savings. • Dispatched by We Care Jamaica, 4 Claudete Drive, St. Catherine, Jamaica • (876) 582-7613`,
      newBooking.id
    );

    // Dispatch Nurse New Request Notification
    handleTriggerNotification(
      'booking_request',
      '📋 New Patient Visit Request Received',
      `Nurse ${newBooking.nurseName} has received booking #${newBooking.id} for ${newBooking.serviceName} in ${newBooking.zone}. Awaiting nurse acceptance.`,
      newBooking.id
    );
  };

  const handleCancelBooking = (bookingId: string, reason: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'cancelled' as const,
          cancelReason: reason,
          cancelledAt: new Date().toISOString(),
          paymentStatus: 'refunded' as const
        };
      }
      return b;
    }));
  };

  const handleUpdateBookingStatus = (
    bookingId: string, 
    status: Booking['status'], 
    clinicalNotes?: ClinicalNotes,
    additionalData?: Partial<Booking>
  ) => {
    let newlyAcceptedBooking: Booking | null = null;
    let newlyCompletedBooking: Booking | null = null;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updated: Booking = {
          ...b,
          status,
          ...(clinicalNotes ? { clinicalNotes } : {}),
          ...(additionalData ? additionalData : {})
        };

        // Check transitions cleanly
        if ((status === 'accepted' || additionalData?.nurseAccepted) && (!b.nurseAccepted || b.status === 'requested')) {
          newlyAcceptedBooking = updated;
        }

        if (status === 'completed' && b.status !== 'completed') {
          newlyCompletedBooking = updated;
        }

        return updated;
      }
      return b;
    }));

    // Perform side-effects cleanly outside of setBookings updater
    if (newlyAcceptedBooking) {
      const accepted: Booking = newlyAcceptedBooking;
      soundFX.playBookingConfirmed();
      handleTriggerNotification(
        'booking_confirmed',
        '🎉 Caregiver Accepted Visit Request!',
        `${accepted.nurseName || 'Your caregiver'} has accepted visit #${(accepted.id || '').slice(0, 8)}. Doorstep arrival pass & security PIN are now unlocked!`,
        accepted.id
      );
      // Dispatch asynchronously to avoid mutating ClientPortal state while App is updating
      setTimeout(() => {
        try {
          window.dispatchEvent(new CustomEvent('wecare_booking_accepted_fullscreen', { detail: { booking: accepted } }));
        } catch (e) {
          console.error('Failed to dispatch fullscreen event:', e);
        }
      }, 0);
    }

    if (newlyCompletedBooking) {
      const completed: Booking = newlyCompletedBooking;
      soundFX.playVisitCompleted();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#1E1B4B', '#F59E0B', '#10B981', '#FFD166', '#4CC9F0', '#9D4EDD']
      });

      handleTriggerNotification(
        'visit_completed',
        '🎉 Home Care Visit Completed & Recorded!',
        `Visit #${completed.id} (${completed.serviceName}) with ${completed.nurseName || 'Nurse'} has completed. Summary notes and transparent invoice are ready.`,
        completed.id
      );

      const nursePayout = completed.nurseEarningsJMD;
      setNurses(nList => nList.map(nurse => {
        if (nurse.id === completed.nurseId || nurse.name === completed.nurseName) {
          const newCount = (nurse.completedVisitsCount || 0) + 1;
          
          // Check if nurse unlocked a milestone tier (e.g. 1st, 5th, 10th "Care Angel", 25th, 50th)
          const achievedMilestone = INITIAL_PRACTITIONER_MILESTONES.find(
            m => m.category === 'practitioner_visits' && m.targetCount === newCount
          );

          if (achievedMilestone) {
            handleTriggerNotification(
              'milestone_unlocked',
              '🎖️ Nurse Milestone Badge Achieved!',
              `Incredible achievement! ${nurse.name} reached ${newCount} visits and earned the '${achievedMilestone.title}' Milestone Badge (${achievedMilestone.rewardLabel})!`,
              completed.id
            );
          }

          return {
            ...nurse,
            completedVisitsCount: newCount,
            pendingPayoutJMD: nurse.pendingPayoutJMD + nursePayout,
            totalEarningsJMD: nurse.totalEarningsJMD + nursePayout
          };
        }
        return nurse;
      }));

      // Evaluate patient / client therapy milestone
      try {
        const stored = localStorage.getItem('wecare_patient_milestones');
        const patientMilestones: MilestoneItem[] = stored ? JSON.parse(stored) : INITIAL_PATIENT_MILESTONES;
        let patientChanged = false;
        patientMilestones.forEach(pm => {
          if (pm.category === 'therapy_sessions') {
            const newSessionCount = (pm.currentCount || 0) + 1;
            pm.currentCount = newSessionCount;
            if (newSessionCount >= pm.targetCount && !pm.isCompleted) {
              pm.isCompleted = true;
              pm.completedAt = new Date().toISOString();
              patientChanged = true;
              handleTriggerNotification(
                'milestone_unlocked',
                '🏆 Patient Milestone Badge Unlocked!',
                `Congratulations! Completing your care visit with ${completed.nurseName || 'your caregiver'} unlocked the '${pm.title}' milestone badge (${pm.rewardLabel})!`,
                completed.id
              );
            }
          }
        });
        if (patientChanged) {
          localStorage.setItem('wecare_patient_milestones', JSON.stringify(patientMilestones));
        }
      } catch (err) {
        console.error('Failed to update patient milestones:', err);
      }
    }
  };

  // Auto-Reroute / Cascade Booking to next available nurse or caregiver
  const handleRerouteBooking = useCallback((
    bookingId: string, 
    reason: string = 'Caregiver acceptance window expired (45s)',
    preferredNurseId?: string
  ) => {
    let reroutedInfo: { targetBooking: Booking; nextNurse: NurseProfile } | null = null;

    setBookings(prevBookings => {
      const targetBooking = prevBookings.find(b => b.id === bookingId);
      if (!targetBooking) return prevBookings;

      const currentNurseId = targetBooking.nurseId;
      const previousNurseIds = targetBooking.previousNurseIds || (currentNurseId ? [currentNurseId] : []);
      const declinedNurseIds = Array.from(new Set([...(targetBooking.declinedNurseIds || []), currentNurseId].filter(Boolean) as string[]));

      // Eligible candidate approved nurses
      const candidates = nurses.filter(n => 
        n.status === 'approved' && 
        n.id !== currentNurseId &&
        !declinedNurseIds.includes(n.id)
      );

      let nextNurse: NurseProfile | undefined;

      if (preferredNurseId) {
        nextNurse = nurses.find(n => n.id === preferredNurseId);
      }

      // Prioritize zone and care scope
      if (!nextNurse) {
        nextNurse = candidates.find(n => 
          n.zones.some(z => z.toLowerCase().includes(targetBooking.zone.toLowerCase()) || targetBooking.zone.toLowerCase().includes(z.toLowerCase())) &&
          (targetBooking.serviceName.toLowerCase().includes('clinical') || targetBooking.serviceName.toLowerCase().includes('wound') 
            ? n.careLevel === 'registered_nurse' 
            : true)
        );
      }

      // If no exact zone match, try any candidate with matching care scope
      if (!nextNurse) {
        nextNurse = candidates.find(n => 
          targetBooking.serviceName.toLowerCase().includes('clinical') || targetBooking.serviceName.toLowerCase().includes('wound')
            ? n.careLevel === 'registered_nurse'
            : true
        );
      }

      // If still none, any candidate in pool
      if (!nextNurse && candidates.length > 0) {
        nextNurse = candidates[0];
      }

      // If candidates ran out because all were declined, cycle back to any approved nurse except current
      if (!nextNurse) {
        const fallback = nurses.filter(n => n.status === 'approved' && n.id !== currentNurseId);
        nextNurse = fallback[0] || nurses[0];
      }

      if (!nextNurse) return prevBookings;

      const updatedBooking: Booking = {
        ...targetBooking,
        nurseId: nextNurse.id,
        nurseName: nextNurse.name,
        nursePhoto: nextNurse.photoUrl,
        nursePhone: nextNurse.phone,
        status: 'requested',
        nurseAccepted: false,
        clientActivated: false,
        requestSentAt: new Date().toISOString(),
        acceptanceTimeoutSeconds: targetBooking.acceptanceTimeoutSeconds || 90,
        rerouteCount: (targetBooking.rerouteCount || 0) + 1,
        previousNurseIds: [...previousNurseIds, currentNurseId].filter(Boolean) as string[],
        declinedNurseIds,
        lastReroutedAt: new Date().toISOString(),
        lastRerouteReason: reason
      };

      reroutedInfo = { targetBooking: updatedBooking, nextNurse };

      return prevBookings.map(b => b.id === bookingId ? updatedBooking : b);
    });

    // Execute side-effects cleanly outside setBookings reducer
    if (reroutedInfo) {
      const { targetBooking, nextNurse } = reroutedInfo as { targetBooking: Booking; nextNurse: NurseProfile };
      soundFX.playRerouteNotification();

      handleTriggerNotification(
        'nurse_assigned',
        '🔄 Caregiver Auto-Reassigned',
        `Visit #${(targetBooking?.id || '').slice(0, 8)} (${targetBooking?.serviceName || 'Care'}) auto-transferred to ${nextNurse.name} (${targetBooking?.zone || 'Kingston'}). New 45s acceptance window active.`,
        targetBooking.id
      );
    }
  }, [nurses, handleTriggerNotification]);

  // Synchronization strategy for local offline storage (clinical notes & doorstep check-ins)
  const handleSyncPendingOfflineActions = useCallback(() => {
    if (!isNetworkOnline()) return;

    const count = processOfflineSyncQueue((action) => {
      setBookings(prev => prev.map(b => {
        if (b.id === action.bookingId) {
          if (action.actionType === 'save_clinical_notes') {
            return {
              ...b,
              clinicalNotes: action.data.clinicalNotes || b.clinicalNotes,
              visitUpdates: action.data.visitUpdates || b.visitUpdates,
              offlinePendingNotes: false,
              lastOfflineSyncAt: new Date().toISOString()
            };
          } else if (action.actionType === 'doorstep_arrival') {
            return {
              ...b,
              status: 'in_progress',
              ...(action.data.arrivalData || {}),
              offlinePendingArrival: false,
              lastOfflineSyncAt: new Date().toISOString()
            };
          } else if (action.actionType === 'doorstep_checkout') {
            return {
              ...b,
              status: 'completed',
              ...(action.data.checkoutData || {}),
              offlinePendingCheckout: false,
              lastOfflineSyncAt: new Date().toISOString()
            };
          } else if (action.actionType === 'visit_started') {
            return {
              ...b,
              status: 'in_progress',
              visitStartedAt: action.data.startedAt || b.visitStartedAt,
              lastOfflineSyncAt: new Date().toISOString()
            };
          }
        }
        return b;
      }));
    });

    if (count > 0) {
      handleTriggerNotification(
        'system_alert',
        '🔄 Local Offline Records Synchronized',
        `Pushed ${count} locally stored clinical update${count > 1 ? 's' : ''} and visit check-in record${count > 1 ? 's' : ''} to active state.`,
        undefined
      );
    }
  }, [handleTriggerNotification]);

  // Network online listener & auto-sync trigger
  useEffect(() => {
    // Check pending queue when component mounts
    handleSyncPendingOfflineActions();

    const handleOnlineEvent = () => {
      handleSyncPendingOfflineActions();
    };

    const handleCustomNetworkEvent = () => {
      handleSyncPendingOfflineActions();
    };

    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('wecare_network_status_changed', handleCustomNetworkEvent);

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('wecare_network_status_changed', handleCustomNetworkEvent);
    };
  }, [handleSyncPendingOfflineActions]);

  const handleSubmitRating = (bookingId: string, rating: number, comment: string) => {
    soundFX.playVisitCompleted();
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#F59E0B', '#10B981', '#FFD166', '#4CC9F0']
    });

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          rating,
          reviewComment: comment
        };
      }
      return b;
    }));
  };

  // Nurse Handlers
  const handleUpdateNurseProfile = (updatedNurse: NurseProfile) => {
    setNurses(prev => prev.map(n => n.id === updatedNurse.id ? updatedNurse : n));
  };

  const handleApproveNurse = (nurseId: string) => {
    let approvedNurseSchool: string | undefined;
    setNurses(prev => prev.map(n => {
      if (n.id === nurseId) {
        approvedNurseSchool = n.institutionAttended;
        return {
          ...n,
          status: 'approved' as const,
          licenseVerified: true
        };
      }
      return n;
    }));

    // Approve corresponding UserAccount
    setUserAccounts(prev => prev.map(acc => {
      if (acc.nurseProfileId === nurseId || acc.id === `usr-nurse-${nurseId}` || acc.id === nurseId) {
        return {
          ...acc,
          approvalStatus: 'approved' as const
        };
      }
      return acc;
    }));

    // Learning Registry: If nurse has school attended from "Other" box,
    // approve existing or dynamically create and add it to nursingSchools list permanently!
    if (approvedNurseSchool && approvedNurseSchool.trim()) {
      const schoolNameTrimmed = approvedNurseSchool.trim();
      setNursingSchools(prev => {
        const existingIndex = prev.findIndex(
          s => s.name.toLowerCase() === schoolNameTrimmed.toLowerCase()
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: 'approved',
            accreditedBy: 'Nursing Council of Jamaica (NCJ)'
          };
          return updated;
        } else {
          const newLearnedSchool: NursingSchool = {
            id: `sch-learned-${Date.now()}`,
            name: schoolNameTrimmed,
            parish: 'Kingston & St. Andrew',
            status: 'approved',
            accreditedBy: 'Nursing Council of Jamaica (NCJ)',
            programTypes: ['BSc in Nursing (Pre-RN)', 'Post-Basic Clinical Specialization'],
            submittedByNurseName: nurseId
          };
          return [newLearnedSchool, ...prev];
        }
      });

      handleTriggerNotification(
        'nurse_signup',
        `🎓 Institution Learned & Approved: ${schoolNameTrimmed}`,
        `Administrator approved nurse from "${schoolNameTrimmed}". The system has learned and permanently added this school to the accredited dropdown list.`
      );
    } else {
      handleTriggerNotification(
        'nurse_signup',
        'Practitioner Credentials Approved',
        `Administrator Sydney Mattis has approved license credentials for practitioner #${nurseId}. Account is now fully active.`
      );
    }
  };

  const handleRejectNurse = (nurseId: string) => {
    setNurses(prev => prev.map(n => {
      if (n.id === nurseId) {
        return {
          ...n,
          status: 'rejected' as const
        };
      }
      return n;
    }));

    setUserAccounts(prev => prev.map(acc => {
      if (acc.nurseProfileId === nurseId || acc.id === `usr-nurse-${nurseId}` || acc.id === nurseId) {
        return {
          ...acc,
          approvalStatus: 'rejected' as const
        };
      }
      return acc;
    }));
  };

  // Dispute & Payout Handlers
  const handleResolveDispute = (bookingId: string, resolution: 'refund_client' | 'pay_nurse') => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: resolution === 'refund_client' ? 'cancelled' : 'completed',
          paymentStatus: resolution === 'refund_client' ? 'refunded' : 'paid_to_nurse'
        };
      }
      return b;
    }));
  };

  const handleTriggerPayoutBatch = () => {
    // Generate new payout records for nurses with pending payouts
    const newPayoutRecords: PayoutRecord[] = [];
    const nowIso = new Date().toISOString();
    const batchId = `PAY-JAM-${Math.floor(1000 + Math.random() * 9000)}`;

    nurses.forEach(n => {
      if (n.pendingPayoutJMD > 0) {
        const gross = n.pendingPayoutJMD / 0.85;
        const fee = gross * 0.15;
        newPayoutRecords.push({
          id: `${batchId}-${String(n?.id || '').replace('nurse-', '')}`,
          payoutReference: `ACH-${(n?.bankDetails?.bankName || 'NCB').split(' ')[0] || 'NCB'}-${Math.floor(1000000 + Math.random() * 9000000)}`,
          nurseId: n.id,
          nurseName: n.name,
          amountJMD: n.pendingPayoutJMD,
          grossAmountJMD: gross,
          platformFeeJMD: fee,
          periodStart: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
          periodEnd: new Date().toISOString().split('T')[0],
          payoutDate: nowIso,
          status: 'completed',
          payoutMethod: `${n.bankDetails?.bankName || 'National Commercial Bank'} Direct Deposit`,
          destinationAccount: n.bankDetails?.accountNumber || '•••• •••• 4821',
          bookingIds: bookings.filter(b => (b.nurseId === n.id || b.nurseName === n.name) && b.status === 'completed').map(b => b.id),
          visitCount: bookings.filter(b => (b.nurseId === n.id || b.nurseName === n.name) && b.status === 'completed').length || 1,
          notes: 'Automated Friday batch settlement for verified Jamaican home care visits.'
        });
      }
    });

    if (newPayoutRecords.length > 0) {
      setPayouts(prev => [...newPayoutRecords, ...prev]);
    }

    // Refresh nurse pending payouts to settled
    setNurses(prev => prev.map(n => ({
      ...n,
      totalEarningsJMD: n.totalEarningsJMD + n.pendingPayoutJMD,
      pendingPayoutJMD: 0
    })));
  };

  // Nursing School Handlers
  const handleApproveSchool = (schoolId: string) => {
    setNursingSchools(prev => prev.map(s => s.id === schoolId ? { ...s, status: 'approved' as const } : s));
    soundFX.playSuccessChime();
    handleTriggerNotification(
      'system_alert',
      'Nursing School Approved',
      'Accredited Jamaican institution approved and added to live selection database.'
    );
  };

  const handleRejectSchool = (schoolId: string) => {
    setNursingSchools(prev => prev.filter(s => s.id !== schoolId));
  };

  const handleAddSchool = (newSchool: NursingSchool) => {
    setNursingSchools(prev => [newSchool, ...prev]);
    soundFX.playSuccessChime();
    handleTriggerNotification(
      'system_alert',
      'Accredited Institution Added',
      `${newSchool.name} added to the Nursing Council of Jamaica recognized registry.`
    );
  };

  // Video Meeting Handlers
  const handleScheduleMeeting = (newMeeting: VideoMeeting) => {
    setVideoMeetings(prev => [newMeeting, ...prev]);
    soundFX.playSuccessChime();
    handleTriggerNotification(
      'system_alert',
      `Video Call Scheduled: ${newMeeting.title}`,
      `Meeting with ${newMeeting.participantName} booked for ${newMeeting.date} at ${newMeeting.time}.`
    );
  };

  const handleStartVideoMeeting = (meeting: VideoMeeting) => {
    setActiveVideoCall({
      isOpen: true,
      callerName: currentUser ? currentUser.name : 'Sydney Mattis (Admin)',
      callerRole: currentRole,
      participantName: meeting.participantName,
      participantRole: meeting.participantRole,
      meetingTitle: meeting.title,
      meetingRoomId: meeting.roomUrl.split('/').pop() || 'consult-room'
    });
  };

  const handleOpenDirectVideoCall = (participantName: string, participantRole: 'client' | 'nurse' | 'admin', meetingTitle?: string) => {
    setActiveVideoCall({
      isOpen: true,
      callerName: currentUser ? currentUser.name : (currentRole === 'admin' ? 'Sydney Mattis (Admin)' : 'We Care User'),
      callerRole: currentRole,
      participantName,
      participantRole,
      meetingTitle: meetingTitle || `Encrypted Video Consultation with ${participantName}`,
      meetingRoomId: `room-${Date.now()}`
    });
  };

  // Full-Screen SOS Emergency Takeover Trigger
  const handleTriggerFullScreenSOS = useCallback((bookingContext?: Booking | null, triggeredByRole?: 'client' | 'nurse' | 'admin') => {
    const targetBooking = bookingContext || emergencyActiveBooking || bookings.find(b => ['accepted', 'en_route', 'in_progress'].includes(b.status)) || bookings[0];
    const role = triggeredByRole || currentRole;
    const triggererName = currentUser?.name || (role === 'nurse' ? (targetBooking?.nurseName || 'Nurse on Duty') : role === 'admin' ? 'Sydney Mattis (Admin)' : (targetBooking?.clientName || 'Patient / Family'));

    const emergencyData: EmergencySOSData = {
      id: `sos-${Date.now()}`,
      triggeredBy: role === 'nurse' ? 'nurse' : role === 'admin' ? 'admin' : 'client',
      triggererName,
      clientName: targetBooking?.clientName || 'Mrs. Marjorie Simpson',
      clientPhone: targetBooking?.clientPhone || '+1 (876) 555-0182',
      clientAddress: targetBooking?.clientAddress || '14 Hope Road, Kingston 6',
      zone: targetBooking?.zone || 'Liguanea',
      serviceName: targetBooking?.serviceName || 'Geriatric Vital Signs & Fall Monitoring',
      nurseName: targetBooking?.nurseName || 'Nurse Keisha Brown, RN',
      nursePhone: targetBooking?.nursePhone || '+1 (876) 555-0199',
      nursePhoto: targetBooking?.nursePhoto,
      timestamp: new Date().toISOString(),
      bookingId: targetBooking?.id || 'BK-101',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Sulfa Drugs'],
      emergencyContact: {
        name: targetBooking?.clientEmergencyContact?.name || 'Dr. Mark Simpson (Son)',
        phone: targetBooking?.clientEmergencyContact?.phone || '+1 (876) 927-2481',
        relation: targetBooking?.clientEmergencyContact?.relation || 'Son & Healthcare Proxy'
      },
      gpsCoordinates: {
        lat: 18.0179,
        lng: -76.8099
      },
      status: 'active'
    };

    setActiveEmergencySOS(emergencyData);
    setIsFullScreenSOSOpen(true);
    localStorage.setItem('wecare_active_emergency_sos', JSON.stringify(emergencyData));
    soundFX.playQuickSOSTone();

    handleTriggerNotification(
      'sos_emergency',
      '🚨 119 EMERGENCY TAKEOVER TRIGGERED',
      `FULL SCREEN EMERGENCY: ${triggererName} (${role.toUpperCase()}) triggered emergency SOS. High-priority screen takeover active across all client and caregiver screens.`,
      targetBooking?.id
    );
  }, [emergencyActiveBooking, bookings, currentRole, currentUser, handleTriggerNotification]);

  const handleResolveEmergency = (notes: string) => {
    setActiveEmergencySOS(null);
    setIsFullScreenSOSOpen(false);
    localStorage.removeItem('wecare_active_emergency_sos');
    soundFX.playVisitCompleted();
    handleTriggerNotification(
      'system_alert',
      '✅ 119 Emergency SOS Resolved & Cleared',
      `Emergency incident cleared. Resolution notes: "${notes}". Screen takeover restored to standard operations.`
    );
  };

  // Open Panic Modal / Full-Screen SOS
  const handleOpenPanic = (booking?: Booking) => {
    const target = booking || bookings.find(b => ['accepted', 'en_route', 'in_progress'].includes(b.status)) || null;
    setEmergencyActiveBooking(target);
    handleTriggerFullScreenSOS(target, currentRole);
  };

  // Global event listener for SOS broadcasts from QuickSOSButton or other tabs
  useEffect(() => {
    const handleSosEvent = (e: any) => {
      const detail = e?.detail;
      handleTriggerFullScreenSOS(detail?.booking, detail?.userRole);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wecare_active_emergency_sos') {
        if (e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            setActiveEmergencySOS(data);
            setIsFullScreenSOSOpen(true);
          } catch {}
        } else {
          setActiveEmergencySOS(null);
          setIsFullScreenSOSOpen(false);
        }
      }
    };

    window.addEventListener('wecare_trigger_sos', handleSosEvent);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('wecare_trigger_sos', handleSosEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleTriggerFullScreenSOS]);

  const currentActiveBooking = bookings.find(b => ['in_progress', 'en_route', 'accepted', 'requested'].includes(b.status)) || null;
  const activeBookingsCount = bookings.filter(b => ['requested', 'accepted', 'en_route', 'in_progress'].includes(b.status)).length;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col relative selection:bg-[#1E1B4B] selection:text-white">
      {/* Frosted Glass Radial Gradient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#1E1B4B]/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-[#F59E0B]/20 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-[#1E1B4B]/15 blur-[150px]" />
      </div>

      {/* Global Header */}
      <Header
        currentRole={currentRole}
        onChangeRole={handleRoleChange}
        logoVariation={logoVariation}
        onOpenLogoStudio={() => setIsLogoStudioOpen(true)}
        onOpenLaunchKit={() => setIsLaunchKitOpen(true)}
        onOpenNurseSignUp={() => setIsNurseSignUpOpen(true)}
        onOpenClientSignUp={() => setIsPatientSignUpOpen(true)}
        onOpenShareApp={() => setIsShareAppOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        unreadNotificationCount={notifications.filter(n => !n.read).length}
        onOpenPanic={() => handleOpenPanic()}
        activeBookingCount={activeBookingsCount}
        activeBooking={currentActiveBooking}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onTriggerNotification={handleTriggerNotification}
        currentUser={currentUser || undefined}
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={(tab) => handleOpenAuthModal(tab || 'signin')}
        onSignOut={handleSignOut}
        onOpenTestOnPhone={() => setIsTestOnPhoneOpen(true)}
        onOpenBiometricAuth={() => handleOpenBiometricAuth()}
        onForceSync={handleSyncPendingOfflineActions}
        isMasterAdmin={isMasterAdmin}
        currentView={currentView}
        onNavigateView={handleNavigateView}
      />

      {/* Persistent Emergency Top Banner (Active across Client, Nurse & Admin screens) */}
      {activeEmergencySOS && !isFullScreenSOSOpen && (
        <PersistentEmergencyBanner
          emergencyData={activeEmergencySOS}
          onMaximize={() => setIsFullScreenSOSOpen(true)}
          onResolve={() => handleResolveEmergency('Emergency resolved by administrator')}
        />
      )}

      {/* Left Role Switcher Sidebar (Client / Nurse / Admin) */}
      {isAuthenticated && currentView === 'portal' && (
        <LeftRoleSidebar
          currentRole={currentRole}
          onChangeRole={handleRoleChange}
          isMasterAdmin={isMasterAdmin}
          userName={currentUser?.name || 'Sydney Mattis'}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">

        {/* VIEW 1: PUBLIC MEDICAL SUPPLIES STORE (/store) - Requirement 3 */}
        {currentView === 'store' ? (
          <MedicalStorePage
            currentUser={currentUser}
            onBackToPortal={() => handleNavigateView('portal')}
            onOpenSignIn={() => handleOpenAuthModal('signin')}
          />
        ) : currentView === 'admin_orders' ? (
          /* VIEW 2: ADMIN SUPPLY ORDERS (/admin/orders) - ONLY MASTER_ADMIN + ADMIN (Requirement 4) */
          (!isAuthenticated || !currentUser || (!isMasterAdmin && currentRole !== 'admin')) ? (
            <div className="p-8 sm:p-12 text-center space-y-4 rounded-3xl bg-white/[0.03] border border-white/10 max-w-lg mx-auto mt-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Administrator Restricted Access</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Medical Supply Orders Management (<code className="font-mono text-amber-300">/admin/orders</code>) is strictly reserved for Master Administrator Sydney Mattis and authorized administrative staff.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigateView('portal')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Return to Home
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuthModal('signin')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>Sign In as Admin</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => handleNavigateView('portal')}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>← Back to Admin Portal</span>
                </button>
                <span className="text-xs text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Direct Route: /admin/orders
                </span>
              </div>
              <AdminSupplyOrdersManager isMasterAdmin={isMasterAdmin} />
            </div>
          )
        ) : !isAuthenticated || !currentUser ? (
          <AppLandingCover
            services={services}
            nurses={nurses}
            logoVariation={logoVariation}
            onOpenSignIn={() => handleOpenAuthModal('signin')}
            onOpenRegisterClient={() => setIsPatientSignUpOpen(true)}
            onOpenRegisterNurse={() => setIsNurseSignUpOpen(true)}
            onOpenLaunchKit={() => setIsLaunchKitOpen(true)}
            onOpenPanic={() => handleOpenPanic()}
            onOpenBiometricAuth={() => handleOpenBiometricAuth()}
            onOpenStore={() => handleNavigateView('store')}
          />
        ) : (
          <>
            {currentRole === 'client' && (
              <ClientPortal
                services={services}
                nurses={nurses}
                bookings={bookings}
                onCreateBooking={handleCreateBooking}
                onCancelBooking={handleCancelBooking}
                onOpenChat={(b) => setActiveChatBooking(b)}
                onOpenRating={(b) => setActiveRatingBooking(b)}
                onOpenPanic={handleOpenPanic}
                onOpenLaunchKit={() => setIsLaunchKitOpen(true)}
                onOpenNurseSignUp={() => setIsNurseSignUpOpen(true)}
                onOpenShareApp={() => setIsShareAppOpen(true)}
                onNavigateStore={() => handleNavigateView('store')}
                logoVariation={logoVariation}
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
                notifications={notifications}
                onMarkNotificationRead={handleMarkNotificationRead}
                onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
                onClearNotifications={handleClearNotifications}
                onTriggerNotification={handleTriggerNotification}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onRerouteBooking={handleRerouteBooking}
                onOpenVideoCall={handleOpenDirectVideoCall}
                onUpdateNurseProfile={handleUpdateNurseProfile}
              />
            )}

            {currentRole === 'nurse' && (
              <NursePortal
                nurses={nurses}
                bookings={bookings}
                currentNurseId={currentUser.nurseProfileId || nurses[0]?.id || 'nurse-101'}
                payouts={payouts}
                peerMessages={peerMessages}
                onSendPeerMessage={handleSendPeerMessage}
                onUpdateNurseProfile={handleUpdateNurseProfile}
                onAddNewNurse={(newNurse) => setNurses(prev => [newNurse, ...prev])}
                onOpenNurseSignUp={() => setIsNurseSignUpOpen(true)}
                onNavigateStore={() => handleNavigateView('store')}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onRerouteBooking={handleRerouteBooking}
                onOpenChat={(b) => setActiveChatBooking(b)}
                onOpenPanic={handleOpenPanic}
                onOpenLaunchKit={() => setIsLaunchKitOpen(true)}
                logoVariation={logoVariation}
                onOpenVideoCall={handleOpenDirectVideoCall}
                onTriggerNotification={handleTriggerNotification}
              />
            )}

            {currentRole === 'admin' && (
              <AdminPortal
                nurses={nurses}
                bookings={bookings}
                onApproveNurse={handleApproveNurse}
                onRejectNurse={handleRejectNurse}
                onResolveDispute={handleResolveDispute}
                onTriggerPayoutBatch={handleTriggerPayoutBatch}
                onOpenPanic={handleOpenPanic}
                onOpenLaunchKit={() => setIsLaunchKitOpen(true)}
                onOpenNurseSignUp={() => setIsNurseSignUpOpen(true)}
                logoVariation={logoVariation}
                userAccounts={userAccounts}
                nursingSchools={nursingSchools}
                onApproveSchool={handleApproveSchool}
                onRejectSchool={handleRejectSchool}
                onAddSchool={handleAddSchool}
                videoMeetings={videoMeetings}
                onScheduleMeeting={handleScheduleMeeting}
                onStartVideoMeeting={handleStartVideoMeeting}
                onOpenTestOnPhone={() => setIsTestOnPhoneOpen(true)}
                onUpdateNurseProfile={handleUpdateNurseProfile}
                isMasterAdmin={isMasterAdmin}
                currentUser={currentUser}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/[0.03] backdrop-blur-xl border-t border-white/10 mt-12 py-8 text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variation={logoVariation} size="sm" />
            <span className="text-slate-300">• Trusted in-home nursing care for St. Catherine, Kingston, St. Andrew, Portmore, and Spanish Town, Jamaica</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            {/* Direct Mandatory Compliance Links (Task 7) */}
            <button 
              onClick={() => setIsLegalTermsOpen(true)} 
              className="text-purple-300 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" /> Privacy Policy
            </button>
            <button 
              onClick={() => setIsLegalTermsOpen(true)} 
              className="text-purple-300 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" /> Terms
            </button>
            <a 
              href="mailto:support@wecareja.care" 
              className="text-cyan-300 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> Contact: support@wecareja.care
            </a>

            <button onClick={() => setIsContactUsOpen(true)} className="text-cyan-300 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Contact Us (Map &amp; Desk)
            </button>
            <button onClick={() => setIsAboutUsOpen(true)} className="text-purple-200 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer">
              <Building className="w-3.5 h-3.5 text-purple-300" /> About Us
            </button>
            <button onClick={() => setIsHowItWorksOpen(true)} className="text-purple-200 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> How It Works
            </button>
            <button onClick={() => setIsLaunchPackOpen(true)} className="text-purple-300 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" /> App Store Listing
            </button>
            <button onClick={() => setIsPushLibraryOpen(true)} className="text-purple-300 hover:text-white transition flex items-center gap-1 cursor-pointer">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Push Sounds &amp; Chimes
            </button>
            <button onClick={() => setIsOnboardingOpen(true)} className="text-purple-300 hover:text-white transition flex items-center gap-1 cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Splash Onboarding
            </button>
            <button onClick={() => setIsShareAppOpen(true)} className="text-emerald-400 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer">
              <Share2 className="w-3.5 h-3.5" /> Share We Care (+$500)
            </button>
            <button onClick={() => setIsNotificationsModalOpen(true)} className="text-purple-300 hover:text-white transition flex items-center gap-1 cursor-pointer">
              <Bell className="w-3.5 h-3.5" /> Activity Stream
            </button>
            {!isAuthenticated && (
              <>
                <button onClick={() => setIsPatientSignUpOpen(true)} className="text-purple-200 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer">
                  <Heart className="w-3.5 h-3.5 text-[#F59E0B]" /> Patient Sign Up
                </button>
                <button onClick={() => setIsNurseSignUpOpen(true)} className="text-purple-300 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Nurse Sign Up
                </button>
              </>
            )}
            <button onClick={() => setIsLogoStudioOpen(true)} className="text-purple-300 hover:text-white transition flex items-center gap-1 cursor-pointer">
              <Palette className="w-3.5 h-3.5" /> Logo Styles (3)
            </button>
            <button onClick={() => setIsLaunchKitOpen(true)} className="text-purple-300 hover:text-white transition flex items-center gap-1 cursor-pointer">
              <FileText className="w-3.5 h-3.5" /> 1-Page PDF Launch Kit
            </button>
            <button onClick={() => handleOpenPanic()} className="text-[#F59E0B] hover:text-red-400 flex items-center gap-1 cursor-pointer font-bold">
              <PhoneCall className="w-3.5 h-3.5" /> 119 Jamaica Emergency
            </button>
          </div>
        </div>

        {/* Official Business Address & Contact Bar (Task 7) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-slate-300">
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 font-mono text-xs space-y-0.5 shadow-sm">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider font-sans">
              Official Business Address &amp; Support
            </div>
            <div className="font-black text-white text-sm">We Care Jamaica</div>
            <div className="text-slate-200">4 Claudete Drive</div>
            <div className="text-slate-200">St. Catherine, Jamaica</div>
            <div className="text-cyan-300 font-bold pt-1 flex items-center gap-1.5 font-sans">
              <Mail className="w-3.5 h-3.5" />
              <a href="mailto:support@wecareja.care" className="hover:underline">support@wecareja.care</a>
            </div>
            <div className="text-purple-300 pt-0.5">
              <a href="mailto:wecareja.bookings@gmail.com" className="hover:underline">wecareja.bookings@gmail.com</a>
            </div>
            <div className="text-emerald-300 font-bold">
              <a href="tel:8765827613" className="hover:underline">(876) 582-7613</a>
            </div>
          </div>

          <div className="space-y-2 text-right md:text-right">
            <div>
              <span>Brand Colors: Purple <strong className="text-purple-400">#7C3AED</strong>, Navy <strong className="text-blue-300">#1E1B4B</strong>, Accent <strong className="text-amber-400">#F59E0B</strong></span>
            </div>
            <div className="flex items-center justify-start md:justify-end gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Nursing Council of Jamaica (NCJ) Certified Care Network</span>
            </div>
            <div className="flex items-center justify-start md:justify-end gap-2 flex-wrap pt-1">
              <button
                onClick={() => setIsLegalTermsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setIsLegalTermsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition cursor-pointer"
              >
                Terms of Service
              </button>
              <a
                href="mailto:support@wecareja.care"
                className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-white text-xs font-bold border border-cyan-400/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@wecareja.care</span>
              </a>
              <button
                onClick={() => setIsContactUsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-white text-xs font-bold border border-purple-400/40 transition flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>View Map &amp; Desk</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 text-center sm:text-left">
          <div>
            We Care Jamaica • 4 Claudete Drive, St. Catherine, Jamaica • 100% Guaranteed Payout • Escrow Protection • Licensed NCJ Nurses
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsLegalTermsOpen(true)} className="hover:text-slate-300 underline cursor-pointer">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => setIsLegalTermsOpen(true)} className="hover:text-slate-300 underline cursor-pointer">
              Terms
            </button>
            <span>•</span>
            <a href="mailto:support@wecareja.care" className="hover:text-slate-300 underline">
              support@wecareja.care
            </a>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <NurseRegistrationModal
        isOpen={isNurseSignUpOpen}
        onClose={() => setIsNurseSignUpOpen(false)}
        onRegisterNurse={(newNurse) => {
          setNurses(prev => [newNurse, ...prev]);
          const nurseAccount: UserAccount = {
            id: `usr-nurse-${newNurse.id}`,
            username: newNurse.email?.split('@')[0] || String(newNurse?.name || 'nurse').toLowerCase().replace(/[^a-z0-9]/g, '.'),
            name: newNurse.name,
            email: newNurse.email || `${String(newNurse?.name || 'nurse').toLowerCase().replace(/[^a-z0-9]/g, '.')}@wecare.jm`,
            phone: newNurse.phoneNumber || newNurse.phone,
            role: 'nurse',
            approvalStatus: 'pending_approval',
            nurseProfileId: newNurse.id,
            trn: newNurse.trn || newNurse.trnNumber,
            avatar: newNurse.photoUrl,
            avatarUrl: newNurse.photoUrl,
            createdAt: new Date().toISOString()
          };
          setUserAccounts(prev => [nurseAccount, ...prev.filter(a => a.id !== nurseAccount.id)]);
          handleTriggerNotification(
            'nurse_signup',
            `Practitioner Registration Submitted: ${newNurse.name}`,
            `Registration for ${newNurse.name} received. Pending clinical license approval by Lead Admin Sydney Mattis. All nurse signups require admin approval.`
          );
        }}
        onAddNewSchoolPendingApproval={(newSchool) => {
          setNursingSchools(prev => [newSchool, ...prev]);
        }}
        logoVariation={logoVariation}
      />

      <LogoSelectorModal
        isOpen={isLogoStudioOpen}
        onClose={() => setIsLogoStudioOpen(false)}
        currentVariation={logoVariation}
        onSelectVariation={(v) => setLogoVariation(v)}
      />

      <LaunchKitModal
        isOpen={isLaunchKitOpen}
        onClose={() => setIsLaunchKitOpen(false)}
        logoVariation={logoVariation}
      />

      {/* Full-Screen SOS Emergency Screen Takeover (Takes up entire screen on both client & nurse screens) */}
      <FullScreenEmergencySOSOverlay
        isOpen={isFullScreenSOSOpen && Boolean(activeEmergencySOS)}
        emergencyData={activeEmergencySOS}
        currentUserRole={currentRole}
        onClose={() => setIsFullScreenSOSOpen(false)}
        onResolveEmergency={handleResolveEmergency}
      />

      <PanicModal
        isOpen={isPanicModalOpen}
        onClose={() => setIsPanicModalOpen(false)}
        activeBooking={emergencyActiveBooking}
        userRole={currentRole}
      />

      {/* Share We Care Modal */}
      <ShareAppModal
        isOpen={isShareAppOpen}
        onClose={() => setIsShareAppOpen(false)}
        logoVariation={logoVariation}
      />

      {/* Activity Notifications Live Stream Modal */}
      <ActivityNotificationModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearNotifications}
        onTriggerDemoAlert={handleTriggerNotification}
      />

      {/* 30-Minute Pre-Visit Reminder System Manager */}
      <VisitReminderNotificationManager
        bookings={bookings}
        currentRole={currentRole}
        currentUserId={currentUser?.id}
        onTriggerNotification={handleTriggerNotification}
        onOpenChat={(b) => setActiveChatBooking(b)}
      />

      {activeChatBooking && (
        <ChatModal
          isOpen={Boolean(activeChatBooking)}
          onClose={() => setActiveChatBooking(null)}
          booking={activeChatBooking}
          currentUserRole={currentRole}
        />
      )}

      {activeRatingBooking && (
        <RatingModal
          isOpen={Boolean(activeRatingBooking)}
          onClose={() => setActiveRatingBooking(null)}
          booking={activeRatingBooking}
          onSubmitRating={handleSubmitRating}
        />
      )}

      {/* Patient & Family Sign Up Modal */}
      <PatientSignUpModal
        isOpen={isPatientSignUpOpen}
        onClose={() => setIsPatientSignUpOpen(false)}
        onRegisterPatient={(newAccount) => {
          setUserAccounts(prev => [newAccount, ...prev]);
          setCurrentUserId(newAccount.id);
          setCurrentRole('client');
          handleTriggerNotification(
            'booking_confirmed',
            'Patient Account Created',
            `Welcome ${newAccount.name}! Your patient profile and trusted family guardian record are now active.`
          );
        }}
        onOpenSignIn={() => {
          setIsPatientSignUpOpen(false);
          handleOpenAuthModal('signin');
        }}
      />

      {/* Patient Profile & Medical Bio Data Modal */}
      {currentUser && currentUser.role === 'client' && (
        <PatientProfileModal
          isOpen={isPatientProfileOpen}
          onClose={() => setIsPatientProfileOpen(false)}
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          viewerRole="client"
        />
      )}

      {/* User Authentication & Profile Security Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allAccounts={userAccounts}
        isAuthenticated={isAuthenticated}
        initialTab={authModalTab}
        onSelectUser={handleSelectUser}
        onUpdateUser={handleUpdateUser}
        onCreateAccount={handleCreateAccount}
        onSignOut={handleSignOut}
        onOpenBiometricAuth={handleOpenBiometricAuth}
      />

      {/* WebAuthn Biometric Authentication Modal (Fingerprint / Face ID / Windows Hello) */}
      <BiometricAuthModal
        isOpen={isBiometricAuthOpen}
        onClose={() => setIsBiometricAuthOpen(false)}
        allAccounts={userAccounts}
        preSelectedUserId={biometricTargetUserId}
        onAuthenticated={handleBiometricSuccess}
        onSwitchToPasswordLogin={() => {
          setIsBiometricAuthOpen(false);
          handleOpenAuthModal('signin');
        }}
      />

      {/* Test on Phone (PWA & Private Access Link) Modal */}
      {isTestOnPhoneOpen && (
        <TestOnPhoneModal
          isOpen={isTestOnPhoneOpen}
          onClose={() => setIsTestOnPhoneOpen(false)}
        />
      )}

      {/* Live Video Consultation Room Modal */}
      {activeVideoCall && activeVideoCall.isOpen && (
        <VideoConsultationRoomModal
          isOpen={activeVideoCall.isOpen}
          onClose={() => setActiveVideoCall(null)}
          callerName={activeVideoCall.callerName}
          callerRole={activeVideoCall.callerRole}
          participantName={activeVideoCall.participantName}
          participantRole={activeVideoCall.participantRole}
          meetingTitle={activeVideoCall.meetingTitle}
          meetingRoomId={activeVideoCall.meetingRoomId}
        />
      )}

      {/* Launch Pack & Platform Disclaimers: Legal Terms (DPA 2020) */}
      <LegalTermsModal
        isOpen={isLegalTermsOpen}
        onClose={() => setIsLegalTermsOpen(false)}
      />

      {/* Help: How It Works & Doorbell / Safety Guide */}
      <HelpHowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onOpenSignUp={() => {
          setIsHowItWorksOpen(false);
          setIsPatientSignUpOpen(true);
        }}
        onOpenPanic={() => {
          setIsHowItWorksOpen(false);
          handleOpenPanic();
        }}
      />

      {/* Push Notification & Doorbell Sounds Audio Library */}
      <PushNotificationLibraryModal
        isOpen={isPushLibraryOpen}
        onClose={() => setIsPushLibraryOpen(false)}
      />

      {/* App Store & Google Play Launch Pack (Section 16 & 17) */}
      <AppStoreLaunchPackModal
        isOpen={isLaunchPackOpen}
        onClose={() => setIsLaunchPackOpen(false)}
      />

      {/* Splash Onboarding Walkthrough (Screens 1, 2, 3) */}
      <SplashOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onGetStarted={() => {
          setIsOnboardingOpen(false);
          setIsPatientSignUpOpen(true);
        }}
      />

      {/* Official Contact Us Modal with Google Maps Embed */}
      <ContactUsModal
        isOpen={isContactUsOpen}
        onClose={() => setIsContactUsOpen(false)}
        logoVariation={logoVariation}
      />

      {/* Official About Us Modal */}
      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
        logoVariation={logoVariation}
        onOpenContact={() => setIsContactUsOpen(true)}
      />
    </div>
  );
}
