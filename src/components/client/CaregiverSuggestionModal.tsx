import React, { useState, useMemo } from 'react';
import { NurseProfile, ServiceItem, Booking, NurseCareLevel } from '../../types';
import { CaregiverTierBadge } from '../common/CaregiverTierBadge';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';
import { ServiceLogo } from '../common/ServiceLogo';
import { KINGSTON_ZONES, PORTMORE_ZONES, SPANISH_TOWN_ZONES, ALL_SERVICE_ZONES } from '../../data/mockData';
import { checkNurseBookingConflict } from '../../utils/bookingAvailability';
import { soundFX } from '../../utils/soundEffects';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  HeartHandshake, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  DollarSign, 
  Star, 
  ChevronRight, 
  ArrowLeft, 
  UserCheck, 
  Activity, 
  Smile, 
  ShieldAlert, 
  Calendar,
  Layers,
  Zap,
  Info,
  Check,
  Award
} from 'lucide-react';

interface CaregiverSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

// Preset Quick Scenarios
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
    tagline: 'Affordable check-in, watchful companionship & conversation',
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
  },
  {
    id: 'mother_newborn',
    label: 'Postnatal Mother & Newborn Baby Care',
    tagline: 'C-section incision review, infant cord care & lactation support',
    badge: 'NCJ Midwife / RN Tier',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
    tasks: ['postnatal_maternal', 'newborn_cord', 'lactation_support'],
    patientState: 'mild_assistance',
    hours: 1,
    expectedTier: 'registered_nurse',
    serviceId: 'srv-5',
    description: 'Compassionate maternal recovery support, latching coaching, and infant umbilical care by a licensed Registered Midwife/Nurse.'
  }
];

const AVAILABLE_TASKS = [
  // Non-Invasive Tasks (Geriatric Aide / Practical Nurse)
  { id: 'supervision', label: '1-Hour Daytime Supervision & Watch', category: 'minimal', isClinical: false },
  { id: 'companionship', label: 'Conversational Companionship & Games', category: 'minimal', isClinical: false },
  { id: 'vitals_basic', label: 'Basic Vitals Log (BP, Pulse, Temp)', category: 'minimal', isClinical: false },
  { id: 'bathing_hygiene', label: 'Assisted Bathing & Sponge Bath', category: 'minimal', isClinical: false },
  { id: 'dressing', label: 'Assisted Dressing & Morning Routine', category: 'minimal', isClinical: false },
  { id: 'meal_prep', label: 'Light Meal Preparation & Feeding', category: 'minimal', isClinical: false },
  { id: 'hydration_meal_reminder', label: 'Hydration & Pre-sorted Pill Reminder', category: 'minimal', isClinical: false },
  { id: 'mobility_transfer', label: 'Safe Bed-to-Chair / Wheelchair Transfer', category: 'minimal', isClinical: false },
  { id: 'fall_prevention', label: 'Gentle Walking & Fall Prevention', category: 'minimal', isClinical: false },
  { id: 'light_tidying', label: 'Patient Area Sanitizing & Linen Change', category: 'minimal', isClinical: false },

  // Clinical Tasks (NCJ Registered Nurse Required)
  { id: 'sterile_wound', label: 'Sterile Surgical Wound Dressing / Cleansing', category: 'clinical', isClinical: true },
  { id: 'suture_check', label: 'Suture / Staple Healing Assessment', category: 'clinical', isClinical: true },
  { id: 'iv_cannula', label: 'Doctor-Prescribed IV Cannulation', category: 'clinical', isClinical: true },
  { id: 'iv_infusion', label: 'IV Hydration / Antibiotic Infusion', category: 'clinical', isClinical: true },
  { id: 'injections', label: 'Prescription Injections (IM / SC)', category: 'clinical', isClinical: true },
  { id: 'catheter_care', label: 'Catheter Flush or Stoma Tube Care', category: 'clinical', isClinical: true },
  { id: 'postnatal_maternal', label: 'Postpartum Incision / Fundal Exam', category: 'clinical', isClinical: true },
  { id: 'newborn_cord', label: 'Newborn Cord Care & Jaundice Screening', category: 'clinical', isClinical: true }
];

export const CaregiverSuggestionModal: React.FC<CaregiverSuggestionModalProps> = ({
  isOpen,
  onClose,
  nurses,
  services,
  allBookings,
  currentZone,
  onSelectAndBook,
  onViewProfile,
  onOpenScopeModal
}) => {
  // Wizard Step
  const [activeStep, setActiveStep] = useState<'requirements' | 'results'>('requirements');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('elderly_supervision_1hr');
  
  // Requirements State
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
  const [budgetPriority, setBudgetPriority] = useState<'best_value' | 'balanced' | 'clinical_rigor'>('best_value');
  const [customNotes, setCustomNotes] = useState<string>('Looking for 1 hour of patient supervision and companion care for an elderly relative.');
  const [onlyOnCall, setOnlyOnCall] = useState<boolean>(false);

  // Handle Preset Change
  const handleSelectPreset = (preset: PresetScenario) => {
    setSelectedPresetId(preset.id);
    setSelectedTasks(preset.tasks);
    setPatientState(preset.patientState);
    setHoursNeeded(preset.hours);
    setCustomNotes(preset.description);
    soundFX.playPop();
  };

  // Toggle Task
  const toggleTask = (taskId: string) => {
    soundFX.playPop();
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(t => t !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  // Check if any selected task requires clinical NCJ RN
  const hasClinicalTasks = useMemo(() => {
    return selectedTasks.some(t => {
      const taskDef = AVAILABLE_TASKS.find(item => item.id === t);
      return taskDef?.isClinical;
    });
  }, [selectedTasks]);

  // Determine Recommended Care Tier
  const recommendedTier: {
    level: NurseCareLevel;
    title: string;
    description: string;
    savingsNote?: string;
    rateRangeJMD: string;
    isClinical: boolean;
  } = useMemo(() => {
    if (hasClinicalTasks) {
      return {
        level: 'registered_nurse',
        title: 'NCJ Registered Nurse (Clinical Procedure Tier)',
        description: 'Because your requirements include sterile clinical care (wound dressing, IV therapy, or injections), an active NCJ Registered Nurse is legally required to guarantee safety and sterile infection control.',
        rateRangeJMD: 'JMD $7,500 – $8,800/visit',
        isClinical: true
      };
    }

    if (patientState === 'bedridden_wheelchair' || selectedTasks.includes('mobility_transfer')) {
      return {
        level: 'practical_nurse_aide',
        title: 'Certified Practical Nurse Aide (Mobility & ADL Tier)',
        description: 'For bed transfers, gentle rehabilitation walking, and fall prevention, a Certified Practical Care Aide provides safe physical support at a very economical rate.',
        savingsNote: 'Saves ~60% compared to hospital RN rates',
        rateRangeJMD: 'JMD $3,000/hr',
        isClinical: false
      };
    }

    // Default minimal / companion care
    return {
      level: 'geriatric_caregiver',
      title: 'Certified Geriatric Care Aide (Affordable Minimal Care Tier)',
      description: 'For 1-hour supervision, senior companionship, bathing, and non-invasive vitals, a Certified Geriatric Caregiver is the ideal match — providing warm, dignified bedside care while saving you up to 60% in costs!',
      savingsNote: 'Affordable minimal rate • Perfect for 1-hour elderly sitting & companionship',
      rateRangeJMD: 'JMD $3,000 – $3,200/hr',
      isClinical: false
    };
  }, [hasClinicalTasks, patientState, selectedTasks]);

  // Match the best service item
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

  // Calculate Matches & Ranked Caregivers
  const rankedCaregivers = useMemo(() => {
    const approvedNurses = nurses.filter(n => n.status === 'approved');

    return approvedNurses.map(nurse => {
      let score = 70;
      const reasons: string[] = [];

      // 1. Tier Match
      const isNurseRN = nurse.careLevel === 'registered_nurse' || !nurse.careLevel;
      const isGeriatric = nurse.careLevel === 'geriatric_caregiver' || nurse.careLevel === 'practical_nurse_aide';

      if (!hasClinicalTasks) {
        // Minimal care / elderly supervision requested
        if (isGeriatric) {
          score += 25;
          reasons.push('⭐ Perfect Tier Match: Affordable Geriatric & ADL Aide');
          reasons.push(`💰 Minimal Care Rate: JMD $${nurse.hourlyRateJMD.toLocaleString()}/hr`);
        } else {
          // RN available, but higher rate
          score += 5;
          reasons.push('Clinical RN (Can perform supervision, but charges clinical procedure rates)');
        }
      } else {
        // Clinical task requested
        if (isNurseRN) {
          score += 28;
          reasons.push('🛡️ Fully Licensed NCJ Registered Nurse for Sterile Clinical Procedures');
        } else {
          score -= 35;
          reasons.push('⚠️ Non-NCJ Aide: Cannot perform invasive sterile clinical procedures');
        }
      }

      // 2. Zone Proximity Match
      const inExactZone = nurse.zones.some(z => z.toLowerCase() === targetZone.toLowerCase());
      const inSameParish = nurse.zones.some(z => {
        if (targetZone.startsWith('Portmore') && z.startsWith('Portmore')) return true;
        if (targetZone.startsWith('Spanish Town') && z.startsWith('Spanish Town')) return true;
        if (!targetZone.startsWith('Portmore') && !targetZone.startsWith('Spanish Town') && !z.startsWith('Portmore') && !z.startsWith('Spanish Town')) return true;
        return false;
      });

      if (inExactZone) {
        score += 15;
        reasons.push(`📍 Based directly in your neighborhood (${targetZone})`);
      } else if (inSameParish) {
        score += 8;
        reasons.push(`📍 Covers surrounding ${targetZone.split(' - ')[0]} area`);
      }

      // 3. Availability Check for Target Date & Time
      const durationMins = hoursNeeded * 60;
      const conflict = checkNurseBookingConflict(
        nurse.id,
        visitDate,
        visitTime,
        durationMins,
        allBookings
      );

      if (conflict.isAvailable) {
        score += 10;
        reasons.push(`✅ Available on ${visitDate} at ${visitTime}`);
      } else {
        score -= 20;
        reasons.push(`⚠️ Busy from ${conflict.conflictingTimeRange} (Alternative: ${(conflict.suggestedTimes || []).slice(0, 2).join(', ')})`);
      }

      // 4. Rating & Experience
      if (nurse.rating >= 4.9) score += 5;
      if (nurse.yearsExperience >= 5) score += 4;

      // 5. Budget Priority Alignment
      if (budgetPriority === 'best_value' && nurse.hourlyRateJMD <= 3500) {
        score += 10;
        reasons.push('🏷️ Best Value Budget Pick');
      }

      // Live On-Call availability weighting
      const isOnCall = nurse.availabilityStatus !== 'offline';
      if (isOnCall) {
        score += 12;
        reasons.push('🟢 On-Call (Dispatch Ready)');
      } else {
        score -= 20;
        reasons.push('🌙 Offline / Off-Duty (Accepts Advance Bookings)');
      }

      // Clamp between 50% and 99%
      const matchPercentage = Math.min(99, Math.max(50, Math.round(score)));
      const estimatedTotal = nurse.hourlyRateJMD * hoursNeeded;

      return {
        nurse,
        matchPercentage,
        reasons,
        isAvailable: conflict.isAvailable,
        conflictingTimeRange: conflict.conflictingTimeRange,
        suggestedTimes: conflict.suggestedTimes,
        estimatedTotal,
        hourlyRate: nurse.hourlyRateJMD,
        isOnCall
      };
    })
    .filter(item => !onlyOnCall || item.isOnCall)
    .sort((a, b) => {
      // Sort by on-call readiness, then conflict availability, then match score
      if (a.isOnCall !== b.isOnCall) return a.isOnCall ? -1 : 1;
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      return b.matchPercentage - a.matchPercentage;
    });
  }, [nurses, hasClinicalTasks, patientState, targetZone, visitDate, visitTime, hoursNeeded, budgetPriority, allBookings, onlyOnCall]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0312]/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="bg-[#150722]/95 border border-purple-500/30 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl text-white my-6 relative overflow-hidden backdrop-blur-2xl">
        
        {/* Glow accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#1E1B4B]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#F59E0B]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] flex items-center justify-center shadow-lg shadow-purple-900/50 text-white shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-[#C77DFF] border border-purple-400/30 text-[10px] font-extrabold uppercase tracking-wider">
                  Smart Caregiver Recommendation Wizard
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Instant Match
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Find the Right Nurse or Caregiver for Your Exact Needs
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Tell us what tasks you need — we will automatically suggest whether an affordable Geriatric Aide or Clinical RN is right for you, preventing overpaying for simple supervision.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Navigation Progress */}
        <div className="flex items-center justify-between mt-4 mb-5 border-b border-white/10 pb-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveStep('requirements')}
              className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl transition ${
                activeStep === 'requirements'
                  ? 'bg-purple-600/40 text-purple-200 border border-purple-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-purple-500/30 text-xs flex items-center justify-center font-bold">1</span>
              <span>1. Enter Care Requirements</span>
            </button>

            <span className="text-slate-600">→</span>

            <button
              onClick={() => {
                setActiveStep('results');
                soundFX.playSuccessPing();
              }}
              className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl transition ${
                activeStep === 'results'
                  ? 'bg-purple-600/40 text-purple-200 border border-purple-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-purple-500/30 text-xs flex items-center justify-center font-bold">2</span>
              <span>2. Recommended Caregivers ({rankedCaregivers.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Jamaica Healthcare &amp; MOHW Tier Compliant</span>
          </div>
        </div>

        {/* STEP 1: REQUIREMENTS INPUT */}
        {activeStep === 'requirements' && (
          <div className="space-y-6 max-h-[68vh] overflow-y-auto pr-1">
            
            {/* Quick Scenario Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Choose a Common Request Scenario (1-Click Fill):</span>
                </label>
                <span className="text-[10px] text-purple-300">Click any preset to auto-configure</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {PRESET_SCENARIOS.map(preset => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden group ${
                        isSelected
                          ? 'bg-purple-900/40 border-[#C77DFF] shadow-lg shadow-purple-900/30'
                          : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${preset.badgeColor}`}>
                            {preset.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{preset.hours} hr</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <ServiceLogo serviceId={preset.serviceId} size="xs" showBadge={false} />
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-purple-200 transition">
                              {preset.label}
                            </h4>
                            <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                              {preset.tagline}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Task Selection (Minimal Care vs Clinical Care Breakdown) */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Select Specific Care Tasks Needed:</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Minimal tasks use low-cost Geriatric Aides. Selecting clinical items automatically recommends an NCJ Registered Nurse.
                  </p>
                </div>

                {hasClinicalTasks ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 shrink-0">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    Clinical RN Required
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shrink-0">
                    <HeartHandshake className="w-3 h-3 text-cyan-400" />
                    Affordable Geriatric Tier
                  </span>
                )}
              </div>

              {/* Minimal / Non-Invasive Care Tasks */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block mb-2">
                  🟢 Non-Invasive / Geriatric ADL Tasks (Non-NCJ Affordable Tier • JMD $2,800 - $3,500/hr)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_TASKS.filter(t => !t.isClinical).map(task => {
                    const isChecked = selectedTasks.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                          isChecked
                            ? 'bg-cyan-950/40 border-cyan-400/50 text-cyan-100 shadow-xs'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-white/20 bg-white/5'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="leading-tight">{task.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Licensed Clinical Procedures */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-300 block mb-2">
                  🔴 Licensed Clinical Procedures (NCJ Registered Nurse Strictly Required • JMD $6,500 - $8,800/visit)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_TASKS.filter(t => t.isClinical).map(task => {
                    const isChecked = selectedTasks.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                          isChecked
                            ? 'bg-red-950/40 border-red-400/50 text-red-100 shadow-xs'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-red-500 border-red-400 text-white' : 'border-white/20 bg-white/5'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="leading-tight">{task.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Visit Details & Location Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Hours of Care Needed
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 8].map(hrs => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => {
                        setHoursNeeded(hrs);
                        soundFX.playPop();
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        hoursNeeded === hrs
                          ? 'bg-[#1E1B4B] text-white border-purple-400 shadow-xs'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {hrs} hr{hrs > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-purple-300 block mt-1">
                  {hoursNeeded === 1 ? '💡 1-Hour check-in & supervision' : `${hoursNeeded} hours continuous bedside care`}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Patient Mobility State
                </label>
                <select
                  value={patientState}
                  onChange={(e) => setPatientState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/15 bg-[#170826] text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="independent_watch">Independent / Needs Watch &amp; Company</option>
                  <option value="mild_assistance">Mild Assist (Walking &amp; Grooming)</option>
                  <option value="bedridden_wheelchair">Bedridden / Wheelchair Transfer</option>
                  <option value="dementia_alzheimers">Dementia / Memory Support</option>
                  <option value="post_surgical">Post-Surgical Hospital Discharge</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Jamaica Parish / Neighborhood
                </label>
                <select
                  value={targetZone}
                  onChange={(e) => setTargetZone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/15 bg-[#170826] text-white text-xs font-semibold focus:outline-none"
                >
                  <optgroup label="📍 Kingston & St Andrew">
                    {KINGSTON_ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </optgroup>
                  <optgroup label="📍 Portmore">
                    {PORTMORE_ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </optgroup>
                  <optgroup label="📍 Spanish Town">
                    {SPANISH_TOWN_ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Date & Time Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Preferred Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:ring-2 focus:ring-blue-500/50 focus:outline-none [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Preferred Time</label>
                <input
                  type="time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:ring-2 focus:ring-[#1E1B4B]/50 focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Additional Notes or Special Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. My grandmother needs companionship for an hour while I run errands in Kingston, check her blood pressure and make sure she has lunch..."
                className="w-full p-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#1E1B4B]/50 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: RANKED CAREGIVER RESULTS */}
        {activeStep === 'results' && (
          <div className="space-y-5 max-h-[68vh] overflow-y-auto pr-1 animate-fadeIn">
            
            {/* Recommendation Analysis Banner */}
            <div className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-xl ${
              recommendedTier.isClinical
                ? 'bg-red-950/40 border-red-500/40 text-red-200'
                : 'bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-slate-900/60 border-cyan-400/40 text-cyan-100'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-2xl border ${
                    recommendedTier.isClinical
                      ? 'bg-red-500/20 text-red-400 border-red-400/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
                  }`}>
                    {recommendedTier.isClinical ? <ShieldAlert className="w-6 h-6" /> : <HeartHandshake className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300">
                        Recommendation Analysis
                      </span>
                      {recommendedTier.savingsNote && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold">
                          {recommendedTier.savingsNote}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                      {recommendedTier.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                      {recommendedTier.description}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
                  <span className="text-[10px] text-slate-400 block font-semibold">Tier Rate Range</span>
                  <span className="text-sm font-black text-[#C77DFF]">{recommendedTier.rateRangeJMD}</span>
                  <span className="text-[10px] text-emerald-300 block font-bold mt-0.5">
                    Est. Total for {hoursNeeded} hr{hoursNeeded > 1 ? 's' : ''}: JMD ${((recommendedTier.isClinical ? 7500 : 3200) * hoursNeeded).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Results Filter & Count Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300 px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white">Suggested Practitioners Ranked for You:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-[10px] font-bold border border-purple-400/30">
                  {rankedCaregivers.length} matches in {targetZone}
                </span>

                <button
                  type="button"
                  onClick={() => setOnlyOnCall(prev => !prev)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    onlyOnCall
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-xs'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                  title="Toggle between all matching practitioners and only on-call dispatch-ready practitioners"
                >
                  <span className={`w-2 h-2 rounded-full ${onlyOnCall ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <span>🟢 {onlyOnCall ? 'Showing On-Call Only' : 'Filter On-Call Only'}</span>
                </button>
              </div>

              <button
                onClick={() => setActiveStep('requirements')}
                className="text-xs text-purple-300 hover:text-white font-bold transition flex items-center gap-1 self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Adjust Requirements
              </button>
            </div>

            {/* List of Ranked Practitioner Cards */}
            <div className="space-y-3.5">
              {rankedCaregivers.map(({ nurse, matchPercentage, reasons, isAvailable, conflictingTimeRange, suggestedTimes, estimatedTotal, hourlyRate, isOnCall }) => {
                const isGeriatric = nurse.careLevel === 'geriatric_caregiver' || nurse.careLevel === 'practical_nurse_aide';
                const isRN = nurse.careLevel === 'registered_nurse';

                return (
                  <div
                    key={nurse.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition relative overflow-hidden group ${
                      matchPercentage >= 90
                        ? 'bg-gradient-to-r from-purple-950/40 via-white/[0.04] to-slate-950/40 border-purple-500/40 shadow-lg'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Nurse Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={nurse.photoUrl}
                            alt={nurse.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-purple-400/30 shadow-md"
                          />
                          {isOnCall ? (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#150722] flex items-center justify-center shadow-sm" title="On-Call (Dispatch Ready)">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </span>
                          ) : (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-700 border-2 border-[#150722] flex items-center justify-center shadow-sm" title="Offline (Off-Duty)">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <CaregiverTierBadge
                              careLevel={nurse.careLevel}
                              size="xs"
                              variant="badge"
                            />

                            {/* Live On-Call / Offline badge */}
                            {isOnCall ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                On-Call
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                Offline
                              </span>
                            )}
                            
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              matchPercentage >= 90
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                                : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                            }`}>
                              {matchPercentage}% Match
                            </span>

                            {isAvailable ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                ✅ Available {visitTime}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                ⚠️ Busy {conflictingTimeRange}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-purple-200 transition">
                            {nurse.name}
                          </h4>

                          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                            {nurse.qualificationTitle || (isRN ? 'NCJ Registered Clinical Nurse' : 'Certified Geriatric Care Aide')} • {nurse.yearsExperience} yrs exp
                          </p>

                          {/* Match Reasons Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(reasons || []).slice(0, 3).map((reason, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-200"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & 1-Click Booking Action */}
                      <div className="sm:text-right flex sm:flex-col justify-between items-end gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Total for {hoursNeeded} hr{hoursNeeded > 1 ? 's' : ''}
                          </span>
                          <span className="text-lg font-black text-[#C77DFF]">
                            JMD ${estimatedTotal.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            (JMD ${hourlyRate.toLocaleString()}/hr)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {onViewProfile && (
                            <button
                              type="button"
                              onClick={() => onViewProfile(nurse)}
                              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/15 transition"
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
                              onClose();
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-900/40 transition flex items-center gap-1.5"
                          >
                            <span>1-Click Book</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          {activeStep === 'requirements' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playSuccessPing();
                  setActiveStep('results');
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition flex items-center gap-2"
              >
                <span>Get Recommended Caregivers ({rankedCaregivers.length} Matches)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveStep('requirements')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Requirements</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
