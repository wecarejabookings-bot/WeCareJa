import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  Stethoscope, 
  Heart, 
  ShoppingBag, 
  ShieldAlert, 
  Play, 
  Scan, 
  Users, 
  Package, 
  Sliders, 
  FileText, 
  MapPin, 
  PhoneCall, 
  Building, 
  Share2, 
  Lock, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  KeyRound, 
  Volume2, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  QrCode
} from 'lucide-react';
import { UserAccount } from '../../types';

export type FeatureCategory = 
  | 'all' 
  | 'procedures' 
  | 'patient' 
  | 'nurse' 
  | 'store' 
  | 'emergency' 
  | 'tutorials' 
  | 'admin';

export interface AppFeatureItem {
  id: string;
  title: string;
  description: string;
  category: FeatureCategory;
  categoryLabel: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  isAdminOnly?: boolean;
  action: () => void;
  badge?: string;
  badgeColor?: string;
}

export interface AppFeatureSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount;
  isAuthenticated: boolean;
  isMasterAdmin?: boolean;
  onNavigateView: (view: 'portal' | 'store' | 'admin_orders' | 'admin_store' | 'nurse_signup' | 'admin_qr_generator' | 'admin_users' | 'admin_topics' | 'auth') => void;
  onOpenAuthModal: (tab?: 'profile' | 'signin' | 'register') => void;
  onOpenUnifiedSignUp: (role?: 'client' | 'nurse') => void;
  onOpenBiometricAuth: () => void;
  onOpenPanic: () => void;
  onOpenNearestPolice?: () => void;
  onOpenVideoTutorial: () => void;
  onOpenFaceScanTutorial: () => void;
  onOpenHowItWorks: () => void;
  onOpenContactUs: () => void;
  onOpenAboutUs: () => void;
  onOpenLegalTerms: () => void;
  onOpenLaunchKit?: () => void;
  onOpenShareApp?: () => void;
  onOpenPushLibrary?: () => void;
  onOpenOnboarding?: () => void;
  onSelectProcedure?: (procedureTitle: string) => void;
  onOpenQRGuide?: () => void;
}

export const AppFeatureSearchModal: React.FC<AppFeatureSearchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isAuthenticated,
  isMasterAdmin = false,
  onNavigateView,
  onOpenAuthModal,
  onOpenUnifiedSignUp,
  onOpenBiometricAuth,
  onOpenPanic,
  onOpenNearestPolice,
  onOpenVideoTutorial,
  onOpenFaceScanTutorial,
  onOpenHowItWorks,
  onOpenContactUs,
  onOpenAboutUs,
  onOpenLegalTerms,
  onOpenLaunchKit,
  onOpenShareApp,
  onOpenPushLibrary,
  onOpenOnboarding,
  onSelectProcedure,
  onOpenQRGuide
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory>('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Strict role check: Admin features are ONLY exposed if currentUser is admin or masterAdmin
  const isAdmin = Boolean(currentUser && (currentUser.role === 'admin' || isMasterAdmin));

  // Focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('all');
      setHighlightedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Master catalog of all application features, tools, procedures, and admin utilities
  const allFeatures: AppFeatureItem[] = useMemo(() => [
    // ------------------------------------------------------------------------
    // PROCEDURES & CLINICAL SERVICES
    // ------------------------------------------------------------------------
    {
      id: 'proc_wound_care',
      title: 'Wound Care & Sterile Dressing',
      description: 'Diabetic foot ulcers, post-op surgical wounds, aseptic cleansing & bandage change',
      category: 'procedures',
      categoryLabel: 'Clinical Procedure',
      keywords: ['wound', 'dressing', 'bandage', 'ulcer', 'diabetic', 'sterile', 'cut', 'post-op', 'gauze', 'burn'],
      icon: Activity,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      action: () => {
        onClose();
        if (onSelectProcedure) onSelectProcedure('Wound Care');
        else onOpenUnifiedSignUp('client');
      }
    },
    {
      id: 'proc_iv_infusion',
      title: 'IV Infusion & Hydration Therapy',
      description: 'Intravenous fluid therapy, electrolyte rehydration & antibiotic infusion at home',
      category: 'procedures',
      categoryLabel: 'Clinical Procedure',
      keywords: ['iv', 'infusion', 'hydration', 'drip', 'vein', 'antibiotics', 'fluids', 'cannula', 'saline'],
      icon: Stethoscope,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      action: () => {
        onClose();
        if (onSelectProcedure) onSelectProcedure('IV Infusion');
        else onOpenUnifiedSignUp('client');
      }
    },
    {
      id: 'proc_catheter_care',
      title: 'Catheter Insertion & Management',
      description: 'Foley & urinary catheterization, drainage bag replacement & infection prevention',
      category: 'procedures',
      categoryLabel: 'Clinical Procedure',
      keywords: ['catheter', 'foley', 'urinary', 'urine', 'drainage', 'urology', 'catheterization'],
      icon: Stethoscope,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      action: () => {
        onClose();
        if (onSelectProcedure) onSelectProcedure('Catheter Care');
        else onOpenUnifiedSignUp('client');
      }
    },
    {
      id: 'proc_post_surgical',
      title: 'Post-Surgical Vitals & Recovery',
      description: 'Blood pressure, oxygen saturation, glucose monitoring, surgical drain checks & vitals',
      category: 'procedures',
      categoryLabel: 'Clinical Procedure',
      keywords: ['vitals', 'post-surgical', 'surgery', 'recovery', 'blood pressure', 'spo2', 'oxygen', 'heart rate', 'glucose'],
      icon: Heart,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => {
        onClose();
        if (onSelectProcedure) onSelectProcedure('Post-Surgical Vitals');
        else onOpenUnifiedSignUp('client');
      }
    },
    {
      id: 'proc_injections',
      title: 'Injections & Medication Administration',
      description: 'Intramuscular (IM) & subcutaneous (SC) prescribed injections, insulin administration',
      category: 'procedures',
      categoryLabel: 'Clinical Procedure',
      keywords: ['injection', 'shots', 'insulin', 'medication', 'intramuscular', 'subcutaneous', 'dose', 'syringe'],
      icon: Stethoscope,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      action: () => {
        onClose();
        if (onSelectProcedure) onSelectProcedure('Injections');
        else onOpenUnifiedSignUp('client');
      }
    },
    {
      id: 'proc_elderly_care',
      title: 'Elderly Bedside Care & Mobility Support',
      description: 'Bedside hygiene, bed-bound rotation, fall prevention, pressure ulcer prophylaxis',
      category: 'procedures',
      categoryLabel: 'Clinical Procedure',
      keywords: ['elderly', 'senior', 'bedside', 'mobility', 'hygiene', 'geriatric', 'bed-bound', 'aging'],
      icon: Heart,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      action: () => {
        onClose();
        if (onSelectProcedure) onSelectProcedure('Elderly Care');
        else onOpenUnifiedSignUp('client');
      }
    },
    {
      id: 'proc_phlebotomy',
      title: 'Phlebotomy & Home Blood Draws',
      description: 'Diagnostic blood draw samples collected in comfort with temperature-controlled lab transport',
      category: 'procedures',
      categoryLabel: 'Clinical Procedure',
      keywords: ['blood', 'blood draw', 'phlebotomy', 'lab', 'test', 'sample', 'diagnostic', 'vein'],
      icon: Activity,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      action: () => {
        onClose();
        if (onSelectProcedure) onSelectProcedure('Phlebotomy');
        else onOpenUnifiedSignUp('client');
      }
    },

    // ------------------------------------------------------------------------
    // PATIENT CARE & BOOKING
    // ------------------------------------------------------------------------
    {
      id: 'patient_book_nurse',
      title: 'Book a Home Nurse Visit',
      description: 'Schedule a licensed Jamaican NCJ registered nurse to visit your residence in 15-30m',
      category: 'patient',
      categoryLabel: 'Patient Booking',
      keywords: ['book', 'nurse', 'visit', 'home nurse', 'schedule', 'appointment', 'request', 'dispatch', 'eta'],
      icon: Stethoscope,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badge: 'Popular',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
      action: () => {
        onClose();
        onOpenUnifiedSignUp('client');
      }
    },
    {
      id: 'patient_register',
      title: 'Create Patient / Client Account',
      description: 'Register client profile, emergency contacts, medical history & parish address',
      category: 'patient',
      categoryLabel: 'Account',
      keywords: ['register', 'sign up', 'client', 'patient', 'create account', 'profile', 'address', 'parish'],
      icon: Users,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      action: () => {
        onClose();
        onOpenUnifiedSignUp('client');
      }
    },
    {
      id: 'patient_sign_in',
      title: 'Sign In (Email, Phone or Biometric)',
      description: 'Access patient dashboard, active booking tracking, past medical notes & receipts',
      category: 'patient',
      categoryLabel: 'Authentication',
      keywords: ['sign in', 'log in', 'login', 'portal', 'account', 'password', 'biometric', 'camera'],
      icon: KeyRound,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => {
        onClose();
        onOpenAuthModal('signin');
      }
    },
    {
      id: 'biometric_face_signin',
      title: 'Biometric Face Recognition Sign-In',
      description: 'Instant contactless 1-second camera login using enrolled face scan',
      category: 'patient',
      categoryLabel: 'Security',
      keywords: ['biometric', 'face scan', 'face id', 'camera login', 'facial recognition', 'quick login'],
      icon: Scan,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      action: () => {
        onClose();
        onOpenBiometricAuth();
      }
    },

    // ------------------------------------------------------------------------
    // MEDICAL STORE & SUPPLIES
    // ------------------------------------------------------------------------
    {
      id: 'store_browse',
      title: 'Medical Supplies Store (/store)',
      description: 'Browse sterile wound kits, IV fluids, PPE sets, glucometers with Cash on Delivery (COD)',
      category: 'store',
      categoryLabel: 'Medical Store',
      keywords: ['store', 'supplies', 'shop', 'order', 'wound kit', 'gauze', 'gloves', 'ppe', 'cod', 'cash on delivery', 'medical'],
      icon: ShoppingBag,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      badge: 'COD Available',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30',
      action: () => {
        onClose();
        onNavigateView('store');
      }
    },
    {
      id: 'store_care_bundles',
      title: 'Clinical Care Bundles & Sterile Kits',
      description: 'Pre-packaged clinical kits delivered directly to your doorstep with nurse visits',
      category: 'store',
      categoryLabel: 'Medical Store',
      keywords: ['bundle', 'package', 'kit', 'sterile', 'equipment', 'post-op pack', 'iv set'],
      icon: Package,
      iconColor: 'text-emerald-300',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => {
        onClose();
        onNavigateView('store');
      }
    },

    // ------------------------------------------------------------------------
    // NURSE CAREER & PRACTITIONER
    // ------------------------------------------------------------------------
    {
      id: 'nurse_join',
      title: 'Join as Nurse (Earn 85% per Visit)',
      description: 'NCJ registered nurses earn 85% of visit fees, set flexible hours & receive doorstep dispatch',
      category: 'nurse',
      categoryLabel: 'Nurse Career',
      keywords: ['join nurse', 'nurse sign up', 'nurse registration', '85%', 'ncj', 'license', 'earnings', 'payout', 'practitioner'],
      icon: Stethoscope,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badge: '85% Earnings',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
      action: () => {
        onClose();
        onOpenUnifiedSignUp('nurse');
      }
    },
    {
      id: 'nurse_face_scan_req',
      title: 'Mandatory Biometric Face Scan Verification',
      description: 'Anti-fraud biometric face capture required for all nurse & practitioner registrations',
      category: 'nurse',
      categoryLabel: 'Compliance',
      keywords: ['face scan', 'biometric', 'camera', 'photo', 'nurse photo', 'anti-fraud', 'liveness', 'reticle'],
      icon: Scan,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      action: () => {
        onClose();
        onOpenFaceScanTutorial();
      }
    },

    // ------------------------------------------------------------------------
    // EMERGENCY & SAFETY (ALWAYS AVAILABLE)
    // ------------------------------------------------------------------------
    {
      id: 'sos_119_emergency',
      title: 'SOS 119 Emergency Dispatch Speed Dial',
      description: 'Instant speed dial to 119 Jamaican Police & Emergency Services with verified GPS coordinates',
      category: 'emergency',
      categoryLabel: 'Emergency & Safety',
      keywords: ['sos', '119', 'emergency', 'panic', 'police', 'ambulance', 'distress', 'help', 'urgent'],
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/20 border-rose-500/40',
      badge: 'Immediate',
      badgeColor: 'text-rose-300 bg-rose-500/20 border-rose-500/30',
      action: () => {
        onClose();
        onOpenPanic();
      }
    },
    {
      id: 'police_stations_finder',
      title: 'Nearest Police Stations Locator',
      description: 'Quick directory and map to Half Way Tree, Kingston Central, Montego Bay & local stations',
      category: 'emergency',
      categoryLabel: 'Safety Directory',
      keywords: ['police station', 'law enforcement', 'constabulary', 'precinct', 'half way tree', 'kingston station'],
      icon: MapPin,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      action: () => {
        onClose();
        if (onOpenNearestPolice) onOpenNearestPolice();
        else onOpenPanic();
      }
    },

    // ------------------------------------------------------------------------
    // TUTORIALS & GUIDES
    // ------------------------------------------------------------------------
    {
      id: 'tutorial_video_walkthrough',
      title: 'Video Walkthrough: How to Use We Care (3 Min)',
      description: 'Comprehensive 6-chapter interactive video tour showing booking, tracking, QR & store',
      category: 'tutorials',
      categoryLabel: 'Video Tour',
      keywords: ['video', 'walkthrough', 'tour', 'how to use', 'guide', 'tutorial', 'watch video', 'demo'],
      icon: Play,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badge: '3 Min Tour',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
      action: () => {
        onClose();
        onOpenVideoTutorial();
      }
    },
    {
      id: 'tutorial_qr_checkin_guide',
      title: 'Easy QR Doorstep Check-in Guide',
      description: 'Step-by-step instructions for clients on scanning nurse arrival QR code for instant security logging',
      category: 'tutorials',
      categoryLabel: 'Interactive Guide',
      keywords: ['qr', 'check-in', 'checkin', 'doorstep', 'arrival', 'scan nurse', 'scan qr', 'verify visit', 'pin'],
      icon: QrCode,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badge: 'Anti-Fraud',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30',
      action: () => {
        onClose();
        if (onOpenQRGuide) onOpenQRGuide();
        else onOpenHowItWorks();
      }
    },
    {
      id: 'tutorial_face_scan_guide',
      title: 'Biometric Face Scan Interactive Tutorial',
      description: 'Step-by-step guidance on camera oval positioning, lighting checks & anti-spoofing tests',
      category: 'tutorials',
      categoryLabel: 'Interactive Guide',
      keywords: ['face scan tutorial', 'biometric tutorial', 'camera tutorial', 'how to scan face', 'reticle practice'],
      icon: Scan,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
      action: () => {
        onClose();
        onOpenFaceScanTutorial();
      }
    },
    {
      id: 'tutorial_how_it_works',
      title: 'How It Works & Clinical Safety Guidelines',
      description: 'Complete patient and nurse operational overview, NCJ standards & infection control',
      category: 'tutorials',
      categoryLabel: 'Documentation',
      keywords: ['how it works', 'faq', 'safety', 'guidelines', 'ncj standards', 'questions', 'support'],
      icon: HelpCircle,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      action: () => {
        onClose();
        onOpenHowItWorks();
      }
    },
    {
      id: 'guide_onboarding_walkthrough',
      title: 'Welcome Splash Onboarding',
      description: 'Introduction walkthrough covering home nursing benefits, coverage areas & features',
      category: 'tutorials',
      categoryLabel: 'Getting Started',
      keywords: ['onboarding', 'welcome', 'splash', 'getting started', 'intro'],
      icon: Sparkles,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      action: () => {
        onClose();
        if (onOpenOnboarding) onOpenOnboarding();
        else onOpenHowItWorks();
      }
    },

    // ------------------------------------------------------------------------
    // GENERAL & CONTACT
    // ------------------------------------------------------------------------
    {
      id: 'general_contact_us',
      title: 'Contact Us (Kingston HQ & Telephone Desk)',
      description: 'Official We Care Jamaica support desk, office address, email & WhatsApp helpline',
      category: 'all',
      categoryLabel: 'Support',
      keywords: ['contact', 'help', 'email', 'phone', 'support desk', 'kingston office', 'address'],
      icon: PhoneCall,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => {
        onClose();
        onOpenContactUs();
      }
    },
    {
      id: 'general_about_us',
      title: 'About Us & NCJ Accreditation',
      description: 'Our mission, Nursing Council of Jamaica clinical compliance & Ministry of Health alignment',
      category: 'all',
      categoryLabel: 'About Us',
      keywords: ['about', 'mission', 'accreditation', 'nursing council', 'ncj', 'ministry of health'],
      icon: Building,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      action: () => {
        onClose();
        onOpenAboutUs();
      }
    },
    {
      id: 'general_terms',
      title: 'Legal Terms of Service & Privacy Policy',
      description: 'Patient confidentiality, medical data handling, liability & Jamaican Data Protection Act',
      category: 'all',
      categoryLabel: 'Legal',
      keywords: ['terms', 'privacy', 'legal', 'policy', 'confidentiality', 'data protection'],
      icon: FileText,
      iconColor: 'text-slate-400',
      iconBg: 'bg-slate-500/10 border-slate-500/20',
      action: () => {
        onClose();
        onOpenLegalTerms();
      }
    },
    {
      id: 'general_share_app',
      title: 'Share App & Earn $500 Credit',
      description: 'Refer friends or family in Jamaica and receive $500 credit toward clinical procedures',
      category: 'patient',
      categoryLabel: 'Referral Rewards',
      keywords: ['share', 'referral', 'earn', '$500', 'invite', 'credit', 'discount'],
      icon: Share2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => {
        onClose();
        if (onOpenShareApp) onOpenShareApp();
        else onOpenHowItWorks();
      }
    },

    // ------------------------------------------------------------------------
    // STRICTLY ADMIN-RESTRICTED FEATURES
    // (Filtered completely if user is not authenticated as admin)
    // ------------------------------------------------------------------------
    {
      id: 'admin_user_mgmt',
      title: 'Admin: User Management Registry (/admin/users)',
      description: 'View registered clients, licensed nurses, pending accounts, roles & status registry',
      category: 'admin',
      categoryLabel: 'Admin Restricted',
      keywords: ['admin', 'users', 'user management', 'accounts', 'clients', 'nurses list', 'registry', 'roles', 'permissions'],
      icon: Users,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/20 border-amber-500/40',
      isAdminOnly: true,
      badge: 'Admin Only',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      action: () => {
        onClose();
        onNavigateView('admin_users');
      }
    },
    {
      id: 'admin_nurse_verification',
      title: 'Admin: Nurse Verification & Council Certification',
      description: 'Review NCJ license uploads, verify registration credentials & approve or reject applications',
      category: 'admin',
      categoryLabel: 'Admin Restricted',
      keywords: ['admin', 'nurse approval', 'verification', 'license check', 'ncj audit', 'approve nurse', 'reject nurse', 'credentials'],
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 border-emerald-500/40',
      isAdminOnly: true,
      badge: 'Admin Only',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
      action: () => {
        onClose();
        onNavigateView('admin_users');
      }
    },
    {
      id: 'admin_supply_orders',
      title: 'Admin: Medical Supply Orders Management (/admin/orders)',
      description: 'Fulfill customer care bundles, track delivery progress, verify Cash on Delivery receipts',
      category: 'admin',
      categoryLabel: 'Admin Restricted',
      keywords: ['admin', 'orders', 'supplies management', 'cod settlements', 'deliveries', 'order dispatch', 'tracking'],
      icon: Package,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20 border-purple-500/40',
      isAdminOnly: true,
      badge: 'Admin Only',
      badgeColor: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
      action: () => {
        onClose();
        onNavigateView('admin_orders');
      }
    },
    {
      id: 'admin_store_inventory',
      title: 'Admin: Store & Inventory Manager (/admin/store)',
      description: 'Manage clinical stock levels, add medical products, set JMD pricing & stock alerts',
      category: 'admin',
      categoryLabel: 'Admin Restricted',
      keywords: ['admin', 'store', 'inventory', 'pricing', 'jmd', 'stock', 'add product', 'products', 'equipment'],
      icon: Sliders,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 border-emerald-500/40',
      isAdminOnly: true,
      badge: 'Admin Only',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
      action: () => {
        onClose();
        onNavigateView('admin_store');
      }
    },
    {
      id: 'admin_qr_generator',
      title: 'Admin: Marketing QR Code Ad Flyers (/admin/qr-generator)',
      description: 'Generate high-resolution printable marketing posters & parish-coded QR flyers for public outreach',
      category: 'admin',
      categoryLabel: 'Admin Restricted',
      keywords: ['admin', 'qr', 'marketing', 'flyer', 'poster', 'print', 'qr generator', 'parish codes', 'outreach'],
      icon: Share2,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/20 border-amber-500/40',
      isAdminOnly: true,
      badge: 'Admin Only',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      action: () => {
        onClose();
        onNavigateView('admin_qr_generator');
      }
    },
    {
      id: 'admin_topics_cms',
      title: 'Admin: Topics Directory (#01-#10) & Homepage CMS (/admin/topics)',
      description: 'Edit procedure directory cards, change pricing copy, hero stats, and interactive cards',
      category: 'admin',
      categoryLabel: 'Admin Restricted',
      keywords: ['admin', 'topics', 'cms', 'directory manager', 'homepage content', 'edit procedures', 'edit stats'],
      icon: BookOpen,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20 border-cyan-500/40',
      isAdminOnly: true,
      badge: 'Admin Only',
      badgeColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
      action: () => {
        onClose();
        onNavigateView('admin_topics');
      }
    },
    {
      id: 'admin_push_sounds',
      title: 'Admin: Doorbell & Push Sounds Audio Library',
      description: 'Preview and test Web Audio doorbell alerts, arrival chime & medical telemetry chimes',
      category: 'admin',
      categoryLabel: 'Admin Restricted',
      keywords: ['admin', 'sounds', 'audio', 'doorbell', 'chime', 'push sound', 'telemetry audio'],
      icon: Volume2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 border-emerald-500/40',
      isAdminOnly: true,
      badge: 'Admin Only',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
      action: () => {
        onClose();
        if (onOpenPushLibrary) onOpenPushLibrary();
        else onOpenHowItWorks();
      }
    }
  ], [
    isAdmin, 
    onClose, 
    onSelectProcedure, 
    onOpenUnifiedSignUp, 
    onOpenAuthModal, 
    onOpenBiometricAuth, 
    onNavigateView, 
    onOpenFaceScanTutorial, 
    onOpenPanic, 
    onOpenNearestPolice, 
    onOpenVideoTutorial, 
    onOpenHowItWorks, 
    onOpenOnboarding, 
    onOpenContactUs, 
    onOpenAboutUs, 
    onOpenLegalTerms, 
    onOpenShareApp, 
    onOpenPushLibrary
  ]);

  // Filter features based on:
  // 1. Strict Security Rule: Never show isAdminOnly items unless currentUser is Admin/MasterAdmin
  // 2. Selected Category Filter
  // 3. Search Query text match against title, description, and keywords
  const filteredFeatures = useMemo(() => {
    return allFeatures.filter(feature => {
      // Security Enforcement: If item is admin-restricted and user is NOT admin, strictly hide it
      if (feature.isAdminOnly && !isAdmin) {
        return false;
      }

      // Category tab filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'admin') {
          if (!feature.isAdminOnly) return false;
        } else if (feature.category !== selectedCategory) {
          return false;
        }
      }

      // Search query filter
      if (!searchQuery.trim()) {
        return true;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = feature.title.toLowerCase().includes(q);
      const matchDesc = feature.description.toLowerCase().includes(q);
      const matchCategory = feature.categoryLabel.toLowerCase().includes(q);
      const matchKeyword = feature.keywords.some(kw => kw.toLowerCase().includes(q));

      return matchTitle || matchDesc || matchCategory || matchKeyword;
    });
  }, [allFeatures, isAdmin, selectedCategory, searchQuery]);

  // Keep highlighted item in valid bounds
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, selectedCategory]);

  // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredFeatures.length - 1 ? prev + 1 : prev));
      scrollIntoView(highlightedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      scrollIntoView(highlightedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFeatures[highlightedIndex]) {
        filteredFeatures[highlightedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const scrollIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-feature-item]');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-[#0d122e] border border-blue-500/30 text-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Accent Gradient Line */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400" />

        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.03]">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-5 h-5 text-amber-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAdmin ? "Search all features, procedures, or admin tools..." : "Search procedures, services, booking, store, help..."}
              className="w-full pl-11 pr-24 py-3 bg-white/[0.06] border border-white/15 focus:border-amber-400 focus:bg-white/[0.1] rounded-2xl text-white placeholder-slate-400 text-sm font-medium outline-hidden transition shadow-inner"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white/10 border border-white/15 rounded text-slate-400">
                ESC
              </kbd>
            </div>
          </div>

          {/* Interactive Category Filter Tabs (Zero-pill discipline: segmented buttons with functional click handlers) */}
          <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              All Features
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('procedures')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'procedures'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Procedures
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('patient')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'patient'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Booking &amp; Care
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('store')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'store'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Medical Store
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('tutorials')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'tutorials'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Tutorials
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('emergency')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'emergency'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Emergency
            </button>

            {/* Admin Filter Tab - STRICTLY Rendered Only for Admins */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setSelectedCategory('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'admin'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Admin Tools</span>
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 max-h-[55vh]">
          {filteredFeatures.length > 0 ? (
            filteredFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={feature.id}
                  data-feature-item
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => feature.action()}
                  className={`group flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition border ${
                    isHighlighted
                      ? 'bg-white/10 border-amber-400/50 shadow-md'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
                  }`}
                >
                  {/* Feature Icon */}
                  <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${feature.iconBg}`}>
                    <Icon className={`w-4 h-4 ${feature.iconColor}`} />
                  </div>

                  {/* Feature Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition truncate">
                        {feature.title}
                      </h4>

                      {/* Clean metadata (no pill slop) */}
                      <span className="text-[11px] text-slate-400">
                        {feature.categoryLabel}
                      </span>

                      {/* Optional status badge */}
                      {feature.badge && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${feature.badgeColor || 'text-slate-300 bg-white/10 border-white/20'}`}>
                          {feature.badge}
                        </span>
                      )}

                      {/* Admin Restricted Tag */}
                      {feature.isAdminOnly && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 rounded-md">
                          <Lock className="w-2.5 h-2.5" /> Admin Only
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Right Action Hint */}
                  <div className="flex items-center self-center shrink-0 pl-2">
                    <span className={`text-[11px] font-bold flex items-center gap-1 transition ${
                      isHighlighted ? 'text-amber-400 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}>
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No matching features found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery.toLowerCase().includes('admin') && !isAdmin
                  ? "Admin-restricted tools are strictly private and accessible only to authorized administrators."
                  : `No features found matching "${searchQuery}". Try searching for wound care, booking, supplies, or video tour.`}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 transition"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Keyboard Navigation Hints & Security Status */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/15 rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/15 rounded text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/15 rounded text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin View (Privileged Access)</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Admin tools hidden</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
