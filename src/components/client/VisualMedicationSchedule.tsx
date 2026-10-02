import React, { useState, useEffect, useMemo } from 'react';
import { 
  PatientMedication, 
  UserAccount, 
  MedicationComplianceEntry 
} from '../../types';
import { 
  Pill, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Check, 
  RotateCcw, 
  Bell, 
  Flame, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Zap, 
  Info, 
  Droplets, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  UserCheck, 
  History,
  X,
  Heart
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

export interface VisualMedicationScheduleProps {
  currentUser?: UserAccount | null;
  onUpdateUser?: (updatedUser: UserAccount) => void;
  onNavigateToBooking?: () => void;
  className?: string;
}

// Default Jamaican clinical home prescription sample
const DEFAULT_PRESCRIBED_MEDICATIONS: PatientMedication[] = [
  {
    id: 'med-bp-01',
    name: 'Amlodipine Besylate 5mg',
    dosage: '1 oral tablet daily',
    frequency: 'Once daily in the morning',
    instructions: 'Take with a full glass of water after breakfast. Monitor for ankle swelling.',
    timesOfDay: ['morning'],
    scheduledTime: '08:00 AM',
    purpose: 'Essential Hypertension Control',
    takenToday: true,
    takenAt: '08:15 AM',
    complianceHistory: [
      {
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'taken',
        loggedBy: 'Patient Self-Reported',
        notes: 'Taken on schedule with breakfast tea.'
      }
    ]
  },
  {
    id: 'med-dm-02',
    name: 'Metformin Hydrochloride 500mg',
    dosage: '1 oral tablet twice daily',
    frequency: 'Twice daily with meals',
    instructions: 'Take during or immediately after meals to reduce GI irritation.',
    timesOfDay: ['morning', 'evening'],
    scheduledTime: '08:00 AM',
    purpose: 'Type 2 Diabetes Glycemic Management',
    takenToday: true,
    takenAt: '08:20 AM',
    complianceHistory: [
      {
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'taken',
        loggedBy: 'Patient Self-Reported',
        notes: 'Taken with morning porridge.'
      }
    ]
  },
  {
    id: 'med-joint-03',
    name: 'Glucosamine & Chondroitin Complex 1000mg',
    dosage: '1 capsule daily with lunch',
    frequency: 'Once daily at midday',
    instructions: 'Take with midday lunch and plenty of water.',
    timesOfDay: ['midday'],
    scheduledTime: '01:00 PM',
    purpose: 'Knee Osteoarthritis & Cartilage Support',
    takenToday: false,
    complianceHistory: []
  },
  {
    id: 'med-dm-04',
    name: 'Metformin Hydrochloride 500mg (Evening Dose)',
    dosage: '1 oral tablet with dinner',
    frequency: 'Twice daily with meals',
    instructions: 'Take with evening dinner. Avoid skipping dinner after dose.',
    timesOfDay: ['evening'],
    scheduledTime: '06:30 PM',
    purpose: 'Type 2 Diabetes Glycemic Management',
    takenToday: false,
    complianceHistory: []
  },
  {
    id: 'med-cardio-05',
    name: 'Atorvastatin Calcium 20mg',
    dosage: '1 tablet at bedtime',
    frequency: 'Once nightly before bed',
    instructions: 'Take at 9:00 PM before retiring. Avoid grapefruit or grapefruit juice.',
    timesOfDay: ['bedtime'],
    scheduledTime: '09:00 PM',
    purpose: 'Cardiovascular Risk Reduction & Lipid Control',
    takenToday: false,
    complianceHistory: []
  },
  {
    id: 'med-prn-06',
    name: 'Paracetamol 500mg (Panadol)',
    dosage: '1-2 tablets as needed for acute pain/fever',
    frequency: 'Every 6 hours as needed (Max 4g/day)',
    instructions: 'Take with water. Do not exceed 8 tablets in 24 hours. Do not combine with other acetaminophen medications.',
    timesOfDay: ['as_needed'],
    scheduledTime: 'PRN',
    purpose: 'Post-Activity Knee Soreness / Headache',
    takenToday: false,
    complianceHistory: []
  }
];

export const VisualMedicationSchedule: React.FC<VisualMedicationScheduleProps> = ({
  currentUser,
  onUpdateUser,
  onNavigateToBooking,
  className = ''
}) => {
  // Current user's storage key
  const storageKey = useMemo(() => {
    return `wecare_patient_medications_${currentUser?.id || 'demo_client'}`;
  }, [currentUser?.id]);

  // Load medications state with fallback
  const [medications, setMedications] = useState<PatientMedication[]>(() => {
    // 1. Try patientBioData / bioData from currentUser prop
    const userMeds = currentUser?.patientBioData?.medications || currentUser?.bioData?.medications;
    if (userMeds && Array.isArray(userMeds) && userMeds.length > 0) {
      return userMeds;
    }

    // 2. Try localStorage
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    // 3. Fallback to default realistic Jamaican clinical prescriptions
    return DEFAULT_PRESCRIBED_MEDICATIONS;
  });

  // Active filter tab
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'taken' | 'morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed'>('all');
  
  // Modal for adding custom medication
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showComplianceHistory, setShowComplianceHistory] = useState(false);
  const [selectedMedForHistory, setSelectedMedForHistory] = useState<PatientMedication | null>(null);

  // New medication form state
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00 AM');
  const [newMedTimesOfDay, setNewMedTimesOfDay] = useState<('morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed')[]>(['morning']);
  const [newMedPurpose, setNewMedPurpose] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');

  // Daily streak tracker
  const [adherenceStreak, setAdherenceStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wecare_patient_med_streak');
      return saved ? parseInt(saved, 10) : 7;
    } catch {
      return 7;
    }
  });

  // Synchronize medications changes to storage & user account
  const saveMedications = (updatedMeds: PatientMedication[]) => {
    setMedications(updatedMeds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedMeds));
    } catch {}

    // Also update parent currentUser if provided
    if (currentUser && onUpdateUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        patientBioData: {
          ...(currentUser.patientBioData || {
            knownIllnesses: ['Hypertension'],
            allergies: ['Penicillin'],
            medications: [],
            trustedFamilyMember: {
              name: 'David Campbell',
              relation: 'Son',
              phone: '1876-555-0199',
              photoUrl: '',
              canManageCare: true
            }
          }),
          medications: updatedMeds
        },
        bioData: {
          ...(currentUser.bioData || currentUser.patientBioData || {
            knownIllnesses: ['Hypertension'],
            allergies: ['Penicillin'],
            medications: [],
            trustedFamilyMember: {
              name: 'David Campbell',
              relation: 'Son',
              phone: '1876-555-0199',
              photoUrl: '',
              canManageCare: true
            }
          }),
          medications: updatedMeds
        }
      };
      onUpdateUser(updatedUser);
    }
  };

  // Mark medication as taken
  const handleMarkAsTaken = (medId: string) => {
    soundFX.playSuccessPing();

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isoString = now.toISOString();

    const updatedMeds = medications.map(med => {
      if (med.id === medId) {
        const newHistoryEntry: MedicationComplianceEntry = {
          timestamp: isoString,
          status: 'taken',
          loggedBy: currentUser?.name || 'Patient Self-Reported',
          notes: `Taken on schedule at ${timeString}`
        };

        return {
          ...med,
          takenToday: true,
          takenAt: timeString,
          lastAdministeredAt: isoString,
          administeredToday: true,
          complianceHistory: [newHistoryEntry, ...(med.complianceHistory || [])]
        };
      }
      return med;
    });

    saveMedications(updatedMeds);

    // Check if all scheduled non-PRN medications for today are taken
    const scheduledMeds = updatedMeds.filter(m => !m.timesOfDay.includes('as_needed'));
    const allTaken = scheduledMeds.length > 0 && scheduledMeds.every(m => m.takenToday);

    if (allTaken) {
      soundFX.playSuccessChime();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#6366F1']
      });

      // Increment streak
      const newStreak = adherenceStreak + 1;
      setAdherenceStreak(newStreak);
      try {
        localStorage.setItem('wecare_patient_med_streak', String(newStreak));
        localStorage.setItem('wecare_patient_med_last_checkin', new Date().toISOString().split('T')[0]);
      } catch {}
    }
  };

  // Undo / Revert taken status if logged by accident
  const handleUndoTaken = (medId: string) => {
    soundFX.playClick();
    const updatedMeds = medications.map(med => {
      if (med.id === medId) {
        return {
          ...med,
          takenToday: false,
          takenAt: undefined,
          administeredToday: false
        };
      }
      return med;
    });
    saveMedications(updatedMeds);
  };

  // Add custom medication
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    soundFX.playHealthRecordUpdate();

    const newMed: PatientMedication = {
      id: `med-custom-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      scheduledTime: newMedTime,
      timesOfDay: newMedTimesOfDay,
      purpose: newMedPurpose.trim() || 'Prescribed Patient Therapy',
      instructions: newMedInstructions.trim() || 'Take as instructed by physician.',
      takenToday: false,
      complianceHistory: []
    };

    saveMedications([...medications, newMed]);
    setIsAddModalOpen(false);

    // Reset form
    setNewMedName('');
    setNewMedDosage('');
    setNewMedTime('08:00 AM');
    setNewMedTimesOfDay(['morning']);
    setNewMedPurpose('');
    setNewMedInstructions('');
  };

  // Metrics calculations
  const totalScheduledToday = useMemo(() => {
    return medications.filter(m => !m.timesOfDay.includes('as_needed')).length;
  }, [medications]);

  const totalTakenToday = useMemo(() => {
    return medications.filter(m => !m.timesOfDay.includes('as_needed') && m.takenToday).length;
  }, [medications]);

  const adherencePercentage = useMemo(() => {
    if (totalScheduledToday === 0) return 100;
    return Math.round((totalTakenToday / totalScheduledToday) * 100);
  }, [totalScheduledToday, totalTakenToday]);

  // Next upcoming dose
  const nextDose = useMemo(() => {
    const pending = medications.filter(m => !m.takenToday && !m.timesOfDay.includes('as_needed'));
    return pending[0] || null;
  }, [medications]);

  // Group medications by time slot
  const timeSlotGroups = useMemo(() => {
    const slots: {
      id: 'morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed';
      label: string;
      window: string;
      icon: React.ReactNode;
      colorClass: string;
      accentBg: string;
      items: PatientMedication[];
    }[] = [
      {
        id: 'morning',
        label: 'Morning Routine',
        window: '06:00 AM – 11:59 AM',
        icon: <Sunrise className="w-5 h-5 text-amber-400" />,
        colorClass: 'text-amber-400 border-amber-500/30',
        accentBg: 'from-amber-500/10 to-transparent',
        items: medications.filter(m => m.timesOfDay.includes('morning'))
      },
      {
        id: 'midday',
        label: 'Midday / Lunchtime',
        window: '12:00 PM – 04:59 PM',
        icon: <Sun className="w-5 h-5 text-yellow-300" />,
        colorClass: 'text-yellow-300 border-yellow-500/30',
        accentBg: 'from-yellow-500/10 to-transparent',
        items: medications.filter(m => m.timesOfDay.includes('midday'))
      },
      {
        id: 'evening',
        label: 'Evening / Dinner',
        window: '05:00 PM – 08:59 PM',
        icon: <Sunset className="w-5 h-5 text-orange-400" />,
        colorClass: 'text-orange-400 border-orange-500/30',
        accentBg: 'from-orange-500/10 to-transparent',
        items: medications.filter(m => m.timesOfDay.includes('evening'))
      },
      {
        id: 'bedtime',
        label: 'Night & Bedtime',
        window: '09:00 PM – 11:59 PM',
        icon: <Moon className="w-5 h-5 text-indigo-400" />,
        colorClass: 'text-indigo-400 border-indigo-500/30',
        accentBg: 'from-indigo-500/10 to-transparent',
        items: medications.filter(m => m.timesOfDay.includes('bedtime'))
      },
      {
        id: 'as_needed',
        label: 'As-Needed (PRN Relief)',
        window: 'Take only when symptoms occur',
        icon: <Zap className="w-5 h-5 text-cyan-400" />,
        colorClass: 'text-cyan-400 border-cyan-500/30',
        accentBg: 'from-cyan-500/10 to-transparent',
        items: medications.filter(m => m.timesOfDay.includes('as_needed'))
      }
    ];

    return slots;
  }, [medications]);

  // Filtered medication list
  const filteredMedications = useMemo(() => {
    if (activeFilter === 'all') return medications;
    if (activeFilter === 'pending') return medications.filter(m => !m.takenToday);
    if (activeFilter === 'taken') return medications.filter(m => m.takenToday);
    return medications.filter(m => m.timesOfDay.includes(activeFilter));
  }, [medications, activeFilter]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. TOP HEADER & ADHERENCE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-indigo-500/30 p-6 md:p-8 shadow-2xl text-white">
        {/* Glow background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                <Pill className="w-3.5 h-3.5 text-indigo-400" />
                Personalized Clinical Adherence
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                NCJ Prescribed Protocol
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {adherenceStreak}-Day Streak
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Patient Medication Schedule</span>
            </h2>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Track daily prescribed doses with one-tap confirmation. Every recorded dose is securely synchronized to your patient medical profile for attending Jamaican home care nurses.
            </p>
          </div>

          {/* Quick Adherence Progress Card */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-white/[0.04] backdrop-blur-xl border border-white/10 p-4 rounded-2xl shrink-0">
            {/* Circular Adherence Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${adherencePercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black text-white">{adherencePercentage}%</span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium">Today's Progress</div>
              <div className="text-lg font-bold text-white">
                <span className="text-emerald-400">{totalTakenToday}</span> / {totalScheduledToday} Doses
              </div>
              <div className="text-[11px] text-slate-300">
                {totalTakenToday === totalScheduledToday && totalScheduledToday > 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Doses Completed!
                  </span>
                ) : nextDose ? (
                  <span>Next: <strong className="text-indigo-300">{nextDose.name.split(' ')[0]}</strong> at {nextDose.scheduledTime}</span>
                ) : (
                  <span>No doses pending</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pl-2 border-l border-white/10">
              <button
                onClick={() => {
                  soundFX.playTabSwitch();
                  setIsAddModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md hover:shadow-indigo-500/25 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Med</span>
              </button>
              <button
                onClick={() => {
                  soundFX.playFilterSelect();
                  setShowComplianceHistory(!showComplianceHistory);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-bold transition flex items-center gap-1 border border-white/10 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-indigo-300" />
                <span>Log</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            Filter View:
          </span>
          {[
            { id: 'all', label: `All Prescriptions (${medications.length})` },
            { id: 'pending', label: `Pending (${medications.filter(m => !m.takenToday).length})` },
            { id: 'taken', label: `Taken Today (${medications.filter(m => m.takenToday).length})` },
            { id: 'morning', label: 'Morning' },
            { id: 'midday', label: 'Midday' },
            { id: 'evening', label: 'Evening' },
            { id: 'bedtime', label: 'Bedtime' },
            { id: 'as_needed', label: 'As Needed (PRN)' }
          ].map(tab => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFX.playFilterSelect();
                  setActiveFilter(tab.id as any);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-400/40'
                    : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPLIANCE LOG DRAWER (IF TOGGLED) */}
      {showComplianceHistory && (
        <div className="rounded-3xl bg-[#1E1B4B]/70 border border-indigo-500/20 p-5 backdrop-blur-xl text-white space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Recent Compliance & Administration History</h3>
            </div>
            <button
              onClick={() => setShowComplianceHistory(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {medications.map(med => {
              const logs = med.complianceHistory || [];
              return (
                <div key={med.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate">{med.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      med.takenToday ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {med.takenToday ? 'Taken Today' : 'Pending'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{med.dosage} • {med.scheduledTime}</div>
                  
                  {logs.length > 0 ? (
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      {logs.slice(0, 2).map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] text-slate-300">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-slate-400">{entry.loggedBy || 'Patient'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 italic">No historical administration logs recorded yet</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TIME-OF-DAY VISUAL SCHEDULE BLOCKS */}
      {activeFilter === 'all' ? (
        <div className="space-y-6">
          {timeSlotGroups.map(slot => {
            if (slot.items.length === 0) return null;
            const slotAllTaken = slot.items.every(m => m.takenToday);

            return (
              <div 
                key={slot.id} 
                className="rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden shadow-xl"
              >
                {/* Slot Header */}
                <div className={`p-4 md:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r ${slot.accentBg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl bg-white/[0.06] border ${slot.colorClass}`}>
                      {slot.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{slot.label}</h3>
                        {slotAllTaken && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Complete
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{slot.window}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 font-mono">
                    <strong className="text-white">{slot.items.filter(m => m.takenToday).length}</strong> of {slot.items.length} taken
                  </div>
                </div>

                {/* Medication Cards within Slot */}
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slot.items.map(med => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onTake={() => handleMarkAsTaken(med.id)}
                      onUndo={() => handleUndoTaken(med.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Filtered Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedications.map(med => (
            <MedicationCard
              key={med.id}
              medication={med}
              onTake={() => handleMarkAsTaken(med.id)}
              onUndo={() => handleUndoTaken(med.id)}
            />
          ))}

          {filteredMedications.length === 0 && (
            <div className="col-span-full p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10 space-y-3">
              <Pill className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-base font-bold text-white">No medications matching this filter</div>
              <p className="text-xs text-slate-400">Select "All Prescriptions" or tap "+ Add Med" to register a new prescription.</p>
            </div>
          )}
        </div>
      )}

      {/* 3. SAFETY NOTICE & NURSE SUPERVISION INFO */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <strong className="text-white block font-semibold">Registered Nurse Medication Oversight</strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When a licensed We Care nurse attends your scheduled home visit, they cross-reference these records with physical blister packs and document oral or IV administration in your permanent NCJ clinical audit file.
            </p>
          </div>
        </div>

        {onNavigateToBooking && (
          <button
            onClick={() => {
              soundFX.playTabSwitch();
              onNavigateToBooking();
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition shadow-lg shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Book Nurse Visit</span>
          </button>
        )}
      </div>

      {/* 4. MODAL: ADD CUSTOM PRESCRIPTION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1E1B4B] border border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Add Prescribed Medication</h3>
                  <div className="text-xs text-slate-400">Register a new prescription to your daily schedule</div>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Medication Name & Strength *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Losartan Potassium 50mg, Lisinopril 10mg"
                  value={newMedName}
                  onChange={e => setNewMedName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Dosage Form *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 oral tablet, 2 puffs, 5ml"
                    value={newMedDosage}
                    onChange={e => setNewMedDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Scheduled Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:00 AM, 01:00 PM, 08:00 PM"
                    value={newMedTime}
                    onChange={e => setNewMedTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Time of Day (Schedule Slots)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'morning', label: 'Morning' },
                    { id: 'midday', label: 'Midday' },
                    { id: 'evening', label: 'Evening' },
                    { id: 'bedtime', label: 'Bedtime' },
                    { id: 'as_needed', label: 'As Needed (PRN)' }
                  ].map(slot => {
                    const isSelected = newMedTimesOfDay.includes(slot.id as any);
                    return (
                      <button
                        type="button"
                        key={slot.id}
                        onClick={() => {
                          if (isSelected) {
                            if (newMedTimesOfDay.length > 1) {
                              setNewMedTimesOfDay(newMedTimesOfDay.filter(s => s !== slot.id));
                            }
                          } else {
                            setNewMedTimesOfDay([...newMedTimesOfDay, slot.id as any]);
                          }
                        }}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                            : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{slot.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Therapeutic Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Blood pressure regulation, Diabetes, Joint relief"
                  value={newMedPurpose}
                  onChange={e => setNewMedPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Special Clinical Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take with warm food and water. Do not crush tablet."
                  value={newMedInstructions}
                  onChange={e => setNewMedInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save to Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// INDIVIDUAL MEDICATION CARD SUBCOMPONENT
interface MedicationCardProps {
  medication: PatientMedication;
  onTake: () => void;
  onUndo: () => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onTake,
  onUndo
}) => {
  const isTaken = Boolean(medication.takenToday);

  return (
    <div 
      className={`relative p-5 rounded-2xl transition-all duration-300 border flex flex-col justify-between ${
        isTaken
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
          : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 hover:border-indigo-500/40 shadow-md'
      }`}
    >
      {/* Top row: Scheduled time & Status indicator */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            isTaken 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
              : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
          }`}>
            <Pill className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-indigo-200">
                {medication.scheduledTime}
              </span>
              {medication.purpose && (
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 text-[10px] font-semibold truncate max-w-[140px]">
                  {medication.purpose}
                </span>
              )}
            </div>
            <h4 className={`text-base font-bold tracking-tight mt-0.5 ${
              isTaken ? 'text-slate-200 line-through decoration-emerald-400/60' : 'text-white'
            }`}>
              {medication.name}
            </h4>
          </div>
        </div>

        {/* Status Badge */}
        {isTaken ? (
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black flex items-center gap-1 shadow-sm">
            <Check className="w-3.5 h-3.5" /> Taken
          </span>
        ) : (
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" /> Due
          </span>
        )}
      </div>

      {/* Middle row: Dosage & instructions */}
      <div className="space-y-2 mb-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span className="text-white font-bold">{medication.dosage}</span>
          {medication.frequency && <span className="text-slate-400">• {medication.frequency}</span>}
        </div>

        {medication.instructions && (
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300 text-[11px] leading-relaxed flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span>{medication.instructions}</span>
          </div>
        )}

        {isTaken && medication.takenAt && (
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Logged taken at {medication.takenAt}</span>
          </div>
        )}
      </div>

      {/* Bottom row: Interactive 'Take' / 'Undo' Action Buttons */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
        {isTaken ? (
          <>
            <div className="text-[11px] text-emerald-300/80 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dose Confirmed</span>
            </div>
            <button
              onClick={onUndo}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10 cursor-pointer"
              title="Revert if marked by accident"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          </>
        ) : (
          <button
            onClick={onTake}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-100" />
            <span>Take Dose Now</span>
          </button>
        )}
      </div>
    </div>
  );
};
