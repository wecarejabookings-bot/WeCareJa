import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Heart, 
  Pill, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Share2, 
  Check, 
  Copy, 
  QrCode, 
  ShieldCheck, 
  AlertTriangle, 
  Camera, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  MessageCircle,
  Activity,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
  Info,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CalendarCheck,
  Flame,
  History,
  TrendingUp,
  List,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Bell,
  Volume2
} from 'lucide-react';
import { 
  UserAccount, 
  PatientMedication, 
  ClientPatientBioData, 
  TrustedFamilyMember, 
  MedicationComplianceEntry, 
  DailyMedicationReminder 
} from '../../types';
import { ALL_SERVICE_ZONES } from '../../data/mockData';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { SyncHealthDataModal } from './SyncHealthDataModal';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUpdateUser: (updatedUser: UserAccount) => void;
  viewerRole?: 'client' | 'nurse' | 'admin';
}

const COMMON_ILLNESS_OPTIONS = [
  'Hypertension (High BP)',
  'Type 2 Diabetes',
  'Arthritis / Joint Pain',
  'Alzheimer\'s / Dementia',
  'Cardiovascular Disease',
  'Asthma / COPD',
  'Stroke Recovery',
  'Post-Op Surgical Care',
  'Fall Risk / Mobility Limited',
  'Renal / Kidney Disease',
  'Bedbound Care'
];

const COMMON_ALLERGY_OPTIONS = [
  'Penicillin / Amoxicillin',
  'Sulfa Drugs',
  'Latex Products',
  'Aspirin / NSAIDs',
  'Iodine / Contrast',
  'Codeine / Morphine',
  'Shellfish / Seafood',
  'No Known Drug Allergies (NKDA)'
];

export interface MedicationPreset {
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  instructions: string;
  purpose: string;
  timesOfDay: ('morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed')[];
  badge: string;
  iconChar: string;
}

export const JAMAICAN_MED_PRESETS: MedicationPreset[] = [
  {
    name: 'Amlodipine Besylate',
    dosage: '1 Tablet (5mg)',
    frequency: 'Once daily (Morning)',
    time: '08:00 AM',
    instructions: 'Take in morning with full glass of water',
    purpose: 'High Blood Pressure regulation',
    timesOfDay: ['morning'],
    badge: 'Blood Pressure',
    iconChar: '💊'
  },
  {
    name: 'Metformin HCl',
    dosage: '1 Tablet (500mg)',
    frequency: 'Twice daily (Morning & Dinner)',
    time: '08:00 AM',
    instructions: 'Take with or right after food to protect stomach',
    purpose: 'Type 2 Diabetes / Blood Sugar control',
    timesOfDay: ['morning', 'evening'],
    badge: 'Diabetes / Sugar',
    iconChar: '🩸'
  },
  {
    name: 'Panadol / Paracetamol',
    dosage: '2 Tablets (500mg)',
    frequency: 'Every 6 hours (As needed)',
    time: '01:00 PM',
    instructions: 'Take with full glass of water for pain or fever',
    purpose: 'Pain relief & fever reduction',
    timesOfDay: ['as_needed'],
    badge: 'Pain Relief',
    iconChar: '🩹'
  },
  {
    name: 'Baby Aspirin (Low Dose)',
    dosage: '1 Tablet (81mg)',
    frequency: 'Once daily (Morning)',
    time: '08:00 AM',
    instructions: 'Swallow with food or water',
    purpose: 'Heart health & stroke prevention',
    timesOfDay: ['morning'],
    badge: 'Heart Health',
    iconChar: '🫀'
  },
  {
    name: 'Ventolin Inhaler',
    dosage: '2 Puffs',
    frequency: 'Twice daily or when wheezing',
    time: '08:00 AM',
    instructions: 'Shake well, inhale deeply, hold breath 10 seconds',
    purpose: 'Asthma & respiratory airway relief',
    timesOfDay: ['morning', 'evening'],
    badge: 'Asthma Pump',
    iconChar: '💨'
  },
  {
    name: 'Lasix / Furosemide',
    dosage: '1 Tablet (40mg)',
    frequency: 'Once daily (Early Morning)',
    time: '07:30 AM',
    instructions: 'Take early morning with a glass of water',
    purpose: 'Water retention & leg swelling reduction',
    timesOfDay: ['morning'],
    badge: 'Water Pill',
    iconChar: '💧'
  },
  {
    name: 'Atorvastatin',
    dosage: '1 Tablet (20mg)',
    frequency: 'Once daily at Bedtime',
    time: '09:00 PM',
    instructions: 'Take at night before going to sleep',
    purpose: 'Cholesterol & cardiovascular health',
    timesOfDay: ['bedtime'],
    badge: 'Cholesterol',
    iconChar: '🌙'
  }
];

interface SwipeableMedCardProps {
  med: PatientMedication;
  viewerRole: 'client' | 'nurse' | 'admin';
  isAnimating: boolean;
  onToggleTaken: (medId: string, e?: React.MouseEvent) => void;
  onRemove: (medId: string) => void;
  mode?: 'timeline' | 'directory';
}

const SwipeableMedCard: React.FC<SwipeableMedCardProps> = ({
  med,
  viewerRole,
  isAnimating,
  onToggleTaken,
  onRemove,
  mode = 'timeline'
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;
    startXRef.current = e.clientX;
    setIsDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || startXRef.current === null) return;
    const diff = e.clientX - startXRef.current;
    const dampened = Math.sign(diff) * Math.min(Math.abs(diff) * 0.75, 110);
    setDragOffset(dampened);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 55) {
      if (!med.takenToday) {
        onToggleTaken(med.id);
      }
    } else if (dragOffset < -55) {
      if (med.takenToday) {
        onToggleTaken(med.id);
      } else if (viewerRole === 'client') {
        onRemove(med.id);
      }
    }
    setDragOffset(0);
    startXRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragOffset(0);
    startXRef.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl group bg-black/40 border border-white/5 select-none">
      {/* Swipe Underlay Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4 rounded-2xl pointer-events-none z-0">
        {/* Swiping Right -> Mark Taken */}
        <div
          className={`flex items-center gap-2 text-emerald-400 font-extrabold text-xs transition-opacity duration-150 ${
            dragOffset > 15 ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <span>Mark as Taken ✓</span>
        </div>

        {/* Swiping Left -> Undo or Remove */}
        <div
          className={`flex items-center gap-2 text-red-400 font-extrabold text-xs transition-opacity duration-150 ${
            dragOffset < -15 ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <span>{med.takenToday ? 'Undo Dose' : 'Remove Prescription'}</span>
          <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
            <Trash2 className="w-4 h-4 text-red-400" />
          </div>
        </div>
      </div>

      {/* Swipeable Foreground Card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className={`relative z-10 p-3.5 rounded-2xl border transition-colors duration-200 touch-pan-y cursor-grab active:cursor-grabbing ${
          med.takenToday
            ? 'bg-gradient-to-r from-[#0d2a1f] via-[#091b15] to-[#12041e] border-emerald-500/40 shadow-lg shadow-emerald-950/20'
            : 'bg-[#180728] border-white/10 hover:border-purple-500/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Medication Details */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-white">{med.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 font-bold text-[10px]">
                {med.dosage}
              </span>
              {mode === 'directory' && med.scheduledTime && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {med.scheduledTime}
                </span>
              )}
              {med.purpose && (
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[10px]">
                  {med.purpose}
                </span>
              )}
            </div>

            {med.instructions && (
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <Info className="w-3 h-3 text-purple-400 shrink-0" />
                <span>{med.instructions}</span>
              </p>
            )}

            {mode === 'directory' && med.timesOfDay && med.timesOfDay.length > 0 && (
              <div className="text-slate-300 text-[11px]">
                Times: <strong className="text-purple-200">{med.timesOfDay.join(', ')}</strong>
              </div>
            )}

            {/* Status Badge & Swipe Hint */}
            <div className="flex items-center gap-3 pt-0.5 text-[11px] flex-wrap">
              {med.takenToday ? (
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Taken today at <strong>{med.takenAt || '08:15 AM'}</strong></span>
                </span>
              ) : (
                <span className="text-amber-300 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scheduled • Due for administration</span>
                </span>
              )}

              <span className="hidden sm:inline-flex text-[10px] text-slate-400 font-mono items-center gap-1">
                <span>↔ Swipe right to take</span>
              </span>
            </div>
          </div>

          {/* Right Side: Interactive Taken Toggle & Remove Button */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={(e) => onToggleTaken(med.id, e)}
              className={`relative px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-2 shadow-md ${
                med.takenToday
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 border border-emerald-400/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/20 hover:border-emerald-400/40'
              }`}
              title={med.takenToday ? 'Dose recorded as taken. Click to undo if needed.' : 'Click to confirm this dose was taken'}
            >
              {med.takenToday ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Taken ✓</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-transparent" />
                  </div>
                  <span>Mark as Taken</span>
                </div>
              )}

              {/* Pulsing checkmark wave animation */}
              {isAnimating && (
                <span className="absolute inset-0 rounded-xl bg-emerald-400/40 border border-emerald-400 pointer-events-none animate-ping opacity-75" />
              )}
            </button>

            {/* Remove Medication Option */}
            {viewerRole === 'client' && (
              <button
                type="button"
                onClick={() => onRemove(med.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition"
                title="Remove prescription from schedule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  viewerRole = 'client'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'family' | 'share' | 'devices'>('overview');
  const [isSyncHealthDataModalOpen, setIsSyncHealthDataModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const isFirstRender = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Editable Bio Data State
  const initialBio: ClientPatientBioData = user.patientBioData || {
    dateOfBirth: '1946-11-20',
    age: 79,
    gender: 'female',
    bloodType: 'O+',
    residentialAddress: user.address || '14 Trafalgar Road, Kingston 5',
    zone: user.zone || 'New Kingston',
    knownIllnesses: ['Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin', 'Latex'],
    mobilityStatus: 'needs_cane_walker',
    dietaryRestrictions: 'Low sodium, diabetic friendly',
    specialCareInstructions: 'Requires gentle assistance with transfers and morning blood pressure monitoring.',
    medications: [
      {
        id: 'med-def-1',
        name: 'Amlodipine 5mg',
        dosage: '1 tablet daily',
        instructions: 'Take with morning tea and water',
        timesOfDay: ['morning'],
        scheduledTime: '08:00 AM',
        purpose: 'Blood pressure control',
        takenToday: true,
        takenAt: '08:15 AM',
        administeredToday: true,
        lastAdministeredAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        complianceHistory: [
          {
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
            status: 'taken',
            loggedBy: 'Patient / Family',
            notes: 'Taken with breakfast and herbal tea'
          }
        ]
      },
      {
        id: 'med-def-2',
        name: 'Metformin 500mg',
        dosage: '1 tablet with food',
        instructions: 'Take immediately after lunch with a full glass of water',
        timesOfDay: ['midday'],
        scheduledTime: '01:00 PM',
        purpose: 'Type 2 Diabetes glucose management',
        takenToday: false
      },
      {
        id: 'med-def-3',
        name: 'Atorvastatin 20mg',
        dosage: '1 tablet nightly',
        instructions: 'Take before bedtime with half glass of water',
        timesOfDay: ['bedtime'],
        scheduledTime: '09:00 PM',
        purpose: 'Cardiovascular protection & cholesterol control',
        takenToday: false
      },
      {
        id: 'med-def-4',
        name: 'Panadol Extra (Paracetamol 500mg)',
        dosage: '1-2 tablets as needed',
        instructions: 'Take for joint stiffness or mild headache (Max 8 tablets/day)',
        timesOfDay: ['as_needed'],
        scheduledTime: 'As Needed (PRN)',
        purpose: 'Arthritis & mild pain relief',
        takenToday: false
      }
    ],
    trustedFamilyMember: {
      name: user.emergencyContact?.name || 'Robert Morrison',
      relation: user.emergencyContact?.relation || 'Son',
      phone: user.emergencyContact?.phone || user.phone,
      email: 'family.guardian@gmail.com',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      canManageCare: true,
      notes: 'Primary emergency contact and medical guardian.'
    },
    profileSharedWith: []
  };

  const [currentBio, setCurrentBio] = useState<ClientPatientBioData>(initialBio);
  const [address, setAddress] = useState(currentBio.residentialAddress || user.address || '14 Trafalgar Road, Kingston 5');
  const [zone, setZone] = useState(currentBio.zone || user.zone || 'New Kingston');
  const [customIllness, setCustomIllness] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');

  // Medication Form State & Daily Schedule Timeline Controls
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00 AM');
  const [newMedPurpose, setNewMedPurpose] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  const [newMedTimesOfDay, setNewMedTimesOfDay] = useState<('morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed')[]>(['morning']);
  const [animatingMedId, setAnimatingMedId] = useState<string | null>(null);
  const [medViewMode, setMedViewMode] = useState<'timeline' | 'manage'>('timeline');
  const [showComplianceLog, setShowComplianceLog] = useState<boolean>(false);
  const [simulatedAlertMed, setSimulatedAlertMed] = useState<PatientMedication | null>(null);

  // --------------------------------------------------------------------------
  // DAILY MEDICATION REMINDERS IN USER ACCOUNT (Stored directly on user object)
  // --------------------------------------------------------------------------
  const [medicationReminders, setMedicationReminders] = useState<DailyMedicationReminder[]>(() => {
    if ((user?.medicationReminders?.length || 0) > 0) {
      return user.medicationReminders || [];
    }
    if ((initialBio?.medications?.length || 0) > 0) {
      return (initialBio.medications || []).map(m => ({
        id: m.id || `rem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        medicationName: m.name,
        dosage: m.dosage || '1 Tablet',
        frequency: m.timesOfDay?.includes('midday') ? 'Twice daily (Midday & Evening)' : 'Once daily (Morning)',
        time: m.scheduledTime || '08:00 AM',
        scheduledTimes: [m.scheduledTime || '08:00 AM'],
        instructions: m.instructions || 'Take with full glass of water after food',
        purpose: m.purpose || 'Daily health maintenance',
        iconType: 'tablet',
        timesOfDay: m.timesOfDay || ['morning'],
        takenToday: !!m.takenToday,
        takenAt: m.takenAt,
        notifySound: true,
        active: true,
        createdAt: new Date().toISOString()
      }));
    }
    return [];
  });

  // Suggestive Reminder Form States (engineered for effortless use)
  const [remName, setRemName] = useState('');
  const [remDosage, setRemDosage] = useState('1 Tablet');
  const [remFrequency, setRemFrequency] = useState('Once daily (Morning)');
  const [remTime, setRemTime] = useState('08:00 AM');
  const [remInstructions, setRemInstructions] = useState('Take with full glass of water after meals');
  const [remPurpose, setRemPurpose] = useState('High Blood Pressure regulation');
  const [remTimesOfDay, setRemTimesOfDay] = useState<('morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed')[]>(['morning']);
  const [speakingReminderId, setSpeakingReminderId] = useState<string | null>(null);

  // Voice Read-Aloud Engine for low-literacy or vision-impaired patients
  const handleSpeakReminder = (rem: DailyMedicationReminder) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingReminderId(rem.id);
      const text = `Medicine Reminder for ${rem.medicationName}. Dose is ${rem.dosage}. Scheduled time is ${rem.time}, ${rem.frequency}. ${rem.instructions ? `Instructions: ${rem.instructions}.` : ''} ${rem.purpose ? `Purpose: for ${rem.purpose}.` : ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingReminderId(null);
      utterance.onerror = () => setSpeakingReminderId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeakAllReminders = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (medicationReminders.length === 0) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("You currently have no scheduled medication reminders."));
        return;
      }
      setSpeakingReminderId('all');
      let script = `Good day! You have ${medicationReminders.length} daily medication reminders. `;
      medicationReminders.forEach((r, idx) => {
        script += `Medicine ${idx + 1}: ${r.dosage} of ${r.medicationName} at ${r.time}, ${r.frequency}. ${r.takenToday ? 'Dose marked as taken.' : 'Dose not taken yet.'} `;
      });
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 0.92;
      utterance.onend = () => setSpeakingReminderId(null);
      utterance.onerror = () => setSpeakingReminderId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleApplyPreset = (preset: MedicationPreset) => {
    setRemName(preset.name);
    setRemDosage(preset.dosage);
    setRemFrequency(preset.frequency);
    setRemTime(preset.time);
    setRemInstructions(preset.instructions);
    setRemPurpose(preset.purpose);
    setRemTimesOfDay([...preset.timesOfDay]);
    soundFX.playFilterSelect();
  };

  const handleAddDailyReminder = () => {
    if (!remName.trim()) return;

    const newRemId = `rem-${Date.now()}`;
    const newReminder: DailyMedicationReminder = {
      id: newRemId,
      medicationName: remName.trim(),
      dosage: remDosage.trim() || '1 Tablet',
      frequency: remFrequency.trim() || 'Once daily',
      time: remTime,
      scheduledTimes: [remTime],
      instructions: remInstructions.trim() || 'Take with full glass of water',
      purpose: remPurpose.trim() || 'Daily health maintenance',
      iconType: 'tablet',
      timesOfDay: remTimesOfDay,
      takenToday: false,
      notifySound: true,
      active: true,
      createdAt: new Date().toISOString()
    };

    const updatedReminders = [newReminder, ...medicationReminders];
    setMedicationReminders(updatedReminders);

    // Sync into currentBio.medications for attending nurse visit view
    const newMed: PatientMedication = {
      id: newRemId,
      name: newReminder.medicationName,
      dosage: newReminder.dosage,
      timesOfDay: newReminder.timesOfDay,
      scheduledTime: newReminder.time,
      purpose: newReminder.purpose,
      instructions: newReminder.instructions,
      takenToday: false
    };

    setCurrentBio(prev => ({
      ...prev,
      medications: [newMed, ...(prev.medications || [])]
    }));

    // Reset fields to safe default
    setRemName('');
    setRemDosage('1 Tablet');
    setRemFrequency('Once daily (Morning)');
    setRemTime('08:00 AM');
    setRemInstructions('Take with full glass of water after food');
    setRemPurpose('');
    setRemTimesOfDay(['morning']);

    soundFX.playSuccessPing();
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
  };

  const handleToggleReminderTaken = (reminderId: string, event?: React.MouseEvent) => {
    const target = medicationReminders.find(r => r.id === reminderId);
    if (!target) return;

    const willBeTaken = !target.takenToday;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (willBeTaken) {
      soundFX.playSuccessPing();
      setAnimatingMedId(reminderId);
      setTimeout(() => setAnimatingMedId(null), 1200);

      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#7209B7', '#E63946']
      });
    }

    setMedicationReminders(prev => prev.map(r => {
      if (r.id === reminderId) {
        return {
          ...r,
          takenToday: willBeTaken,
          takenAt: willBeTaken ? nowTime : undefined
        };
      }
      return r;
    }));

    // Sync with currentBio.medications
    setCurrentBio(prev => ({
      ...prev,
      medications: (prev.medications || []).map(m => {
        if (m.id === reminderId) {
          return {
            ...m,
            takenToday: willBeTaken,
            takenAt: willBeTaken ? nowTime : undefined
          };
        }
        return m;
      })
    }));
  };

  const handleRemoveReminder = (reminderId: string) => {
    soundFX.playLateTimerWarning();
    setMedicationReminders(prev => prev.filter(r => r.id !== reminderId));
    setCurrentBio(prev => ({
      ...prev,
      medications: (prev.medications || []).filter(m => m.id !== reminderId)
    }));
  };

  const handleTrigger15MinMedAlert = (targetMed?: PatientMedication) => {
    const meds = currentBio.medications || [];
    const chosenMed = targetMed || meds[0] || {
      id: 'demo-med',
      name: 'Amlodipine Besylate',
      dosage: '5mg oral tablet',
      scheduledTime: '08:00 AM',
      instructions: 'Take 1 tablet with full glass of water.',
      timesOfDay: ['morning']
    };

    setSimulatedAlertMed(chosenMed);
    soundFX.playMedicationPushAlert();
  };

  // Reset state when user changes
  useEffect(() => {
    if (user.patientBioData) {
      setCurrentBio(user.patientBioData);
      setAddress(user.patientBioData.residentialAddress || user.address || '');
      setZone(user.patientBioData.zone || user.zone || 'New Kingston');
    }
    if ((user?.medicationReminders?.length || 0) > 0) {
      setMedicationReminders(user.medicationReminders || []);
    }
  }, [user.id]);

  // --------------------------------------------------------------------------
  // DEBOUNCED AUTO-SAVE ENGINE
  // Automatically persists changes to localStorage and parent state immediately
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (viewerRole !== 'client') return;

    setSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const updatedBio: ClientPatientBioData = {
        ...currentBio,
        residentialAddress: address,
        zone: zone
      };

      const updatedUser: UserAccount = {
        ...user,
        patientBioData: updatedBio,
        medicationReminders: medicationReminders,
        address: address || user.address,
        zone: zone || user.zone,
        emergencyContact: currentBio.trustedFamilyMember ? {
          name: currentBio.trustedFamilyMember.name,
          phone: currentBio.trustedFamilyMember.phone,
          relation: currentBio.trustedFamilyMember.relation
        } : user.emergencyContact
      };

      // 1. Persist directly to patient-specific localStorage key
      try {
        localStorage.setItem(`wecare_patient_profile_${user.id}`, JSON.stringify(updatedBio));
        
        // 2. Also update in global accounts list in localStorage
        const accountsRaw = localStorage.getItem('wecare_user_accounts');
        if (accountsRaw) {
          const accounts: UserAccount[] = JSON.parse(accountsRaw);
          const updatedAccounts = accounts.map(acc => acc.id === user.id ? updatedUser : acc);
          localStorage.setItem('wecare_user_accounts', JSON.stringify(updatedAccounts));
        }
      } catch (err) {
        console.error('Failed to auto-save patient bio to localStorage:', err);
      }

      // 3. Update parent application state
      onUpdateUser(updatedUser);

      // 4. Update visual indicators
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
      setSaveStatus('saved');
    }, 450); // 450ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentBio, address, zone, medicationReminders]);

  if (!isOpen) return null;

  const shareableProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?patient=${user.id}&view=care_summary`
    : `https://wecarejamaica.app?patient=${user.id}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableProfileUrl);
    setCopiedLink(true);
    soundFX.playSuccessPing();
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = `🏥 WeCare Jamaica Patient Care Summary for ${user.name}: View health profile, medications, and assigned nurse visits: ${shareableProfileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    soundFX.playSuccessPing();
  };

  // Illness helpers
  const handleToggleIllness = (illness: string) => {
    soundFX.playFilterSelect();
    const current = currentBio.knownIllnesses || [];
    const exists = current.includes(illness);
    const updated = exists ? current.filter(i => i !== illness) : [...current, illness];
    setCurrentBio(prev => ({ ...prev, knownIllnesses: updated }));
  };

  const handleAddCustomIllness = () => {
    if (!customIllness.trim()) return;
    soundFX.playSuccessPing();
    const current = currentBio.knownIllnesses || [];
    if (!current.includes(customIllness.trim())) {
      setCurrentBio(prev => ({ ...prev, knownIllnesses: [...current, customIllness.trim()] }));
    }
    setCustomIllness('');
  };

  // Allergy helpers
  const handleToggleAllergy = (allergy: string) => {
    soundFX.playFilterSelect();
    const current = currentBio.allergies || [];
    const exists = current.includes(allergy);
    const updated = exists ? current.filter(a => a !== allergy) : [...current, allergy];
    setCurrentBio(prev => ({ ...prev, allergies: updated }));
  };

  const handleAddCustomAllergy = () => {
    if (!customAllergy.trim()) return;
    soundFX.playSuccessPing();
    const current = currentBio.allergies || [];
    if (!current.includes(customAllergy.trim())) {
      setCurrentBio(prev => ({ ...prev, allergies: [...current, customAllergy.trim()] }));
    }
    setCustomAllergy('');
  };

  // Medication handlers & Compliance Logging
  const handleToggleDoseTaken = (medId: string, event?: React.MouseEvent) => {
    const med = (currentBio.medications || []).find(m => m.id === medId);
    if (!med) return;

    const willBeTaken = !med.takenToday;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();

    if (willBeTaken) {
      soundFX.playSuccessPing();
      setAnimatingMedId(medId);
      setTimeout(() => setAnimatingMedId(null), 1400);

      // Micro burst confetti around button
      if (event && event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        confetti({
          particleCount: 28,
          spread: 45,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          colors: ['#10B981', '#34D399', '#7209B7', '#C77DFF']
        });
      } else {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#7209B7']
        });
      }
    } else {
      soundFX.playFilterSelect();
    }

    const updatedMedications = (currentBio.medications || []).map(m => {
      if (m.id !== medId) return m;

      const existingHistory = m.complianceHistory || [];
      const updatedHistory: MedicationComplianceEntry[] = willBeTaken
        ? [
            {
              timestamp: nowIso,
              status: 'taken',
              loggedBy: viewerRole === 'client' ? 'Patient / Family' : 'Attending Home Nurse',
              notes: `Dose confirmed taken at ${nowTime}`
            },
            ...existingHistory
          ]
        : existingHistory;

      return {
        ...m,
        takenToday: willBeTaken,
        takenAt: willBeTaken ? nowTime : undefined,
        administeredToday: willBeTaken,
        lastAdministeredAt: willBeTaken ? nowIso : m.lastAdministeredAt,
        complianceHistory: updatedHistory
      };
    });

    setCurrentBio(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    const newMed: PatientMedication = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 dose',
      timesOfDay: newMedTimesOfDay,
      scheduledTime: newMedTime,
      purpose: newMedPurpose.trim() || undefined,
      instructions: newMedInstructions.trim() || undefined,
      takenToday: false
    };
    setCurrentBio(prev => ({
      ...prev,
      medications: [...(prev.medications || []), newMed]
    }));
    setNewMedName('');
    setNewMedDosage('');
    setNewMedPurpose('');
    setNewMedInstructions('');
    soundFX.playSuccessPing();
  };

  const handleRemoveMedication = (medId: string) => {
    soundFX.playLateTimerWarning();
    setCurrentBio(prev => ({
      ...prev,
      medications: (prev.medications || []).filter(m => m.id !== medId)
    }));
  };

  // Family Member updater
  const handleUpdateFamilyMember = (field: keyof TrustedFamilyMember, value: any) => {
    setCurrentBio(prev => ({
      ...prev,
      trustedFamilyMember: {
        ...prev.trustedFamilyMember,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#1b072c] via-[#120220] to-[#0c0115] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden text-white my-6">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7209B7]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E63946]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header with Real-Time Auto-Save Status */}
        <div className="relative z-10 p-5 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-400 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                  @{user.username}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                <span>{address || user.address}, {zone || user.zone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-Save Live Status Indicator Badge */}
            {viewerRole === 'client' && (
              <div 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border backdrop-blur-md ${
                  saveStatus === 'saving'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
                title="All changes are automatically saved to your local chart and synced to active attending nurses."
              >
                {saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Auto-Saved ({lastSavedTime})</span>
                    <span className="sm:hidden">Saved</span>
                  </>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Close patient chart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 px-6 pt-3 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: '1. Health & Medical Bio', icon: Heart, badge: 'Vitals' },
            { id: 'medications', label: `2. Daily Medication Reminders (${medicationReminders.length})`, icon: Bell, badge: `${medicationReminders.filter(r => r.takenToday).length}/${medicationReminders.length} Taken` },
            { id: 'family', label: '3. Family Guardian', icon: Users, badge: 'Emergency' },
            { id: 'share', label: '4. Share Care Summary', icon: Share2, badge: 'WhatsApp' },
            { id: 'devices', label: '5. Sync Health Devices', icon: Activity, badge: `${(currentBio.vitalsLog || []).length} Readings` }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFX.playTabSwitch();
                  setActiveTab(tab.id as any);
                }}
                className={`pb-2.5 px-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-[#C77DFF] text-[#C77DFF] bg-purple-500/10 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5 rounded-t-xl'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C77DFF]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-[#C77DFF]/20 text-[#E0AAFF]' : 'bg-white/5 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="relative z-10 p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-5">
          {/* TAB 1: HEALTH & MEDICAL BIO */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Quick Auto-Save Notification Banner */}
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/25 flex items-center justify-between gap-2 text-xs text-purple-200">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Instant Debounced Auto-Save:</strong> Any change you make below is automatically saved in real-time to your patient chart and synced with visiting nurses.
                  </span>
                </div>
              </div>

              {/* Vitals & Clinical Metrics Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Blood Type */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <label className="text-[10px] text-slate-400 block uppercase font-bold">Blood Type</label>
                  {viewerRole === 'client' ? (
                    <select
                      value={currentBio.bloodType || 'O+'}
                      onChange={(e) => setCurrentBio(prev => ({ ...prev, bloodType: e.target.value }))}
                      className="w-full bg-[#1b072c] border border-white/20 rounded-xl px-2.5 py-1.5 text-sm font-black text-red-400 focus:outline-none"
                    >
                      <option value="O+">O+ Positive</option>
                      <option value="O-">O- Negative</option>
                      <option value="A+">A+ Positive</option>
                      <option value="A-">A- Negative</option>
                      <option value="B+">B+ Positive</option>
                      <option value="B-">B- Negative</option>
                      <option value="AB+">AB+ Positive</option>
                      <option value="AB-">AB- Negative</option>
                    </select>
                  ) : (
                    <span className="text-sm font-black text-red-400">{currentBio.bloodType || 'O+'}</span>
                  )}
                </div>

                {/* Mobility Status */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <label className="text-[10px] text-slate-400 block uppercase font-bold">Mobility Status</label>
                  {viewerRole === 'client' ? (
                    <select
                      value={currentBio.mobilityStatus || 'needs_cane_walker'}
                      onChange={(e) => setCurrentBio(prev => ({ ...prev, mobilityStatus: e.target.value as any }))}
                      className="w-full bg-[#1b072c] border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="independent">Independent</option>
                      <option value="needs_cane_walker">Needs Cane / Walker</option>
                      <option value="wheelchair_bound">Wheelchair Bound</option>
                      <option value="bedbound">Bedbound Care</option>
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-white capitalize">
                      {String(currentBio?.mobilityStatus || 'needs_cane_walker').replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                {/* Age */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <label className="text-[10px] text-slate-400 block uppercase font-bold">Patient Age</label>
                  {viewerRole === 'client' ? (
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={currentBio.age || 79}
                      onChange={(e) => setCurrentBio(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-[#1b072c] border border-white/20 rounded-xl px-2.5 py-1.5 text-sm font-bold text-purple-300 focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm font-bold text-purple-300">{currentBio.age ? `${currentBio.age} yrs` : '79 yrs'}</span>
                  )}
                </div>

                {/* Gender */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <label className="text-[10px] text-slate-400 block uppercase font-bold">Gender</label>
                  {viewerRole === 'client' ? (
                    <select
                      value={currentBio.gender || 'female'}
                      onChange={(e) => setCurrentBio(prev => ({ ...prev, gender: e.target.value as any }))}
                      className="w-full bg-[#1b072c] border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <span className="text-sm font-bold text-white capitalize">{currentBio.gender || 'Female'}</span>
                  )}
                </div>
              </div>

              {/* Connected Generic Health Monitoring Devices & Telemetry Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-purple-950/50 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-emerald-950/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Generic Health Monitoring Devices</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {(currentBio.vitalsLog || []).length} Synced Readings
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Sync live telemetry (Blood Pressure, Heart Rate, Pulse Oximeter, Blood Glucose) directly into this patient record.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playSuccessPing();
                      setIsSyncHealthDataModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 hover:text-black transition flex items-center gap-1.5 shadow-md shadow-emerald-950/50 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Sync Health Data (BLE)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTabSwitch();
                      setActiveTab('devices');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition cursor-pointer"
                  >
                    <span>View Telemetry Log</span>
                  </button>
                </div>
              </div>

              {/* Residential Address & Parish Zone */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <h4 className="text-xs font-black text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Home Residence &amp; Service Zone (Jamaica)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Street Address &amp; Gate Instructions</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 14 Trafalgar Road, Kingston 5"
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Parish &amp; Service Zone</label>
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#1b072c] border border-white/15 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                    >
                      {ALL_SERVICE_ZONES.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Known Illnesses & Chronic Conditions with Instant Tag Toggles */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Known Illnesses &amp; Chronic Conditions</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Click tags to toggle</span>
                </div>

                {/* Active Selected Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(currentBio?.knownIllnesses?.length || 0) > 0 ? (
                    (currentBio.knownIllnesses || []).map(ill => (
                      <span
                        key={ill}
                        onClick={() => handleToggleIllness(ill)}
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-500/30 hover:bg-red-500/20 text-purple-200 hover:text-red-200 border border-purple-400/40 cursor-pointer transition flex items-center gap-1.5 group"
                        title="Click to remove"
                      >
                        <span>{ill}</span>
                        <X className="w-3 h-3 text-purple-300 group-hover:text-red-300" />
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No chronic illnesses selected.</span>
                  )}
                </div>

                {/* Popular Presets to Add */}
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Quick-Add Condition:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_ILLNESS_OPTIONS.filter(opt => !currentBio.knownIllnesses?.includes(opt)).map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleIllness(opt)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 hover:bg-purple-600/30 text-slate-300 hover:text-white border border-white/10 transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Illness Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customIllness}
                      onChange={(e) => setCustomIllness(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomIllness()}
                      placeholder="Add other medical condition..."
                      className="p-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 flex-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomIllness}
                      className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Critical Allergies Box */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Critical Allergies (Drug &amp; Material Alerts)</span>
                  </h4>
                  <span className="text-[10px] text-red-400/80">Crucial for attending nurses</span>
                </div>

                {/* Active Allergy Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(currentBio?.allergies?.length || 0) > 0 ? (
                    (currentBio.allergies || []).map(allergy => (
                      <span
                        key={allergy}
                        onClick={() => handleToggleAllergy(allergy)}
                        className="px-3 py-1 rounded-xl text-xs font-black bg-red-500/30 hover:bg-red-500/50 text-red-200 border border-red-400/40 cursor-pointer transition flex items-center gap-1.5 group"
                        title="Click to remove allergy"
                      >
                        <span>⚠️ {allergy}</span>
                        <X className="w-3 h-3 text-red-300 group-hover:text-white" />
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No known drug allergies reported.</span>
                  )}
                </div>

                {/* Popular Allergies to Add */}
                <div className="pt-2 border-t border-red-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold text-red-300/80 block uppercase">Quick-Add Allergy Alert:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_ALLERGY_OPTIONS.filter(opt => !currentBio.allergies?.includes(opt)).map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleAllergy(opt)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-950/40 hover:bg-red-800/40 text-red-200 border border-red-500/30 transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-red-400" />
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Allergy Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customAllergy}
                      onChange={(e) => setCustomAllergy(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAllergy()}
                      placeholder="Add other allergen (e.g. Latex, Sulfa, Iodine)..."
                      className="p-2 rounded-xl bg-black/40 border border-red-500/30 text-xs text-white placeholder-slate-500 flex-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAllergy}
                      className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                    >
                      Add Alert
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Care & Dietary Instructions (Live Auto-Saving Textareas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <label className="font-bold text-slate-200 block">Special Care &amp; Mobility Instructions</label>
                  <textarea
                    rows={3}
                    value={currentBio.specialCareInstructions || ''}
                    onChange={(e) => setCurrentBio(prev => ({ ...prev, specialCareInstructions: e.target.value }))}
                    placeholder="e.g. Requires gentle assistance with morning transfers, fall risk supervision..."
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <label className="font-bold text-slate-200 block">Dietary Restrictions &amp; Nutrition</label>
                  <textarea
                    rows={3}
                    value={currentBio.dietaryRestrictions || ''}
                    onChange={(e) => setCurrentBio(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                    placeholder="e.g. Low sodium, diabetic meal portions, pureed food preference..."
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY MEDICATION SCHEDULE TIMELINE & COMPLIANCE */}
          {activeTab === 'medications' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Compliance Overview Banner */}
              {(() => {
                const meds = currentBio.medications || [];
                const scheduledMeds = meds.filter(m => !m.timesOfDay?.includes('as_needed'));
                const takenCount = scheduledMeds.filter(m => m.takenToday).length;
                const totalScheduled = scheduledMeds.length;
                const compliancePct = totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 100;
                const allComplianceEntries = meds.flatMap(m => (m.complianceHistory || []).map(entry => ({
                  ...entry,
                  medName: m.name,
                  dosage: m.dosage
                }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-black/50 to-emerald-950/40 border border-emerald-500/30 shadow-xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white">Daily Medication Compliance</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400" />
                              <span>5-Day Streak</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            Today • {new Date().toLocaleDateString('en-JM', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                          compliancePct === 100
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : compliancePct > 0
                            ? 'bg-purple-500/20 text-purple-200 border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {compliancePct === 100 ? '🏆 100% Completed' : `${takenCount}/${totalScheduled} Doses Taken (${compliancePct}%)`}
                        </span>
                      </div>
                    </div>

                    {/* Adherence Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-[#7209B7] via-emerald-500 to-teal-400 transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${compliancePct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>Attending Nurse &amp; Family Sync: Active</span>
                        <span>{takenCount} of {totalScheduled} scheduled doses confirmed</span>
                      </div>
                    </div>

                    {/* View Switcher & Compliance Log Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setMedViewMode('timeline')}
                          className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                            medViewMode === 'timeline'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Daily Schedule Timeline</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMedViewMode('manage')}
                          className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                            medViewMode === 'manage'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <List className="w-3.5 h-3.5" />
                          <span>All Prescriptions ({meds.length})</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTrigger15MinMedAlert(meds[0])}
                          className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition flex items-center gap-1.5 text-[11px] shadow-sm"
                          title="Preview push audio alert before scheduled dose"
                        >
                          <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>🔔 Test 15-Min Push Audio Alert</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowComplianceLog(!showComplianceLog)}
                          className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold transition flex items-center gap-1.5 text-[11px]"
                        >
                          <History className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{showComplianceLog ? 'Hide History' : `Compliance Log (${allComplianceEntries.length})`}</span>
                        </button>
                      </div>
                    </div>

                    {/* SIMULATED PUSH NOTIFICATION 15-MIN WARNING BANNER */}
                    {simulatedAlertMed && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-purple-950/70 to-emerald-950/60 border-2 border-amber-400/70 shadow-2xl text-white space-y-3 animate-fadeIn">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                              <Bell className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  Push Simulation • 15 Minutes Warning
                                </span>
                                <span className="text-[10px] text-purple-200 font-mono">
                                  Scheduled {simulatedAlertMed.scheduledTime}
                                </span>
                              </div>
                              <h5 className="font-black text-sm text-white mt-0.5">
                                Medication Reminder: Take {simulatedAlertMed.name} in 15 Minutes
                              </h5>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSimulatedAlertMed(null)}
                            className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-white block">
                              💊 {simulatedAlertMed.name} {simulatedAlertMed.dosage && `(${simulatedAlertMed.dosage})`}
                            </span>
                            {simulatedAlertMed.instructions && (
                              <span className="text-[11px] text-slate-300 mt-0.5 block">
                                {simulatedAlertMed.instructions}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => soundFX.playMedicationPushAlert()}
                              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-purple-300 font-bold text-[11px] transition flex items-center gap-1"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Replay Chime
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleToggleDoseTaken(simulatedAlertMed.id);
                                setSimulatedAlertMed(null);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow-sm transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Dose Taken
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expandable Compliance Audit Record */}
                    {showComplianceLog && (
                      <div className="p-3 rounded-xl bg-black/50 border border-white/15 space-y-2 text-xs animate-fadeIn">
                        <h5 className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Recorded Dose Compliance Audit Trail</span>
                        </h5>
                        {allComplianceEntries.length > 0 ? (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {allComplianceEntries.map((entry, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px]"
                              >
                                <div>
                                  <span className="font-bold text-white">{entry.medName}</span>
                                  <span className="text-slate-400 ml-1.5">({entry.dosage})</span>
                                  <p className="text-[10px] text-slate-400">{entry.notes || 'Dose recorded'}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-emerald-300 font-mono font-bold block">
                                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="text-[9px] text-slate-400">By {entry.loggedBy || 'Family'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 py-1 text-center">
                            No dose logs recorded yet today. Mark doses below to record compliance.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* VIEW 1: VISUAL DAILY MEDICATION SCHEDULE TIMELINE */}
              {medViewMode === 'timeline' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Click <strong>"Mark as Taken"</strong> or <strong>👉 swipe card right</strong> to log compliance. Swipe left 👈 to undo or remove.
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                        ⚡ Quick Swipe Active
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                        Live Sync
                      </span>
                    </div>
                  </div>

                  {/* Timeline Sections */}
                  {(() => {
                    const meds = currentBio.medications || [];

                    const timeSlots: {
                      id: string;
                      label: string;
                      timeBadge: string;
                      icon: any;
                      iconColor: string;
                      borderColor: string;
                      filterFn: (m: PatientMedication) => boolean;
                    }[] = [
                      {
                        id: 'morning',
                        label: 'Morning Routine',
                        timeBadge: '08:00 AM • Awakening & Breakfast',
                        icon: Sunrise,
                        iconColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
                        borderColor: 'border-amber-500/30',
                        filterFn: (m) => m.timesOfDay?.includes('morning') || m.scheduledTime?.includes('08:00')
                      },
                      {
                        id: 'midday',
                        label: 'Midday / Lunch',
                        timeBadge: '01:00 PM • Midday Meal & Hydration',
                        icon: Sun,
                        iconColor: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
                        borderColor: 'border-yellow-500/30',
                        filterFn: (m) => m.timesOfDay?.includes('midday') || m.scheduledTime?.includes('01:00') || m.scheduledTime?.includes('13:00')
                      },
                      {
                        id: 'evening',
                        label: 'Evening Dinner',
                        timeBadge: '06:00 PM • Dinner & Vitals Monitoring',
                        icon: Sunset,
                        iconColor: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
                        borderColor: 'border-orange-500/30',
                        filterFn: (m) => m.timesOfDay?.includes('evening') || m.scheduledTime?.includes('06:00') || m.scheduledTime?.includes('18:00')
                      },
                      {
                        id: 'bedtime',
                        label: 'Night / Bedtime',
                        timeBadge: '09:00 PM • Pre-Sleep & Overnight Protection',
                        icon: Moon,
                        iconColor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
                        borderColor: 'border-indigo-500/30',
                        filterFn: (m) => m.timesOfDay?.includes('bedtime') || m.scheduledTime?.includes('09:00') || m.scheduledTime?.includes('21:00')
                      },
                      {
                        id: 'as_needed',
                        label: 'As Needed (PRN)',
                        timeBadge: 'Symptomatic Relief • Joint Pain / Headache',
                        icon: Pill,
                        iconColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
                        borderColor: 'border-emerald-500/30',
                        filterFn: (m) => m.timesOfDay?.includes('as_needed') || m.scheduledTime?.toLowerCase().includes('needed') || m.scheduledTime?.toLowerCase().includes('prn')
                      }
                    ];

                    return (
                      <div className="space-y-4 relative pl-4 sm:pl-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-emerald-400 before:to-indigo-500">
                        {timeSlots.map((slot) => {
                          const slotMeds = meds.filter(slot.filterFn);
                          const IconComp = slot.icon;

                          return (
                            <div key={slot.id} className="relative space-y-2">
                              {/* Slot Node on the timeline */}
                              <div className="flex items-center gap-2.5">
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center -ml-[23px] sm:-ml-[27px] bg-[#12041e] shadow-md z-10 ${slot.iconColor}`}>
                                  <IconComp className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-black text-white">{slot.label}</span>
                                  <span className="text-[11px] font-mono text-purple-300 font-semibold">
                                    {slot.timeBadge}
                                  </span>
                                </div>
                              </div>

                              {/* Slot Medications with Quick Action Swipe Support */}
                              {slotMeds.length > 0 ? (
                                <div className="space-y-2.5">
                                  {slotMeds.map((med) => (
                                    <SwipeableMedCard
                                      key={med.id}
                                      med={med}
                                      viewerRole={viewerRole}
                                      isAnimating={animatingMedId === med.id}
                                      onToggleTaken={handleToggleDoseTaken}
                                      onRemove={handleRemoveMedication}
                                      mode="timeline"
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                                  <span>No prescription doses currently scheduled for this window.</span>
                                  {viewerRole === 'client' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewMedTime(slot.timeBadge.split(' • ')[0]);
                                        setNewMedTimesOfDay([slot.id as any]);
                                      }}
                                      className="text-purple-300 hover:text-white font-bold flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Schedule Dose</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* VIEW 2: ALL PRESCRIPTIONS DIRECTORY VIEW */}
              {medViewMode === 'manage' && (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/15 text-[11px] text-purple-300 flex items-center justify-between gap-2">
                    <span>↔ Swipe prescription right to mark taken, or swipe left to remove/undo</span>
                    <span className="font-bold text-emerald-400">Total: {currentBio.medications?.length || 0}</span>
                  </div>

                  {(currentBio?.medications?.length || 0) > 0 ? (
                    (currentBio.medications || []).map((med, idx) => (
                      <SwipeableMedCard
                        key={med.id || idx}
                        med={med}
                        viewerRole={viewerRole}
                        isAnimating={animatingMedId === med.id}
                        onToggleTaken={handleToggleDoseTaken}
                        onRemove={handleRemoveMedication}
                        mode="directory"
                      />
                    ))
                  ) : (
                    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-400 space-y-2">
                      <Pill className="w-8 h-8 text-purple-400/50 mx-auto" />
                      <p>No prescription medications added yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* DAILY MEDICATION REMINDERS SECTION (Directly stored in User Account) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-purple-500/30 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-[#7209B7] to-[#E63946] text-white">
                        <Bell className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-white">Add Daily Medication Reminder</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Auto-Saves to Account
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Schedule daily reminders with dosage, frequency, and time. Designed for maximum ease with voice read-aloud.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSpeakAllReminders}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
                      speakingReminderId === 'all'
                        ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                        : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border-purple-500/40'
                    }`}
                    title="Read all scheduled medication reminders aloud"
                  >
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span>{speakingReminderId === 'all' ? 'Speaking Reminders...' : '🔊 Read Reminders Aloud'}</span>
                  </button>
                </div>

                {/* 1-Tap Quick Fill Jamaican Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>💡 1-Tap Quick Setup:</span>
                      <span className="text-slate-300 font-normal hidden sm:inline">Tap any common medicine below to auto-fill dosage &amp; frequency:</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {JAMAICAN_MED_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-2 rounded-xl text-left border transition flex flex-col justify-between text-xs ${
                          remName === preset.name
                            ? 'bg-purple-600/40 border-purple-400 text-white shadow-md'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-base">{preset.iconChar}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                            {preset.badge}
                          </span>
                        </div>
                        <span className="font-bold text-[11px] leading-snug line-clamp-1">{preset.name}</span>
                        <span className="text-[10px] text-emerald-300 mt-0.5">{preset.dosage}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Fields with Suggestive Pickers */}
                {viewerRole === 'client' && (
                  <div className="space-y-3 pt-2">
                    {/* Row 1: Name & Custom Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                          <span>1. Medication Name &amp; Strength</span>
                          <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={remName}
                          onChange={(e) => setRemName(e.target.value)}
                          placeholder="e.g. Amlodipine 5mg, Metformin 500mg, Panadol..."
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">
                          <span>Clinical Purpose</span>
                        </label>
                        <input
                          type="text"
                          value={remPurpose}
                          onChange={(e) => setRemPurpose(e.target.value)}
                          placeholder="e.g. Blood pressure, Sugar..."
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>

                    {/* Row 2: Dosage (With 1-Tap Chips) */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <span>2. Dosage (How much to take):</span>
                        <span className="text-emerald-300 font-mono text-[11px] font-bold">{remDosage}</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          '💊 1 Tablet',
                          '💊💊 2 Tablets',
                          '½ Tablet',
                          '🥄 1 Spoon (5ml)',
                          '💨 2 Puffs',
                          '💉 1 Injection'
                        ].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setRemDosage(d)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                              remDosage === d
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                        <input
                          type="text"
                          value={remDosage}
                          onChange={(e) => setRemDosage(e.target.value)}
                          placeholder="Or type custom dose..."
                          className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs w-36 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 3: Frequency (How Often) */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <span>3. Frequency (How often to take):</span>
                        <span className="text-purple-300 font-mono text-[11px] font-bold">{remFrequency}</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { label: '🌅 Once daily (Morning)', times: ['morning'] },
                          { label: '🌅🌙 Twice daily (Morning & Night)', times: ['morning', 'evening'] },
                          { label: '🌅☀️🌙 3 times daily (Meals)', times: ['morning', 'midday', 'evening'] },
                          { label: '🌙 Bedtime only (Night)', times: ['bedtime'] },
                          { label: '⚡ When in pain (As needed)', times: ['as_needed'] }
                        ].map((f) => (
                          <button
                            key={f.label}
                            type="button"
                            onClick={() => {
                              setRemFrequency(f.label);
                              setRemTimesOfDay(f.times as any);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                              remFrequency === f.label
                                ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Row 4: Scheduled Time & Instructions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                          <span>4. Reminder Time:</span>
                          <span className="text-amber-300 font-mono text-[11px] font-bold">{remTime}</span>
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: '🌅 08:00 AM Breakfast', val: '08:00 AM' },
                            { label: '☀️ 01:00 PM Lunch', val: '01:00 PM' },
                            { label: '🌇 06:00 PM Dinner', val: '06:00 PM' },
                            { label: '🌙 09:00 PM Bedtime', val: '09:00 PM' }
                          ].map((t) => (
                            <button
                              key={t.val}
                              type="button"
                              onClick={() => setRemTime(t.val)}
                              className={`px-2 py-1.5 rounded-xl text-xs font-bold border transition text-left ${
                                remTime === t.val
                                  ? 'bg-amber-600/50 text-white border-amber-400'
                                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300">
                          <span>5. How to Take (Instructions):</span>
                        </label>
                        <div className="flex flex-wrap items-center gap-1 mb-1">
                          {[
                            '🥪 Take after food',
                            '💧 Full glass of water',
                            '🚫 Empty stomach',
                            '🥛 With milk'
                          ].map((inst) => (
                            <button
                              key={inst}
                              type="button"
                              onClick={() => setRemInstructions(inst)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                                remInstructions === inst
                                  ? 'bg-teal-600 text-white border-teal-400'
                                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              {inst}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={remInstructions}
                          onChange={(e) => setRemInstructions(e.target.value)}
                          placeholder="e.g. Swallow with water after breakfast"
                          className="w-full p-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Add Reminder CTA */}
                    <button
                      type="button"
                      onClick={handleAddDailyReminder}
                      disabled={!remName.trim()}
                      className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-2 ${
                        remName.trim()
                          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-[#7209B7] hover:opacity-95 text-white shadow-emerald-900/40 cursor-pointer'
                          : 'bg-white/10 text-slate-500 border border-white/10 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save Daily Medication Reminder (Automatically Synced)</span>
                    </button>
                  </div>
                )}

                {/* CURRENT ACTIVE REMINDERS DIRECTORY */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <CalendarCheck className="w-4 h-4 text-emerald-400" />
                      <span>My Active Medication Reminders ({medicationReminders.length})</span>
                    </h5>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {medicationReminders.filter(r => r.takenToday).length} of {medicationReminders.length} taken today
                    </span>
                  </div>

                  {medicationReminders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {medicationReminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                            reminder.takenToday
                              ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-100 shadow-md'
                              : 'bg-white/[0.04] border-white/15 hover:border-purple-400/50 text-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-base">💊</span>
                                <h6 className="font-black text-sm text-white">{reminder.medicationName}</h6>
                              </div>
                              {reminder.purpose && (
                                <p className="text-[11px] text-purple-300 font-medium mt-0.5">
                                  For {reminder.purpose}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSpeakReminder(reminder)}
                                className={`p-1.5 rounded-xl border transition ${
                                  speakingReminderId === reminder.id
                                    ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                                    : 'bg-white/10 hover:bg-white/20 text-purple-300 border-white/10'
                                }`}
                                title="Listen to reminder instructions"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              {viewerRole === 'client' && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveReminder(reminder.id)}
                                  className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition"
                                  title="Remove medication reminder"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Badges: Dosage, Frequency, Time */}
                          <div className="flex flex-wrap items-center gap-1.5 my-2.5">
                            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1">
                              <span>Dose:</span>
                              <strong className="text-white">{reminder.dosage}</strong>
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{reminder.time}</span>
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-200 border border-teal-500/30 text-[11px] font-bold">
                              {reminder.frequency}
                            </span>
                          </div>

                          {reminder.instructions && (
                            <p className="text-[11px] text-slate-300 bg-black/30 p-2 rounded-xl border border-white/10 mb-3">
                              👉 {reminder.instructions}
                            </p>
                          )}

                          {/* 1-Tap Mark Dose Taken Action */}
                          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                            <div className="text-[11px]">
                              {reminder.takenToday ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Taken at {reminder.takenAt || reminder.time}</span>
                                </span>
                              ) : (
                                <span className="text-amber-300 font-bold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                                  <span>Pending Dose</span>
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleToggleReminderTaken(reminder.id, e)}
                              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition shadow-sm flex items-center gap-1.5 ${
                                reminder.takenToday
                                  ? 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/20'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
                              }`}
                            >
                              {reminder.takenToday ? (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Undo</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>✓ I Took This Medicine</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-300 space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto">
                        <Pill className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-white">No medication reminders set yet</p>
                      <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
                        Tap any of the 1-Tap Quick Setup presets above to easily add your first daily reminder!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRUSTED FAMILY GUARDIAN (LIVE EDITABLE) */}
          {activeTab === 'family' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  The verified trusted family guardian is authorized to receive clinical visit vitals reports, coordinate emergency escalations, and manage visits.
                </span>
              </div>

              {currentBio.trustedFamilyMember && (
                <div className="p-5 rounded-3xl bg-white/[0.04] border border-purple-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={currentBio.trustedFamilyMember.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'}
                      alt={currentBio.trustedFamilyMember.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg shrink-0"
                    />
                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        Primary Family Medical Guardian
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold">Guardian Full Name</label>
                          <input
                            type="text"
                            value={currentBio.trustedFamilyMember.name}
                            onChange={(e) => handleUpdateFamilyMember('name', e.target.value)}
                            className="w-full p-2 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold">Relationship to Patient</label>
                          <select
                            value={currentBio.trustedFamilyMember.relation}
                            onChange={(e) => handleUpdateFamilyMember('relation', e.target.value)}
                            className="w-full p-2 rounded-xl bg-[#1b072c] border border-white/15 text-white font-bold text-xs focus:outline-none"
                          >
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Spouse / Partner">Spouse / Partner</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Grandchild">Grandchild</option>
                            <option value="Legal Guardian">Legal Guardian</option>
                            <option value="Power of Attorney">Power of Attorney</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-bold mb-1">Phone Number (+1 876)</label>
                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/40 border border-white/10">
                        <Phone className="w-4 h-4 text-[#E63946] shrink-0 ml-1" />
                        <input
                          type="tel"
                          value={currentBio.trustedFamilyMember.phone}
                          onChange={(e) => handleUpdateFamilyMember('phone', e.target.value)}
                          className="w-full bg-transparent text-white font-bold text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block font-bold mb-1">Email Address</label>
                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/40 border border-white/10">
                        <Mail className="w-4 h-4 text-purple-400 shrink-0 ml-1" />
                        <input
                          type="email"
                          value={currentBio.trustedFamilyMember.email || ''}
                          onChange={(e) => handleUpdateFamilyMember('email', e.target.value)}
                          className="w-full bg-transparent text-white font-bold text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block font-bold mb-1">Guardian Clinical Notes &amp; Permissions</label>
                    <textarea
                      rows={2}
                      value={currentBio.trustedFamilyMember.notes || ''}
                      onChange={(e) => handleUpdateFamilyMember('notes', e.target.value)}
                      placeholder="e.g. Authorized to receive vital reports and manage shift payments..."
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  {/* WhatsApp Cloud API Remote Care Opt-In */}
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="family-whatsapp-optin-profile"
                      checked={currentBio.trustedFamilyMember.whatsAppUpdatesOptIn ?? true}
                      onChange={(e) => handleUpdateFamilyMember('whatsAppUpdatesOptIn', e.target.checked)}
                      className="mt-0.5 rounded border-emerald-500/50 text-emerald-500 focus:ring-emerald-400 bg-black/40 accent-emerald-500"
                    />
                    <div className="text-xs space-y-0.5">
                      <label htmlFor="family-whatsapp-optin-profile" className="font-bold text-emerald-200 cursor-pointer flex items-center gap-1.5 flex-wrap">
                        <span>Send updates on WhatsApp? {currentBio.trustedFamilyMember.phone || '876-XXX-XXXX'}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Meta Opt-In</span>
                      </label>
                      <p className="text-[11px] text-slate-300">
                        Receive Start/End codes via WhatsApp to start visits remotely and release payments. Works without app access.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SHARE CARE SUMMARY */}
          {activeTab === 'share' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-3">
                <Share2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-black text-white text-sm">Encrypted Patient Care Summary</h4>
                  <p className="text-slate-300">
                    Share this verified health summary with other family members, attending physicians at KPH/UHWI, or private specialists in Jamaica.
                  </p>
                </div>
              </div>

              {/* Direct Link Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Secure Patient Health Summary URL
                </label>
                <div className="p-3 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-between gap-3">
                  <span className="truncate text-xs font-mono text-purple-200">{shareableProfileUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      copiedLink ? 'bg-emerald-500 text-white' : 'bg-[#7209B7] hover:bg-purple-600 text-white'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* 1-Click WhatsApp Share */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-3 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-black transition flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share Patient Profile via WhatsApp</span>
              </button>
            </div>
          )}

          {/* TAB 5: SYNC HEALTH MONITORING DEVICES & LIVE VITALS STREAM */}
          {activeTab === 'devices' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-blue-950/50 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">Generic Health Monitoring Device Telemetry</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Wirelessly pair generic Bluetooth/BLE monitors (Blood Pressure cuffs, Pulse Oximeters, Glucometers, Digital Thermometers) to stream data into this patient record.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSyncHealthDataModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-450 text-emerald-950 hover:text-black transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Launch Live Device Sync Stream</span>
                </button>
              </div>

              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Latest BP Reading</span>
                  <div className="text-base font-black text-red-400 font-mono">
                    {(currentBio.vitalsLog || []).find(v => v.deviceType === 'blood_pressure')?.formattedValue || '122/80 mmHg'}
                  </div>
                  <span className="text-[10px] text-slate-400">Bluetooth Digital Cuff</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                  <div className="text-base font-black text-pink-400 font-mono">
                    {(currentBio.vitalsLog || []).find(v => v.metrics?.heartRate !== undefined)
                      ? `${(currentBio.vitalsLog || []).find(v => v.metrics?.heartRate !== undefined)?.metrics.heartRate} bpm`
                      : '74 bpm'}
                  </div>
                  <span className="text-[10px] text-slate-400">Optical Pulse Sensor</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Oxygen Sat (SpO2)</span>
                  <div className="text-base font-black text-cyan-400 font-mono">
                    {(currentBio.vitalsLog || []).find(v => v.deviceType === 'pulse_oximeter')?.formattedValue || '98%'}
                  </div>
                  <span className="text-[10px] text-slate-400">Fingertip Pulse Oximeter</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Glucose</span>
                  <div className="text-base font-black text-amber-400 font-mono">
                    {(currentBio.vitalsLog || []).find(v => v.deviceType === 'glucometer')?.formattedValue || '5.8 mmol/L'}
                  </div>
                  <span className="text-[10px] text-slate-400">Smart Glucose Meter</span>
                </div>
              </div>

              {/* Telemetry Log History */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recent Streamed Clinical Readings ({(currentBio.vitalsLog || []).length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsSyncHealthDataModalOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Connect Device Stream
                  </button>
                </div>

                {(!currentBio?.vitalsLog || (currentBio.vitalsLog || []).length === 0) ? (
                  <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                    <Activity className="w-8 h-8 text-slate-500 mx-auto" />
                    <p>No device readings recorded yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsSyncHealthDataModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/50 transition"
                    >
                      Sync Now
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 max-h-56 overflow-y-auto pr-1">
                    {(currentBio?.vitalsLog || []).slice(0, 10).map((log) => (
                      <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block capitalize">{String(log?.deviceType || 'device').replace('_', ' ')}: <strong className="text-emerald-400 font-mono">{log.formattedValue}</strong></span>
                          <span className="text-[10px] text-slate-400">{log.deviceName} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'normal' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {log.status === 'normal' ? 'Normal' : 'Attention'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Auto-Save Badge & Close */}
        <div className="relative z-10 p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-medium">All changes auto-save in real-time</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] text-white font-bold text-xs hover:opacity-95 transition shadow-md shadow-purple-900/30"
          >
            Done
          </button>
        </div>
      </div>

      {/* Embedded Generic Health Device Telemetry Stream Modal */}
      <SyncHealthDataModal
        isOpen={isSyncHealthDataModalOpen}
        onClose={() => setIsSyncHealthDataModalOpen(false)}
        currentUser={user}
        onUpdateUser={onUpdateUser}
      />
    </div>
  );
};
