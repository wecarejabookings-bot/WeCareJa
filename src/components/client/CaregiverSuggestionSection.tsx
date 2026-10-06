import React, { useState, useMemo } from 'react';
import { NurseProfile, ServiceItem, Booking, NurseCareLevel, UserAccount } from '../../types';
import { CaregiverTierBadge } from '../common/CaregiverTierBadge';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';
import { ServiceLogo } from '../common/ServiceLogo';
import { KINGSTON_ZONES, PORTMORE_ZONES, SPANISH_TOWN_ZONES } from '../../data/mockData';
import { checkNurseBookingConflict } from '../../utils/bookingAvailability';
import { soundFX } from '../../utils/soundEffects';
import { 
  Sparkles, 
  CheckCircle2, 
  HeartHandshake, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  DollarSign, 
  Star, 
  ChevronRight, 
  ArrowLeft, 
  Activity, 
  Zap, 
  Check, 
  Calendar,
  Filter,
  Info,
  TrendingUp,
  Repeat,
  Radio,
  Flame,
  ThumbsUp,
  Briefcase,
  Moon,
  Sun,
  Award,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Layers
} from 'lucide-react';

interface CaregiverSuggestionSectionProps {
  nurses: NurseProfile[];
  services: ServiceItem[];
  allBookings: Booking[];
  currentZone: string;
  onSelectAndBook: (
    nurse: NurseProfile,
    service: ServiceItem,
    durationMinutes: number,
    date: string,
    time: string,
    zone: string,
    customNotes: string
  ) => void;
  onViewProfile?: (nurse: NurseProfile) => void;
  onOpenScopeModal?: () => void;
  currentUser?: UserAccount;
  onUpdateNurseProfile?: (nurse: NurseProfile) => void;
}

interface PresetScenario {
  id: string;
  label: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  tasks: string[];
  patientState: string;
  hours: number;
  expectedTier: NurseCareLevel;
  serviceId: string;
  description: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'elderly_supervision_1hr',
    label: '1-Hour Elderly Supervision & Companionship',
    tagline: 'Affordable check-in, watchful companionship & vitals logging',
    badge: 'Affordable Minimal Care',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    tasks: ['supervision', 'companionship', 'vitals_basic', 'hydration_meal_reminder'],
    patientState: 'independent_watch',
    hours: 1,
    expectedTier: 'geriatric_caregiver',
    serviceId: 'srv-7',
    description: 'Looking for a reliable certified caregiver to spend 1 hour with a senior loved one, keeping them company, supervising safety, and checking vitals.'
  },
  {
    id: 'senior_adl_bathing_2hr',
    label: 'Assisted Bathing, Hygiene & Morning Routine',
    tagline: 'Dignified personal grooming, sponge/shower bath & dressing',
    badge: 'Geriatric ADL Tier',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    tasks: ['bathing_hygiene', 'dressing', 'mobility_transfer', 'meal_prep', 'vitals_basic'],
    patientState: 'mild_assistance',
    hours: 2,
    expectedTier: 'geriatric_caregiver',
    serviceId: 'srv-8',
    description: 'Requires hands-on morning or bedtime assistance with assisted bathing, sponge bath, safe dressing, and nutritious light meal preparation.'
  },
  {
    id: 'family_respite_3hr',
    label: 'Family Caregiver Relief / Respite (3 Hours)',
    tagline: 'Giving family caregivers peace of mind while running errands',
    badge: 'Family Respite Tier',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    tasks: ['supervision', 'companionship', 'meal_prep', 'cognitive_games', 'mobility_transfer'],
    patientState: 'mild_assistance',
    hours: 3,
    expectedTier: 'geriatric_caregiver',
    serviceId: 'srv-9',
    description: 'A multi-hour block to relieve family members while a trusted caregiver provides attentive companionship, cognitive stimulation, and meal assistance.'
  },
  {
    id: 'mobility_fall_prevention',
    label: 'Mobility, Wheelchair Transfer & Walking Support',
    tagline: 'Safe bed-to-chair transfers, fall prevention & walking practice',
    badge: 'Practical Aide Tier',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    tasks: ['mobility_transfer', 'wheelchair_assist', 'gentle_exercise', 'fall_prevention'],
    patientState: 'bedridden_wheelchair',
    hours: 1,
    expectedTier: 'practical_nurse_aide',
    serviceId: 'srv-10',
    description: 'Specially trained practical care aide to assist with safe patient repositioning, wheelchair transfers, and gentle range of motion exercises.'
  },
  {
    id: 'wound_post_op',
    label: 'Post-Surgical Wound Dressing & Suture Care',
    tagline: 'Sterile surgical incision cleansing, bandage change & healing review',
    badge: 'NCJ Clinical RN Required',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-400/30',
    tasks: ['sterile_wound', 'suture_check', 'clinical_assessment'],
    patientState: 'post_surgical',
    hours: 1,
    expectedTier: 'registered_nurse',
    serviceId: 'srv-1',
    description: 'Sterile surgical wound care, dressing replacement, and post-operative assessment strictly performed by an NCJ Registered Nurse.'
  },
  {
    id: 'iv_infusion_meds',
    label: 'Doctor-Prescribed IV Therapy & Injections',
    tagline: 'Cannulation, saline/antibiotic IV infusions & IM/SC injections',
    badge: 'NCJ Clinical RN Required',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-400/30',
    tasks: ['iv_cannula', 'iv_infusion', 'injections', 'clinical_assessment'],
    patientState: 'post_surgical',
    hours: 1,
    expectedTier: 'registered_nurse',
    serviceId: 'srv-3',
    description: 'Intravenous infusion, cannulation, and injectable medications prescribed by a physician, requiring licensed RN administration.'
  }
];

const AVAILABLE_TASKS = [
  // Non-Invasive Tasks (Geriatric Aide / Practical Nurse)
  { id: 'supervision', label: '1-Hour Daytime Supervision & Watch', isClinical: false },
  { id: 'companionship', label: 'Conversational Companionship & Games', isClinical: false },
  { id: 'vitals_basic', label: 'Basic Vitals Log (BP, Pulse, Temp)', isClinical: false },
  { id: 'bathing_hygiene', label: 'Assisted Bathing & Sponge Bath', isClinical: false },
  { id: 'dressing', label: 'Assisted Dressing & Morning Routine', isClinical: false },
  { id: 'meal_prep', label: 'Light Meal Preparation & Feeding', isClinical: false },
  { id: 'hydration_meal_reminder', label: 'Hydration & Pre-sorted Pill Reminder', isClinical: false },
  { id: 'mobility_transfer', label: 'Safe Bed-to-Chair / Wheelchair Transfer', isClinical: false },
  { id: 'fall_prevention', label: 'Gentle Walking & Fall Prevention', isClinical: false },
  { id: 'light_tidying', label: 'Patient Area Sanitizing & Linen Change', isClinical: false },

  // Clinical Tasks (NCJ Registered Nurse Required)
  { id: 'sterile_wound', label: 'Sterile Surgical Wound Dressing / Cleansing', isClinical: true },
  { id: 'suture_check', label: 'Suture / Staple Healing Assessment', isClinical: true },
  { id: 'iv_cannula', label: 'Doctor-Prescribed IV Cannulation', isClinical: true },
  { id: 'iv_infusion', label: 'IV Hydration / Antibiotic Infusion', isClinical: true },
  { id: 'injections', label: 'Prescription Injections (IM / SC)', isClinical: true },
  { id: 'catheter_care', label: 'Catheter Flush or Stoma Tube Care', isClinical: true },
  { id: 'postnatal_maternal', label: 'Postpartum Incision / Fundal Exam', isClinical: true },
  { id: 'newborn_cord', label: 'Newborn Cord Care & Jaundice Screening', isClinical: true }
];

// Live Accepted Market Ticker Data for Jamaica
const RECENT_ACCEPTED_MARKET_VISITS = [
  {
    id: 'mkt-1',
    nurseName: 'Registered Home Nurse, RN',
    careLevel: 'NCJ Registered Nurse',
    serviceName: 'Post-Surgical Wound Dressing (2 hrs)',
    zone: 'Barbican & Cherry Gardens, Kgn 8',
    acceptedMinsAgo: 3,
    clientPriceJMD: 15000,
    practitionerNetJMD: 12750,
    responseTime: '2.4 mins'
  },
  {
    id: 'mkt-2',
    nurseName: 'Caregiver Keisha Forbes, GCA',
    careLevel: 'Geriatric Care Assistant',
    serviceName: 'Assisted Morning Bathing & ADL (2 hrs)',
    zone: 'Liguanea & Mona, Kgn 6',
    acceptedMinsAgo: 7,
    clientPriceJMD: 6400,
    practitionerNetJMD: 5440,
    responseTime: '1.8 mins'
  },
  {
    id: 'mkt-3',
    nurseName: 'Nurse Devonte Reid, RN',
    careLevel: 'NCJ Registered Nurse',
    serviceName: 'Diabetic Glucose & Vitals Check (1 hr)',
    zone: 'Portmore Pines, St. Catherine',
    acceptedMinsAgo: 14,
    clientPriceJMD: 6500,
    practitionerNetJMD: 5525,
    responseTime: '3.1 mins'
  },
  {
    id: 'mkt-4',
    nurseName: 'Caregiver Hopeton Douglas, PNA',
    careLevel: 'Practical Nurse Aide',
    serviceName: 'Mobility & Wheelchair Assistance (2 hrs)',
    zone: 'Constant Spring & Manor Park',
    acceptedMinsAgo: 22,
    clientPriceJMD: 6000,
    practitionerNetJMD: 5100,
    responseTime: '4.0 mins'
  }
];

export const CaregiverSuggestionSection: React.FC<CaregiverSuggestionSectionProps> = ({
  nurses,
  services,
  allBookings,
  currentZone,
  onSelectAndBook,
  onViewProfile,
  onOpenScopeModal,
  currentUser,
  onUpdateNurseProfile
}) => {
  // Main Sub-Tab: 'frequent' | 'community' | 'earnings_market' | 'guided_matcher'
  const [activeSuggestionTab, setActiveSuggestionTab] = useState<'frequent' | 'community' | 'earnings_market' | 'guided_matcher'>('frequent');

  // Availability Filter: 'all' | 'on_call'
  const [availabilityOnly, setAvailabilityOnly] = useState<boolean>(false);

  // Guided Needs Matcher State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('elderly_supervision_1hr');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([
    'supervision',
    'companionship',
    'vitals_basic',
    'hydration_meal_reminder'
  ]);
  const [patientState, setPatientState] = useState<string>('independent_watch');
  const [hoursNeeded, setHoursNeeded] = useState<number>(1);
  const [targetZone, setTargetZone] = useState<string>(currentZone || 'New Kingston');
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visitTime, setVisitTime] = useState<string>('14:00');
  const [customNotes, setCustomNotes] = useState<string>('Looking for 1 hour of patient supervision and companion care for an elderly relative.');

  // Quick re-book scheduling state (tomorrow by default)
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const [quickRebookDate, setQuickRebookDate] = useState<string>(tomorrowStr);
  const [quickRebookTime, setQuickRebookTime] = useState<string>('10:00');

  // Practitioner local availability toggle state (for demo/practitioner testing)
  const [localToggleNotice, setLocalToggleNotice] = useState<string | null>(null);

  // Count of on-call nurses
  const onCallCount = useMemo(() => {
    return nurses.filter(n => n.status === 'approved' && n.availabilityStatus !== 'offline').length;
  }, [nurses]);

  const totalApprovedCount = useMemo(() => {
    return nurses.filter(n => n.status === 'approved').length;
  }, [nurses]);

  // Client History Analysis for Frequent Bookings
  const clientName = currentUser?.name || 'Patricia Sutherland';
  const clientPhone = currentUser?.phone || '+1 (876) 909-1234';

  const clientHistory = useMemo(() => {
    return allBookings.filter(b => 
      (b.clientId && currentUser?.id && b.clientId === currentUser.id) ||
      b.clientName === clientName ||
      b.clientPhone === clientPhone
    );
  }, [allBookings, currentUser, clientName, clientPhone]);

  // Aggregate Frequent Bookings by (Nurse + Service) or by Nurse
  const frequentPairs = useMemo(() => {
    // If client has bookings, group them
    if (clientHistory.length > 0) {
      const map = new Map<string, {
        nurseId: string;
        nurseName: string;
        nursePhoto: string;
        serviceId: string;
        serviceName: string;
        count: number;
        lastBookedAt: string;
        zone: string;
        baseDurationMinutes: number;
        lastPriceJMD: number;
        notes?: string;
      }>();

      clientHistory.forEach(b => {
        const key = `${b.nurseId || b.nurseName}__${b.serviceId || b.serviceName}`;
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
          if (new Date(b.scheduledDateTime) > new Date(existing.lastBookedAt)) {
            existing.lastBookedAt = b.scheduledDateTime;
            existing.zone = b.zone;
            existing.lastPriceJMD = b.priceJMD;
          }
        } else {
          map.set(key, {
            nurseId: b.nurseId,
            nurseName: b.nurseName,
            nursePhoto: b.nursePhoto,
            serviceId: b.serviceId,
            serviceName: b.serviceName,
            count: 1,
            lastBookedAt: b.scheduledDateTime,
            zone: b.zone || currentZone || 'New Kingston',
            baseDurationMinutes: b.baseDurationMinutes || 60,
            lastPriceJMD: b.priceJMD,
            notes: b.notes
          });
        }
      });

      return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }

    // Clean launch state: no mock favorites
    return [];
  }, [clientHistory, currentZone]);

  // What Other Clients Are Booking (Community Trends in Kingston & St. Andrew)
  const communityTrending = useMemo(() => {
    return [
      {
        id: 'trend-1',
        serviceId: 'srv-7',
        serviceName: '1-Hour Elderly Supervision & Companionship',
        nurseId: 'nurse-107',
        nurseName: 'Caregiver Keisha Forbes, GCA',
        nursePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        qualification: 'Certified Geriatric Care Assistant (HEART/NTA)',
        careLevel: 'geriatric_caregiver' as NurseCareLevel,
        bookingsThisMonth: 44,
        rehireRate: '99%',
        avgResponseMinutes: 3.2,
        priceJMD: 3200,
        parishArea: 'Kingston 6 (Liguanea, Mona, Hope Pastures)',
        tag: '🔥 Most Repeated Senior Sitting',
        reviewSnippet: '"Keisha is a blessing for my mother. Reliable, attentive, and very gentle with memory care."'
      },
      {
        id: 'trend-2',
        serviceId: 'srv-1',
        serviceName: 'Sterile Surgical Wound Dressing & Suture Care',
        nurseId: 'nurse-registered-02',
        nurseName: 'Registered Home Nurse, RN',
        nursePhoto: 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=400',
        qualification: 'Registered General Nurse (NCJ Verified)',
        careLevel: 'registered_nurse' as NurseCareLevel,
        bookingsThisMonth: 38,
        rehireRate: '98%',
        avgResponseMinutes: 2.5,
        priceJMD: 7500,
        parishArea: 'Kingston 8 (Barbican, Cherry Gardens, Constant Spring)',
        tag: '🩺 Top Clinical Wound Procedure',
        reviewSnippet: '"Clinical hospital-grade sterile dressing done right at home. Doctor at UHWI was delighted with the incision healing."'
      },
      {
        id: 'trend-3',
        serviceId: 'srv-8',
        serviceName: 'Assisted Bathing, Hygiene & Morning Routine',
        nurseId: 'nurse-108',
        nurseName: 'Caregiver Hopeton Douglas, PNA',
        nursePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        qualification: 'Certified Practical Nurse Aide & Senior Companion',
        careLevel: 'practical_nurse_aide' as NurseCareLevel,
        bookingsThisMonth: 31,
        rehireRate: '97%',
        avgResponseMinutes: 3.8,
        priceJMD: 6000,
        parishArea: 'St. Andrew & Portmore Pines',
        tag: '☀️ Top Morning Routine Match',
        reviewSnippet: '"Safe wheelchair transfer and dignified morning bath. Punctual and professional every single visit."'
      },
      {
        id: 'trend-4',
        serviceId: 'srv-3',
        serviceName: 'Doctor-Prescribed IV Infusions & Cannulation',
        nurseId: 'nurse-106',
        nurseName: 'Nurse Devonte Reid, RN',
        nursePhoto: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
        qualification: 'Registered General Nurse (NCJ Verified)',
        careLevel: 'registered_nurse' as NurseCareLevel,
        bookingsThisMonth: 27,
        rehireRate: '100%',
        avgResponseMinutes: 3.0,
        priceJMD: 7500,
        parishArea: 'New Kingston & Spanish Town Corridor',
        tag: '⚡ High Precision IV Delivery',
        reviewSnippet: '"Painless IV cannulation and sterile saline infusion prescribed by our family physician. Exceptional service."'
      }
    ];
  }, []);

  // Guided Need Matcher Filter and Computation
  const handleSelectPreset = (preset: PresetScenario) => {
    setSelectedPresetId(preset.id);
    setSelectedTasks(preset.tasks);
    setPatientState(preset.patientState);
    setHoursNeeded(preset.hours);
    setCustomNotes(preset.description);
    soundFX.playPop();
  };

  const toggleTask = (taskId: string) => {
    soundFX.playPop();
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(t => t !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const hasClinicalTasks = useMemo(() => {
    return selectedTasks.some(t => {
      const taskDef = AVAILABLE_TASKS.find(item => item.id === t);
      return taskDef?.isClinical;
    });
  }, [selectedTasks]);

  const recommendedTier = useMemo(() => {
    if (hasClinicalTasks) {
      return {
        level: 'registered_nurse' as NurseCareLevel,
        title: 'NCJ Registered Nurse (Clinical Tier)',
        description: 'Your selected tasks include sterile clinical procedures (such as wound care, IV, or injections) which legally require an active NCJ Registered Nurse.',
        rateRangeJMD: 'JMD $7,500 – $8,800/visit',
        savingsNote: 'Licensed Clinical Procedure Required',
        isClinical: true
      };
    }

    if (patientState === 'bedridden_wheelchair' || selectedTasks.includes('mobility_transfer')) {
      return {
        level: 'practical_nurse_aide' as NurseCareLevel,
        title: 'Certified Practical Nurse Aide (Mobility & ADL Tier)',
        description: 'For bed transfers, gentle walking assistance, and fall prevention, a Certified Practical Care Aide provides safe physical support at an economical rate.',
        savingsNote: 'Saves ~60% vs Clinical RN Rate',
        rateRangeJMD: 'JMD $3,000/hr',
        isClinical: false
      };
    }

    return {
      level: 'geriatric_caregiver' as NurseCareLevel,
      title: 'Certified Geriatric Care Aide (Affordable Minimal Care Tier)',
      description: 'For 1-hour supervision, senior companionship, bathing, and vitals, a certified Geriatric Caregiver is the ideal match — saving you up to 60% compared to hospital RN rates.',
      savingsNote: 'Affordable minimal rate • Perfect for 1-hour elderly sitting',
      rateRangeJMD: 'JMD $3,000 – $3,200/hr',
      isClinical: false
    };
  }, [hasClinicalTasks, patientState, selectedTasks]);

  const matchedService = useMemo(() => {
    if (selectedTasks.includes('sterile_wound')) return services.find(s => s.id === 'srv-1') || services[0];
    if (selectedTasks.includes('iv_infusion') || selectedTasks.includes('iv_cannula')) return services.find(s => s.id === 'srv-3') || services[0];
    if (selectedTasks.includes('postnatal_maternal') || selectedTasks.includes('newborn_cord')) return services.find(s => s.id === 'srv-5') || services[0];
    if (selectedTasks.includes('catheter_care')) return services.find(s => s.id === 'srv-4') || services[0];
    if (hoursNeeded >= 2 && selectedTasks.includes('companionship')) return services.find(s => s.id === 'srv-9') || services.find(s => s.id === 'srv-7') || services[0];
    if (selectedTasks.includes('bathing_hygiene') || selectedTasks.includes('dressing')) return services.find(s => s.id === 'srv-8') || services.find(s => s.id === 'srv-7') || services[0];
    if (selectedTasks.includes('mobility_transfer')) return services.find(s => s.id === 'srv-10') || services.find(s => s.id === 'srv-7') || services[0];
    return services.find(s => s.id === 'srv-7') || services[0];
  }, [selectedTasks, hoursNeeded, services]);

  const rankedCaregivers = useMemo(() => {
    let approvedNurses = nurses.filter(n => n.status === 'approved');
    if (availabilityOnly) {
      approvedNurses = approvedNurses.filter(n => n.availabilityStatus !== 'offline');
    }

    return approvedNurses.map(nurse => {
      let score = 70;
      const reasons: string[] = [];

      const isNurseRN = nurse.careLevel === 'registered_nurse' || !nurse.careLevel;
      const isGeriatric = nurse.careLevel === 'geriatric_caregiver' || nurse.careLevel === 'practical_nurse_aide';

      if (!hasClinicalTasks) {
        if (isGeriatric) {
          score += 25;
          reasons.push('⭐ Perfect Tier Match: Affordable Geriatric & ADL Aide');
          reasons.push(`💰 Minimal Care Rate: JMD $${nurse.hourlyRateJMD.toLocaleString()}/hr`);
        } else {
          score += 5;
          reasons.push('Clinical RN (Can perform supervision, at procedure rate)');
        }
      } else {
        if (isNurseRN) {
          score += 28;
          reasons.push('🩺 Required Tier: NCJ Registered Clinical Nurse');
          if (nurse.licenseVerified) reasons.push('🛡️ Verified NCJ License');
        } else {
          score -= 40;
          reasons.push('⚠️ Non-Clinical Aide (Cannot perform sterile procedures)');
        }
      }

      if (nurse.zones && nurse.zones.some(z => z.toLowerCase().includes(targetZone.toLowerCase()) || targetZone.toLowerCase().includes(z.toLowerCase()))) {
        score += 15;
        reasons.push(`📍 Covers ${targetZone}`);
      }

      if (nurse.rating >= 4.9) {
        score += 8;
        reasons.push(`⭐ Top Rated: ${nurse.rating}/5.0`);
      }

      // Availability status bonus
      const isOnCall = nurse.availabilityStatus !== 'offline';
      if (isOnCall) {
        score += 10;
        reasons.push('🟢 On-Call & Ready for Instant Booking');
      }

      const conflict = checkNurseBookingConflict(
        nurse.id,
        visitDate,
        visitTime,
        hoursNeeded * 60,
        allBookings
      );

      if (!conflict.isAvailable) {
        score -= 20;
      }

      return {
        nurse,
        score: Math.min(99, Math.max(30, score)),
        reasons,
        isAvailable: conflict.isAvailable,
        conflictingTimeRange: conflict.conflictingTimeRange,
        isOnCall
      };
    }).sort((a, b) => b.score - a.score);
  }, [nurses, availabilityOnly, hasClinicalTasks, targetZone, visitDate, visitTime, hoursNeeded, allBookings]);

  // Demo Handler to Toggle Nurse Availability (Interactive Switch)
  const handleToggleFirstNurseAvailability = () => {
    const targetNurse = nurses[0];
    if (!targetNurse) return;
    const isCurrentlyOnCall = targetNurse.availabilityStatus !== 'offline';
    const newStatus: 'on_call' | 'offline' = isCurrentlyOnCall ? 'offline' : 'on_call';

    if (newStatus === 'on_call') {
      soundFX.playAvailabilityOnCall();
      setLocalToggleNotice(`🟢 ${targetNurse.name} is now ON-CALL. Instantly eligible for dispatch in Kingston.`);
    } else {
      soundFX.playAvailabilityOffline();
      setLocalToggleNotice(`🌙 ${targetNurse.name} is now OFFLINE (Off-Duty). Scheduled bookings only.`);
    }

    if (onUpdateNurseProfile) {
      onUpdateNurseProfile({
        ...targetNurse,
        availabilityStatus: newStatus,
        lastAvailabilityToggleAt: new Date().toISOString()
      });
    }

    setTimeout(() => {
      setLocalToggleNotice(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BANNER & DISPATCH RADAR */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#1E1B4B]/30 to-red-950/50 backdrop-blur-2xl border border-white/15 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#1E1B4B]/25 to-[#F59E0B]/15 blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Smart Care Suggestions &amp; Jamaican Market Intelligence</span>
              </span>

              {/* Live On-Call Count Badge */}
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{onCallCount} Practitioners On-Call Ready</span>
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Fast Re-Booking &amp; Care Intelligence
            </h2>
            <p className="text-xs md:text-sm text-purple-100/90 leading-relaxed">
              Re-book your preferred caregiver in 1 tap based on past visits, explore what other Kingston families are booking, review what practitioners accept and make, or use the guided task matcher.
            </p>
          </div>

          {/* Quick Actions & Live Availability Filter Switch */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Live On-Call Filter Toggle */}
            <button
              type="button"
              onClick={() => {
                soundFX.playFilterSelect();
                setAvailabilityOnly(!availabilityOnly);
              }}
              className={`px-4 py-3 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-between sm:justify-center gap-3 shadow-lg ${
                availabilityOnly
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 shadow-emerald-950/50'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/20'
              }`}
              title="Toggle to show only practitioners currently on-call and ready for instant booking"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${availabilityOnly ? 'bg-white animate-ping' : 'bg-emerald-400'}`} />
                <span>{availabilityOnly ? '🟢 Showing On-Call Only' : 'Filter: On-Call Only'}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px] font-mono font-black">
                {availabilityOnly ? onCallCount : `${onCallCount}/${totalApprovedCount}`}
              </span>
            </button>

            {onOpenScopeModal && (
              <button
                type="button"
                onClick={onOpenScopeModal}
                className="px-3.5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white border border-white/15 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Info className="w-4 h-4" />
                <span>Scope Guide</span>
              </button>
            )}
          </div>
        </div>

        {/* Local Toggle Notification Alert */}
        {localToggleNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{localToggleNotice}</span>
          </div>
        )}

        {/* NAVIGATION SUB-TABS */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveSuggestionTab('frequent');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeSuggestionTab === 'frequent'
                ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-lg shadow-purple-950/60 border border-white/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Repeat className="w-4 h-4 text-[#C77DFF]" />
            <span>⚡ Frequent Bookings (1-Tap Re-Book)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {frequentPairs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveSuggestionTab('community');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeSuggestionTab === 'community'
                ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-lg shadow-purple-950/60 border border-white/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>🔥 What Other Clients Are Booking</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
              Popular
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveSuggestionTab('earnings_market');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeSuggestionTab === 'earnings_market'
                ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-lg shadow-purple-950/60 border border-white/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>📈 What Practitioners Accept &amp; Make</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
              85% Split
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveSuggestionTab('guided_matcher');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeSuggestionTab === 'guided_matcher'
                ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-lg shadow-purple-950/60 border border-white/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>🎯 Guided Need &amp; Task Customizer</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FREQUENT BOOKINGS & 1-TAP RE-BOOK (PAST HISTORY BASED) */}
      {/* ========================================================================= */}
      {activeSuggestionTab === 'frequent' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] backdrop-blur-xl p-4 rounded-2xl border border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[#C77DFF]" />
                <h3 className="font-extrabold text-white text-base">
                  Re-Book Your Preferred Caregiver in Seconds
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automatically calculated from your past visits. Tap any card below to schedule for tomorrow at 10:00 AM with 1 click.
              </p>
            </div>

            {/* Quick date & time editor for re-booking */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold pl-1">Slot:</span>
              <input
                type="date"
                value={quickRebookDate}
                onChange={(e) => setQuickRebookDate(e.target.value)}
                className="bg-purple-950/80 border border-purple-400/30 text-white rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
              />
              <input
                type="time"
                value={quickRebookTime}
                onChange={(e) => setQuickRebookTime(e.target.value)}
                className="bg-purple-950/80 border border-purple-400/30 text-white rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Frequent Booking Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {frequentPairs.map((pair, idx) => {
              const matchedNurse = nurses.find(n => n.id === pair.nurseId || n.name === pair.nurseName) || nurses[0];
              const matchedSrv = services.find(s => s.id === pair.serviceId || s.name === pair.serviceName) || services[0];
              const isOnCall = matchedNurse?.availabilityStatus !== 'offline';

              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 p-5 text-white transition-all hover:shadow-2xl hover:shadow-purple-950/40 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent blur-2xl pointer-events-none" />

                  <div className="space-y-3 relative z-10">
                    {/* Top Row: Frequency Badge & Availability Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-[#C77DFF] border border-purple-400/30 text-[11px] font-black flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        <span>Booked {pair.count}x with you</span>
                      </span>

                      {isOnCall ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>On-Call</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                          <Moon className="w-2.5 h-2.5 text-slate-400" />
                          <span>Scheduled</span>
                        </span>
                      )}
                    </div>

                    {/* Practitioner Header */}
                    <div className="flex items-center gap-3">
                      <img
                        src={matchedNurse?.photoUrl || pair.nursePhoto}
                        alt={pair.nurseName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 shadow-md shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-white text-sm truncate group-hover:text-purple-200 transition">
                          {pair.nurseName}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <CaregiverTierBadge
                            nurse={matchedNurse}
                            size="xs"
                            variant="pill"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{matchedNurse?.rating || '5.0'} Rating</span>
                          <span className="text-slate-600">•</span>
                          <MapPin className="w-3 h-3 text-[#F59E0B]" />
                          <span className="truncate">{pair.zone}</span>
                        </span>
                      </div>
                    </div>

                    {/* Service Block */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ServiceLogo service={matchedSrv} size="xs" showBadge={false} />
                          <span className="font-bold text-white text-xs truncate">
                            {pair.serviceName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-purple-300" />
                          <span>{pair.baseDurationMinutes} mins standard</span>
                        </span>
                        <span className="font-black text-emerald-400 text-xs">
                          JMD ${pair.lastPriceJMD.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {pair.notes && (
                      <p className="text-[11px] text-slate-300 italic line-clamp-2 px-1">
                        &ldquo;{pair.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* 1-Tap Re-Book Button */}
                  <div className="pt-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playSuccessPing();
                        onSelectAndBook(
                          matchedNurse,
                          matchedSrv,
                          pair.baseDurationMinutes,
                          quickRebookDate,
                          quickRebookTime,
                          pair.zone,
                          pair.notes || `Re-booking regular ${pair.serviceName} routine.`
                        );
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] via-purple-600 to-[#F59E0B] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-950/60 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                      <span>1-Tap Re-Book for {quickRebookDate}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WHAT OTHER CLIENTS ARE BOOKING (COMMUNITY TRENDS) */}
      {/* ========================================================================= */}
      {activeSuggestionTab === 'community' && (
        <div className="space-y-6">
          <div className="bg-white/[0.03] backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">
                  What Other Families Are Booking in Kingston &amp; St. Andrew
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Real community booking patterns, highest rehire rates, and verified caregiver matches across Mona, Barbican, and Portmore.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">
                98.4% 5-Star Jamaican Rehire Rate
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {communityTrending.map((trend) => {
              const matchedNurse = nurses.find(n => n.id === trend.nurseId) || nurses[0];
              const matchedSrv = services.find(s => s.id === trend.serviceId) || services[0];
              const isOnCall = matchedNurse?.availabilityStatus !== 'offline';

              return (
                <div
                  key={trend.id}
                  className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-amber-400/40 p-5 md:p-6 text-white transition-all hover:shadow-2xl hover:shadow-amber-950/30 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3.5">
                    {/* Top Tag & Stats Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{trend.tag}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {isOnCall ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>Ready Now</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Pre-Schedule
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[#C77DFF] border border-purple-400/30 text-[10px] font-bold">
                          {trend.bookingsThisMonth} booked this month
                        </span>
                      </div>
                    </div>

                    {/* Service & Practitioner Header */}
                    <div className="flex items-start gap-4">
                      <img
                        src={trend.nursePhoto}
                        alt={trend.nurseName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-white text-base leading-tight group-hover:text-amber-200 transition">
                          {trend.serviceName}
                        </h4>
                        <p className="text-xs text-purple-200/90 font-medium mt-0.5">
                          Caregiver: <strong className="text-white">{trend.nurseName}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {trend.qualification}
                        </p>
                      </div>
                    </div>

                    {/* Social proof metric badges */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 px-3 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Rehire Rate</span>
                        <span className="font-black text-emerald-400">{trend.rehireRate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Avg Response</span>
                        <span className="font-black text-cyan-300">{trend.avgResponseMinutes} mins</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Hourly Rate</span>
                        <span className="font-black text-white">JMD ${trend.priceJMD.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Location & Client Review Snippet */}
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                        <span>Most popular in: <strong className="text-slate-200">{trend.parishArea}</strong></span>
                      </div>
                      <p className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-purple-100/90 italic leading-relaxed">
                        {trend.reviewSnippet}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    {onViewProfile && (
                      <button
                        type="button"
                        onClick={() => onViewProfile(matchedNurse)}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold border border-white/15 transition"
                      >
                        Profile
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playSuccessPing();
                        onSelectAndBook(
                          matchedNurse,
                          matchedSrv,
                          matchedSrv.durationMinutes || 60,
                          quickRebookDate,
                          quickRebookTime,
                          currentZone || 'New Kingston',
                          `Requested popular community match: ${trend.serviceName} with ${trend.nurseName}`
                        );
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Book This Popular Match</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WHAT PRACTITIONERS ACCEPT & ARE MAKING (MARKET INTELLIGENCE) */}
      {/* ========================================================================= */}
      {activeSuggestionTab === 'earnings_market' && (
        <div className="space-y-6">
          {/* Transparency Highlights Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-purple-950/60 backdrop-blur-xl border border-emerald-500/30 text-white shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase tracking-wider">
                    Fair Jamaican Caregiver Economy
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">
                    Direct Bank &amp; Lynk Payouts
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                  Practitioner Acceptance &amp; Fair Earnings Transparency
                </h3>
                <p className="text-xs text-emerald-100/90 max-w-2xl mt-1 leading-relaxed">
                  We believe in 100% pay transparency. In Jamaica, home nurses and geriatric caregivers receive <strong>85% Net Split</strong> directly to NCB, Scotiabank, JN Bank, or Lynk wallet within 24 hours of completing a visit. This is why our practitioners respond and accept requests within 3.5 minutes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 text-center shrink-0">
                <span className="text-[10px] text-emerald-300 uppercase font-black tracking-widest block">
                  Platform Fee
                </span>
                <span className="text-2xl md:text-3xl font-black text-white">15%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">85% to Practitioner</span>
              </div>
            </div>

            {/* Key Acceptance Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-emerald-500/20 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-semibold">Kingston Acceptance</span>
                <span className="text-base font-black text-emerald-300">96.4%</span>
                <span className="text-[10px] text-slate-300 block">Accepted in &lt; 5 mins</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-semibold">Fastest Response</span>
                <span className="text-base font-black text-cyan-300">2.4 mins</span>
                <span className="text-[10px] text-slate-300 block">For 1-hr &amp; 2-hr slots</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-semibold">Top Acceptance Category</span>
                <span className="text-base font-black text-amber-300">99.1% ADLs</span>
                <span className="text-[10px] text-slate-300 block">Bathing &amp; Senior Sitting</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-semibold">Avg Monthly Nurse Payout</span>
                <span className="text-base font-black text-purple-300">JMD $145,000</span>
                <span className="text-[10px] text-slate-300 block">Part-time flexibility</span>
              </div>
            </div>
          </div>

          {/* Rate Card & Earnings Breakdown Table */}
          <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 md:p-6 text-white space-y-4">
            <h4 className="font-extrabold text-base text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Standard Hourly Rate Card &amp; Net Caregiver Take-Home (JMD)</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Caregiver Level / Qualification</th>
                    <th className="py-3 px-4">Standard Rate / Hour</th>
                    <th className="py-3 px-4">Platform Escrow Fee (15%)</th>
                    <th className="py-3 px-4 text-emerald-300 font-black">Practitioner Net Take-Home (85%)</th>
                    <th className="py-3 px-4">Common Procedures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <tr className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-cyan-400" />
                      <span>Geriatric Care Assistant (GCA)</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">JMD $3,200 – $4,500</td>
                    <td className="py-3 px-4 text-slate-400">JMD $480 – $675</td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-400">JMD $2,720 – $3,825 / hr</td>
                    <td className="py-3 px-4 text-slate-400">Supervision, companionship, sponge bath, vitals log</td>
                  </tr>

                  <tr className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Practical Nurse Aide (PNA)</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">JMD $4,500 – $5,500</td>
                    <td className="py-3 px-4 text-slate-400">JMD $675 – $825</td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-400">JMD $3,825 – $4,675 / hr</td>
                    <td className="py-3 px-4 text-slate-400">Wheelchair transfers, fall prevention, ADL routine</td>
                  </tr>

                  <tr className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Registered Clinical Nurse (NCJ RN)</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">JMD $6,500 – $8,500</td>
                    <td className="py-3 px-4 text-slate-400">JMD $975 – $1,275</td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-400">JMD $5,525 – $7,225 / hr</td>
                    <td className="py-3 px-4 text-slate-400">Sterile surgical wounds, IV cannulation, injections</td>
                  </tr>

                  <tr className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Advanced Practice Registered Nurse (APRN)</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">JMD $9,500 – $14,000</td>
                    <td className="py-3 px-4 text-slate-400">JMD $1,425 – $2,100</td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-400">JMD $8,075 – $11,900 / hr</td>
                    <td className="py-3 px-4 text-slate-400">Specialized clinical assessments &amp; neonatal fundal review</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Recent Accepted Visits Ticker */}
          <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 md:p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="font-extrabold text-base text-white">
                  Live Jamaican Dispatch Stream: Recently Accepted Visits
                </h4>
              </div>
              <span className="text-xs text-slate-400">Updated Real-Time</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {RECENT_ACCEPTED_MARKET_VISITS.map((visit) => (
                <div
                  key={visit.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-white text-sm block">
                        {visit.serviceName}
                      </span>
                      <span className="text-xs text-purple-300 font-medium">
                        {visit.nurseName} • {visit.careLevel}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black">
                      Accepted {visit.acceptedMinsAgo}m ago
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#F59E0B]" />
                      <span>{visit.zone}</span>
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Practitioner Earns (85%)</span>
                      <span className="font-black text-emerald-400 font-mono text-sm">
                        JMD ${visit.practitionerNetJMD.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GUIDED NEED & TASK CUSTOMIZER (PRESET SCENARIOS & MATCHER) */}
      {/* ========================================================================= */}
      {activeSuggestionTab === 'guided_matcher' && (
        <div className="space-y-6">
          {/* Presets Row */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C77DFF]" />
                Select a Common Jamaican Care Scenario
              </h3>
              <span className="text-xs text-slate-400">Click to load checklist</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_SCENARIOS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-900/60 to-[#1E1B4B]/40 border-purple-400 text-white shadow-lg shadow-purple-950/50'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                      <span className="text-[11px] font-extrabold text-slate-300">
                        {preset.hours} hr{preset.hours > 1 ? 's' : ''}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white leading-snug">
                      {preset.label}
                    </h4>
                    <p className="text-xs text-slate-300/80 mt-1 line-clamp-2">
                      {preset.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Needs Customizer & Tier Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Checklist of Tasks & Patient State */}
            <div className="lg:col-span-2 space-y-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 md:p-6 text-white">
              <div>
                <h4 className="font-bold text-base text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Customize Specific Care Tasks Needed
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Check all tasks required. If clinical procedures are selected, the system will ensure only active NCJ Registered Nurses are recommended.
                </p>
              </div>

              {/* Task Chips */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Non-Invasive ADL &amp; Companion Tasks (Affordable Caregiver Tier)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_TASKS.filter(t => !t.isClinical).map(task => {
                      const isChecked = selectedTasks.includes(task.id);
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className={`p-2.5 rounded-xl text-left text-xs font-medium border transition flex items-center justify-between gap-2 ${
                            isChecked
                              ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 font-bold'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span>{task.label}</span>
                          <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isChecked ? 'bg-cyan-400 text-black' : 'border border-slate-600'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-red-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                    Clinical Procedures (Strictly Requires NCJ Registered Nurse)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_TASKS.filter(t => t.isClinical).map(task => {
                      const isChecked = selectedTasks.includes(task.id);
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className={`p-2.5 rounded-xl text-left text-xs font-medium border transition flex items-center justify-between gap-2 ${
                            isChecked
                              ? 'bg-red-500/20 border-red-400/60 text-red-200 font-bold'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span>{task.label}</span>
                          <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isChecked ? 'bg-red-400 text-white' : 'border border-slate-600'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Schedule & Location Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Duration Needed
                  </label>
                  <select
                    value={hoursNeeded}
                    onChange={(e) => setHoursNeeded(Number(e.target.value))}
                    className="w-full bg-purple-950/80 border border-purple-400/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value={1}>1 Hour (Minimal Check-in)</option>
                    <option value={2}>2 Hours (Morning Routine)</option>
                    <option value={3}>3 Hours (Respite Relief)</option>
                    <option value={4}>4 Hours (Half Day Sitting)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Target Area in Jamaica
                  </label>
                  <select
                    value={targetZone}
                    onChange={(e) => setTargetZone(e.target.value)}
                    className="w-full bg-purple-950/80 border border-purple-400/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <optgroup label="Kingston & St. Andrew">
                      {KINGSTON_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </optgroup>
                    <optgroup label="Portmore">
                      {PORTMORE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </optgroup>
                    <optgroup label="Spanish Town">
                      {SPANISH_TOWN_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Date &amp; Time
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-2/3 bg-purple-950/80 border border-purple-400/30 rounded-xl px-2 py-2 text-[11px] text-white focus:outline-none"
                    />
                    <input
                      type="time"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      className="w-1/3 bg-purple-950/80 border border-purple-400/30 rounded-xl px-2 py-2 text-[11px] text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Intelligent Tier Recommendation Box */}
            <div className="rounded-3xl bg-gradient-to-br from-purple-950/80 via-[#1E1B4B]/30 to-black/60 backdrop-blur-xl border border-purple-400/30 p-5 md:p-6 text-white space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Care Engine Match</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Recommended Care Level
                  </span>
                  <h4 className="text-base font-extrabold text-white">
                    {recommendedTier.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {recommendedTier.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{recommendedTier.savingsNote}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-slate-300">Target Duration:</span>
                  <span className="font-extrabold text-white">{hoursNeeded} Hour{hoursNeeded > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Estimated Total:</span>
                  <span className="font-extrabold text-[#C77DFF] text-base">
                    JMD ${(hoursNeeded * (recommendedTier.isClinical ? 7500 : 3200)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-white/5 p-3 rounded-xl">
                <span>Tip: You can change specific tasks or switch to any licensed practitioner below.</span>
              </div>
            </div>
          </div>

          {/* Ranked Practitioners for this Custom Need */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Top Recommended Caregivers for this Need ({rankedCaregivers.length})</span>
              </h3>

              <span className="text-xs text-slate-400">
                Sorted by Tier Match &amp; Proximity
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(rankedCaregivers || []).slice(0, 6).map(({ nurse, score, reasons, isAvailable, conflictingTimeRange, isOnCall }) => {
                const hourlyRate = nurse.hourlyRateJMD || (nurse.careLevel === 'registered_nurse' ? 7500 : 3200);
                const estimatedTotal = hourlyRate * hoursNeeded;

                return (
                  <div
                    key={nurse.id}
                    className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 text-white transition flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                            score >= 85
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                              : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                          }`}>
                            {score}% Match
                          </span>

                          {isOnCall ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              <span>On-Call</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              Offline
                            </span>
                          )}
                        </div>

                        {isAvailable ? (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Available {visitTime}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400">
                            Busy {conflictingTimeRange}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={nurse.photoUrl}
                          alt={nurse.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 shadow-md shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-white text-sm truncate group-hover:text-purple-200 transition">
                            {nurse.name}
                          </h4>
                          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                            {nurse.qualificationTitle || 'Certified Healthcare Professional'} • {nurse.yearsExperience} yrs exp
                          </p>
                          <span className="text-[11px] text-amber-300 flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{nurse.rating || '5.0'} ({nurse.reviewCount} reviews)</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(reasons || []).slice(0, 3).map((r, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Total for {hoursNeeded} hr{hoursNeeded > 1 ? 's' : ''}
                        </span>
                        <span className="text-base font-black text-[#C77DFF]">
                          JMD ${estimatedTotal.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onViewProfile && (
                          <button
                            type="button"
                            onClick={() => onViewProfile(nurse)}
                            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition"
                          >
                            Profile
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playSuccessPing();
                            onSelectAndBook(
                              nurse,
                              matchedService,
                              hoursNeeded * 60,
                              visitDate,
                              visitTime,
                              targetZone,
                              customNotes
                            );
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-purple-950/40 transition flex items-center gap-1.5"
                        >
                          <span>Select &amp; Book</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
